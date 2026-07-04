from .Optimizer import Optimizer, np


class Adamax(Optimizer):
    """
    Adamax — вариант Adam на основе бесконечной нормы: вместо среднего квадратов берётся максимум |градиента|.

    Первоисточник: Kingma D.P., Ba J. "Adam: A Method for Stochastic Optimization" (раздел 7, AdaMax).
    arXiv preprint arXiv:1412.6980, 2014.
    https://arxiv.org/abs/1412.6980
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.Adamax.html
    """

    param_descriptions = {
        "lr": "скорость обучения — масштаб шага",
        "beta1": "коэффициент EMA первого момента (сглаживание направления градиента)",
        "beta2": "коэффициент затухания бесконечной нормы: как быстро забывается прошлый максимум |градиента|",
        "eps": "малая добавка к модулю градиента перед взятием максимума — защита от деления на ноль",
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
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        self.t += 1
        gradient = self.function.grad(self.x)
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient
        self.acc = np.maximum(self.params["beta2"] * self.acc, np.fabs(gradient) + self.params["eps"])
        clr = self.params["lr"] / (1 - self.params["beta1"] ** self.t)
        next_x = self.x - clr * self.v / self.acc
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
        self.t = 0
