from .Optimizer import Optimizer, np


class Adam(Optimizer):
    """
    Adam — адаптивный метод с оценками первого и второго моментов градиента и коррекцией смещения.

    Первоисточник: Kingma D.P., Ba J. "Adam: A Method for Stochastic Optimization".
    arXiv preprint arXiv:1412.6980, 2014.
    https://arxiv.org/abs/1412.6980
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.Adam.html
    """

    v: np.ndarray
    acc: np.ndarray
    t: int

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.01,
        beta1: float = 0.9,
        beta2: float = 0.999,
        eps: float = 1e-08,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        self.t += 1
        gradient = self.function.grad(self.x)
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient
        self.acc = self.params["beta2"] * self.acc + (1 - self.params["beta2"]) * gradient**2
        bias_correction1 = 1 - self.params["beta1"] ** self.t
        bias_correction2 = 1 - self.params["beta2"] ** self.t
        denom = np.sqrt(self.acc) / np.sqrt(bias_correction2) + self.params["eps"]
        next_x = self.x - self.params["lr"] / bias_correction1 * self.v / denom
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
        self.t = 0
