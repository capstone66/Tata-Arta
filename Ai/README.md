# Tata-Arta AI Service — Panduan Fullstack Super Lengkap

Dokumen ini dibuat khusus untuk tim **Fullstack (FS)** agar semua orang paham:

1. AI service ini fungsinya apa.
2. Data apa yang harus dikirim ke AI.
3. Endpoint mana yang dipakai di UI tertentu.
4. Request dan response setiap endpoint.
5. Bagaimana handle produk lama, produk baru, dan data yang berbeda dari dataset DS.
6. Bagaimana role Owner dan Karyawan harus dibatasi.
7. Apa saja yang harus dikerjakan FS agar AI benar-benar terpakai di website.
8. Bagaimana OCR harus dibuat manual: scan → review → simpan.
9. Bagaimana cara testing dan deploy.

Base URL lokal AI:

```text
http://localhost:8000
```

Swagger/OpenAPI:

```text
http://localhost:8000/docs
```

Production nanti:

```text
https://URL-DEPLOY-AI-SERVICE
```

---

# 1. Inti Pemahaman untuk Fullstack

AI service Tata-Arta **bukan database utama** dan **bukan pengganti backend**.

AI service hanya bertugas menerima data produk atau file nota, memprosesnya, lalu mengembalikan hasil prediksi/OCR/rekomendasi.

Pembagian tugas:

```text
Frontend:
- Menampilkan halaman dan komponen UI.
- User memilih produk.
- User input transaksi.
- User upload nota OCR.
- User melihat hasil AI.

Backend Fullstack:
- Menyimpan database utama.
- Menyimpan user, role, produk, stok, transaksi, barang masuk, laporan.
- Menentukan akses Owner/Karyawan.
- Mengambil data produk dari database.
- Mengirim request ke AI service.
- Menyimpan hasil transaksi/stok/OCR yang sudah dikonfirmasi user.

AI Service:
- Product search dari data AI.
- Prediksi fast moving.
- Prediksi restock priority.
- Prediksi profit.
- Rekomendasi produk.
- Insight summary.
- Forecast KPI.
- OCR nota/faktur.
```

Arsitektur yang disarankan:

```text
Frontend
↓
Backend Fullstack
↓
AI FastAPI Service
↓
Backend Fullstack
↓
Frontend
```

Frontend boleh langsung memanggil AI service untuk demo, tetapi untuk production lebih aman jika **backend fullstack menjadi proxy**.

---

# 2. Fitur AI yang Sudah Ada

| Fitur AI | Endpoint Utama | Dipakai Untuk |
|---|---|---|
| Product Search | `GET /products/search` | Search/autocomplete barang |
| Predict All | `POST /predict/all` | Analisis produk lengkap |
| Fast Moving | `POST /predict/fast-moving` | Status produk cepat/lambat laku |
| Low Stock / Restock | `POST /predict/low-stock` | Prioritas restock |
| Profit Prediction | `POST /predict/profit` | Estimasi profit produk |
| Top Products | `GET /recommendations/top-products` | Produk terlaris |
| High Profit | `GET /recommendations/high-profit` | Produk margin/profit tinggi |
| Restock Recommendation | `GET /recommendations/restock-priority` | Rekomendasi restock |
| Insight Summary | `GET /insights/summary` | Ringkasan insight dashboard |
| Forecast KPI | `GET /forecast/daily-kpi` | Chart forecast/summary KPI |
| OCR Nota | `POST /ocr/scan-receipt` | Scan nota/faktur manual |
| Health | `GET /health` | Cek service/model |
| Metadata | `GET /metadata` | Info service/model |

Hasil test terakhir:

```text
Passed : 121
Failed : 0
Skipped: 1
Status : PASSED
```

`Skipped: 1` adalah OCR jika tidak diberi file gambar nota saat test otomatis. Itu bukan error.

---

# 3. Yang Harus Dikerjakan FS

FS harus mengaplikasikan AI ke website dengan cara berikut.

## 3.1 Buat environment variable AI di backend

Contoh `.env` backend fullstack:

```env
AI_API_BASE_URL=http://localhost:8000
```

Saat production:

```env
AI_API_BASE_URL=https://URL-DEPLOY-AI-SERVICE
```

## 3.2 Buat proxy route di backend

Jangan hardcode langsung dari frontend ke AI service untuk production. Buat route seperti:

