from __future__ import annotations

import math
import re
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from typing import Any


PLACEHOLDER_VALUES = {"", "string", "null", "none", "undefined", "nan", "-"}


def _is_placeholder(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip().lower() in PLACEHOLDER_VALUES
    return False


def _clean_text(value: Any, default: str = "") -> str:
    if _is_placeholder(value):
        return default
    return str(value).strip()


def _normalize_text(value: Any) -> str:
    text = _clean_text(value).lower()
    text = re.sub(r"[^a-z0-9\s]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


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
    except Exception:
        return default


def _to_int(value: Any, default: int = 0) -> int:
    return int(round(_to_float(value, float(default))))


def _safe_number(value: float) -> float:
    if value is None:
        return 0.0
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return 0.0
    return float(value)


def _json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    if isinstance(value, tuple):
        return [_json_safe(v) for v in value]
    if isinstance(value, float):
        return _safe_number(value)
    return value


def _products_from_payload(payload: dict[str, Any]) -> list[dict[str, Any]]:
    products = payload.get("products") or []

    if not isinstance(products, list):
        raise ValueError("Field 'products' harus berupa list.")

    cleaned: list[dict[str, Any]] = []

    for item in products:
        if not isinstance(item, dict):
            continue

        cleaned.append({k: v for k, v in item.items() if not _is_placeholder(v)})

    return cleaned


def _limit_from_payload(payload: dict[str, Any], default: int = 10) -> int:
    limit = _to_int(payload.get("limit"), default)
    return max(1, min(limit, 50))


def _product_name(product: dict[str, Any]) -> str:
    return (
        _clean_text(product.get("nama_barang"))
        or _clean_text(product.get("nama_produk"))
        or _clean_text(product.get("nama"))
    )


def _selling_price(product: dict[str, Any]) -> float:
    return (
        _to_float(product.get("harga_toko_1"))
        or _to_float(product.get("harga_jual"))
        or _to_float(product.get("harga_toko_2"))
        or _to_float(product.get("harga_toko_3"))
    )


def _stock_value(product: dict[str, Any]) -> float:
    if not _is_placeholder(product.get("total_stock")):
        return _to_float(product.get("total_stock"))

    if not _is_placeholder(product.get("stock")):
        return _to_float(product.get("stock"))

    toko = _to_float(product.get("toko"))
    gudang = _to_float(product.get("gudang"))

    if toko or gudang:
        return toko + gudang

    return 0.0


def _profit_percent(product: dict[str, Any]) -> float:
    # 1. Pakai profit_percent eksplisit dari backend jika ada.
    for key in ("estimated_profit_percent", "profit_percent"):
        if not _is_placeholder(product.get(key)):
            return max(0.0, _to_float(product.get(key)))

    # 2. Hitung dari HPP dan harga jual.
    hpp = _to_float(product.get("hpp"))
    price = _selling_price(product)

    if price > 0 and hpp >= 0:
        return max(0.0, ((price - hpp) / price) * 100)

    # 3. Hitung dari total profit dan revenue transaksi.
    revenue = _to_float(product.get("trx_total_revenue"))
    profit = _to_float(product.get("trx_total_profit"))

    if revenue > 0:
        return max(0.0, (profit / revenue) * 100)

    return 0.0


def _profit_category(percent: float) -> str:
    if percent >= 20:
        return "High Profit"
    if percent >= 8:
        return "Medium Profit"
    return "Low Profit"


def _sales_score(product: dict[str, Any]) -> float:
    trx_total_qty = _to_float(product.get("trx_total_qty"))
    trx_qty_30d = _to_float(product.get("trx_qty_30d"))
    trx_qty_60d = _to_float(product.get("trx_qty_60d"))
    trx_qty_90d = _to_float(product.get("trx_qty_90d"))
    trx_count = _to_float(product.get("trx_count"))

    return (
        trx_qty_30d * 0.45
        + (trx_qty_60d / 2) * 0.20
        + (trx_qty_90d / 3) * 0.15
        + trx_total_qty * 0.10
        + trx_count * 0.10
    )


def _restock_score(product: dict[str, Any]) -> float:
    total_stock = _stock_value(product)
    stok_min = _to_float(product.get("stok_min"))
    stok_max = _to_float(product.get("stok_max"))
    trx_qty_30d = _to_float(product.get("trx_qty_30d"))
    trx_qty_90d = _to_float(product.get("trx_qty_90d"))
    trx_count = _to_float(product.get("trx_count"))

    if stok_min > 0:
        stock_pressure = max(0.0, (stok_min - total_stock) / stok_min)
    else:
        stock_pressure = 1.0 if total_stock <= 0 else 0.0

    sales_velocity = (
        trx_qty_30d * 0.7
        + (trx_qty_90d / 3) * 0.2
        + trx_count * 0.1
    )

    score = (stock_pressure * 100) + sales_velocity

    if total_stock <= 0:
        score += 50

    if stok_max > 0 and total_stock > stok_max:
        score -= 25

    return max(0.0, score)


def _compact_product(product: dict[str, Any]) -> dict[str, Any]:
    total_stock = _stock_value(product)
    profit_percent = _profit_percent(product)

    return {
        "kode_barang": _clean_text(product.get("kode_barang")) or None,
        "nama": _product_name(product) or None,
        "kategori": _clean_text(product.get("kategori")) or None,
        "sub_kategori": _clean_text(product.get("sub_kategori")) or None,
        "supplier": _clean_text(product.get("supplier")) or None,
        "hpp": _to_float(product.get("hpp")),
        "harga_toko_1": _selling_price(product),
        "total_stock": total_stock,
        "stok_min": _to_float(product.get("stok_min")),
        "stok_max": _to_float(product.get("stok_max")),
        "trx_total_qty": _to_float(product.get("trx_total_qty")),
        "trx_qty_30d": _to_float(product.get("trx_qty_30d")),
        "trx_qty_60d": _to_float(product.get("trx_qty_60d")),
        "trx_qty_90d": _to_float(product.get("trx_qty_90d")),
        "trx_count": _to_float(product.get("trx_count")),
        "trx_total_revenue": _to_float(product.get("trx_total_revenue")),
        "trx_total_profit": _to_float(product.get("trx_total_profit")),
        "estimated_profit_percent": round(profit_percent, 2),
        "profit_category": _profit_category(profit_percent),
    }


def search_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Search produk realtime dari database FS.

    Payload:
    {
      "q": "beras",
      "limit": 10,
      "products": [...]
    }
    """

    query = _clean_text(payload.get("q"))
    query_norm = _normalize_text(query)
    limit = _limit_from_payload(payload)
    products = _products_from_payload(payload)

    if not query_norm:
        return {
            "source": "fs_payload",
            "query": query,
            "count": 0,
            "items": [],
        }

    candidates: list[dict[str, Any]] = []

    for product in products:
        name = _product_name(product)
        kode = _clean_text(product.get("kode_barang"))

        haystack = (
            f"{kode} {name} "
            f"{_clean_text(product.get('kategori'))} "
            f"{_clean_text(product.get('supplier'))}"
        )

        haystack_norm = _normalize_text(haystack)

        if not haystack_norm:
            continue

        if query_norm == _normalize_text(kode) or query_norm == _normalize_text(name):
            score = 1.0
        elif query_norm in haystack_norm:
            score = 0.85
        else:
            score = SequenceMatcher(None, query_norm, haystack_norm).ratio()

        if score >= 0.35:
            item = _compact_product(product)
            item["match_score"] = round(float(score), 4)
            candidates.append(item)

    candidates.sort(
        key=lambda item: (
            item.get("match_score", 0),
            item.get("trx_total_qty", 0),
            item.get("trx_count", 0),
        ),
        reverse=True,
    )

    items = candidates[:limit]

    return _json_safe(
        {
            "source": "fs_payload",
            "query": query,
            "count": len(items),
            "items": items,
        }
    )


def top_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    products = _products_from_payload(payload)
    limit = _limit_from_payload(payload)

    items = []

    for product in products:
        item = _compact_product(product)
        item["sales_score"] = round(_sales_score(product), 4)
        item["reason"] = "Produk memiliki aktivitas penjualan tertinggi dari data real database FS."
        items.append(item)

    items.sort(
        key=lambda item: (
            item.get("sales_score", 0),
            item.get("trx_total_qty", 0),
            item.get("trx_count", 0),
        ),
        reverse=True,
    )

    items = items[:limit]

    return _json_safe(
        {
            "source": "fs_payload",
            "count": len(items),
            "items": items,
        }
    )


def high_profit_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    products = _products_from_payload(payload)
    limit = _limit_from_payload(payload)

    items = []

    for product in products:
        item = _compact_product(product)
        item["reason"] = "Produk memiliki estimasi profit tertinggi dari data real database FS."
        items.append(item)

    items.sort(
        key=lambda item: (
            item.get("estimated_profit_percent", 0),
            item.get("trx_total_profit", 0),
            item.get("trx_total_revenue", 0),
        ),
        reverse=True,
    )

    items = items[:limit]

    return _json_safe(
        {
            "source": "fs_payload",
            "count": len(items),
            "items": items,
        }
    )


def restock_priority_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    products = _products_from_payload(payload)
    limit = _limit_from_payload(payload)

    items = []

    for product in products:
        item = _compact_product(product)
        score = _restock_score(product)

        item["restock_priority_score"] = round(score, 4)

        if _stock_value(product) <= 0:
            item["status"] = "Out of Stock"
            item["reason"] = "Stok habis dan perlu segera restock."
        elif _stock_value(product) <= _to_float(product.get("stok_min")):
            item["status"] = "Restock Priority"
            item["reason"] = "Stok berada di bawah atau sama dengan stok minimum."
        else:
            item["status"] = "Stock Safe"
            item["reason"] = "Stok masih relatif aman."

        items.append(item)

    items.sort(
        key=lambda item: (
            item.get("restock_priority_score", 0),
            item.get("trx_qty_30d", 0),
            item.get("trx_count", 0),
        ),
        reverse=True,
    )

    items = items[:limit]

    return _json_safe(
        {
            "source": "fs_payload",
            "count": len(items),
            "items": items,
        }
    )


def _growth(current: float, previous: float) -> float | None:
    if previous == 0:
        return None

    return ((current - previous) / abs(previous)) * 100


def insights_summary_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Insight realtime dari backend FS.

    Payload:
    {
      "today": {
        "revenue": 100000,
        "expense": 70000,
        "profit": 30000,
        "transactions": 25
      },
      "previous_period": {
        "avg_revenue": 80000,
        "avg_profit": 20000,
        "avg_transactions": 20
      },
      "stock": {
        "total_products": 100,
        "low_stock_products": 12,
        "out_of_stock_products": 3
      },
      "products": [...]
    }
    """

    today = payload.get("today") or {}
    previous = payload.get("previous_period") or {}
    stock = payload.get("stock") or {}
    products = _products_from_payload(payload)

    revenue = _to_float(today.get("revenue"))
    expense = _to_float(today.get("expense"))
    profit = _to_float(today.get("profit"), revenue - expense)
    transactions = _to_int(today.get("transactions"))

    avg_revenue = _to_float(previous.get("avg_revenue"))
    avg_profit = _to_float(previous.get("avg_profit"))
    avg_transactions = _to_float(previous.get("avg_transactions"))

    total_products = _to_int(stock.get("total_products"), len(products))
    low_stock_products = _to_int(stock.get("low_stock_products"))
    out_of_stock_products = _to_int(stock.get("out_of_stock_products"))

    if products:
        total_products = total_products or len(products)

        low_stock_products = sum(
            1
            for product in products
            if _stock_value(product) <= _to_float(product.get("stok_min"))
            and _stock_value(product) > 0
        )

        out_of_stock_products = sum(
            1 for product in products if _stock_value(product) <= 0
        )

    fast_moving_products = sum(
        1 for product in products if _sales_score(product) >= 10
    )

    high_profit_products_count = sum(
        1 for product in products if _profit_percent(product) >= 20
    )

    restock_priority_products = sum(
        1 for product in products if _restock_score(product) >= 50
    )

    revenue_growth = _growth(revenue, avg_revenue)
    profit_growth = _growth(profit, avg_profit)
    transaction_growth = _growth(float(transactions), avg_transactions)

    insights: list[str] = []

    if revenue_growth is not None:
        if revenue_growth >= 10:
            insights.append(
                f"Revenue hari ini naik {revenue_growth:.1f}% dibanding rata-rata periode sebelumnya."
            )
        elif revenue_growth <= -10:
            insights.append(
                f"Revenue hari ini turun {abs(revenue_growth):.1f}% dibanding rata-rata periode sebelumnya."
            )
        else:
            insights.append("Revenue hari ini relatif stabil dibanding periode sebelumnya.")

    if profit_growth is not None:
        if profit_growth >= 10:
            insights.append(
                f"Profit hari ini naik {profit_growth:.1f}% dibanding rata-rata periode sebelumnya."
            )
        elif profit_growth <= -10:
            insights.append(
                f"Profit hari ini turun {abs(profit_growth):.1f}% dibanding rata-rata periode sebelumnya."
            )

    if out_of_stock_products > 0:
        insights.append(f"Ada {out_of_stock_products} produk habis stok.")

    if low_stock_products > 0:
        insights.append(f"Ada {low_stock_products} produk stok rendah.")

    if restock_priority_products > 0:
        insights.append(
            f"Ada {restock_priority_products} produk yang perlu diprioritaskan untuk restock."
        )

    if fast_moving_products > 0:
        insights.append(f"Ada {fast_moving_products} produk dengan penjualan cepat.")

    if high_profit_products_count > 0:
        insights.append(
            f"Ada {high_profit_products_count} produk dengan estimasi profit tinggi."
        )

    if not insights:
        insights.append("Belum ada insight khusus. Data operasional terlihat stabil.")

    return _json_safe(
        {
            "source": "fs_payload",
            "summary": {
                "date": today.get("date"),
                "revenue": revenue,
                "expense": expense,
                "profit": profit,
                "transactions": transactions,
                "revenue_growth_percent": None
                if revenue_growth is None
                else round(revenue_growth, 2),
                "profit_growth_percent": None
                if profit_growth is None
                else round(profit_growth, 2),
                "transaction_growth_percent": None
                if transaction_growth is None
                else round(transaction_growth, 2),
                "total_products": total_products,
                "low_stock_products": low_stock_products,
                "out_of_stock_products": out_of_stock_products,
                "fast_moving_products": fast_moving_products,
                "restock_priority_products": restock_priority_products,
                "high_profit_products": high_profit_products_count,
            },
            "insights": insights,
        }
    )


def _parse_date(value: Any) -> datetime | None:
    text = _clean_text(value)

    if not text:
        return None

    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(text[:10], fmt)
        except Exception:
            pass

    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).replace(tzinfo=None)
    except Exception:
        return None


def forecast_daily_kpi_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Forecast KPI realtime dari history database FS.

    Payload:
    {
      "horizon_days": 7,
      "history": [
        {
          "date": "2026-05-01",
          "revenue": 100000,
          "expense": 70000,
          "profit": 30000,
          "transactions": 20
        }
      ]
    }
    """

    horizon_days = max(1, min(_to_int(payload.get("horizon_days"), 7), 30))
    raw_history = payload.get("history") or []

    if not isinstance(raw_history, list):
        raise ValueError("Field 'history' harus berupa list.")

    history: list[dict[str, Any]] = []

    for item in raw_history:
        if not isinstance(item, dict):
            continue

        date = _parse_date(item.get("date"))

        if date is None:
            continue

        revenue = _to_float(item.get("revenue"))
        expense = _to_float(item.get("expense"))
        profit = _to_float(item.get("profit"), revenue - expense)
        transactions = _to_int(item.get("transactions"))

        history.append(
            {
                "date": date,
                "revenue": revenue,
                "expense": expense,
                "profit": profit,
                "transactions": transactions,
            }
        )

    history.sort(key=lambda row: row["date"])

    if len(history) < 3:
        raise ValueError("Minimal butuh 3 data history KPI harian untuk forecast realtime.")

    recent = history[-7:] if len(history) >= 7 else history
    previous = history[-14:-7] if len(history) >= 14 else history[:-7]

    def avg(rows: list[dict[str, Any]], key: str) -> float:
        if not rows:
            return 0.0
        return sum(_to_float(row.get(key)) for row in rows) / len(rows)

    avg_revenue = avg(recent, "revenue")
    avg_expense = avg(recent, "expense")
    avg_profit = avg(recent, "profit")
    avg_transactions = avg(recent, "transactions")

    # Trend ringan dari recent vs previous. Dibatasi agar forecast tidak liar.
    trend_factor = 0.0

    if previous:
        prev_revenue = avg(previous, "revenue")

        if prev_revenue > 0:
            trend_factor = max(
                -0.1,
                min(0.1, (avg_revenue - prev_revenue) / prev_revenue),
            )

    last_date = history[-1]["date"]
    forecast: list[dict[str, Any]] = []

    for day in range(1, horizon_days + 1):
        factor = 1 + (trend_factor * day)
        target_date = last_date + timedelta(days=day)

        forecast.append(
            {
                "date": target_date.strftime("%Y-%m-%d"),
                "predicted_revenue": round(max(0.0, avg_revenue * factor), 2),
                "predicted_expense": round(max(0.0, avg_expense * factor), 2),
                "predicted_profit": round(max(0.0, avg_profit * factor), 2),
                "predicted_transactions": int(
                    round(max(0.0, avg_transactions * factor))
                ),
            }
        )

    return _json_safe(
        {
            "source": "fs_payload",
            "method": "trailing_average_with_light_trend",
            "horizon_days": horizon_days,
            "history_days": len(history),
            "history_summary": {
                "last_date": last_date.strftime("%Y-%m-%d"),
                "avg_revenue_recent": round(avg_revenue, 2),
                "avg_expense_recent": round(avg_expense, 2),
                "avg_profit_recent": round(avg_profit, 2),
                "avg_transactions_recent": round(avg_transactions, 2),
                "trend_factor": round(trend_factor, 4),
            },
            "forecast": forecast,
        }
    )