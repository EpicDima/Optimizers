from .Optimizer import Optimizer, np


class Adagrad(Optimizer):
    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.01, eps: float = 1e-08) -> None:
        params = dict(lr=lr, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.acc += gradient**2
        adaptive_lr = self.params["lr"] / (np.sqrt(self.acc) + self.params["eps"])
        next_x = self.x - adaptive_lr * gradient
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.acc: np.ndarray = np.zeros([2])
