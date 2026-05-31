from __future__ import annotations

import argparse
import json
import os
import random
import sys
from pathlib import Path
from typing import Any

import requests


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from src.data_loader import load_products_featured, load_transactions
except Exception as exc:
    load_products_featured = None
    load_transactions = None
    DATA_LOADER_IMPORT_ERROR = exc
else:
    DATA_LOADER_IMPORT_ERROR = None


DEFAULT_BASE_URL = os.getenv("AI_API_URL", "http://localhost:8000")


REQUIRED_MODEL_FILES = [
    "models/fast_moving_model.keras",
    "models/fast_moving_preprocessor.joblib",
    "models/fast_moving_model.training_summary.json",
    "models/low_stock_model.keras",
    "models/low_stock_preprocessor.joblib",
    "models/low_stock_model.training_summary.json",
    "models/profit_model.keras",
    "models/profit_preprocessor.joblib",
    "models/profit_model.training_summary.json",
]


KEYWORD_QUERIES = [
    "beras",
    "aqua",
    "indomie",
    "susu",
    "minyak",
]


class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0

    def pass_(self, message: str):
        self.passed += 1
        print(f"[PASS] {message}")

    def fail(self, message: str):
        self.failed += 1
        print(f"[FAIL] {message}")

    def skip(self, message: str):
        self.skipped += 1
        print(f"[SKIP] {message}")

    def summary(self):
        print("\n=== TEST SUMMARY ===")
        print(f"Passed : {self.passed}")
        print(f"Failed : {self.failed}")
        print(f"Skipped: {self.skipped}")

        if self.failed > 0:
            print("Status : FAILED")
            sys.exit(1)

        print("Status : PASSED")


def print_json(body: Any):
    try:
        print(json.dumps(body, indent=2, ensure_ascii=False))
    except Exception:
        print(body)


def request_json(
    method: str,
    base_url: str,
    path: str,
    *,
    timeout: int = 90,
    **kwargs,
) -> tuple[int, Any]:
    url = f"{base_url.rstrip('/')}{path}"

    response = requests.request(
        method=method,
        url=url,
        timeout=timeout,
        **kwargs,
    )

    try:
        body = response.json()
    except Exception:
        body = response.text

    return response.status_code, body


def assert_json_object(result: TestResult, body: Any, label: str) -> bool:
    if isinstance(body, dict):
        result.pass_(f"{label} returned JSON object")
        return True

    result.fail(f"{label} did not return JSON object: {body}")
    return False


def assert_json_object_or_list(result: TestResult, body: Any, label: str) -> bool:
    if isinstance(body, (dict, list)):
        result.pass_(f"{label} returned JSON")
        return True

    result.fail(f"{label} did not return JSON: {body}")
    return False


def test_model_files(result: TestResult):
    print("\n=== Checking local model files ===")

    for rel_path in REQUIRED_MODEL_FILES:
        path = PROJECT_ROOT / rel_path

        if path.exists():
            result.pass_(f"Model artifact exists: {rel_path}")
        else:
            result.fail(f"Missing model artifact: {rel_path}")


def get_products_df():
    if load_products_featured is None:
        raise RuntimeError(f"Cannot import load_products_featured: {DATA_LOADER_IMPORT_ERROR}")

    products = load_products_featured()

    if "kode_barang" in products.columns:
        products["kode_barang"] = products["kode_barang"].astype(str)

    if "nama" in products.columns:
        products["nama"] = products["nama"].astype(str)

    return products


def get_transactions_df():
    if load_transactions is None:
        raise RuntimeError(f"Cannot import load_transactions: {DATA_LOADER_IMPORT_ERROR}")

    transactions = load_transactions()

    if "kode_barang" in transactions.columns:
        transactions["kode_barang"] = transactions["kode_barang"].astype(str)

    return transactions


def get_test_product_codes(limit: int = 20) -> list[str]:
    products = get_products_df()
    product_codes: list[str] = []

    try:
        transactions = get_transactions_df()

        if {"kode_barang", "qty"}.issubset(transactions.columns):
            top_codes = (
                transactions.groupby("kode_barang")["qty"]
                .sum()
                .sort_values(ascending=False)
                .head(limit)
                .index.astype(str)
                .tolist()
            )
            product_codes.extend(top_codes)
    except Exception:
        pass

    if "kode_barang" in products.columns:
        product_codes.extend(
            products["kode_barang"]
            .dropna()
            .astype(str)
            .head(limit)
            .tolist()
        )

        sample_size = min(limit, len(products))

        if sample_size > 0:
            product_codes.extend(
                products["kode_barang"]
                .dropna()
                .astype(str)
                .sample(sample_size, random_state=42)
                .tolist()
            )

    unique_codes = []
    seen = set()

    for code in product_codes:
        code = str(code).strip()

        if code and code.lower() not in {"nan", "none", "null", "string"} and code not in seen:
            seen.add(code)
            unique_codes.append(code)

    return unique_codes[:limit]


