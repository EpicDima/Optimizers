from .Optimizer import Optimizer, np


class Prodigy(Optimizer):
    """
    Оптимизатор Prodigy (learning-rate-free D-адаптация поверх Adam)
    из статьи "Prodigy: An Expeditiously Adaptive Parameter-Free Learner" (arXiv:2306.06101)
    """

    m: np.ndarray
    v: np.ndarray
    s: np.ndarray
    r: float
    d: float

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 1.0,
        beta1: float = 0.9,
        beta2: float = 0.999,
        d0: float = 1e-06,
        eps: float = 1e-08,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, d0=d0, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        lr = self.params["lr"]
        d = self.d
        sqrt_beta2 = np.sqrt(self.params["beta2"])
        self.m = self.params["beta1"] * self.m + (1 - self.params["beta1"]) * d * gradient
        self.v = self.params["beta2"] * self.v + (1 - self.params["beta2"]) * d**2 * gradient**2
        # r накапливает d^2 * <g, x0 - x> — нижнюю оценку расстояния
        # от стартовой точки до минимума (после нормировки на ||s||_1)
        self.r = sqrt_beta2 * self.r + (1 - sqrt_beta2) * lr * d**2 * float(np.dot(gradient, self.initial_x - self.x))
        self.s = sqrt_beta2 * self.s + (1 - sqrt_beta2) * lr * d**2 * gradient
        s_norm = float(np.sum(np.abs(self.s)))
        if s_norm > 0:
            # d монотонно не убывает: раскручивается от d0 до оценки расстояния до минимума
            self.d = max(d, self.r / s_norm)
        # без bias-коррекции — как в Algorithm 1 статьи
        # и в референсной реализации konstmish/prodigy по умолчанию
        next_x = self.x - lr * d * self.m / (np.sqrt(self.v) + d * self.params["eps"])
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.m = np.zeros([2])
        self.v = np.zeros([2])
        self.s = np.zeros([2])
        self.r = 0.0
        self.d = self.params["d0"]