```text
GET  /api/ai/health
GET  /api/ai/search-products
POST /api/ai/predict-all
GET  /api/ai/recommendations/restock
GET  /api/ai/insights
GET  /api/ai/forecast
POST /api/ai/ocr
```

Backend route ini nanti yang memanggil AI FastAPI.

## 3.3 Simpan produk di database fullstack

Database fullstack harus punya tabel produk. Minimal field yang disarankan:

```text
products
- id
- kode_barang
- nama_barang
- kategori
- sub_kategori
- supplier
- satuan
- hpp
- harga_toko_1
- stok_min
- stok_max
- total_stock
- created_at
- updated_at
```

## 3.4 Simpan transaksi di database fullstack

Minimal:

```text
transactions
- id
- kode_barang
- product_id
- qty
- harga_jual
- hpp
- subtotal
- profit
- payment_method
- transaction_date
- created_by
- created_at
```

## 3.5 Backend menghitung fitur produk untuk produk baru

Untuk produk lama dari dataset, cukup kirim `kode_barang`.

Untuk produk baru yang belum ada di dataset AI, backend harus kirim fitur lengkap:

```json
{
  "nama_barang": "Produk Baru",
  "kategori": "MINUMAN",
  "supplier": "Supplier Baru",
  "hpp": 5000,
  "harga_toko_1": 7000,
  "stok_min": 10,
  "stok_max": 100,
  "total_stock": 40,
  "trx_total_qty": 12,
  "trx_qty_30d": 4,
  "trx_qty_90d": 12,
  "trx_count": 5,
  "trx_total_revenue": 84000,
  "trx_total_profit": 24000
}
```

## 3.6 UI harus membedakan Owner dan Karyawan

Owner boleh lihat semua insight strategis. Karyawan tidak boleh lihat profit, HPP, margin, laba, dan insight owner.

## 3.7 OCR harus manual

OCR tidak boleh langsung simpan otomatis. Flow wajib:

```text
Upload nota
↓
AI baca nota
↓
UI tampilkan hasil OCR
↓
User cek/edit manual
↓
User klik Simpan
↓
Backend simpan ke database
```

---

# 4. Setup AI Lokal untuk FS

Masuk folder AI:

```bat
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
```

Buat virtual environment:

```bat
py -3.11 -m venv venv
```

Aktifkan:

```bat
venv\Scripts\activate
```

Install dependency:

```bat
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

Copy env:

```bat
copy .env.example .env
```

Isi `.env` minimal:

```env
GEMINI_API_KEY=ISI_API_KEY_GEMINI
GEMINI_OCR_MODEL=gemini-3.5-flash
APP_ENV=development
TF_CPP_MIN_LOG_LEVEL=2
```

Jalankan API:

```bat
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Buka docs:

```text
http://localhost:8000/docs
```

---

# 5. Cara Memahami Produk Lama, Produk Baru, dan Data Beda DS

## 5.1 Dataset DS dipakai untuk training awal

Dataset dari DS adalah baseline awal untuk melatih model:

```text
products_featured.csv
transactions.csv
daily_kpi.csv
```

Model yang dihasilkan:

```text
fast_moving_model.keras
low_stock_model.keras
profit_model.keras
```

## 5.2 Database website menjadi sumber data utama

Saat website sudah jadi, database fullstack akan menyimpan data asli dari user.

```text
Dataset DS = training awal
Database FS = data asli saat website berjalan
AI = prediksi berdasarkan input dari backend
```

## 5.3 Kalau data website beda dari dataset DS

Tidak masalah, selama backend mengirim data yang cukup.

Untuk produk lama:

```json
{
  "kode_barang": "R1284"
}
```

Untuk nama lengkap:

```json
{
  "nama_barang": "REJOICE SHP 200ML COMPLETE"
}
```

Untuk produk baru:

```json
{
  "nama_barang": "Produk Baru",
  "kategori": "MINUMAN",
  "supplier": "Supplier Baru",
  "hpp": 5000,
  "harga_toko_1": 7000,
  "stok_min": 10,
  "stok_max": 100,
  "total_stock": 40,
  "trx_total_qty": 0,
  "trx_qty_30d": 0,
  "trx_qty_90d": 0,
  "trx_count": 0
}
```

## 5.4 Kalau transaksi produk baru belum cukup

