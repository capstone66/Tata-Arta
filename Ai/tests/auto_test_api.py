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
except Exception:
    load_products_featured = None
    load_transactions = None


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

VALID_FAST_MOVING = {"Slow Moving", "Normal", "Fast Moving"}
VALID_LOW_STOCK = {"Stock Safe", "Restock Priority"}
VALID_PROFIT = {"Low Profit", "Medium Profit", "High Profit"}
VALID_MATCH_TYPES = {
    "kode_barang_exact",
    "name_exact",
    "name_contains",
    "name_fuzzy",
    "manual_features",
}

KEYWORD_QUERIES = [
    "beras",
    "aqua",
    "indomie",
    "susu",
    "minyak",
    "kopi",
]


class TestResult:
    def __init__(self) -> None:
        self.passed = 0
        self.failed = 0
        self.skipped = 0

    def pass_(self, message: str) -> None:
        self.passed += 1
        print(f"[PASS] {message}")

    def fail(self, message: str) -> None:
        self.failed += 1
        print(f"[FAIL] {message}")

    def skip(self, message: str) -> None:
        self.skipped += 1
        print(f"[SKIP] {message}")

    def summary(self) -> None:
        print("\n=== TEST SUMMARY ===")
        print(f"Passed : {self.passed}")
        print(f"Failed : {self.failed}")
        print(f"Skipped: {self.skipped}")

        if self.failed > 0:
            print("Status : FAILED")
            sys.exit(1)

        print("Status : PASSED")


def print_json(body: Any) -> None:
    try:
        print(json.dumps(body, indent=2, ensure_ascii=False))
    except Exception:
        print(body)


def request_json(
    method: str,
    base_url: str,
    path: str,
    *,
    timeout: int = 60,
    **kwargs: Any,
) -> tuple[int | None, dict[str, Any] | list[Any] | str]:
    url = f"{base_url.rstrip('/')}{path}"

    try:
        response = requests.request(
            method=method,
            url=url,
            timeout=timeout,
            **kwargs,
        )
    except requests.exceptions.RequestException as exc:
        return None, f"Request error: {exc}"

    try:
        body = response.json()
    except Exception:
        body = response.text

    return response.status_code, body


def assert_dict(result: TestResult, body: Any, label: str) -> bool:
    if isinstance(body, dict):
        result.pass_(f"{label} returned JSON object")
        return True

    result.fail(f"{label} did not return JSON object: {body}")
    return False


def assert_list_or_dict(result: TestResult, body: Any, label: str) -> bool:
    if isinstance(body, (dict, list)):
        result.pass_(f"{label} returned JSON")
        return True

    result.fail(f"{label} did not return JSON: {body}")
    return False


def test_model_files(result: TestResult) -> None:
    print("\n=== Checking local model files ===")

    for rel_path in REQUIRED_MODEL_FILES:
        path = PROJECT_ROOT / rel_path

        if path.exists():
            result.pass_(f"Model artifact exists: {rel_path}")
        else:
            result.fail(f"Missing model artifact: {rel_path}")


def get_products_df():
    if load_products_featured is None:
        return None

    try:
        products = load_products_featured()
    except Exception as exc:
        print(f"[WARN] Failed to load products dataset: {exc}")
        return None

    if "kode_barang" in products.columns:
        products["kode_barang"] = products["kode_barang"].astype(str)

    if "nama" in products.columns:
        products["nama"] = products["nama"].astype(str)

    return products


def get_transactions_df():
    if load_transactions is None:
        return None

    try:
        transactions = load_transactions()
    except Exception as exc:
        print(f"[WARN] Failed to load transactions dataset: {exc}")
        return None

    if "kode_barang" in transactions.columns:
        transactions["kode_barang"] = transactions["kode_barang"].astype(str)

    return transactions


def clean_text(value: Any) -> str:
    if value is None:
        return ""

    text = str(value).strip()

    if text.lower() in {"", "nan", "none", "null", "undefined", "string"}:
        return ""

    return text


def get_test_product_codes(limit: int = 20) -> list[str]:
    products = get_products_df()
    transactions = get_transactions_df()

    product_codes: list[str] = []

    if transactions is not None and {"kode_barang", "qty"}.issubset(transactions.columns):
        top_codes = (
            transactions.groupby("kode_barang")["qty"]
            .sum()
            .sort_values(ascending=False)
            .head(limit)
            .index.astype(str)
            .tolist()
        )
        product_codes.extend(top_codes)

    if products is not None and "kode_barang" in products.columns:
        first_codes = (
            products["kode_barang"]
            .dropna()
            .astype(str)
            .head(limit)
            .tolist()
        )
        product_codes.extend(first_codes)

        sample_size = min(limit, len(products))
        if sample_size > 0:
            random_codes = (
                products["kode_barang"]
                .dropna()
                .astype(str)
                .sample(sample_size, random_state=42)
                .tolist()
            )
            product_codes.extend(random_codes)

    unique_codes: list[str] = []
    seen: set[str] = set()

    for code in product_codes:
        code = clean_text(code)
        if code and code not in seen:
            seen.add(code)
            unique_codes.append(code)

    return unique_codes[:limit]


