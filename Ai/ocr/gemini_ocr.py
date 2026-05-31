from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from google import genai
from google.genai import types

from src.config import GEMINI_API_KEY, GEMINI_OCR_MODEL


RECEIPT_OCR_PROMPT = """
Kamu adalah OCR parser untuk nota transaksi UMKM Indonesia.

Tugas:
Ekstrak isi nota/faktur/struk dari gambar, lalu balas hanya JSON valid tanpa markdown.

Skema JSON wajib:
{
  "merchant_name": string | null,
  "transaction_date": string | null,
  "items": [
    {
      "nama_produk": string,
      "qty": number,
      "harga": number,
      "total": number
    }
  ],
  "subtotal": number | null,
  "tax": number | null,
  "discount": number | null,
  "total_transaksi": number | null,
  "confidence": number,
  "raw_text": string
}

Aturan:
- Balas hanya JSON valid.
- Jangan gunakan markdown.
- Jangan bungkus JSON dengan ```json.
- Gunakan angka murni tanpa simbol Rp, titik ribuan, atau koma desimal.
- Jika qty tidak terlihat, isi 1.
- Jika harga tidak terlihat, isi 0.
- Jika total item tidak terlihat, hitung dari qty * harga.
- Jika item tidak terbaca, items boleh array kosong.
- confidence harus angka dari 0 sampai 1.
- Jangan membuat produk palsu jika teks tidak jelas.
- raw_text berisi teks mentah yang berhasil dibaca dari nota.
""".strip()


def _extract_json(text: str) -> dict[str, Any]:
    """
    Mengambil JSON dari response Gemini.

    Gemini kadang tetap membungkus response dengan markdown.
    Function ini mencoba parse langsung, lalu fallback mencari blok JSON.
    """

    text = (text or "").strip()

    if not text:
        raise ValueError("Gemini OCR mengembalikan response kosong.")

    # Hapus markdown fence jika ada.
    text = re.sub(r"^```(?:json)?", "", text.strip(), flags=re.IGNORECASE).strip()
    text = re.sub(r"```$", "", text.strip()).strip()

    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
        raise ValueError("Gemini OCR tidak mengembalikan JSON object.")
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", text, flags=re.DOTALL)

    if not match:
        raise ValueError("Gemini OCR tidak mengembalikan JSON yang valid.")

    parsed = json.loads(match.group(0))

    if not isinstance(parsed, dict):
        raise ValueError("Gemini OCR tidak mengembalikan JSON object.")

    return parsed


def _to_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default

    try:
        if isinstance(value, str):
            text = (
                value.replace("Rp", "")
                .replace("rp", "")
                .replace("IDR", "")
                .replace("idr", "")
                .replace(" ", "")
                .strip()
            )

            if text.lower() in {"", "null", "none", "nan", "undefined", "-", "string"}:
                return default

            # Format Indonesia:
            # 1.500.000,50 -> 1500000.50
            # 1,5 -> 1.5
            if "," in text and "." in text:
                text = text.replace(".", "").replace(",", ".")
            elif "," in text and "." not in text:
                text = text.replace(",", ".")
            elif text.count(".") > 1:
                text = text.replace(".", "")

            return float(text)

        return float(value)
    except (TypeError, ValueError):
        return default


def _nullable_float(value: Any) -> float | None:
    if value is None:
        return None

    if isinstance(value, str) and value.strip().lower() in {
        "",
        "null",
        "none",
        "nan",
        "undefined",
        "-",
        "string",
    }:
        return None

    return _to_float(value, default=0.0)


def _clamp_confidence(value: Any) -> float:
    confidence = _to_float(value, default=0.0)
    return max(0.0, min(1.0, confidence))


def _guess_mime_type_from_path(filename_or_path: str | None = None) -> str:
    suffix = Path(filename_or_path or "").suffix.lower()

    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"

    if suffix == ".png":
        return "image/png"

    if suffix == ".webp":
        return "image/webp"

    return "image/jpeg"


def _guess_mime_type_from_bytes(image_bytes: bytes) -> str:
    """
    Deteksi MIME type sederhana dari magic bytes.

    Ini penting karena api/main.py memanggil scan_receipt(content)
    tanpa mengirim mime_type.
    """

    if image_bytes.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"

    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"

    if image_bytes.startswith(b"RIFF") and b"WEBP" in image_bytes[:16]:
        return "image/webp"

    return "image/jpeg"


