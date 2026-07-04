from .Optimizer import Optimizer, np


class Adamax(Optimizer):
    v: np.ndarray
    acc: np.ndarray

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.01,
        beta1: float = 0.9,
        beta2: float = 0.999,
        eps: float = 1e-08,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient
        self.acc = np.maximum(self.params["beta2"] * self.acc, np.fabs(gradient))
        adaptive_lr = self.params["lr"] / (self.acc + self.params["eps"])
        next_x = self.x - adaptive_lr * self.v
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
