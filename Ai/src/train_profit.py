from __future__ import annotations

import argparse
import joblib
from sklearn.model_selection import train_test_split

from src.config import MODEL_PATHS, RANDOM_STATE
from src.data_loader import load_products_featured, load_transactions
from src.feature_engineering import build_ai_table
from src.model_builder import build_tabular_model
from src.preprocessing import build_preprocessor, prepare_xy
from src.trainer import train_with_gradient_tape


def main(epochs: int = 40):
    products = load_products_featured()
    transactions = load_transactions()
    bundle = build_ai_table(products, transactions)
    df = bundle.data

    x = df[bundle.feature_columns]
    y = df["profit_ratio_clean"].astype("float32")

    x_train, x_val, y_train, y_val = train_test_split(
        x, y, test_size=0.2, random_state=RANDOM_STATE
    )

    preprocessor = build_preprocessor(bundle.numeric_columns, bundle.categorical_columns)
    x_train_t, x_val_t = prepare_xy(preprocessor, x_train, x_val)

    model = build_tabular_model(
        input_dim=x_train_t.shape[1],
        output_dim=1,
        task_type="regression",
        hidden_units=160,
        dropout_rate=0.12,
    )

    joblib.dump({
        "preprocessor": preprocessor,
        "feature_columns": bundle.feature_columns,
        "numeric_columns": bundle.numeric_columns,
        "categorical_columns": bundle.categorical_columns,
        "target_column": "profit_ratio_clean",
        "note": "Target is cleaned profit ratio clipped to 0..1, not raw products_featured.profit_margin because that column has extreme outliers.",
    }, MODEL_PATHS.profit_preprocessor)

    return train_with_gradient_tape(
        model=model,
        x_train=x_train_t,
        y_train=y_train.to_numpy(),
        x_val=x_val_t,
        y_val=y_val.to_numpy(),
        model_output_path=MODEL_PATHS.profit_model,
        experiment_name="profit-prediction-v4",
        task_type="regression",
        epochs=epochs,
        batch_size=256,
        learning_rate=8e-4,
        target_metric=0.02,
        patience=10,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=40)
    args = parser.parse_args()
    main(args.epochs)
