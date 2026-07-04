from .Optimizer import Optimizer, np


class RAdam(Optimizer):
    """
    RAdam — Adam с ректификацией дисперсии адаптивного шага (Rectified Adam).

    Первоисточник: Liu L., Jiang H., He P., Chen W., Liu X., Gao J., Han J.
    "On the Variance of the Adaptive Learning Rate and Beyond". arXiv:1908.03265, 2019 (ICLR 2020).
    https://arxiv.org/abs/1908.03265
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.RAdam.html
    """

    param_descriptions = {
        "lr": "скорость обучения — масштаб шага",
        "beta1": "коэффициент EMA первого момента (сглаживание направления градиента)",
        "beta2": "коэффициент EMA второго момента; от него же зависит порог включения ректификации",
        "eps": "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно",
        "weight_decay": "L2-штраф: тянет точку к началу координат, искажая минимизируемую функцию",
    }

    v: np.ndarray
    acc: np.ndarray
    t: int

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.01,
        beta1: float = 0.9,
        beta2: float = 0.999,
        eps: float = 1e-08,
        weight_decay: float = 0.0,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps, weight_decay=weight_decay)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.t += 1
        gradient = gradient + self.params["weight_decay"] * self.x
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient
        self.acc = self.params["beta2"] * self.acc + (1 - self.params["beta2"]) * gradient**2
        bias_correction1 = 1 - self.params["beta1"] ** self.t
        bias_correction2 = 1 - self.params["beta2"] ** self.t
        corrected_v = self.v / bias_correction1
        rho_inf = 2 / (1 - self.params["beta2"]) - 1
        rho_t = rho_inf - 2 * self.t * self.params["beta2"] ** self.t / bias_correction2
        if rho_t > 5.0:
            rect = ((rho_t - 4) * (rho_t - 2) * rho_inf / ((rho_inf - 4) * (rho_inf - 2) * rho_t)) ** 0.5
            adaptive_lr = np.sqrt(bias_correction2) / (np.sqrt(self.acc) + self.params["eps"])
            next_x = self.x - self.params["lr"] * rect * adaptive_lr * corrected_v
        else:
            next_x = self.x - self.params["lr"] * corrected_v
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
        self.t = 0
