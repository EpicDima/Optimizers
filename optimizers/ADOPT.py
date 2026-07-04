from .Optimizer import Optimizer, np


class ADOPT(Optimizer):
    """
    Оптимизатор ADOPT
    из статьи "ADOPT: Modified Adam Can Converge with Any beta2
    with the Optimal Rate" (arXiv:2411.02853)
    """

    v: np.ndarray
    acc: np.ndarray
    t: int

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.01,
        beta1: float = 0.9,
        beta2: float = 0.9999,
        eps: float = 1e-06,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        self.t += 1
        gradient = self.function.grad(self.x)
        if self.t == 1:
            # v_0 = g_0^2 — второй момент инициализируется первым градиентом
            self.acc = gradient**2
        # градиент нормируется на второй момент ПРОШЛОГО шага (до его обновления)
        # и клиппируется порогом t^0.25 — это и даёт доказуемую сходимость
        clip = self.t**0.25
        normed_gradient = np.clip(gradient / np.maximum(np.sqrt(self.acc), self.params["eps"]), -clip, clip)
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * normed_gradient
        next_x = self.x - self.params["lr"] * self.v
        self.acc = self.params["beta2"] * self.acc + (1 - self.params["beta2"]) * gradient**2
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
        self.t = 0
