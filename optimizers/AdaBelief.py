from .Optimizer import Optimizer, np


class AdaBelief(Optimizer):
    """
    Оптимизатор AdaBelief.

    Первоисточник: Zhuang et al. "AdaBelief Optimizer: Adapting Stepsizes
    by the Belief in Observed Gradients". 2020.
    https://arxiv.org/abs/2010.07468
    """

    param_descriptions = {
        "lr": "скорость обучения — масштаб шага",
        "beta1": "коэффициент EMA первого момента (сглаживание направления градиента)",
        "beta2": "коэффициент EMA «неожиданности» (g - m)^2 — отклонения градиента от момента вместо квадрата градиента",
        "eps": "малая добавка (внутри EMA и в знаменателе) для численной устойчивости",
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
        # в отличие от Adam второй момент копит не g^2, а отклонение градиента
        # от момента — "неожиданность" градиента; eps добавляется и внутри
        self.acc = (
            self.params["beta2"] * self.acc + (1 - self.params["beta2"]) * (gradient - self.v) ** 2 + self.params["eps"]
        )
        bias_correction1 = 1 - self.params["beta1"] ** self.t
        bias_correction2 = 1 - self.params["beta2"] ** self.t
        denom = np.sqrt(self.acc) / np.sqrt(bias_correction2) + self.params["eps"]
        next_x = self.x - self.params["lr"] / bias_correction1 * self.v / denom
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
        self.t = 0
