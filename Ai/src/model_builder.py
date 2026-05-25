from __future__ import annotations

from tensorflow import keras
from tensorflow.keras import layers

from src.custom_layers import ResidualDenseBlock


def build_tabular_model(
    input_dim: int,
    output_dim: int,
    task_type: str,
    hidden_units: int = 160,
    dropout_rate: float = 0.18,
) -> keras.Model:
    inputs = keras.Input(shape=(input_dim,), name="tabular_features")
    x = layers.Dense(hidden_units, activation="relu")(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout_rate)(x)

    x = ResidualDenseBlock(hidden_units, dropout_rate=dropout_rate, name="custom_residual_block_1")(x)
    x = ResidualDenseBlock(hidden_units, dropout_rate=dropout_rate, name="custom_residual_block_2")(x)

    x = layers.Dense(80, activation="relu")(x)
    x = layers.Dropout(dropout_rate / 2)(x)

    if task_type == "multiclass":
        activation = "softmax"
        units = output_dim
    elif task_type == "binary":
        activation = "sigmoid"
        units = 1
    elif task_type == "regression":
        activation = "sigmoid"
        units = 1
    else:
        raise ValueError(f"Unknown task_type: {task_type}")

    outputs = layers.Dense(units, activation=activation, name=f"{task_type}_output")(x)
    return keras.Model(inputs, outputs, name=f"tata_arta_{task_type}_model")
