from __future__ import annotations

import inspect
import os
import tempfile
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from api.schemas import ProductInput
from src.inference import (
    ProductNotFoundError,
    model_availability,
    predict_all,
    predict_fast_moving,
    predict_low_stock,
    predict_profit,
    search_products,
)

# =========================================================
# Optional realtime schemas
# Kalau schema realtime belum ada di api/schemas.py,
# main.py tetap bisa jalan karena fallback schema dibuat di sini.
# =========================================================

try:
    from api.schemas import (
        ForecastRealtimeRequest,
        InsightRealtimeRequest,
        RealtimeProductSearchRequest,
        RealtimeRecommendationRequest,
    )
except Exception:

    class KPIDailyItem(BaseModel):
        date: Any = Field(default=None)
        revenue: Any = Field(default=0)
        expense: Any = Field(default=0)
        profit: Any = Field(default=None)
        transactions: Any = Field(default=0)

    class ForecastRealtimeRequest(BaseModel):
        horizon_days: int = Field(default=7, ge=1, le=30)
        history: list[KPIDailyItem]

    class InsightTodayPayload(BaseModel):
        date: Any = None
        revenue: Any = 0
        expense: Any = 0
        profit: Any = None
        transactions: Any = 0

    class InsightPreviousPeriodPayload(BaseModel):
        avg_revenue: Any = 0
        avg_expense: Any = 0
        avg_profit: Any = 0
        avg_transactions: Any = 0

    class InsightStockPayload(BaseModel):
        total_products: Any = 0
        low_stock_products: Any = 0
        out_of_stock_products: Any = 0

    class RealtimeProductPayload(BaseModel):
        kode_barang: Any = None
        nama_barang: Any = None
        nama: Any = None
        kategori: Any = None
        sub_kategori: Any = None
        supplier: Any = None

        hpp: Any = 0
        harga_toko_1: Any = 0
        harga_jual: Any = 0

        total_stock: Any = 0
        stock: Any = 0
        stok_min: Any = 0
        stok_max: Any = 0

        trx_total_qty: Any = 0
        trx_qty_30d: Any = 0
        trx_qty_60d: Any = 0
        trx_qty_90d: Any = 0
        trx_count: Any = 0
        trx_total_revenue: Any = 0
        trx_total_profit: Any = 0

        profit_percent: Any = 0
        estimated_profit_percent: Any = 0

    class InsightRealtimeRequest(BaseModel):
        today: InsightTodayPayload
        previous_period: InsightPreviousPeriodPayload | None = None
        stock: InsightStockPayload | None = None
        products: list[RealtimeProductPayload] = []

    class RealtimeProductSearchRequest(BaseModel):
        q: str = Field(default="")
        limit: int = Field(default=10, ge=1, le=50)
        products: list[RealtimeProductPayload]

    class RealtimeRecommendationRequest(BaseModel):
        limit: int = Field(default=10, ge=1, le=50)
        products: list[RealtimeProductPayload]


# =========================================================
# Optional realtime logic
# File ini harus ada kalau mau endpoint POST realtime aktif:
# Ai/src/realtime_analytics.py
# =========================================================

try:
    from src.realtime_analytics import (
        forecast_daily_kpi_from_payload,
        high_profit_products_from_payload,
        insights_summary_from_payload,
        restock_priority_from_payload,
        search_products_from_payload,
        top_products_from_payload,
    )

    REALTIME_AVAILABLE = True
except Exception:
    REALTIME_AVAILABLE = False

    def forecast_daily_kpi_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("src/realtime_analytics.py belum tersedia.")

    def insights_summary_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("src/realtime_analytics.py belum tersedia.")

    def search_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("src/realtime_analytics.py belum tersedia.")

    def top_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("src/realtime_analytics.py belum tersedia.")

    def high_profit_products_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("src/realtime_analytics.py belum tersedia.")

    def restock_priority_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("src/realtime_analytics.py belum tersedia.")


# =========================================================
# App config
# =========================================================

