# Tata Arta - Aplikasi Pengelolaan Keuangan UMKM berbasis AI

Aplikasi full-stack yang dirancang untuk mengotomatisasi pembukuan transaksi, estimasi laba-rugi secara akurat, serta menyajikan evaluasi finansial UMKM melalui integrasi teknologi kecerdasan buatan

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui |
| **Backend** | Express.js + Prisma ORM + Zod Validation |
| **Monorepo** | Turborepo (npm workspaces) |
| **Database** | PostgreSQL |
| **AI Service** | Python FastAPI (terpisah, port 8000) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Charts** | Recharts |
| **Font** | IBM Plex Sans |

## Struktur Proyek (Monorepo — Turborepo)

```
finance-app/
├── package.json                    # Root workspace config + turbo scripts
├── turbo.json                      # Pipeline build/dev/typecheck
├── backend/                        # Express API server
├── backend/                        # Express API server
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Data demo
│   ├── src/
│   │   ├── index.ts               # Entry point (port 3001)
│   │   ├── dto/                   # Zod schemas & TypeScript types
│   │   │   ├── auth.dto.ts
│   │   │   ├── transaction.dto.ts
│   │   │   ├── product.dto.ts
│   │   │   ├── category.dto.ts
│   │   │   ├── budget.dto.ts
│   │   │   ├── sale.dto.ts
│   │   │   └── ai.dto.ts
│   │   ├── controllers/           # Request handling (parse → service → response)
│   │   │   ├── auth.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── budget.controller.ts
│   │   │   ├── sale.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── export.controller.ts
│   │   │   └── import.controller.ts
│   │   ├── services/              # Business logic + Prisma queries
│   │   │   ├── auth.service.ts
│   │   │   ├── transaction.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── category.service.ts
│   │   │   ├── budget.service.ts
│   │   │   ├── sale.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── report.service.ts
│   │   │   ├── ai.service.ts      # HTTP client untuk AI API
│   │   │   ├── export.service.ts
│   │   │   └── import.service.ts
│   │   ├── routes/                # Thin routing (middleware → controller)
│   │   │   ├── auth.ts
│   │   │   ├── categories.ts
│   │   │   ├── transactions.ts
│   │   │   ├── products.ts
│   │   │   ├── budgets.ts
│   │   │   ├── sales.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── reports.ts
│   │   │   ├── ai.ts
│   │   │   ├── export.ts
│   │   │   └── import.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   └── validate.ts        # Zod request validation
│   │   └── utils/
│   │       ├── prisma.ts          # Prisma client instance
│   │       └── errors.ts          # Custom error classes
│   └── .env                       # DATABASE_URL, JWT_SECRET, AI_BASE_URL
│
├── frontend/                       # React SPA
│   ├── public/
│   │   ├── favicon.svg            # Favicon SVG fallback
│   │   ├── icon.webp              # Favicon primary (logo)
│   │   └── icons.svg              # Icon sprite
│   └── src/
│       ├── assets/
│       │   ├── logo.webp          # Logo aplikasi (1024×1024)
│       │   ├── hero.webp          # Hero image (1408×768)
│       │   └── hero.png           # Hero image fallback
│       ├── components/
│       │   ├── ui/                # shadcn/ui components
│       │   └── Layout.tsx         # Sidebar + header layout
│       ├── context/
│       │   └── AuthContext.tsx     # Auth state management
│       ├── pages/
│       │   ├── Login.tsx          # Halaman login
│       │   ├── Register.tsx       # Halaman register
│       │   ├── Dashboard.tsx      # Dashboard utama + charts
│       │   ├── Transactions.tsx   # Manajemen transaksi
│       │   ├── Products.tsx       # Manajemen produk + AI prediksi
│       │   ├── Categories.tsx     # Manajemen kategori
│       │   ├── Budgets.tsx        # Anggaran belanja
│       │   ├── Sales.tsx          # Pencatatan penjualan
│       │   ├── Reports.tsx        # Laporan laba/rugi & arus kas
│       │   └── AiInsights.tsx     # Insight & rekomendasi AI
│       ├── services/
│       │   └── api.ts             # API client (all endpoints)
│       └── lib/
│           └── utils.ts           # Utility functions
│
```

## Fitur

### 1. Autentikasi
- Register akun baru
- Login dengan JWT token
- Rate limiting (10 percobaan per 15 menit)
- Protected routes (redirect ke login jika belum auth)
- Logo aplikasi di halaman login & register

