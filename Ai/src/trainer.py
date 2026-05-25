from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf

from src.custom_callbacks import TrainingStopper


def _make_dataset(x, y, batch_size: int, shuffle: bool) -> tf.data.Dataset:
    ds = tf.data.Dataset.from_tensor_slices((x, y))
    if shuffle:
        ds = ds.shuffle(buffer_size=min(len(x), 10000), seed=42, reshuffle_each_iteration=True)
    return ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)


def _loss_fn(task_type: str):
    if task_type == "multiclass":
        return tf.keras.losses.SparseCategoricalCrossentropy()
    if task_type == "binary":
        return tf.keras.losses.BinaryCrossentropy()
    if task_type == "regression":
        return tf.keras.losses.Huber(delta=0.05)
    raise ValueError(task_type)


def _metric(task_type: str):
    if task_type == "multiclass":
        return tf.keras.metrics.SparseCategoricalAccuracy(name="accuracy")
    if task_type == "binary":
        return tf.keras.metrics.BinaryAccuracy(name="accuracy")
    if task_type == "regression":
        return tf.keras.metrics.MeanAbsoluteError(name="mae")
    raise ValueError(task_type)


def train_with_gradient_tape(
    model: tf.keras.Model,
    x_train: np.ndarray,
    y_train: np.ndarray,
    x_val: np.ndarray,
    y_val: np.ndarray,
    model_output_path: Path,
    experiment_name: str,
    task_type: str,
    epochs: int = 30,
    batch_size: int = 256,
    learning_rate: float = 1e-3,
    target_metric: float | None = None,
    patience: int = 8,
) -> dict[str, Any]:
    model_output_path.parent.mkdir(parents=True, exist_ok=True)
    log_dir = model_output_path.parents[0].parent / "logs" / "fit" / f"{experiment_name}-{datetime.now():%Y%m%d-%H%M%S}"
    log_dir.mkdir(parents=True, exist_ok=True)

    train_ds = _make_dataset(x_train, y_train, batch_size=batch_size, shuffle=True)
    val_ds = _make_dataset(x_val, y_val, batch_size=batch_size, shuffle=False)

    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    loss_fn = _loss_fn(task_type)
    train_metric = _metric(task_type)
    val_metric = _metric(task_type)

    monitor_name = "val_mae" if task_type == "regression" else "val_accuracy"
    mode = "min" if task_type == "regression" else "max"
    stopper = TrainingStopper(monitor=monitor_name, mode=mode, target=target_metric, patience=patience)

    writer = tf.summary.create_file_writer(str(log_dir))
    history: list[dict[str, float]] = []

    print(f"Train samples: {len(x_train)} | Val samples: {len(x_val)} | Features: {x_train.shape[1]}")

    for epoch in range(1, epochs + 1):
        train_loss = tf.keras.metrics.Mean(name="loss")
        val_loss = tf.keras.metrics.Mean(name="val_loss")
        train_metric.reset_state()
        val_metric.reset_state()

        for xb, yb in train_ds:
            with tf.GradientTape() as tape:
                pred = model(xb, training=True)
                if task_type in {"binary", "regression"}:
                    yb_loss = tf.reshape(tf.cast(yb, tf.float32), (-1, 1))
                else:
                    yb_loss = tf.cast(yb, tf.int32)
                loss = loss_fn(yb_loss, pred)
                loss += sum(model.losses)

            gradients = tape.gradient(loss, model.trainable_variables)
            optimizer.apply_gradients(zip(gradients, model.trainable_variables))
            train_loss.update_state(loss)

            if task_type in {"binary", "regression"}:
                train_metric.update_state(tf.reshape(tf.cast(yb, tf.float32), (-1, 1)), pred)
            else:
                train_metric.update_state(yb, pred)

        for xb, yb in val_ds:
            pred = model(xb, training=False)
            if task_type in {"binary", "regression"}:
                yb_loss = tf.reshape(tf.cast(yb, tf.float32), (-1, 1))
            else:
                yb_loss = tf.cast(yb, tf.int32)
            loss = loss_fn(yb_loss, pred)
            val_loss.update_state(loss)

            if task_type in {"binary", "regression"}:
                val_metric.update_state(tf.reshape(tf.cast(yb, tf.float32), (-1, 1)), pred)
            else:
                val_metric.update_state(yb, pred)

        train_metric_value = float(train_metric.result().numpy())
        val_metric_value = float(val_metric.result().numpy())
        train_loss_value = float(train_loss.result().numpy())
        val_loss_value = float(val_loss.result().numpy())

        row = {
            "epoch": epoch,
            "loss": train_loss_value,
            train_metric.name: train_metric_value,
            "val_loss": val_loss_value,
            f"val_{val_metric.name}": val_metric_value,
        }
        history.append(row)

        with writer.as_default():
            tf.summary.scalar("loss/train", train_loss_value, step=epoch)
            tf.summary.scalar("loss/val", val_loss_value, step=epoch)
            tf.summary.scalar(f"{train_metric.name}/train", train_metric_value, step=epoch)
            tf.summary.scalar(f"{val_metric.name}/val", val_metric_value, step=epoch)

        should_save, should_stop = stopper.step(val_metric_value)
        save_note = ""
        if should_save:
            model.save(model_output_path)
            save_note = " | saved"

        metric_label = f"val_{val_metric.name}"
        print(
            f"Epoch {epoch:03d}/{epochs} | loss: {train_loss_value:.5f} | "
            f"{train_metric.name}: {train_metric_value:.5f} | val_loss: {val_loss_value:.5f} | "
            f"{metric_label}: {val_metric_value:.5f}{save_note}"
        )

        if should_stop:
            if target_metric is not None:
                print(f"[OK] Target {monitor_name}{'>=' if mode == 'max' else '<='}{target_metric} tercapai / early stop.")
            else:
                print("[INFO] Early stop karena tidak ada peningkatan.")
            break

    if not model_output_path.exists():
        model.save(model_output_path)

    result = {
        "experiment_name": experiment_name,
        "task_type": task_type,
        "model_output_path": str(model_output_path),
        "log_dir": str(log_dir),
        "epochs_completed": len(history),
        "best_monitor_value": stopper.best,
        "history": history,
    }

    summary_path = model_output_path.with_suffix(".training_summary.json")
    summary_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    return result
