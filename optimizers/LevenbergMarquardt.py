from .Optimizer import Optimizer, np


class LevenbergMarquardt(Optimizer):
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
