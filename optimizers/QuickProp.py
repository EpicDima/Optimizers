from .Optimizer import Optimizer, np


class QuickProp(Optimizer):
    """
    QuickProp — эвристика Фальмана второго порядка с параболической
    аппроксимацией функции по разности последовательных градиентов.

    Первоисточник: Fahlman S. E. "An Empirical Study of Learning Speed in
    Back-Propagation Networks". Technical Report CMU-CS-88-162,
    Carnegie Mellon University, 1988.
    https://doi.org/10.1184/R1/6603266
    Реализация: классическая формула Quickprop — шаг
    dx_t = dx_(t-1) * g_t / (g_(t-1) - g_t) с ограничением фактора роста
    alpha_max; при нулевом предыдущем шаге — градиентный шаг с lr.
    """

    param_descriptions = {
        "lr": "скорость обучения для градиентного шага по координате, когда её предыдущий шаг нулевой",
        "alpha_max": "максимальный фактор роста: во сколько раз новый шаг может превысить предыдущий",
    }

    previous_update: np.ndarray
    previous_gradient: np.ndarray

    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.01, alpha_max: float = 1.75) -> None:
        params = dict(lr=lr, alpha_max=alpha_max)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)

        denominator = self.previous_gradient - gradient
        temp = np.divide(gradient, denominator, out=np.zeros_like(gradient), where=(denominator != 0))

        alpha = np.clip(temp, -self.params["alpha_max"], self.params["alpha_max"])

        zeros = self.previous_update == 0
        update = ~zeros * alpha * self.previous_update + zeros * self.params["lr"] * gradient

        self.previous_gradient = gradient
        self.previous_update = update

        next_x = self.x - update

        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.previous_update = np.zeros([2])
        self.previous_gradient = np.zeros([2])
