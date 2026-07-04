from .Optimizer import Optimizer, np


class RMSprop(Optimizer):
    """
    RMSprop — деление градиента на корень из скользящего среднего квадратов градиентов.

    Первоисточник (метод не публиковался как статья): Tieleman T., Hinton G. Lecture 6.5 — rmsprop.
    Курс COURSERA "Neural Networks for Machine Learning", University of Toronto, 2012 (слайды лекции 6e).
    https://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.RMSprop.html
    """

    param_descriptions = {
        "lr": "базовая скорость обучения, делится на корень из скользящего среднего квадратов градиентов",
        "coef": "коэффициент затухания скользящего среднего квадратов градиентов",
        "eps": "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно",
    }

    acc: np.ndarray

    def __init__(
        self, initial_x: np.ndarray, function, lr: float = 0.01, coef: float = 0.8, eps: float = 1e-08
    ) -> None:
        params = dict(lr=lr, coef=coef, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.acc = self.params["coef"] * self.acc + (1 - self.params["coef"]) * gradient**2
        adaptive_lr = self.params["lr"] / (np.sqrt(self.acc) + self.params["eps"])
        next_x = self.x - adaptive_lr * gradient
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.acc = np.zeros([2])
