from .Optimizer import Optimizer, np


class Adafactor(Optimizer):
    """
    Adafactor — адаптивный метод с сублинейной памятью; для параметра-вектора
    используется нефакторизованная оценка второго момента.

    Первоисточник: Shazeer N., Stern M. "Adafactor: Adaptive Learning Rates
    with Sublinear Memory Cost". arXiv:1804.04235, 2018.
    https://arxiv.org/abs/1804.04235
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.Adafactor.html
    """

    step: float
    variance: np.ndarray

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.1,
        beta2_decay: float = -0.8,
        eps1: float = 1e-15,
        eps2: float = 0.001,
        d: float = 1.0,
        weight_decay: float = 0.0,
    ) -> None:
        params = dict(lr=lr, beta2_decay=beta2_decay, eps1=eps1, eps2=eps2, d=d, weight_decay=weight_decay)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.step += 1
        # для одномерного параметра PyTorch использует нефакторизованную оценку второго момента
        one_minus_beta2_t = self.step ** self.params["beta2_decay"]
        rho_t = min(self.params["lr"], 1 / self.step**0.5)
        alpha = max(self.params["eps2"], float(np.linalg.norm(self.x)) / self.x.size**0.5) * rho_t
        x = self.x * (1 - self.params["lr"] * self.params["weight_decay"])
        self.variance = self.variance + (gradient**2 - self.variance) * one_minus_beta2_t
        update = gradient / np.sqrt(np.maximum(self.variance, self.params["eps1"] ** 2))
        denom = max(1.0, float(np.linalg.norm(update)) / (update.size**0.5 * self.params["d"]))
        next_x = x - alpha / denom * update
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.step = 0.0
        self.variance = np.zeros([2])