def get_test_product_names(limit: int = 10) -> list[str]:
    products = get_products_df()

    if products is None or "nama" not in products.columns:
        return []

    names = products["nama"].dropna().astype(str).head(limit * 2).tolist()

    cleaned: list[str] = []
    seen: set[str] = set()

    for name in names:
        name = clean_text(name)

        if name and name not in seen:
            seen.add(name)
            cleaned.append(name)

    return cleaned[:limit]


def get_sample_product_from_search(base_url: str) -> dict[str, Any] | None:
    for query in KEYWORD_QUERIES:
        status, body = request_json(
            "GET",
            base_url,
            "/products/search",
            params={"q": query, "limit": 1},
        )

        if status != 200 or not isinstance(body, dict):
            continue

        items = body.get("items")
        if isinstance(items, list) and items:
            first = items[0]
            if isinstance(first, dict):
                return first

    return None


def validate_predict_all_body(
    body: dict[str, Any],
    result: TestResult,
    label: str,
) -> bool:
    required_keys = {"matched_product", "fast_moving", "low_stock", "profit"}
    missing = required_keys - set(body.keys())

    if missing:
        result.fail(f"{label} missing keys: {sorted(missing)}")
        return False

    matched = body.get("matched_product")
    fast = body.get("fast_moving")
    stock = body.get("low_stock")
    profit = body.get("profit")

    if not isinstance(matched, dict):
        result.fail(f"{label} matched_product is not object: {matched}")
        return False

    if not isinstance(fast, dict):
        result.fail(f"{label} fast_moving is not object: {fast}")
        return False

    if not isinstance(stock, dict):
        result.fail(f"{label} low_stock is not object: {stock}")
        return False

    if not isinstance(profit, dict):
        result.fail(f"{label} profit is not object: {profit}")
        return False

    match_type = matched.get("match_type")
    if match_type not in VALID_MATCH_TYPES:
        result.fail(f"{label} invalid match_type: {matched}")
        return False

    if fast.get("prediction") not in VALID_FAST_MOVING:
        result.fail(f"{label} invalid fast_moving prediction: {fast}")
        return False

    if stock.get("prediction") not in VALID_LOW_STOCK:
        result.fail(f"{label} invalid low_stock prediction: {stock}")
        return False

    if profit.get("profit_category") not in VALID_PROFIT:
        result.fail(f"{label} invalid profit category: {profit}")
        return False

    return True


def test_root(base_url: str, result: TestResult) -> None:
    print("\n=== Testing root ===")

    status, body = request_json("GET", base_url, "/")
    label = "GET /"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_dict(result, body, label):
        return

    result.pass_(f"{label} returned 200")
    print_json(body)


def test_health(base_url: str, result: TestResult) -> None:
    print("\n=== Testing health ===")

    status, body = request_json("GET", base_url, "/health")
    label = "GET /health"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    result.pass_(f"{label} returned 200")

    if not assert_dict(result, body, label):
        return

    print_json(body)

    models = body.get("models", {})
    if not isinstance(models, dict):
        result.fail("/health models is not object")
        return

    for key in ["fast_moving", "low_stock", "profit"]:
        if models.get(key) is True:
            result.pass_(f"/health model {key}=true")
        else:
            result.fail(f"/health model {key} is not true: {models}")


def test_metadata(base_url: str, result: TestResult) -> None:
    print("\n=== Testing metadata ===")

    status, body = request_json("GET", base_url, "/metadata")
    label = "GET /metadata"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    result.pass_(f"{label} returned 200")
    assert_dict(result, body, label)


def test_product_search(base_url: str, result: TestResult) -> None:
    print("\n=== Testing product search ===")

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

        if not assert_dict(result, body, label):
            continue

        items = body.get("items")

        if not isinstance(items, list):
            result.fail(f"{label} items is not list: {body}")
            continue

        result.pass_(f"{label} returned items list")

        if items:
            first = items[0]
            if isinstance(first, dict):
                result.pass_(
                    f"{label} first match: "
                    f"{first.get('kode_barang')} | {first.get('nama')}"
                )
            else:
                result.fail(f"{label} first item is not object: {first}")
        else:
            result.skip(f"{label} returned empty result")


