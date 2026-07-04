from .Optimizer import Optimizer, np


class SGD(Optimizer):
    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.01) -> None:
        params = dict(lr=lr)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        next_x = self.x - self.params["lr"] * self.function.grad(self.x)
        return self.move_next(next_x)
