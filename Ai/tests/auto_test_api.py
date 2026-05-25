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


class TestResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0

    def pass_(self, message: str):
        self.passed += 1
        print(f"[PASS] {message}")

    def fail(self, message: str):
        self.failed += 1
        print(f"[FAIL] {message}")

    def summary(self):
        print("\n=== TEST SUMMARY ===")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")

        if self.failed > 0:
            print("Status: FAILED")
            sys.exit(1)

        print("Status: PASSED")


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


def get_test_product_codes(limit: int = 20) -> list[str]:
    products = load_products_featured()
    transactions = load_transactions()

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

        random_codes = (
            products["kode_barang"]
            .dropna()
            .astype(str)
            .sample(min(limit, len(products)), random_state=42)
            .tolist()
        )
        product_codes.extend(random_codes)

    unique_codes = []
    seen = set()

    for code in product_codes:
        code = str(code).strip()
        if code and code not in seen:
            seen.add(code)
            unique_codes.append(code)

    return unique_codes[:limit]


def test_health(base_url: str, result: TestResult):
    status, body = request_json("GET", base_url, "/health")

    if status == 200:
        result.pass_("GET /health returned 200")
    else:
        result.fail(f"GET /health returned {status}: {body}")
        return

    if isinstance(body, dict):
        result.pass_("GET /health returned JSON object")
    else:
        result.fail("GET /health did not return JSON object")
        return

    print(json.dumps(body, indent=2, ensure_ascii=False))


def test_metadata(base_url: str, result: TestResult):
    status, body = request_json("GET", base_url, "/metadata")

    if status == 200:
        result.pass_("GET /metadata returned 200")
    else:
        result.fail(f"GET /metadata returned {status}: {body}")
        return

    if isinstance(body, dict):
        result.pass_("GET /metadata returned JSON object")
    else:
        result.fail("GET /metadata did not return JSON object")


def test_predict_all(base_url: str, result: TestResult, limit: int):
    codes = get_test_product_codes(limit)

    if not codes:
        result.fail("No product codes found from dataset")
        return

    print(f"\nTesting /predict/all with {len(codes)} product codes...")

    for code in codes:
        payload = {"kode_barang": code}
        status, body = request_json("POST", base_url, "/predict/all", json=payload)

        if status != 200:
            result.fail(f"POST /predict/all kode_barang={code} returned {status}: {body}")
            continue

        if not isinstance(body, dict):
            result.fail(f"POST /predict/all kode_barang={code} did not return JSON object")
            continue

        required_keys = {"fast_moving", "low_stock", "profit"}
        missing = required_keys - set(body.keys())

        if missing:
            result.fail(f"POST /predict/all kode_barang={code} missing keys: {missing}")
            continue

        fast_pred = body.get("fast_moving", {}).get("prediction")
        stock_pred = body.get("low_stock", {}).get("prediction")
        profit_cat = body.get("profit", {}).get("profit_category")

        result.pass_(
            f"kode_barang={code} | fast={fast_pred} | stock={stock_pred} | profit={profit_cat}"
        )


def test_individual_prediction_endpoints(base_url: str, result: TestResult):
    codes = get_test_product_codes(1)

    if not codes:
        result.fail("No product code found for individual endpoint test")
        return

    code = codes[0]
    payload = {"kode_barang": code}

    endpoints = [
        "/predict/fast-moving",
        "/predict/low-stock",
        "/predict/profit",
    ]

    print(f"\nTesting individual prediction endpoints with kode_barang={code}...")

    for endpoint in endpoints:
        status, body = request_json("POST", base_url, endpoint, json=payload)

        if status == 200:
            result.pass_(f"POST {endpoint} returned 200")
        else:
            result.fail(f"POST {endpoint} returned {status}: {body}")


def test_recommendation_endpoints(base_url: str, result: TestResult):
    endpoints = [
        "/recommendations/top-products?limit=10",
        "/recommendations/high-profit?limit=10",
        "/recommendations/restock-priority?limit=10",
        "/insights/summary",
    ]

    print("\nTesting recommendation and insight endpoints...")

    for endpoint in endpoints:
        status, body = request_json("GET", base_url, endpoint)

        if status == 200:
            result.pass_(f"GET {endpoint} returned 200")
        else:
            result.fail(f"GET {endpoint} returned {status}: {body}")


def test_forecast_endpoint(base_url: str, result: TestResult):
    print("\nTesting forecast endpoint...")

    status, body = request_json("GET", base_url, "/forecast/daily-kpi")

    if status == 200:
        result.pass_("GET /forecast/daily-kpi returned 200")
    else:
        result.fail(f"GET /forecast/daily-kpi returned {status}: {body}")


def test_ocr_endpoint(base_url: str, result: TestResult, image_path: str | None):
    if not image_path:
        print("\n[SKIP] OCR test skipped. Use --ocr-image path\\to\\nota.jpg to enable it.")
        return

    path = Path(image_path)

    if not path.exists():
        result.fail(f"OCR image not found: {path}")
        return

    print(f"\nTesting OCR endpoint with image: {path}")

    content_type = "image/jpeg"
    if path.suffix.lower() == ".png":
        content_type = "image/png"
    elif path.suffix.lower() in {".webp"}:
        content_type = "image/webp"

    with path.open("rb") as file:
        files = {
            "file": (path.name, file, content_type)
        }
        status, body = request_json("POST", base_url, "/ocr/scan-receipt", files=files, timeout=120)

    if status == 200:
        result.pass_("POST /ocr/scan-receipt returned 200")
        print(json.dumps(body, indent=2, ensure_ascii=False))
    else:
        result.fail(f"POST /ocr/scan-receipt returned {status}: {body}")


def main():
    parser = argparse.ArgumentParser(description="Automated test for Tata-Arta AI API")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--ocr-image", default=None)

    args = parser.parse_args()

    result = TestResult()

    print("=== Tata-Arta AI API Automated Test ===")
    print(f"Base URL: {args.base_url}")

    test_health(args.base_url, result)
    test_metadata(args.base_url, result)
    test_predict_all(args.base_url, result, args.limit)
    test_individual_prediction_endpoints(args.base_url, result)
    test_recommendation_endpoints(args.base_url, result)
    test_forecast_endpoint(args.base_url, result)
    test_ocr_endpoint(args.base_url, result, args.ocr_image)

    result.summary()


if __name__ == "__main__":
    main()