# AI-Powered Financial Analytics for UMKM

## Overview

Project Data Science untuk menganalisis penjualan dan inventory UMKM menggunakan dataset retail nyata dengan lebih dari 32.000 produk.
Project ini bertujuan membantu UMKM mendapatkan insight bisnis melalui dashboard interaktif berbasis Streamlit.

---

# Problem Statement

Banyak UMKM mengalami beberapa masalah seperti:

* Kesulitan monitoring stok barang
* Tidak mengetahui produk paling menguntungkan
* Restock masih dilakukan secara manual
* Tidak memiliki dashboard analitik bisnis
* Sulit membaca tren penjualan

---

# Objectives

Project ini dibuat untuk:

* Menganalisis penjualan produk
* Monitoring inventory dan stok
* Menampilkan insight bisnis
* Mendeteksi low stock products
* Mengidentifikasi fast moving products
* Membuat dashboard interaktif berbasis Data Science

---

# Dataset

## Dataset Utama

Dataset retail nyata dengan 32.000+ produk yang berisi:

* kode barang
* barcode
* nama produk
* kategori
* supplier
* harga pokok (HPP)
* harga jual
* stok toko
* stok gudang

## Dataset Tambahan

Project juga menggunakan dataset sintetis:

### transactions.csv

Berisi:

* transaksi harian
* qty penjualan
* profit
* revenue
* kategori produk

Jumlah transaksi:

* 100.000+ transaksi sintetis

---

# Tech Stack

## Programming Language

* Python

## Data Processing

* Pandas
* NumPy

## Visualization

* Plotly
* Matplotlib

## Dashboard

* Streamlit

## Machine Learning

* Scikit-learn

---

# Features

## Sales Analytics

* Top selling products
* Monthly sales trend
* Revenue analytics
* Category performance

## Inventory Analytics

* Low stock detection
* Total inventory monitoring
* Fast moving products

## Financial Analytics

* Profit analysis
* Profit margin analysis
* Revenue monitoring

## Statistical Analysis

* A/B Testing menggunakan Python

## Dashboard

* Interactive Streamlit dashboard
* KPI metrics
* Data visualization

---

# Project Structure

```bash
umkm-analytic/
│
├── dashboard/
│   └── app.py
│
├── data/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│   └── eda.ipynb
│
├── scripts/
│   ├── cleaning.py
│   ├── generate_transactions.py
│   ├── feature_engineering.py
│   └── ab_testing.py
│
├── requirements.txt
├── README.md
└── data_dictionary.md
```

---

# Data Wrangling

Tahapan data preprocessing:

* Cleaning data
* Handling missing values
* Remove duplicates
* Transformasi data
* Feature engineering
* Generate transaksi sintetis

---

# Feature Engineering

Feature tambahan yang dibuat:

* total_sales
* total_stock
* profit_margin
* low_stock_flag
* fast_moving_flag

---

# Exploratory Data Analysis (EDA)

Analisis yang dilakukan:

* Top selling products
* Revenue analysis
* Monthly sales trend
* Category performance
* Low stock analysis
* Profit margin analysis

---

# A/B Testing

Project ini mengimplementasikan simulasi A/B Testing menggunakan Python untuk membandingkan:

* Penjualan tanpa promo
* Penjualan dengan promo

Menggunakan:

* Independent T-Test
* SciPy

---

# Installation

## Clone Repository

```bash
git clone YOUR_REPOSITORY
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Run Project

## 1. Cleaning Dataset

```bash
python scripts/cleaning.py
```

## 2. Generate Transactions

```bash
python scripts/generate_transactions.py
```

## 3. Feature Engineering

```bash
python scripts/feature_engineering.py
```

## 4. Run A/B Testing

```bash
python scripts/ab_testing.py
```

## 5. Run Dashboard

```bash
streamlit run dashboard/app.py
```

---

# Dashboard Features

Dashboard menyediakan:

* Total Revenue KPI
* Total Profit KPI
* Total Transactions KPI
* Top Selling Products
* Monthly Revenue Trend
* Category Performance
* Low Stock Detection
* Fast Moving Products

---

# Business Insights

Insight yang dapat diperoleh:

* Produk paling laku
* Produk paling menguntungkan
* Produk yang harus segera restock
* Kategori dengan revenue tertinggi
* Tren penjualan bulanan
* Analisis profit UMKM

---

# Deployment

Project dapat dideploy menggunakan:

* GitHub
* Streamlit Cloud

Main app:

```text
dashboard/app.py
```

---

# Future Improvements

Pengembangan selanjutnya:

* Forecasting penjualan
* AI recommendation system
* Customer analytics
* Restock prediction
* Authentication system
* PostgreSQL database integration

---

# Final Checklist Status

| Checklist           | Status |
| ------------------- | ------ |
| Problem Discovery   | ✅      |
| Data Wrangling      | ✅      |
| Business Questions  | ✅      |
| EDA                 | ✅      |
| Visualization       | ✅      |
| Streamlit Dashboard | ✅      |
| Data Dictionary     | ✅      |
| Feature Engineering | ✅      |
| Deployment          | ✅      |
| A/B Testing         | ✅      |
| Final Report PDF    | ✅      |

---

# Author

AI-Powered Financial Analytics for UMKM
Developed using Python, Streamlit, and Data Science workflow.
