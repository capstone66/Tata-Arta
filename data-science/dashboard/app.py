import streamlit as st
import pandas as pd
import plotly.express as px

# =========================
# PAGE CONFIG
# =========================

st.set_page_config(
    page_title='UMKM Analytics Dashboard',
    layout='wide'
)

# =========================
# LOAD DATA
# =========================

products = pd.read_csv(
    'data/processed/products_featured.csv'
)

transactions = pd.read_csv(
    'data/processed/transactions.csv'
)

# =========================
# TITLE
# =========================

st.title('AI-Powered Financial Analytics for UMKM')

st.markdown(
    'Dashboard analitik penjualan dan inventory UMKM'
)

# =========================
# KPI SECTION
# =========================

total_revenue = transactions['total'].sum()

total_profit = transactions['profit'].sum()

total_transactions = len(transactions)

total_products = len(products)

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        'Total Revenue',
        f'Rp {total_revenue:,.0f}'
    )

with col2:
    st.metric(
        'Total Profit',
        f'Rp {total_profit:,.0f}'
    )

with col3:
    st.metric(
        'Transactions',
        f'{total_transactions:,}'
    )

with col4:
    st.metric(
        'Products',
        f'{total_products:,}'
    )

# =========================
# TOP PRODUCTS
# =========================

st.subheader('Top Selling Products')

top_products = (
    transactions
    .groupby('nama_produk')['qty']
    .sum()
    .sort_values(ascending=False)
    .head(10)
    .reset_index()
)

fig_top = px.bar(
    top_products,
    x='nama_produk',
    y='qty',
    title='Top Selling Products'
)

st.plotly_chart(
    fig_top,
    use_container_width=True
)

# =========================
# MONTHLY SALES
# =========================

st.subheader('Monthly Sales Trend')

transactions['tanggal'] = pd.to_datetime(
    transactions['tanggal']
)

monthly_sales = (
    transactions
    .groupby(
        transactions['tanggal']
        .dt.to_period('M')
    )['total']
    .sum()
    .reset_index()
)

monthly_sales['tanggal'] = (
    monthly_sales['tanggal']
    .astype(str)
)

fig_sales = px.line(
    monthly_sales,
    x='tanggal',
    y='total',
    title='Monthly Revenue Trend'
)

st.plotly_chart(
    fig_sales,
    use_container_width=True
)

# =========================
# CATEGORY PERFORMANCE
# =========================

st.subheader('Category Performance')

category_sales = (
    transactions
    .groupby('kategori')['total']
    .sum()
    .reset_index()
)

fig_category = px.pie(
    category_sales,
    names='kategori',
    values='total',
    title='Revenue by Category'
)

st.plotly_chart(
    fig_category,
    use_container_width=True
)

# =========================
# LOW STOCK
# =========================

st.subheader('Low Stock Products')

low_stock = products[
    products['low_stock_flag'] == True
]

st.dataframe(
    low_stock[
        [
            'kode_barang',
            'nama',
            'kategori',
            'total_stock',
            'stok_min'
        ]
    ]
)

# =========================
# FAST MOVING PRODUCTS
# =========================

st.subheader('Fast Moving Products')

fast_moving = products[
    products['fast_moving_flag'] == True
]

st.dataframe(
    fast_moving[
        [
            'kode_barang',
            'nama',
            'kategori',
            'total_sales'
        ]
    ].head(20)
)