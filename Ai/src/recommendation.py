from __future__ import annotations

from functools import lru_cache

import pandas as pd

from src.data_loader import load_products_featured, load_transactions, load_daily_kpi
from src.feature_engineering import build_recommendation_table


@lru_cache(maxsize=1)
def recommendation_table() -> pd.DataFrame:
    return build_recommendation_table(load_products_featured(), load_transactions())


def _records(df: pd.DataFrame, limit: int):
    cols = [
        "kode_barang", "nama", "kategori", "supplier",
        "fast_moving_label", "trx_total_qty", "trx_qty_30d", "trx_qty_90d",
        "sales_velocity", "profit_ratio_clean", "total_stock_actual", "stok_min",
        "restock_score",
    ]
    cols = [c for c in cols if c in df.columns]
    return df[cols].head(limit).replace({float("inf"): None, float("-inf"): None}).fillna(0).to_dict(orient="records")


def top_products(limit: int = 10):
    df = recommendation_table().sort_values("trx_total_qty", ascending=False)
    return _records(df, limit)


def high_profit_products(limit: int = 10):
    df = recommendation_table()
    df = df[df["trx_total_qty"] > 0].sort_values(["profit_ratio_clean", "trx_total_profit"], ascending=False)
    return _records(df, limit)


def restock_priority(limit: int = 10):
    df = recommendation_table().sort_values("restock_score", ascending=False)
    return _records(df, limit)


def ai_summary() -> dict:
    df = recommendation_table()
    daily = load_daily_kpi(required=False)

    summary = {
        "total_products": int(len(df)),
        "products_with_sales": int((df["trx_total_qty"] > 0).sum()),
        "fast_moving_products": int((df["fast_moving_class"] == 2).sum()),
        "normal_products": int((df["fast_moving_class"] == 1).sum()),
        "slow_moving_products": int((df["fast_moving_class"] == 0).sum()),
        "restock_priority_products": int((df["restock_priority_target"] == 1).sum()),
        "avg_profit_ratio": float(df["profit_ratio_clean"].mean()),
        "top_restock_priority": restock_priority(limit=5),
    }

    if not daily.empty:
        for col in ["total_revenue", "total_profit", "total_transactions", "total_items_sold"]:
            if col in daily.columns:
                summary[f"latest_{col}"] = float(daily[col].iloc[-1])
                summary[f"avg_daily_{col}"] = float(daily[col].mean())

    return summary


def daily_kpi_forecast(days: int = 7) -> dict:
    """Lightweight deploy-safe forecast using trailing averages from daily_kpi.csv."""
    daily = load_daily_kpi(required=False)
    if daily.empty:
        return {"forecast": [], "message": "daily_kpi.csv tidak tersedia."}

    daily = daily.copy()
    daily["tanggal"] = pd.to_datetime(daily["tanggal"], errors="coerce")
    daily = daily.dropna(subset=["tanggal"]).sort_values("tanggal")
    last_date = daily["tanggal"].max()
    tail = daily.tail(30)

    forecast = []
    for i in range(1, days + 1):
        row = {"tanggal": (last_date + pd.Timedelta(days=i)).date().isoformat()}
        for col in ["total_revenue", "total_profit", "total_expense", "total_transactions", "total_items_sold"]:
            if col in tail.columns:
                row[col] = float(tail[col].mean())
        forecast.append(row)

    return {
        "method": "30-day trailing average baseline",
        "forecast": forecast,
    }