UI wajib menampilkan warning:

```text
Data penjualan belum cukup. Prediksi AI masih estimasi awal.
```

Contoh aturan UI:

```text
if trx_count < 5:
    tampilkan "Estimasi awal"
else:
    tampilkan hasil AI normal
```

---

# 6. Flow Search dan Predict Produk

## 6.1 Kalau user mengetik keyword bebas

Contoh user mengetik:

```text
beras
aqua
susu
indomie
minyak
```

Jangan langsung prediksi. Lakukan search dulu.

```text
GET /products/search?q=beras&limit=10
```

Lalu UI menampilkan list produk. User pilih produk yang benar. Setelah itu backend panggil:

```text
POST /predict/all
```

dengan body:

```json
{
  "kode_barang": "B4533"
}
```

## 6.2 Kalau user memilih produk dari database

Backend langsung ambil `kode_barang`, lalu panggil AI:

```json
{
  "kode_barang": "R1284"
}
```

## 6.3 Kalau hanya punya nama produk lengkap

Bisa langsung:

```json
{
  "nama_barang": "SUN EKONOMIS BERAS MERAH 120GR"
}
```

Tapi FS harus tetap cek response `matched_product`.

---

# 7. Endpoint API Lengkap dengan Request dan Response

## 7.1 GET `/health`

### Fungsi

Cek AI service hidup dan semua model tersedia.

### Method

```http
GET
```

### Body

Tidak ada body.

### Query Params

Tidak ada.

### Request cURL

```bash
curl -X GET "http://localhost:8000/health"
```

### Response 200

```json
{
  "status": "ok",
  "models": {
    "fast_moving": true,
    "low_stock": true,
    "profit": true
  }
}
```

### Yang harus FS lakukan

Gunakan untuk health check saat backend start atau halaman admin/debug.

---

## 7.2 GET `/metadata`

### Fungsi

Mengambil informasi metadata service AI.

### Method

```http
GET
```

### Body

Tidak ada body.

### Query Params

Tidak ada.

### Request cURL

```bash
curl -X GET "http://localhost:8000/metadata"
```

### Response 200

```json
{
  "service": "Tata-Arta AI API",
  "version": "1.0.0",
  "models": {
    "fast_moving": "available",
    "low_stock": "available",
    "profit": "available"
  },
  "features": [
    "product_search",
    "fast_moving_detection",
    "restock_priority_prediction",
    "profit_prediction",
    "recommendation_system",
    "daily_kpi_forecast",
    "gemini_ocr"
  ]
}
```

### Yang harus FS lakukan

Opsional. Dipakai untuk debug/admin page.

---

## 7.3 GET `/products/search`

### Fungsi

Search produk berdasarkan nama untuk autocomplete.

### Method

```http
GET
```

### Body

Tidak ada body.

### Query Params

| Param | Wajib | Contoh | Keterangan |
|---|---:|---|---|
| `q` | Ya | `beras` | keyword produk |
| `limit` | Tidak | `10` | jumlah hasil |

### Request cURL

```bash
curl -X GET "http://localhost:8000/products/search?q=beras&limit=10"
```

### Response 200

```json
{
  "query": "beras",
  "count": 2,
  "items": [
    {
      "kode_barang": "B4533",
      "nama": "BERAS MERAH 2KG",
      "kategori": "SEMBAKO",
      "sub_kategori": "BERAS",
      "supplier": "SUPPLIER A",
      "hpp": 25000,
      "harga_toko_1": 30000,
      "trx_total_qty": 120,
      "trx_count": 38,
      "match_score": 0.83
    },
    {
      "kode_barang": "S6259",
      "nama": "SUN EKONOMIS BERAS MERAH 120GR",
      "kategori": "MAKANAN BAYI",
      "sub_kategori": "0.0",
      "supplier": "TIGA BENUA",
      "hpp": 6500,
      "harga_toko_1": 8000,
      "trx_total_qty": 80,
      "trx_count": 25,
      "match_score": 0.50
    }
  ]
}
```

### Response jika tidak ada hasil

```json
{
  "query": "produkaneh",
  "count": 0,
  "items": []
}
```

### Yang harus FS lakukan

UI menampilkan hasil search, user memilih produk, lalu backend memanggil `/predict/all` dengan `kode_barang`.

---

## 7.4 POST `/predict/all`

### Fungsi

