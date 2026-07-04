import ast
import re
from collections.abc import Callable
from typing import Any, NamedTuple

import numpy as np

# Имена из numpy, разрешённые в формулах: универсальные функции (sin, cos, exp, sqrt, abs...)
# и математические константы
_ALLOWED_NP_NAMES = {name for name, obj in np.__dict__.items() if isinstance(obj, np.ufunc)} | {"pi", "e", "inf"}

_ALLOWED_BINOPS = (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow, ast.Mod, ast.FloorDiv)
_ALLOWED_UNARYOPS = (ast.UAdd, ast.USub)


class StandardFunction(NamedTuple):
    """Предустановка: формула, область (from_x, to_x, from_y, to_y) и стартовая точка."""

    formula: str
    range: tuple[float, float, float, float]
    start: tuple[float, float]


def _is_np_attribute(node: ast.AST) -> bool:
    return (
        isinstance(node, ast.Attribute)
        and isinstance(node.value, ast.Name)
        and node.value.id == "np"
        and node.attr in _ALLOWED_NP_NAMES
    )


def _is_allowed_node(node: ast.AST) -> bool:
    if isinstance(node, ast.Constant):
        return isinstance(node.value, (int, float))
    if isinstance(node, ast.BinOp):
        return isinstance(node.op, _ALLOWED_BINOPS) and _is_allowed_node(node.left) and _is_allowed_node(node.right)
    if isinstance(node, ast.UnaryOp):
        return isinstance(node.op, _ALLOWED_UNARYOPS) and _is_allowed_node(node.operand)
    if isinstance(node, ast.Call):
        return _is_np_attribute(node.func) and not node.keywords and all(_is_allowed_node(arg) for arg in node.args)
    if isinstance(node, ast.Attribute):
        return _is_np_attribute(node)
    if isinstance(node, ast.Subscript):
        return (
            isinstance(node.value, ast.Name)
            and node.value.id == "x"
            and isinstance(node.slice, ast.Constant)
            and node.slice.value in (0, 1)
        )
    if isinstance(node, ast.Name):
        return node.id == "x"
    return False


