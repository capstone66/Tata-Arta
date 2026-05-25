from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import ProductInput
from ocr.gemini_ocr import GeminiOCRService
from src.inference import model_availability, predict_all, predict_fast_moving, predict_low_stock, predict_profit
from src.recommendation import ai_summary, daily_kpi_forecast, high_profit_products, restock_priority, top_products

app = FastAPI(
    title="Tata-Arta AI Engineering API",
    description="FastAPI service for Fast Moving Detection, Restock Priority, Profit Prediction, Recommendations, KPI Forecast, and Gemini OCR.",
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "Tata-Arta AI Engineering API",
        "version": "4.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "models": model_availability(),
    }


@app.get("/metadata")
def metadata():
    return {
        "features": [
            "Fast Moving Detection: Slow / Normal / Fast",
            "Restock Priority Prediction",
            "Profit Ratio Prediction",
            "Recommendation System",
            "Daily KPI Forecast Baseline",
            "Receipt OCR with Gemini",
        ],
        "note": "Run python train_all.py before using prediction endpoints.",
    }


@app.post("/predict/fast-moving")
def api_predict_fast_moving(payload: ProductInput):
    try:
        return predict_fast_moving(payload.model_dump(exclude_none=True))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/low-stock")
def api_predict_low_stock(payload: ProductInput):
    try:
        return predict_low_stock(payload.model_dump(exclude_none=True))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/profit")
def api_predict_profit(payload: ProductInput):
    try:
        return predict_profit(payload.model_dump(exclude_none=True))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/predict/all")
def api_predict_all(payload: ProductInput):
    try:
        return predict_all(payload.model_dump(exclude_none=True))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/recommendations/top-products")
def api_top_products(limit: int = Query(default=10, ge=1, le=100)):
    return {"items": top_products(limit=limit)}


@app.get("/recommendations/high-profit")
def api_high_profit(limit: int = Query(default=10, ge=1, le=100)):
    return {"items": high_profit_products(limit=limit)}


@app.get("/recommendations/restock-priority")
def api_restock_priority(limit: int = Query(default=10, ge=1, le=100)):
    return {"items": restock_priority(limit=limit)}


@app.get("/insights/summary")
def api_ai_summary():
    return ai_summary()


@app.get("/forecast/daily-kpi")
def api_daily_kpi_forecast(days: int = Query(default=7, ge=1, le=30)):
    return daily_kpi_forecast(days=days)


@app.post("/ocr/scan-receipt")
async def scan_receipt(file: UploadFile = File(...)):
    try:
        content = await file.read()
        service = GeminiOCRService()
        return service.extract_receipt(content, file.content_type or "image/jpeg")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
