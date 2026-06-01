# Data Dictionary — UMKM Analytics Dashboard
Versi: 1.1.0 | Diperbarui: 2026

---

## Urutan Pipeline

```
data_barang_30000.xls (raw)
        ↓ cleaning.py
products_clean.csv
        ↓ generate_transactions.py
transactions.csv + daily_kpi.csv + stock_after_transactions.csv
        ↓ feature_engineering.py
products_featured.csv
        ↓ flag_price_issues.py
products_featured.csv (+ kolom baru: needs_price_review, urgency_restock)
```

---

## 1. products_clean.csv

Dataset produk hasil proses cleaning dari raw data inventori UMKM.
**Baris:** 32.193 | **Kolom:** 34

| Kolom            | Tipe     | Contoh Nilai          | Deskripsi                                              |
|------------------|----------|-----------------------|--------------------------------------------------------|
| kode_barang      | string   | "10001"               | ID unik produk                                         |
| kode_barcode     | int64    | 8992753282401         | Barcode utama produk                                   |
| kode_barcode_2   | float64  | 0.0                   | Barcode alternatif 2 (opsional)                        |
| kode_barcode_3   | float64  | 0.0                   | Barcode alternatif 3 (opsional)                        |
| nama             | string   | "REJOICE SHP 200ML"   | Nama produk utama                                      |
| nama_2           | float64  | 0.0                   | Nama alternatif produk                                 |
| nama_3           | float64  | 0.0                   | Nama alternatif produk 3                               |
| kategori         | string   | "SABUN & SAMPHOO"     | Kategori produk (54 kategori unik)                     |
| sub_kategori     | float64  | 0.0                   | Sub-kategori produk                                    |
| supplier         | string   | "SUMBER SARI,CV"      | Nama supplier produk                                   |
| tanggal_beli     | string   | "1899-12-30"          | Tanggal pembelian/pengadaan terakhir                   |
| isi              | int64    | 24                    | Isi per satuan produk                                  |
| isi_satuan_3     | int64    | 1                     | Isi satuan ke-3                                        |
| satuan_1         | string   | "PCS"                 | Satuan utama (PCS, KG, BTL, dll)                       |
| satuan_2         | float64  | 0.0                   | Satuan ke-2                                            |
| satuan_3         | float64  | 0.0                   | Satuan ke-3                                            |
| toko             | int64    | 0                     | Stok di toko (etalase)                                 |
| gudang           | int64    | 0                     | Stok di gudang                                         |
| **total_stock**  | int64    | 0                     | **Derived:** toko + gudang (ditambahkan saat cleaning) |
| hpp              | float64  | 19218.16              | Harga Pokok Penjualan — modal/biaya beli per unit      |
| harga_toko_1     | int64    | 19600                 | Harga jual utama (retail)                              |
| harga_toko_2     | int64    | 19600                 | Harga jual alternatif 2 (diisi median jika kosong)     |
| harga_toko_3     | int64    | 19600                 | Harga jual alternatif 3 (diisi median jika kosong)     |
| harga_partai_1   | int64    | 18000                 | Harga grosir/partai 1 (diisi median jika kosong)       |
| harga_partai_2   | int64    | 18000                 | Harga grosir/partai 2 (diisi median jika kosong)       |
| harga_partai_3   | int64    | 18000                 | Harga grosir/partai 3 (diisi median jika kosong)       |
| harga_cabang_1   | int64    | 19000                 | Harga untuk cabang 1 (diisi median jika kosong)        |
| harga_cabang_2   | int64    | 19000                 | Harga untuk cabang 2 (diisi median jika kosong)        |
| harga_cabang_3   | int64    | 19000                 | Harga untuk cabang 3 (diisi median jika kosong)        |
| lokasi           | float64  | 0.0                   | Lokasi penyimpanan di gudang                           |
| ukuran           | float64  | 0.0                   | Ukuran produk                                          |
| warna            | float64  | 0.0                   | Warna produk                                           |
| stok_min         | int64    | 1                     | Batas minimum stok — threshold reorder dari data       |
| stok_max         | int64    | 0                     | Batas maksimum stok                                    |

