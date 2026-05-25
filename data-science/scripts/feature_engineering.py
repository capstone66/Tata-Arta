import pandas as pd

# Load dataset
products = pd.read_csv(
    'data-science/data/processed/products_clean.csv'
)

transactions = pd.read_csv(
    'data-science/data/processed/transactions.csv'
)

# Total sales per product
sales_summary = (
    transactions
    .groupby('kode_barang')['qty']
    .sum()
    .reset_index()
)

sales_summary.columns = [
    'kode_barang',
    'total_sales'
]

# Merge products
products = products.merge(
    sales_summary,
    on='kode_barang',
    how='left'
)

products['total_sales'] = (
    products['total_sales']
    .fillna(0)
)

# Profit margin
products['profit_margin'] = (
    (
        products['harga_toko_1']
        - products['hpp']
    )
    / products['harga_toko_1']
)

# Low stock flag
products['low_stock_flag'] = (
    products['stok'] < 10
)

# Fast moving flag
products['fast_moving_flag'] = (
    products['total_sales'] > 100
)

# Save dataset
products.to_csv(
    'data-science/data/processed/products_featured.csv',
    index=False
)

print('Feature engineering selesai!')
print(products.head())