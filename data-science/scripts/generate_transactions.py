import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Load products
products = pd.read_csv(
    'data-science/data/processed/products_clean.csv'
)

transactions = []

num_transactions = 100000

for i in range(num_transactions):

    product = products.sample(1).iloc[0]

    qty = random.randint(1, 10)

    transaction_date = (
        datetime.now()
        - timedelta(days=random.randint(0, 365))
    )

    harga_jual = product.get(
        'harga_toko_1',
        0
    )

    hpp = product.get(
        'hpp',
        0
    )

    total = qty * harga_jual

    profit = qty * (
        harga_jual - hpp
    )

    expense = qty * hpp

    transactions.append({

        'transaction_id': i + 1,

        'tanggal': transaction_date,

        'kode_barang': product.get(
            'kode_barang',
            'UNKNOWN'
        ),

        'nama_produk': product.get(
            'nama',
            'UNKNOWN'
        ),

        'kategori': product.get(
            'kategori',
            'UNKNOWN'
        ),

        'supplier': product.get(
            'supplier',
            'UNKNOWN'
        ),

        'qty': qty,

        'harga_jual': harga_jual,

        'hpp': hpp,

        'total': total,

        'profit': profit,

        'expense': expense
    })

transactions_df = pd.DataFrame(
    transactions
)

payment_methods = [
    'Tunai',
    'Transfer',
    'QRIS'
]

transactions_df['payment_method'] = (
    np.random.choice(
        payment_methods,
        size=len(transactions_df),
        p=[0.6, 0.25, 0.15]
    )
)

statuses = [
    'Selesai',
    'Proses'
]

transactions_df['status'] = (
    np.random.choice(
        statuses,
        size=len(transactions_df),
        p=[0.85, 0.15]
    )
)

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

# Daily KPI

daily_kpi = (
    transactions_df
    .groupby(
        transactions_df['tanggal'].dt.date
    )
    .agg({
        'total': 'sum',
        'profit': 'sum',
        'expense': 'sum',
        'transaction_id': 'count',
        'qty': 'sum'
    })
    .reset_index()
)

daily_kpi.columns = [
    'tanggal',
    'total_revenue',
    'total_profit',
    'total_expense',
    'total_transactions',
    'total_items_sold'
]

transactions_df.to_csv(
    'data-science/data/processed/transactions.csv',
    index=False
)

daily_kpi.to_csv(
    'data-science/data/processed/daily_kpi.csv',
    index=False
)

print('Generate transaksi selesai!')
print(transactions_df.head())