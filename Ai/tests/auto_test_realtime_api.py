from __future__ import annotations

import argparse
import os
import sys
from datetime import date, timedelta
from typing import Any

import requests


DEFAULT_BASE_URL = os.getenv("AI_API_URL", "http://localhost:8000")


PRODUCTS = [
    {
        "kode_barang": "FS001",
        "nama_barang": "KOPI ABC 20GR",
        "kategori": "MINUMAN",
        "supplier": "SUPPLIER TOKO A",
        "hpp": 1500,
        "harga_toko_1": 2000,
        "stok_min": 10,
        "stok_max": 100,
        "total_stock": 7,
        "trx_total_qty": 120,
        "trx_qty_30d": 45,
        "trx_qty_60d": 80,
        "trx_qty_90d": 120,
        "trx_count": 60,
        "trx_total_revenue": 240000,
        "trx_total_profit": 60000,
    },
    {
        "kode_barang": "FS002",
        "nama_barang": "BERAS PREMIUM 5KG",
        "kategori": "SEMBAKO",
        "supplier": "SUPPLIER TOKO A",
        "hpp": 58000,
        "harga_toko_1": 70000,
        "stok_min": 5,
        "stok_max": 40,
        "total_stock": 20,
        "trx_total_qty": 55,
        "trx_qty_30d": 18,
        "trx_qty_60d": 35,
        "trx_qty_90d": 55,
        "trx_count": 30,
        "trx_total_revenue": 3850000,
        "trx_total_profit": 660000,
    },
    {
        "kode_barang": "FS003",
        "nama_barang": "SUSU UHT COKLAT 250ML",
        "kategori": "MINUMAN",
        "supplier": "SUPPLIER TOKO B",
        "hpp": 3500,
        "harga_toko_1": 5000,
        "stok_min": 20,
        "stok_max": 150,
        "total_stock": 0,
        "trx_total_qty": 200,
        "trx_qty_30d": 75,
        "trx_qty_60d": 140,
        "trx_qty_90d": 200,
        "trx_count": 95,
        "trx_total_revenue": 1000000,
        "trx_total_profit": 300000,
    },
    {
        "kode_barang": "FS004",
        "nama_barang": "SABUN MANDI HERBAL",
        "kategori": "PERSONAL CARE",
        "supplier": "SUPPLIER TOKO C",
        "hpp": 4500,
        "harga_toko_1": 6500,
        "stok_min": 10,
        "stok_max": 80,
        "total_stock": 50,
        "trx_total_qty": 12,
        "trx_qty_30d": 3,
        "trx_qty_60d": 8,
        "trx_qty_90d": 12,
        "trx_count": 8,
        "trx_total_revenue": 78000,
        "trx_total_profit": 24000,
    },
]


def request_json(method: str, base_url: str, path: str, **kwargs: Any):
    response = requests.request(
        method,
        f"{base_url.rstrip('/')}{path}",
        timeout=60,
        **kwargs,
    )

    try:
        body = response.json()
    except Exception:
        body = response.text

    return response.status_code, body


def check(condition: bool, message: str) -> bool:
    if condition:
        print(f"[PASS] {message}")
        return True

    print(f"[FAIL] {message}")
    return False


def build_history(days: int = 14) -> list[dict[str, Any]]:
    today = date.today()
    rows = []

    for i in range(days, 0, -1):
        current = today - timedelta(days=i)
        revenue = 100000 + ((days - i) * 5000)
        expense = 70000 + ((days - i) * 3000)

        rows.append(
            {
                "date": current.isoformat(),
                "revenue": revenue,
                "expense": expense,
                "profit": revenue - expense,
                "transactions": 20 + (days - i),
            }
        )

    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Test realtime FS payload endpoints")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()

    failed = 0

    print("=== Tata-Arta AI Realtime Endpoint Test ===")
    print(f"Base URL: {args.base_url}")

    status, body = request_json("GET", args.base_url, "/health")
    failed += not check(
        status == 200 and body.get("realtime") is True,
        "GET /health realtime=true",
    )

    status, body = request_json(
        "POST",
        args.base_url,
        "/products/search",
        json={
            "q": "kopi",
            "limit": 10,
            "products": PRODUCTS,
        },
    )
    failed += not check(
        status == 200 and body.get("source") == "fs_payload",
        "POST /products/search uses fs_payload",
    )
    failed += not check(
        bool(body.get("items")),
        "POST /products/search returns items",
    )

    for endpoint in [
        "/recommendations/top-products",
        "/recommendations/high-profit",
        "/recommendations/restock-priority",
    ]:
        status, body = request_json(
            "POST",
            args.base_url,
            endpoint,
            json={
                "limit": 3,
                "products": PRODUCTS,
            },
        )

        failed += not check(
            status == 200 and body.get("source") == "fs_payload",
            f"POST {endpoint} uses fs_payload",
        )
        failed += not check(
            len(body.get("items", [])) > 0,
            f"POST {endpoint} returns items",
        )

    status, body = request_json(
        "POST",
        args.base_url,
        "/insights/summary",
        json={
            "today": {
                "date": date.today().isoformat(),
                "revenue": 250000,
                "expense": 170000,
                "profit": 80000,
                "transactions": 35,
            },
            "previous_period": {
                "avg_revenue": 200000,
                "avg_expense": 150000,
                "avg_profit": 50000,
                "avg_transactions": 25,
            },
            "stock": {
                "total_products": len(PRODUCTS),
                "low_stock_products": 2,
                "out_of_stock_products": 1,
            },
            "products": PRODUCTS,
        },
    )
    failed += not check(
        status == 200 and body.get("source") == "fs_payload",
        "POST /insights/summary uses fs_payload",
    )
    failed += not check(
        bool(body.get("insights")),
        "POST /insights/summary returns insights",
    )

    status, body = request_json(
        "POST",
        args.base_url,
        "/forecast/daily-kpi",
        json={
            "horizon_days": 7,
            "history": build_history(14),
        },
    )
    failed += not check(
        status == 200 and body.get("source") == "fs_payload",
        "POST /forecast/daily-kpi uses fs_payload",
    )
    failed += not check(
        len(body.get("forecast", [])) == 7,
        "POST /forecast/daily-kpi returns 7 days forecast",
    )

    status, body = request_json(
        "POST",
        args.base_url,
        "/predict/all",
        json=PRODUCTS[0],
    )
    failed += not check(
        status == 200,
        "POST /predict/all accepts FS product payload",
    )
    failed += not check(
        body.get("matched_product", {}).get("match_type") == "manual_features",
        "POST /predict/all uses manual_features for FS product",
    )

    print("\n=== SUMMARY ===")

    if failed:
        print(f"FAILED: {failed}")
        sys.exit(1)

    print("PASSED: all realtime endpoint tests")


if __name__ == "__main__":
    main()