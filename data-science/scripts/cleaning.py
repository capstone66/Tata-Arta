import pandas as pd

# Load dataset
file_path = 'data/raw/data_barang_30000.xls'

# Read Excel
df = pd.read_excel(file_path)

# Rapikan nama kolom
df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(' ', '_')
)

# Hapus duplicate
df = df.drop_duplicates()

# Isi missing values
for col in df.columns:
    if df[col].dtype == 'object':
        df[col] = df[col].fillna('Unknown')
    else:
        df[col] = df[col].fillna(0)

# Simpan hasil cleaning
output_path = 'data/processed/products_clean.csv'

df.to_csv(output_path, index=False)

print('Cleaning selesai!')
print(df.head())