def get_test_product_names(limit: int = 10) -> list[str]:
    products = get_products_df()

    if "nama" not in products.columns:
        return []

    names = (
        products["nama"]
        .dropna()
        .astype(str)
        .head(limit)
        .tolist()
    )

    cleaned = []
    seen = set()

    for name in names:
        name = name.strip()

        if name and name.lower() not in {"nan", "none", "null", "string"} and name not in seen:
            seen.add(name)
            cleaned.append(name)

    return cleaned[:limit]


def sample_realtime_products() -> list[dict[str, Any]]:
    return [
        {
            "kode_barang": "R1284",
            "nama_barang": "REJOICE SHP 200ML COMPLETE",
            "kategori": "PERAWATAN",
            "sub_kategori": "SHAMPOO",
            "supplier": "SUPPLIER A",
            "hpp": 12000,
            "harga_toko_1": 15000,
            "total_stock": 8,
            "stok_min": 10,
            "stok_max": 100,
            "trx_total_qty": 120,
            "trx_qty_30d": 45,
            "trx_qty_60d": 70,
            "trx_qty_90d": 100,
            "trx_count": 35,
            "trx_total_revenue": 1800000,
            "trx_total_profit": 300000,
            "profit_percent": 20,
        },
        {
            "kode_barang": "B4533",
            "nama_barang": "BERAS MERAH 2KG",
            "kategori": "SEMBAKO",
            "sub_kategori": "BERAS",
            "supplier": "SUPPLIER B",
            "hpp": 25000,
            "harga_toko_1": 30000,
            "total_stock": 2,
            "stok_min": 12,
            "stok_max": 80,
            "trx_total_qty": 90,
            "trx_qty_30d": 35,
            "trx_qty_60d": 55,
            "trx_qty_90d": 80,
            "trx_count": 22,
            "trx_total_revenue": 2700000,
            "trx_total_profit": 450000,
            "profit_percent": 16.67,
        },
        {
            "kode_barang": "K001",
            "nama_barang": "KOPI ABC 20GR",
            "kategori": "MINUMAN",
            "sub_kategori": "KOPI",
            "supplier": "SUPPLIER C",
            "hpp": 1500,
            "harga_toko_1": 2500,
            "total_stock": 40,
            "stok_min": 10,
            "stok_max": 100,
            "trx_total_qty": 40,
            "trx_qty_30d": 10,
            "trx_qty_60d": 18,
            "trx_qty_90d": 25,
            "trx_count": 8,
            "trx_total_revenue": 100000,
            "trx_total_profit": 40000,
            "profit_percent": 40,
        },
        {
            "kode_barang": "M001",
            "nama_barang": "MINYAK GORENG 2L",
            "kategori": "SEMBAKO",
            "sub_kategori": "MINYAK",
            "supplier": "SUPPLIER D",
            "hpp": 26000,
            "harga_toko_1": 32000,
            "total_stock": 0,
            "stok_min": 15,
            "stok_max": 120,
            "trx_total_qty": 150,
            "trx_qty_30d": 50,
            "trx_qty_60d": 100,
            "trx_qty_90d": 145,
            "trx_count": 50,
            "trx_total_revenue": 4800000,
            "trx_total_profit": 900000,
            "profit_percent": 18.75,
        },
    ]


def sample_forecast_payload() -> dict[str, Any]:
    return {
        "horizon_days": 7,
        "history": [
            {"date": "2026-05-20", "revenue": 1100000, "expense": 700000, "profit": 400000, "transactions": 28},
            {"date": "2026-05-21", "revenue": 1250000, "expense": 780000, "profit": 470000, "transactions": 33},
            {"date": "2026-05-22", "revenue": 1180000, "expense": 760000, "profit": 420000, "transactions": 31},
            {"date": "2026-05-23", "revenue": 1400000, "expense": 850000, "profit": 550000, "transactions": 38},
            {"date": "2026-05-24", "revenue": 1500000, "expense": 920000, "profit": 580000, "transactions": 42},
            {"date": "2026-05-25", "revenue": 1600000, "expense": 950000, "profit": 650000, "transactions": 45},
            {"date": "2026-05-26", "revenue": 1550000, "expense": 940000, "profit": 610000, "transactions": 44},
        ],
    }


