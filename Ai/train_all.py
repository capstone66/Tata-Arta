from __future__ import annotations

import argparse
import json

from src.train_fast_moving import main as train_fast_moving
from src.train_low_stock import main as train_low_stock
from src.train_profit import main as train_profit


def main():
    parser = argparse.ArgumentParser(description="Train all Tata-Arta AI models.")
    parser.add_argument("--epochs", type=int, default=30, help="Epochs for classification models.")
    parser.add_argument("--profit-epochs", type=int, default=40, help="Epochs for profit regression.")
    args = parser.parse_args()

    results = {}
    print("\n=== Training Fast Moving Detection v4 ===")
    results["fast_moving"] = train_fast_moving(epochs=args.epochs)

    print("\n=== Training Restock Priority / Low Stock v4 ===")
    results["low_stock"] = train_low_stock(epochs=args.epochs)

    print("\n=== Training Profit Prediction v4 ===")
    results["profit"] = train_profit(epochs=args.profit_epochs)

    print("\n=== Training selesai ===")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
