from .Optimizer import Optimizer, np


class ASGD(Optimizer):
    """
    ASGD — стохастический градиентный спуск с усреднением Поляка—Юдицкого.

    Первоисточник: Polyak B. T., Juditsky A. B. "Acceleration of Stochastic
    Approximation by Averaging". SIAM Journal on Control and Optimization 30(4), 1992.
    https://doi.org/10.1137/0330046
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.ASGD.html
    """

    step: float
    ax: np.ndarray

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.01,
        lambd: float = 0.0001,
        alpha: float = 0.75,
        t0: float = 1000000.0,
        weight_decay: float = 0.0,
    ) -> None:
        params = dict(lr=lr, lambd=lambd, alpha=alpha, t0=t0, weight_decay=weight_decay)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        lr = self.params["lr"]
        lambd = self.params["lambd"]
        # eta и mu в PyTorch пересчитываются после шага, поэтому на шаге t
        # используются значения, посчитанные по счётчику предыдущего шага
        eta = lr / (1 + lambd * lr * self.step) ** self.params["alpha"]
        mu = 1 / max(1.0, self.step - self.params["t0"])
        self.step += 1
        gradient = self.function.grad(self.x) + self.params["weight_decay"] * self.x
        next_x = self.x * (1 - lambd * eta) - eta * gradient
        # усреднённая точка поддерживается как внутреннее состояние,
        # траектория (self.x) идёт по фактическим шагам, как param в PyTorch
        self.ax = self.ax + (next_x - self.ax) * mu
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.step = 0.0
        self.ax = np.zeros([2])