def sample_insight_payload() -> dict[str, Any]:
    return {
        "today": {
            "date": "2026-05-26",
            "revenue": 1550000,
            "expense": 940000,
            "profit": 610000,
            "transactions": 44,
        },
        "previous_period": {
            "avg_revenue": 1300000,
            "avg_expense": 820000,
            "avg_profit": 480000,
            "avg_transactions": 35,
        },
        "stock": {
            "total_products": 4,
            "low_stock_products": 3,
            "out_of_stock_products": 1,
        },
        "products": sample_realtime_products(),
    }


def validate_predict_all_body(body: dict[str, Any], result: TestResult, label: str) -> bool:
    required_keys = {"matched_product", "fast_moving", "low_stock", "profit"}
    missing = required_keys - set(body.keys())

    if missing:
        result.fail(f"{label} missing keys: {missing}")
        return False

    matched = body.get("matched_product")

    if not isinstance(matched, dict):
        result.fail(f"{label} matched_product is not object")
        return False

    if not matched.get("nama"):
        result.fail(f"{label} matched_product.nama is empty")
        return False

    fast = body.get("fast_moving", {})
    stock = body.get("low_stock", {})
    profit = body.get("profit", {})

    if fast.get("prediction") not in {"Slow Moving", "Normal", "Fast Moving"}:
        result.fail(f"{label} invalid fast_moving prediction: {fast}")
        return False

    if stock.get("prediction") not in {"Stock Safe", "Restock Priority"}:
        result.fail(f"{label} invalid low_stock prediction: {stock}")
        return False

    if profit.get("profit_category") not in {"Low Profit", "Medium Profit", "High Profit"}:
        result.fail(f"{label} invalid profit category: {profit}")
        return False

    return True


def test_health(base_url: str, result: TestResult):
    print("\n=== Testing health ===")

    status, body = request_json("GET", base_url, "/health")
    label = "GET /health"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    result.pass_(f"{label} returned 200")

    if not assert_json_object(result, body, label):
        return

    print_json(body)

    models = body.get("models", {})

    for key in ["fast_moving", "low_stock", "profit"]:
        if models.get(key) is True:
            result.pass_(f"/health model {key}=true")
        else:
            result.fail(f"/health model {key} is not true: {models}")


def test_metadata(base_url: str, result: TestResult):
    print("\n=== Testing metadata ===")

    status, body = request_json("GET", base_url, "/metadata")
    label = "GET /metadata"

    if status == 200:
        result.pass_(f"{label} returned 200")
        assert_json_object(result, body, label)
    else:
        result.fail(f"{label} returned {status}: {body}")


def test_product_search_get(base_url: str, result: TestResult):
    print("\n=== Testing GET /products/search with internal/DS data ===")

    for query in KEYWORD_QUERIES:
        status, body = request_json(
            "GET",
            base_url,
            "/products/search",
            params={"q": query, "limit": 10},
        )

        label = f"GET /products/search?q={query}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_json_object(result, body, label):
            continue

        items = body.get("items")

        if not isinstance(items, list):
            result.fail(f"{label} items is not list: {body}")
            continue

        result.pass_(f"{label} returned items list")

        if items:
            first = items[0]
            result.pass_(f"{label} first match: {first.get('kode_barang')} | {first.get('nama') or first.get('nama_barang')}")
        else:
            result.skip(f"{label} returned empty result")


def test_predict_all_by_code(base_url: str, result: TestResult, limit: int):
    print("\n=== Testing /predict/all by kode_barang ===")

    try:
        codes = get_test_product_codes(limit)
    except Exception as exc:
        result.fail(f"Cannot load product codes from dataset: {exc}")
        return

    if not codes:
        result.fail("No product codes found from dataset")
        return

    for code in codes:
        payload = {"kode_barang": code}
        status, body = request_json("POST", base_url, "/predict/all", json=payload)
        label = f"POST /predict/all kode_barang={code}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_json_object(result, body, label):
            continue

        if not validate_predict_all_body(body, result, label):
            continue

        matched = body["matched_product"]

        result.pass_(
            f"{label} | matched={matched.get('nama')} | "
            f"fast={body['fast_moving'].get('prediction')} | "
            f"stock={body['low_stock'].get('prediction')} | "
            f"profit={body['profit'].get('profit_category')}"
        )


