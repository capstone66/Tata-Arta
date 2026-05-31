# Tata-Arta AI Service

AI service untuk aplikasi **Tata-Arta**.

Service ini berjalan terpisah dari Backend Fullstack dan digunakan untuk analisis produk, prediksi stok, rekomendasi bisnis, forecast KPI, dan OCR nota/faktur.

AI service ini menggunakan:

* **FastAPI** untuk REST API.
* **TensorFlow/Keras** untuk model prediksi.
* **Scikit-learn** dan **Joblib** untuk preprocessing.
* **Gemini API** untuk OCR nota/faktur.
* **Docker** untuk deployment.
* **Render** sebagai salah satu opsi hosting production.

---

## 1. Ringkasan Fungsi

AI service digunakan untuk:

1. Mencari produk.
2. Memprediksi produk **Slow Moving**, **Normal**, atau **Fast Moving**.
3. Memprediksi apakah produk masih **Stock Safe** atau perlu **Restock Priority**.
4. Mengestimasi kategori profit produk.
5. Memberikan rekomendasi produk terlaris.
6. Memberikan rekomendasi produk profit tinggi.
7. Memberikan rekomendasi produk yang perlu restock.
8. Memberikan insight dashboard.
9. Memberikan forecast KPI harian.
10. Membaca nota/faktur menggunakan OCR Gemini.

---

## 2. Status Project AI

Status terakhir:

```text
AI API utama          : PASSED
Realtime FS endpoint  : PASSED
Model fast moving     : OK
Model low stock       : OK
Model profit          : OK
OCR endpoint          : Available
Docker build          : Tested
Docker run            : Tested
```

Hasil test utama yang diharapkan:

```text
Passed : 130+
Failed : 0
Skipped: 0 atau 1
Status : PASSED
```

Catatan:

```text
Skipped: 1 biasanya karena OCR tidak diberi file gambar nota.
Jika ingin test benar-benar lengkap tanpa skip, jalankan test dengan --ocr-image dan --require-ocr.
```

---

## 3. Posisi AI dalam Arsitektur Website

AI service **bukan database utama**.

AI hanya menerima data dari Backend Fullstack, melakukan prediksi/OCR/analytics, lalu mengembalikan response JSON.

Arsitektur production yang benar:

```text
Frontend
   ↓
Backend Fullstack
   ↓
AI Service
   ↓
Backend Fullstack
   ↓
Frontend
```

Frontend sebaiknya **tidak langsung memanggil AI service** pada production.

Alasannya:

1. Backend bisa menyembunyikan URL AI service.
2. Backend bisa menjaga konfigurasi rahasia.
3. Backend bisa mengecek login user.
4. Backend bisa mengambil data real dari database.
5. Backend bisa menghitung fitur produk sebelum dikirim ke AI.
6. Backend bisa memfilter response AI sebelum dikirim ke frontend.
7. Backend bisa menangani timeout/error dari AI.

Catatan sementara:

```text
Multi-role Owner/Karyawan belum menjadi prioritas implementasi saat ini.
Tetapi README tetap menyiapkan catatan role untuk pengembangan berikutnya.
```

---

## 4. Mode Data: Demo DS vs Realtime FS

AI service punya 2 mode penggunaan.

---

### A. Mode Demo / Fallback DS

Mode ini memakai data dari dataset DS/internal AI.

Biasanya memakai endpoint **GET**.

Contoh endpoint:

```text
GET /products/search
GET /recommendations/top-products
GET /recommendations/high-profit
GET /recommendations/restock-priority
GET /insights/summary
GET /forecast/daily-kpi
```

Mode ini cocok untuk:

1. Demo awal.
2. Testing endpoint.
3. Testing model AI.
4. Testing frontend sebelum Backend Fullstack selesai.
5. Fallback jika data realtime belum tersedia.

Mode ini **tidak disarankan sebagai sumber utama production multi-client**, karena masih memakai dataset awal.

---

### B. Mode Production / Realtime FS

Mode ini memakai data real dari Backend Fullstack/database website.

Biasanya memakai endpoint **POST**.

Contoh endpoint:

```text
POST /products/search
POST /predict/all
POST /predict/fast-moving
POST /predict/low-stock
POST /predict/profit
POST /recommendations/top-products
POST /recommendations/high-profit
POST /recommendations/restock-priority
POST /insights/summary
POST /forecast/daily-kpi
POST /ocr/scan-receipt
```

Mode ini cocok untuk:

1. Website production.
2. Banyak toko/client.
3. Produk yang berbeda-beda di setiap toko.
4. Data stok real.
5. Data transaksi real.
6. Data dashboard real dari database FS.
7. Integrasi final dengan Backend Fullstack.

Untuk production, Backend Fullstack sebaiknya memakai mode realtime ini.

Jika response memiliki:

```json
{
  "source": "fs_payload"
}
```

berarti response berasal dari payload realtime Backend Fullstack, bukan dari dataset DS.

---

## 5. Struktur Folder

Struktur utama folder AI:

```text
Ai/
├── api/
│   ├── __init__.py
│   ├── main.py
│   └── schemas.py
├── models/
│   ├── fast_moving_model.keras
│   ├── fast_moving_model.training_summary.json
│   ├── fast_moving_preprocessor.joblib
│   ├── low_stock_model.keras
│   ├── low_stock_model.training_summary.json
│   ├── low_stock_preprocessor.joblib
│   ├── profit_model.keras
│   ├── profit_model.training_summary.json
│   └── profit_preprocessor.joblib
├── ocr/
│   ├── __init__.py
│   └── gemini_ocr.py
├── src/
│   ├── config.py
│   ├── custom_callbacks.py
│   ├── custom_layers.py
│   ├── data_loader.py
│   ├── feature_engineering.py
│   ├── inference.py
│   ├── model_builder.py
│   ├── preprocessing.py
│   ├── recommendation.py
│   ├── realtime_analytics.py
│   ├── train_fast_moving.py
│   ├── train_low_stock.py
│   ├── train_profit.py
│   └── trainer.py
├── tests/
│   ├── auto_test_api.py
│   └── auto_test_realtime_api.py
├── .dockerignore
├── .env.example
├── Dockerfile
├── Makefile
├── Procfile
├── README.md
├── docker-compose.yml
├── render.yaml
├── requirements.txt
└── train_all.py
```

Penjelasan folder/file:

