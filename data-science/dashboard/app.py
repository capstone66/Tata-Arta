import streamlit as st
import pandas as pd
import plotly.express as px

# Page config
st.set_page_config(
    page_title='UMKM Analytics Dashboard',
    layout='wide'
)

# Load data
products = pd.read_csv(
    'data-science/data/processed/products_featured.csv'
)

transactions = pd.read_csv(
    'data-science/data/processed/transactions.csv'
)

daily_kpi = pd.read_csv(
    'data-science/data/processed/daily_kpi.csv'
)

# Title
st.title('UMKM Analytics Dashboard')

# KPI
col1, col2, col3, col4 = st.columns(4)

col1.metric(
    'Total Revenue',
    f"Rp {daily_kpi['total_revenue'].sum():,.0f}"
)

col2.metric(
    'Total Profit',
    f"Rp {daily_kpi['total_profit'].sum():,.0f}"
)

col3.metric(
    'Total Expense',
    f"Rp {daily_kpi['total_expense'].sum():,.0f}"
)

col4.metric(
    'Transactions',
    f"{daily_kpi['total_transactions'].sum():,.0f}"
)

# Revenue Trend
st.subheader('Revenue Trend')

fig_revenue = px.line(
    daily_kpi,
    x='tanggal',
    y='total_revenue',
    title='Daily Revenue Trend'
)

st.plotly_chart(fig_revenue)

# Payment Method
st.subheader('Payment Method Distribution')

payment_summary = (
    transactions['payment_method']
    .value_counts()
    .reset_index()
)

payment_summary.columns = [
    'payment_method',
    'count'
]

fig_payment = px.pie(
    payment_summary,
    names='payment_method',
    values='count'
)

st.plotly_chart(fig_payment)

# Top Products
st.subheader('Top Selling Products')

top_products = (
    products
    .sort_values(
        by='total_sales',
        ascending=False
    )
    .head(10)
)

fig_products = px.bar(
    top_products,
    x='nama',
    y='total_sales',
    title='Top Selling Products'
)

st.plotly_chart(fig_products)

# Low Stock
st.subheader('Low Stock Products')

low_stock = (
    products[
        products['low_stock_flag'] == True
    ]
)

st.dataframe(
    low_stock[[
        'nama',
        'kategori',
        'stok'
    ]]
)