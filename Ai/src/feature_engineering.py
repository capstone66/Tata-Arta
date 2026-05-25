from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from src.config import FAST_MOVING_LABELS


NUMERIC_FEATURES = [
    "hpp", "harga_toko_1", "isi", "stok_min", "stok_max",
    "price_is_zero", "hpp_is_zero", "markup_ratio",
    "gross_margin_ratio", "total_stock_actual", "stock_gap",
    "stock_coverage_days", "sales_velocity",
    "trx_total_qty", "trx_total_revenue", "trx_total_profit", "trx_total_expense",
    "trx_count", "trx_unique_days", "trx_avg_qty", "trx_max_qty", "trx_avg_revenue",
    "trx_avg_profit", "trx_recency_days",
    "trx_qty_30d", "trx_qty_60d", "trx_qty_90d", "trx_qty_180d", "trx_qty_365d",
    "trx_count_30d", "trx_count_60d", "trx_count_90d", "trx_count_180d", "trx_count_365d",
    "trx_revenue_30d", "trx_revenue_60d", "trx_revenue_90d", "trx_revenue_180d", "trx_revenue_365d",
    "trx_profit_30d", "trx_profit_60d", "trx_profit_90d", "trx_profit_180d", "trx_profit_365d",
    "trx_monthly_qty_mean", "trx_monthly_qty_std", "trx_monthly_qty_max", "trx_active_months",
    "recent_sales_ratio_30_90", "recent_sales_ratio_90_total",
]

CATEGORICAL_FEATURES = [
    "kategori", "supplier", "satuan_1",
]

TRAINING_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


@dataclass(frozen=True)
class DatasetBundle:
    data: pd.DataFrame
    feature_columns: list[str]
    categorical_columns: list[str]
    numeric_columns: list[str]


def _safe_num(series: pd.Series, default: float = 0.0) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").replace([np.inf, -np.inf], np.nan).fillna(default)


def _normalize_products(products: pd.DataFrame) -> pd.DataFrame:
    df = products.copy()
    df["kode_barang"] = df["kode_barang"].astype(str)

    required = {
        "kategori": "Unknown",
        "supplier": "Unknown",
        "satuan_1": "Unknown",
        "nama": "Unknown",
        "hpp": 0,
        "harga_toko_1": 0,
        "isi": 1,
        "toko": 0,
        "gudang": 0,
        "stok_min": 0,
        "stok_max": 0,
    }
    for col, default in required.items():
        if col not in df.columns:
            df[col] = default

    for col in ["kategori", "supplier", "satuan_1", "nama"]:
        df[col] = df[col].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")

    for col in ["hpp", "harga_toko_1", "isi", "toko", "gudang", "stok_min", "stok_max"]:
        df[col] = _safe_num(df[col])

    df["total_stock_actual"] = _safe_num(df["toko"]) + _safe_num(df["gudang"])
    # products_featured.csv has total_stock all 0; keep actual toko+gudang as source of truth.
    df["price_is_zero"] = (df["harga_toko_1"] <= 0).astype(int)
    df["hpp_is_zero"] = (df["hpp"] <= 0).astype(int)

    price = df["harga_toko_1"].replace(0, np.nan)
    hpp = df["hpp"].replace(0, np.nan)
    df["markup_ratio"] = ((price - hpp) / price).replace([np.inf, -np.inf], np.nan).fillna(0).clip(-1, 1)
    df["gross_margin_ratio"] = ((df["harga_toko_1"] - df["hpp"]) / df["hpp"].replace(0, np.nan)).replace(
        [np.inf, -np.inf], np.nan
    ).fillna(0).clip(-1, 5)

    return df


def build_transaction_features(transactions: pd.DataFrame) -> pd.DataFrame:
    tx = transactions.copy()
    if tx.empty:
        return pd.DataFrame(columns=["kode_barang"])

    tx["kode_barang"] = tx["kode_barang"].astype(str)
    tx["tanggal"] = pd.to_datetime(tx["tanggal"], errors="coerce")
    tx = tx.dropna(subset=["tanggal"])

    # Use completed transactions as business-realized sales. If no status column exists, use all rows.
    if "status" in tx.columns:
        completed = tx["status"].astype(str).str.lower().str.strip().eq("selesai")
        if completed.any():
            tx = tx.loc[completed].copy()

    for col in ["qty", "harga_jual", "hpp", "total", "profit", "expense"]:
        if col not in tx.columns:
            tx[col] = 0
        tx[col] = _safe_num(tx[col])

    max_date = tx["tanggal"].max()

    agg = tx.groupby("kode_barang").agg(
        trx_total_qty=("qty", "sum"),
        trx_total_revenue=("total", "sum"),
        trx_total_profit=("profit", "sum"),
        trx_total_expense=("expense", "sum"),
        trx_count=("transaction_id", "count"),
        trx_unique_days=("tanggal", lambda s: s.dt.date.nunique()),
        trx_avg_qty=("qty", "mean"),
        trx_max_qty=("qty", "max"),
        trx_avg_revenue=("total", "mean"),
        trx_avg_profit=("profit", "mean"),
        trx_last_date=("tanggal", "max"),
    ).reset_index()

    agg["trx_recency_days"] = (max_date - agg["trx_last_date"]).dt.days.fillna(999).astype(float)
    agg = agg.drop(columns=["trx_last_date"])

    for days in [30, 60, 90, 180, 365]:
        sub = tx[tx["tanggal"] >= max_date - pd.Timedelta(days=days)]
        win = sub.groupby("kode_barang").agg(
            **{
                f"trx_qty_{days}d": ("qty", "sum"),
                f"trx_count_{days}d": ("transaction_id", "count"),
                f"trx_revenue_{days}d": ("total", "sum"),
                f"trx_profit_{days}d": ("profit", "sum"),
            }
        ).reset_index()
        agg = agg.merge(win, on="kode_barang", how="left")

    tx["month"] = tx["tanggal"].dt.to_period("M").astype(str)
    monthly = tx.groupby(["kode_barang", "month"], as_index=False)["qty"].sum()
    mstats = monthly.groupby("kode_barang").agg(
        trx_monthly_qty_mean=("qty", "mean"),
        trx_monthly_qty_std=("qty", "std"),
        trx_monthly_qty_max=("qty", "max"),
        trx_active_months=("month", "nunique"),
    ).reset_index()
    agg = agg.merge(mstats, on="kode_barang", how="left")

    for col in agg.columns:
        if col != "kode_barang":
            agg[col] = _safe_num(agg[col])

    return agg


