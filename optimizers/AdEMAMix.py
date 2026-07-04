from .Optimizer import Optimizer, np


class AdEMAMix(Optimizer):
    """
    AdEMAMix.

    Первоисточник: Pagliardini et al. "The AdEMAMix Optimizer:
    Better, Faster, Older". 2024.
    https://arxiv.org/abs/2409.03137

    Adam с дополнительной медленной EMA момента m2, которая добавляется
    к шагу с коэффициентом alpha. Отклонение от статьи: там beta3 = 0.9999
    и шедулеры для alpha/beta3 на десятки тысяч шагов, а здесь анимация
    длится максимум ~1000 шагов, поэтому beta3 = 0.99 и шедулеров нет.
    """

    param_descriptions = {
        "lr": "скорость обучения — масштаб шага",
        "beta1": "коэффициент быстрой EMA момента m1 (как beta1 в Adam)",
        "beta2": "коэффициент EMA второго момента (квадратов градиента) для адаптивного масштаба шага",
        "beta3": "коэффициент медленной EMA момента m2 — долгой памяти о старых градиентах",
        "alpha": "вес медленной EMA m2 в шаге: чем больше, тем сильнее вклад старых градиентов",
        "eps": "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно",
    }

    m1: np.ndarray
    m2: np.ndarray
    v: np.ndarray
    t: int

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.01,
        beta1: float = 0.9,
        beta2: float = 0.999,
        beta3: float = 0.99,
        alpha: float = 5.0,
        eps: float = 1e-08,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, beta3=beta3, alpha=alpha, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        self.t += 1
        gradient = self.function.grad(self.x)
        self.m1 = self.params["beta1"] * self.m1 + (1 - self.params["beta1"]) * gradient
        # медленная EMA намеренно без bias-коррекции, как в статье
        self.m2 = self.params["beta3"] * self.m2 + (1 - self.params["beta3"]) * gradient
        self.v = self.params["beta2"] * self.v + (1 - self.params["beta2"]) * gradient**2
        m1_hat = self.m1 / (1 - self.params["beta1"] ** self.t)
        v_hat = self.v / (1 - self.params["beta2"] ** self.t)
        denom = np.sqrt(v_hat) + self.params["eps"]
        next_x = self.x - self.params["lr"] * (m1_hat + self.params["alpha"] * self.m2) / denom
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.m1 = np.zeros([2])
        self.m2 = np.zeros([2])
        self.v = np.zeros([2])
        self.t = 0