Endpoint utama untuk prediksi lengkap 3 model:

```text
- Fast Moving Detection
- Restock Priority Prediction
- Profit Prediction
```

### Method

```http
POST
```

### Body

Wajib salah satu:

```text
- kode_barang
- nama_barang / nama_produk / nama
- fitur lengkap produk baru
```

### Query Params

Tidak ada.

### Request by kode_barang

```json
{
  "kode_barang": "R1284"
}
```

### Request by nama lengkap

```json
{
  "nama_barang": "SUN EKONOMIS BERAS MERAH 120GR"
}
```

### Request produk baru / data database website

```json
{
  "nama_barang": "Kopi ABC 20gr",
  "kategori": "MINUMAN",
  "supplier": "Supplier Baru",
  "hpp": 1500,
  "harga_toko_1": 2000,
  "stok_min": 10,
  "stok_max": 100,
  "total_stock": 50,
  "trx_total_qty": 0,
  "trx_qty_30d": 0,
  "trx_qty_60d": 0,
  "trx_qty_90d": 0,
  "trx_count": 0,
  "trx_total_revenue": 0,
  "trx_total_profit": 0
}
```

### Request cURL

```bash
curl -X POST "http://localhost:8000/predict/all" ^
  -H "Content-Type: application/json" ^
  -d "{\"kode_barang\":\"R1284\"}"
```

### Response 200

```json
{
  "matched_product": {
    "match_type": "kode_barang_exact",
    "query": "R1284",
    "matched_score": 1.0,
    "kode_barang": "R1284",
    "nama": "REJOICE SHP 200ML COMPLETE",
    "kategori": "PERAWATAN",
    "sub_kategori": "SHAMPOO",
    "supplier": "SUPPLIER A"
  },
  "fast_moving": {
    "class_id": 2,
    "prediction": "Fast Moving",
    "confidence": 0.93,
    "probabilities": {
      "Slow Moving": 0.02,
      "Normal": 0.05,
      "Fast Moving": 0.93
    }
  },
  "low_stock": {
    "class_id": 1,
    "prediction": "Restock Priority",
    "confidence": 0.88,
    "restock_priority_score": 0.88,
    "message": "Produk perlu diprioritaskan untuk restock."
  },
  "profit": {
    "estimated_profit_ratio": 0.034,
    "estimated_profit_percent": 3.4,
    "profit_category": "Low Profit"
  }
}
```

### Penjelasan response

`matched_product` adalah produk yang benar-benar dipakai AI.

FS harus cek:

```text
matched_product.kode_barang
matched_product.nama
matched_product.match_type
```

`match_type` bisa berisi:

| match_type | Arti |
|---|---|
| `kode_barang_exact` | Cocok berdasarkan kode barang |
| `name_exact` | Nama cocok persis |
| `name_contains` | Nama mengandung keyword |
| `name_fuzzy` | Cocok fuzzy |
| `manual_features` | Produk baru/input fitur manual |

`fast_moving.prediction`:

```text
Slow Moving
Normal
Fast Moving
```

`low_stock.prediction`:

```text
Stock Safe
Restock Priority
```

`profit.profit_category`:

```text
Low Profit
Medium Profit
High Profit
```

### Error 404 produk tidak ditemukan

```json
{
  "detail": "nama_barang 'PRODUK_INI_TIDAK_MUNGKIN_ADA_999999' tidak ditemukan. Pastikan nama barang berasal dari daftar produk."
}
```

### Yang harus FS lakukan

Pakai `/predict/all` untuk:

```text
- Detail produk owner
- AI Analisis Produk
- Badge produk
- Rekomendasi aksi produk
```

Karyawan jangan ditampilkan bagian `profit`.

---

## 7.5 POST `/predict/fast-moving`

### Fungsi

Prediksi apakah produk slow, normal, atau fast moving.

### Body

Sama seperti `/predict/all`.

### Request

```json
{
  "kode_barang": "R1284"
}
```

atau:

```json
{
  "nama_barang": "INDOMIE RENDANG"
}
```

### Response 200

