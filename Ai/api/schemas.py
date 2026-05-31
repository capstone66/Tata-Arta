from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ProductInput(BaseModel):
    # Field dibuat Any supaya data dari FS fleksibel.
    # Nilai seperti "string", "", null akan dibersihkan di src/inference.py.

    kode_barang: Any = Field(default=None, description="Kode barang dari database/dataset.")
    nama_barang: Any = Field(default=None, description="Nama barang dari UI/database FS.")
    nama_produk: Any = Field(default=None, description="Alternatif nama produk.")
    nama: Any = Field(default=None, description="Alternatif nama produk dari dataset.")

    kategori: Any = None
    sub_kategori: Any = None
    supplier: Any = None
    satuan_1: Any = None
    lokasi: Any = None
    ukuran: Any = None
    warna: Any = None

    hpp: Any = None
    harga_toko_1: Any = None
    harga_toko_2: Any = None
    harga_toko_3: Any = None
    harga_partai_1: Any = None
    harga_cabang_1: Any = None
    harga_jual: Any = None

    isi: Any = None
    toko: Any = None
    gudang: Any = None
    stok_min: Any = None
    stok_max: Any = None
    total_stock: Any = None
    stock: Any = None

    trx_total_qty: Any = None
    trx_qty_30d: Any = None
    trx_qty_60d: Any = None
    trx_qty_90d: Any = None
    trx_count: Any = None
    trx_total_revenue: Any = None
    trx_total_profit: Any = None

    profit_percent: Any = None
    estimated_profit_percent: Any = None


class OCRResponse(BaseModel):
    merchant_name: str | None = None
    transaction_date: str | None = None
    items: list[dict]
    subtotal: float | None = None
    tax: float | None = None
    discount: float | None = None
    total_transaksi: float | None = None
    confidence: float
    raw_text: str


# =========================================================
# Realtime schemas dari database FS
# Dipakai jika kamu sudah menambahkan endpoint POST realtime:
# POST /forecast/daily-kpi
# POST /insights/summary
# POST /products/search
# POST /recommendations/...
# =========================================================

class KPIDailyItem(BaseModel):
    date: Any = Field(default=None, description="Tanggal KPI, format YYYY-MM-DD")
    revenue: Any = Field(default=0, description="Total pemasukan/omzet harian")
    expense: Any = Field(default=0, description="Total pengeluaran/modal harian")
    profit: Any = Field(default=None, description="Profit harian. Jika kosong, AI pakai revenue - expense")
    transactions: Any = Field(default=0, description="Jumlah transaksi harian")


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
    q: str = Field(default="", description="Keyword nama produk")
    limit: int = Field(default=10, ge=1, le=50)
    products: list[RealtimeProductPayload]


class RealtimeRecommendationRequest(BaseModel):
    limit: int = Field(default=10, ge=1, le=50)
    products: list[RealtimeProductPayload]