# Tata-Arta AI Engineering Service

AI Engineering service untuk proyek **Tata-Arta**. Service ini menyediakan model AI dan API inference untuk mendukung fitur:

- Fast Moving Product Detection
- Restock Priority / Low Stock Prediction
- Profit Prediction
- Recommendation System
- Daily KPI Forecast
- OCR Nota menggunakan Gemini
- FastAPI endpoint untuk integrasi dengan backend/frontend

Service ini dibuat agar tim **Fullstack (FS)** dapat memanggil fitur AI melalui HTTP API.

---

## 1. Ringkasan Hasil Model

Hasil training final:

| Model | Task | Metrik Final | Status |
|---|---|---:|---|
| Fast Moving Detection | Multiclass Classification | Validation Accuracy: 85.41% | Lulus |
| Restock Priority / Low Stock | Binary Classification | Validation Accuracy: 89.50% | Lulus |
| Profit Prediction | Regression | Validation MAE: 0.0179 | Lulus |

Automated API testing:

```text
Passed: 32
Failed: 0
Status: PASSED
```

---

## 2. Struktur Folder

```text
Ai/
├── api/
│   ├── main.py
│   └── schemas.py
│
├── src/
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
│   └── gemini_ocr.py
│
├── tests/
│   └── auto_test_api.py
│
├── models/
│   ├── fast_moving_model.keras
│   ├── fast_moving_preprocessor.joblib
│   ├── low_stock_model.keras
│   ├── low_stock_preprocessor.joblib
│   ├── profit_model.keras
│   └── profit_preprocessor.joblib
│
├── logs/
│   └── fit/
│
├── train_all.py
├── requirements.txt
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## 3. Requirement

Gunakan Python **3.11**.

Jangan menggunakan Python 3.14 karena TensorFlow belum stabil/kompatibel untuk setup ini.

Cek versi Python yang tersedia:

```bat
py -0p
```

Pastikan ada Python 3.11.

---

## 4. Setup Awal di VSCode Windows

Buka folder ini di VSCode:

```text
C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
```

Buka terminal VSCode, lalu jalankan:

```bat
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
```

Buat virtual environment:

```bat
py -3.11 -m venv venv
```

Aktifkan virtual environment:

```bat
venv\Scripts\activate
```

Cek versi Python:

```bat
python --version
```

Output yang benar:

```text
Python 3.11.x
```

Install dependency:

```bat
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

Jika TensorBoard error karena `pkg_resources`, install setuptools versi lama:

```bat
pip uninstall setuptools -y
pip install "setuptools<82"
```

Tambahkan juga ke `requirements.txt`:

```txt
setuptools<82
```

---

## 5. Konfigurasi Environment

Copy file `.env.example` menjadi `.env`:

```bat
copy .env.example .env
```

Isi file `.env`:

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
Jangan push file .env ke GitHub.
API key Gemini hanya boleh disimpan di .env atau environment variable server.
```

---

## 6. Cek Data

Cek apakah data bisa dibaca:

```bat
python -c "from src.data_loader import load_products_featured, load_transactions, load_daily_kpi; print(load_products_featured().shape); print(load_transactions().shape); print(load_daily_kpi().shape)"
```

Output kurang lebih:

```text
(32193, ...)
(100000, ...)
(366, ...)
```

Ambil contoh kode barang:

```bat
python -c "from src.data_loader import load_products_featured; df=load_products_featured(); print(df[['kode_barang','nama']].head(10).to_string(index=False))"
```

---

## 7. Training Model

Jika folder `models/` belum berisi model `.keras` dan `.joblib`, jalankan training.

Training cepat untuk testing:

```bat
python train_all.py --epochs 3 --profit-epochs 3
```

Training final:

```bat
python train_all.py --epochs 30 --profit-epochs 40
```

Output model akan tersimpan di:

```text
models/
```

File yang harus ada setelah training:

```text
fast_moving_model.keras
fast_moving_preprocessor.joblib
low_stock_model.keras
low_stock_preprocessor.joblib
profit_model.keras
profit_preprocessor.joblib
```

---

## 8. TensorBoard

Jalankan TensorBoard:

```bat
tensorboard --logdir logs/fit
```

Buka browser:

```text
http://localhost:6006
```

Gunakan TensorBoard untuk melihat:

- accuracy/train
- accuracy/val
- loss/train
- loss/val
- mae/train
- mae/val

Jika muncul status `INACTIVE`, itu normal ketika training sudah selesai.

---

## 9. Menjalankan FastAPI

Jalankan API:

```bat
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Buka dokumentasi Swagger:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/health
```

Response yang benar:

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

## 10. Endpoint untuk Fullstack

Base URL lokal:

```text
http://localhost:8000
```

Daftar endpoint:

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/health` | Cek API dan model aktif |
| GET | `/metadata` | Informasi metadata service |
| POST | `/predict/all` | Prediksi semua model sekaligus |
| POST | `/predict/fast-moving` | Prediksi Fast/Normal/Slow Moving |
| POST | `/predict/low-stock` | Prediksi restock priority |
| POST | `/predict/profit` | Prediksi profit ratio |
| GET | `/recommendations/top-products` | Rekomendasi produk terlaris |
| GET | `/recommendations/high-profit` | Rekomendasi produk profit tinggi |
| GET | `/recommendations/restock-priority` | Rekomendasi prioritas restock |
| GET | `/insights/summary` | Summary insight AI |
| GET | `/forecast/daily-kpi` | Forecast/summary KPI harian |
| POST | `/ocr/scan-receipt` | OCR nota menggunakan Gemini |