```json
{
  "matched_product": {
    "match_type": "kode_barang_exact",
    "query": "R1284",
    "matched_score": 1.0,
    "kode_barang": "R1284",
    "nama": "REJOICE SHP 200ML COMPLETE",
    "kategori": "PERAWATAN",
    "sub_kategori": "SHAMPOO",
    "supplier": "SUPPLIER A"
  },
  "class_id": 2,
  "prediction": "Fast Moving",
  "confidence": 0.93,
  "probabilities": {
    "Slow Moving": 0.02,
    "Normal": 0.05,
    "Fast Moving": 0.93
  }
}
```

### Yang harus FS lakukan

Tampilkan badge:

```text
Fast Moving
Normal
Slow Moving
```

Contoh UI text:

```text
Produk ini termasuk Fast Moving. Pastikan stok tetap tersedia.
```

---

## 7.6 POST `/predict/low-stock`

### Fungsi

Prediksi prioritas restock.

### Body

```json
{
  "kode_barang": "R1284"
}
```

### Response 200

```json
{
  "matched_product": {
    "match_type": "kode_barang_exact",
    "query": "R1284",
    "matched_score": 1.0,
    "kode_barang": "R1284",
    "nama": "REJOICE SHP 200ML COMPLETE",
    "kategori": "PERAWATAN",
    "sub_kategori": "SHAMPOO",
    "supplier": "SUPPLIER A"
  },
  "class_id": 1,
  "prediction": "Restock Priority",
  "confidence": 0.88,
  "restock_priority_score": 0.88,
  "message": "Produk perlu diprioritaskan untuk restock."
}
```

### Yang harus FS lakukan

Tampilkan status:

```text
Stock Safe
Restock Priority
```

Jika `Restock Priority`, tampilkan alert:

```text
Produk ini perlu diprioritaskan untuk restock.
```

---

## 7.7 POST `/predict/profit`

### Fungsi

Prediksi profit produk.

### Body

```json
{
  "kode_barang": "R1284"
}
```

atau:

```json
{
  "nama_barang": "SUN EKONOMIS BERAS MERAH 120GR"
}
```

### Response 200

```json
{
  "matched_product": {
    "match_type": "name_exact",
    "query": "SUN EKONOMIS BERAS MERAH 120GR",
    "matched_score": 1.0,
    "kode_barang": "S6259",
    "nama": "SUN EKONOMIS BERAS MERAH 120GR",
    "kategori": "MAKANAN BAYI",
    "sub_kategori": "0.0",
    "supplier": "TIGA BENUA"
  },
  "estimated_profit_ratio": 0.1194,
  "estimated_profit_percent": 11.94,
  "profit_category": "Medium Profit"
}
```

### Yang harus FS lakukan

Tampilkan hanya untuk Owner:

```text
Profit Category: Medium Profit
Estimated Profit: 11.94%
```

Jangan tampilkan ke Karyawan.

---

## 7.8 GET `/recommendations/top-products`

### Fungsi

Mengambil produk terlaris atau paling aktif.

### Body

Tidak ada body.

### Query Params

| Param | Wajib | Contoh |
|---|---:|---|
| `limit` | Tidak | `10` |

### Request

```text
GET /recommendations/top-products?limit=10
```

### Response 200

```json
{
  "items": [
    {
      "kode_barang": "R1284",
      "nama": "REJOICE SHP 200ML COMPLETE",
      "kategori": "PERAWATAN",
      "trx_total_qty": 240,
      "trx_count": 80,
      "reason": "Produk memiliki jumlah penjualan tinggi."
    }
  ]
}
```

### Yang harus FS lakukan

Tampilkan di:

```text
- Dashboard Owner
- Analisis Penjualan
- Top Product Card
```

---

## 7.9 GET `/recommendations/high-profit`

### Fungsi

Mengambil produk dengan potensi profit tinggi.

### Body

Tidak ada body.

### Query Params

| Param | Wajib | Contoh |
|---|---:|---|
| `limit` | Tidak | `10` |

### Request

```text
GET /recommendations/high-profit?limit=10
```

### Response 200

```json
{
  "items": [
    {
      "kode_barang": "I0325",
      "nama": "IDF SYRUP 650ML ORANGE",
      "kategori": "MINUMAN",
      "estimated_profit_percent": 12.4,
      "profit_category": "Medium Profit",
      "reason": "Produk memiliki potensi profit lebih tinggi."
    }
  ]
}
```

### Yang harus FS lakukan

Tampilkan untuk Owner only.

---

## 7.10 GET `/recommendations/restock-priority`

### Fungsi

Mengambil produk prioritas restock.

