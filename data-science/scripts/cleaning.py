import pandas as pd

# Load dataset
file_path = (
    'data-science/data/raw/data_barang_30000.xls'
)

# Read Excel
df = pd.read_excel(file_path)

# Clean column names
df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(' ', '_')
)

# Remove duplicates
df = df.drop_duplicates()

# Handle missing values
for col in df.columns:

    if df[col].dtype == 'object':

        df[col] = df[col].fillna(
            'Unknown'
        )

    else:

        df[col] = df[col].fillna(0)

# Save cleaned data
output_path = (
    'data-science/data/processed/products_clean.csv'
)

# Export CSV
df.to_csv(
    output_path,
    index=False
)

print('Cleaning selesai!')

print(df.head())