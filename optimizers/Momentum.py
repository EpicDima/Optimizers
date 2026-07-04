from .Optimizer import Optimizer, np


class Momentum(Optimizer):
    """
    Класс Momentum - Момент

    Наследуется от базового класса Optimizer

    Градиентный спуск с моментом (метод «тяжёлого шарика»): накапливает скорость по прошлым градиентам.

    Первоисточник: Polyak B.T. "Some methods of speeding up the convergence of iteration methods".
    USSR Computational Mathematics and Mathematical Physics, 4(5), 1964.
    https://doi.org/10.1016/0041-5553(64)90137-5
    Реализация следует алгоритму из документации PyTorch (torch.optim.SGD с momentum > 0:
    v = coef * v + grad; x = x - lr * v — формулировка PyTorch, а не исходная формула Поляка,
    где lr умножается на градиент внутри обновления скорости):
    https://docs.pytorch.org/docs/stable/generated/torch.optim.SGD.html
    """

    v: np.ndarray

    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.01, coef: float = 0.9) -> None:
        """
        Конструктор класса Momentum

        initial_x - начальное расположение точки
        function - экземпляр класса Function (функция)
        lr - скорость обучения (learning rate)
        coef - коэффициент затухания скорости

        """

        # создание словаря параметров
        params = dict(lr=lr, coef=coef)

        # вызов конструктора базового класса
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        """
        Реализованный метод next_point, в котором рассчитывается новое положение точки
        """

        self.v = self.params["coef"] * self.v + self.function.grad(self.x)
        next_x = self.x - self.params["lr"] * self.v
        return self.move_next(next_x)  # обязательная конструкция с методом move_next

    def reset(self) -> None:
        """
        Метод reset просто сбрасывает текущее значение точки к начальному
        """

        # обязательный вызов базового метода reset, если есть и другие переменные
        super().reset()

        # установление начального значения переменной v (скорости)
        self.v = np.zeros([2])
