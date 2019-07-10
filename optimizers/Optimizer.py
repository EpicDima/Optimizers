import numpy as np


class Optimizer:
    """
    Класс Optimizer - Оптимизатор
    
    Является базовым классом для всех оптимизаторов.
    Каждый оптимизатор обязан наследоваться от этого класса,
    а также реализовать метод next_point.
    
    """

    def __init__(self, initial_x, function, params):
        """
        Конструктор класса Optimizer

        initial_x - начальное расположение точки
        function - экземпляр класса Function (функция)
        params - параметры, используемые конкретным оптимизатором

        Класс Function имеет два важных метода для оптимизаторов:
          1) function.grad(x) - возвращает градиент функции в данной точке
          2) function(x) - возвращает значение функции в данной точке

        """

        self.initial_x = initial_x
        self.function = function
        self.params = params
        
        self.reset()


    def next_point(self):
        """
        Метод next_point, в котором рассчитывается новое положение точки.
        Каждый дочерний оптимизатор обязан реализовать этот метод
        """

        raise NotImplementedError


    def move_next(self, next_x):
        """
        Метод move_next, возвращает значение точки и значение функции в этой точке
        """

        self.x = next_x.flatten()
        return self.x, self.function(self.x)


    def reset(self):
        """
        Метод reset просто сбрасывает текущее значение точки к начальному
        """

        self.x = self.initial_x