**Catatan cleaning:**
- Baris dengan `hpp = 0` atau `harga_toko_1 = 0` dihapus (tidak bisa analisis profit)
- Nilai 0 pada kolom stok adalah **valid** (stok habis)
- Harga tambahan yang kosong diisi dengan **median** harga valid di kolom yang sama (bukan 0)

---

## 2. transactions.csv

Dataset transaksi penjualan (100.000 baris simulasi berbasis data produk nyata).
**Baris:** 100.000 | **Kolom:** 17

| Kolom          | Tipe     | Contoh Nilai          | Deskripsi                                          |
|----------------|----------|-----------------------|----------------------------------------------------|
| transaction_id | int64    | 1                     | ID unik transaksi (sequential)                     |
| tanggal        | datetime | "2025-11-25 22:42:35" | Waktu transaksi                                    |
| kode_barang    | string   | "T2382"               | FK ke products (kode_barang di products_clean)     |
| nama_produk    | string   | "TEPUNG HUNKWEE"      | Nama produk saat transaksi                         |
| kategori       | string   | "TEPUNG"              | Kategori produk                                    |
| supplier       | string   | "MITRA MANDIRI T"     | Supplier produk                                    |
| qty            | int64    | 9                     | Jumlah unit terjual (1–10, dibatasi stok tersedia) |
| harga_jual     | float64  | 1100.0                | Harga jual per unit saat transaksi                 |
| hpp            | float64  | 935.0                 | HPP per unit saat transaksi                        |
| total          | float64  | 9900.0                | qty × harga_jual                                   |
| profit         | float64  | 1485.0                | qty × (harga_jual − hpp)                           |
| expense        | float64  | 8415.0                | qty × hpp (total modal yang dikeluarkan)           |
| payment_method | string   | "Tunai"               | Metode pembayaran: **Tunai** / **Transfer** / **QRIS** |
| status         | string   | "Selesai"             | Status transaksi: **Selesai** / **Proses**         |
| tahun          | int64    | 2025                  | Tahun transaksi (dari tanggal)                     |
| bulan          | int64    | 11                    | Bulan transaksi (dari tanggal)                     |
| hari           | int64    | 25                    | Tanggal transaksi (dari tanggal)                   |

**Distribusi nilai enum:**
- `payment_method`: Tunai ~60%, Transfer ~25%, QRIS ~15%
- `status`: Selesai ~85%, Proses ~15%

**Catatan simulasi:**
- Transaksi di-generate hanya dari produk dengan stok > 0, hpp > 0, harga > 0
- Stok dikurangi setiap kali ada transaksi — kolom `total_stock` di produk mencerminkan sisa stok setelah semua transaksi

---

## 3. products_featured.csv

Dataset produk dengan fitur tambahan hasil feature engineering.
**Baris:** 32.193 | **Kolom:** 38+ (semua kolom products_clean + fitur baru)

Berisi semua kolom dari `products_clean.csv` ditambah:

| Kolom               | Tipe    | Formula / Sumber                                   | Deskripsi                                                    |
|---------------------|---------|----------------------------------------------------|--------------------------------------------------------------|
| total_sales         | float64 | SUM(qty) dari transactions per kode_barang         | Total unit terjual — histori penjualan                       |
| profit_margin       | float64 | (harga_toko_1 − hpp) / harga_toko_1, clip[-1, 1]  | Margin keuntungan per unit (0.1 = 10%)                       |
| low_stock_flag      | bool    | total_stock < stok_min                             | True jika stok di bawah minimum — butuh restock              |
| fast_moving_flag    | bool    | total_sales >= Q75 distribusi total_sales          | True jika termasuk 25% produk terlaris                       |
| margin_category     | string  | High(≥20%) / Medium(10-20%) / Low(0-10%) / Negative(<0%) | Segmentasi profitabilitas produk                   |
| needs_price_review  | bool    | profit_margin < 0 atau > 0.80 atau harga = 0       | True jika harga perlu diaudit (dari flag_price_issues.py)    |
| price_issue_reason  | string  | Lihat flag_price_issues.py                         | Penjelasan masalah harga (kosong jika tidak ada masalah)     |
| urgency_restock     | float64 | total_sales / (total_stock + 1)                    | Skor prioritas restock — makin tinggi makin mendesak         |