app = FastAPI(
    title="Tata-Arta AI API",
    description=(
        "AI service untuk prediksi produk, restock priority, profit prediction, "
        "recommendation, forecast, insight, dan OCR nota."
    ),
    version="1.0.0",
)

allowed_origins = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Helper umum
# =========================================================

def _json_safe(value: Any) -> Any:
    """
    Convert numpy/pandas value supaya aman jadi JSON.
    """
    if value is None:
        return None

    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}

    if isinstance(value, list):
        return [_json_safe(v) for v in value]

    if isinstance(value, tuple):
        return [_json_safe(v) for v in value]

    if isinstance(value, (np.integer,)):
        return int(value)

    if isinstance(value, (np.floating,)):
        if pd.isna(value):
            return None
        return float(value)

    if isinstance(value, np.ndarray):
        return value.tolist()

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    return value


def _to_float(value: Any, default: float = 0.0) -> float:
    if value is None:
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

            if text.lower() in {"", "string", "null", "none", "undefined", "nan", "-"}:
                return default

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
    return int(round(_to_float(value, default)))


def handle_prediction_error(exc: Exception):
    if isinstance(exc, ProductNotFoundError):
        raise HTTPException(status_code=404, detail=str(exc))

    if isinstance(exc, ValueError):
        raise HTTPException(status_code=400, detail=str(exc))

    raise HTTPException(status_code=500, detail=str(exc))


def _realtime_unavailable_response():
    raise HTTPException(
        status_code=501,
        detail=(
            "Realtime analytics belum aktif. Pastikan file "
            "Ai/src/realtime_analytics.py sudah ada dan import-nya valid."
        ),
    )


def _get_ai_table_for_dashboard() -> pd.DataFrame:
    """
    Ambil AI table dari src.inference untuk endpoint GET fallback/demo.
    GET endpoint membaca data internal/DS.
    POST endpoint membaca data real dari FS.
    """
    from src.inference import get_ai_table

    table = get_ai_table()

    if not isinstance(table, pd.DataFrame):
        raise RuntimeError("AI table tidak valid.")

    return table.copy()


def _compact_product(row: pd.Series) -> dict[str, Any]:
    return _json_safe(
        {
            "kode_barang": row.get("kode_barang"),
            "nama": row.get("nama") or row.get("nama_barang"),
            "kategori": row.get("kategori"),
            "sub_kategori": row.get("sub_kategori"),
            "supplier": row.get("supplier"),
            "hpp": row.get("hpp"),
            "harga_toko_1": row.get("harga_toko_1"),
            "total_stock": row.get("total_stock", row.get("toko", 0)),
            "stok_min": row.get("stok_min"),
            "stok_max": row.get("stok_max"),
            "trx_total_qty": row.get("trx_total_qty"),
            "trx_qty_30d": row.get("trx_qty_30d"),
            "trx_qty_90d": row.get("trx_qty_90d"),
            "trx_count": row.get("trx_count"),
            "trx_total_revenue": row.get("trx_total_revenue"),
            "trx_total_profit": row.get("trx_total_profit"),
        }
    )


# =========================================================
# Root, health, metadata
# =========================================================

@app.get("/")
def root():
    return {
        "service": "Tata-Arta AI API",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "models": model_availability(),
        "realtime": REALTIME_AVAILABLE,
    }


@app.get("/metadata")
def metadata():
    return {
        "service": "Tata-Arta AI API",
        "version": "1.0.0",
        "models": model_availability(),
        "realtime_available": REALTIME_AVAILABLE,
        "features": [
            "product_search_internal_ds",
            "product_search_realtime_fs_payload",
            "fast_moving_detection",
            "restock_priority_prediction",
            "profit_prediction",
            "recommendation_internal_ds",
            "recommendation_realtime_fs_payload",
            "daily_kpi_forecast_internal_ds",
            "daily_kpi_forecast_realtime_fs_payload",
            "insight_internal_ds",
            "insight_realtime_fs_payload",
            "gemini_ocr",
        ],
        "endpoint_modes": {
            "GET": "demo/fallback memakai data internal AI atau dataset DS",
            "POST": "real-time memakai payload dari backend Fullstack/database FS",
        },
    }


