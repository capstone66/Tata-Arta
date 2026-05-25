# UMKM Analytics Dashboard

## Project Overview

UMKM Analytics Dashboard adalah proyek Data Science dan Business Intelligence yang bertujuan membantu pelaku UMKM dalam memantau performa bisnis secara interaktif melalui visualisasi data dan dashboard analytics.

Project ini melakukan proses data secara end-to-end mulai dari:

* Data Cleaning
* Generate transaksi otomatis
* Feature Engineering
* Exploratory Data Analysis (EDA)
* Dashboard Analytics menggunakan Streamlit

Dataset yang digunakan berasal dari data barang UMKM yang kemudian diproses dan dikembangkan menjadi sistem analytics lengkap.

---

# Business Questions

1. Produk apa yang paling banyak terjual?
2. Produk mana yang memiliki profit margin tertinggi?
3. Bagaimana tren omset harian dan bulanan?
4. Produk mana yang memiliki stok kritis?
5. Metode pembayaran apa yang paling sering digunakan?
6. Bagaimana performa profit UMKM?
7. Bagaimana total pengeluaran dan laba bisnis?
8. Produk apa yang termasuk fast moving product?

---

# Tech Stack

Project menggunakan teknologi berikut:

* Python
* Pandas
* NumPy
* Plotly
* Streamlit
* Scikit-learn
* OpenPyXL
* XLRD

---

# Project Structure

```text
umkm-analytic/

└── data-science/
    ├── data/
    │   ├── raw/
    │   │   └── data_barang_30000.xls
    │   │
    │   └── processed/
    │       ├── products_clean.csv
    │       ├── transactions.csv
    │       ├── products_featured.csv
    │       └── daily_kpi.csv
    │
    ├── scripts/
    │   ├── cleaning.py
    │   ├── generate_transactions.py
    │   └── feature_engineering.py
    │
    ├── notebooks/
    │   └── eda.ipynb
    │
    ├── dashboard/
    │   └── app.py
    │
    ├── README.md
    ├── requirements.txt
    └── data_dictionary.md
```

---

# Data Pipeline

## 1. Data Cleaning

Tahap ini melakukan:

* Membersihkan missing values
* Menghapus duplicate data
* Merapikan nama kolom
* Menyiapkan dataset siap analisis

Menjalankan script:

```bash
python data-science/scripts/cleaning.py
```

Output:

* `products_clean.csv`

---

## 2. Generate Transactions

Tahap ini membuat simulasi transaksi otomatis sebanyak ribuan data untuk kebutuhan analytics dashboard.

Fitur yang ditambahkan:

* Payment Method
* Transaction Status
* Expense/Pengeluaran
* Daily KPI Summary

Menjalankan script:

```bash
python data-science/scripts/generate_transactions.py
```

Output:

* `transactions.csv`
* `daily_kpi.csv`

---

## 3. Feature Engineering

Tahap feature engineering digunakan untuk menambahkan fitur baru seperti:

* Profit Margin
* Low Stock Flag
* Fast Moving Product
* Total Sales

Menjalankan script:

```bash
python data-science/scripts/feature_engineering.py
```

Output:

* `products_featured.csv`

---

# Exploratory Data Analysis (EDA)

EDA dilakukan untuk:

* Menganalisis tren penjualan
* Mengetahui produk terlaris
* Menganalisis profit
* Mengetahui distribusi metode pembayaran
* Melihat performa inventory
* Mengetahui produk low stock

EDA dilakukan menggunakan:

* Pandas
* Plotly
* Matplotlib

---

# Dashboard Features

Dashboard dibuat menggunakan Streamlit dan memiliki fitur:

## KPI Dashboard

* Total Revenue
* Total Profit
* Total Expense
* Total Transactions

## Analytics

* Revenue Trend
* Profit Analysis
* Expense Analysis
* Payment Method Distribution
* Top Selling Products
* Low Stock Products
* Fast Moving Products

## Interactive Visualization

* Line Chart
* Bar Chart
* Pie Chart
* Data Table

---

# Installation

Install dependencies:

```bash
pip install -r data-science/requirements.txt
```

---

# Run Dashboard

Menjalankan dashboard Streamlit:

```bash
streamlit run data-science/dashboard/app.py
```

---

# Dataset

## products_clean.csv

Dataset produk hasil cleaning.

## transactions.csv

Dataset transaksi hasil generate otomatis.

## products_featured.csv

Dataset hasil feature engineering.

## daily_kpi.csv

Ringkasan KPI harian.

---

# Data Science Workflow

Project ini telah memenuhi workflow Data Science:

* Gathering Data
* Assessing Data
* Cleaning Data
* Exploratory Data Analysis
* Feature Engineering
* Visualization
* Dashboard Development

---

# Data Dictionary

## products_clean.csv

| Column       | Description        |
| ------------ | ------------------ |
| kode_barang  | Product code       |
| nama         | Product name       |
| kategori     | Product category   |
| supplier     | Supplier name      |
| harga_toko_1 | Selling price      |
| hpp          | Cost of goods sold |
| stok         | Product stock      |

---

## transactions.csv

| Column         | Description        |
| -------------- | ------------------ |
| transaction_id | Transaction ID     |
| tanggal        | Transaction date   |
| kode_barang    | Product code       |
| nama_produk    | Product name       |
| kategori       | Product category   |
| supplier       | Supplier           |
| qty            | Quantity sold      |
| harga_jual     | Selling price      |
| hpp            | Cost price         |
| total          | Total revenue      |
| profit         | Total profit       |
| expense        | Total expense      |
| payment_method | Payment method     |
| status         | Transaction status |
| tahun          | Transaction year   |
| bulan          | Transaction month  |
| hari           | Transaction day    |

---

## products_featured.csv

| Column           | Description                   |
| ---------------- | ----------------------------- |
| profit_margin    | Product profit margin         |
| low_stock_flag   | Low stock indicator           |
| fast_moving_flag | Fast moving product indicator |
| total_sales      | Total sales quantity          |

---

## daily_kpi.csv

| Column             | Description              |
| ------------------ | ------------------------ |
| tanggal            | Date                     |
| total_revenue      | Total daily revenue      |
| total_profit       | Total daily profit       |
| total_expense      | Total daily expense      |
| total_transactions | Total daily transactions |
| total_items_sold   | Total sold items         |

---

# Conclusion

Project UMKM Analytics Dashboard berhasil membangun sistem analytics UMKM berbasis Data Science yang dapat membantu:

* Monitoring bisnis
* Analisis penjualan
* Analisis profit
* Monitoring inventory
* Visualisasi performa bisnis secara interaktif

Dashboard ini diharapkan dapat membantu UMKM mengambil keputusan bisnis berbasis data.

---

# Author

UMKM Analytics Team