class Function:
    def __init__(self) -> None:

        self.from_x = -5
        self.to_x = 5
        self.from_y = -5
        self.to_y = 5

        self.count = 200

        self.for_replace = "+-*/()"
        self.re_replace = "".join(["\\" + i + "|" for i in self.for_replace[:-1]]) + "\\" + self.for_replace[-1]

        # у каждой предустановки своя область, где виден её рельеф,
        # и стартовая точка, с которой поведение оптимизаторов интереснее всего
        self.standard_functions = {
            "Функция сферы": StandardFunction("x^2 + y^2", (-5, 5, -5, 5), (-4, 4)),
            "Функция трёхгорбого верблюда": StandardFunction(
                "2 * x^2 - 1.05 * x^4 + x^6/6 + x*y + y^2", (-2, 2, -2, 2), (-1.6, 1.8)
            ),
            "Функция Экли": StandardFunction(
                "-20 * exp(-0.2 * sqrt(0.5 * (x^2 + y^2))) - exp(0.5 * (cos(2 * pi * x) + cos(2 * pi * y))) + e + 20",
                (-5, 5, -5, 5),
                (4, -4),
            ),
            "Функция Розенброка": StandardFunction("(1 - x)^2 + 100 * (y - x^2)^2", (-2, 2, -1, 3), (-1.2, 1)),
            "Функция Била": StandardFunction(
                "(1.5 - x + x * y)^2 + (2.25 - x + x * y^2)^2 + (2.625 - x + x * y^3)^2", (-4.5, 4.5, -4.5, 4.5), (1, 1)
            ),
            "Функция Гольдштейна-Прайса": StandardFunction(
                "(1 + (x + y + 1)^2 * (19 - 14 * x + 3 * x^2 - 14 * y + 6 * x * y + 3*y^2)) * (30 + (2 * x - 3 * y)^2 * (18 - 32 * x + 12 * x^2 + 48 * y - 36 * x * y + 27 * y^2))",
                (-2, 2, -2, 2),
                (1.5, 1.5),
            ),
            "Функция Бута": StandardFunction("(x + 2 * y - 7)^2 + (2 * x + y - 5)^2", (-10, 10, -10, 10), (-8, -8)),
            "Функция Букина": StandardFunction(
                "100 * sqrt(abs(y - 0.01 * x^2)) + 0.01 * abs(x + 10)", (-15, -5, -3, 3), (-7, 2.5)
            ),
            "Функция Матьяса": StandardFunction("0.26 * (x^2 + y^2) - 0.48 * x * y", (-10, 10, -10, 10), (-9, 9)),
            "Функция Леви": StandardFunction(
                "sin(3 * pi * x)^2 + (x - 1)^2 * (1 + sin(3 * pi * y)^2) + (y - 1)^2 * (1 + sin(2 * pi * y)^2)",
                (-10, 10, -10, 10),
                (-8, -8),
            ),
            "Функция Химмельблау": StandardFunction("(x^2 + y - 11)^2 + (x + y^2 - 7)^2", (-5, 5, -5, 5), (0, 0)),
            "Функция Растригина": StandardFunction(
                "20 + (x^2 - 10 * cos(2 * pi * x)) + (y^2 - 10 * cos(2 * pi * y))",
                (-5.12, 5.12, -5.12, 5.12),
                (4.5, 4.5),
            ),
            "Функция Изома": StandardFunction(
                "-cos(x) * cos(y) * exp(-((x - pi)^2 + (y - pi)^2))", (0, 6, 0, 6), (2.5, 4)
            ),
            "Функция Cross-in-tray": StandardFunction(
                "-0.0001 * (abs(sin(x) * sin(y) * exp(abs(100 - (sqrt(x^2 + y^2) / pi)))) + 1)^0.1",
                (-10, 10, -10, 10),
                (6, 3),
            ),
            "Функция Хольдера": StandardFunction(
                "-abs(sin(x) * cos(y) * exp(abs(1 - (sqrt(x^2 + y^2) / pi))))", (-10, 10, -10, 10), (1, 1)
            ),
            "Функция МакКормика": StandardFunction(
                "sin(x + y) + (x - y)^2 - 1.5 * x + 2.5 * y + 1", (-1.5, 4, -3, 4), (3, 3)
            ),
            "Функция Стыбинского-Танга": StandardFunction(
                "(x^4 - 16 * x^2 + 5 * x + y^4 - 16 * y^2 + 5 * y) / 2", (-5, 5, -5, 5), (1, 1)
            ),
            "Функция Шаффера": StandardFunction(
                "0.5 + (sin(x^2 - y^2)^2 - 0.5) / (1 + 0.001 * (x^2 + y^2))^2", (-5, 5, -5, 5), (-4, 2)
            ),
            "Функция Шаффера N4": StandardFunction(
                "0.5 + (cos(sin(abs(x^2 - y^2)))^2 - 0.5) / (1 + 0.001 * (x^2 + y^2))^2", (-5, 5, -5, 5), (-4, 2)
            ),
            "Функция Гривенка": StandardFunction(
                "1 + (x^2 + y^2) / 4000 - cos(x) * cos(y / sqrt(2))", (-8, 8, -8, 8), (7, 7)
            ),
            "Функция Drop-Wave": StandardFunction(
                "-(1 + cos(12 * sqrt(x^2 + y^2))) / (2 + 0.5 * (x^2 + y^2))", (-5.12, 5.12, -5.12, 5.12), (-4, -4)
            ),
            "Функция Шуберта": StandardFunction(
                "(cos(2*x + 1) + 2*cos(3*x + 2) + 3*cos(4*x + 3) + 4*cos(5*x + 4) + 5*cos(6*x + 5)) * (cos(2*y + 1) + 2*cos(3*y + 2) + 3*cos(4*y + 3) + 4*cos(5*y + 4) + 5*cos(6*y + 5))",
                (-5.12, 5.12, -5.12, 5.12),
                (0, 0),
            ),
            "Седловая функция": StandardFunction("x^2 - y^2", (-5, 5, -5, 5), (4, 0.01)),
            "Обезьянье седло": StandardFunction("x^3 - 3*x*y^2", (-2, 2, -2, 2), (1.2, 0.01)),
            "Функция шестигорбого верблюда": StandardFunction(
                "4*x^2 - 2.1*x^4 + x^6/3 + x*y - 4*y^2 + 4*y^4", (-2, 2, -1.5, 1.5), (-1.7, 1.2)
            ),
            "Функция Захарова": StandardFunction(
                "x^2 + y^2 + (0.5*x + y)^2 + (0.5*x + y)^4", (-2, 2, -2, 2), (-1.5, 1.8)
            ),
            "Функция Швефеля": StandardFunction(
                "418.9829 * 2 - x * sin(sqrt(abs(x))) - y * sin(sqrt(abs(y)))", (-500, 500, -500, 500), (-100, -100)
            ),
            "Функция Eggholder": StandardFunction(
                "-(y + 47) * sin(sqrt(abs(x / 2 + y + 47))) - x * sin(sqrt(abs(x - y - 47)))",
                (-512, 512, -512, 512),
                (0, 0),
            ),
            "Функция Шекеля": StandardFunction(
                "-1/(0.1 + (x - 4)^2 + (y - 4)^2) - 1/(0.2 + (x - 1)^2 + (y - 1)^2) - 1/(0.2 + (x - 8)^2 + (y - 8)^2) - 1/(0.4 + (x - 6)^2 + (y - 6)^2) - 1/(0.4 + (x - 3)^2 + (y - 7)^2)",
                (0, 10, 0, 10),
                (2.5, 2.5),
            ),
            "Функция Мишры-Бёрда": StandardFunction(
                "sin(y) * exp((1 - cos(x))^2) + cos(x) * exp((1 - sin(y))^2) + (x - y)^2",
                (-10, 0, -6.5, 0),
                (-8, -4),
            ),
        }

        self.raw_str_fx = self.standard_functions["Функция сферы"].formula
        self.str_fx = self.convert(self.raw_str_fx)

        self.create_surface()

        self.eps = 1e-05
        # для вторых производных нужен шаг покрупнее, иначе шум float64 забивает результат
        self.hesse_eps = 1e-04
        self.double_eps = 2 * self.eps
        self.eps1 = np.array([self.eps, 0])
        self.eps2 = np.array([0, self.eps])

        self.grad1 = lambda x, f: (f(x + self.eps1) - f(x - self.eps1)) / self.double_eps
        self.grad2 = lambda x, f: (f(x + self.eps2) - f(x - self.eps2)) / self.double_eps

    def create_surface(self) -> None:
        mesh_x = np.linspace(self.from_x, self.to_x, self.count)
        mesh_y = np.linspace(self.from_y, self.to_y, self.count)
        self.x = np.array(np.meshgrid(mesh_x, mesh_y))
        self.reset_fx()

    def get_params(self) -> tuple[float, float, float, float, int]:
        return (self.from_x, self.to_x, self.from_y, self.to_y, self.count)

    def set_params(self, values) -> None:
        self.from_x, self.to_x, self.from_y, self.to_y, self.count = values

    def __call__(self, x: np.ndarray) -> Any:
        return self.fx(x)

    def compile_fx(self, str_fx: str) -> Callable[[np.ndarray], Any]:
        """Компилирует выражение вида "x[0]**2 + np.sin(x[1])" в функцию от точки x.

        Выражение проверяется по белому списку узлов AST, исполняется без builtins,
        поэтому произвольный код через поле ввода функции выполнить нельзя.
        """
        tree = ast.parse(str_fx, mode="eval")
        if not _is_allowed_node(tree.body):
            raise ValueError(f"недопустимое выражение: {str_fx}")
        code = compile(tree, "<function>", "eval")
        return lambda x: eval(code, {"__builtins__": {}, "np": np}, {"x": x})

    def reset_fx(self) -> None:
        self.fx = self.compile_fx(self.str_fx)
        self.y = self.fx(self.x)

    def grad(self, x: np.ndarray) -> np.ndarray:
        x = x.flatten()
        return np.array([self.grad1(x, self.fx), self.grad2(x, self.fx)])

    def hesse(self, x: np.ndarray) -> np.ndarray:
        x = x.flatten()
        f = self.fx
        h = self.hesse_eps
        e1 = np.array([h, 0.0])
        e2 = np.array([0.0, h])
        fxx = (f(x + e1) - 2 * f(x) + f(x - e1)) / h**2
        fyy = (f(x + e2) - 2 * f(x) + f(x - e2)) / h**2
        fxy = (f(x + e1 + e2) - f(x + e1 - e2) - f(x - e1 + e2) + f(x - e1 - e2)) / (4 * h**2)
        return np.array([[fxx, fxy], [fxy, fyy]])

    def convert(self, s: str) -> str:
        chars = []
        for i in s:
            if i in self.for_replace:
                chars.append(i)

        s0 = re.split(self.re_replace, s)

        for idx, i in enumerate(s0):
            t = i.strip()
            if t in np.__dict__:
                s0[idx] = s0[idx].replace(t, "np." + t)
            else:
                s0[idx] = s0[idx].replace("x", "x[0]")
                s0[idx] = s0[idx].replace("y", "x[1]")

        s1 = ""
        for idx, i in enumerate(s0[:-1]):
            s1 += i + chars[idx]
        s1 += s0[-1]
        return s1.replace("^", "**")

    def check_function(self, s: str) -> int:
        if self.raw_str_fx == s:
            return 1
        try:
            s1 = self.convert(s)
            self.compile_fx(s1)(np.array([0, 0]))
        except Exception:
            return 0
        self.raw_str_fx = s
        self.str_fx = s1
        self.reset_fx()
        return 2