---

## 11. Cara Pakai Endpoint Prediksi

### 11.1 Prediksi Semua Model

Endpoint:

```http
POST /predict/all
```

Body paling mudah:

```json
{
  "kode_barang": "R1284"
}
```

Contoh response:

```json
{
  "fast_moving": {
    "class_id": 2,
    "prediction": "Fast Moving",
    "confidence": 0.98,
    "probabilities": {
      "Slow Moving": 0.01,
      "Normal": 0.01,
      "Fast Moving": 0.98
    }
  },
  "low_stock": {
    "class_id": 1,
    "prediction": "Restock Priority",
    "confidence": 0.91,
    "restock_priority_score": 0.91,
    "message": "Produk disarankan untuk diprioritaskan restock."
  },
  "profit": {
    "estimated_profit_ratio": 0.034,
    "estimated_profit_percent": 3.4,
    "profit_category": "Low Profit"
  }
}
```

### 11.2 Prediksi Fast Moving

Endpoint:

```http
POST /predict/fast-moving
```

Body:

```json
{
  "kode_barang": "R1284"
}
```

Output class:

```text
Slow Moving
Normal
Fast Moving
```

### 11.3 Prediksi Low Stock / Restock Priority

Endpoint:

```http
POST /predict/low-stock
```

Body:

```json
{
  "kode_barang": "R1284"
}
```

Output class:

```text
Stock Safe
Restock Priority
```

### 11.4 Prediksi Profit

Endpoint:

```http
POST /predict/profit
```

Body:

```json
{
  "kode_barang": "R1284"
}
```

Output:

```json
{
  "estimated_profit_ratio": 0.034,
  "estimated_profit_percent": 3.4,
  "profit_category": "Low Profit"
}
```

---

## 12. Cara Pakai dari Frontend / Fullstack

### 12.1 Contoh Fetch JavaScript

```javascript
const API_BASE_URL = "http://localhost:8000";

async function predictAll(kodeBarang) {
  const response = await fetch(`${API_BASE_URL}/predict/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kode_barang: kodeBarang,
    }),
  });

  if (!response.ok) {
    throw new Error("Gagal memanggil AI API");
  }

  return await response.json();
}

predictAll("R1284")
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

### 12.2 Contoh Axios

```javascript
import axios from "axios";

const aiApi = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 30000,
});

export async function predictAll(kodeBarang) {
  const response = await aiApi.post("/predict/all", {
    kode_barang: kodeBarang,
  });

  return response.data;
}

export async function getRestockRecommendations(limit = 10) {
  const response = await aiApi.get(`/recommendations/restock-priority?limit=${limit}`);
  return response.data;
}
```

### 12.3 Contoh Express Backend sebagai Proxy

Jika frontend tidak ingin langsung memanggil FastAPI, backend Express bisa membuat proxy.

```javascript
import express from "express";
import axios from "axios";

const router = express.Router();

const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "http://localhost:8000";

router.post("/ai/predict-all", async (req, res) => {
  try {
    const response = await axios.post(`${AI_API_BASE_URL}/predict/all`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Gagal memanggil AI service",
      error: error.response?.data || error.message,
    });
  }
});

export default router;
```

---

## 13. OCR Nota

Endpoint:

```http
POST /ocr/scan-receipt
```