def test_predict_all_by_exact_name(base_url: str, result: TestResult, limit: int):
    print("\n=== Testing /predict/all by exact nama_barang ===")

    try:
        names = get_test_product_names(min(limit, 10))
    except Exception as exc:
        result.fail(f"Cannot load product names from dataset: {exc}")
        return

    if not names:
        result.fail("No product names found from dataset")
        return

    for name in names:
        payload = {"nama_barang": name}
        status, body = request_json("POST", base_url, "/predict/all", json=payload)
        label = f"POST /predict/all nama_barang={name}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_json_object(result, body, label):
            continue

        if not validate_predict_all_body(body, result, label):
            continue

        matched = body["matched_product"]
        match_type = matched.get("match_type")

        if match_type in {"name_exact", "name_contains", "name_fuzzy", "kode_barang_exact"}:
            result.pass_(f"{label} | match_type={match_type} | matched={matched.get('nama')}")
        else:
            result.fail(f"{label} invalid match_type: {matched}")


def test_predict_all_by_keyword_name(base_url: str, result: TestResult):
    print("\n=== Testing /predict/all by keyword nama_barang ===")

    for keyword in KEYWORD_QUERIES:
        payload = {"nama_barang": keyword}
        status, body = request_json("POST", base_url, "/predict/all", json=payload)
        label = f"POST /predict/all keyword nama_barang={keyword}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_json_object(result, body, label):
            continue

        if not validate_predict_all_body(body, result, label):
            continue

        matched = body["matched_product"]
        result.pass_(f"{label} | matched={matched.get('kode_barang')} | {matched.get('nama')}")


def test_predict_all_manual_product(base_url: str, result: TestResult):
    print("\n=== Testing /predict/all with new/manual product features ===")

    payload = {
        "nama_barang": "PRODUK BARU TEST MANUAL",
        "kategori": "MINUMAN",
        "supplier": "SUPPLIER TEST",
        "hpp": 5000,
        "harga_toko_1": 7000,
        "stok_min": 10,
        "stok_max": 100,
        "total_stock": 40,
        "trx_total_qty": 15,
        "trx_qty_30d": 5,
        "trx_qty_60d": 10,
        "trx_qty_90d": 15,
        "trx_count": 5,
        "trx_total_revenue": 105000,
        "trx_total_profit": 30000,
    }

    status, body = request_json("POST", base_url, "/predict/all", json=payload)
    label = "POST /predict/all new/manual product"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_json_object(result, body, label):
        return

    if validate_predict_all_body(body, result, label):
        result.pass_(f"{label} handled correctly")


def test_individual_prediction_endpoints(base_url: str, result: TestResult):
    print("\n=== Testing individual prediction endpoints ===")

    try:
        codes = get_test_product_codes(1)
        names = get_test_product_names(1)
    except Exception as exc:
        result.fail(f"Cannot prepare product payloads: {exc}")
        return

    payloads: list[tuple[str, dict[str, Any]]] = []

    if codes:
        payloads.append((f"kode_barang={codes[0]}", {"kode_barang": codes[0]}))

    if names:
        payloads.append((f"nama_barang={names[0]}", {"nama_barang": names[0]}))

    if not payloads:
        result.fail("No product payload available for individual endpoint test")
        return

    endpoints = [
        "/predict/fast-moving",
        "/predict/low-stock",
        "/predict/profit",
    ]

    for payload_label, payload in payloads:
        for endpoint in endpoints:
            status, body = request_json("POST", base_url, endpoint, json=payload)
            label = f"POST {endpoint} with {payload_label}"

            if status != 200:
                result.fail(f"{label} returned {status}: {body}")
                continue

            if not assert_json_object(result, body, label):
                continue

            if "matched_product" in body:
                result.pass_(f"{label} returned matched_product")
            else:
                result.fail(f"{label} missing matched_product")


def test_invalid_product(base_url: str, result: TestResult):
    print("\n=== Testing invalid product handling ===")

    payload = {"nama_barang": "PRODUK_INI_TIDAK_MUNGKIN_ADA_999999"}
    status, body = request_json("POST", base_url, "/predict/all", json=payload)

    if status in {400, 404}:
        result.pass_(f"Invalid product returned proper error {status}")
        print_json(body)
    else:
        result.fail(f"Invalid product should return 400/404, got {status}: {body}")


