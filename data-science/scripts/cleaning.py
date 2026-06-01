"""
cleaning.py
Tahap 1 — Data Cleaning
Pipeline: cleaning → generate_transactions → feature_engineering
"""

import pandas as pd

# ============================================================
# LOAD
# ============================================================

FILE_PATH   = 'data/raw/data_barang_30000.xls'
OUTPUT_PATH = 'data/processed/products_clean.csv'

df = pd.read_excel(FILE_PATH)
print(f"[INFO] Raw data dimuat: {df.shape[0]:,} baris, {df.shape[1]} kolom")

# ============================================================
# 1. BERSIHKAN NAMA KOLOM
# ============================================================

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(' ', '_')
)

# ============================================================
# 2. HAPUS DUPLIKAT
# ============================================================

before = len(df)
df = df.drop_duplicates()
print(f"[INFO] Duplikat dihapus: {before - len(df)} baris")

# ============================================================
# 3. HANDLE MISSING VALUES SECARA KONTEKSTUAL
# ============================================================

# Produk tanpa harga jual atau HPP tidak bisa dianalisis
before = len(df)
df = df[(df['hpp'] > 0) & (df['harga_toko_1'] > 0)]
print(f"[INFO] Baris hpp/harga_toko_1 = 0 dihapus: {before - len(df)} baris")

# Kolom kategorikal → 'Unknown'
cat_cols = [
    'nama', 'kategori', 'sub_kategori', 'supplier',
    'lokasi', 'ukuran', 'warna',
    'satuan_1', 'satuan_2', 'satuan_3'
]
for col in cat_cols:
    if col in df.columns:
        df[col] = df[col].fillna('Unknown')

# Kolom stok → 0 (stok habis adalah kondisi valid)
stok_cols = ['toko', 'gudang', 'stok_min', 'stok_max']
for col in stok_cols:
    if col in df.columns:
        df[col] = df[col].fillna(0)

# Kolom harga tambahan → median harga valid
extra_price_cols = [
    'harga_toko_2', 'harga_toko_3',
    'harga_partai_1', 'harga_partai_2', 'harga_partai_3',
    'harga_cabang_1', 'harga_cabang_2', 'harga_cabang_3'
]
for col in extra_price_cols:
    if col in df.columns:
        median_val = df.loc[df[col] > 0, col].median()
        df[col] = df[col].replace(0, median_val).fillna(median_val)

# ============================================================
# 4. TAMBAH KOLOM total_stock
# ============================================================

df['total_stock'] = df['toko'] + df['gudang']

# ============================================================
# 5. SIMPAN
# ============================================================

df.to_csv(OUTPUT_PATH, index=False)

print(f"\n[DONE] Cleaning selesai!")
print(f"  Output  : {OUTPUT_PATH}")
print(f"  Baris   : {len(df):,}")
print(f"  Kolom   : {df.shape[1]}")
print(f"\nSample output:")
print(df[['kode_barang', 'nama', 'kategori', 'hpp',
          'harga_toko_1', 'toko', 'gudang', 'total_stock', 'stok_min']].head())
