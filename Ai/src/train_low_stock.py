from __future__ import annotations

import argparse
import joblib
from sklearn.model_selection import train_test_split

from src.config import LOW_STOCK_LABELS, MODEL_PATHS, RANDOM_STATE
from src.data_loader import load_products_featured, load_transactions
from src.feature_engineering import build_ai_table
from src.model_builder import build_tabular_model
from src.preprocessing import build_preprocessor, prepare_xy
from src.trainer import train_with_gradient_tape


def main(epochs: int = 30):
    products = load_products_featured()
    transactions = load_transactions()
    bundle = build_ai_table(products, transactions)
    df = bundle.data

    x = df[bundle.feature_columns]
    y = df["restock_priority_target"].astype("float32")

    stratify = y.astype(int) if y.nunique() > 1 else None
    x_train, x_val, y_train, y_val = train_test_split(
        x, y, test_size=0.2, random_state=RANDOM_STATE, stratify=stratify
    )

    preprocessor = build_preprocessor(bundle.numeric_columns, bundle.categorical_columns)
    x_train_t, x_val_t = prepare_xy(preprocessor, x_train, x_val)

    model = build_tabular_model(
        input_dim=x_train_t.shape[1],
        output_dim=1,
        task_type="binary",
        hidden_units=128,
        dropout_rate=0.12,
    )

    joblib.dump({
        "preprocessor": preprocessor,
        "feature_columns": bundle.feature_columns,
        "numeric_columns": bundle.numeric_columns,
        "categorical_columns": bundle.categorical_columns,
        "label_mapping": LOW_STOCK_LABELS,
        "target_column": "restock_priority_target",
        "note": "The raw low_stock_flag is constant True in the uploaded data, so this model predicts business restock priority based on stock gap and demand movement.",
    }, MODEL_PATHS.low_stock_preprocessor)

    return train_with_gradient_tape(
        model=model,
        x_train=x_train_t,
        y_train=y_train.to_numpy(),
        x_val=x_val_t,
        y_val=y_val.to_numpy(),
        model_output_path=MODEL_PATHS.low_stock_model,
        experiment_name="restock-priority-v4",
        task_type="binary",
        epochs=epochs,
        batch_size=256,
        learning_rate=1e-3,
        target_metric=0.85,
        patience=8,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=30)
    args = parser.parse_args()
    main(args.epochs)
