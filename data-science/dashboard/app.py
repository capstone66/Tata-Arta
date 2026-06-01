"""
dashboard/app.py
UMKM Analytics Dashboard — Streamlit
Versi: 1.1.0 (perbaikan: filter sidebar, chart lengkap, alert price issues)
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title='UMKM Analytics Dashboard',
    page_icon='📊',
    layout='wide',
    initial_sidebar_state='expanded'
)

# ============================================================
# LOAD DATA (cached)
# ============================================================

@st.cache_data
def load_data():
    products = pd.read_csv(
        'data/processed/products_featured.csv'
    )
    transactions = pd.read_csv(
        'data/processed/transactions.csv',
        parse_dates=['tanggal']
    )
    daily_kpi = pd.read_csv(
        'data/processed/daily_kpi.csv',
        parse_dates=['tanggal']
    )
    return products, transactions, daily_kpi

products, transactions, daily_kpi = load_data()

# ============================================================
# SIDEBAR FILTERS
# ============================================================

st.sidebar.title('🔍 Filter Data')

# Tanggal
min_date = transactions['tanggal'].min().date()
max_date = transactions['tanggal'].max().date()
date_range = st.sidebar.date_input(
    'Rentang Tanggal',
    value=(min_date, max_date),
    min_value=min_date,
    max_value=max_date
)

# Kategori
categories = ['Semua'] + sorted(transactions['kategori'].dropna().unique().tolist())
selected_category = st.sidebar.selectbox('Kategori Produk', categories)

# Payment method
payment_opts = sorted(transactions['payment_method'].dropna().unique().tolist())
selected_payment = st.sidebar.multiselect(
    'Metode Pembayaran', options=payment_opts, default=payment_opts
)

# Status
status_opts = sorted(transactions['status'].dropna().unique().tolist())
selected_status = st.sidebar.multiselect(
    'Status Transaksi', options=status_opts, default=status_opts
)

# ============================================================
# APPLY FILTERS
# ============================================================

df = transactions.copy()

if len(date_range) == 2:
    df = df[
        (df['tanggal'].dt.date >= date_range[0]) &
        (df['tanggal'].dt.date <= date_range[1])
    ]

if selected_category != 'Semua':
    df = df[df['kategori'] == selected_category]

if selected_payment:
    df = df[df['payment_method'].isin(selected_payment)]

if selected_status:
    df = df[df['status'].isin(selected_status)]

kpi_df = daily_kpi.copy()
if len(date_range) == 2:
    kpi_df = kpi_df[
        (kpi_df['tanggal'].dt.date >= date_range[0]) &
        (kpi_df['tanggal'].dt.date <= date_range[1])
    ]

prod_df = products.copy()
if selected_category != 'Semua' and 'kategori' in prod_df.columns:
    prod_df = prod_df[prod_df['kategori'] == selected_category]

# ============================================================
# HEADER
# ============================================================

st.title('📊 UMKM Analytics Dashboard')

date_info = ''
if not df.empty:
    date_info = (
        f"{df['tanggal'].min().strftime('%d %b %Y')} s/d "
        f"{df['tanggal'].max().strftime('%d %b %Y')} | "
        f"{len(df):,} transaksi"
    )
st.caption(date_info)
st.divider()

# ============================================================
# ALERT: PRODUK BERMASALAH
# ============================================================

if 'needs_price_review' in prod_df.columns:
    n_issues = prod_df['needs_price_review'].sum()
    if n_issues > 0:
        st.error(
            f"⚠️ **{n_issues:,} produk** memiliki harga bermasalah (margin negatif atau anomali). "
            f"Lihat tabel di bagian bawah dashboard."
        )

# ============================================================
# KPI CARDS
# ============================================================

c1, c2, c3, c4 = st.columns(4)

total_revenue  = df['total'].sum()
total_profit   = df['profit'].sum()
total_expense  = df['expense'].sum() if 'expense' in df.columns else 0
total_trx      = len(df)

c1.metric('💰 Total Revenue',    f"Rp {total_revenue:,.0f}")
c2.metric('📈 Total Profit',     f"Rp {total_profit:,.0f}")
c3.metric('💸 Total Expense',    f"Rp {total_expense:,.0f}")
c4.metric('🧾 Total Transaksi',  f"{total_trx:,}")

if total_revenue > 0:
    margin = total_profit / total_revenue * 100
    st.caption(f"Profit margin keseluruhan: **{margin:.2f}%**")

st.divider()

# ============================================================
# TREN REVENUE & PROFIT HARIAN
# ============================================================

st.subheader('📅 Tren Revenue & Profit Harian')

if not kpi_df.empty:
    fig_trend = px.line(
        kpi_df,
        x='tanggal',
        y=['total_revenue', 'total_profit'],
        labels={'tanggal':'Tanggal','value':'Nominal (Rp)','variable':'Metrik'},
        color_discrete_map={
            'total_revenue': '#2563EB',
            'total_profit':  '#16A34A'
        }
    )
    fig_trend.update_layout(legend_title_text='', hovermode='x unified')
    st.plotly_chart(fig_trend, use_container_width=True)
else:
    st.warning('Tidak ada data KPI untuk filter ini.')

st.divider()

# ============================================================
# ROW: PAYMENT PIE + KATEGORI BAR
# ============================================================

col_l, col_r = st.columns(2)

with col_l:
    st.subheader('💳 Distribusi Metode Pembayaran')
    if not df.empty:
        pay_sum = df['payment_method'].value_counts().reset_index()
        pay_sum.columns = ['payment_method', 'count']
        fig_pay = px.pie(
            pay_sum, names='payment_method', values='count', hole=0.4
        )
        fig_pay.update_layout(legend_title_text='')
        st.plotly_chart(fig_pay, use_container_width=True)

with col_r:
    st.subheader('📦 Revenue per Kategori (Top 10)')
    if not df.empty:
        cat_sum = (
            df.groupby('kategori')['total']
            .sum().sort_values(ascending=False).head(10).reset_index()
        )
        cat_sum.columns = ['kategori', 'revenue']
        fig_cat = px.bar(
            cat_sum, x='revenue', y='kategori', orientation='h',
            labels={'revenue':'Revenue (Rp)','kategori':'Kategori'},
            color='revenue', color_continuous_scale='Blues'
        )
        fig_cat.update_layout(yaxis={'categoryorder':'total ascending'}, coloraxis_showscale=False)
        st.plotly_chart(fig_cat, use_container_width=True)

st.divider()

# ============================================================
# TOP 10 PRODUK TERLARIS
# ============================================================

st.subheader('🏆 Top 10 Produk Terlaris')

if not df.empty:
    top_prod = (
        df.groupby('nama_produk').agg(
            total_qty    =('qty',    'sum'),
            total_revenue=('total',  'sum'),
            total_profit =('profit', 'sum')
        )
        .sort_values('total_qty', ascending=False)
        .head(10).reset_index()
    )
    fig_top = px.bar(
        top_prod, x='total_qty', y='nama_produk', orientation='h',
        labels={'total_qty':'Total Qty','nama_produk':'Produk'},
        color='total_profit', color_continuous_scale='Greens'
    )
    fig_top.update_layout(yaxis={'categoryorder':'total ascending'})
    st.plotly_chart(fig_top, use_container_width=True)

st.divider()

# ============================================================
# INVENTORY: LOW STOCK + FAST MOVING
# ============================================================

col_ls, col_fm = st.columns(2)

with col_ls:
    st.subheader('⚠️ Produk Stok Kritis')
    low = prod_df[prod_df['low_stock_flag'] == True]
    if not low.empty:
        cols_show = ['nama','kategori','total_stock','stok_min','supplier']
        if 'urgency_restock' in low.columns:
            cols_show.append('urgency_restock')
        st.dataframe(
            low[cols_show].sort_values(
                'urgency_restock' if 'urgency_restock' in low.columns else 'total_stock',
                ascending=False
            ).head(20),
            use_container_width=True, hide_index=True
        )
        st.caption(f"Total: **{len(low):,}** produk stok kritis")
    else:
        st.success('Tidak ada produk stok kritis.')

with col_fm:
    st.subheader('🚀 Fast Moving Products')
    fast = prod_df[prod_df['fast_moving_flag'] == True]
    if not fast.empty:
        st.dataframe(
            fast[['nama','kategori','total_sales','profit_margin','supplier']]
            .sort_values('total_sales', ascending=False).head(20),
            use_container_width=True, hide_index=True
        )
        st.caption(f"Total: **{len(fast):,}** fast moving products")
    else:
        st.info('Tidak ada fast moving products untuk filter ini.')

st.divider()

# ============================================================
# DISTRIBUSI PROFIT MARGIN
# ============================================================

st.subheader('📉 Distribusi Profit Margin Produk')

margin_df = prod_df[
    prod_df['profit_margin'].between(-1, 1) &
    prod_df['profit_margin'].notna()
].copy()

if not margin_df.empty:
    fig_margin = px.histogram(
        margin_df, x='profit_margin', nbins=40,
        labels={'profit_margin':'Profit Margin','count':'Jumlah Produk'},
        color_discrete_sequence=['#2563EB']
    )
    fig_margin.update_xaxes(tickformat='.0%')
    st.plotly_chart(fig_margin, use_container_width=True)

st.divider()

# ============================================================
# ALERT: TABEL PRODUK PERLU REVIEW HARGA
# ============================================================

if 'needs_price_review' in prod_df.columns:
    issues = prod_df[prod_df['needs_price_review'] == True]
    if not issues.empty:
        st.subheader('🚨 Produk Perlu Review Harga')
        st.dataframe(
            issues[[
                'nama', 'kategori', 'hpp', 'harga_toko_1',
                'profit_margin', 'price_issue_reason'
            ]].sort_values('profit_margin').head(30),
            use_container_width=True, hide_index=True
        )
        st.caption(f"Total: **{len(issues):,}** produk. Download price_issues_report.csv untuk laporan lengkap.")

# ============================================================
# FOOTER
# ============================================================

st.divider()
st.caption('UMKM Analytics Dashboard v1.1.0 — built with Streamlit & Plotly')