### Body

Tidak ada body.

### Query Params

| Param | Wajib | Contoh |
|---|---:|---|
| `limit` | Tidak | `10` |

### Request

```text
GET /recommendations/restock-priority?limit=10
```

### Response 200

```json
{
  "items": [
    {
      "kode_barang": "R1284",
      "nama": "REJOICE SHP 200ML COMPLETE",
      "kategori": "PERAWATAN",
      "restock_priority_score": 0.88,
      "fast_moving_status": "Fast Moving",
      "reason": "Produk cepat bergerak dan perlu diprioritaskan untuk restock."
    }
  ]
}
```

### Yang harus FS lakukan

Tampilkan di:

```text
- Rekomendasi Stok
- Dashboard Owner
- Smart Notification
```

Karyawan boleh diberi versi terbatas tanpa profit.

---

## 7.11 GET `/insights/summary`

### Fungsi

Ringkasan insight AI untuk dashboard.

### Body

Tidak ada body.

### Query Params

Tidak ada.

### Request

```text
GET /insights/summary
```

### Response 200

```json
{
  "summary": {
    "total_products": 32193,
    "fast_moving_products": 1200,
    "restock_priority_products": 350,
    "high_profit_products": 280
  },
  "insights": [
    "Beberapa produk fast moving perlu diprioritaskan untuk restock.",
    "Produk high profit dapat dipromosikan untuk meningkatkan margin.",
    "Pantau produk slow moving agar stok tidak menumpuk."
  ]
}
```

### Yang harus FS lakukan

Tampilkan hanya untuk Owner:

```text
- Dashboard Owner
- AI Insight Panel
- Smart Notification
```

---

## 7.12 GET `/forecast/daily-kpi`

### Fungsi

Forecast/summary KPI harian.

### Body

Tidak ada body.

### Query Params

Tidak ada.

### Request

```text
GET /forecast/daily-kpi
```

### Response 200

```json
{
  "history": [
    {
      "date": "2026-04-01",
      "revenue": 1200000,
      "transactions": 35,
      "profit": 250000
    }
  ],
  "forecast": [
    {
      "date": "2026-04-29",
      "predicted_revenue": 1350000,
      "predicted_transactions": 40
    }
  ]
}
```

### Yang harus FS lakukan

Tampilkan hanya untuk Owner:

```text
- Dashboard chart
- Analisis penjualan
- Forecast KPI panel
```

---

## 7.13 POST `/ocr/scan-receipt`

### Fungsi

OCR nota/faktur menggunakan Gemini.

### Method

```http
POST
```

### Content-Type

```text
multipart/form-data
```

### Body

Bukan JSON. Gunakan form-data.

| Field | Wajib | Tipe | Keterangan |
|---|---:|---|---|
| `file` | Ya | File | gambar nota `.jpg`, `.jpeg`, `.png`, `.webp` |

### Request JavaScript

```javascript
async function scanReceipt(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/ocr/scan-receipt", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "OCR gagal");
  }

  return await res.json();
}
```

### Request cURL Windows

```bash
curl -X POST "http://localhost:8000/ocr/scan-receipt" ^
  -F "file=@C:\Users\sandi\Downloads\nota.jpg"
```

### Response 200

```json
{
  "merchant_name": "UD. Maju Jaya",
  "transaction_date": "2026-04-28",
  "items": [
    {
      "nama_produk": "Beras Premium 5kg",
      "qty": 10,
      "harga": 58000,
      "total": 580000
    },
    {
      "nama_produk": "Minyak Goreng 2L",
      "qty": 5,
      "harga": 29000,
      "total": 145000
    }
  ],
  "subtotal": 725000,
  "tax": null,
  "discount": null,
  "total_transaksi": 725000,
  "confidence": 0.91,
  "raw_text": "..."
}
```

### Yang harus FS lakukan

UI harus menampilkan hasil OCR dalam form konfirmasi:

```text
- Nama produk
- Qty
- Harga
- Total
- Tanggal
- Supplier/Merchant jika ada
```

Lalu user klik Simpan. Backend baru menyimpan ke database setelah user konfirmasi.

---

# 8. Mapping Endpoint ke UI

## Dashboard Owner

Gunakan:

```text
GET /insights/summary
GET /forecast/daily-kpi
GET /recommendations/restock-priority?limit=5
GET /recommendations/top-products?limit=5
```

