from __future__ import annotations

from functools import lru_cache
from typing import Any

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from src.config import FAST_MOVING_LABELS, LOW_STOCK_LABELS, MODEL_PATHS
from src.custom_layers import ResidualDenseBlock  # noqa: F401 - needed for keras deserialization
from src.data_loader import load_products_featured, load_transactions
from src.feature_engineering import build_ai_table
from src.preprocessing import to_dense_float32


@lru_cache(maxsize=1)
def get_ai_table() -> pd.DataFrame:
    products = load_products_featured()
    transactions = load_transactions()
    return build_ai_table(products, transactions).data


def _load_bundle(model_path, preprocessor_path):
    if not model_path.exists() or not preprocessor_path.exists():
        raise RuntimeError(
            f"Model belum tersedia: {model_path.name}. Jalankan training dulu: python train_all.py"
        )
    model = tf.keras.models.load_model(model_path, compile=False)
    bundle = joblib.load(preprocessor_path)
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


def _row_from_payload(payload: dict[str, Any]) -> pd.DataFrame:
    table = get_ai_table()
    kode_barang = str(payload.get("kode_barang") or "").strip()

    if kode_barang:
        match = table[table["kode_barang"].astype(str) == kode_barang]
        if not match.empty:
            row = match.iloc[[0]].copy()
        else:
            row = pd.DataFrame([{}])
    else:
        row = pd.DataFrame([{}])

    for key, value in payload.items():
        if value is not None:
            row.loc[row.index[0], key] = value

    # Fill unknown columns from table medians/modes where possible.
    for col in table.columns:
        if col not in row.columns:
            if pd.api.types.is_numeric_dtype(table[col]):
                row[col] = table[col].median()
            else:
                row[col] = "Unknown"

    return row


def _transform(payload: dict[str, Any], bundle: dict[str, Any]) -> np.ndarray:
    row = _row_from_payload(payload)
    feature_columns = bundle["feature_columns"]
    for col in feature_columns:
        if col not in row.columns:
            row[col] = 0
    x = bundle["preprocessor"].transform(row[feature_columns])
    return to_dense_float32(x)


def predict_fast_moving(payload: dict[str, Any]) -> dict[str, Any]:
    model, bundle = load_fast_moving()
    x = _transform(payload, bundle)
    probs = model.predict(x, verbose=0)[0]
    class_id = int(np.argmax(probs))
    return {
        "class_id": class_id,
        "prediction": FAST_MOVING_LABELS[class_id],
        "confidence": float(np.max(probs)),
        "probabilities": {FAST_MOVING_LABELS[i]: float(probs[i]) for i in range(len(probs))},
    }


def predict_low_stock(payload: dict[str, Any]) -> dict[str, Any]:
    model, bundle = load_low_stock()
    x = _transform(payload, bundle)
    score = float(model.predict(x, verbose=0)[0][0])
    class_id = int(score >= 0.5)
    return {
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
    x = _transform(payload, bundle)
    margin = float(model.predict(x, verbose=0)[0][0])
    category = "High Profit" if margin >= 0.2 else "Medium Profit" if margin >= 0.08 else "Low Profit"
    return {
        "estimated_profit_ratio": margin,
        "estimated_profit_percent": margin * 100,
        "profit_category": category,
    }


def predict_all(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "fast_moving": predict_fast_moving(payload),
        "low_stock": predict_low_stock(payload),
        "profit": predict_profit(payload),
    }


def model_availability() -> dict[str, bool]:
    return {
        "fast_moving": MODEL_PATHS.fast_moving_model.exists() and MODEL_PATHS.fast_moving_preprocessor.exists(),
        "low_stock": MODEL_PATHS.low_stock_model.exists() and MODEL_PATHS.low_stock_preprocessor.exists(),
        "profit": MODEL_PATHS.profit_model.exists() and MODEL_PATHS.profit_preprocessor.exists(),
    }
