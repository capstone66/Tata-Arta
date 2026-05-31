# Tata-Arta AI Service — Panduan Lengkap untuk Fullstack

README ini dibuat untuk tim **Fullstack (FS)** agar bisa menjalankan, mengetes, dan mengintegrasikan service AI Tata-Arta tanpa perlu memahami detail training model secara mendalam.

AI service berada di folder:

```text
Tata-Arta/Ai
```

Base URL lokal saat API dijalankan:

```text
http://localhost:8000
```

Swagger/OpenAPI Docs:

```text
http://localhost:8000/docs
```

---

## Daftar Isi

1. [Ringkasan Fungsi AI](#1-ringkasan-fungsi-ai)
2. [Struktur Folder](#2-struktur-folder)
3. [Konsep Integrasi untuk Fullstack](#3-konsep-integrasi-untuk-fullstack)
4. [Setup Lokal di Windows VSCode](#4-setup-lokal-di-windows-vscode)
5. [Environment Variable](#5-environment-variable)
6. [Menjalankan AI API](#6-menjalankan-ai-api)
7. [Aturan Produk Lama, Produk Baru, dan Data Berbeda dari DS](#7-aturan-produk-lama-produk-baru-dan-data-berbeda-dari-ds)
8. [Endpoint API Lengkap](#8-endpoint-api-lengkap)
9. [Contoh Integrasi Backend Express](#9-contoh-integrasi-backend-express)
10. [Contoh Integrasi Frontend](#10-contoh-integrasi-frontend)
11. [Role Access Owner dan Karyawan](#11-role-access-owner-dan-karyawan)
12. [OCR Nota Manual](#12-ocr-nota-manual)
13. [Automated Testing](#13-automated-testing)
14. [Docker dan Deploy](#14-docker-dan-deploy)
15. [Troubleshooting](#15-troubleshooting)
16. [Checklist Sebelum Demo/Deploy](#16-checklist-sebelum-demodeploy)
17. [Ringkasan Paling Penting untuk FS](#17-ringkasan-paling-penting-untuk-fs)

---

# 1. Ringkasan Fungsi AI

AI service Tata-Arta menyediakan beberapa fitur utama:

| Fitur | Fungsi |
|---|---|
| Fast Moving Detection | Memprediksi produk termasuk `Slow Moving`, `Normal`, atau `Fast Moving` |
| Restock Priority Prediction | Memprediksi apakah produk `Stock Safe` atau `Restock Priority` |
| Profit Prediction | Mengestimasi profit ratio dan kategori profit produk |
| Recommendation System | Rekomendasi top product, high profit product, dan restock priority |
| Daily KPI Forecast | Forecast/summary KPI harian untuk dashboard |
| OCR Nota Gemini | Membaca nota/faktur secara manual dari upload gambar |
| Product Search | Mencari produk berdasarkan nama untuk autocomplete UI |

Hasil training final:

| Model | Metrik | Status |
|---|---:|---|
| Fast Moving Detection | Validation Accuracy 85.41% | Passed |
| Restock Priority | Validation Accuracy 89.50% | Passed |
| Profit Prediction | Validation MAE 0.0179 | Passed |

Hasil automated API testing terakhir:

```text
Passed : 121
Failed : 0
Skipped: 1
Status : PASSED
```

`Skipped: 1` adalah OCR ketika automated test tidak diberikan gambar nota. Itu bukan error.

---

# 2. Struktur Folder

Struktur penting folder `Ai/`:

```text
Ai/
├── api/
│   ├── __init__.py
│   ├── main.py
│   └── schemas.py
│
├── src/
│   ├── __init__.py
│   ├── config.py
│   ├── data_loader.py
│   ├── feature_engineering.py
│   ├── preprocessing.py
│   ├── custom_layers.py
│   ├── custom_callbacks.py
│   ├── model_builder.py
│   ├── trainer.py
│   ├── train_fast_moving.py
│   ├── train_low_stock.py
│   ├── train_profit.py
│   ├── inference.py
│   └── recommendation.py
│
├── ocr/
│   ├── __init__.py
│   └── gemini_ocr.py
│
├── tests/
│   └── auto_test_api.py
│
├── models/
│   ├── fast_moving_model.keras
│   ├── fast_moving_preprocessor.joblib
│   ├── fast_moving_model.training_summary.json
│   ├── low_stock_model.keras
│   ├── low_stock_preprocessor.joblib
│   ├── low_stock_model.training_summary.json
│   ├── profit_model.keras
│   ├── profit_preprocessor.joblib
│   └── profit_model.training_summary.json
│
├── train_all.py
├── requirements.txt
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── Procfile
├── Makefile
└── README.md
```

File model `.keras` dan preprocessor `.joblib` sudah ikut di repo. Jadi FS bisa langsung menjalankan API tanpa training ulang.

---

# 3. Konsep Integrasi untuk Fullstack

AI service ini **bukan database utama**.

Pembagian tanggung jawab:

```text
Frontend:
- Menampilkan UI
- User memilih produk
- User upload nota OCR
- Menampilkan hasil AI

Backend Fullstack:
- Menyimpan data produk, transaksi, stok, dan user
- Menentukan role owner/karyawan
- Mengambil produk dari database
- Mengirim request ke AI service
- Menyimpan transaksi/stok/OCR final ke database

AI Service:
- Menerima input produk
- Memprediksi movement, restock, dan profit
- Memberikan rekomendasi
- Membaca nota/faktur via OCR
```

Flow paling aman untuk production:

```text
Frontend → Backend Fullstack → AI FastAPI → Backend Fullstack → Frontend
```

Frontend boleh langsung hit AI untuk demo, tetapi untuk production lebih aman lewat backend.

---

# 4. Setup Lokal di Windows VSCode

Buka folder:

```text
C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
```

Buka terminal VSCode di folder `Ai`.

Cek Python yang tersedia:

```bat
py -0p
```

Gunakan Python 3.11. Jangan pakai Python 3.14 untuk TensorFlow.

Buat virtual environment:

```bat
py -3.11 -m venv venv
```

Aktifkan virtual environment:

```bat
venv\Scripts\activate
```

Cek Python:

```bat
python --version
```

Harus keluar:

```text
Python 3.11.x
```

Install dependency:

```bat
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

Jika TensorBoard error `pkg_resources`, jalankan:

```bat
pip uninstall setuptools -y
pip install "setuptools<82"
```

---

# 5. Environment Variable

Copy `.env.example` menjadi `.env`:

```bat
copy .env.example .env
```

Isi `.env`:

```env
GEMINI_API_KEY=ISI_API_KEY_GEMINI_KAMU
GEMINI_OCR_MODEL=gemini-3.5-flash

TATA_ARTA_DATA_DIR=C:/Users/sandi/Downloads/Projek/Tata-Arta/data-science/data/processed

PRODUCTS_FEATURED_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/products_featured.csv
PRODUCTS_CLEAN_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/products_clean.csv
TRANSACTIONS_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/transactions.csv
DAILY_KPI_URL=https://raw.githubusercontent.com/capstone66/Tata-Arta/main/data-science/data/processed/daily_kpi.csv

APP_ENV=development
RANDOM_STATE=42
TF_CPP_MIN_LOG_LEVEL=2
```

Penting:

```text
Jangan commit .env ke GitHub.
Yang boleh dicommit hanya .env.example.
```

---

# 6. Menjalankan AI API

Dari folder `Ai`:

```bat
venv\Scripts\activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Buka:

```text
http://localhost:8000/docs
```

Jika API jalan, Swagger akan terbuka.

Health check:

```http
GET /health
```

Contoh response:

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

Kalau salah satu model `false`, cek folder `Ai/models/`.

---

# 7. Aturan Produk Lama, Produk Baru, dan Data Berbeda dari DS

Pertanyaan umum FS:

```text
Kalau data website beda dari dataset DS, bagaimana?
```

Jawaban:

```text
Dataset DS dipakai sebagai training awal/baseline.
Saat website berjalan, sumber data utama adalah database fullstack.
AI tetap bisa dipakai selama backend mengirim data produk yang sesuai.
```

## 7.1 Produk Lama dari Dataset DS

Bisa langsung kirim:

```json
{
  "kode_barang": "R1284"
}
```

atau:

```json
{
  "nama_barang": "REJOICE SHP 200ML COMPLETE"
}
```

## 7.2 Produk Baru yang Belum Ada di Dataset DS

Jangan hanya kirim nama:

```json
{
  "nama_barang": "Produk Baru"
}
```

Itu kurang cukup karena AI belum punya referensi produk tersebut.

Kirim fitur lengkap:

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
  "trx_qty_90d": 0,
  "trx_count": 0,
  "trx_total_revenue": 0,
  "trx_total_profit": 0
}
```

Jika `trx_count` masih kecil, UI harus menampilkan:

```text
Data penjualan belum cukup. Prediksi AI masih estimasi awal.
```

## 7.3 Kapan Perlu Training Ulang?

Untuk capstone/demo:

```text
Tidak wajib retraining otomatis.
```

Untuk production:

```text
Retraining bisa dilakukan mingguan/bulanan dari database website.
```

AI tidak training setiap ada transaksi. Yang benar: data dikumpulkan dulu, lalu model dilatih ulang secara berkala.

---

# 8. Endpoint API Lengkap

## 8.1 GET `/health`

### Fungsi

Cek AI service dan model.

### Request

```http
GET /health
```

### Response

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

---

## 8.2 GET `/metadata`

### Fungsi

Cek metadata fitur AI.

### Request

```http
GET /metadata
```

### Contoh Response

```json
{
  "service": "Tata-Arta AI API",
  "version": "1.0.0",
  "features": [
    "fast_moving_detection",
    "restock_priority_prediction",
    "profit_prediction",
    "recommendation_system",
    "daily_kpi_forecast",
    "gemini_ocr"
  ]
}
```

---

## 8.3 GET `/products/search`

### Fungsi

Search produk berdasarkan nama. Dipakai untuk autocomplete/search barang.

### Request

```http
GET /products/search?q=beras&limit=10
```

### Query Params

| Param | Wajib | Contoh | Keterangan |
|---|---|---|---|
| `q` | Ya | `beras` | keyword nama barang |
| `limit` | Tidak | `10` | jumlah hasil maksimal |

### Contoh Response

```json
{
  "query": "beras",
  "count": 10,
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
    }
  ]
}
```

### Dipakai di UI

```text
- Search/autocomplete produk
- Pilih produk sebelum prediksi
```

Jangan langsung predict dari keyword pendek seperti `beras`, `aqua`, `susu`, atau `minyak`. Search dulu, user pilih produk, lalu predict pakai `kode_barang`.

---

## 8.4 POST `/predict/all`

### Fungsi

Endpoint utama. Mengembalikan hasil 3 model sekaligus:

```text
- Fast Moving
- Restock Priority
- Profit Prediction
```

### Request by kode_barang

```http
POST /predict/all
Content-Type: application/json
```

```json
{
  "kode_barang": "R1284"
}
```

### Request by nama_barang lengkap

```json
{
  "nama_barang": "SUN EKONOMIS BERAS MERAH 120GR"
}
```

### Request produk baru / data dari database website

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
  "trx_qty_90d": 0,
  "trx_count": 0
}
```

### Contoh Response

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

### Nilai Penting

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

### Dipakai di UI

```text
- Detail produk
- Katalog barang owner
- AI Analisis Produk
- Rekomendasi aksi produk
```

---

## 8.5 POST `/predict/fast-moving`

### Fungsi

Prediksi movement produk.

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

### Response

```json
{
  "matched_product": {
    "match_type": "kode_barang_exact",
    "query": "R1284",
    "matched_score": 1.0,
    "kode_barang": "R1284",
    "nama": "REJOICE SHP 200ML COMPLETE",
    "kategori": "PERAWATAN",
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

### Dipakai di UI

```text
- Badge produk cepat laku
- Detail produk
- Dashboard owner
```

---

## 8.6 POST `/predict/low-stock`

### Fungsi

Prediksi prioritas restock.

### Request

```json
{
  "kode_barang": "R1284"
}
```

### Response

```json
{
  "matched_product": {
    "match_type": "kode_barang_exact",
    "query": "R1284",
    "matched_score": 1.0,
    "kode_barang": "R1284",
    "nama": "REJOICE SHP 200ML COMPLETE",
    "kategori": "PERAWATAN",
    "supplier": "SUPPLIER A"
  },
  "class_id": 1,
  "prediction": "Restock Priority",
  "confidence": 0.88,
  "restock_priority_score": 0.88,
  "message": "Produk perlu diprioritaskan untuk restock."
}
```

### Dipakai di UI

```text
- Alert stok
- Rekomendasi restock
- Smart notification
```

---

## 8.7 POST `/predict/profit`

### Fungsi

Prediksi estimasi profit produk.

### Request

```json
{
  "kode_barang": "R1284"
}
```

### Response

```json
{
  "matched_product": {
    "match_type": "kode_barang_exact",
    "query": "R1284",
    "matched_score": 1.0,
    "kode_barang": "R1284",
    "nama": "REJOICE SHP 200ML COMPLETE",
    "kategori": "PERAWATAN",
    "supplier": "SUPPLIER A"
  },
  "estimated_profit_ratio": 0.1194,
  "estimated_profit_percent": 11.94,
  "profit_category": "Medium Profit"
}
```

### Dipakai di UI

```text
- Detail produk owner
- Analisis profit
- High profit recommendation
```

Profit endpoint sebaiknya **Owner only**.

---

## 8.8 GET `/recommendations/top-products`

### Fungsi

Mengambil daftar produk terlaris / paling aktif.

### Request

```http
GET /recommendations/top-products?limit=10
```

### Response

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

### Dipakai di UI

```text
- Dashboard owner
- Analisis penjualan
- Top product card
```

---

## 8.9 GET `/recommendations/high-profit`

### Fungsi

Mengambil rekomendasi produk profit tinggi.

### Request

```http
GET /recommendations/high-profit?limit=10
```

### Response

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

### Dipakai di UI

```text
- Owner dashboard
- Rekomendasi profit
- Analisis produk
```

Owner only.

---

## 8.10 GET `/recommendations/restock-priority`

### Fungsi

Mengambil daftar produk prioritas restock.

### Request

```http
GET /recommendations/restock-priority?limit=10
```

### Response

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

### Dipakai di UI

```text
- Rekomendasi stok
- Dashboard owner
- Smart notification
```

---

## 8.11 GET `/insights/summary`

### Fungsi

Mengambil ringkasan insight AI.

### Request

```http
GET /insights/summary
```

### Response

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

### Dipakai di UI

```text
- Dashboard owner
- AI insight panel
- Smart notification
```

Owner only.

---

## 8.12 GET `/forecast/daily-kpi`

### Fungsi

Mengambil forecast atau ringkasan KPI harian.

### Request

```http
GET /forecast/daily-kpi
```

### Response

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

### Dipakai di UI

```text
- Dashboard owner
- Forecast chart
- Analisis penjualan
```

Owner only.

---

## 8.13 POST `/ocr/scan-receipt`

### Fungsi

OCR nota/faktur menggunakan Gemini.

### Request

```http
POST /ocr/scan-receipt
Content-Type: multipart/form-data
```

Field:

```text
file
```

### Contoh Frontend

```javascript
async function scanReceipt(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/ocr/scan-receipt", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "OCR gagal");
  }

  return await res.json();
}
```

### Response

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

### Flow OCR

```text
User upload nota
↓
AI OCR membaca nota
↓
UI tampilkan hasil
↓
User koreksi manual
↓
User klik simpan
↓
Backend simpan ke database
```

OCR jangan langsung menyimpan otomatis. Harus ada konfirmasi user.

---

# 9. Contoh Integrasi Backend Express

Contoh proxy backend Express ke AI service:

```javascript
import express from "express";
import axios from "axios";

const router = express.Router();

const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "http://localhost:8000";

router.get("/ai/health", async (req, res) => {
  try {
    const response = await axios.get(`${AI_API_BASE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "AI service tidak tersedia",
      error: error.response?.data || error.message,
    });
  }
});

router.get("/ai/search-products", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    const response = await axios.get(`${AI_API_BASE_URL}/products/search`, {
      params: { q, limit },
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Gagal mencari produk dari AI service",
      error: error.response?.data || error.message,
    });
  }
});

router.post("/ai/predict-all", async (req, res) => {
  try {
    const response = await axios.post(`${AI_API_BASE_URL}/predict/all`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Gagal memanggil AI prediction",
      error: error.response?.data || error.message,
    });
  }
});

router.get("/ai/restock-recommendations", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const response = await axios.get(`${AI_API_BASE_URL}/recommendations/restock-priority`, {
      params: { limit },
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Gagal mengambil rekomendasi restock",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
```

---

# 10. Contoh Integrasi Frontend

## Search produk

```javascript
async function searchProducts(keyword) {
  const res = await fetch(`/api/ai/search-products?q=${encodeURIComponent(keyword)}&limit=10`);

  if (!res.ok) {
    throw new Error("Gagal mencari produk");
  }

  return await res.json();
}
```

## Predict all

```javascript
async function predictProduct(kodeBarang) {
  const res = await fetch("/api/ai/predict-all", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kode_barang: kodeBarang,
    }),
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
async function uploadReceipt(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/ai/ocr", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Gagal membaca nota");
  }

  return await res.json();
}
```

---

# 11. Role Access Owner dan Karyawan

Rekomendasi akses:

| Fitur | Owner | Karyawan |
|---|---:|---:|
| Search produk | Ya | Ya |
| Fast Moving | Ya | Ya |
| Stock Safe / Restock Priority | Ya | Ya |
| Profit Prediction | Ya | Tidak |
| High Profit Recommendation | Ya | Tidak |
| Restock Recommendation | Ya | Terbatas |
| Insight Summary | Ya | Tidak |
| Forecast KPI | Ya | Tidak |
| OCR Nota | Ya | Ya |
| Catat transaksi | Ya | Ya |
| Input stok | Ya | Ya |
| Keuangan/laba/margin | Ya | Tidak |

Karyawan jangan melihat:

```text
- HPP
- profit ratio
- profit percent
- laba
- margin
- insight strategis owner
```

---

# 12. OCR Nota Manual

OCR adalah fitur manual.

Flow:

```text
Upload nota
↓
AI membaca nota
↓
UI menampilkan hasil OCR
↓
User memeriksa dan mengedit jika ada salah
↓
User klik Simpan
↓
Backend menyimpan ke database
```

Jangan membuat OCR langsung menyimpan otomatis ke database tanpa konfirmasi.

---

# 13. Automated Testing

Pastikan API jalan dulu:

```bat
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Buka terminal kedua:

```bat
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
venv\Scripts\activate
python tests\auto_test_api.py --limit 20
```

Expected result:

```text
Passed : 121
Failed : 0
Skipped: 1
Status : PASSED
```

OCR skipped jika tidak memberikan gambar nota. Untuk test OCR juga:

```bat
python tests\auto_test_api.py --limit 20 --ocr-image "C:\Users\sandi\Downloads\nota.jpg" --require-ocr
```

---

# 14. Docker dan Deploy

## Build Docker

```bat
docker build -t tata-arta-ai .
```

## Run Docker

```bat
docker run --env-file .env -p 8000:8000 tata-arta-ai
```

## Docker Compose

```bat
docker compose up --build
```

## Render

Jika deploy ke Render:

1. Root directory:
   ```text
   Ai
   ```
2. Environment:
   ```text
   Docker
   ```
3. Environment variables:
   ```env
   GEMINI_API_KEY=isi_key_asli_di_render
   GEMINI_OCR_MODEL=gemini-3.5-flash
   APP_ENV=production
   ```
4. Deploy.

---

# 15. Troubleshooting

## Error `No module named src`

Pastikan menjalankan command dari folder `Ai`:

```bat
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
```

Lalu jalankan ulang.

## Error `No module named pandas`

Dependency belum terinstall di venv yang aktif:

```bat
pip install -r requirements.txt
```

## Error TensorFlow di Python 3.14

Gunakan Python 3.11:

```bat
py -3.11 -m venv venv
```

## Error `pkg_resources`

```bat
pip uninstall setuptools -y
pip install "setuptools<82"
```

## Model false di `/health`

Cek folder model:

```bat
dir models
```

Harus ada:

```text
fast_moving_model.keras
fast_moving_preprocessor.joblib
low_stock_model.keras
low_stock_preprocessor.joblib
profit_model.keras
profit_preprocessor.joblib
```

## Produk tidak ditemukan

Jika request:

```json
{
  "nama_barang": "Produk Random"
}
```

lalu AI return 404, solusinya:

```text
- Search produk dulu dengan /products/search
- Kirim nama produk lengkap
- Atau kirim fitur lengkap jika produk baru
```

## Keyword umum menghasilkan produk yang tidak sesuai

Contoh keyword:

```text
beras
aqua
susu
minyak
```

Solusi:

```text
Gunakan /products/search dulu, user pilih produk, lalu predict pakai kode_barang.
```

---

# 16. Checklist Sebelum Demo/Deploy

```text
API bisa jalan
/health status ok
models semua true
/products/search bisa dipakai
/predict/all by kode_barang bisa
/predict/all by nama_barang bisa
recommendations bisa
insights bisa
forecast bisa
OCR bisa jika GEMINI_API_KEY aktif
Automated test PASSED
.env tidak ikut GitHub
AI_API_BASE_URL sudah diset di backend FS
Role owner/karyawan sudah dibatasi
```

---

# 17. Ringkasan Paling Penting untuk FS

Yang paling penting:

```text
1. Untuk produk database, panggil AI pakai kode_barang.
2. Untuk input bebas, search dulu pakai /products/search.
3. Jangan langsung predict dari keyword pendek.
4. Untuk produk baru, kirim fitur lengkap.
5. Kalau transaksi belum cukup, tampilkan "estimasi awal".
6. Profit dan insight strategis hanya untuk owner.
7. OCR manual: scan → review → simpan.
8. AI service tidak menyimpan data utama; database tetap milik fullstack.
```

Endpoint paling sering dipakai:

```text
GET  /products/search
POST /predict/all
GET  /recommendations/restock-priority
GET  /insights/summary
POST /ocr/scan-receipt
```