| Folder/File          | Fungsi                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| `api/`               | Endpoint FastAPI                                                          |
| `models/`            | File model, preprocessor, dan summary training                            |
| `ocr/`               | OCR nota/faktur dengan Gemini                                             |
| `src/`               | Core AI: data loader, feature engineering, inference, training, analytics |
| `tests/`             | Script testing otomatis                                                   |
| `train_all.py`       | Training semua model                                                      |
| `requirements.txt`   | Dependency Python                                                         |
| `Dockerfile`         | Build container untuk deploy                                              |
| `.dockerignore`      | Menghindari file tidak perlu masuk Docker image                           |
| `render.yaml`        | Konfigurasi deploy Render                                                 |
| `docker-compose.yml` | Opsi menjalankan service dengan Docker Compose                            |
| `.env.example`       | Contoh environment variable                                               |

---

## 6. Model AI

AI service memiliki 3 model utama.

---

### A. Fast Moving Model

Memprediksi apakah produk termasuk:

```text
Slow Moving
Normal
Fast Moving
```

Contoh output:

```json
{
  "prediction": "Fast Moving",
  "confidence": 0.93,
  "probabilities": {
    "Slow Moving": 0.01,
    "Normal": 0.06,
    "Fast Moving": 0.93
  }
}
```

---

### B. Low Stock / Restock Model

Memprediksi apakah produk termasuk:

```text
Stock Safe
Restock Priority
```

Contoh output:

```json
{
  "prediction": "Restock Priority",
  "confidence": 0.88,
  "restock_priority_score": 0.88,
  "message": "Produk perlu diprioritaskan untuk restock."
}
```

---

### C. Profit Model

Mengestimasi kategori profit produk:

```text
Low Profit
Medium Profit
High Profit
```

Contoh output:

```json
{
  "estimated_profit_ratio": 0.15,
  "estimated_profit_percent": 15.0,
  "profit_category": "Medium Profit"
}
```

Catatan:

```text
Untuk sementara multi-role belum diprioritaskan.
Namun jika multi-role diterapkan nanti, hasil profit, HPP, margin, dan estimasi profit sebaiknya hanya ditampilkan untuk Owner.
```

---

## 7. Endpoint Utama

| Fitur                   | Method | Endpoint                            | Data Source             |
| ----------------------- | -----: | ----------------------------------- | ----------------------- |
| Root                    |    GET | `/`                                 | Service info            |
| Health                  |    GET | `/health`                           | Service status          |
| Metadata                |    GET | `/metadata`                         | AI metadata             |
| Product Search Demo     |    GET | `/products/search?q=beras&limit=10` | Dataset DS              |
| Product Search Realtime |   POST | `/products/search`                  | Payload FS              |
| Predict All             |   POST | `/predict/all`                      | Payload FS / dataset AI |
| Fast Moving             |   POST | `/predict/fast-moving`              | Payload FS / dataset AI |
| Low Stock               |   POST | `/predict/low-stock`                | Payload FS / dataset AI |
| Profit                  |   POST | `/predict/profit`                   | Payload FS / dataset AI |
| Top Products Demo       |    GET | `/recommendations/top-products`     | Dataset DS              |
| Top Products Realtime   |   POST | `/recommendations/top-products`     | Payload FS              |
| High Profit Demo        |    GET | `/recommendations/high-profit`      | Dataset DS              |
| High Profit Realtime    |   POST | `/recommendations/high-profit`      | Payload FS              |
| Restock Demo            |    GET | `/recommendations/restock-priority` | Dataset DS              |
| Restock Realtime        |   POST | `/recommendations/restock-priority` | Payload FS              |
| Insight Demo            |    GET | `/insights/summary`                 | Dataset DS              |
| Insight Realtime        |   POST | `/insights/summary`                 | Payload FS              |
| Forecast Demo           |    GET | `/forecast/daily-kpi?days=7`        | Dataset DS              |
| Forecast Realtime       |   POST | `/forecast/daily-kpi`               | Payload FS              |
| OCR Nota                |   POST | `/ocr/scan-receipt`                 | Upload file             |

Endpoint utama untuk Backend Fullstack:

```text
POST /predict/all
```

Karena endpoint ini mengembalikan 3 hasil sekaligus:

1. Fast moving prediction.
2. Low stock/restock prediction.
3. Profit prediction.

---

## 8. Base URL

Local development:

```text
http://localhost:8000
```

Docker local test:

```text
http://localhost:8001
```

Swagger/OpenAPI lokal:

```text
http://localhost:8000/docs
```

Production:

```text
https://URL-DEPLOY-AI-SERVICE.onrender.com
```

Di Backend Fullstack, simpan URL AI pada `.env`:

```env
AI_BASE_URL=http://localhost:8000
```

Jika Backend Fullstack ingin memakai AI Docker local test:

```env
AI_BASE_URL=http://localhost:8001
```

Untuk production:

```env
AI_BASE_URL=https://URL-DEPLOY-AI-SERVICE.onrender.com
```

Catatan penting:

```text
Gunakan AI_BASE_URL.
Jangan gunakan AI_API_BASE_URL jika kode Backend Fullstack membaca AI_BASE_URL.
```

---

## 9. Environment Variables

Contoh isi `.env` lokal:

```env
APP_ENV=development
TF_CPP_MIN_LOG_LEVEL=2
CORS_ALLOW_ORIGINS=*

GEMINI_API_KEY=ISI_API_KEY_GEMINI
GEMINI_OCR_MODEL=gemini-3.5-flash

TATA_ARTA_DATA_DIR=

PRODUCTS_FEATURED_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/products_featured.csv
PRODUCTS_CLEAN_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/products_clean.csv
TRANSACTIONS_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/transactions.csv
DAILY_KPI_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/daily_kpi.csv

RANDOM_STATE=42
```

Environment production di Render:

```env
APP_ENV=production
TF_CPP_MIN_LOG_LEVEL=2
CORS_ALLOW_ORIGINS=*
GEMINI_API_KEY=ISI_API_KEY_GEMINI
GEMINI_OCR_MODEL=gemini-3.5-flash
```

Catatan:

```text
Jangan commit file .env asli ke GitHub.
Gunakan .env.example sebagai template.
GEMINI_API_KEY hanya boleh disimpan di local .env atau Render Environment Variables.
```

---

## 10. Setup Local Development

Masuk ke folder AI:

```powershell
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
```

Buat virtual environment dengan Python 3.11:

```powershell
py -3.11 -m venv venv
```

Aktifkan virtual environment:

```powershell
venv\Scripts\activate
```

Upgrade pip:

```powershell
python -m pip install --upgrade pip setuptools wheel
```

Install dependency:

```powershell
pip install -r requirements.txt
```

Cek dependency:

```powershell
pip check
```

Jika belum ada `.env`, copy dari template:

```powershell
copy .env.example .env
```

Isi `.env` sesuai kebutuhan.

---

## 11. Menjalankan API Lokal

Jalankan dari folder `Ai`:

