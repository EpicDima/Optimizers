from .Optimizer import Optimizer, np


class LBFGS(Optimizer):
    """
    Классический L-BFGS с двухцикловой рекурсией.

    В отличие от PyTorch, где step(closure) делает много внутренних итераций,
    здесь один вызов next_point() — одна итерация: обновление истории пар
    (s, y), вычисление направления d = -H·g и backtracking line search
    по условию Армихо.
    """

    s_history: list[np.ndarray]
    y_history: list[np.ndarray]
    prev_x: np.ndarray | None
    prev_gradient: np.ndarray | None

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 1.0,
        history_size: float = 10,
        c1: float = 0.0001,
        tau: float = 0.5,
        max_ls_steps: float = 20,
    ) -> None:
        params = dict(lr=lr, history_size=history_size, c1=c1, tau=tau, max_ls_steps=max_ls_steps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)

        self.update_history(gradient)
        self.prev_x = self.x
        self.prev_gradient = gradient

        # вырожденные случаи: минимум уже найден или градиент не определён
        if not np.all(np.isfinite(gradient)) or np.linalg.norm(gradient) < 1e-12:
            return self.move_next(self.x)

        direction = self.compute_direction(gradient)
        if not np.all(np.isfinite(direction)) or np.dot(gradient, direction) >= 0:
            # направление не определено или не является направлением спуска —
            # откатываемся на антиградиент
            direction = -gradient

        return self.move_next(self.line_search(direction, gradient))

    def update_history(self, gradient: np.ndarray) -> None:
        if self.prev_x is None or self.prev_gradient is None:
            return

        s = self.x - self.prev_x
        y = gradient - self.prev_gradient
        sy = np.dot(s, y)

        # защита от отрицательной кривизны: такая пара сломала бы
        # положительную определённость аппроксимации гессиана
        if not np.isfinite(sy) or sy <= 1e-10:
            return

        self.s_history.append(s)
        self.y_history.append(y)
        history_size = max(int(self.params["history_size"]), 1)
        while len(self.s_history) > history_size:
            self.s_history.pop(0)
            self.y_history.pop(0)

    def compute_direction(self, gradient: np.ndarray) -> np.ndarray:
        # пустая история — обычный градиентный спуск
        if not self.s_history:
            return -gradient

        # two-loop recursion: d = -H·g без явного хранения матрицы H
        q = gradient.copy()
        rhos = []
        alphas = []
        for s, y in zip(reversed(self.s_history), reversed(self.y_history)):
            rho = 1 / np.dot(y, s)
            alpha = rho * np.dot(s, q)
            q -= alpha * y
            rhos.append(rho)
            alphas.append(alpha)

        # начальное приближение H0 = gamma * I по последней паре
        s, y = self.s_history[-1], self.y_history[-1]
        r = np.dot(s, y) / np.dot(y, y) * q

        for s, y, rho, alpha in zip(self.s_history, self.y_history, reversed(rhos), reversed(alphas)):
            beta = rho * np.dot(y, r)
            r += (alpha - beta) * s

        return -r

    def line_search(self, direction: np.ndarray, gradient: np.ndarray) -> np.ndarray:
        # backtracking по условию Армихо: уменьшаем шаг, пока функция
        # не уменьшится хотя бы на c1 * t * (g·d)
        f0 = self.function(self.x)
        slope = np.dot(gradient, direction)

        t = self.params["lr"]
        for _ in range(max(int(self.params["max_ls_steps"]), 1)):
            next_x = self.x + t * direction
            value = self.function(next_x)
            if np.isfinite(value) and value <= f0 + self.params["c1"] * t * slope:
                return next_x
            t *= self.params["tau"]

        # подходящий шаг не найден — остаёмся на месте
        return self.x

    def reset(self) -> None:
        super().reset()
        self.s_history = []
        self.y_history = []
        self.prev_x = None
        self.prev_gradient = None