# =========================================================
# Product search
# =========================================================

@app.get("/products/search")
def api_search_products(
    q: str = Query(..., description="Keyword nama produk"),
    limit: int = Query(10, ge=1, le=50),
):
    """
    GET search produk dari data internal AI / dataset DS.
    Untuk data real dari database FS gunakan POST /products/search.
    """
    try:
        return _json_safe(search_products(q, limit))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/products/search")
def api_search_products_realtime(payload: RealtimeProductSearchRequest):
    """
    POST search produk dari list produk database FS.
    Body dikirim backend FS.
    """
    if not REALTIME_AVAILABLE:
        _realtime_unavailable_response()

    try:
        return _json_safe(search_products_from_payload(payload.model_dump()))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================================================
# Prediction endpoints
# Endpoint ini HARUS bisa menerima data real dari FS.
# Kalau produk baru tidak ada di dataset DS, inference.py akan pakai manual_features.
# =========================================================

@app.post("/predict/fast-moving")
def api_predict_fast_moving(payload: ProductInput):
    try:
        return _json_safe(predict_fast_moving(payload.model_dump(exclude_none=True)))
    except Exception as exc:
        handle_prediction_error(exc)


@app.post("/predict/low-stock")
def api_predict_low_stock(payload: ProductInput):
    try:
        return _json_safe(predict_low_stock(payload.model_dump(exclude_none=True)))
    except Exception as exc:
        handle_prediction_error(exc)


@app.post("/predict/profit")
def api_predict_profit(payload: ProductInput):
    try:
        return _json_safe(predict_profit(payload.model_dump(exclude_none=True)))
    except Exception as exc:
        handle_prediction_error(exc)


@app.post("/predict/all")
def api_predict_all(payload: ProductInput):
    try:
        return _json_safe(predict_all(payload.model_dump(exclude_none=True)))
    except Exception as exc:
        handle_prediction_error(exc)


# =========================================================
# GET Recommendations dari data internal/DS
# =========================================================