```powershell
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Jika berhasil, terminal akan menampilkan:

```text
Application startup complete.
Uvicorn running on http://0.0.0.0:8000
```

Buka Swagger:

```text
http://localhost:8000/docs
```

---

## 12. Health Check

Endpoint:

```http
GET /health
```

Command:

```powershell
curl.exe http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "models": {
    "fast_moving": true,
    "low_stock": true,
    "profit": true
  },
  "realtime": true
}
```

Keterangan:

| Field               | Arti                                                  |
| ------------------- | ----------------------------------------------------- |
| `status: ok`        | Service berjalan                                      |
| `fast_moving: true` | Model fast moving tersedia                            |
| `low_stock: true`   | Model low stock/restock tersedia                      |
| `profit: true`      | Model profit tersedia                                 |
| `realtime: true`    | Logic realtime dari `src/realtime_analytics.py` aktif |

Jika salah satu model bernilai `false`, pastikan file berikut ada:

```text
Ai/models/fast_moving_model.keras
Ai/models/fast_moving_preprocessor.joblib
Ai/models/low_stock_model.keras
Ai/models/low_stock_preprocessor.joblib
Ai/models/profit_model.keras
Ai/models/profit_preprocessor.joblib
```

---

## 13. Prediksi Produk Lama

Produk lama adalah produk yang sudah ada di dataset AI.

Backend bisa cukup mengirim `kode_barang`.

Endpoint:

```http
POST /predict/all
Content-Type: application/json
```

Request:

```json
{
  "kode_barang": "R1284"
}
```

PowerShell test:

```powershell
$body = @{
  kode_barang = "R1284"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8000/predict/all" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Contoh response:

```json
{
  "matched_product": {
    "match_type": "kode_barang_exact",
    "query": "R1284",
    "matched_score": 1.0,
    "kode_barang": "R1284",
    "nama": "REJOICE SHP 200ML COMPLETE",
    "kategori": "SHAMPOO",
    "sub_kategori": "",
    "supplier": "SUPPLIER A"
  },
  "fast_moving": {
    "class_id": 2,
    "prediction": "Fast Moving",
    "confidence": 0.93
  },
  "low_stock": {
    "class_id": 1,
    "prediction": "Restock Priority",
    "confidence": 0.88,
    "restock_priority_score": 0.88
  },
  "profit": {
    "estimated_profit_ratio": 0.07,
    "estimated_profit_percent": 7.0,
    "profit_category": "Low Profit"
  }
}
```

---

## 14. Prediksi Produk Berdasarkan Nama

Jika backend belum punya `kode_barang`, backend bisa mengirim `nama_barang`.

Request:

```json
{
  "nama_barang": "INDOMIE RENDANG"
}
```

AI akan mencoba mencari produk berdasarkan:

1. Nama exact.
2. Nama contains.
3. Fuzzy matching.
4. Manual features jika backend mengirim fitur lengkap.

Kemungkinan `match_type`:

```text
kode_barang_exact
name_exact
name_contains
name_fuzzy
manual_features
```

Penjelasan:

| Match Type          | Arti                                         |
| ------------------- | -------------------------------------------- |
| `kode_barang_exact` | Produk ditemukan dari kode barang            |
| `name_exact`        | Nama produk cocok persis                     |
| `name_contains`     | Nama produk mengandung keyword               |
| `name_fuzzy`        | Nama produk mirip dengan query               |
| `manual_features`   | Produk memakai fitur lengkap dari Backend FS |

---

## 15. Prediksi Produk Baru / Produk Client

Untuk produk baru atau produk dari toko/client yang belum ada di dataset AI, backend harus mengirim fitur lengkap dari database.

Request:

```json
{
  "nama_barang": "KOPI ABC 20GR",
  "kategori": "MINUMAN",
  "sub_kategori": "KOPI",
  "supplier": "SUPPLIER TOKO A",
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
  "trx_total_profit": 10000
}
```

Jika produk tidak ditemukan di dataset AI tetapi fitur lengkap dikirim, AI akan memakai:

```text
manual_features
```

Ini penting untuk production karena produk tiap toko/client bisa berbeda-beda.

---

## 16. Field yang Sebaiknya Dikirim Backend FS

### Identitas Produk

| Field          | Status                  | Keterangan      |
| -------------- | ----------------------- | --------------- |
| `kode_barang`  | Opsional                | Kode produk     |
| `nama_barang`  | Wajib untuk produk baru | Nama produk     |
| `kategori`     | Disarankan              | Kategori produk |
| `sub_kategori` | Opsional                | Sub kategori    |
| `supplier`     | Disarankan              | Supplier        |
| `satuan_1`     | Opsional                | Satuan produk   |

### Harga dan Profit

| Field               | Status     | Keterangan            |
| ------------------- | ---------- | --------------------- |
| `hpp`               | Disarankan | Harga pokok pembelian |
| `harga_toko_1`      | Disarankan | Harga jual utama      |
| `harga_jual`        | Opsional   | Alternatif harga jual |
| `trx_total_revenue` | Disarankan | Total omzet produk    |
| `trx_total_profit`  | Disarankan | Total profit produk   |

### Stok

| Field         | Status     | Keterangan            |
| ------------- | ---------- | --------------------- |
| `stok_min`    | Disarankan | Minimum stok          |
| `stok_max`    | Disarankan | Maksimum stok         |
| `total_stock` | Disarankan | Total stok tersedia   |
| `stock`       | Opsional   | Alternatif total stok |
| `toko`        | Opsional   | Stok toko             |
| `gudang`      | Opsional   | Stok gudang           |

### Transaksi

| Field               | Status            | Keterangan                   |
| ------------------- | ----------------- | ---------------------------- |
| `trx_total_qty`     | Sangat disarankan | Total qty terjual            |
| `trx_qty_30d`       | Sangat disarankan | Qty terjual 30 hari terakhir |
| `trx_qty_60d`       | Disarankan        | Qty terjual 60 hari terakhir |
| `trx_qty_90d`       | Sangat disarankan | Qty terjual 90 hari terakhir |
| `trx_count`         | Disarankan        | Jumlah transaksi             |
| `trx_total_revenue` | Disarankan        | Total omzet                  |
| `trx_total_profit`  | Disarankan        | Total profit                 |

---

## 17. Realtime Product Search dari Database FS

Untuk production, search produk sebaiknya memakai data dari database FS.

Endpoint:

```http
POST /products/search
Content-Type: application/json
```

Request:

```json
{
  "q": "kopi",
  "limit": 10,
  "products": [
    {
      "kode_barang": "FS001",
      "nama_barang": "KOPI ABC 20GR",
      "kategori": "MINUMAN",
      "supplier": "SUPPLIER TOKO A",
      "hpp": 1500,
      "harga_toko_1": 2000,
      "stok_min": 10,
      "stok_max": 100,
      "total_stock": 7,
      "trx_total_qty": 120,
      "trx_qty_30d": 45,
      "trx_qty_60d": 80,
      "trx_qty_90d": 120,
      "trx_count": 60,
      "trx_total_revenue": 240000,
      "trx_total_profit": 60000
    }
  ]
}
```

Expected response:

```json
{
  "source": "fs_payload",
  "query": "kopi",
  "count": 1,
  "items": [
    {
      "kode_barang": "FS001",
      "nama": "KOPI ABC 20GR",
      "kategori": "MINUMAN",
      "supplier": "SUPPLIER TOKO A",
      "match_score": 1.0
    }
  ]
}
```

---

## 18. Realtime Recommendation dari Database FS

Untuk production, gunakan endpoint POST berikut:

```text
POST /recommendations/top-products
POST /recommendations/high-profit
POST /recommendations/restock-priority
```

Payload:

```json
{
  "limit": 10,
  "products": [
    {
      "kode_barang": "FS001",
      "nama_barang": "KOPI ABC 20GR",
      "kategori": "MINUMAN",
      "supplier": "SUPPLIER TOKO A",
      "hpp": 1500,
      "harga_toko_1": 2000,
      "stok_min": 10,
      "stok_max": 100,
      "total_stock": 7,
      "trx_total_qty": 120,
      "trx_qty_30d": 45,
      "trx_qty_60d": 80,
      "trx_qty_90d": 120,
      "trx_count": 60,
      "trx_total_revenue": 240000,
      "trx_total_profit": 60000
    }
  ]
}
```

### A. Top Products

Endpoint:

```http
POST /recommendations/top-products
```

Dipakai untuk menampilkan produk dengan aktivitas penjualan tertinggi.

### B. High Profit

Endpoint:

```http
POST /recommendations/high-profit
```

Dipakai untuk menampilkan produk dengan estimasi profit tertinggi.

### C. Restock Priority

Endpoint:

```http
POST /recommendations/restock-priority
```

Dipakai untuk menampilkan produk yang perlu diprioritaskan untuk restock.

---

## 19. Realtime Insight Summary dari Database FS

Endpoint:

```http
POST /insights/summary
Content-Type: application/json
```

Request:

```json
{
  "today": {
    "date": "2026-05-31",
    "revenue": 250000,
    "expense": 170000,
    "profit": 80000,
    "transactions": 35
  },
  "previous_period": {
    "avg_revenue": 200000,
    "avg_expense": 150000,
    "avg_profit": 50000,
    "avg_transactions": 25
  },
  "stock": {
    "total_products": 4,
    "low_stock_products": 2,
    "out_of_stock_products": 1
  },
  "products": [
    {
      "kode_barang": "FS001",
      "nama_barang": "KOPI ABC 20GR",
      "kategori": "MINUMAN",
      "hpp": 1500,
      "harga_toko_1": 2000,
      "stok_min": 10,
      "total_stock": 7,
      "trx_total_qty": 120,
      "trx_qty_30d": 45,
      "trx_count": 60,
      "trx_total_revenue": 240000,
      "trx_total_profit": 60000
    }
  ]
}
```

Response:

```json
{
  "source": "fs_payload",
  "summary": {
    "date": "2026-05-31",
    "revenue": 250000,
    "expense": 170000,
    "profit": 80000,
    "transactions": 35,
    "total_products": 4,
    "low_stock_products": 2,
    "out_of_stock_products": 1
  },
  "insights": [
    "Revenue hari ini naik dibanding periode sebelumnya.",
    "Ada produk yang perlu diprioritaskan untuk restock."
  ]
}
```

---

## 20. Realtime Forecast KPI dari Database FS

Endpoint:

```http
POST /forecast/daily-kpi
Content-Type: application/json
```

Request:

```json
{
  "horizon_days": 7,
  "history": [
    {
      "date": "2026-05-20",
      "revenue": 100000,
      "expense": 70000,
      "profit": 30000,
      "transactions": 20
    },
    {
      "date": "2026-05-21",
      "revenue": 120000,
      "expense": 80000,
      "profit": 40000,
      "transactions": 25
    },
    {
      "date": "2026-05-22",
      "revenue": 130000,
      "expense": 90000,
      "profit": 40000,
      "transactions": 30
    }
  ]
}
```

Minimal butuh 3 data history KPI harian.

Response:

```json
{
  "source": "fs_payload",
  "method": "trailing_average_with_light_trend",
  "horizon_days": 7,
  "history_days": 3,
  "forecast": [
    {
      "date": "2026-05-23",
      "predicted_revenue": 120000,
      "predicted_expense": 80000,
      "predicted_profit": 40000,
      "predicted_transactions": 25
    }
  ]
}
```

---

## 21. Aturan Produk Baru dengan Data Transaksi Sedikit

Kalau produk baru belum punya cukup data transaksi, backend tetap boleh mengirim request ke AI.

Namun frontend harus memberi label bahwa hasilnya masih estimasi awal.

Contoh aturan:

```text
Jika trx_count < 5:
  tampilkan "Prediksi awal, data transaksi belum cukup."

Jika trx_count >= 5:
  tampilkan hasil AI normal.
```

Contoh copywriting:

```text
Data penjualan produk ini masih sedikit. Hasil AI masih berupa estimasi awal dan bisa berubah setelah transaksi bertambah.
```

---

## 22. Mapping Hasil AI ke UI

### A. Fast Moving

Field:

```json
{
  "prediction": "Fast Moving",
  "confidence": 0.93
}
```

Mapping UI:

| Prediction    | Tampilan UI        |
| ------------- | ------------------ |
| `Fast Moving` | Produk cepat laku  |
| `Normal`      | Penjualan normal   |
| `Slow Moving` | Produk lambat laku |

Copywriting:

```text
Produk ini termasuk Fast Moving. Pastikan stok tetap tersedia agar tidak kehabisan.
```

### B. Low Stock / Restock

Field:

```json
{
  "prediction": "Restock Priority",
  "restock_priority_score": 0.88,
  "message": "Produk perlu diprioritaskan untuk restock."
}
```

Mapping UI:

| Prediction         | Tampilan UI   |
| ------------------ | ------------- |
| `Restock Priority` | Perlu restock |
| `Stock Safe`       | Stok aman     |

Copywriting:

```text
Produk ini perlu diprioritaskan untuk restock berdasarkan pola penjualan dan stok saat ini.
```

### C. Profit

Field:

```json
{
  "estimated_profit_ratio": 0.15,
  "estimated_profit_percent": 15.0,
  "profit_category": "Medium Profit"
}
```

Mapping UI:

| Profit Category | Tampilan UI   |
| --------------- | ------------- |
| `High Profit`   | Profit tinggi |
| `Medium Profit` | Profit sedang |
| `Low Profit`    | Profit rendah |

Copywriting:

```text
Produk ini memiliki estimasi profit sedang. Owner dapat meninjau harga jual, HPP, dan strategi promosi.
```

---

## 23. Catatan Role Owner dan Karyawan

Untuk sementara, multi-role belum diprioritaskan.

Namun jika nanti multi-role diterapkan, aturan berikut sebaiknya digunakan.

### Owner boleh melihat:

```text
HPP
harga modal
profit
margin
estimated_profit_ratio
estimated_profit_percent
profit_category
high profit recommendation
forecast profit
laporan profit
insight strategis
```

### Karyawan tidak boleh melihat:

```text
HPP
harga modal
profit
margin
estimated_profit_ratio
estimated_profit_percent
profit_category
high profit recommendation
forecast profit
```

### Karyawan boleh melihat:

```text
nama produk
stok
status fast moving
status restock
search produk
OCR nota
input transaksi
input barang masuk
```

Contoh filter response untuk Karyawan:

Sebelum difilter:

```json
{
  "matched_product": {},
  "fast_moving": {},
  "low_stock": {},
  "profit": {}
}
```

Setelah difilter:

```json
{
  "matched_product": {},
  "fast_moving": {},
  "low_stock": {}
}
```

Contoh function filter:

```ts
function filterAiResultByRole(aiResult: any, role: "owner" | "karyawan") {
  if (role === "owner") {
    return aiResult;
  }

  const { profit, ...safeResult } = aiResult;
  return safeResult;
}
```

---

## 24. OCR Nota/Faktur

Endpoint:

```http
POST /ocr/scan-receipt
Content-Type: multipart/form-data
```

Field file:

```text
file
```

Format file yang disarankan:

```text
.jpg
.jpeg
.png
.webp
```

Contoh test:

```powershell
curl.exe -X POST "http://localhost:8000/ocr/scan-receipt" `
  -F "file=@C:\Users\sandi\Downloads\nota.jpg"
```

Contoh response:

```json
{
  "merchant_name": "TOKO MAJU JAYA",
  "transaction_date": "2026-05-31",
  "items": [
    {
      "nama_produk": "INDOMIE RENDANG",
      "qty": 2,
      "harga": 3500,
      "total": 7000
    }
  ],
  "subtotal": 7000,
  "tax": 0,
  "discount": 0,
  "total_transaksi": 7000,
  "confidence": 0.87,
  "raw_text": "..."
}
```

Flow OCR yang benar:

```text
User upload nota
   ↓
AI membaca nota
   ↓
Frontend menampilkan hasil OCR
   ↓
User cek dan edit manual
   ↓
User klik simpan
   ↓
Backend menyimpan ke database
```

Untuk production, OCR juga sebaiknya lewat Backend Fullstack:

```text
Frontend upload nota
   ↓
Backend Fullstack menerima file
   ↓
Backend Fullstack forward file ke AI /ocr/scan-receipt
   ↓
AI mengembalikan hasil OCR
   ↓
Backend mengirim hasil OCR ke frontend
   ↓
User cek dan edit manual
   ↓
User klik simpan
   ↓
Backend menyimpan hasil final ke database
```

Hasil OCR tidak boleh langsung disimpan otomatis ke database.

Alasannya:

1. OCR bisa salah baca nama barang.
2. OCR bisa salah baca qty.
3. OCR bisa salah baca harga.
4. OCR bisa salah baca total.
5. User tetap harus validasi manual.

---

## 25. Contoh Integrasi Backend FS ke AI

Gunakan environment variable:

```env
AI_BASE_URL=http://localhost:8000
```

Contoh service TypeScript:

```ts
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

export async function predictProduct(productPayload: any) {
  const response = await fetch(`${AI_BASE_URL}/predict/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(productPayload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "AI prediction failed");
  }

  return response.json();
}
```

Contoh dengan timeout:

```ts
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

export async function predictProductWithTimeout(payload: any) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${AI_BASE_URL}/predict/all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || "AI prediction failed");
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw new Error("AI service timeout or unavailable");
  }
}
```

---

## 26. Error Handling

Backend FS harus siap menangani error dari AI.

### A. Produk Tidak Ditemukan

Status:

```text
404
```

Contoh response:

```json
{
  "detail": "nama_barang 'PRODUK X' tidak ditemukan di dataset AI. Untuk produk baru, backend FS harus mengirim fitur lengkap produk."
}
```

Frontend message:

```text
Produk belum ditemukan di data AI. Lengkapi data produk terlebih dahulu agar AI bisa melakukan estimasi.
```

### B. Payload Tidak Valid

Status:

```text
400
```

Frontend message:

```text
Data produk belum lengkap atau format tidak valid.
```

### C. AI Service Error

Status:

```text
500
```

Frontend message:

```text
Layanan AI sedang bermasalah. Silakan coba lagi nanti.
```

### D. AI Timeout

Frontend message:

```text
Layanan AI membutuhkan waktu terlalu lama. Silakan coba lagi.
```

---

## 27. Hal yang Wajib Dihindari FS

Jangan lakukan ini:

```text
1. Jangan menganggap AI sebagai database utama.
2. Jangan hanya kirim nama_barang untuk produk baru tanpa fitur stok/transaksi.
3. Jangan memakai data toko lain untuk prediksi toko berbeda.
4. Jangan hardcode URL AI di frontend production.
5. Jangan menyimpan GEMINI_API_KEY di frontend.
6. Jangan pakai endpoint GET DS sebagai data utama production multi-client.
7. Jangan frontend langsung hit AI service pada production.
8. Jangan simpan hasil OCR otomatis tanpa review user.
9. Jangan biarkan request Backend ke AI tanpa timeout.
10. Jangan commit file .env asli ke GitHub.
```

Jika multi-role nanti diterapkan:

```text
11. Jangan tampilkan profit ke Karyawan.
12. Jangan tampilkan HPP ke Karyawan.
13. Jangan tampilkan margin ke Karyawan.
```

---

## 28. Test Otomatis AI Lokal

Pastikan API sudah jalan.

Terminal 1:

```powershell
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
venv\Scripts\activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2:

```powershell
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
venv\Scripts\activate
python tests\auto_test_api.py --base-url http://localhost:8000 --limit 20
```

Expected result:

```text
Passed : 130+
Failed : 0
Skipped: 1
Status : PASSED
```

`Skipped: 1` biasanya OCR karena belum diberi gambar nota.

Untuk test OCR:

```powershell
python tests\auto_test_api.py `
  --base-url http://localhost:8000 `
  --limit 20 `
  --ocr-image "C:\Users\sandi\Downloads\nota.jpg" `
  --require-ocr
```

Expected result jika OCR ikut dites:

```text
Passed : 130+
Failed : 0
Skipped: 0
Status : PASSED
```

---

## 29. Test Realtime Endpoint FS

Pastikan API lokal sedang berjalan:

```powershell
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Lalu jalankan:

```powershell
python tests\auto_test_realtime_api.py
```

Expected result:

```text
PASSED: all realtime endpoint tests
```

Jika gagal di bagian health realtime, cek response:

```powershell
curl.exe http://localhost:8000/health
```

Jika hasilnya:

```json
{
  "realtime": false
}
```

berarti file `src/realtime_analytics.py` belum terbaca atau masih ada error import.

---

## 30. Test Manual Endpoint Penting

### Health

```powershell
curl.exe http://localhost:8000/health
```

### Metadata

```powershell
curl.exe http://localhost:8000/metadata
```

### Product Search

```powershell
curl.exe "http://localhost:8000/products/search?q=beras&limit=10"
```

### Predict All

```powershell
$body = @{
  kode_barang = "R1284"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8000/predict/all" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Recommendations

```powershell
curl.exe "http://localhost:8000/recommendations/top-products?limit=10"
curl.exe "http://localhost:8000/recommendations/high-profit?limit=10"
curl.exe "http://localhost:8000/recommendations/restock-priority?limit=10"
```

### Insight

```powershell
curl.exe "http://localhost:8000/insights/summary"
```

### Forecast

```powershell
curl.exe "http://localhost:8000/forecast/daily-kpi?days=7"
```

---

## 31. Training Model

Untuk training semua model:

```powershell
python train_all.py --epochs 30 --profit-epochs 40
```

Training akan menghasilkan artifact di folder `models/`:

```text
fast_moving_model.keras
fast_moving_preprocessor.joblib
fast_moving_model.training_summary.json

low_stock_model.keras
low_stock_preprocessor.joblib
low_stock_model.training_summary.json

profit_model.keras
profit_preprocessor.joblib
profit_model.training_summary.json
```

Jika model sudah ada dan test passed, training ulang tidak wajib dilakukan.

Training ulang dilakukan jika:

1. Dataset berubah banyak.
2. Ada data transaksi baru yang lebih valid.
3. Model perlu diperbaiki.
4. Ada perubahan feature engineering.
5. Ada perubahan label/target model.

---

## 32. Docker

AI service bisa dijalankan menggunakan Docker.

Pastikan `Dockerfile` memakai port dari environment variable `PORT`.

Contoh command final pada Dockerfile:

```dockerfile
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
```

Pastikan `.dockerignore` tersedia agar file yang tidak perlu tidak masuk image.

Isi `.dockerignore` yang disarankan:

```dockerignore
venv/
__pycache__/
.pytest_cache/
*.pyc
*.pyo
*.pyd
.env
.env.*
logs/
*.log
.git/
.gitignore
docker-compose.yml
README.md
```

Jangan masukkan `models/` ke `.dockerignore`, karena model harus ikut masuk ke Docker image.

---

## 33. Docker Build Test

Build image dari folder `Ai`:

```powershell
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
docker build --progress=plain -t tata-arta-ai .
```

Jika build pertama lama, biasanya karena download dependency besar seperti TensorFlow.

Itu bukan berarti kode AI rusak.

---

## 34. Docker Run Test

Jalankan container:

```powershell
docker run --rm `
  --name tata-arta-ai-test `
  -p 8001:10000 `
  --env-file .env `
  -e PORT=10000 `
  tata-arta-ai
```

Penjelasan:

```text
-p 8001:10000
```

Artinya:

```text
localhost:8001 di laptop
   ↓
port 10000 di container
```

Cek health dari terminal baru:

```powershell
curl.exe http://localhost:8001/health
```

Jalankan test otomatis ke Docker container:

```powershell
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
venv\Scripts\activate

python tests\auto_test_api.py --base-url http://localhost:8001 --limit 20
```

Jika ingin test OCR di Docker:

```powershell
python tests\auto_test_api.py `
  --base-url http://localhost:8001 `
  --limit 20 `
  --ocr-image "C:\Users\sandi\Downloads\nota.jpg" `
  --require-ocr
```

Expected result:

```text
Failed : 0
Status : PASSED
```

Jika OCR ikut dites:

```text
Failed : 0
Skipped: 0
Status : PASSED
```

---

## 35. Docker Troubleshooting

### A. Docker command tidak dikenali

Error:

```text
docker : The term 'docker' is not recognized
```

Solusi:

```text
Install Docker Desktop.
Buka Docker Desktop.
Pastikan Docker Desktop running.
Buka ulang PowerShell/VSCode.
```

### B. Docker daemon belum jalan

Error:

```text
failed to connect to the docker API
```

Solusi:

```text
Buka Docker Desktop dari Start Menu.
Tunggu sampai status Docker Desktop running.
Jalankan docker info.
```

Command cek:

```powershell
docker info
```

### C. Build lama di TensorFlow

Jika stuck di:

```text
Downloading tensorflow...
```

Itu karena TensorFlow berukuran besar.

Solusi:

```text
Tunggu sampai selesai jika koneksi stabil.
Pastikan internet stabil.
Gunakan docker build --progress=plain agar terlihat prosesnya.
```

---

## 36. Render Deployment

AI service bisa dideploy ke Render sebagai Docker Web Service.

Setting Render:

```text
New Web Service
Repository      : capstone66/Tata-Arta
Root Directory  : Ai
Runtime         : Docker
Dockerfile Path : Dockerfile
```

Environment variables di Render:

```env
APP_ENV=production
TF_CPP_MIN_LOG_LEVEL=2
CORS_ALLOW_ORIGINS=*
GEMINI_API_KEY=ISI_API_KEY_GEMINI
GEMINI_OCR_MODEL=gemini-3.5-flash
```

Setelah deploy, cek:

```powershell
curl.exe https://URL-AI-SERVICE.onrender.com/health
```

Expected response:

```json
{
  "status": "ok",
  "models": {
    "fast_moving": true,
    "low_stock": true,
    "profit": true
  },
  "realtime": true
}
```

---

## 37. Test Remote Setelah Deploy

Setelah AI berhasil deploy ke Render, jalankan test dari laptop:

```powershell
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
venv\Scripts\activate

python tests\auto_test_api.py `
  --base-url https://URL-AI-SERVICE.onrender.com `
  --limit 20 `
  --skip-local-files
```

Jika ingin test OCR di service online:

```powershell
python tests\auto_test_api.py `
  --base-url https://URL-AI-SERVICE.onrender.com `
  --limit 20 `
  --ocr-image "C:\Users\sandi\Downloads\nota.jpg" `
  --require-ocr `
  --skip-local-files
```

Target:

```text
Failed : 0
Status : PASSED
```

Jika OCR ikut dites:

```text
Failed : 0
Skipped: 0
Status : PASSED
```

---

## 38. Integrasi dengan Backend Fullstack

Setelah AI berhasil deploy, update `.env` di Backend Fullstack.

Local AI:

```env
AI_BASE_URL=http://localhost:8000
```

Docker AI local test:

```env
AI_BASE_URL=http://localhost:8001
```

Production AI Render:

```env
AI_BASE_URL=https://URL-AI-SERVICE.onrender.com
```

Backend Fullstack akan memanggil AI menggunakan `AI_BASE_URL`.

---

## 39. Production Checklist

Sebelum production, pastikan:

```text
[ ] AI service berhasil deploy.
[ ] GET /health menghasilkan status ok.
[ ] GET /health menghasilkan realtime=true.
[ ] Semua model bernilai true.
[ ] python tests\auto_test_api.py --limit 20 berhasil.
[ ] python tests\auto_test_realtime_api.py berhasil.
[ ] Docker build berhasil.
[ ] Docker run berhasil.
[ ] Test ke Docker container berhasil.
[ ] Test OCR berhasil jika memakai --require-ocr.
[ ] Backend Fullstack memakai AI_BASE_URL dari .env.
[ ] Frontend tidak langsung hit AI service.
[ ] Backend Fullstack memakai endpoint POST realtime.
[ ] Backend Fullstack tidak memakai endpoint GET DS untuk data production multi-client.
[ ] Backend Fullstack mengirim payload produk lengkap.
[ ] OCR wajib review manual sebelum simpan.
[ ] GEMINI_API_KEY tidak disimpan di frontend.
[ ] .env asli tidak masuk GitHub.
[ ] Backend punya timeout dan error handling saat AI service down.
[ ] CORS production disesuaikan dengan domain frontend/backend jika sudah final.
```

Jika multi-role nanti diterapkan:

```text
[ ] Backend Fullstack memfilter profit/HPP untuk Karyawan.
[ ] Frontend menyembunyikan field profit/HPP dari Karyawan.
```

---

## 40. Aturan Production untuk Multi-Client

Untuk banyak toko/client, Backend FS wajib mengirim data sesuai toko masing-masing.

Contoh alur:

```text
User toko A klik analisis produk
   ↓
Backend ambil produk dari database toko A
   ↓
Backend hitung stok, transaksi, revenue, profit toko A
   ↓
Backend kirim payload lengkap ke AI
   ↓
AI mengembalikan prediksi
   ↓
Backend mengirim hasil ke frontend
   ↓
Frontend menampilkan hasil
```

Jangan memakai data toko lain untuk prediksi toko berbeda.

AI tidak perlu menyimpan semua data toko.

Backend cukup mengirim fitur produk yang sudah dihitung dari database masing-masing toko.

---

## 41. Kesimpulan untuk Fullstack

Untuk production realtime:

```text
1. Backend Fullstack menjadi penghubung antara frontend dan AI.
2. Endpoint utama prediksi adalah POST /predict/all.
3. Produk lama boleh dikirim dengan kode_barang.
4. Produk baru wajib dikirim dengan fitur lengkap.
5. Endpoint GET dipakai untuk demo/fallback DS.
6. Endpoint POST dipakai untuk realtime dari database FS.
7. AI hanya memproses data yang dikirim backend.
8. Backend tetap menjadi sumber data utama.
9. OCR wajib manual: scan → review/edit → simpan.
10. Untuk banyak toko/client, backend harus menghitung fitur dari database masing-masing toko.
11. Multi-role bisa ditambahkan nanti jika sudah dibutuhkan.
```

AI service siap dipakai oleh Fullstack selama backend mengirim payload yang benar, memakai endpoint POST untuk production realtime, dan melakukan error handling dengan benar.

---

## 42. File yang Boleh Di-commit

File AI yang boleh di-commit:

```text
Ai/README.md
Ai/Dockerfile
Ai/.dockerignore
Ai/.env.example
Ai/requirements.txt
Ai/api/
Ai/src/
Ai/ocr/
Ai/tests/
Ai/models/
Ai/train_all.py
```

File yang tidak boleh di-commit:

```text
Ai/.env
Ai/venv/
Ai/__pycache__/
Ai/.pytest_cache/
Ai/logs/
```

---

## 43. Git Workflow

Setelah perubahan selesai, cek status:

```powershell
cd C:\Users\sandi\Downloads\Projek\Tata-Arta
git status
```

Tambahkan file yang berubah:

```powershell
git add Ai/README.md Ai/Dockerfile Ai/.dockerignore Ai/.env.example Ai/requirements.txt
```

Commit:

```powershell
git commit -m "docs: complete AI README for deployment"
```

Push:

```powershell
git push origin main
```

Jika hanya README yang berubah:

```powershell
git add Ai/README.md
git commit -m "docs: complete AI README"
git push origin main
```



## Quick Guide untuk Tim Fullstack

Bagian ini adalah ringkasan cepat untuk integrasi Backend Fullstack ke AI service.

### 1. URL AI Service

Backend Fullstack harus menyimpan URL AI di `.env`.

Local:

```env
AI_BASE_URL=http://localhost:8000
```

Docker local test:

```env
AI_BASE_URL=http://localhost:8001
```

Production:

```env
AI_BASE_URL=https://URL-AI-SERVICE.onrender.com
```

Gunakan nama env:

```env
AI_BASE_URL
```

Jangan gunakan `AI_API_BASE_URL` jika kode backend membaca `AI_BASE_URL`.

---

### 2. Endpoint Utama untuk Prediksi Produk

Endpoint utama yang dipakai Backend FS:

```http
POST /predict/all
```

Full URL local:

```text
http://localhost:8000/predict/all
```

Full URL production:

```text
https://URL-AI-SERVICE.onrender.com/predict/all
```

Endpoint ini mengembalikan 3 hasil sekaligus:

1. Fast moving prediction.
2. Low stock / restock prediction.
3. Profit prediction.

---

### 3. Cara Pakai untuk Produk Lama

Jika produk sudah ada di dataset AI, backend cukup mengirim `kode_barang`.

Request:

```json
{
  "kode_barang": "R1284"
}
```

Contoh fetch dari Backend FS:

```ts
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

export async function predictExistingProduct(kodeBarang: string) {
  const response = await fetch(`${AI_BASE_URL}/predict/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      kode_barang: kodeBarang
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "AI prediction failed");
  }

  return response.json();
}
```

---

### 4. Cara Pakai untuk Produk Baru dari Database FS

Jika produk belum ada di dataset AI, backend harus mengirim fitur lengkap produk.

Request minimal yang disarankan:

```json
{
  "kode_barang": "FS001",
  "nama_barang": "KOPI ABC 20GR",
  "kategori": "MINUMAN",
  "sub_kategori": "KOPI",
  "supplier": "SUPPLIER TOKO A",
  "hpp": 1500,
  "harga_toko_1": 2000,
  "stok_min": 10,
  "stok_max": 100,
  "total_stock": 50,
  "trx_total_qty": 120,
  "trx_qty_30d": 45,
  "trx_qty_60d": 80,
  "trx_qty_90d": 120,
  "trx_count": 60,
  "trx_total_revenue": 240000,
  "trx_total_profit": 60000
}
```

Contoh fetch dari Backend FS:

```ts
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

