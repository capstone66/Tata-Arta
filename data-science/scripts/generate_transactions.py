import pandas as pd
import random
from datetime import datetime, timedelta

# Load products
products = pd.read_csv('data/processed/products_clean.csv')

# Simpan transaksi
transactions = []

# Jumlah transaksi
num_transactions = 100000

for i in range(num_transactions):

    # Ambil produk random
    product = products.sample(1).iloc[0]

    # Qty random
    qty = random.randint(1, 10)

    # Tanggal random
    transaction_date = (
        datetime.now()
        - timedelta(days=random.randint(0, 365))
    )

    # Harga jual
    harga_jual = product.get('harga_toko_1', 0)

    # HPP
    hpp = product.get('hpp', 0)

    # Total
    total = qty * harga_jual

    # Profit
    profit = qty * (harga_jual - hpp)

    transactions.append({
        'transaction_id': i + 1,
        'tanggal': transaction_date,
        'kode_barang': product.get('kode_barang', 'UNKNOWN'),
        'nama_produk': product.get('nama', 'UNKNOWN'),
        'kategori': product.get('kategori', 'UNKNOWN'),
        'supplier': product.get('supplier', 'UNKNOWN'),
        'qty': qty,
        'harga_jual': harga_jual,
        'hpp': hpp,
        'total': total,
        'profit': profit
    })

# Convert ke DataFrame
transactions_df = pd.DataFrame(transactions)

# Tambahan feature tanggal
transactions_df['tanggal'] = pd.to_datetime(
    transactions_df['tanggal']
)

transactions_df['tahun'] = (
    transactions_df['tanggal'].dt.year
)

transactions_df['bulan'] = (
    transactions_df['tanggal'].dt.month
)

transactions_df['hari'] = (
    transactions_df['tanggal'].dt.day
)

# Simpan CSV
transactions_df.to_csv(
    'data/processed/transactions.csv',
    index=False
)

print('Generate transaksi selesai!')
print(transactions_df.head())