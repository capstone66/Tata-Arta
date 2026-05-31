from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ProductInput(BaseModel):
    kode_barang: Any = Field(default=None, description="Optional product code.")
    nama_barang: Any = Field(default=None, description="Recommended product name from UI.")
    nama_produk: Any = Field(default=None, description="Alternative product name.")
    nama: Any = Field(default=None, description="Alternative product name from dataset.")

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

    isi: Any = None
    toko: Any = None
    gudang: Any = None
    stok_min: Any = None
    stok_max: Any = None
    total_stock: Any = None

    trx_total_qty: Any = None
    trx_qty_30d: Any = None
    trx_qty_60d: Any = None
    trx_qty_90d: Any = None
    trx_count: Any = None
    trx_total_revenue: Any = None
    trx_total_profit: Any = None


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