**Catatan data leakage:**
- Semua fitur baru adalah kalkulasi dari **data historis** (harga, stok, transaksi masa lalu)
- Tidak ada kolom yang mengandung informasi masa depan (future data)
- Kolom `total_sales` adalah **histori**, bukan target prediksi

---

## 4. daily_kpi.csv

Ringkasan KPI harian hasil agregasi dari transactions.csv.
**Baris:** 366 (satu baris per hari) | **Kolom:** 6

| Kolom              | Tipe     | Deskripsi                                          |
|--------------------|----------|----------------------------------------------------|
| tanggal            | date     | Tanggal (format: YYYY-MM-DD), satu baris per hari  |
| total_revenue      | float64  | Total pendapatan harian (SUM of total)             |
| total_profit       | float64  | Total keuntungan harian (SUM of profit)            |
| total_expense      | float64  | Total pengeluaran/modal harian (SUM of expense)    |
| total_transactions | int64    | Jumlah transaksi per hari                          |
| total_items_sold   | int64    | Total unit produk terjual per hari                 |

**Relasi:** total_revenue = total_profit + total_expense (selalu berlaku)

---

## 5. stock_after_transactions.csv

Sisa stok produk setelah seluruh simulasi transaksi selesai dijalankan.
**Baris:** sesuai jumlah produk eligible | **Kolom:** 2

| Kolom       | Tipe   | Deskripsi                                         |
|-------------|--------|---------------------------------------------------|
| kode_barang | string | ID produk (FK ke products_clean)                  |
| total_stock | int64  | Sisa stok setelah semua transaksi diproses         |

---

## 6. price_issues_report.csv

Laporan produk dengan masalah harga (output dari flag_price_issues.py).
**Baris:** variabel | **Kolom:** 9

| Kolom               | Tipe   | Deskripsi                              |
|---------------------|--------|----------------------------------------|
| kode_barang         | string | ID produk                              |
| nama                | string | Nama produk                            |
| kategori            | string | Kategori produk                        |
| supplier            | string | Supplier produk                        |
| hpp                 | float  | HPP / harga modal                      |
| harga_toko_1        | int    | Harga jual                             |
| profit_margin       | float  | Margin yang terkalkulasi               |
| price_issue_reason  | string | Penjelasan masalah                     |
| total_sales         | float  | Total unit terjual (konteks urgency)   |

---

## 7. metadata.json

File versi data — di-generate oleh generate_metadata.py setiap kali pipeline selesai.

```json
{
  "generated_at": "2026-05-31T10:00:00",
  "pipeline_version": "1.1.0",
  "files": {
    "products_featured": {
      "rows": 32193,
      "columns": 41,
      "md5": "abc123...",
      "size_bytes": 12345678,
      "low_stock_count": 32193,
      "fast_moving_count": 8049,
      "price_review_count": 189
    }
  }
}
```

---

## Aturan bisnis penting

| Aturan | Penjelasan |
|--------|------------|
| `low_stock_flag` menggunakan `stok_min` | Threshold dinamis per produk, bukan angka tetap |
| `fast_moving_flag` menggunakan Q75 | Threshold otomatis dari distribusi data, tidak hard-coded |
| `profit_margin` di-clip ke [-1, 1] | Menghindari nilai ekstrem akibat data anomali |
| Produk hpp=0 atau harga=0 dihapus | Tidak bisa digunakan untuk analisis profit apapun |
| Stok = 0 adalah kondisi valid | Menandakan produk habis terjual, bukan data error |
