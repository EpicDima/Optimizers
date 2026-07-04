from .Optimizer import Optimizer, np


class Sophia(Optimizer):
    """
    Оптимизатор Sophia (Second-order Clipped Stochastic Optimization)
    из статьи "Sophia: A Scalable Stochastic Second-order Optimizer
    for Language Model Pre-training" (arXiv:2305.14342)

    Вариант SophiaH, но вместо стохастической оценки Хатчинсона
    используется диагональ точного численного гессиана function.hesse,
    доступного в этой песочнице
    """

    m: np.ndarray
    h: np.ndarray

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.5,
        beta1: float = 0.96,
        beta2: float = 0.99,
        rho: float = 1.0,
        eps: float = 1e-12,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, rho=rho, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        # градиент точный и стохастики нет, поэтому оценку гессиана
        # обновляем каждый шаг (k = 1), а не раз в k шагов, как в статье
        hesse_diag = np.diag(self.function.hesse(self.x))
        self.m = self.params["beta1"] * self.m + (1 - self.params["beta1"]) * gradient
        # отрицательную кривизну обрезаем нулём, чтобы не шагать в сторону седла или максимума
        self.h = self.params["beta2"] * self.h + (1 - self.params["beta2"]) * np.maximum(hesse_diag, 0)
        # покомпонентный клиппинг порогом rho: шаг по каждой оси не длиннее lr * rho,
        # что защищает от взрыва, пока оценка кривизны h ещё мала
        update = np.clip(self.m / np.maximum(self.h, self.params["eps"]), -self.params["rho"], self.params["rho"])
        next_x = self.x - self.params["lr"] * update
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.m = np.zeros([2])
        self.h = np.zeros([2])
