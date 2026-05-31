# Tata-Arta AI Service — Panduan Integrasi untuk Fullstack

Dokumen ini dibuat untuk tim **Fullstack (FS)** agar mudah memahami cara menggunakan service AI Tata-Arta di dalam website.

AI service ini dipakai untuk:

1. Mencari produk dari dataset AI.
2. Memprediksi produk termasuk **Slow Moving**, **Normal**, atau **Fast Moving**.
3. Memprediksi apakah produk perlu **Restock Priority** atau masih **Stock Safe**.
4. Mengestimasi kategori profit produk.
5. Memberikan rekomendasi produk.
6. Memberikan insight dashboard.
7. Memberikan forecast KPI sederhana.
8. Membaca nota/faktur dengan OCR Gemini.

---

## 1. Posisi AI dalam Arsitektur Aplikasi

AI service **bukan database utama** dan **bukan pengganti backend fullstack**.

AI hanya menerima request, melakukan prediksi/OCR, lalu mengembalikan response JSON.

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

Untuk demo, frontend boleh langsung memanggil AI service.
Untuk production, frontend sebaiknya **tidak langsung hit AI**, tetapi melalui backend fullstack.

Alasannya:

1. Backend bisa menyembunyikan URL AI service.
2. Backend bisa mengatur role Owner/Karyawan.
3. Backend bisa mengirim data produk yang sudah dihitung dari database.
4. Backend bisa memfilter response AI sebelum dikirim ke frontend.
5. Backend bisa menyimpan hasil yang sudah dikonfirmasi user.

---

## 2. Base URL AI Service

Saat local development:

```text
http://localhost:8000
```

Swagger/OpenAPI:

```text
http://localhost:8000/docs
```

Saat production:

```text
https://URL-DEPLOY-AI-SERVICE
```

Simpan URL AI di environment backend fullstack.

Contoh `.env` backend:

```env
AI_API_BASE_URL=http://localhost:8000
```

Untuk production:

```env
AI_API_BASE_URL=https://URL-DEPLOY-AI-SERVICE
```

---

## 3. Endpoint yang Dipakai Fullstack

| Fitur              | Method | Endpoint                            | Dipakai Untuk                    |
| ------------------ | -----: | ----------------------------------- | -------------------------------- |
| Health Check       |    GET | `/health`                           | Cek AI service dan model aktif   |
| Metadata           |    GET | `/metadata`                         | Cek fitur yang tersedia          |
| Product Search     |    GET | `/products/search?q=beras&limit=10` | Search/autocomplete produk       |
| Predict All        |   POST | `/predict/all`                      | Prediksi lengkap produk          |
| Fast Moving        |   POST | `/predict/fast-moving`              | Prediksi cepat/lambat laku       |
| Low Stock          |   POST | `/predict/low-stock`                | Prediksi prioritas restock       |
| Profit             |   POST | `/predict/profit`                   | Estimasi profit produk           |
| Top Products       |    GET | `/recommendations/top-products`     | Rekomendasi produk terlaris      |
| High Profit        |    GET | `/recommendations/high-profit`      | Rekomendasi produk profit tinggi |
| Restock Priority   |    GET | `/recommendations/restock-priority` | Rekomendasi produk perlu restock |
| Insight Summary    |    GET | `/insights/summary`                 | Ringkasan insight dashboard      |
| Daily KPI Forecast |    GET | `/forecast/daily-kpi?days=7`        | Forecast KPI harian              |
| OCR Nota           |   POST | `/ocr/scan-receipt`                 | Scan nota/faktur                 |

Endpoint utama yang paling sering dipakai FS adalah:

```text
POST /predict/all
```

Karena endpoint ini langsung mengembalikan 3 hasil sekaligus:

1. Fast moving prediction.
2. Low stock/restock prediction.
3. Profit prediction.

---

## 4. Tanggung Jawab Backend Fullstack

Backend fullstack bertanggung jawab untuk:

1. Menyimpan database produk.
2. Menyimpan database transaksi.
3. Menyimpan stok.
4. Menyimpan user dan role.
5. Menghitung fitur produk dari database.
6. Mengirim request ke AI.
7. Memfilter response AI sesuai role user.
8. Menyimpan hasil OCR hanya setelah dikonfirmasi user.
9. Menentukan data mana yang boleh dilihat Owner dan Karyawan.