Tampilkan:

```text
- AI Insight
- Forecast KPI
- Produk prioritas restock
- Produk terlaris
```

## Dashboard Karyawan

Jangan tampilkan profit/laba/insight owner.

Boleh tampilkan:

```text
- Transaksi hari ini
- Stok perlu dicek
- OCR nota
- Input stok
```

## Katalog Barang

Gunakan:

```text
GET /products/search?q=keyword&limit=10
POST /predict/all
```

Owner melihat:

```text
- Fast Moving
- Restock Priority
- Profit Category
```

Karyawan melihat:

```text
- Fast Moving
- Stock Safe / Restock Priority
```

Karyawan tidak melihat profit.

## Detail Produk

Gunakan:

```text
POST /predict/all
```

## Rekomendasi Stok

Gunakan:

```text
GET /recommendations/restock-priority?limit=10
```

## Analisis Profit

Gunakan:

```text
GET /recommendations/high-profit?limit=10
POST /predict/profit
```

Owner only.

## Input Stok OCR

Gunakan:

```text
POST /ocr/scan-receipt
```

Setelah OCR, simpan ke backend/database, bukan ke AI.

---

# 9. Role Access

| Fitur | Owner | Karyawan |
|---|---:|---:|
| Search produk | Ya | Ya |
| Predict fast moving | Ya | Ya |
| Predict low stock | Ya | Ya |
| Predict profit | Ya | Tidak |
| Top product | Ya | Terbatas |
| High profit recommendation | Ya | Tidak |
| Restock recommendation | Ya | Terbatas |
| Insight summary | Ya | Tidak |
| Forecast KPI | Ya | Tidak |
| OCR nota | Ya | Ya |
| Input stok | Ya | Ya |
| Catat transaksi | Ya | Ya |
| Laporan keuangan | Ya | Tidak |

Karyawan jangan melihat:

```text
- HPP
- profit ratio
- estimated profit percent
- profit category
- laba
- margin
- high profit recommendation
- insight strategis
```

---

# 10. Contoh Backend Express Proxy Lengkap