def test_swagger_placeholder_payload(base_url: str, result: TestResult):
    print("\n=== Testing Swagger placeholder cleanup ===")

    payload = {
        "kode_barang": "string",
        "nama_barang": "beras",
        "hpp": "string",
        "harga_toko_1": "string",
        "trx_total_qty": "string",
    }

    status, body = request_json("POST", base_url, "/predict/all", json=payload)
    label = "POST /predict/all with Swagger placeholder payload"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_json_object(result, body, label):
        return

    if validate_predict_all_body(body, result, label):
        result.pass_(f"{label} handled correctly")


def test_recommendation_get_endpoints(base_url: str, result: TestResult):
    print("\n=== Testing GET recommendation and insight endpoints with internal/DS data ===")

    endpoints = [
        "/recommendations/top-products?limit=10",
        "/recommendations/high-profit?limit=10",
        "/recommendations/restock-priority?limit=10",
        "/insights/summary",
    ]

    for endpoint in endpoints:
        status, body = request_json("GET", base_url, endpoint)
        label = f"GET {endpoint}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        assert_json_object_or_list(result, body, label)


def test_forecast_get_endpoint(base_url: str, result: TestResult):
    print("\n=== Testing GET forecast endpoint with internal/DS data ===")

    status, body = request_json("GET", base_url, "/forecast/daily-kpi")
    label = "GET /forecast/daily-kpi"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    assert_json_object_or_list(result, body, label)


def validate_forecast_realtime_body(body: dict[str, Any], result: TestResult, label: str) -> bool:
    required_keys = {"source", "horizon_days", "summary", "forecast"}

    missing = required_keys - set(body.keys())

    if missing:
        result.fail(f"{label} missing keys: {missing}")
        return False

    if body.get("source") != "request_payload_from_fs_database":
        result.fail(f"{label} invalid source: {body.get('source')}")
        return False

    forecast = body.get("forecast")

    if not isinstance(forecast, list) or not forecast:
        result.fail(f"{label} forecast should be non-empty list")
        return False

    first = forecast[0]

    for key in ["date", "predicted_revenue", "predicted_profit", "predicted_transactions"]:
        if key not in first:
            result.fail(f"{label} forecast item missing {key}: {first}")
            return False

    return True


def validate_insight_realtime_body(body: dict[str, Any], result: TestResult, label: str) -> bool:
    required_keys = {"source", "summary", "insights"}

    missing = required_keys - set(body.keys())

    if missing:
        result.fail(f"{label} missing keys: {missing}")
        return False

    if body.get("source") != "request_payload_from_fs_database":
        result.fail(f"{label} invalid source: {body.get('source')}")
        return False

    if not isinstance(body.get("insights"), list):
        result.fail(f"{label} insights should be list")
        return False

    return True


def test_realtime_forecast_post(base_url: str, result: TestResult, require_realtime: bool):
    print("\n=== Testing POST /forecast/daily-kpi with real FS payload ===")

    payload = sample_forecast_payload()
    status, body = request_json("POST", base_url, "/forecast/daily-kpi", json=payload)
    label = "POST /forecast/daily-kpi"

    if status == 405 and not require_realtime:
        result.skip(f"{label} not available. Install realtime patch to enable it.")
        return

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_json_object(result, body, label):
        return

    if validate_forecast_realtime_body(body, result, label):
        result.pass_(f"{label} realtime forecast handled correctly")


def test_realtime_insight_post(base_url: str, result: TestResult, require_realtime: bool):
    print("\n=== Testing POST /insights/summary with real FS payload ===")

    payload = sample_insight_payload()
    status, body = request_json("POST", base_url, "/insights/summary", json=payload)
    label = "POST /insights/summary"

    if status == 405 and not require_realtime:
        result.skip(f"{label} not available. Install realtime patch to enable it.")
        return

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_json_object(result, body, label):
        return

    if validate_insight_realtime_body(body, result, label):
        result.pass_(f"{label} realtime insight handled correctly")


def test_realtime_products_search_post(base_url: str, result: TestResult, require_realtime: bool):
    print("\n=== Testing POST /products/search with real FS product list ===")

    payload = {
        "q": "beras",
        "limit": 10,
        "products": sample_realtime_products(),
    }

    status, body = request_json("POST", base_url, "/products/search", json=payload)
    label = "POST /products/search"

    if status == 405 and not require_realtime:
        result.skip(f"{label} not available. Install realtime patch to enable it.")
        return

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_json_object(result, body, label):
        return

    items = body.get("items")

    if not isinstance(items, list):
        result.fail(f"{label} items should be list: {body}")
        return

    result.pass_(f"{label} returned realtime product search items")


