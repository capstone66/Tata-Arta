from __future__ import annotations

import re
from difflib import SequenceMatcher
from functools import lru_cache
from typing import Any

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from src.config import MODEL_PATHS
from src.custom_layers import ResidualDenseBlock  # noqa: F401
from src.data_loader import load_products_featured, load_transactions
from src.feature_engineering import build_ai_table
from src.preprocessing import to_dense_float32


FAST_MOVING_LABELS = {
    0: "Slow Moving",
    1: "Normal",
    2: "Fast Moving",
}

LOW_STOCK_LABELS = {
    0: "Stock Safe",
    1: "Restock Priority",
}

PLACEHOLDER_VALUES = {
    "",
    "string",
    "null",
    "none",
    "undefined",
    "nan",
    "-",
}


class ProductNotFoundError(ValueError):
    pass


@lru_cache(maxsize=1)
def get_ai_table() -> pd.DataFrame:
    products = load_products_featured()
    transactions = load_transactions()

    result = build_ai_table(products, transactions)

    if hasattr(result, "data"):
        table = result.data
    else:
        table = result

    if not isinstance(table, pd.DataFrame):
        raise RuntimeError("build_ai_table harus mengembalikan DataFrame atau object dengan atribut .data")

    table = table.copy()

    if "kode_barang" in table.columns:
        table["kode_barang"] = table["kode_barang"].astype(str).str.strip()

    if "nama" in table.columns:
        table["nama"] = table["nama"].astype(str).str.strip()

    return table


@lru_cache(maxsize=1)
def get_ai_table_with_name_index() -> pd.DataFrame:
    table = get_ai_table().copy()

    if "nama" not in table.columns:
        table["_nama_norm"] = ""
    else:
        table["_nama_norm"] = table["nama"].map(_normalize_text)

    return table


def _is_placeholder(value: Any) -> bool:
    if value is None:
        return True

    if isinstance(value, str):
        return value.strip().lower() in PLACEHOLDER_VALUES

    return False