```javascript
import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";

const router = express.Router();
const upload = multer();

const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "http://localhost:8000";

function handleAiError(error, res) {
  return res.status(error.response?.status || 500).json({
    message: "Gagal memanggil AI service",
    error: error.response?.data || error.message
  });
}

router.get("/ai/health", async (req, res) => {
  try {
    const response = await axios.get(`${AI_API_BASE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.get("/ai/search-products", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const response = await axios.get(`${AI_API_BASE_URL}/products/search`, {
      params: { q, limit }
    });
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.post("/ai/predict-all", async (req, res) => {
  try {
    const response = await axios.post(`${AI_API_BASE_URL}/predict/all`, req.body);
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.post("/ai/predict-fast-moving", async (req, res) => {
  try {
    const response = await axios.post(`${AI_API_BASE_URL}/predict/fast-moving`, req.body);
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.post("/ai/predict-low-stock", async (req, res) => {
  try {
    const response = await axios.post(`${AI_API_BASE_URL}/predict/low-stock`, req.body);
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.post("/ai/predict-profit", async (req, res) => {
  try {
    const response = await axios.post(`${AI_API_BASE_URL}/predict/profit`, req.body);
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.get("/ai/recommendations/top-products", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const response = await axios.get(`${AI_API_BASE_URL}/recommendations/top-products`, {
      params: { limit }
    });
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.get("/ai/recommendations/high-profit", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const response = await axios.get(`${AI_API_BASE_URL}/recommendations/high-profit`, {
      params: { limit }
    });
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.get("/ai/recommendations/restock-priority", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const response = await axios.get(`${AI_API_BASE_URL}/recommendations/restock-priority`, {
      params: { limit }
    });
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.get("/ai/insights/summary", async (req, res) => {
  try {
    const response = await axios.get(`${AI_API_BASE_URL}/insights/summary`);
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.get("/ai/forecast/daily-kpi", async (req, res) => {
  try {
    const response = await axios.get(`${AI_API_BASE_URL}/forecast/daily-kpi`);
    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

router.post("/ai/ocr/scan-receipt", upload.single("file"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(`${AI_API_BASE_URL}/ocr/scan-receipt`, form, {
      headers: form.getHeaders()
    });

    res.json(response.data);
  } catch (error) {
    handleAiError(error, res);
  }
});

export default router;
```

---

# 11. Contoh Frontend Flow

## Search produk dan predict

```javascript
async function searchProducts(keyword) {
  const res = await fetch(`/api/ai/search-products?q=${encodeURIComponent(keyword)}&limit=10`);
  if (!res.ok) throw new Error("Gagal mencari produk");
  return await res.json();
}

async function predictProduct(kodeBarang) {
  const res = await fetch("/api/ai/predict-all", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      kode_barang: kodeBarang
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal mengambil prediksi AI");
  }

  return await res.json();
}
```

## OCR upload

```javascript
async function scanReceipt(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/ai/ocr/scan-receipt", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "OCR gagal");
  }

  return await res.json();
}
```

---

# 12. Automated Testing

Jalankan API:

```bat
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal kedua:

```bat
python tests\auto_test_api.py --limit 20
```

Expected:

```text
Passed : 121
Failed : 0
Skipped: 1
Status : PASSED
```

Test OCR:

```bat
python tests\auto_test_api.py --limit 20 --ocr-image "C:\Users\sandi\Downloads\nota.jpg" --require-ocr
```

---

# 13. Checklist Implementasi FS

## Backend

```text
[ ] Set AI_API_BASE_URL
[ ] Buat proxy route ke AI
[ ] Pastikan database produk punya kode_barang
[ ] Hit AI pakai kode_barang jika produk ada
[ ] Hit /products/search untuk autocomplete
[ ] Untuk produk baru, kirim fitur lengkap
[ ] Batasi profit endpoint untuk owner
[ ] OCR route menggunakan multipart/form-data
[ ] Simpan hasil OCR hanya setelah user konfirmasi
```

## Frontend

```text
[ ] Buat search/autocomplete produk
[ ] Tampilkan matched_product dari AI
[ ] Tampilkan badge Fast Moving/Normal/Slow Moving
[ ] Tampilkan badge Stock Safe/Restock Priority
[ ] Sembunyikan profit dari karyawan
[ ] Buat dashboard owner untuk insight/forecast/recommendation
[ ] Buat OCR upload dan preview hasil OCR
[ ] Buat form konfirmasi OCR sebelum simpan
[ ] Tampilkan loading/error/empty state
```

## Role

```text
[ ] Owner bisa lihat profit, insight, forecast, high profit recommendation
[ ] Karyawan tidak bisa lihat profit/laba/margin/HPP
[ ] Karyawan boleh input transaksi, input stok, OCR
```

---

# 14. Jawaban Singkat untuk FS

## Endpoint insight, forecast, dan recommendations perlu body opo?

```text
Tidak perlu body karena semuanya GET.
Kalau ada input, pakai query params seperti ?limit=10.
```

## Predict endpoint perlu body opo?

```text
POST /predict/all butuh JSON body.
Paling aman: { "kode_barang": "R1284" }
Bisa juga: { "nama_barang": "NAMA PRODUK LENGKAP" }
Produk baru: kirim fitur lengkap.
```

## OCR endpoint perlu body opo?

```text
POST /ocr/scan-receipt pakai multipart/form-data.
Field file wajib bernama "file".
```

## Kalau data beda dari DS?

```text
Tidak masalah. Dataset DS adalah training awal. Database FS jadi sumber data utama. Backend harus mengirim kode_barang/nama lengkap/fitur lengkap ke AI.
```

## Kalau produk baru?

```text
Kirim fitur lengkap. Kalau belum ada histori transaksi, tampilkan estimasi awal/data belum cukup.
```

---

# 15. Endpoint Paling Sering Dipakai

```text
GET  /products/search?q=keyword&limit=10
POST /predict/all
GET  /recommendations/restock-priority?limit=10
GET  /insights/summary
GET  /forecast/daily-kpi
POST /ocr/scan-receipt
```

---

# 16. Kesimpulan

Untuk FS, aturan paling penting:

```text
1. Produk dari database → kirim kode_barang.
2. User search keyword → panggil /products/search dulu.
3. Jangan langsung predict dari keyword pendek.
4. Produk baru → kirim fitur lengkap.
5. Profit/insight strategis → Owner only.
6. OCR → manual review dulu, baru simpan.
7. AI tidak menyimpan data utama; database tetap milik backend fullstack.
```