def test_realtime_recommendation_posts(base_url: str, result: TestResult, require_realtime: bool):
    print("\n=== Testing POST realtime recommendation endpoints ===")

    endpoints = [
        "/recommendations/top-products",
        "/recommendations/high-profit",
        "/recommendations/restock-priority",
    ]

    payload = {
        "limit": 10,
        "products": sample_realtime_products(),
    }

    for endpoint in endpoints:
        status, body = request_json("POST", base_url, endpoint, json=payload)
        label = f"POST {endpoint}"

        if status == 405 and not require_realtime:
            result.skip(f"{label} not available. Install realtime patch to enable it.")
            continue

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_json_object(result, body, label):
            continue

        if body.get("source") != "request_payload_from_fs_database":
            result.fail(f"{label} invalid source: {body}")
            continue

        if not isinstance(body.get("items"), list):
            result.fail(f"{label} items should be list: {body}")
            continue

        result.pass_(f"{label} realtime recommendation handled correctly")


def test_ocr_endpoint(
    base_url: str,
    result: TestResult,
    image_path: str | None,
    require_ocr: bool = False,
):
    print("\n=== Testing OCR endpoint ===")

    if not image_path:
        message = "OCR test skipped. Use --ocr-image path\\to\\nota.jpg to enable it."

        if require_ocr:
            result.fail(message)
        else:
            result.skip(message)

        return

    path = Path(image_path)

    if not path.exists():
        result.fail(f"OCR image not found: {path}")
        return

    content_type = "image/jpeg"

    if path.suffix.lower() == ".png":
        content_type = "image/png"
    elif path.suffix.lower() == ".webp":
        content_type = "image/webp"

    with path.open("rb") as file:
        files = {"file": (path.name, file, content_type)}
        status, body = request_json(
            "POST",
            base_url,
            "/ocr/scan-receipt",
            files=files,
            timeout=180,
        )

    label = "POST /ocr/scan-receipt"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_json_object(result, body, label):
        return

    if "items" not in body:
        result.fail(f"{label} missing items: {body}")
        return

    result.pass_(f"{label} returned OCR result")
    print_json(body)


def main():
    parser = argparse.ArgumentParser(description="Complete automated test for Tata-Arta AI API")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--ocr-image", default=None)
    parser.add_argument("--require-ocr", action="store_true")
    parser.add_argument("--require-realtime", action="store_true")
    parser.add_argument("--skip-local-files", action="store_true")
    parser.add_argument("--skip-dataset-tests", action="store_true")
    parser.add_argument("--skip-realtime-tests", action="store_true")

    args = parser.parse_args()
    result = TestResult()

    print("=== Tata-Arta AI API Complete Automated Test ===")
    print(f"Project root      : {PROJECT_ROOT}")
    print(f"Base URL          : {args.base_url}")
    print(f"Limit             : {args.limit}")
    print(f"Require realtime  : {args.require_realtime}")
    print(f"Require OCR       : {args.require_ocr}")

    if not args.skip_local_files:
        test_model_files(result)

    test_health(args.base_url, result)
    test_metadata(args.base_url, result)

    if not args.skip_dataset_tests:
        test_product_search_get(args.base_url, result)
        test_predict_all_by_code(args.base_url, result, args.limit)
        test_predict_all_by_exact_name(args.base_url, result, args.limit)
        test_predict_all_by_keyword_name(args.base_url, result)
        test_predict_all_manual_product(args.base_url, result)
        test_individual_prediction_endpoints(args.base_url, result)
        test_invalid_product(args.base_url, result)
        test_swagger_placeholder_payload(args.base_url, result)
        test_recommendation_get_endpoints(args.base_url, result)
        test_forecast_get_endpoint(args.base_url, result)

    if not args.skip_realtime_tests:
        test_realtime_forecast_post(args.base_url, result, args.require_realtime)
        test_realtime_insight_post(args.base_url, result, args.require_realtime)
        test_realtime_products_search_post(args.base_url, result, args.require_realtime)
        test_realtime_recommendation_posts(args.base_url, result, args.require_realtime)

    test_ocr_endpoint(args.base_url, result, args.ocr_image, args.require_ocr)

    result.summary()


if __name__ == "__main__":
    main()