export async function predictProductFromDatabase(product: any) {
  const payload = {
    kode_barang: product.kodeBarang,
    nama_barang: product.nama,
    kategori: product.kategori,
    sub_kategori: product.subKategori,
    supplier: product.supplier,
    hpp: product.hpp,
    harga_toko_1: product.hargaJual,
    stok_min: product.stokMin,
    stok_max: product.stokMax,
    total_stock: product.totalStock,
    trx_total_qty: product.totalQtySold,
    trx_qty_30d: product.qtySold30d,
    trx_qty_60d: product.qtySold60d,
    trx_qty_90d: product.qtySold90d,
    trx_count: product.transactionCount,
    trx_total_revenue: product.totalRevenue,
    trx_total_profit: product.totalProfit
  };

  const response = await fetch(`${AI_BASE_URL}/predict/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "AI prediction failed");
  }

  return response.json();
}
```

Jika response memiliki:

```json
{
  "match_type": "manual_features"
}
```

berarti AI memakai fitur yang dikirim dari Backend FS, bukan dataset demo AI.

---

### 5. Response yang Perlu Dipakai Frontend

Contoh response utama:

```json
{
  "matched_product": {
    "kode_barang": "FS001",
    "nama": "KOPI ABC 20GR",
    "kategori": "MINUMAN",
    "match_type": "manual_features"
  },
  "fast_moving": {
    "prediction": "Fast Moving",
    "confidence": 0.93
  },
  "low_stock": {
    "prediction": "Restock Priority",
    "confidence": 0.88,
    "restock_priority_score": 0.88,
    "message": "Produk perlu diprioritaskan untuk restock."
  },
  "profit": {
    "estimated_profit_ratio": 0.15,
    "estimated_profit_percent": 15.0,
    "profit_category": "Medium Profit"
  }
}
```

Mapping ke UI:

| Field AI                           | Dipakai untuk                          |
| ---------------------------------- | -------------------------------------- |
| `fast_moving.prediction`           | Status produk cepat/lambat laku        |
| `fast_moving.confidence`           | Tingkat keyakinan prediksi fast moving |
| `low_stock.prediction`             | Status stok aman/perlu restock         |
| `low_stock.restock_priority_score` | Skor prioritas restock                 |
| `low_stock.message`                | Pesan rekomendasi restock              |
| `profit.profit_category`           | Kategori profit produk                 |
| `profit.estimated_profit_percent`  | Estimasi persentase profit             |

---

### 6. Endpoint Rekomendasi Realtime

Untuk production, Backend FS sebaiknya memakai endpoint POST realtime.

Top products:

```http
POST /recommendations/top-products
```

High profit:

```http
POST /recommendations/high-profit
```

Restock priority:

```http
POST /recommendations/restock-priority
```

Payload:

```json
{
  "limit": 10,
  "products": [
    {
      "kode_barang": "FS001",
      "nama_barang": "KOPI ABC 20GR",
      "kategori": "MINUMAN",
      "hpp": 1500,
      "harga_toko_1": 2000,
      "stok_min": 10,
      "stok_max": 100,
      "total_stock": 7,
      "trx_total_qty": 120,
      "trx_qty_30d": 45,
      "trx_qty_60d": 80,
      "trx_qty_90d": 120,
      "trx_count": 60,
      "trx_total_revenue": 240000,
      "trx_total_profit": 60000
    }
  ]
}
```

---

### 7. Endpoint Insight dan Forecast Realtime

Insight summary:

```http
POST /insights/summary
```

Forecast KPI:

```http
POST /forecast/daily-kpi
```

Gunakan endpoint ini jika Backend FS sudah punya data dashboard, transaksi, stok, revenue, expense, dan profit dari database.

---

### 8. OCR Nota/Faktur

Endpoint AI:

```http
POST /ocr/scan-receipt
```

Format request:

```text
multipart/form-data
field: file
```

Flow yang benar:

```text
Frontend upload nota
   ↓
Backend FS menerima file
   ↓
Backend FS forward file ke AI /ocr/scan-receipt
   ↓
AI mengembalikan hasil OCR
   ↓
Backend FS mengirim hasil OCR ke frontend
   ↓
User cek dan edit hasil OCR
   ↓
User klik simpan
   ↓
Backend FS menyimpan data final ke database
```

Catatan penting:

```text
Hasil OCR tidak boleh langsung disimpan otomatis.
User harus cek dan edit dulu sebelum disimpan.
```

---

### 9. Error Handling Wajib di Backend FS

Backend FS harus menangani kondisi berikut:

| Kondisi                | Tindakan Backend                                    |
| ---------------------- | --------------------------------------------------- |
| AI service mati        | Return message “Layanan AI sedang tidak tersedia.”  |
| AI timeout             | Return message “AI membutuhkan waktu terlalu lama.” |
| Produk tidak ditemukan | Kirim ulang dengan fitur lengkap produk             |
| Payload tidak lengkap  | Return validasi ke frontend                         |
| OCR gagal              | Minta user upload ulang / input manual              |

Contoh fetch dengan timeout:

```ts
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

export async function callAiWithTimeout(path: string, payload: any) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${AI_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.detail || "AI request failed");
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw new Error("AI service timeout or unavailable");
  }
}
```

---

### 10. Hal yang Harus Dihindari Tim FS

Jangan lakukan ini:

```text
1. Jangan frontend langsung hit AI service pada production.
2. Jangan simpan GEMINI_API_KEY di frontend.
3. Jangan hardcode URL AI di kode frontend.
4. Jangan pakai AI sebagai database utama.
5. Jangan hanya kirim nama_barang untuk produk baru tanpa fitur stok/transaksi.
6. Jangan pakai endpoint GET demo DS sebagai sumber utama production.
7. Jangan simpan hasil OCR otomatis tanpa review user.
8. Jangan request ke AI tanpa timeout.
9. Jangan commit .env asli ke GitHub.
```