Request type:

```text
multipart/form-data
```

Field file:

```text
file
```

Contoh JavaScript:

```javascript
async function scanReceipt(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/ocr/scan-receipt", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("OCR gagal");
  }

  return await response.json();
}
```

Contoh response:

```json
{
  "merchant_name": "Toko Contoh",
  "transaction_date": "2026-05-26",
  "items": [
    {
      "nama_produk": "Indomie Goreng",
      "qty": 5,
      "harga": 3500,
      "total": 17500
    }
  ],
  "subtotal": 17500,
  "tax": null,
  "discount": null,
  "total_transaksi": 17500,
  "confidence": 0.9,
  "raw_text": "..."
}
```

---

## 14. Automated Testing

Pastikan API sedang berjalan:

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
=== TEST SUMMARY ===
Passed: 32
Failed: 0
Status: PASSED
```

Test OCR otomatis:

```bat
python tests\auto_test_api.py --limit 20 --ocr-image "C:\Users\sandi\Downloads\nota.jpg"
```

Jika tidak memakai `--ocr-image`, OCR akan dilewati.

---

## 15. Deploy dengan Docker

Build image:

```bat
docker build -t tata-arta-ai .
```

Run container:

```bat
docker run --env-file .env -p 8000:8000 tata-arta-ai
```

Atau dengan Docker Compose:

```bat
docker compose up --build
```

API akan tersedia di:

```text
http://localhost:8000/docs
```

---

## 16. Deploy ke Render

Pastikan file berikut tersedia:

```text
Dockerfile
render.yaml
requirements.txt
```

Langkah umum:

1. Push folder `Ai/` ke GitHub.
2. Buka Render.
3. Buat Web Service baru.
4. Pilih repo Tata-Arta.
5. Root directory isi:
   ```text
   Ai
   ```
6. Environment:
   ```text
   Docker
   ```
7. Tambahkan environment variable:
   ```text
   GEMINI_API_KEY=isi_key_asli_di_render
   GEMINI_OCR_MODEL=gemini-3.5-flash
   APP_ENV=production
   ```
8. Deploy.

---

## 17. Catatan Keamanan

Jangan commit file ini:

```text
.env
venv/
__pycache__/
```

Cek apakah API key bocor:

```bat
findstr /S /I "AIza" *
```

Jika API key pernah terlanjur masuk GitHub, segera rotate/generate API key baru.

---

## 18. Troubleshooting

### Error: `No module named 'src'`

Jalankan dari folder root `Ai`, bukan dari dalam folder `tests`:

```bat
cd C:\Users\sandi\Downloads\Projek\Tata-Arta\Ai
python tests\auto_test_api.py --limit 20
```

### Error: `tensorflow.keras has no attribute saving`

Gunakan decorator ini di custom layer:

```python
@tf.keras.utils.register_keras_serializable(package="TataArta")
```

Bukan:

```python
@keras.saving.register_keras_serializable(package="TataArta")
```

### Error: `No module named pkg_resources`

Jalankan:

```bat
pip uninstall setuptools -y
pip install "setuptools<82"
```

### Model tidak terbaca di `/health`

Cek folder `models/`:

```bat
dir models
```

Pastikan file `.keras` dan `.joblib` ada.

### Port 8000 sudah dipakai

Gunakan port lain:

```bat
uvicorn api.main:app --reload --host 0.0.0.0 --port 8001
```

Lalu buka:

```text
http://localhost:8001/docs
```

---

## 19. Checklist Sebelum Push GitHub

```text
.env tidak ikut commit
API key tidak ada di kode
venv tidak ikut commit
__pycache__ tidak ikut commit
requirements.txt lengkap
README.md sudah jelas
models tersedia atau training command dijelaskan
automated test PASSED
OCR sudah dites
TensorBoard screenshot sudah disimpan
```

Commit:

```bat
cd C:\Users\sandi\Downloads\Projek\Tata-Arta
git status
git add Ai
git commit -m "Add AI engineering service"
git push origin main
```

---

## 20. Ringkasan untuk Tim Fullstack

Jalankan AI API:

```bat
cd Ai
venv\Scripts\activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Base URL:

```text
http://localhost:8000
```

Endpoint utama yang paling sering dipakai:

```text
POST /predict/all
GET  /recommendations/restock-priority
GET  /insights/summary
POST /ocr/scan-receipt
```

Contoh request utama:

```json
{
  "kode_barang": "R1284"
}
```