def test_predict_all_by_code(base_url: str, result: TestResult, limit: int) -> None:
    print("\n=== Testing /predict/all by kode_barang ===")

    codes = get_test_product_codes(limit)

    if not codes:
        sample = get_sample_product_from_search(base_url)
        if sample and sample.get("kode_barang"):
            codes = [str(sample["kode_barang"])]

    if not codes:
        result.skip("No product codes found from dataset or API search")
        return

    for code in codes[:limit]:
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
            f"{label} | matched={matched.get('kode_barang')} - {matched.get('nama')} | "
            f"fast={body['fast_moving'].get('prediction')} | "
            f"stock={body['low_stock'].get('prediction')} | "
            f"profit={body['profit'].get('profit_category')}"
        )


def test_predict_all_by_exact_name(base_url: str, result: TestResult, limit: int) -> None:
    print("\n=== Testing /predict/all by exact nama_barang ===")

    names = get_test_product_names(min(limit, 10))

    if not names:
        sample = get_sample_product_from_search(base_url)
        if sample and sample.get("nama"):
            names = [str(sample["nama"])]

    if not names:
        result.skip("No product names found from dataset or API search")
        return

    for name in names[: min(limit, 10)]:
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
        result.pass_(
            f"{label} | match_type={matched.get('match_type')} | "
            f"matched={matched.get('kode_barang')} - {matched.get('nama')}"
        )


def test_predict_all_by_keyword_name(base_url: str, result: TestResult) -> None:
    print("\n=== Testing /predict/all by keyword nama_barang ===")

    for keyword in KEYWORD_QUERIES:
        payload = {"nama_barang": keyword}
        status, body = request_json("POST", base_url, "/predict/all", json=payload)
        label = f"POST /predict/all keyword nama_barang={keyword}"

        if status == 404:
            result.skip(f"{label} returned 404, keyword not found in dataset")
            continue

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        if not assert_dict(result, body, label):
            continue

        if not validate_predict_all_body(body, result, label):
            continue

        matched = body["matched_product"]
        result.pass_(
            f"{label} | matched={matched.get('kode_barang')} - {matched.get('nama')}"
        )


def test_manual_feature_prediction(base_url: str, result: TestResult) -> None:
    print("\n=== Testing /predict/all with manual product features ===")

    payload = {
        "nama_barang": "KOPI ABC TEST AUTO",
        "kategori": "MINUMAN",
        "supplier": "SUPPLIER TEST",
        "hpp": 1500,
        "harga_toko_1": 2000,
        "stok_min": 10,
        "stok_max": 100,
        "total_stock": 50,
        "trx_total_qty": 20,
        "trx_qty_30d": 8,
        "trx_qty_60d": 14,
        "trx_qty_90d": 20,
        "trx_count": 5,
        "trx_total_revenue": 40000,
        "trx_total_profit": 10000,
    }

    status, body = request_json("POST", base_url, "/predict/all", json=payload)
    label = "POST /predict/all with manual features"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_dict(result, body, label):
        return

    if not validate_predict_all_body(body, result, label):
        return

    match_type = body["matched_product"].get("match_type")
    if match_type == "manual_features":
        result.pass_(f"{label} used manual_features")
    else:
        result.pass_(f"{label} returned match_type={match_type}")


def test_individual_prediction_endpoints(base_url: str, result: TestResult) -> None:
    print("\n=== Testing individual prediction endpoints ===")

    payloads: list[tuple[str, dict[str, Any]]] = []

    codes = get_test_product_codes(1)
    names = get_test_product_names(1)

    if codes:
        payloads.append((f"kode_barang={codes[0]}", {"kode_barang": codes[0]}))

    if names:
        payloads.append((f"nama_barang={names[0]}", {"nama_barang": names[0]}))

    if not payloads:
        sample = get_sample_product_from_search(base_url)
        if sample and sample.get("kode_barang"):
            payloads.append(
                (
                    f"kode_barang={sample.get('kode_barang')}",
                    {"kode_barang": sample.get("kode_barang")},
                )
            )
        elif sample and sample.get("nama"):
            payloads.append(
                (
                    f"nama_barang={sample.get('nama')}",
                    {"nama_barang": sample.get("nama")},
                )
            )

    if not payloads:
        payloads.append(
            (
                "manual_features",
                {
                    "nama_barang": "PRODUK TEST MANUAL",
                    "kategori": "MINUMAN",
                    "supplier": "SUPPLIER TEST",
                    "hpp": 1000,
                    "harga_toko_1": 1500,
                    "stok_min": 5,
                    "stok_max": 50,
                    "total_stock": 30,
                    "trx_total_qty": 10,
                    "trx_qty_30d": 4,
                    "trx_qty_60d": 8,
                    "trx_qty_90d": 10,
                    "trx_count": 3,
                    "trx_total_revenue": 15000,
                    "trx_total_profit": 5000,
                },
            )
        )

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

            if "matched_product" not in body:
                result.fail(f"{label} missing matched_product")
                continue

            if endpoint == "/predict/fast-moving":
                if body.get("prediction") in VALID_FAST_MOVING:
                    result.pass_(f"{label} returned valid fast_moving prediction")
                else:
                    result.fail(f"{label} invalid body: {body}")

            elif endpoint == "/predict/low-stock":
                if body.get("prediction") in VALID_LOW_STOCK:
                    result.pass_(f"{label} returned valid low_stock prediction")
                else:
                    result.fail(f"{label} invalid body: {body}")

            elif endpoint == "/predict/profit":
                if body.get("profit_category") in VALID_PROFIT:
                    result.pass_(f"{label} returned valid profit prediction")
                else:
                    result.fail(f"{label} invalid body: {body}")


