from .Optimizer import Optimizer, np


class AdamW(Optimizer):
    """
    AdamW — Adam с отвязанной (decoupled) регуляризацией весов: weight decay применяется к точке напрямую.

    Первоисточник: Loshchilov I., Hutter F. "Decoupled Weight Decay Regularization".
    arXiv preprint arXiv:1711.05101, 2017.
    https://arxiv.org/abs/1711.05101
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html
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
        weight_decay: float = 0.01,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps, weight_decay=weight_decay)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.t += 1
        x = self.x * (1 - self.params["lr"] * self.params["weight_decay"])
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient
        self.acc = self.params["beta2"] * self.acc + (1 - self.params["beta2"]) * gradient**2
        bias_correction1 = 1 - self.params["beta1"] ** self.t
        bias_correction2 = 1 - self.params["beta2"] ** self.t
        step_size = self.params["lr"] / bias_correction1
        denom = np.sqrt(self.acc) / np.sqrt(bias_correction2) + self.params["eps"]
        next_x = x - step_size * self.v / denom
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])
        self.t = 0