AI tidak otomatis tahu data toko/client.
AI hanya memprediksi berdasarkan data yang dikirim oleh backend.

Jadi untuk production multi-client, backend wajib mengirim data produk sesuai toko masing-masing.

---

## 5. Cara Memakai AI untuk Produk Lama

Produk lama adalah produk yang sudah ada di dataset AI.

Backend cukup mengirim `kode_barang`.

Contoh request:

```http
POST /predict/all
Content-Type: application/json
```

```json
{
  "kode_barang": "R1284"
}
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
    "confidence": 0.93,
    "probabilities": {
      "Slow Moving": 0.01,
      "Normal": 0.06,
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
    "estimated_profit_ratio": 0.07,
    "estimated_profit_percent": 7.0,
    "profit_category": "Low Profit"
  }
}
```

---

## 6. Cara Memakai AI untuk Produk Berdasarkan Nama

Jika backend atau frontend belum punya `kode_barang`, bisa mengirim `nama_barang`.

Contoh:

```json
{
  "nama_barang": "INDOMIE RENDANG"
}
```

AI akan mencoba mencari produk berdasarkan:

1. Nama exact.
2. Nama mengandung keyword.
3. Fuzzy matching.
4. Jika tetap tidak ditemukan, akan mengembalikan error.

Contoh `match_type` yang mungkin muncul:

```text
kode_barang_exact
name_exact
name_contains
name_fuzzy
manual_features
```

Penjelasan:

| Match Type          | Arti                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| `kode_barang_exact` | Produk ditemukan dari kode barang                                         |
| `name_exact`        | Nama produk cocok persis                                                  |
| `name_contains`     | Nama produk mengandung keyword                                            |
| `name_fuzzy`        | Nama produk mirip dengan query                                            |
| `manual_features`   | Produk tidak dicari di dataset, tetapi memakai fitur yang dikirim backend |

---

## 7. Cara Memakai AI untuk Produk Baru / Produk Client

Untuk produk baru atau produk dari toko/client yang belum ada di dataset AI, backend tidak cukup hanya mengirim nama barang.

Backend harus mengirim fitur lengkap dari database toko.

Contoh request:

