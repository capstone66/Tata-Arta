import pandas as pd

# =========================
# LOAD DATA
# =========================

products = pd.read_csv(
    'data/processed/products_clean.csv'
)

transactions = pd.read_csv(
    'data/processed/transactions.csv'
)

# =========================
# TOTAL SALES
# =========================

sales = (
    transactions
    .groupby('kode_barang')['qty']
    .sum()
    .reset_index()
)

sales.columns = [
    'kode_barang',
    'total_sales'
]

# Merge
products = products.merge(
    sales,
    on='kode_barang',
    how='left'
)

products['total_sales'] = (
    products['total_sales']
    .fillna(0)
)

# =========================
# TOTAL STOCK
# =========================

if 'toko' in products.columns and 'gudang' in products.columns:
    products['total_stock'] = (
        products['toko']
        + products['gudang']
    )
else:
    products['total_stock'] = 0

# =========================
# PROFIT MARGIN
# =========================

if (
    'harga_toko_1' in products.columns
    and 'hpp' in products.columns
):

    products['profit_margin'] = (
        (
            products['harga_toko_1']
            - products['hpp']
        )
        / products['hpp'].replace(0, 1)
    ) * 100

# =========================
# LOW STOCK FLAG
# =========================

if 'stok_min' in products.columns:

    products['low_stock_flag'] = (
        products['total_stock']
        < products['stok_min']
    )

else:
    products['low_stock_flag'] = False

# =========================
# FAST MOVING FLAG
# =========================

median_sales = (
    products['total_sales']
    .median()
)

products['fast_moving_flag'] = (
    products['total_sales']
    > median_sales
)

# =========================
# SAVE FEATURED DATASET
# =========================

products.to_csv(
    'data/processed/products_featured.csv',
    index=False
)

print('Feature engineering selesai!')
print(products.head())