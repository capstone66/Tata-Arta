from __future__ import annotations

import math
import re
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from typing import Any

import numpy as np

PLACEHOLDER_VALUES = {"", "string", "null", "none", "undefined", "nan", "-"}


def _is_placeholder(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip().lower() in PLACEHOLDER_VALUES
    return False


def _to_float(value: Any, default: float = 0.0) -> float:
    if _is_placeholder(value):
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
            if "," in text and "." in text:
                text = text.replace(".", "").replace(",", ".")
            elif "," in text and "." not in text:
                text = text.replace(",", ".")
            elif text.count(".") > 1:
                text = text.replace(".", "")

            value = float(text)
        else:
            value = float(value)

        if math.isnan(value) or math.isinf(value):
            return default
        return value
    except Exception:
        return default


def _to_int(value: Any, default: int = 0) -> int:
    return int(round(_to_float(value, default)))


def _normalize_text(value: Any) -> str:
    if _is_placeholder(value):
        return ""
    text = str(value).lower().strip()
    text = re.sub(r"[^a-z0-9\s]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _parse_date(value: Any) -> datetime:
    if _is_placeholder(value):
        return datetime.now()
    try:
        return datetime.fromisoformat(str(value).strip()[:10])
    except Exception:
        return datetime.now()


def _date_str(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def _safe_div(a: float, b: float, default: float = 0.0) -> float:
    return default if b == 0 else a / b


def _trend_from_values(values: list[float]) -> str:
    if len(values) < 3:
        return "stable"

    midpoint = max(1, len(values) // 2)
    prev_avg = float(np.mean(values[:midpoint])) if values[:midpoint] else 0.0
    recent_avg = float(np.mean(values[midpoint:])) if values[midpoint:] else 0.0

    if prev_avg <= 0 and recent_avg > 0:
        return "up"

    change_pct = _safe_div(recent_avg - prev_avg, prev_avg, 0.0)

    if change_pct >= 0.08:
        return "up"
    if change_pct <= -0.08:
        return "down"
    return "stable"


def _linear_forecast(values: list[float], horizon_days: int) -> list[float]:
    values = [_to_float(v) for v in values]

    if not values:
        return [0.0] * horizon_days
    if len(values) == 1:
        return [max(0.0, values[0])] * horizon_days

    x = np.arange(len(values), dtype=float)
    y = np.array(values, dtype=float)

    try:
        slope, intercept = np.polyfit(x, y, 1)
    except Exception:
        slope = 0.0
        intercept = float(np.mean(y))

    recent_avg = float(np.mean(values[-min(7, len(values)):]))
    last_value = float(values[-1])

    predictions = []

    for step in range(1, horizon_days + 1):
        linear_value = intercept + slope * (len(values) - 1 + step)
        momentum_value = last_value + slope * step
        predicted = (0.45 * linear_value) + (0.35 * momentum_value) + (0.20 * recent_avg)
        predictions.append(max(0.0, float(predicted)))

    return predictions


def _clean_kpi_history(history: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cleaned = []

    for item in history or []:
        if not isinstance(item, dict):
            continue

        dt = _parse_date(item.get("date"))
        revenue = _to_float(item.get("revenue"))
        expense = _to_float(item.get("expense"))
        profit = revenue - expense if _is_placeholder(item.get("profit")) else _to_float(item.get("profit"))

        cleaned.append(
            {
                "date": _date_str(dt),
                "_date_obj": dt,
                "revenue": revenue,
                "expense": expense,
                "profit": profit,
                "transactions": _to_int(item.get("transactions")),
            }
        )

    cleaned = sorted(cleaned, key=lambda x: x["_date_obj"])

    for item in cleaned:
        item.pop("_date_obj", None)

    return cleaned


def forecast_daily_kpi_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Forecast real-time dari data KPI database FS.
    Endpoint ini dipakai oleh POST /forecast/daily-kpi.
    """
    horizon_days = max(1, min(_to_int(payload.get("horizon_days"), 7), 30))
    history = _clean_kpi_history(payload.get("history", []))

    if not history:
        raise ValueError("history wajib diisi minimal 1 data KPI harian dari database FS.")

    revenue_values = [item["revenue"] for item in history]
    expense_values = [item["expense"] for item in history]
    profit_values = [item["profit"] for item in history]
    transaction_values = [item["transactions"] for item in history]

    revenue_forecast = _linear_forecast(revenue_values, horizon_days)
    expense_forecast = _linear_forecast(expense_values, horizon_days)
    profit_forecast = _linear_forecast(profit_values, horizon_days)
    transaction_forecast = _linear_forecast(transaction_values, horizon_days)

    last_date = _parse_date(history[-1]["date"])

    forecast = []

    for idx in range(horizon_days):
        forecast_date = last_date + timedelta(days=idx + 1)
        predicted_revenue = round(revenue_forecast[idx], 2)
        predicted_expense = round(expense_forecast[idx], 2)
        predicted_profit = round(profit_forecast[idx], 2)

        if predicted_profit == 0 and predicted_revenue > 0:
            predicted_profit = round(predicted_revenue - predicted_expense, 2)

        forecast.append(
            {
                "date": _date_str(forecast_date),
                "predicted_revenue": predicted_revenue,
                "predicted_expense": predicted_expense,
                "predicted_profit": predicted_profit,
                "predicted_transactions": int(round(transaction_forecast[idx])),
            }
        )

    notes = [
        "Forecast dibuat dari history KPI yang dikirim backend FS.",
        "Semakin panjang history transaksi, semakin stabil hasil forecast.",
    ]

    if len(history) < 7:
        notes.append("Data history kurang dari 7 hari, hasil forecast masih estimasi awal.")

    return {
        "source": "request_payload_from_fs_database",
        "horizon_days": horizon_days,
        "last_actual_date": history[-1]["date"],
        "summary": {
            "history_days": len(history),
            "avg_revenue": round(float(np.mean(revenue_values)), 2),
            "avg_expense": round(float(np.mean(expense_values)), 2),
            "avg_profit": round(float(np.mean(profit_values)), 2),
            "avg_transactions": round(float(np.mean(transaction_values)), 2),
            "last_revenue": round(revenue_values[-1], 2),
            "last_profit": round(profit_values[-1], 2),
            "last_transactions": int(transaction_values[-1]),
            "revenue_trend": _trend_from_values(revenue_values),
            "profit_trend": _trend_from_values(profit_values),
            "transaction_trend": _trend_from_values(transaction_values),
        },
        "history": history,
        "forecast": forecast,
        "notes": notes,
    }


def _compact_product(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "kode_barang": item.get("kode_barang"),
        "nama_barang": item.get("nama_barang") or item.get("nama"),
        "kategori": item.get("kategori"),
        "sub_kategori": item.get("sub_kategori"),
        "supplier": item.get("supplier"),
        "total_stock": _to_float(item.get("total_stock", item.get("stock"))),
        "stok_min": _to_float(item.get("stok_min")),
        "trx_qty_30d": _to_float(item.get("trx_qty_30d")),
        "trx_qty_90d": _to_float(item.get("trx_qty_90d")),
        "trx_count": _to_int(item.get("trx_count")),
        "profit_percent": _to_float(item.get("profit_percent", item.get("estimated_profit_percent"))),
    }


def insights_summary_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insight real-time dari data hari ini, stok, dan produk database FS.
    Endpoint ini dipakai oleh POST /insights/summary.
    """
    today = payload.get("today") or {}
    previous = payload.get("previous_period") or {}
    stock = payload.get("stock") or {}
    products = payload.get("products") or []

    revenue_today = _to_float(today.get("revenue"))
    expense_today = _to_float(today.get("expense"))
    profit_today = revenue_today - expense_today if _is_placeholder(today.get("profit")) else _to_float(today.get("profit"))
    transactions_today = _to_int(today.get("transactions"))

    revenue_avg = _to_float(previous.get("avg_revenue"))
    profit_avg = _to_float(previous.get("avg_profit"))
    transaction_avg = _to_float(previous.get("avg_transactions"))

    total_products = _to_int(stock.get("total_products"), len(products))
    low_stock_products = _to_int(stock.get("low_stock_products"))
    out_of_stock_products = _to_int(stock.get("out_of_stock_products"))

    low_stock_from_products = []
    out_of_stock_from_products = []
    fast_moving_low_stock = []
    high_profit_products = []

    for item in products:
        if not isinstance(item, dict):
            continue

        total_stock = _to_float(item.get("total_stock", item.get("stock")))
        stok_min = _to_float(item.get("stok_min"))
        trx_qty_30d = _to_float(item.get("trx_qty_30d"))
        profit_percent = _to_float(item.get("profit_percent", item.get("estimated_profit_percent")))

        if stok_min > 0 and total_stock <= stok_min:
            low_stock_from_products.append(item)

        if total_stock <= 0:
            out_of_stock_from_products.append(item)

        if stok_min > 0 and total_stock <= stok_min and trx_qty_30d >= 10:
            fast_moving_low_stock.append(item)

        if profit_percent >= 20:
            high_profit_products.append(item)

    if low_stock_products == 0 and low_stock_from_products:
        low_stock_products = len(low_stock_from_products)

    if out_of_stock_products == 0 and out_of_stock_from_products:
        out_of_stock_products = len(out_of_stock_from_products)

    insights = []

    if revenue_avg > 0:
        change = _safe_div(revenue_today - revenue_avg, revenue_avg, 0) * 100
        if change >= 10:
            insights.append(f"Pemasukan hari ini naik {change:.1f}% dibanding rata-rata periode sebelumnya.")
        elif change <= -10:
            insights.append(f"Pemasukan hari ini turun {abs(change):.1f}% dibanding rata-rata periode sebelumnya.")
        else:
            insights.append("Pemasukan hari ini relatif stabil dibanding rata-rata periode sebelumnya.")
    else:
        insights.append("Pemasukan hari ini berhasil diringkas dari data transaksi terbaru.")

    if profit_avg > 0:
        change = _safe_div(profit_today - profit_avg, profit_avg, 0) * 100
        if change >= 10:
            insights.append(f"Profit hari ini naik {change:.1f}% dibanding rata-rata periode sebelumnya.")
        elif change <= -10:
            insights.append(f"Profit hari ini turun {abs(change):.1f}% dibanding rata-rata periode sebelumnya.")

    if transaction_avg > 0:
        change = _safe_div(transactions_today - transaction_avg, transaction_avg, 0) * 100
        if change >= 10:
            insights.append(f"Jumlah transaksi hari ini naik {change:.1f}% dibanding rata-rata.")
        elif change <= -10:
            insights.append(f"Jumlah transaksi hari ini turun {abs(change):.1f}% dibanding rata-rata.")

    if low_stock_products > 0:
        insights.append(f"Ada {low_stock_products} produk dengan stok rendah yang perlu dicek.")

    if out_of_stock_products > 0:
        insights.append(f"Ada {out_of_stock_products} produk kosong dan perlu segera ditindaklanjuti.")

    if fast_moving_low_stock:
        insights.append(f"Ada {len(fast_moving_low_stock)} produk laku cepat dengan stok rendah. Prioritaskan restock.")

    if high_profit_products:
        insights.append(f"Ada {len(high_profit_products)} produk profit tinggi yang dapat diprioritaskan untuk promosi.")

    if not insights:
        insights.append("Belum ada insight kritis dari data terbaru.")

    return {
        "source": "request_payload_from_fs_database",
        "summary": {
            "date": today.get("date"),
            "revenue_today": round(revenue_today, 2),
            "expense_today": round(expense_today, 2),
            "profit_today": round(profit_today, 2),
            "transactions_today": transactions_today,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
            "out_of_stock_products": out_of_stock_products,
            "fast_moving_low_stock_products": len(fast_moving_low_stock),
            "high_profit_products": len(high_profit_products),
        },
        "insights": insights,
        "priority_products": {
            "low_stock": [_compact_product(item) for item in low_stock_from_products[:10]],
            "out_of_stock": [_compact_product(item) for item in out_of_stock_from_products[:10]],
            "fast_moving_low_stock": [_compact_product(item) for item in fast_moving_low_stock[:10]],
            "high_profit": [_compact_product(item) for item in high_profit_products[:10]],
        },
    }


def search_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    query = str(payload.get("q") or payload.get("query") or "").strip()
    limit = max(1, min(_to_int(payload.get("limit"), 10), 50))
    products = payload.get("products") or []
    query_norm = _normalize_text(query)

    if not query_norm:
        return {"source": "request_payload_from_fs_database", "query": query, "count": 0, "items": []}

    scored = []

    for item in products:
        if not isinstance(item, dict):
            continue

        name = str(item.get("nama_barang") or item.get("nama") or item.get("product_name") or "")
        name_norm = _normalize_text(name)

        if not name_norm:
            continue

        if name_norm == query_norm:
            score, match_type = 1.0, "exact"
        elif query_norm in name_norm:
            score, match_type = SequenceMatcher(None, query_norm, name_norm).ratio(), "contains"
        else:
            score, match_type = SequenceMatcher(None, query_norm, name_norm).ratio(), "fuzzy"

        if score >= 0.40:
            scored.append((score, match_type, item))

    scored.sort(key=lambda x: x[0], reverse=True)

    items = []

    for score, match_type, item in scored[:limit]:
        compact = _compact_product(item)
        compact.update(
            {
                "match_type": match_type,
                "match_score": round(float(score), 4),
                "supplier": item.get("supplier"),
                "hpp": _to_float(item.get("hpp")),
                "harga_toko_1": _to_float(item.get("harga_toko_1")),
            }
        )
        items.append(compact)

    return {"source": "request_payload_from_fs_database", "query": query, "count": len(items), "items": items}


def top_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    limit = max(1, min(_to_int(payload.get("limit"), 10), 50))
    products = payload.get("products") or []
    scored = []

    for item in products:
        if not isinstance(item, dict):
            continue

        trx_total_qty = _to_float(item.get("trx_total_qty"))
        trx_count = _to_float(item.get("trx_count"))
        revenue = _to_float(item.get("trx_total_revenue"))
        score = (trx_total_qty * 0.6) + (trx_count * 0.3) + (_safe_div(revenue, 1000000) * 0.1)
        scored.append((score, item))

    scored.sort(key=lambda x: x[0], reverse=True)

    items = []

    for score, item in scored[:limit]:
        compact = _compact_product(item)
        compact.update(
            {
                "score": round(score, 4),
                "trx_total_qty": _to_float(item.get("trx_total_qty")),
                "trx_count": _to_int(item.get("trx_count")),
                "trx_total_revenue": _to_float(item.get("trx_total_revenue")),
                "reason": "Produk memiliki aktivitas penjualan tinggi dari database FS.",
            }
        )
        items.append(compact)

    return {"source": "request_payload_from_fs_database", "count": len(items), "items": items}


def high_profit_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    limit = max(1, min(_to_int(payload.get("limit"), 10), 50))
    products = payload.get("products") or []
    scored = []

    for item in products:
        if not isinstance(item, dict):
            continue

        hpp = _to_float(item.get("hpp"))
        price = _to_float(item.get("harga_toko_1") or item.get("harga_jual"))
        profit_percent = _to_float(item.get("profit_percent") or item.get("estimated_profit_percent"))

        if profit_percent <= 0 and price > 0:
            profit_percent = _safe_div(price - hpp, price, 0) * 100

        trx_qty_30d = _to_float(item.get("trx_qty_30d"))
        score = profit_percent + min(trx_qty_30d, 100) * 0.05
        scored.append((score, profit_percent, item))

    scored.sort(key=lambda x: x[0], reverse=True)

    items = []

    for score, profit_percent, item in scored[:limit]:
        compact = _compact_product(item)
        category = "High Profit" if profit_percent >= 20 else "Medium Profit" if profit_percent >= 8 else "Low Profit"
        compact.update(
            {
                "score": round(score, 4),
                "estimated_profit_percent": round(profit_percent, 2),
                "profit_category": category,
                "reason": "Produk memiliki potensi profit tinggi berdasarkan data FS.",
            }
        )
        items.append(compact)

    return {"source": "request_payload_from_fs_database", "count": len(items), "items": items}


def restock_priority_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    limit = max(1, min(_to_int(payload.get("limit"), 10), 50))
    products = payload.get("products") or []
    scored = []

    for item in products:
        if not isinstance(item, dict):
            continue

        total_stock = _to_float(item.get("total_stock", item.get("stock")))
        stok_min = _to_float(item.get("stok_min"))
        trx_qty_30d = _to_float(item.get("trx_qty_30d"))
        trx_qty_90d = _to_float(item.get("trx_qty_90d"))
        trx_count = _to_float(item.get("trx_count"))

        stock_pressure = max(0.0, _safe_div(stok_min - total_stock, stok_min, 0)) if stok_min > 0 else (1.0 if total_stock <= 0 else 0.0)
        sales_velocity = (trx_qty_30d * 0.7) + (_safe_div(trx_qty_90d, 3, 0) * 0.2) + (trx_count * 0.1)
        score = (stock_pressure * 100) + sales_velocity

        if total_stock <= 0:
            score += 50

        scored.append((score, item))

    scored.sort(key=lambda x: x[0], reverse=True)

    items = []

    for score, item in scored[:limit]:
        compact = _compact_product(item)
        compact.update(
            {
                "restock_priority_score": round(float(score), 4),
                "trx_total_qty": _to_float(item.get("trx_total_qty")),
                "trx_qty_30d": _to_float(item.get("trx_qty_30d")),
                "trx_count": _to_int(item.get("trx_count")),
                "reason": "Produk diprioritaskan berdasarkan stok rendah dan transaksi database FS.",
            }
        )
        items.append(compact)

    return {"source": "request_payload_from_fs_database", "count": len(items), "items": items}