```json
{
  "nama_barang": "KOPI ABC 20GR",
  "kategori": "MINUMAN",
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

Jika produk tidak ada di dataset AI tetapi backend mengirim fitur lengkap, AI akan memakai mode:

```text
manual_features
```

Ini penting untuk production karena setiap toko bisa punya produk yang berbeda.

---

## 8. Field yang Sebaiknya Dikirim Backend

Untuk hasil prediksi yang lebih relevan, backend sebaiknya mengirim field berikut.

### Field Identitas Produk

| Field          |                   Wajib | Keterangan                           |
| -------------- | ----------------------: | ------------------------------------ |
| `kode_barang`  |                Opsional | Dipakai jika produk sudah punya kode |
| `nama_barang`  | Wajib untuk produk baru | Nama produk dari database            |
| `kategori`     |              Disarankan | Kategori produk                      |
| `sub_kategori` |                Opsional | Sub kategori                         |
| `supplier`     |              Disarankan | Supplier produk                      |
| `satuan_1`     |                Opsional | Satuan barang                        |

### Field Harga dan Profit

| Field               |      Wajib | Keterangan                   |
| ------------------- | ---------: | ---------------------------- |
| `hpp`               | Disarankan | Harga pokok pembelian        |
| `harga_toko_1`      | Disarankan | Harga jual utama             |
| `trx_total_revenue` | Disarankan | Total revenue dari transaksi |
| `trx_total_profit`  | Disarankan | Total profit dari transaksi  |

### Field Stok

| Field         |      Wajib | Keterangan             |
| ------------- | ---------: | ---------------------- |
| `stok_min`    | Disarankan | Batas minimum stok     |
| `stok_max`    | Disarankan | Batas maksimum stok    |
| `total_stock` | Disarankan | Stok tersedia saat ini |
| `toko`        |   Opsional | Stok di toko           |
| `gudang`      |   Opsional | Stok di gudang         |

### Field Transaksi

| Field               |             Wajib | Keterangan                   |
| ------------------- | ----------------: | ---------------------------- |
| `trx_total_qty`     | Sangat disarankan | Total qty terjual            |
| `trx_qty_30d`       | Sangat disarankan | Qty terjual 30 hari terakhir |
| `trx_qty_60d`       |        Disarankan | Qty terjual 60 hari terakhir |
| `trx_qty_90d`       | Sangat disarankan | Qty terjual 90 hari terakhir |
| `trx_count`         |        Disarankan | Jumlah transaksi             |
| `trx_total_revenue` |        Disarankan | Total omzet produk           |
| `trx_total_profit`  |        Disarankan | Total profit produk          |

---

## 9. Aturan Backend untuk Banyak Toko / Banyak Client

Untuk production, setiap toko/client punya data produk dan transaksi sendiri.

AI tidak perlu menyimpan semua data toko.
Backend cukup menghitung fitur produk dari database masing-masing toko, lalu mengirim hasilnya ke AI.

Contoh alur multi-client:

```text
User toko A klik analisis produk
↓
Backend ambil produk dari database toko A
↓
Backend hitung stok, transaksi, revenue, profit toko A
↓
Backend kirim fitur ke AI
↓
AI mengembalikan prediksi
↓
Backend filter response sesuai role
↓
Frontend menampilkan hasil
```

Jangan memakai data toko lain untuk prediksi toko yang berbeda.

Contoh payload yang baik untuk multi-client:

```json
{
  "nama_barang": "SUSU UHT COKLAT 250ML",
  "kategori": "MINUMAN",
  "supplier": "SUPPLIER TOKO A",
  "hpp": 3500,
  "harga_toko_1": 5000,
  "stok_min": 20,
  "stok_max": 150,
  "total_stock": 35,
  "trx_total_qty": 120,
  "trx_qty_30d": 45,
  "trx_qty_60d": 80,
  "trx_qty_90d": 120,
  "trx_count": 65,
  "trx_total_revenue": 600000,
  "trx_total_profit": 180000
}
```

---

## 10. Aturan Produk Baru dengan Data Transaksi Sedikit

Kalau produk baru belum punya cukup data transaksi, backend tetap boleh mengirim request ke AI.
Tapi frontend harus menampilkan bahwa hasilnya masih estimasi awal.

Contoh aturan:

```text
Jika trx_count < 5:
  tampilkan "Prediksi awal, data transaksi belum cukup."

Jika trx_count >= 5:
  tampilkan hasil AI normal.
```

Contoh UI message:

```text
Data penjualan produk ini masih sedikit. Hasil AI masih berupa estimasi awal dan bisa berubah setelah transaksi bertambah.
```

---

## 11. Response `/predict/all` untuk Frontend

Endpoint:

```http
POST /predict/all
```

Response utama:

```json
{
  "matched_product": {},
  "fast_moving": {},
  "low_stock": {},
  "profit": {}
}
```

Penjelasan:

| Key               | Fungsi                                 |
| ----------------- | -------------------------------------- |
| `matched_product` | Produk yang dipakai AI untuk prediksi  |
| `fast_moving`     | Hasil prediksi slow/normal/fast moving |
| `low_stock`       | Hasil prediksi stok/restock            |
| `profit`          | Hasil estimasi profit                  |

---

## 12. Mapping Hasil AI ke UI

### Fast Moving

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

Contoh copywriting:

```text
Produk ini termasuk Fast Moving. Pastikan stok tetap tersedia agar tidak kehabisan.
```

---

### Low Stock / Restock

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

Contoh copywriting:

```text
Produk ini perlu diprioritaskan untuk restock berdasarkan pola penjualan dan stok saat ini.
```

---

### Profit

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

Contoh copywriting:

```text
Produk ini memiliki estimasi profit sedang. Owner dapat meninjau harga jual, HPP, dan strategi promosi.
```

---

## 13. Aturan Role Owner dan Karyawan

Pembatasan role wajib dilakukan di backend dan frontend.

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
insight strategis
laporan profit
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
```

Karyawan boleh melihat:

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

Sebelum dikirim ke frontend:

```json
{
  "matched_product": {},
  "fast_moving": {},
  "low_stock": {},
  "profit": {}
}
```

Setelah difilter untuk Karyawan:

```json
{
  "matched_product": {},
  "fast_moving": {},
  "low_stock": {}
}
```

