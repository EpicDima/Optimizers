from .Optimizer import Optimizer, np


class SGD(Optimizer):
    """
    SGD — градиентный спуск: шаг против градиента функции с постоянной скоростью обучения.

    Здесь градиент вычисляется точно (без стохастики), поэтому метод восходит к наискорейшему спуску Коши.
    Первоисточник: Cauchy A.-L. "Méthode générale pour la résolution des systèmes d'équations simultanées".
    Comptes Rendus de l'Académie des Sciences de Paris, t. 25, 1847, pp. 536-538.
    Стохастический вариант (собственно SGD): Robbins H., Monro S. "A Stochastic Approximation Method".
    The Annals of Mathematical Statistics, vol. 22, 1951.
    https://doi.org/10.1214/aoms/1177729586
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.SGD.html
    """

    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.01) -> None:
        params = dict(lr=lr)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        next_x = self.x - self.params["lr"] * self.function.grad(self.x)
        return self.move_next(next_x)