def build_ai_table(products: pd.DataFrame, transactions: pd.DataFrame) -> DatasetBundle:
    products = _normalize_products(products)
    trx_features = build_transaction_features(transactions)
    df = products.merge(trx_features, on="kode_barang", how="left")

    for col in NUMERIC_FEATURES:
        if col not in df.columns:
            df[col] = 0.0
        df[col] = _safe_num(df[col])

    df["sales_velocity"] = df["trx_total_qty"] / 366.0
    df["stock_gap"] = df["stok_min"] - df["total_stock_actual"]
    df["stock_coverage_days"] = (
        df["total_stock_actual"] / df["sales_velocity"].replace(0, np.nan)
    ).replace([np.inf, -np.inf], np.nan).fillna(999).clip(0, 999)

    df["recent_sales_ratio_30_90"] = (
        df["trx_qty_30d"] / df["trx_qty_90d"].replace(0, np.nan)
    ).replace([np.inf, -np.inf], np.nan).fillna(0).clip(0, 10)

    df["recent_sales_ratio_90_total"] = (
        df["trx_qty_90d"] / df["trx_total_qty"].replace(0, np.nan)
    ).replace([np.inf, -np.inf], np.nan).fillna(0).clip(0, 10)

    # Clean profit target. Avoid raw products_featured.profit_margin because it contains extreme values
    # caused by zero HPP/price rows.
    df["profit_ratio_clean"] = (
        df["trx_total_profit"] / df["trx_total_revenue"].replace(0, np.nan)
    ).replace([np.inf, -np.inf], np.nan).fillna(df["markup_ratio"]).clip(0, 1)

    # Actual data relationship: products_featured.fast_moving_flag = total_sales >= 17.
    # We convert it into 3 classes for the capstone requirement:
    # 0 Slow Moving: 0-8 sold, 1 Normal: 9-16 sold, 2 Fast Moving: >=17 sold.
    df["fast_moving_class"] = np.select(
        [df["trx_total_qty"] >= 17, df["trx_total_qty"] >= 9],
        [2, 1],
        default=0,
    ).astype(int)

    # In the uploaded products_featured.csv, low_stock_flag is constant True and total_stock is constant 0.
    # A constant target cannot train a useful classifier, so we create a business proxy:
    # restock priority = product has sales movement and current available stock is <= minimum stock.
    # Because stock is zero in the current dataset, this becomes a priority prediction based on demand velocity.
    df["restock_priority_target"] = (
        (df["total_stock_actual"] <= df["stok_min"]) &
        (df["trx_total_qty"] >= 9)
    ).astype(int)

    for col in CATEGORICAL_FEATURES:
        if col not in df.columns:
            df[col] = "Unknown"
        df[col] = df[col].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")

    existing_features = [c for c in TRAINING_FEATURES if c in df.columns]
    numeric_columns = [c for c in existing_features if c in NUMERIC_FEATURES]
    categorical_columns = [c for c in existing_features if c in CATEGORICAL_FEATURES]
    return DatasetBundle(df, existing_features, categorical_columns, numeric_columns)


def label_fast_class(value: int) -> str:
    return FAST_MOVING_LABELS.get(int(value), "Unknown")


def build_recommendation_table(products: pd.DataFrame, transactions: pd.DataFrame) -> pd.DataFrame:
    bundle = build_ai_table(products, transactions)
    df = bundle.data.copy()
    df["restock_score"] = (
        df["restock_priority_target"] * 100
        + df["sales_velocity"].rank(pct=True) * 50
        + df["profit_ratio_clean"].rank(pct=True) * 30
        + df["recent_sales_ratio_30_90"].rank(pct=True) * 20
    )
    df["fast_moving_label"] = df["fast_moving_class"].map(FAST_MOVING_LABELS)
    return df.sort_values("restock_score", ascending=False)
