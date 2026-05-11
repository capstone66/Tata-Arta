import pandas as pd
from scipy.stats import ttest_ind

# =========================
# LOAD DATA
# =========================

transactions = pd.read_csv(
    'data/processed/transactions.csv'
)

# =========================
# SIMULASI A/B TEST
# =========================

# Group A = tanpa diskon

group_a = (
    transactions
    .sample(5000)['total']
)

# Group B = simulasi diskon/promo

group_b = (
    transactions
    .sample(5000)['total'] * 1.1
)

# =========================
# T-TEST
# =========================

t_stat, p_value = ttest_ind(
    group_a,
    group_b
)

print('T-Statistic:', t_stat)
print('P-Value:', p_value)

# =========================
# RESULT
# =========================

if p_value < 0.05:
    print('Ada perbedaan signifikan')
else:
    print('Tidak ada perbedaan signifikan')