def normalize_receipt_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Menyamakan output OCR agar stabil untuk frontend/backend.

    Output utama:
    - merchant_name
    - transaction_date
    - items
    - subtotal
    - tax
    - discount
    - total_transaksi
    - confidence
    - raw_text
    """

    if not isinstance(payload, dict):
        raise ValueError("Payload OCR harus berupa JSON object.")

    raw_items = payload.get("items") or []

    if not isinstance(raw_items, list):
        raw_items = []

    normalized_items: list[dict[str, Any]] = []

    for item in raw_items:
        if not isinstance(item, dict):
            continue

        name = str(
            item.get("nama_produk")
            or item.get("nama_barang")
            or item.get("name")
            or item.get("product_name")
            or ""
        ).strip()

        if not name:
            continue

        qty = _to_float(item.get("qty"), default=1.0)
        harga = _to_float(
            item.get("harga")
            or item.get("price")
            or item.get("unit_price"),
            default=0.0,
        )
        total = _to_float(
            item.get("total")
            or item.get("subtotal")
            or item.get("line_total"),
            default=qty * harga,
        )

        normalized_items.append(
            {
                "nama_produk": name,
                "qty": qty,
                "harga": harga,
                "total": total,
            }
        )

    calculated_total = sum(_to_float(item.get("total")) for item in normalized_items)

    total_transaksi = _to_float(
        payload.get("total_transaksi")
        or payload.get("grand_total")
        or payload.get("total")
        or payload.get("total_amount"),
        default=calculated_total,
    )

    subtotal = _nullable_float(payload.get("subtotal"))
    tax = _nullable_float(payload.get("tax") or payload.get("pajak"))
    discount = _nullable_float(payload.get("discount") or payload.get("diskon"))

    return {
        "merchant_name": payload.get("merchant_name")
        or payload.get("merchant")
        or payload.get("store_name")
        or payload.get("nama_toko"),
        "transaction_date": payload.get("transaction_date")
        or payload.get("date")
        or payload.get("tanggal"),
        "items": normalized_items,
        "subtotal": subtotal,
        "tax": tax,
        "discount": discount,
        "total_transaksi": total_transaksi,
        "confidence": _clamp_confidence(payload.get("confidence")),
        "raw_text": str(payload.get("raw_text") or payload.get("text") or ""),
    }


class GeminiOCRService:
    def __init__(
        self,
        api_key: str | None = None,
        model_name: str | None = None,
    ) -> None:
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = model_name or GEMINI_OCR_MODEL

        if not self.api_key:
            raise RuntimeError(
                "GEMINI_API_KEY belum diset. "
                "Isi file .env terlebih dahulu."
            )

        self.client = genai.Client(api_key=self.api_key)

    def extract_receipt(
        self,
        image_bytes: bytes,
        mime_type: str | None = None,
    ) -> dict[str, Any]:
        if not image_bytes:
            raise ValueError("Gambar nota kosong.")

        mime_type = mime_type or _guess_mime_type_from_bytes(image_bytes)

        if not mime_type.startswith("image/"):
            raise ValueError(
                "File harus berupa gambar, contoh: image/jpeg, image/png, atau image/webp."
            )

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type,
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[image_part, RECEIPT_OCR_PROMPT],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        payload = _extract_json(response.text or "{}")

        return normalize_receipt_payload(payload)


def scan_receipt(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    """
    Function utama OCR yang dicari oleh api/main.py.

    api/main.py akan mencari function dengan nama:
    - scan_receipt
    - scan_receipt_with_gemini
    - extract_receipt
    - extract_receipt_with_gemini
    - parse_receipt_image
    - read_receipt

    Karena itu function ini wajib tersedia di level module.

    Bisa menerima:
    1. bytes gambar dari UploadFile
    2. path file gambar temporary
    """

    service = GeminiOCRService()

    if isinstance(image_input, bytes):
        detected_mime_type = mime_type or _guess_mime_type_from_bytes(image_input)

        return service.extract_receipt(
            image_bytes=image_input,
            mime_type=detected_mime_type,
        )

    if isinstance(image_input, (str, Path)):
        path = Path(image_input)

        if not path.exists():
            raise FileNotFoundError(f"File OCR tidak ditemukan: {path}")

        image_bytes = path.read_bytes()
        detected_mime_type = mime_type or _guess_mime_type_from_path(str(path))

        return service.extract_receipt(
            image_bytes=image_bytes,
            mime_type=detected_mime_type,
        )

    raise TypeError("image_input harus berupa bytes, str path, atau pathlib.Path.")


def scan_receipt_with_gemini(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    return scan_receipt(image_input, mime_type=mime_type)


def extract_receipt(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    return scan_receipt(image_input, mime_type=mime_type)


def extract_receipt_with_gemini(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    return scan_receipt(image_input, mime_type=mime_type)


def parse_receipt_image(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    return scan_receipt(image_input, mime_type=mime_type)


def read_receipt(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    return scan_receipt(image_input, mime_type=mime_type)


def gemini_ocr(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    return scan_receipt(image_input, mime_type=mime_type)


def ocr_receipt(
    image_input: bytes | str | Path,
    mime_type: str | None = None,
) -> dict[str, Any]:
    return scan_receipt(image_input, mime_type=mime_type)