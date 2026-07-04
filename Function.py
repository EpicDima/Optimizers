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
            # Первоисточник (канонизирована как тест F1): De Jong. "An analysis of the behavior of a class
            # of genetic adaptive systems". PhD thesis, University of Michigan, 1975. doi:10.7302/10966
            "Функция сферы": StandardFunction("x^2 + y^2", (-5, 5, -5, 5), (-4, 4)),
            # Первоисточник: Branin. "Widely convergent method for finding multiple solutions of simultaneous
            # nonlinear equations". IBM J. Res. Dev. 16(5), 1972 (прил. C, ур. C15). doi:10.1147/rd.165.0504
            "Функция трёхгорбого верблюда": StandardFunction(
                "2 * x^2 - 1.05 * x^4 + x^6/6 + x*y + y^2", (-2, 2, -2, 2), (-1.6, 1.8)
            ),
            # Первоисточник: Ackley. "A Connectionist Machine for Genetic Hillclimbing".
            # Kluwer Academic Publishers, Boston, 1987. doi:10.1007/978-1-4613-1997-9
            "Функция Экли": StandardFunction(
                "-20 * exp(-0.2 * sqrt(0.5 * (x^2 + y^2))) - exp(0.5 * (cos(2 * pi * x) + cos(2 * pi * y))) + e + 20",
                (-5, 5, -5, 5),
                (4, -4),
            ),
            # Первоисточник: Rosenbrock. "An automatic method for finding the greatest or least value
            # of a function". The Computer Journal 3(3), 1960. doi:10.1093/comjnl/3.3.175
            "Функция Розенброка": StandardFunction("(1 - x)^2 + 100 * (y - x^2)^2", (-2, 2, -1, 3), (-1.2, 1)),
            # Первоисточник (общепринятая атрибуция, сам техотчёт онлайн недоступен): Beale. "On an iterative
            # method of finding a local minimum of a function of more than one variable". Tech. Rep. 25,
            # Statistical Techniques Research Group, Princeton University, 1958
            "Функция Била": StandardFunction(
                "(1.5 - x + x * y)^2 + (2.25 - x + x * y^2)^2 + (2.625 - x + x * y^3)^2", (-4.5, 4.5, -4.5, 4.5), (1, 1)
            ),
            # Первоисточник: Goldstein, Price. "On descent from local minima". Mathematics of
            # Computation 25(115), 1971. doi:10.1090/S0025-5718-1971-0312365-X
            "Функция Гольдштейна-Прайса": StandardFunction(
                "(1 + (x + y + 1)^2 * (19 - 14 * x + 3 * x^2 - 14 * y + 6 * x * y + 3*y^2)) * (30 + (2 * x - 3 * y)^2 * (18 - 32 * x + 12 * x^2 + 48 * y - 36 * x * y + 27 * y^2))",
                (-2, 2, -2, 2),
                (1.5, 1.5),
            ),
            # Первоисточник достоверно не установлен: традиционная связь с Booth (Quart. J. Mech. Appl.
            # Math. 2(4), 1949, doi:10.1093/qjmam/2.4.460) текстом не подтверждена; самое раннее
            # проверенное появление — тест-сеты 1990-х (Van Iwaarden 1996, Silagadze 2004)
            "Функция Бута": StandardFunction("(x + 2 * y - 7)^2 + (2 * x + y - 5)^2", (-10, 10, -10, 10), (-8, -8)),
            # Первоисточник: Bukin. "New Minimization Strategy for Non-Smooth Functions". Препринт ИЯФ 97-79,
            # Новосибирск, 1997 (функция f6). https://www.inp.nsk.su/images/preprint/1997_079.pdf
            "Функция Букина": StandardFunction(
                "100 * sqrt(abs(y - 0.01 * x^2)) + 0.01 * abs(x + 10)", (-15, -5, -3, 3), (-7, 2.5)
            ),
            # Первоисточник достоверно не установлен: традиционная ссылка на Matyas. "Random optimization"
            # (1965) текстом не подтверждена; самое раннее проверенное — тест-сет Jansson, Knuppel
            # (TR 94.1, TU Hamburg-Harburg, 1994)
            "Функция Матьяса": StandardFunction("0.26 * (x^2 + y^2) - 0.48 * x * y", (-10, 10, -10, 10), (-9, 9)),
            # Первоисточник (наша формула — задача Levy N.13 при n=2): Levy, Montalvo. "The Tunneling
            # Algorithm for the Global Minimization of Functions". SIAM J. Sci. Stat. Comput. 6(1), 1985.
            # doi:10.1137/0906002
            "Функция Леви": StandardFunction(
                "sin(3 * pi * x)^2 + (x - 1)^2 * (1 + sin(3 * pi * y)^2) + (y - 1)^2 * (1 + sin(2 * pi * y)^2)",
                (-10, 10, -10, 10),
                (-8, -8),
            ),
            # Первоисточник: Himmelblau. "Applied Nonlinear Programming". McGraw-Hill, 1972
            "Функция Химмельблау": StandardFunction("(x^2 + y - 11)^2 + (x + y^2 - 7)^2", (-5, 5, -5, 5), (0, 0)),
            # Первоисточник (двумерный оригинал): Растригин Л.А. "Системы экстремального управления".
            # М.: Наука, 1974 (обобщение на n измерений — Rudolph, 1990)
            "Функция Растригина": StandardFunction(
                "20 + (x^2 - 10 * cos(2 * pi * x)) + (y^2 - 10 * cos(2 * pi * y))",
                (-5.12, 5.12, -5.12, 5.12),
                (4.5, 4.5),
            ),
            # Первоисточник: Easom. "A survey of global optimization techniques". M.Eng. thesis,
            # University of Louisville, 1990
            "Функция Изома": StandardFunction(
                "-cos(x) * cos(y) * exp(-((x - pi)^2 + (y - pi)^2))", (0, 6, 0, 6), (2.5, 4)
            ),
            # Первоисточник: Mishra. "Some new test functions for global optimization and performance of
            # repulsive particle swarm method". MPRA Paper 2718 / SSRN 926132, 2006.
            # https://mpra.ub.uni-muenchen.de/2718/
            "Функция Cross-in-tray": StandardFunction(
                "-0.0001 * (abs(sin(x) * sin(y) * exp(abs(100 - (sqrt(x^2 + y^2) / pi)))) + 1)^0.1",
                (-10, 10, -10, 10),
                (6, 3),
            ),
            # Первоисточник: Mishra. "Some new test functions for global optimization and performance of
            # repulsive particle swarm method". MPRA 2718 / SSRN 926132, 2006 (Holder table; оригинальный
            # cos*cos-вариант, глобальные минимумы -26.92 в (+-9.646, +-9.646))
            "Функция Хольдера": StandardFunction(
                "-abs(cos(x) * cos(y) * exp(abs(1 - (sqrt(x^2 + y^2) / pi))))", (-10, 10, -10, 10), (5, 5)
            ),
            # Первоисточник достоверно не установлен: обычно приписывают McCormick (Math. Programming 10,
            # 1976, doi:10.1007/BF01580665), но наличие функции там не подтверждено; самое раннее
            # проверенное — сборники Adorio (2005) и Mishra (2006)
            "Функция МакКормика": StandardFunction(
                "sin(x + y) + (x - y)^2 - 1.5 * x + 2.5 * y + 1", (-1.5, 4, -3, 4), (3, 3)
            ),
            # Первоисточник: Styblinski, Tang. "Experiments in nonconvex optimization: stochastic approximation
            # with function smoothing and simulated annealing". Neural Networks 3(4), 1990.
            # doi:10.1016/0893-6080(90)90029-K
            "Функция Стыбинского-Танга": StandardFunction(
                "(x^4 - 16 * x^2 + 5 * x + y^4 - 16 * y^2 + 5 * y) / 2", (-5, 5, -5, 5), (1, 1)
            ),
            # Вариант "Schaffer N.2": впервые как "modified Schaffer function #2" у Mishra (2006, MPRA 2718);
            # прототип (F6): Schaffer, Caruana, Eshelman, Das. Proc. 3rd ICGA, 1989
            "Функция Шаффера": StandardFunction(
                "0.5 + (sin(x^2 - y^2)^2 - 0.5) / (1 + 0.001 * (x^2 + y^2))^2", (-5, 5, -5, 5), (-4, 2)
            ),
            # Вариант "Schaffer N.4": впервые как "modified Schaffer function #4" у Mishra (2006, MPRA 2718);
            # прототип (F6): Schaffer et al. Proc. 3rd ICGA, 1989
            "Функция Шаффера N4": StandardFunction(
                "0.5 + (cos(sin(abs(x^2 - y^2)))^2 - 0.5) / (1 + 0.001 * (x^2 + y^2))^2", (-5, 5, -5, 5), (-4, 2)
            ),
            # Первоисточник: Griewank. "Generalized descent for global optimization". Journal of
            # Optimization Theory and Applications 34(1), 1981. doi:10.1007/BF00933356
            "Функция Гривенка": StandardFunction(
                "1 + (x^2 + y^2) / 4000 - cos(x) * cos(y / sqrt(2))", (-8, 8, -8, 8), (7, 7)
            ),
            # Первоисточник достоверно не установлен; самое раннее найденное — обзор Molga, Smutnicki.
            # "Test functions for optimization needs", 2005
            "Функция Drop-Wave": StandardFunction(
                "-(1 + cos(12 * sqrt(x^2 + y^2))) / (2 + 0.5 * (x^2 + y^2))", (-5.12, 5.12, -5.12, 5.12), (-4, -4)
            ),
            # 1D-прототип: Shubert. "A sequential method seeking the global maximum of a function".
            # SIAM J. Numer. Anal. 9(3), 1972. doi:10.1137/0709036 (в оригинале сумма j*sin((j+1)x+j));
            # наша 2D-форма (произведение cos-сумм) — позднейшая, из работ Levy и соавт. (1982-1985)
            "Функция Шуберта": StandardFunction(
                "(cos(2*x + 1) + 2*cos(3*x + 2) + 3*cos(4*x + 3) + 4*cos(5*x + 4) + 5*cos(6*x + 5)) * (cos(2*y + 1) + 2*cos(3*y + 2) + 3*cos(4*y + 3) + 4*cos(5*y + 4) + 5*cos(6*y + 5))",
                (-5.12, 5.12, -5.12, 5.12),
                (0, 0),
            ),
            # Классическая поверхность (гиперболический параболоид); первоисточника как тестовой функции нет
            "Седловая функция": StandardFunction("x^2 - y^2", (-5, 5, -5, 5), (4, 0.01)),
            # Классическая поверхность ("monkey saddle"); термин популяризован в кн.: Hilbert, Cohn-Vossen.
            # "Anschauliche Geometrie", Springer, 1932 (англ. "Geometry and the Imagination", 1952)
            "Обезьянье седло": StandardFunction("x^3 - 3*x*y^2", (-2, 2, -2, 2), (1.2, 0.01)),
            # Первоисточник (тест-набор Dixon-Szego): Dixon, Szego (eds.). "Towards Global Optimisation 2".
            # North-Holland, 1978 (атрибуция по вторичным источникам; текст книги недоступен)
            "Функция шестигорбого верблюда": StandardFunction(
                "4*x^2 - 2.1*x^4 + x^6/3 + x*y - 4*y^2 + 4*y^4", (-2, 2, -1.5, 1.5), (-1.7, 1.2)
            ),
            # Первоисточник достоверно не установлен ("Zakharov" не прослеживается); самое раннее найденное
            # употребление — Siarry et al. ACM TOMS 23(2), 1997. doi:10.1145/264029.264043
            "Функция Захарова": StandardFunction(
                "x^2 + y^2 + (0.5*x + y)^2 + (0.5*x + y)^4", (-2, 2, -2, 2), (-1.5, 1.8)
            ),
            # Первоисточник: Schwefel. "Numerische Optimierung von Computer-Modellen mittels der
            # Evolutionsstrategie". Birkhauser, 1977 (англ. "Numerical Optimization of Computer Models",
            # Wiley, 1981); слагаемое 418.9829 * n — поздняя нормировка
            "Функция Швефеля": StandardFunction(
                "418.9829 * 2 - x * sin(sqrt(abs(x))) - y * sin(sqrt(abs(y)))", (-500, 500, -500, 500), (-100, -100)
            ),
            # Первоисточник: Whitley, Rana, Dzubera, Mathias. "Evaluating evolutionary algorithms".
            # Artificial Intelligence 85, 1996 (функция F101; имя "Eggholder" закрепилось позже).
            # doi:10.1016/0004-3702(95)00124-7
            "Функция Eggholder": StandardFunction(
                "-(y + 47) * sin(sqrt(abs(x / 2 + y + 47))) - x * sin(sqrt(abs(x - y - 47)))",
                (-512, 512, -512, 512),
                (0, 0),
            ),
            # Первоисточник: Shekel. "Test functions for multimodal search techniques". Proc. 5th Princeton
            # Conf. on Information Science and Systems, 1971 (оригинал 4-мерный; здесь 2D-вариант с 5 ямами)
            "Функция Шекеля": StandardFunction(
                "-1/(0.1 + (x - 4)^2 + (y - 4)^2) - 1/(0.2 + (x - 1)^2 + (y - 1)^2) - 1/(0.2 + (x - 8)^2 + (y - 8)^2) - 1/(0.4 + (x - 6)^2 + (y - 6)^2) - 1/(0.4 + (x - 3)^2 + (y - 7)^2)",
                (0, 10, 0, 10),
                (2.5, 2.5),
            ),
            # Первоисточник: Mishra. "Some new test functions for global optimization and performance of
            # repulsive particle swarm method". MPRA 2718 / SSRN 926132, 2006 (Bird function; наша область —
            # от позднейшего constrained-варианта)
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
        self._minima: np.ndarray | None = None

    @property
    def minima(self) -> np.ndarray:
        """Все глобальные минимумы функции в текущей области, по точке в строке."""
        if self._minima is None:
            self._minima = self.find_minima()
        return self._minima

    def find_minima(self) -> np.ndarray:
        candidates = self.grid_minima_candidates()
        if len(candidates) == 0:
            return np.empty((0, 2))
        # вырожденный случай (плато: значительная часть узлов — «минимумы»);
        # уточнять их все бессмысленно, остаётся один узел argmin, как раньше
        if len(candidates) > 1000:
            idx = np.unravel_index(np.argmin(self.y), self.y.shape)
            return np.array([[self.x[0][idx], self.x[1][idx]]])
        points = [self.refine_minimum(p) for p in candidates]
        values = np.array([float(self.fx(p)) for p in points])
        best = values.min()
        # глобальными считаются все минимумы, совпадающие с лучшим найденным
        # с точностью до численной погрешности уточнения
        tolerance = 1e-6 * max(abs(best), 1.0)
        return self.deduplicate([p for p, v in zip(points, values) if v <= best + tolerance])

    def grid_minima_candidates(self) -> np.ndarray:
        # узлы сетки поверхности, не превосходящие всех восьми соседей
        # (граница дополняется бесконечностью, чтобы учесть краевые минимумы)
        padded = np.pad(self.y.astype(float), 1, constant_values=np.inf)
        n, m = self.y.shape
        is_min = np.ones((n, m), dtype=bool)
        for di in (0, 1, 2):
            for dj in (0, 1, 2):
                if di == 1 and dj == 1:
                    continue
                is_min &= self.y <= padded[di : di + n, dj : dj + m]
        rows, cols = np.nonzero(is_min)
        return np.stack([self.x[0][rows, cols], self.x[1][rows, cols]], axis=1)

    def refine_minimum(self, point: np.ndarray) -> np.ndarray:
        # уточнение узла сетки до настоящего минимума: шаг Ньютона, пока
        # гессиан положительно определён, иначе градиентный спуск; бэктрекинг
        # с проекцией в область не даёт ни выйти за границы, ни подняться
        low = np.array([self.from_x, self.from_y], dtype=float)
        high = np.array([self.to_x, self.to_y], dtype=float)
        span = max(self.to_x - self.from_x, self.to_y - self.from_y)
        point = point.astype(float)
        value = float(self.fx(point))
        for _ in range(100):
            gradient = self.grad(point)
            hessian = self.hesse(point)
            determinant = hessian[0, 0] * hessian[1, 1] - hessian[0, 1] * hessian[1, 0]
            if hessian[0, 0] > 0 and determinant > 0:
                step = -np.linalg.solve(hessian, gradient)
            else:
                step = -gradient
            norm = float(np.linalg.norm(step))
            if not np.isfinite(norm) or norm == 0:
                break
            if norm > span:
                step *= span / norm
            # бэктрекинг: найти первый улучшающий масштаб шага, а затем
            # продолжать половинить, пока становится ещё лучше — иначе на
            # границе области спуск зигзагом топчется около минимума
            scale = 1.0
            new_point, new_value = point, value
            for _ in range(40):
                trial_point = np.clip(point + scale * step, low, high)
                trial_value = float(self.fx(trial_point))
                if trial_value < new_value:
                    new_point, new_value = trial_point, trial_value
                elif new_value < value:
                    break
                scale *= 0.5
            if new_value >= value:
                break
            moved = float(np.linalg.norm(new_point - point))
            point, value = new_point, new_value
            if moved < 1e-10 * span:
                break
        return point

    def deduplicate(self, points: list[np.ndarray]) -> np.ndarray:
        # соседние узлы одного бассейна уточняются в одну и ту же точку —
        # совпавшие сливаются
        span = max(self.to_x - self.from_x, self.to_y - self.from_y)
        unique: list[np.ndarray] = []
        for point in points:
            if all(float(np.linalg.norm(point - other)) > 1e-4 * span for other in unique):
                unique.append(point)
        return np.array(unique)

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
