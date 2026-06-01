"""
ab_testing.py
Analisis A/B Test — Simulasi Dampak Promo/Diskon pada Revenue
"""

import pandas as pd
import numpy as np
from scipy.stats import ttest_ind, mannwhitneyu
import random

RANDOM_SEED  = 42
SAMPLE_SIZE  = 5_000
PROMO_UPLIFT = 1.10   # Simulasi promo meningkatkan revenue 10%
ALPHA        = 0.05

random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# ============================================================
# LOAD DATA
# ============================================================

transactions = pd.read_csv(
    'data/processed/transactions.csv'
)

# Hanya transaksi valid
valid = transactions[transactions['total'] > 0].copy()
print(f"[INFO] Transaksi valid: {len(valid):,}")

# ============================================================
# SETUP A/B GROUP
# Group A = kondisi normal (tanpa promo)
# Group B = simulasi promo (revenue x1.10)
# ============================================================

group_a = valid.sample(SAMPLE_SIZE, random_state=RANDOM_SEED)['total']
group_b = valid.sample(SAMPLE_SIZE, random_state=99)['total'] * PROMO_UPLIFT

# ============================================================
# STATISTIK DESKRIPTIF
# ============================================================

print("\n" + "="*55)
print("STATISTIK DESKRIPTIF")
print("="*55)
print(f"{'Metrik':<20} {'Group A (Normal)':>20} {'Group B (Promo)':>20}")
print("-"*55)
print(f"{'Mean':<20} {'Rp '+f'{group_a.mean():,.0f}':>20} {'Rp '+f'{group_b.mean():,.0f}':>20}")
print(f"{'Median':<20} {'Rp '+f'{group_a.median():,.0f}':>20} {'Rp '+f'{group_b.median():,.0f}':>20}")
print(f"{'Std':<20} {'Rp '+f'{group_a.std():,.0f}':>20} {'Rp '+f'{group_b.std():,.0f}':>20}")
print(f"{'Min':<20} {'Rp '+f'{group_a.min():,.0f}':>20} {'Rp '+f'{group_b.min():,.0f}':>20}")
print(f"{'Max':<20} {'Rp '+f'{group_a.max():,.0f}':>20} {'Rp '+f'{group_b.max():,.0f}':>20}")
selisih = group_b.mean() - group_a.mean()
print(f"\nSelisih mean: Rp {selisih:,.0f} ({selisih/group_a.mean()*100:.1f}%)")

# ============================================================
# T-TEST (parametrik)
# Asumsi: distribusi mendekati normal
# ============================================================

t_stat, p_ttest = ttest_ind(group_a, group_b)

print("\n" + "="*55)
print("T-TEST (Parametrik)")
print("="*55)
print(f"T-Statistic : {t_stat:.4f}")
print(f"P-Value     : {p_ttest:.6f}")

# ============================================================
# MANN-WHITNEY U TEST (non-parametrik)
# Lebih robust untuk data transaksi yang tidak terdistribusi normal
# ============================================================

u_stat, p_mw = mannwhitneyu(group_a, group_b, alternative='two-sided')

print("\n" + "="*55)
print("MANN-WHITNEY U TEST (Non-Parametrik)")
print("="*55)
print(f"U-Statistic : {u_stat:.2f}")
print(f"P-Value     : {p_mw:.6f}")

# ============================================================
# EFFECT SIZE — Cohen's d
# ============================================================

pooled_std = np.sqrt(
    (group_a.std()**2 + group_b.std()**2) / 2
)
cohens_d = (group_b.mean() - group_a.mean()) / pooled_std

effect_label = (
    'Kecil'   if abs(cohens_d) < 0.2  else
    'Sedang'  if abs(cohens_d) < 0.5  else
    'Besar'
)

print("\n" + "="*55)
print("EFFECT SIZE — Cohen's d")
print("="*55)
print(f"Cohen's d   : {cohens_d:.4f}")
print(f"Interpretasi: {effect_label}")

# ============================================================
# KESIMPULAN
# ============================================================

print("\n" + "="*55)
print("KESIMPULAN")
print("="*55)

# Pakai Mann-Whitney sebagai acuan utama (lebih robust)
if p_mw < ALPHA:
    print(f"✅ Terdapat perbedaan SIGNIFIKAN antara Group A dan B")
    print(f"   (p = {p_mw:.4f} < alpha {ALPHA})")
    print(f"   Promo {int((PROMO_UPLIFT-1)*100)}% secara statistik mempengaruhi revenue.")
    print(f"   Estimasi peningkatan: Rp {selisih:,.0f} per transaksi (+{selisih/group_a.mean()*100:.1f}%)")
else:
    print(f"❌ Tidak ada perbedaan SIGNIFIKAN antara Group A dan B")
    print(f"   (p = {p_mw:.4f} >= alpha {ALPHA})")
    print(f"   Promo tidak terbukti mempengaruhi revenue secara statistik.")

print()
print("[CATATAN] Ini adalah simulasi A/B test.")
print("  Untuk eksperimen nyata, gunakan random assignment yang ketat")
print("  dan pastikan tidak ada data leakage antar group.")
