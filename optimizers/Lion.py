from .Optimizer import Optimizer, np


class Lion(Optimizer):
    """
    Оптимизатор Lion (EvoLved Sign Momentum)
    из статьи "Symbolic Discovery of Optimization Algorithms" (arXiv:2302.06675)
    """

    v: np.ndarray

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.02,
        beta1: float = 0.9,
        beta2: float = 0.99,
        weight_decay: float = 0.0,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, weight_decay=weight_decay)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        # направление шага — только знак интерполяции момента и градиента,
        # поэтому шаг по каждой оси всегда имеет длину lr
        update = np.sign(self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient)
        self.v = self.params["beta2"] * self.v + (1 - self.params["beta2"]) * gradient
        x = self.x * (1 - self.params["lr"] * self.params["weight_decay"])
        next_x = x - self.params["lr"] * update
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