Jadi backend harus menghapus key `profit` jika user adalah Karyawan.

---

## 14. Endpoint Product Search

Endpoint:

```http
GET /products/search?q=beras&limit=10
```

Contoh response:

```json
{
  "query": "beras",
  "count": 3,
  "items": [
    {
      "kode_barang": "B4533",
      "nama": "BERAS MERAH 2KG",
      "kategori": "MAKANAN",
      "supplier": "SUPPLIER A",
      "hpp": 25000,
      "harga_toko_1": 30000,
      "trx_total_qty": 50,
      "trx_count": 20,
      "match_score": 0.92
    }
  ]
}
```

Dipakai untuk:

1. Search produk di halaman inventory.
2. Autocomplete saat input transaksi.
3. Autocomplete saat user ingin analisis produk.
4. Membantu frontend mendapatkan `kode_barang`.

Untuk production, search utama tetap sebaiknya dari database fullstack.
Endpoint AI search bisa dipakai sebagai bantuan/demo atau fallback.

---

## 15. Endpoint Rekomendasi

### Top Products

```http
GET /recommendations/top-products?limit=10
```

Dipakai untuk menampilkan produk dengan penjualan tertinggi.

### High Profit

```http
GET /recommendations/high-profit?limit=10
```

Dipakai untuk menampilkan produk dengan profit tinggi.

Catatan:

```text
Endpoint ini hanya boleh ditampilkan untuk Owner.
```

### Restock Priority

```http
GET /recommendations/restock-priority?limit=10
```

Dipakai untuk menampilkan produk yang perlu diprioritaskan restock.

Catatan:

```text
Endpoint ini boleh ditampilkan ke Owner.
Untuk Karyawan boleh ditampilkan jika tidak membuka informasi profit/HPP.
```

---

## 16. Endpoint Insight Summary

Endpoint:

```http
GET /insights/summary
```

Dipakai untuk dashboard ringkasan AI.

Contoh penggunaan:

1. Total produk dianalisis.
2. Jumlah produk fast moving.
3. Jumlah produk slow moving.
4. Jumlah produk perlu restock.
5. Ringkasan performa produk.

Catatan:

```text
Insight yang mengandung profit hanya boleh ditampilkan ke Owner.
```

---

## 17. Endpoint Forecast KPI

Endpoint:

```http
GET /forecast/daily-kpi?days=7
```

Dipakai untuk chart forecast dashboard.

Contoh penggunaan di frontend:

1. Chart estimasi transaksi harian.
2. Chart estimasi revenue.
3. Chart estimasi profit.
4. Dashboard Owner.

Catatan:

```text
Forecast profit hanya boleh ditampilkan ke Owner.
```

---

## 18. Endpoint OCR Nota/Faktur

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

Contoh response:

```json
{
  "merchant_name": "TOKO MAJU JAYA",
  "transaction_date": "2026-05-31",
  "items": [
    {
      "name": "INDOMIE RENDANG",
      "qty": 2,
      "price": 3500,
      "subtotal": 7000
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

Alur OCR yang wajib dibuat di UI:

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

Hasil OCR tidak boleh langsung disimpan otomatis ke database.

Alasannya:

1. OCR bisa salah baca nama produk.
2. OCR bisa salah baca qty.
3. OCR bisa salah baca harga.
4. OCR bisa salah baca total.
5. User harus tetap melakukan validasi manual.

---

## 19. Contoh Integrasi Backend ke AI

Contoh sederhana memakai JavaScript/TypeScript:

```ts
const AI_API_BASE_URL = process.env.AI_API_BASE_URL;

