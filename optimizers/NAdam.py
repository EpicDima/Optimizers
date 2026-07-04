from .Optimizer import Optimizer, np


class NAdam(Optimizer):
    """
    NAdam — Adam с моментом Нестерова и затуханием момента.

    Первоисточник: Dozat T. "Incorporating Nesterov Momentum into Adam". ICLR 2016 Workshop.
    https://openreview.net/forum?id=OM0jvwB8jIp57ZJjtNEZ
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.NAdam.html
    """

    param_descriptions = {
        "lr": "скорость обучения — масштаб шага",
        "beta1": "коэффициент EMA первого момента (сглаживание направления градиента)",
        "beta2": "коэффициент EMA второго момента (усреднение квадратов градиента)",
        "eps": "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно",
        "weight_decay": "L2-штраф: тянет точку к началу координат, искажая минимизируемую функцию",
        "momentum_decay": "темп прогрева нестеровского момента: чем больше, тем быстрее mu_t растёт к beta1",
    }

    v: np.ndarray
    acc: np.ndarray
    mu_product: float
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
        momentum_decay: float = 0.004,
    ) -> None:
        params = dict(
            lr=lr,
            beta1=beta1,
            beta2=beta2,
            eps=eps,
            weight_decay=weight_decay,
            momentum_decay=momentum_decay,
        )
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.t += 1
        gradient = gradient + self.params["weight_decay"] * self.x
        mu = self.params["beta1"] * (1 - 0.5 * 0.96 ** (self.t * self.params["momentum_decay"]))
        mu_next = self.params["beta1"] * (1 - 0.5 * 0.96 ** ((self.t + 1) * self.params["momentum_decay"]))
        self.mu_product *= mu
        mu_product_next = self.mu_product * mu_next
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient
        self.acc = self.params["beta2"] * self.acc + (1 - self.params["beta2"]) * gradient**2
        bias_correction2 = 1 - self.params["beta2"] ** self.t
        denom = np.sqrt(self.acc / bias_correction2) + self.params["eps"]
        next_x = (
            self.x
            - self.params["lr"] * (1 - mu) / (1 - self.mu_product) * gradient / denom
            - self.params["lr"] * mu_next / (1 - mu_product_next) * self.v / denom
        )
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
        self.mu_product = 1.0
        self.t = 0