def test_invalid_product(base_url: str, result: TestResult) -> None:
    print("\n=== Testing invalid product handling ===")

    payload = {"nama_barang": "PRODUK_INI_TIDAK_MUNGKIN_ADA_999999"}
    status, body = request_json("POST", base_url, "/predict/all", json=payload)
    label = "POST /predict/all invalid product"

    if status in {400, 404}:
        result.pass_(f"{label} returned proper error {status}")
        print_json(body)
    else:
        result.fail(f"{label} should return 400/404, got {status}: {body}")


def test_swagger_placeholder_payload(base_url: str, result: TestResult) -> None:
    print("\n=== Testing Swagger placeholder cleanup ===")

    sample_name = None

    names = get_test_product_names(1)
    if names:
        sample_name = names[0]
    else:
        sample = get_sample_product_from_search(base_url)
        if sample and sample.get("nama"):
            sample_name = str(sample["nama"])

    if not sample_name:
        sample_name = "beras"

    payload = {
        "kode_barang": "string",
        "nama_barang": sample_name,
        "hpp": "string",
        "harga_toko_1": "string",
        "trx_total_qty": "string",
    }

    status, body = request_json("POST", base_url, "/predict/all", json=payload)
    label = "POST /predict/all with Swagger placeholder payload"

    if status == 404:
        result.skip(f"{label} returned 404 because sample name was not found")
        return

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    if not assert_dict(result, body, label):
        return

    if validate_predict_all_body(body, result, label):
        result.pass_(f"{label} handled correctly")


def test_recommendation_endpoints(base_url: str, result: TestResult) -> None:
    print("\n=== Testing recommendation and insight endpoints ===")

    endpoints = [
        "/recommendations/top-products",
        "/recommendations/high-profit",
        "/recommendations/restock-priority",
        "/insights/summary",
    ]

    for endpoint in endpoints:
        params = {"limit": 10} if endpoint.startswith("/recommendations/") else None

        status, body = request_json(
            "GET",
            base_url,
            endpoint,
            params=params,
        )

        label = f"GET {endpoint}"

        if status != 200:
            result.fail(f"{label} returned {status}: {body}")
            continue

        assert_list_or_dict(result, body, label)


def test_forecast_endpoint(base_url: str, result: TestResult) -> None:
    print("\n=== Testing forecast endpoint ===")

    status, body = request_json(
        "GET",
        base_url,
        "/forecast/daily-kpi",
        params={"days": 7},
    )

    label = "GET /forecast/daily-kpi"

    if status != 200:
        result.fail(f"{label} returned {status}: {body}")
        return

    assert_list_or_dict(result, body, label)


def guess_content_type(path: Path) -> str:
    suffix = path.suffix.lower()

    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"

    if suffix == ".png":
        return "image/png"

    if suffix == ".webp":
        return "image/webp"

    return "application/octet-stream"


def test_ocr_endpoint(
    base_url: str,
    result: TestResult,
    image_path: str | None,
    require_ocr: bool = False,
) -> None:
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

    content_type = guess_content_type(path)

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


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Full automated test for Tata-Arta AI API"
    )

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

    test_root(args.base_url, result)
    test_health(args.base_url, result)
    test_metadata(args.base_url, result)
    test_product_search(args.base_url, result)
    test_predict_all_by_code(args.base_url, result, args.limit)
    test_predict_all_by_exact_name(args.base_url, result, args.limit)
    test_predict_all_by_keyword_name(args.base_url, result)
    test_manual_feature_prediction(args.base_url, result)
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