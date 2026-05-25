from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TrainingStopper:
    """Small custom callback-like utility for the custom tf.GradientTape loop."""

    monitor: str
    mode: str = "max"
    target: float | None = None
    patience: int = 8

    def __post_init__(self):
        self.best = float("-inf") if self.mode == "max" else float("inf")
        self.wait = 0

    def improved(self, value: float) -> bool:
        if self.mode == "max":
            return value > self.best
        return value < self.best

    def step(self, value: float) -> tuple[bool, bool]:
        """Return (should_save, should_stop)."""
        should_save = False
        should_stop = False

        if self.improved(value):
            self.best = value
            self.wait = 0
            should_save = True
        else:
            self.wait += 1

        if self.target is not None:
            if self.mode == "max" and value >= self.target:
                should_stop = True
            if self.mode == "min" and value <= self.target:
                should_stop = True

        if self.wait >= self.patience:
            should_stop = True

        return should_save, should_stop