export async function predictProduct(productPayload: any) {
  const response = await fetch(`${AI_API_BASE_URL}/predict/all`, {
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

Contoh filter role:

```ts
export function filterAiResponseByRole(aiResult: any, role: "owner" | "karyawan") {
  if (role === "owner") {
    return aiResult;
  }

  const { profit, ...safeResult } = aiResult;
  return safeResult;
}
```

Contoh flow controller backend:

```ts
export async function analyzeProduct(req: any, res: any) {
  const userRole = req.user.role;
  const productId = req.params.productId;

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      transactions: true,
      stock: true
    }
  });

  const payload = {
    nama_barang: product.name,
    kategori: product.category,
    supplier: product.supplierName,
    hpp: product.hpp,
    harga_toko_1: product.sellingPrice,
    stok_min: product.minStock,
    stok_max: product.maxStock,
    total_stock: product.currentStock,
    trx_total_qty: product.totalSoldQty,
    trx_qty_30d: product.soldQty30d,
    trx_qty_60d: product.soldQty60d,
    trx_qty_90d: product.soldQty90d,
    trx_count: product.transactionCount,
    trx_total_revenue: product.totalRevenue,
    trx_total_profit: product.totalProfit
  };

  const aiResult = await predictProduct(payload);
  const filteredResult = filterAiResponseByRole(aiResult, userRole);

  return res.json(filteredResult);
}
```

---

## 20. Error Handling dari AI

Backend harus siap menangani error dari AI.

### Produk Tidak Ditemukan

Biasanya status:

```text
404
```

Contoh:

```json
{
  "detail": "nama_barang 'PRODUK X' tidak ditemukan. Pastikan nama barang berasal dari daftar produk."
}
```

Yang harus dilakukan frontend:

```text
Tampilkan pesan:
Produk belum ditemukan di data AI. Lengkapi data produk terlebih dahulu agar AI bisa melakukan estimasi.
```

### Payload Tidak Valid

Biasanya status:

```text
400
```

Yang harus dilakukan frontend:

```text
Tampilkan pesan:
Data produk belum lengkap atau format tidak valid.
```

### AI Service Error

Biasanya status:

```text
500
```

Yang harus dilakukan backend/frontend:

```text
Tampilkan pesan:
Layanan AI sedang bermasalah. Silakan coba lagi nanti.
```

---

## 21. Hal yang Wajib Dihindari FS

Jangan lakukan ini:

```text
1. Jangan tampilkan profit ke Karyawan.
2. Jangan tampilkan HPP ke Karyawan.
3. Jangan simpan hasil OCR otomatis tanpa review user.
4. Jangan menganggap AI sebagai database utama.
5. Jangan hanya kirim nama_barang untuk produk baru tanpa fitur stok/transaksi.
6. Jangan memakai data toko lain untuk prediksi toko berbeda.
7. Jangan hardcode URL AI di frontend production.
8. Jangan menyimpan GEMINI_API_KEY di frontend.
```

---

## 22. Cara Test dari Sisi Fullstack

Pastikan AI service sudah jalan:

```powershell
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Cek health:

```http
GET http://localhost:8000/health
```

Expected response:

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

Test prediksi:

```http
POST http://localhost:8000/predict/all
Content-Type: application/json
```

```json
{
  "kode_barang": "R1284"
}
```

Test produk baru:

```json
{
  "nama_barang": "KOPI ABC TEST",
  "kategori": "MINUMAN",
  "supplier": "SUPPLIER TEST",
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

---

## 23. Test Otomatis AI

Dari folder `Ai`:

```powershell
python tests\auto_test_api.py --limit 20
```

Expected result:

```text
Passed : 130
Failed : 0
Skipped: 1
Status : PASSED
```

`Skipped: 1` biasanya OCR karena belum diberi gambar nota.
Itu bukan error.

Untuk test OCR:

```powershell
python tests\auto_test_api.py --limit 20 --ocr-image "C:\Users\sandi\Downloads\nota.jpg" --require-ocr
```

---

## 24. Kesimpulan untuk Fullstack

Untuk integrasi website, gunakan aturan ini:

```text
1. Backend fullstack menjadi penghubung antara frontend dan AI.
2. Endpoint utama prediksi adalah POST /predict/all.
3. Produk lama boleh dikirim dengan kode_barang.
4. Produk baru wajib dikirim dengan fitur lengkap.
5. AI hanya memproses data yang dikirim backend.
6. Backend tetap menjadi sumber data utama.
7. Owner boleh melihat profit/HPP/margin.
8. Karyawan tidak boleh melihat profit/HPP/margin.
9. OCR wajib manual: scan → review/edit → simpan.
10. Untuk banyak toko/client, backend harus menghitung fitur dari database masing-masing toko.
```

AI service sudah siap dipakai oleh Fullstack selama backend mengirim payload yang benar dan melakukan filter role dengan benar.
