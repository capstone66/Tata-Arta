from __future__ import annotations

import tensorflow as tf
from tensorflow import keras


@tf.keras.utils.register_keras_serializable(package="TataArta")
class ResidualDenseBlock(keras.layers.Layer):
    """
    Custom residual dense block untuk memenuhi checklist AI Engineering:
    - Custom Layer
    - Bisa disimpan ke format .keras
    - Bisa dimuat ulang untuk inference/deployment
    """

    def __init__(
        self,
        units: int = 128,
        dropout_rate: float = 0.15,
        activation: str = "relu",
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.units = int(units)
        self.dropout_rate = float(dropout_rate)
        self.activation = activation

        self.dense_1 = keras.layers.Dense(self.units, activation=self.activation)
        self.batch_norm_1 = keras.layers.BatchNormalization()
        self.dropout_1 = keras.layers.Dropout(self.dropout_rate)

        self.dense_2 = keras.layers.Dense(self.units, activation=None)
        self.batch_norm_2 = keras.layers.BatchNormalization()
        self.activation_layer = keras.layers.Activation(self.activation)

        self.shortcut_projection = None

    def build(self, input_shape):
        input_dim = int(input_shape[-1])
        if input_dim != self.units:
            self.shortcut_projection = keras.layers.Dense(self.units, activation=None)
        super().build(input_shape)

    def call(self, inputs, training=False):
        shortcut = inputs

        x = self.dense_1(inputs)
        x = self.batch_norm_1(x, training=training)
        x = self.dropout_1(x, training=training)

        x = self.dense_2(x)
        x = self.batch_norm_2(x, training=training)

        if self.shortcut_projection is not None:
            shortcut = self.shortcut_projection(shortcut)

        x = keras.layers.add([x, shortcut])
        return self.activation_layer(x)

    def get_config(self):
        config = super().get_config()
        config.update(
            {
                "units": self.units,
                "dropout_rate": self.dropout_rate,
                "activation": self.activation,
            }
        )
        return config