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
    """
    Membersihkan payload dari Swagger/FS.
    Field bernilai placeholder seperti 'string' akan dibuang.
    """
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
            value = (
                value.replace("Rp", "")
                .replace("rp", "")
                .replace(".", "")
                .replace(",", ".")
                .strip()
            )
        return float(value)
    except (TypeError, ValueError):
        return None


def _safe_set_value(row: pd.DataFrame, table: pd.DataFrame, key: str, value: Any) -> None:
    """
    Override nilai dari payload ke row secara aman.
    Jika kolom numeric, value wajib bisa dikonversi ke float.
    Kalau tidak bisa, value diabaikan agar tidak error float64.
    """
    if _is_placeholder(value):
        return

    idx = row.index[0]

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


def _has_manual_features(payload: dict[str, Any]) -> bool:
    manual_keys = {
        "kategori",
        "sub_kategori",
        "supplier",
        "hpp",
        "harga_toko_1",
        "toko",
        "gudang",
        "stok_min",
        "stok_max",
        "trx_total_qty",
        "trx_qty_30d",
        "trx_qty_90d",
        "trx_count",
        "trx_total_revenue",
        "trx_total_profit",
    }

    return any(key in payload and not _is_placeholder(payload.get(key)) for key in manual_keys)


def _find_product_row(payload: dict[str, Any]) -> tuple[pd.DataFrame, dict[str, Any]]:
    payload = _clean_payload(payload)
    table = get_ai_table()

    kode_barang = str(payload.get("kode_barang") or "").strip()
    product_name = _payload_product_name(payload)

    if kode_barang:
        row, meta = _find_by_kode_barang(table, kode_barang)
        if row is not None:
            return row.copy(), meta

        if not product_name:
            raise ProductNotFoundError(
                f"kode_barang '{kode_barang}' tidak ditemukan. "
                "Kirim nama_barang yang valid atau gunakan kode_barang dari dataset."
            )

    if product_name:
        row, meta = _find_by_name(product_name)
        if row is not None:
            return row.copy(), meta

        raise ProductNotFoundError(
            f"nama_barang '{product_name}' tidak ditemukan. "
            "Pastikan nama barang berasal dari daftar produk."
        )

    if _has_manual_features(payload):
        return pd.DataFrame([{}]), {
            "match_type": "manual_features",
            "query": None,
            "matched_score": None,
        }

    raise ProductNotFoundError(
        "Produk tidak ditemukan. Kirim salah satu: kode_barang, nama_barang, nama_produk, atau nama."
    )


def _build_matched_product(row: pd.DataFrame, meta: dict[str, Any]) -> dict[str, Any]:
    item = row.iloc[0]

    return {
        "match_type": meta.get("match_type"),
        "query": meta.get("query"),
        "matched_score": meta.get("matched_score"),
        "kode_barang": str(item.get("kode_barang", "")),
        "nama": str(item.get("nama", "")),
        "kategori": str(item.get("kategori", "")),
        "sub_kategori": str(item.get("sub_kategori", "")),
        "supplier": str(item.get("supplier", "")),
    }


def _row_from_payload(payload: dict[str, Any]) -> tuple[pd.DataFrame, dict[str, Any]]:
    payload = _clean_payload(payload)
    table = get_ai_table()
    row, meta = _find_product_row(payload)

    row = row.copy()

    # Override hanya field valid. Placeholder seperti "string" otomatis diabaikan.
    for key, value in payload.items():
        _safe_set_value(row, table, key, value)

    # Lengkapi kolom yang tidak ada agar preprocessor tidak error.
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


def predict_profit(payload: dict[str, Any]) -> dict[str, Any]:
    model, bundle = load_profit()
    x, matched_product = _transform(payload, bundle)

    margin = float(model.predict(x, verbose=0)[0][0])
    margin = max(0.0, min(1.0, margin))

    category = (
        "High Profit"
        if margin >= 0.2
        else "Medium Profit"
        if margin >= 0.08
        else "Low Profit"
    )

    return {
        "matched_product": matched_product,
        "estimated_profit_ratio": margin,
        "estimated_profit_percent": margin * 100,
        "profit_category": category,
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


def model_availability() -> dict[str, bool]:
    return {
        "fast_moving": MODEL_PATHS.fast_moving_model.exists()
        and MODEL_PATHS.fast_moving_preprocessor.exists(),
        "low_stock": MODEL_PATHS.low_stock_model.exists()
        and MODEL_PATHS.low_stock_preprocessor.exists(),
        "profit": MODEL_PATHS.profit_model.exists()
        and MODEL_PATHS.profit_preprocessor.exists(),
    }

def search_products(query: str, limit: int = 10) -> dict[str, Any]:
    table = get_ai_table_with_name_index()

    query = str(query or "").strip()
    query_norm = _normalize_text(query)

    if not query_norm:
        return {
            "query": query,
            "count": 0,
            "items": [],
        }

    work = table.copy()

    if "nama" not in work.columns:
        return {
            "query": query,
            "count": 0,
            "items": [],
        }

    exact = work[work["_nama_norm"] == query_norm].copy()
    contains = work[work["_nama_norm"].str.contains(re.escape(query_norm), na=False)].copy()

    if not exact.empty:
        candidates = exact
    elif not contains.empty:
        candidates = contains
    else:
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