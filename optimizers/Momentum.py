from .Optimizer import Optimizer, np


class Momentum(Optimizer):
    """
    Класс Momentum - Момент

    Наследуется от базового класса Optimizer

    """

    def __init__(self, initial_x, function, lr=0.01, coef=0.9):
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


    def next_point(self):
        """
        Реализованный метод next_point, в котором рассчитывается новое положение точки
        """
        
        self.v = self.params["coef"] * self.v + self.function.grad(self.x)
        next_x = self.x - self.params["lr"] * self.v
        return self.move_next(next_x) # обязательная конструкция с методом move_next


    def reset(self):
        """
        Метод reset просто сбрасывает текущее значение точки к начальному
        """

        # обязательный вызов базового метода reset, если есть и другие переменные
        super().reset()

        # установление начального значения переменной v (скорости)
        self.v = np.zeros([2])