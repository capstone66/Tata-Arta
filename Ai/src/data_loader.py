from __future__ import annotations

from pathlib import Path
from typing import Literal

import pandas as pd

from src.config import BASE_DIR, CACHE_DIR, DATA_URLS, LOCAL_DATA_DIR

DatasetName = Literal["products_featured", "products_clean", "transactions", "daily_kpi"]

FILE_NAMES = {
    "products_featured": "products_featured.csv",
    "products_clean": "products_clean.csv",
    "transactions": "transactions.csv",
    "daily_kpi": "daily_kpi.csv",
}

URLS = {
    "products_featured": DATA_URLS.products_featured,
    "products_clean": DATA_URLS.products_clean,
    "transactions": DATA_URLS.transactions,
    "daily_kpi": DATA_URLS.daily_kpi,
}


def _candidate_local_paths(name: DatasetName) -> list[Path]:
    filename = FILE_NAMES[name]
    candidates: list[Path] = []

    if LOCAL_DATA_DIR:
        candidates.append(Path(LOCAL_DATA_DIR) / filename)

    # Common repo layout: Tata-Arta/Ai is sibling of Tata-Arta/data-science
    candidates.extend([
        BASE_DIR / "data" / "processed" / filename,
        BASE_DIR / "data" / filename,
        BASE_DIR.parent / "data-science" / "data" / "processed" / filename,
        BASE_DIR.parent / "data-science" / "data" / "raw" / filename,
    ])
    return candidates


def load_csv(name: DatasetName, use_cache: bool = True) -> pd.DataFrame:
    """Load data from local repo first, then cached CSV, then raw GitHub URL."""
    filename = FILE_NAMES[name]

    for path in _candidate_local_paths(name):
        if path.exists():
            return pd.read_csv(path)

    cache_file = CACHE_DIR / filename
    if use_cache and cache_file.exists():
        return pd.read_csv(cache_file)

    url = URLS[name]
    df = pd.read_csv(url)
    if use_cache:
        df.to_csv(cache_file, index=False)
    return df


def load_products_featured() -> pd.DataFrame:
    return load_csv("products_featured")


def load_products_clean() -> pd.DataFrame:
    return load_csv("products_clean")


def load_transactions() -> pd.DataFrame:
    return load_csv("transactions")


def load_daily_kpi(required: bool = False) -> pd.DataFrame:
    try:
        return load_csv("daily_kpi")
    except Exception:
        if required:
            raise
        return pd.DataFrame(columns=[
            "tanggal", "total_revenue", "total_profit", "total_expense",
            "total_transactions", "total_items_sold"
        ])


def load_all() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    return load_products_featured(), load_transactions(), load_daily_kpi(required=False)
