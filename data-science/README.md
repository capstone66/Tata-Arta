# UMKM Analytics Dashboard

Sistem analitik **end-to-end** berbasis Data Science untuk membantu pelaku UMKM memantau performa bisnis melalui dashboard interaktif.

---

## Problem Statement

Tiadanya sistem pemantauan performa bisnis secara real-time membuat data penjualan, persediaan stok, dan laba-rugi UMKM hanya mengendap di dalam spreadsheet tanpa evaluasi mendalam. Akibatnya, pengambilan keputusan operasional dan strategis masih bersandar pada intuisi pelaku usaha, bukan berdasarkan validasi data.

**Solusi:** Pipeline DS end-to-end dari raw data inventori → cleaned dataset → feature engineering → EDA → dashboard interaktif Streamlit.

---

## Business Questions

| # | Pertanyaan | Metrik | Dijawab di |
|---|-----------|--------|-----------|
| 1 | Produk apa yang paling banyak terjual? | Total qty per produk | EDA + Dashboard |
| 2 | Produk mana yang profit margin tertinggi? | (harga_jual−hpp)/harga_jual | Feature Eng + EDA |
| 3 | Bagaimana tren omset harian dan bulanan? | Revenue agregasi per hari/bulan | EDA + Dashboard |
| 4 | Produk mana yang memiliki stok kritis? | total_stock < stok_min | Feature Eng + Dashboard |
| 5 | Metode pembayaran apa yang paling sering? | Distribusi payment_method | EDA + Dashboard |
| 6 | Bagaimana performa profit UMKM? | Total profit, margin keseluruhan | EDA + Dashboard |
| 7 | Berapa total pengeluaran dan laba bisnis? | Expense vs revenue | Dashboard KPI |
| 8 | Produk apa yang fast moving? | total_sales >= Q75 | Feature Eng + Dashboard |

---

## Struktur Project

```
data-science/
├── data/
│   ├── raw/
│   │   └── data_barang_30000.xls          ← Dataset asli (input pipeline)
│   └── processed/
│       ├── products_clean.csv             ← Output cleaning.py
│       ├── transactions.csv               ← Output generate_transactions.py
│       ├── daily_kpi.csv                  ← Output generate_transactions.py
│       ├── stock_after_transactions.csv   ← Output generate_transactions.py
│       └── products_featured.csv          ← Output feature_engineering.py
│
├── scripts/
│   ├── cleaning.py                        ← Tahap 1: Data cleaning
│   ├── generate_transactions.py           ← Tahap 2: Simulasi transaksi
│   ├── feature_engineering.py            ← Tahap 3: Feature engineering
│   └── ab_testing.py                     ← Opsional: A/B Testing promo
│
├── notebooks/
│   └── eda.ipynb                          ← EDA lengkap dengan markdown
│
├── dashboard/
│   └── app.py                             ← Dashboard Streamlit
│
├── README.md
├── data_dictionary.md                     ← Dokumentasi semua kolom
└── requirements.txt
```

---

## Pipeline (Urutan Eksekusi)

```
1. cleaning.py              → products_clean.csv
2. generate_transactions.py → transactions.csv, daily_kpi.csv, stock_after_transactions.csv
3. feature_engineering.py   → products_featured.csv
```

---

## Instalasi & Cara Menjalankan

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Jalankan pipeline berurutan
python scripts/cleaning.py
python scripts/generate_transactions.py
python scripts/feature_engineering.py

# 3. (Opsional) A/B Testing
python scripts/ab_testing.py

# 4. Jalankan dashboard
streamlit run dashboard/app.py
```

---

## Dataset

| File | Baris | Kolom | Keterangan |
|------|-------|-------|-----------|
| data_barang_30000.xls | ~32.193 | — | Raw data inventori UMKM |
| products_clean.csv | 15.695 | 34 | Setelah cleaning (hpp>0 & harga>0) |
| transactions.csv | 100.000 | 17 | Simulasi transaksi 1 tahun |
| products_featured.csv | 15.695 | 39 | + fitur: margin, flags, price review |
| daily_kpi.csv | 366 | 6 | Agregasi KPI harian |

Dokumentasi lengkap semua kolom → [`data_dictionary.md`](data_dictionary.md)

---

## Tech Stack

| Library | Versi | Kegunaan |
|---------|-------|---------|
| pandas | ≥2.0 | Data processing |
| numpy | ≥1.24 | Operasi numerik |
| plotly | ≥5.15 | Visualisasi interaktif |
| streamlit | ≥1.25 | Dashboard |
| scipy | ≥1.11 | A/B Testing statistik |
| scikit-learn | ≥1.3 | Feature engineering & baseline model |
| matplotlib | ≥3.7 | Visualisasi notebook |

---

## Hasil EDA — Insight Utama

- **Revenue stabil** Rp 340–385M/bulan (Jun 2025–Apr 2026), puncak Jul 2025 (Rp 384,9M)
- **SUSU** adalah kategori revenue #1 (Rp 909M) tapi margin hanya 8,21%
- **MINUMAN** margin tertinggi di kategori utama — kandidat untuk pertumbuhan profit
- **189 produk** dijual di bawah HPP — kerugian langsung per transaksi, perlu audit harga
- **1.454 produk dead stock** — tidak pernah terjual, modal tertahan tanpa putaran
- **Senin–Selasa** adalah hari peak — ideal untuk jadwal restock dan promo
- **QRIS** 14,9% dari transaksi — tren digital payment terus tumbuh

---

## Deployment Dashboard

Untuk deploy ke Streamlit Cloud:

1. Push project ke GitHub
2. Login ke [share.streamlit.io](https://share.streamlit.io)
3. Connect ke repository, set main file: `dashboard/app.py`
4. Deploy

---

## Checklist DS

- [x] Mengumpulkan & menganalisis permasalahan, menentukan solusi utama
- [x] Mendefinisikan business questions yang dapat diukur (8 BQ)
- [x] Gathering Data: dataset nyata dari inventori UMKM
- [x] Assessing Data: identifikasi 7 jenis masalah data
- [x] Cleaning Data: `scripts/cleaning.py`
- [x] EDA dengan markdown & visualisasi: `notebooks/eda.ipynb`
- [x] Visualisasi & explanatory analysis menjawab semua BQ
- [x] Dashboard interaktif Streamlit: `dashboard/app.py`
- [x] Data Dictionary lengkap: `data_dictionary.md`
- [x] Dataset akhir siap pemodelan (no nulls, no leakage)
- [x] Feature engineering: `scripts/feature_engineering.py`
- [x] A/B Testing: `scripts/ab_testing.py`
- [x] Laporan teknis PDF komprehensif

---

## Author

UMKM Analytics Team — Data Science Role
