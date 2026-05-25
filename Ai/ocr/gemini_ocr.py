from __future__ import annotations

import json
import re
from typing import Any

from google import genai
from google.genai import types

from src.config import GEMINI_API_KEY, GEMINI_OCR_MODEL

RECEIPT_OCR_PROMPT = """
Kamu adalah OCR parser untuk nota transaksi UMKM Indonesia.
Ekstrak isi nota dari gambar dan balas hanya JSON valid tanpa markdown.

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
- Gunakan angka murni tanpa simbol Rp, titik ribuan, atau koma desimal.
- Jika qty tidak terlihat, isi 1.
- Jika item tidak terbaca, items boleh array kosong.
- confidence dari 0 sampai 1.
- Jangan membuat produk palsu jika teks tidak jelas.
""".strip()


def _extract_json(text: str) -> dict[str, Any]:
    text = (text or "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise ValueError("Gemini OCR tidak mengembalikan JSON yang valid.")
        return json.loads(match.group(0))


class GeminiOCRService:
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.model_name = model_name or GEMINI_OCR_MODEL
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY belum diset. Isi file .env terlebih dahulu.")
        self.client = genai.Client(api_key=self.api_key)

    def extract_receipt(self, image_bytes: bytes, mime_type: str) -> dict[str, Any]:
        if not image_bytes:
            raise ValueError("Gambar nota kosong.")
        if not mime_type or not mime_type.startswith("image/"):
            raise ValueError("File harus gambar, contoh: image/jpeg atau image/png.")

        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[image_part, RECEIPT_OCR_PROMPT],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        payload = _extract_json(response.text or "{}")
        return normalize_receipt_payload(payload)


def normalize_receipt_payload(payload: dict[str, Any]) -> dict[str, Any]:
    items = payload.get("items") or []
    normalized_items = []

    for item in items:
        if not isinstance(item, dict):
            continue

        name = str(item.get("nama_produk") or item.get("name") or "").strip()
        if not name:
            continue

        qty = _to_float(item.get("qty"), default=1.0)
        harga = _to_float(item.get("harga"), default=0.0)
        total = _to_float(item.get("total"), default=qty * harga)

        normalized_items.append({
            "nama_produk": name,
            "qty": qty,
            "harga": harga,
            "total": total,
        })

    total_transaksi = _to_float(
        payload.get("total_transaksi"),
        default=sum(i["total"] for i in normalized_items),
    )

    return {
        "merchant_name": payload.get("merchant_name"),
        "transaction_date": payload.get("transaction_date"),
        "items": normalized_items,
        "subtotal": _nullable_float(payload.get("subtotal")),
        "tax": _nullable_float(payload.get("tax")),
        "discount": _nullable_float(payload.get("discount")),
        "total_transaksi": total_transaksi,
        "confidence": max(0.0, min(1.0, _to_float(payload.get("confidence"), default=0.0))),
        "raw_text": str(payload.get("raw_text") or ""),
    }


def _to_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    try:
        if isinstance(value, str):
            value = value.replace("Rp", "").replace("rp", "").replace(".", "").replace(",", ".").strip()
        return float(value)
    except (TypeError, ValueError):
        return default


def _nullable_float(value: Any) -> float | None:
    if value is None:
        return None
    return _to_float(value, default=0.0)
