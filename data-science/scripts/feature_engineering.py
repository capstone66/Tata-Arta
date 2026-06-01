"""
feature_engineering.py
Tahap 3 — Feature Engineering
Pipeline: cleaning → generate_transactions → feature_engineering
"""

import pandas as pd

INPUT_PRODUCTS    = 'data/processed/products_clean.csv'
INPUT_TRANSACTIONS = 'data/processed/transactions.csv'
OUTPUT_PATH       = 'data/processed/products_featured.csv'

# ============================================================
# LOAD
# ============================================================

products     = pd.read_csv(INPUT_PRODUCTS)
transactions = pd.read_csv(INPUT_TRANSACTIONS)

print(f"[INFO] Products    : {len(products):,} baris")
print(f"[INFO] Transactions: {len(transactions):,} baris")

# ============================================================
# 1. TOTAL SALES per PRODUK (dari data transaksi nyata)
# ============================================================

sales_summary = (
    transactions
    .groupby('kode_barang')['qty']
    .sum()
    .reset_index()
    .rename(columns={'qty': 'total_sales'})
)

products = products.merge(sales_summary, on='kode_barang', how='left')
products['total_sales'] = products['total_sales'].fillna(0)

# ============================================================
# 2. PROFIT MARGIN
#    Formula: (harga_jual - hpp) / harga_jual
#    Di-clip ke [-1, 1] untuk menghindari outlier ekstrem
# ============================================================

products['profit_margin'] = (
    (products['harga_toko_1'] - products['hpp'])
    / products['harga_toko_1']
).round(4).clip(lower=-1, upper=1)

# ============================================================
# 3. LOW STOCK FLAG
#    True jika total_stock < stok_min (threshold dinamis dari data)
#    BUKAN angka hard-coded
# ============================================================

products['low_stock_flag'] = (
    products['total_stock'] < products['stok_min']
)

n_low = products['low_stock_flag'].sum()
print(f"[INFO] Produk low stock   : {n_low:,} ({n_low/len(products)*100:.1f}%)")

# ============================================================
# 4. FAST MOVING FLAG
#    True jika total_sales >= Q75 distribusi penjualan
#    Threshold otomatis menyesuaikan data, tidak hard-coded
# ============================================================

threshold_q75 = products['total_sales'].quantile(0.75)
products['fast_moving_flag'] = (products['total_sales'] >= threshold_q75)

n_fast = products['fast_moving_flag'].sum()
print(f"[INFO] Fast moving (Q75≥{threshold_q75:.0f}): {n_fast:,} produk")

# ============================================================
# 5. PROFIT KATEGORI (label untuk segmentasi)
# ============================================================

def margin_label(margin):
    if margin >= 0.20:
        return 'High'
    elif margin >= 0.10:
        return 'Medium'
    elif margin >= 0:
        return 'Low'
    else:
        return 'Negative'

products['margin_category'] = products['profit_margin'].apply(margin_label)

# ============================================================
# SIMPAN
# ============================================================

products.to_csv(OUTPUT_PATH, index=False)

print(f"\n[DONE] Feature engineering selesai!")
print(f"  Output : {OUTPUT_PATH}")
print(f"  Baris  : {len(products):,}")
print(f"  Kolom  : {products.shape[1]}")
print(f"\nFitur baru yang ditambahkan:")
print(f"  - total_sales    : total qty terjual per produk")
print(f"  - profit_margin  : (harga_jual - hpp) / harga_jual")
print(f"  - low_stock_flag : total_stock < stok_min")
print(f"  - fast_moving_flag: total_sales >= Q75")
print(f"  - margin_category: High / Medium / Low / Negative")
print(f"\nSample:")
print(products[[
    'kode_barang', 'nama', 'total_stock', 'stok_min',
    'profit_margin', 'margin_category',
    'total_sales', 'low_stock_flag', 'fast_moving_flag'
]].head(10))
