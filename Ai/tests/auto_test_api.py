from __future__ import annotations

import argparse
import json
import os
import random
import sys
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

import requests

from src.data_loader import load_products_featured, load_transactions


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


def request_json(
    method: str,
    base_url: str,
    path: str,
    *,
    timeout: int = 60,
    **kwargs,
) -> tuple[int, dict[str, Any] | list[Any] | str]:
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


def print_json(body: Any):
    try:
        print(json.dumps(body, indent=2, ensure_ascii=False))
    except Exception:
        print(body)


def assert_dict(result: TestResult, body: Any, label: str) -> bool:
    if isinstance(body, dict):
        result.pass_(f"{label} returned JSON object")
        return True

    result.fail(f"{label} did not return JSON object: {body}")
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
    products = load_products_featured()

    if "kode_barang" in products.columns:
        products["kode_barang"] = products["kode_barang"].astype(str)

    if "nama" in products.columns:
        products["nama"] = products["nama"].astype(str)

    return products


def get_transactions_df():
    transactions = load_transactions()

    if "kode_barang" in transactions.columns:
        transactions["kode_barang"] = transactions["kode_barang"].astype(str)

    return transactions


def get_test_product_codes(limit: int = 20) -> list[str]:
    products = get_products_df()
    transactions = get_transactions_df()

    product_codes: list[str] = []

    if {"kode_barang", "qty"}.issubset(transactions.columns):
        top_codes = (
            transactions.groupby("kode_barang")["qty"]
            .sum()
            .sort_values(ascending=False)
            .head(limit)
            .index
            .astype(str)
            .tolist()
        )
        product_codes.extend(top_codes)

    if "kode_barang" in products.columns:
        first_codes = (
            products["kode_barang"]
            .dropna()
            .astype(str)
            .head(limit)
            .tolist()
        )
        product_codes.extend(first_codes)

        sample_size = min(limit, len(products))
        random_codes = (
            products["kode_barang"]
            .dropna()
            .astype(str)
            .sample(sample_size, random_state=42)
            .tolist()
        )
        product_codes.extend(random_codes)

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


def get_keyword_queries() -> list[str]:
    return [
        "beras",
        "aqua",
        "indomie",
        "susu",
        "minyak",
    ]


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

    if status == 200:
        result.pass_("GET /health returned 200")
    else:
        result.fail(f"GET /health returned {status}: {body}")
        return

    if not assert_dict(result, body, "GET /health"):
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

    if status == 200:
        result.pass_("GET /metadata returned 200")
    else:
        result.fail(f"GET /metadata returned {status}: {body}")
        return

    assert_dict(result, body, "GET /metadata")


def test_product_search(base_url: str, result: TestResult):
    print("\n=== Testing product search ===")

    for query in get_keyword_queries():
        status, body = request_json(
            "GET",
            base_url,
            f"/products/search?q={query}&limit=10",
        )

        label = f"GET /products/search?q={query}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_dict(result, body, label):
            continue

        items = body.get("items")

        if isinstance(items, list):
            result.pass_(f"{label} returned items list")
        else:
            result.fail(f"{label} items is not list: {body}")
            continue

        if len(items) > 0:
            first = items[0]
            result.pass_(
                f"{label} first match: {first.get('kode_barang')} | {first.get('nama')}"
            )
        else:
            result.skip(f"{label} returned empty result")


def test_predict_all_by_code(base_url: str, result: TestResult, limit: int):
    print("\n=== Testing /predict/all by kode_barang ===")

    codes = get_test_product_codes(limit)

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

        if not assert_dict(result, body, label):
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

    names = get_test_product_names(min(limit, 10))

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

        if not assert_dict(result, body, label):
            continue

        if not validate_predict_all_body(body, result, label):
            continue

        matched = body["matched_product"]
        match_type = matched.get("match_type")

        if match_type in {"name_exact", "name_contains", "name_fuzzy", "kode_barang_exact"}:
            result.pass_(
                f"{label} | match_type={match_type} | matched={matched.get('nama')}"
            )
        else:
            result.fail(f"{label} invalid match_type: {matched}")


def test_predict_all_by_keyword_name(base_url: str, result: TestResult):
    print("\n=== Testing /predict/all by keyword nama_barang ===")

    for keyword in get_keyword_queries():
        payload = {"nama_barang": keyword}
        status, body = request_json("POST", base_url, "/predict/all", json=payload)

        label = f"POST /predict/all keyword nama_barang={keyword}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_dict(result, body, label):
            continue

        if not validate_predict_all_body(body, result, label):
            continue

        matched = body["matched_product"]

        result.pass_(
            f"{label} | matched={matched.get('kode_barang')} | {matched.get('nama')}"
        )


def test_individual_prediction_endpoints(base_url: str, result: TestResult):
    print("\n=== Testing individual prediction endpoints ===")

    codes = get_test_product_codes(1)
    names = get_test_product_names(1)

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

            if not assert_dict(result, body, label):
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

    if not assert_dict(result, body, label):
        return

    if validate_predict_all_body(body, result, label):
        result.pass_(f"{label} handled correctly")


def test_recommendation_endpoints(base_url: str, result: TestResult):
    print("\n=== Testing recommendation and insight endpoints ===")

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

        if isinstance(body, (dict, list)):
            result.pass_(f"{label} returned 200 and JSON")
        else:
            result.fail(f"{label} did not return JSON: {body}")


def test_forecast_endpoint(base_url: str, result: TestResult):
    print("\n=== Testing forecast endpoint ===")

    status, body = request_json("GET", base_url, "/forecast/daily-kpi")

    label = "GET /forecast/daily-kpi"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if isinstance(body, (dict, list)):
        result.pass_(f"{label} returned 200 and JSON")
    else:
        result.fail(f"{label} did not return JSON: {body}")


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
        files = {
            "file": (path.name, file, content_type),
        }
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

    if not assert_dict(result, body, label):
        return

    if "items" not in body:
        result.fail(f"{label} missing items: {body}")
        return

    result.pass_(f"{label} returned OCR result")
    print_json(body)


def main():
    parser = argparse.ArgumentParser(description="Full automated test for Tata-Arta AI API")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--ocr-image", default=None)
    parser.add_argument("--require-ocr", action="store_true")
    parser.add_argument("--skip-local-files", action="store_true")

    args = parser.parse_args()

    result = TestResult()

    print("=== Tata-Arta AI API Full Automated Test ===")
    print(f"Project root: {PROJECT_ROOT}")
    print(f"Base URL    : {args.base_url}")
    print(f"Limit       : {args.limit}")

    if not args.skip_local_files:
        test_model_files(result)

    test_health(args.base_url, result)
    test_metadata(args.base_url, result)
    test_product_search(args.base_url, result)

    test_predict_all_by_code(args.base_url, result, args.limit)
    test_predict_all_by_exact_name(args.base_url, result, args.limit)
    test_predict_all_by_keyword_name(args.base_url, result)

    test_individual_prediction_endpoints(args.base_url, result)

    test_invalid_product(args.base_url, result)
    test_swagger_placeholder_payload(args.base_url, result)

    test_recommendation_endpoints(args.base_url, result)
    test_forecast_endpoint(args.base_url, result)

    test_ocr_endpoint(
        args.base_url,
        result,
        image_path=args.ocr_image,
        require_ocr=args.require_ocr,
    )

    result.summary()


if __name__ == "__main__":
    main()