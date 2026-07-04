from typing import TYPE_CHECKING, ClassVar

import numpy as np  # noqa: F401  # реэкспортируется в дочерние оптимизаторы

if TYPE_CHECKING:
    from Function import Function


class Optimizer:
    """
    Класс Optimizer - Оптимизатор

    Является базовым классом для всех оптимизаторов.
    Каждый оптимизатор обязан наследоваться от этого класса,
    а также реализовать метод next_point.

    Дочерний оптимизатор описывает смысл своих параметров в словаре
    param_descriptions (ключи совпадают с params) — GUI показывает
    эти описания как подсказки к полям ввода.
    """

    param_descriptions: ClassVar[dict[str, str]] = {}

    def __init__(self, initial_x: np.ndarray, function: Function, params: dict[str, float]) -> None:
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

    def next_point(self) -> tuple[np.ndarray, float]:
        """
        Метод next_point, в котором рассчитывается новое положение точки.
        Каждый дочерний оптимизатор обязан реализовать этот метод
        """

        raise NotImplementedError

    def move_next(self, next_x: np.ndarray) -> tuple[np.ndarray, float]:
        """
        Метод move_next, возвращает значение точки и значение функции в этой точке
        """

        self.x = next_x.flatten()
        return self.x, self.function(self.x)

    def reset(self) -> None:
        """
        Метод reset просто сбрасывает текущее значение точки к начальному
        """

        self.x = self.initial_x
