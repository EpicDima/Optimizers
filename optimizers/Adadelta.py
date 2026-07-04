from .Optimizer import Optimizer, np


class Adadelta(Optimizer):
    acc1: np.ndarray
    acc2: np.ndarray

    def __init__(
        self, initial_x: np.ndarray, function, lr: float = 0.01, rho: float = 0.975, eps: float = 1e-02
    ) -> None:
        params = dict(lr=lr, rho=rho, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.acc1 = self.params["rho"] * self.acc1 + (1 - self.params["rho"]) * gradient**2
        update = gradient * np.sqrt(self.acc2 + self.params["eps"]) / np.sqrt(self.acc1 + self.params["eps"])
        self.acc2 = self.params["rho"] * self.acc2 + (1 - self.params["rho"]) * update**2
        next_x = self.x - self.params["lr"] * update
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.acc1 = np.zeros([2])
        self.acc2 = np.zeros([2])
