from .Optimizer import Optimizer, np


class Adan(Optimizer):
    """
    Adan - Adaptive Nesterov Momentum Algorithm (arXiv:2208.06677)

    Беты заданы в Adam-конвенции референсной реализации sail-sg/Adan:
    m = beta1 * m + (1 - beta1) * g и т.д. (в самой статье те же
    коэффициенты записаны как (1 - beta) относительно этой записи).
    """

    m: np.ndarray
    v: np.ndarray
    n: np.ndarray
    g_prev: np.ndarray
    t: int

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.05,
        beta1: float = 0.98,
        beta2: float = 0.92,
        beta3: float = 0.99,
        eps: float = 1e-08,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, beta3=beta3, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        self.t += 1
        gradient = self.function.grad(self.x)
        # на первом шаге разность градиентов считается нулевой (как в референсной реализации)
        diff = gradient - self.g_prev if self.t > 1 else np.zeros([2])
        self.m = self.params["beta1"] * self.m + (1 - self.params["beta1"]) * gradient
        self.v = self.params["beta2"] * self.v + (1 - self.params["beta2"]) * diff
        # n - EMA квадрата градиента с Nesterov-поправкой на изменение градиента
        corrected = gradient + (1 - self.params["beta2"]) * diff
        self.n = self.params["beta3"] * self.n + (1 - self.params["beta3"]) * corrected**2
        eta = self.params["lr"] / (np.sqrt(self.n) + self.params["eps"])
        next_x = self.x - eta * (self.m + (1 - self.params["beta2"]) * self.v)
        self.g_prev = gradient
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.m = np.zeros([2])
        self.v = np.zeros([2])
        self.n = np.zeros([2])
        self.g_prev = np.zeros([2])
        self.t = 0