def _normalize_text(value: Any) -> str:
    if _is_placeholder(value):
        return ""

    text = str(value).lower().strip()
    text = re.sub(r"[^a-z0-9\s]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def _clean_payload(payload: dict[str, Any]) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}

    for key, value in payload.items():
        if _is_placeholder(value):
            continue

        cleaned[key] = value

    return cleaned


def _payload_product_name(payload: dict[str, Any]) -> str:
    value = (
        payload.get("nama_barang")
        or payload.get("nama_produk")
        or payload.get("nama")
        or ""
    )

    if _is_placeholder(value):
        return ""

    return str(value).strip()


def _to_float_or_none(value: Any) -> float | None:
    if _is_placeholder(value):
        return None

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

            # Format Indonesia: 1.500.000,50
            if "," in text and "." in text:
                text = text.replace(".", "").replace(",", ".")
            elif "," in text and "." not in text:
                text = text.replace(",", ".")
            elif text.count(".") > 1:
                text = text.replace(".", "")

            value = text

        return float(value)

    except (TypeError, ValueError):
        return None


def _safe_set_value(row: pd.DataFrame, table: pd.DataFrame, key: str, value: Any) -> None:
    if _is_placeholder(value):
        return

    idx = row.index[0]

    # Kalau kolom ada di AI table dan kolom itu numeric, pastikan value jadi float.
    if key in table.columns and pd.api.types.is_numeric_dtype(table[key]):
        numeric_value = _to_float_or_none(value)

        if numeric_value is None:
            return

        row.loc[idx, key] = numeric_value
        return

    row.loc[idx, key] = value


def _pick_best_duplicate(rows: pd.DataFrame) -> pd.DataFrame:
    rows = rows.copy()

    if "trx_total_qty" in rows.columns:
        rows = rows.sort_values("trx_total_qty", ascending=False)
    elif "total_sales" in rows.columns:
        rows = rows.sort_values("total_sales", ascending=False)

    drop_cols = [col for col in ["_nama_norm", "_score"] if col in rows.columns]

    return rows.iloc[[0]].drop(columns=drop_cols)


def _find_by_kode_barang(table: pd.DataFrame, kode_barang: str) -> tuple[pd.DataFrame | None, dict[str, Any]]:
    if _is_placeholder(kode_barang) or "kode_barang" not in table.columns:
        return None, {}

    kode_barang = str(kode_barang).strip()
    matches = table[table["kode_barang"].astype(str).str.strip() == kode_barang]

    if matches.empty:
        return None, {
            "match_type": "kode_barang_not_found",
            "query": kode_barang,
            "matched_score": 0.0,
        }

    row = matches.iloc[[0]].copy()

    return row, {
        "match_type": "kode_barang_exact",
        "query": kode_barang,
        "matched_score": 1.0,
    }


def _find_by_name(product_name: str) -> tuple[pd.DataFrame | None, dict[str, Any]]:
    table = get_ai_table_with_name_index()

    query = str(product_name or "").strip()
    query_norm = _normalize_text(query)

    if not query_norm:
        return None, {}

    if "nama" not in table.columns:
        return None, {
            "match_type": "name_column_not_found",
            "query": query,
            "matched_score": 0.0,
        }

    exact = table[table["_nama_norm"] == query_norm]
    if not exact.empty:
        return _pick_best_duplicate(exact), {
            "match_type": "name_exact",
            "query": query,
            "matched_score": 1.0,
        }

    contains = table[table["_nama_norm"].str.contains(re.escape(query_norm), na=False)]
    if not contains.empty:
        contains = contains.copy()
        contains["_score"] = contains["_nama_norm"].map(
            lambda name: SequenceMatcher(None, query_norm, name).ratio()
        )
        contains = contains.sort_values("_score", ascending=False)

        return _pick_best_duplicate(contains), {
            "match_type": "name_contains",
            "query": query,
            "matched_score": float(contains.iloc[0]["_score"]),
        }

    table = table.copy()
    table["_score"] = table["_nama_norm"].map(
        lambda name: SequenceMatcher(None, query_norm, name).ratio()
    )

    best = table.sort_values("_score", ascending=False).head(1)

    if best.empty:
        return None, {
            "match_type": "name_not_found",
            "query": query,
            "matched_score": 0.0,
        }

    score = float(best.iloc[0]["_score"])

    if score < 0.72:
        return None, {
            "match_type": "name_not_found",
            "query": query,
            "matched_score": score,
        }

    return _pick_best_duplicate(best), {
        "match_type": "name_fuzzy",
        "query": query,
        "matched_score": score,
    }


def _has_enough_manual_features(payload: dict[str, Any]) -> bool:
    """
    Ini bagian penting.

    Kalau produk tidak ada di dataset DS, tapi backend FS mengirim fitur lengkap,
    model tetap bisa prediksi langsung dari payload FS.
    """
    manual_keys = {
        "kategori",
        "sub_kategori",
        "supplier",
        "hpp",
        "harga_toko_1",
        "harga_jual",
        "stok_min",
        "stok_max",
        "total_stock",
        "stock",
        "toko",
        "gudang",
        "trx_total_qty",
        "trx_qty_30d",
        "trx_qty_60d",
        "trx_qty_90d",
        "trx_count",
        "trx_total_revenue",
        "trx_total_profit",
        "profit_percent",
        "estimated_profit_percent",
    }

    filled = [
        key
        for key in manual_keys
        if key in payload and not _is_placeholder(payload.get(key))
    ]

    # Minimal 5 fitur agar tidak salah pakai nama saja.
    return len(filled) >= 5


def _manual_row_from_payload(payload: dict[str, Any]) -> tuple[pd.DataFrame, dict[str, Any]]:
    """
    Membuat row langsung dari payload FS.
    Ini dipakai untuk produk baru/data real dari database FS.
    """
    row = pd.DataFrame([{}])
    idx = row.index[0]

    for key, value in payload.items():
        if not _is_placeholder(value):
            row.loc[idx, key] = value

    product_name = _payload_product_name(payload)

    if product_name:
        row.loc[idx, "nama"] = product_name
        row.loc[idx, "nama_barang"] = product_name

    if payload.get("kode_barang") and not _is_placeholder(payload.get("kode_barang")):
        row.loc[idx, "kode_barang"] = str(payload.get("kode_barang")).strip()
    else:
        row.loc[idx, "kode_barang"] = "MANUAL_INPUT"

    return row, {
        "match_type": "manual_features",
        "query": product_name or payload.get("kode_barang") or "manual_payload",
        "matched_score": None,
    }


def _find_product_row(payload: dict[str, Any]) -> tuple[pd.DataFrame, dict[str, Any]]:
    payload = _clean_payload(payload)
    table = get_ai_table()

    kode_barang = str(payload.get("kode_barang") or "").strip()
    product_name = _payload_product_name(payload)

    # 1. Kalau kode_barang ada dan valid di dataset, pakai row dataset,
    #    tapi nanti field dari payload FS tetap override di _row_from_payload().
    if kode_barang:
        row, meta = _find_by_kode_barang(table, kode_barang)

        if row is not None:
            return row.copy(), meta

        # Kalau kode tidak ketemu tapi fitur lengkap ada, berarti produk real dari FS.
        if _has_enough_manual_features(payload):
            return _manual_row_from_payload(payload)

        if not product_name:
            raise ProductNotFoundError(
                f"kode_barang '{kode_barang}' tidak ditemukan. "
                "Kirim nama_barang yang valid atau kirim fitur lengkap produk dari database FS."
            )

    # 2. Kalau FS mengirim fitur lengkap tanpa kode, prioritaskan manual_features.
    #    Ini supaya produk baru tidak dipaksa cocok ke dataset DS.
    if _has_enough_manual_features(payload):
        return _manual_row_from_payload(payload)

    # 3. Kalau cuma kirim nama, baru lookup ke dataset DS.
    if product_name:
        row, meta = _find_by_name(product_name)

        if row is not None:
            return row.copy(), meta

        raise ProductNotFoundError(
            f"nama_barang '{product_name}' tidak ditemukan di dataset AI. "
            "Untuk produk baru, backend FS harus mengirim fitur lengkap produk."
        )

    raise ProductNotFoundError(
        "Produk tidak ditemukan. Kirim salah satu: kode_barang, nama_barang, "
        "atau fitur lengkap produk dari database FS."
    )


def _build_matched_product(row: pd.DataFrame, meta: dict[str, Any]) -> dict[str, Any]:
    item = row.iloc[0]

    nama = (
        item.get("nama")
        or item.get("nama_barang")
        or item.get("nama_produk")
        or ""
    )

    return {
        "match_type": meta.get("match_type"),
        "query": meta.get("query"),
        "matched_score": meta.get("matched_score"),
        "kode_barang": str(item.get("kode_barang", "")),
        "nama": str(nama),
        "kategori": str(item.get("kategori", "")),
        "sub_kategori": str(item.get("sub_kategori", "")),
        "supplier": str(item.get("supplier", "")),
    }


def _row_from_payload(payload: dict[str, Any]) -> tuple[pd.DataFrame, dict[str, Any]]:
    payload = _clean_payload(payload)
    table = get_ai_table()

    row, meta = _find_product_row(payload)
    row = row.copy()

    # Override semua field valid dari FS.
    # Ini membuat model benar-benar memakai data yang dikirim backend FS.
    for key, value in payload.items():
        _safe_set_value(row, table, key, value)

    # Lengkapi kolom table agar preprocessor tidak error.
    for col in table.columns:
        if col not in row.columns:
            if pd.api.types.is_numeric_dtype(table[col]):
                row[col] = table[col].median()
            else:
                row[col] = "Unknown"

    matched_product = _build_matched_product(row, meta)

    return row, matched_product


def _load_bundle(model_path, preprocessor_path):
    if not model_path.exists() or not preprocessor_path.exists():
        raise RuntimeError(
            f"Model belum tersedia: {model_path.name}. "
            "Pastikan file .keras dan .joblib ada di folder models/."
        )

    model = tf.keras.models.load_model(model_path, compile=False)
    bundle = joblib.load(preprocessor_path)

    if not isinstance(bundle, dict):
        raise RuntimeError(f"Preprocessor {preprocessor_path.name} harus berupa dictionary.")

    if "preprocessor" not in bundle or "feature_columns" not in bundle:
        raise RuntimeError(
            f"Preprocessor {preprocessor_path.name} harus memiliki key 'preprocessor' dan 'feature_columns'."
        )

    return model, bundle


@lru_cache(maxsize=1)
def load_fast_moving():
    return _load_bundle(MODEL_PATHS.fast_moving_model, MODEL_PATHS.fast_moving_preprocessor)


@lru_cache(maxsize=1)
def load_low_stock():
    return _load_bundle(MODEL_PATHS.low_stock_model, MODEL_PATHS.low_stock_preprocessor)


@lru_cache(maxsize=1)
def load_profit():
    return _load_bundle(MODEL_PATHS.profit_model, MODEL_PATHS.profit_preprocessor)


def _transform(payload: dict[str, Any], bundle: dict[str, Any]) -> tuple[np.ndarray, dict[str, Any]]:
    row, matched_product = _row_from_payload(payload)

    feature_columns = bundle["feature_columns"]

    for col in feature_columns:
        if col not in row.columns:
            row[col] = 0

    x = bundle["preprocessor"].transform(row[feature_columns])

    return to_dense_float32(x), matched_product


def predict_fast_moving(payload: dict[str, Any]) -> dict[str, Any]:
    model, bundle = load_fast_moving()
    x, matched_product = _transform(payload, bundle)

    probs = model.predict(x, verbose=0)[0]
    class_id = int(np.argmax(probs))

    return {
        "matched_product": matched_product,
        "class_id": class_id,
        "prediction": FAST_MOVING_LABELS[class_id],
        "confidence": float(np.max(probs)),
        "probabilities": {
            FAST_MOVING_LABELS[i]: float(probs[i])
            for i in range(len(probs))
        },
    }


def predict_low_stock(payload: dict[str, Any]) -> dict[str, Any]:
    model, bundle = load_low_stock()
    x, matched_product = _transform(payload, bundle)

    score = float(model.predict(x, verbose=0)[0][0])
    class_id = int(score >= 0.5)

    return {
        "matched_product": matched_product,
        "class_id": class_id,
        "prediction": LOW_STOCK_LABELS[class_id],
        "confidence": score if class_id == 1 else 1 - score,
        "restock_priority_score": score,
        "message": (
            "Produk perlu diprioritaskan untuk restock."
            if class_id == 1
            else "Stok relatif aman berdasarkan pola permintaan."
        ),
    }


def _profit_category_from_margin(margin: float) -> str:
    if margin >= 0.2:
        return "High Profit"

    if margin >= 0.08:
        return "Medium Profit"

    return "Low Profit"


def _business_profit_from_payload(payload: dict[str, Any]) -> dict[str, Any] | None:
    """
    Untuk data real dari FS, profit paling akurat dihitung dari HPP dan harga jual.
    Model profit dipakai sebagai fallback kalau data harga tidak lengkap.
    """
    hpp = _to_float_or_none(payload.get("hpp"))

    price = (
        _to_float_or_none(payload.get("harga_toko_1"))
        or _to_float_or_none(payload.get("harga_jual"))
        or _to_float_or_none(payload.get("harga_toko_2"))
        or _to_float_or_none(payload.get("harga_toko_3"))
    )

    if hpp is None or price is None:
        return None

    if price <= 0:
        return None

    gross_profit = price - hpp
    margin = gross_profit / price
    margin = max(0.0, min(1.0, margin))

    return {
        "source": "business_rule_from_fs_payload",
        "hpp": hpp,
        "selling_price": price,
        "gross_profit": gross_profit,
        "estimated_profit_ratio": margin,
        "estimated_profit_percent": margin * 100,
        "profit_category": _profit_category_from_margin(margin),
    }


def predict_profit(payload: dict[str, Any]) -> dict[str, Any]:
    model, bundle = load_profit()
    x, matched_product = _transform(payload, bundle)

    business_profit = _business_profit_from_payload(payload)

    if business_profit is not None:
        return {
            "matched_product": matched_product,
            **business_profit,
        }

    margin = float(model.predict(x, verbose=0)[0][0])
    margin = max(0.0, min(1.0, margin))

    return {
        "matched_product": matched_product,
        "source": "model_prediction",
        "estimated_profit_ratio": margin,
        "estimated_profit_percent": margin * 100,
        "profit_category": _profit_category_from_margin(margin),
    }


def predict_all(payload: dict[str, Any]) -> dict[str, Any]:
    fast_moving = predict_fast_moving(payload)
    low_stock = predict_low_stock(payload)
    profit = predict_profit(payload)

    matched_product = fast_moving.get("matched_product")

    return {
        "matched_product": matched_product,
        "fast_moving": {
            key: value
            for key, value in fast_moving.items()
            if key != "matched_product"
        },
        "low_stock": {
            key: value
            for key, value in low_stock.items()
            if key != "matched_product"
        },
        "profit": {
            key: value
            for key, value in profit.items()
            if key != "matched_product"
        },
    }


def search_products(query: str, limit: int = 10) -> dict[str, Any]:
    """
    GET /products/search
    Search dari data internal AI / dataset DS.
    Untuk search dari database FS real, gunakan POST /products/search jika patch realtime sudah dipasang.
    """
    table = get_ai_table_with_name_index()

    query = str(query or "").strip()
    query_norm = _normalize_text(query)
    limit = max(1, min(int(limit), 50))

    if not query_norm:
        return {
            "query": query,
            "count": 0,
            "items": [],
        }

    if "nama" not in table.columns:
        return {
            "query": query,
            "count": 0,
            "items": [],
        }

    exact = table[table["_nama_norm"] == query_norm].copy()
    contains = table[table["_nama_norm"].str.contains(re.escape(query_norm), na=False)].copy()

    if not exact.empty:
        candidates = exact
    elif not contains.empty:
        candidates = contains
    else:
        work = table.copy()
        work["_score"] = work["_nama_norm"].map(
            lambda name: SequenceMatcher(None, query_norm, name).ratio()
        )
        candidates = work[work["_score"] >= 0.45].copy()

    if candidates.empty:
        return {
            "query": query,
            "count": 0,
            "items": [],
        }

    if "_score" not in candidates.columns:
        candidates["_score"] = candidates["_nama_norm"].map(
            lambda name: SequenceMatcher(None, query_norm, name).ratio()
        )

    if "trx_total_qty" in candidates.columns:
        candidates = candidates.sort_values(
            by=["_score", "trx_total_qty"],
            ascending=[False, False],
        )
    else:
        candidates = candidates.sort_values("_score", ascending=False)

    columns = [
        "kode_barang",
        "nama",
        "kategori",
        "sub_kategori",
        "supplier",
        "hpp",
        "harga_toko_1",
        "trx_total_qty",
        "trx_count",
    ]

    available_columns = [col for col in columns if col in candidates.columns]

    items = []

    for _, row in candidates.head(limit).iterrows():
        item = {col: row.get(col) for col in available_columns}
        item["match_score"] = float(row.get("_score", 0.0))

        for key, value in list(item.items()):
            if pd.isna(value):
                item[key] = None
            elif isinstance(value, (np.integer, np.floating)):
                item[key] = float(value)

        items.append(item)

    return {
        "query": query,
        "count": len(items),
        "items": items,
    }


def model_availability() -> dict[str, bool]:
    return {
        "fast_moving": MODEL_PATHS.fast_moving_model.exists()
        and MODEL_PATHS.fast_moving_preprocessor.exists(),
        "low_stock": MODEL_PATHS.low_stock_model.exists()
        and MODEL_PATHS.low_stock_preprocessor.exists(),
        "profit": MODEL_PATHS.profit_model.exists()
        and MODEL_PATHS.profit_preprocessor.exists(),
    }