from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ProductInput(BaseModel):
    kode_barang: Optional[str] = Field(default=None, description="Recommended: product code from dataset.")
    nama: Optional[str] = None
    kategori: Optional[str] = None
    supplier: Optional[str] = None
    satuan_1: Optional[str] = None

    hpp: Optional[float] = None
    harga_toko_1: Optional[float] = None
    isi: Optional[float] = None
    toko: Optional[float] = None
    gudang: Optional[float] = None
    stok_min: Optional[float] = None
    stok_max: Optional[float] = None

    trx_total_qty: Optional[float] = None
    trx_qty_30d: Optional[float] = None
    trx_qty_90d: Optional[float] = None
    trx_count: Optional[float] = None
    trx_total_revenue: Optional[float] = None
    trx_total_profit: Optional[float] = None


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
