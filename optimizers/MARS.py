from .Optimizer import Optimizer, np


class MARS(Optimizer):
    """
    MARS - оптимизатор с вариационной редукцией.

    Первоисточник: Yuan et al. "MARS: Unleashing the Power of Variance
    Reduction for Training Large Models". 2024.
    https://arxiv.org/abs/2411.10438

    AdamW-шаг по вариационно-скорректированному градиенту c_t с клиппингом
    по норме. Здесь градиент точный (стохастики нет), поэтому вариационная
    поправка работает как экстраполяция градиента, а не как подавление шума.
    """

    m: np.ndarray
    v: np.ndarray
    g_prev: np.ndarray
    t: int

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.05,
        gamma: float = 0.025,
        beta1: float = 0.95,
        beta2: float = 0.99,
        eps: float = 1e-08,
        weight_decay: float = 0.0,
    ) -> None:
        params = dict(lr=lr, gamma=gamma, beta1=beta1, beta2=beta2, eps=eps, weight_decay=weight_decay)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        self.t += 1
        gradient = self.function.grad(self.x)
        # на первом шаге g_prev = g_t, поэтому вариационная поправка нулевая
        g_prev = gradient if self.t == 1 else self.g_prev
        scale = self.params["gamma"] * self.params["beta1"] / (1 - self.params["beta1"])
        c = gradient + scale * (gradient - g_prev)
        # клиппинг из статьи: скорректированный градиент нормируется к единичной норме
        c_norm = np.linalg.norm(c)
        if c_norm > 1:
            c = c / c_norm
        self.m = self.params["beta1"] * self.m + (1 - self.params["beta1"]) * c
        self.v = self.params["beta2"] * self.v + (1 - self.params["beta2"]) * c**2
        m_hat = self.m / (1 - self.params["beta1"] ** self.t)
        v_hat = self.v / (1 - self.params["beta2"] ** self.t)
        denom = np.sqrt(v_hat) + self.params["eps"]
        next_x = self.x - self.params["lr"] * (m_hat / denom + self.params["weight_decay"] * self.x)
        self.g_prev = gradient
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.m = np.zeros([2])
        self.v = np.zeros([2])
        self.g_prev = np.zeros([2])
        self.t = 0
