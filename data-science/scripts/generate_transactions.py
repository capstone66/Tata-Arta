"""
generate_transactions.py
Tahap 2 — Simulasi Transaksi
Perbaikan: gunakan stok_min sebagai stok awal simulasi jika total_stock = 0
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

RANDOM_SEED      = 42
NUM_TRANSACTIONS = 100_000
INPUT_PATH       = 'data/processed/products_clean.csv'
OUTPUT_TRX       = 'data/processed/transactions.csv'
OUTPUT_KPI       = 'data/processed/daily_kpi.csv'
OUTPUT_STOCK     = 'data/processed/stock_after_transactions.csv'

random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# ============================================================
# LOAD
# ============================================================

products = pd.read_csv(INPUT_PATH)
print(f"[INFO] Produk dimuat: {len(products):,} item")

if 'total_stock' not in products.columns:
    products['total_stock'] = products['toko'] + products['gudang']

# Jika semua stok = 0 (data asli memang kosong),
# simulasikan stok awal dari stok_min x 10 agar ada transaksi
if (products['total_stock'] == 0).all():
    print("[INFO] Semua stok = 0 — menggunakan stok simulasi (stok_min x 10, minimal 50)")
    products['total_stock'] = products['stok_min'].apply(lambda x: max(int(x) * 10, 50))

# Hanya produk dengan harga valid
eligible = products[
    (products['total_stock'] > 0) &
    (products['harga_toko_1'] > 0) &
    (products['hpp'] > 0)
].copy().reset_index(drop=True)

print(f"[INFO] Produk eligible: {len(eligible):,} item")

# ============================================================
# GENERATE TRANSAKSI
# ============================================================

PAYMENT_METHODS = ['Tunai', 'Transfer', 'QRIS']
PAYMENT_WEIGHTS = [0.60, 0.25, 0.15]
STATUSES        = ['Selesai', 'Proses']
STATUS_WEIGHTS  = [0.85, 0.15]

transactions = []
skipped = 0

for i in range(NUM_TRANSACTIONS):
    available = eligible[eligible['total_stock'] > 0]
    if available.empty:
        skipped += 1
        continue

    idx     = available.sample(1).index[0]
    product = eligible.loc[idx]

    max_qty = min(int(product['total_stock']), 10)
    qty     = random.randint(1, max(1, max_qty))

    eligible.at[idx, 'total_stock'] -= qty

    tanggal    = datetime.now() - timedelta(days=random.randint(0, 365))
    harga_jual = product['harga_toko_1']
    hpp        = product['hpp']

    transactions.append({
        'transaction_id': i + 1,
        'tanggal':        tanggal,
        'kode_barang':    str(product.get('kode_barang', 'UNKNOWN')),
        'nama_produk':    product.get('nama', 'UNKNOWN'),
        'kategori':       product.get('kategori', 'UNKNOWN'),
        'supplier':       product.get('supplier', 'UNKNOWN'),
        'qty':            qty,
        'harga_jual':     harga_jual,
        'hpp':            hpp,
        'total':          qty * harga_jual,
        'profit':         qty * (harga_jual - hpp),
        'expense':        qty * hpp,
    })

print(f"[INFO] Transaksi dibuat: {len(transactions):,}")
if skipped:
    print(f"[WARNING] Dilewati (stok habis): {skipped:,}")

df = pd.DataFrame(transactions)

# ============================================================
# TAMBAH KOLOM
# ============================================================

df['payment_method'] = np.random.choice(PAYMENT_METHODS, size=len(df), p=PAYMENT_WEIGHTS)
df['status']         = np.random.choice(STATUSES, size=len(df), p=STATUS_WEIGHTS)
df['tanggal']        = pd.to_datetime(df['tanggal'])
df['tahun']          = df['tanggal'].dt.year
df['bulan']          = df['tanggal'].dt.month
df['hari']           = df['tanggal'].dt.day

# ============================================================
# DAILY KPI
# ============================================================

daily_kpi = (
    df.groupby(df['tanggal'].dt.date)
    .agg(
        total_revenue      =('total',          'sum'),
        total_profit       =('profit',         'sum'),
        total_expense      =('expense',        'sum'),
        total_transactions =('transaction_id', 'count'),
        total_items_sold   =('qty',            'sum'),
    )
    .reset_index()
    .rename(columns={'tanggal': 'tanggal'})
)

# ============================================================
# SIMPAN
# ============================================================

df.to_csv(OUTPUT_TRX, index=False)
daily_kpi.to_csv(OUTPUT_KPI, index=False)
eligible[['kode_barang', 'total_stock']].to_csv(OUTPUT_STOCK, index=False)

print(f"\n[DONE] Generate transaksi selesai!")
print(f"  transactions.csv : {len(df):,} baris")
print(f"  daily_kpi.csv    : {len(daily_kpi):,} hari")
print(df[['transaction_id','nama_produk','qty','total','payment_method','status']].head())