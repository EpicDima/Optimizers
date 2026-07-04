from .Optimizer import Optimizer, np


class Newton(Optimizer):
    """
    Метод Ньютона — минимизация второго порядка с точным гессианом.

    Первоисточник: классический метод Ньютона—Рафсона (XVII век) в применении
    к оптимизации; отдельной статьи-первоисточника в современном смысле нет.
    Источник формулировки: Nocedal J., Wright S. J. "Numerical Optimization".
    2nd ed., Springer, 2006.
    https://doi.org/10.1007/978-0-387-40065-5
    Реализация: демпфированный шаг Ньютона x - lr * H^(-1) * g с точным
    гессианом function.hesse; если гессиан не положительно определён,
    выполняется откат на градиентный шаг.
    """

    param_descriptions = {
        "lr": "демпфер ньютоновского шага: 1 — полный шаг x - H^(-1) g, меньше — осторожнее",
    }

    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.01) -> None:
        params = dict(lr=lr)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        hesse = self.function.hesse(self.x)

        if np.all(np.linalg.eigvalsh(hesse) > 0):
            update = np.linalg.solve(hesse, gradient)
        else:
            # гессиан не положительно определён — ньютоновский шаг может вести
            # не в сторону минимума, откатываемся на градиентный
            update = gradient

        next_x = self.x - self.params["lr"] * update
        return self.move_next(next_x)
