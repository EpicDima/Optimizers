from .Optimizer import Optimizer, np


class Newton(Optimizer):
    def __init__(self, initial_x, function, lr=0.01):
        params = dict(lr=lr)
        super().__init__(initial_x, function, params)

    def next_point(self):
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
