from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", os.getenv("TF_CPP_MIN_LOG_LEVEL", "2"))

MODELS_DIR = BASE_DIR / "models"
LOGS_DIR = BASE_DIR / "logs" / "fit"
CACHE_DIR = BASE_DIR / "cache"
LOCAL_DATA_DIR = os.getenv("TATA_ARTA_DATA_DIR", "").strip()

for directory in (MODELS_DIR, LOGS_DIR, CACHE_DIR):
    directory.mkdir(parents=True, exist_ok=True)


@dataclass(frozen=True)
class DataUrls:
    products_featured: str = os.getenv(
        "PRODUCTS_FEATURED_URL",
        "https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/products_featured.csv",
    )
    products_clean: str = os.getenv(
        "PRODUCTS_CLEAN_URL",
        "https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/products_clean.csv",
    )
    transactions: str = os.getenv(
        "TRANSACTIONS_URL",
        "https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/transactions.csv",
    )
    daily_kpi: str = os.getenv(
        "DAILY_KPI_URL",
        "https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/daily_kpi.csv",
    )


@dataclass(frozen=True)
class ModelPaths:
    fast_moving_model: Path = MODELS_DIR / "fast_moving_model.keras"
    low_stock_model: Path = MODELS_DIR / "low_stock_model.keras"
    profit_model: Path = MODELS_DIR / "profit_model.keras"
    kpi_forecast_model: Path = MODELS_DIR / "kpi_forecast_model.keras"

    fast_moving_preprocessor: Path = MODELS_DIR / "fast_moving_preprocessor.joblib"
    low_stock_preprocessor: Path = MODELS_DIR / "low_stock_preprocessor.joblib"
    profit_preprocessor: Path = MODELS_DIR / "profit_preprocessor.joblib"
    kpi_forecast_preprocessor: Path = MODELS_DIR / "kpi_forecast_preprocessor.joblib"


DATA_URLS = DataUrls()
MODEL_PATHS = ModelPaths()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_OCR_MODEL = os.getenv("GEMINI_OCR_MODEL", "gemini-3.5-flash").strip()
APP_ENV = os.getenv("APP_ENV", "development").strip()
RANDOM_STATE = int(os.getenv("RANDOM_STATE", "42"))

FAST_MOVING_LABELS = {
    0: "Slow Moving",
    1: "Normal",
    2: "Fast Moving",
}

LOW_STOCK_LABELS = {
    0: "Stock Safe",
    1: "Restock Priority",
}