### 2. Dashboard
- Ringkasan total pendapatan, pengeluaran, laba bersih
- Grafik batang pendapatan & pengeluaran bulanan
- 5 transaksi terbaru
- Top 5 kategori pengeluaran

### 3. Manajemen Kategori
- Kategori INCOME (Pendapatan)
- Kategori EXPENSE (Pengeluaran)
- CRUD dengan validasi nama unik per user
- Menampilkan jumlah transaksi per kategori

### 4. Manajemen Transaksi
- Catat pemasukan & pengeluaran
- Filter berdasarkan tipe, kategori, tanggal, pencarian
- Pagination
- CRUD lengkap
- Export/Import CSV

### 5. Manajemen Produk
- Data produk: kode, nama, harga, modal, stok, kategori
- Pencarian produk dengan match scoring
- CRUD lengkap
- Export CSV
- Prediksi AI per produk (Fast Moving, Restock Priority, Profit)

### 6. Anggaran (Budget)
- Atur anggaran per kategori per bulan
- Update otomatis jika anggaran sudah ada
- Laporan perbandingan anggaran vs realisasi

### 7. Penjualan (Sales)
- Catat penjualan multi-item (keranjang)
- Otomatis kurangi stok produk
- Hapus penjualan → stok dikembalikan
- Menampilkan total & profit per penjualan

### 8. Laporan
- **Laba/Rugi**: Summary pendapatan, pengeluaran, laba bersih, breakdown per kategori
- **Arus Kas**: Grafik area pemasukan, pengeluaran, saldo per bulan

### 9. AI Insights
- **Health Check**: Status layanan AI
- **Ringkasan Insight**: Analisis keuangan otomatis (DS mode & realtime)
- **Forecast KPI**: Prediksi pendapatan & pengeluaran harian
- **Produk Terlaris**: Rekomendasi produk terlaris
- **Produk Profit Tinggi**: Produk dengan margin laba terbaik
- **Prioritas Restok**: Rekomendasi stok barang
- **OCR Scan Nota**: Ekstrak data dari foto nota (JPG, PNG, WebP)

### 10. Export / Import CSV
- Export transaksi ke CSV
- Export produk ke CSV
- Import transaksi dari CSV (dengan auto-create kategori)

## Persyaratan Sistem

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

## Instalasi & Menjalankan

### 1. Clone & Install Dependencies

```bash
# Install semua workspace (root)
npm install
```

### 2. Setup Database PostgreSQL

```bash
# Buat database
createdb finance_app

# Atau via psql
psql -U postgres -c "CREATE DATABASE finance_app;"
```

### 3. Konfigurasi Backend

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_app?schema=public
JWT_SECRET=your-secret-key
AI_BASE_URL=http://localhost:8000
```

### 4. Migrasi & Seed Database

```bash
cd backend
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 5. Jalankan Kedua Server (Backend + Frontend)

```bash
npm run dev
```

Atau jalankan terpisah:

```bash
# Backend saja
cd backend && npm run dev       # → http://localhost:3001

# Frontend saja
cd frontend && npm run dev      # → http://localhost:5173
```

### 7. (Opsional) Jalankan AI Service

Jalankan AI service Python di `http://localhost:8000`

## Akun Demo

- **Email**: `demo@finance.app`
- **Password**: `password123`

## API Endpoints