@app.get("/recommendations/top-products")
def api_top_products(limit: int = Query(10, ge=1, le=50)):
    """
    GET rekomendasi top products dari data internal AI/DS.
    Untuk data real FS gunakan POST /recommendations/top-products.
    """
    try:
        table = _get_ai_table_for_dashboard()

        sort_cols = []

        if "trx_total_qty" in table.columns:
            sort_cols.append("trx_total_qty")

        if "trx_count" in table.columns:
            sort_cols.append("trx_count")

        if sort_cols:
            table = table.sort_values(sort_cols, ascending=False)

        items = []

        for _, row in table.head(limit).iterrows():
            item = _compact_product(row)
            item["reason"] = "Produk memiliki aktivitas penjualan tinggi dari data internal AI/DS."
            items.append(item)

        return {
            "source": "internal_ai_dataset_ds",
            "count": len(items),
            "items": items,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/recommendations/high-profit")
def api_high_profit(limit: int = Query(10, ge=1, le=50)):
    """
    GET rekomendasi high profit dari data internal AI/DS.
    Untuk data real FS gunakan POST /recommendations/high-profit.
    """
    try:
        table = _get_ai_table_for_dashboard()
        work = table.copy()

        if "estimated_profit_percent" in work.columns:
            work["_profit_percent"] = work["estimated_profit_percent"].map(_to_float)
        elif "profit_percent" in work.columns:
            work["_profit_percent"] = work["profit_percent"].map(_to_float)
        elif {"hpp", "harga_toko_1"}.issubset(work.columns):
            hpp = work["hpp"].map(_to_float)
            price = work["harga_toko_1"].map(_to_float)
            work["_profit_percent"] = ((price - hpp) / price.replace(0, np.nan) * 100).fillna(0)
        elif {"trx_total_profit", "trx_total_revenue"}.issubset(work.columns):
            profit = work["trx_total_profit"].map(_to_float)
            revenue = work["trx_total_revenue"].map(_to_float)
            work["_profit_percent"] = ((profit / revenue.replace(0, np.nan)) * 100).fillna(0)
        else:
            work["_profit_percent"] = 0

        work = work.sort_values("_profit_percent", ascending=False)

        items = []

        for _, row in work.head(limit).iterrows():
            profit_percent = _to_float(row.get("_profit_percent"))

            item = _compact_product(row)
            item["estimated_profit_percent"] = round(profit_percent, 2)
            item["profit_category"] = (
                "High Profit"
                if profit_percent >= 20
                else "Medium Profit"
                if profit_percent >= 8
                else "Low Profit"
            )
            item["reason"] = "Produk memiliki potensi profit tinggi dari data internal AI/DS."
            items.append(item)

        return {
            "source": "internal_ai_dataset_ds",
            "count": len(items),
            "items": items,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/recommendations/restock-priority")
def api_restock_priority(limit: int = Query(10, ge=1, le=50)):
    """
    GET rekomendasi restock dari data internal AI/DS.
    Untuk data real FS gunakan POST /recommendations/restock-priority.
    """
    try:
        table = _get_ai_table_for_dashboard()
        work = table.copy()

        def score_row(row: pd.Series) -> float:
            total_stock = _to_float(row.get("total_stock", row.get("toko", row.get("stock", 0))))
            stok_min = _to_float(row.get("stok_min"))
            trx_qty_30d = _to_float(row.get("trx_qty_30d"))
            trx_qty_90d = _to_float(row.get("trx_qty_90d"))
            trx_count = _to_float(row.get("trx_count"))

            if stok_min > 0:
                stock_pressure = max(0.0, (stok_min - total_stock) / stok_min)
            else:
                stock_pressure = 1.0 if total_stock <= 0 else 0.0

            sales_velocity = (trx_qty_30d * 0.7) + ((trx_qty_90d / 3) * 0.2) + (trx_count * 0.1)
            score = (stock_pressure * 100) + sales_velocity

            if total_stock <= 0:
                score += 50

            return float(score)

        work["_restock_score"] = work.apply(score_row, axis=1)
        work = work.sort_values("_restock_score", ascending=False)

        items = []

        for _, row in work.head(limit).iterrows():
            item = _compact_product(row)
            item["restock_priority_score"] = round(_to_float(row.get("_restock_score")), 4)
            item["reason"] = "Produk diprioritaskan berdasarkan stok rendah dan aktivitas transaksi data internal AI/DS."
            items.append(item)

        return {
            "source": "internal_ai_dataset_ds",
            "count": len(items),
            "items": items,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================================================
# POST Recommendations dari data real FS
# =========================================================

@app.post("/recommendations/top-products")
def api_top_products_realtime(payload: RealtimeRecommendationRequest):
    if not REALTIME_AVAILABLE:
        _realtime_unavailable_response()

    try:
        return _json_safe(top_products_from_payload(payload.model_dump()))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/recommendations/high-profit")
def api_high_profit_realtime(payload: RealtimeRecommendationRequest):
    if not REALTIME_AVAILABLE:
        _realtime_unavailable_response()

    try:
        return _json_safe(high_profit_products_from_payload(payload.model_dump()))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/recommendations/restock-priority")
def api_restock_priority_realtime(payload: RealtimeRecommendationRequest):
    if not REALTIME_AVAILABLE:
        _realtime_unavailable_response()

    try:
        return _json_safe(restock_priority_from_payload(payload.model_dump()))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================================================
# Insight
# GET = data internal/DS
# POST = data real dari backend FS
# =========================================================

@app.get("/insights/summary")
def api_insights_summary():
    """
    GET insight dari data internal AI/DS.
    Untuk data real FS gunakan POST /insights/summary.
    """
    try:
        table = _get_ai_table_for_dashboard()

        total_products = int(len(table))

        fast_moving_products = 0
        restock_priority_products = 0
        high_profit_products = 0

        if "fast_moving_label" in table.columns:
            fast_moving_products = int((table["fast_moving_label"].astype(str).str.lower() == "fast moving").sum())
        elif "trx_qty_30d" in table.columns:
            fast_moving_products = int((table["trx_qty_30d"].map(_to_float) >= table["trx_qty_30d"].map(_to_float).quantile(0.75)).sum())

        if {"total_stock", "stok_min"}.issubset(table.columns):
            restock_priority_products = int(
                (table["total_stock"].map(_to_float) <= table["stok_min"].map(_to_float)).sum()
            )
        elif {"toko", "stok_min"}.issubset(table.columns):
            restock_priority_products = int(
                (table["toko"].map(_to_float) <= table["stok_min"].map(_to_float)).sum()
            )

        if {"hpp", "harga_toko_1"}.issubset(table.columns):
            hpp = table["hpp"].map(_to_float)
            price = table["harga_toko_1"].map(_to_float)
            profit_pct = ((price - hpp) / price.replace(0, np.nan) * 100).fillna(0)
            high_profit_products = int((profit_pct >= 20).sum())

        insights = [
            "Insight ini berasal dari data internal AI/DS.",
            "Untuk dashboard real-time dari database FS, gunakan POST /insights/summary.",
        ]

        if restock_priority_products > 0:
            insights.append(f"Ada {restock_priority_products} produk yang berpotensi perlu restock.")

        if fast_moving_products > 0:
            insights.append(f"Ada {fast_moving_products} produk yang terindikasi fast moving.")

        if high_profit_products > 0:
            insights.append(f"Ada {high_profit_products} produk dengan potensi profit tinggi.")

        return {
            "source": "internal_ai_dataset_ds",
            "summary": {
                "total_products": total_products,
                "fast_moving_products": fast_moving_products,
                "restock_priority_products": restock_priority_products,
                "high_profit_products": high_profit_products,
            },
            "insights": insights,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/insights/summary")
def api_insights_summary_realtime(payload: InsightRealtimeRequest):
    """
    POST insight dari data real database FS.
    """
    if not REALTIME_AVAILABLE:
        _realtime_unavailable_response()

    try:
        return _json_safe(insights_summary_from_payload(payload.model_dump()))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================================================
# Forecast KPI
# GET = data internal/DS
# POST = data real dari backend FS
# =========================================================

def _load_daily_kpi_fallback() -> pd.DataFrame:
    try:
        from src.data_loader import load_daily_kpi

        df = load_daily_kpi()

        if isinstance(df, pd.DataFrame):
            return df.copy()

    except Exception:
        pass

    return pd.DataFrame()


@app.get("/forecast/daily-kpi")
def api_forecast_daily_kpi():
    """
    GET forecast dari data internal AI/DS.
    Untuk forecast real dari transaksi database FS, gunakan POST /forecast/daily-kpi.
    """
    try:
        df = _load_daily_kpi_fallback()

        if df.empty:
            return {
                "source": "internal_ai_dataset_ds",
                "message": "daily_kpi tidak tersedia. Untuk data real gunakan POST /forecast/daily-kpi.",
                "history": [],
                "forecast": [],
            }

        date_col = "date" if "date" in df.columns else df.columns[0]

        revenue_col = None
        for col in ["revenue", "total_revenue", "omzet", "sales"]:
            if col in df.columns:
                revenue_col = col
                break

        trx_col = None
        for col in ["transactions", "trx_count", "total_transactions"]:
            if col in df.columns:
                trx_col = col
                break

        profit_col = None
        for col in ["profit", "total_profit", "laba"]:
            if col in df.columns:
                profit_col = col
                break

        history = []

        for _, row in df.tail(30).iterrows():
            item = {
                "date": str(row.get(date_col)),
                "revenue": _to_float(row.get(revenue_col)) if revenue_col else 0,
                "transactions": _to_int(row.get(trx_col)) if trx_col else 0,
                "profit": _to_float(row.get(profit_col)) if profit_col else 0,
            }
            history.append(item)

        if not history:
            return {
                "source": "internal_ai_dataset_ds",
                "history": [],
                "forecast": [],
            }

        # Forecast sederhana fallback dari rata-rata 7 hari terakhir.
        recent = history[-7:] if len(history) >= 7 else history
        avg_revenue = sum(item["revenue"] for item in recent) / len(recent)
        avg_transactions = sum(item["transactions"] for item in recent) / len(recent)
        avg_profit = sum(item["profit"] for item in recent) / len(recent)

        last_date_text = history[-1]["date"][:10]

        try:
            last_date = pd.to_datetime(last_date_text)
        except Exception:
            last_date = pd.Timestamp.today()

        forecast = []

        for i in range(1, 8):
            target_date = last_date + pd.Timedelta(days=i)
            forecast.append(
                {
                    "date": target_date.strftime("%Y-%m-%d"),
                    "predicted_revenue": round(avg_revenue, 2),
                    "predicted_transactions": int(round(avg_transactions)),
                    "predicted_profit": round(avg_profit, 2),
                }
            )

        return {
            "source": "internal_ai_dataset_ds",
            "message": "Forecast GET memakai data internal/DS. Untuk data real gunakan POST /forecast/daily-kpi.",
            "history": history,
            "forecast": forecast,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/forecast/daily-kpi")
def api_forecast_daily_kpi_realtime(payload: ForecastRealtimeRequest):
    """
    POST forecast dari history KPI real database FS.
    """
    if not REALTIME_AVAILABLE:
        _realtime_unavailable_response()

    try:
        return _json_safe(forecast_daily_kpi_from_payload(payload.model_dump()))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# =========================================================
# OCR
# =========================================================

def _find_ocr_function():
    """
    Supaya tidak gampang rusak kalau nama function OCR berbeda.
    Akan mencari beberapa nama function umum di ocr/gemini_ocr.py.
    """
    try:
        import ocr.gemini_ocr as gemini_ocr
    except Exception as exc:
        raise RuntimeError(f"Gagal import ocr.gemini_ocr: {exc}")

    candidate_names = [
        "scan_receipt",
        "scan_receipt_with_gemini",
        "extract_receipt",
        "extract_receipt_with_gemini",
        "parse_receipt_image",
        "read_receipt",
        "gemini_ocr",
        "ocr_receipt",
    ]

    for name in candidate_names:
        fn = getattr(gemini_ocr, name, None)

        if callable(fn):
            return fn

    raise RuntimeError(
        "Tidak menemukan function OCR di ocr/gemini_ocr.py. "
        "Pastikan ada salah satu function: scan_receipt, scan_receipt_with_gemini, "
        "extract_receipt, extract_receipt_with_gemini, parse_receipt_image, read_receipt."
    )


async def _run_ocr(file: UploadFile) -> dict[str, Any]:
    content = await file.read()

    if not content:
        raise ValueError("File OCR kosong.")

    fn = _find_ocr_function()

    suffix = Path(file.filename or "receipt.jpg").suffix or ".jpg"

    # Coba panggil OCR dengan bytes dulu.
    try:
        result = fn(content)

        if inspect.isawaitable(result):
            result = await result

        if isinstance(result, dict):
            return _json_safe(result)

    except TypeError:
        pass
    except Exception:
        # Kalau gagal karena function butuh path, lanjut coba path.
        pass

    # Coba pakai temporary file path.
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = fn(tmp_path)

        if inspect.isawaitable(result):
            result = await result

        if isinstance(result, dict):
            return _json_safe(result)

        raise RuntimeError("Function OCR tidak mengembalikan dict.")

    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


@app.post("/ocr/scan-receipt")
async def api_scan_receipt(file: UploadFile = File(...)):
    """
    OCR nota/faktur.
    Request: multipart/form-data, field: file.
    """
    try:
        return await _run_ocr(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))