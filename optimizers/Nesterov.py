from .Optimizer import Optimizer, np


class Nesterov(Optimizer):
    """
    Nesterov — градиентный спуск с моментом Нестерова (ускоренный градиентный метод).

    Первоисточник: Нестеров Ю.Е. "Метод решения задачи выпуклого программирования
    со скоростью сходимости O(1/k^2)". Доклады АН СССР, 269(3), 1983, с. 543-547.
    https://www.mathnet.ru/php/archive.phtml?wshow=paper&jrnid=dan&paperid=46009&option_lang=rus
    Практическая формулировка через момент для обучения нейросетей:
    Sutskever I., Martens J., Dahl G., Hinton G. "On the importance of initialization and momentum
    in deep learning". Proceedings of the 30th International Conference on Machine Learning (ICML), 2013.
    https://proceedings.mlr.press/v28/sutskever13.html
    Реализация следует алгоритму из документации PyTorch (torch.optim.SGD с nesterov=True:
    градиент берётся в текущей точке, x = x - lr * (grad + coef * v) — упрощение формулировки Сутскевера):
    https://docs.pytorch.org/docs/stable/generated/torch.optim.SGD.html
    """

    v: np.ndarray

    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.01, coef: float = 0.9) -> None:
        params = dict(lr=lr, coef=coef)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.v = self.params["coef"] * self.v + gradient
        next_x = self.x - self.params["lr"] * (gradient + self.params["coef"] * self.v)
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.v = np.zeros([2])
