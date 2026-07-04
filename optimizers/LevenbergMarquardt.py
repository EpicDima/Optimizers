from .Optimizer import Optimizer, np


class LevenbergMarquardt(Optimizer):
    """
    Метод Левенберга—Марквардта — ньютоновский шаг с адаптивным демпфированием.

    Первоисточники:
    Levenberg K. "A Method for the Solution of Certain Non-Linear Problems
    in Least Squares". Quarterly of Applied Mathematics 2, 1944.
    https://doi.org/10.1090/qam/10666
    Marquardt D. W. "An Algorithm for Least-Squares Estimation of Nonlinear
    Parameters". Journal of the Society for Industrial and Applied Mathematics
    11(2), 1963.
    https://doi.org/10.1137/0111030
    Реализация: классическая схема, но с точным гессианом function.hesse
    вместо гаусс-ньютоновской аппроксимации J^T * J: решается
    (H + m*I) * d = g, демпфирование m уменьшается при удачном шаге
    и удваивается при неудачном.
    """

    param_descriptions = {
        "lr": "масштаб шага по решению системы (H + m*I) d = g, обычно 1",
        "damping": "начальный демпфер m: сдвигает шаг от ньютоновского к градиентному; далее адаптируется сам",
    }

    m: float

    def __init__(self, initial_x: np.ndarray, function, lr: float = 1.0, damping: float = 0.001) -> None:
        params = dict(lr=lr, damping=damping)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        hesse = self.function.hesse(self.x)

        try:
            update = np.linalg.solve(hesse + self.m * np.eye(2), gradient)
        except np.linalg.LinAlgError:
            update = gradient

        next_x = self.x - self.params["lr"] * update

        if self.function(next_x.flatten()) < self.function(self.x):
            self.m = max(self.m / 3, 1e-12)
            return self.move_next(next_x)

        # шаг не уменьшил функцию — остаёмся на месте и усиливаем демпфирование,
        # приближая следующий шаг к градиентному
        self.m *= 2
        return self.move_next(self.x)

    def reset(self) -> None:
        super().reset()
        self.m = self.params["damping"]