### Backend (`localhost:3001/api`)

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/health` | Cek server | - |
| POST | `/auth/register` | Register user | - |
| POST | `/auth/login` | Login user | - |
| GET | `/auth/profile` | Profile user | ✅ |
| GET | `/categories` | List kategori (filter by type) | ✅ |
| GET | `/categories/:id` | Detail kategori | ✅ |
| POST | `/categories` | Buat kategori | ✅ |
| PUT | `/categories/:id` | Update kategori | ✅ |
| DELETE | `/categories/:id` | Hapus kategori | ✅ |
| GET | `/transactions` | List transaksi (filter, search, pagination) | ✅ |
| GET | `/transactions/:id` | Detail transaksi | ✅ |
| POST | `/transactions` | Catat transaksi | ✅ |
| PUT | `/transactions/:id` | Update transaksi | ✅ |
| DELETE | `/transactions/:id` | Hapus transaksi | ✅ |
| GET | `/products` | List produk (search, pagination) | ✅ |
| GET | `/products/search` | Cari produk dengan match score | ✅ |
| GET | `/products/:id` | Detail produk | ✅ |
| POST | `/products` | Tambah produk | ✅ |
| PUT | `/products/:id` | Update produk | ✅ |
| DELETE | `/products/:id` | Hapus produk | ✅ |
| GET | `/dashboard/summary` | Ringkasan dashboard | ✅ |
| GET | `/dashboard/monthly` | Data bulanan | ✅ |
| GET | `/dashboard/stats` | Statistik | ✅ |
| GET | `/reports/profit-loss` | Laporan laba/rugi | ✅ |
| GET | `/reports/cashflow` | Laporan arus kas | ✅ |
| GET | `/budgets` | List anggaran (filter month/year) | ✅ |
| GET | `/budgets/spending` | Laporan anggaran vs realisasi | ✅ |
| GET | `/budgets/:id` | Detail anggaran | ✅ |
| POST | `/budgets` | Buat/update anggaran | ✅ |
| PUT | `/budgets/:id` | Update anggaran | ✅ |
| DELETE | `/budgets/:id` | Hapus anggaran | ✅ |
| GET | `/sales` | List penjualan (pagination) | ✅ |
| GET | `/sales/:id` | Detail penjualan | ✅ |
| POST | `/sales` | Catat penjualan (multi-item) | ✅ |
| DELETE | `/sales/:id` | Hapus penjualan | ✅ |
| GET | `/export/transactions/csv` | Export transaksi CSV | ✅ |
| GET | `/export/products/csv` | Export produk CSV | ✅ |
| POST | `/import/transactions` | Import transaksi dari CSV | ✅ |

### AI Proxy (`localhost:3001/api/ai`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Cek status AI service |
| GET | `/metadata` | Metadata model AI |
| POST | `/predict/all` | Prediksi semua model |
| POST | `/predict/fast-moving` | Prediksi fast moving |
| POST | `/predict/low-stock` | Prediksi restock |
| POST | `/predict/profit` | Prediksi profit |
| GET | `/recommendations/top-products` | Rekomendasi produk terlaris (DS) |
| POST | `/recommendations/top-products` | Rekomendasi produk terlaris (realtime) |
| GET | `/recommendations/high-profit` | Rekomendasi profit tinggi (DS) |
| POST | `/recommendations/high-profit` | Rekomendasi profit tinggi (realtime) |
| GET | `/recommendations/restock-priority` | Prioritas restok (DS) |
| POST | `/recommendations/restock-priority` | Prioritas restok (realtime) |
| GET | `/insights/summary` | Ringkasan insight AI (DS) |
| POST | `/insights/summary` | Ringkasan insight AI (realtime) |
| GET | `/products/search` | Cari produk via AI |
| GET | `/forecast/daily-kpi` | Forecast KPI harian (DS) |
| POST | `/forecast/daily-kpi` | Forecast KPI harian (realtime) |
| POST | `/ocr/scan-receipt` | OCR scan nota (multipart) |

### AI Service (`localhost:8000`)

Endpoint AI yang digunakan oleh proxy backend:

**Format request prediksi:**
```json
POST /predict/all
{
  "kode_barang": "R1284"
}
```

**Response:**
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

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `PORT` | `3001` | Port server |
| `JWT_SECRET` | `finance-app-secret-key-2024` | Secret key JWT |
| `AI_BASE_URL` | `http://localhost:8000` | URL AI service |

### Frontend (Vite proxy)

Konfigurasi proxy sudah ada di `vite.config.ts`:
- `/api` → `http://localhost:3001`

## Pengembangan

### Turborepo (Root)

```bash
# Jalanin backend + frontend bersamaan
npm run dev

# Build semua workspace
npm run build

# Type-check semua workspace
npm run typecheck

# Hapus artifact build
npm run clean
```

### Backend

```bash
cd backend

# Update schema & client
npx prisma format
npx prisma generate
npx prisma migrate dev --name nama_migrasi

# Prisma studio (database GUI)
npx prisma studio

# Build production
npm run build
```

### Frontend

```bash
cd frontend

# Build production
npm run build

# Preview production build
npm run preview
```

## Lisensi

Proyek ini dibuat untuk tujuan edukasi dan pengembangan aplikasi pengelolaan keuangan UMKM.
