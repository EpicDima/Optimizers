from .Optimizer import Optimizer, np


class Shampoo(Optimizer):
    """
    Оптимизатор Shampoo (предобусловливание полной матрицей вторых моментов градиента).

    Первоисточник: Gupta V., Koren T., Singer Y. "Shampoo: Preconditioned
    Stochastic Tensor Optimization". 2018.
    https://arxiv.org/abs/1802.09568

    Для векторного параметра (тензор ранга 1, наш случай из двух переменных)
    Shampoo из статьи в точности совпадает с полноматричным AdaGrad:
    H_t = H_{t-1} + g g^T, шаг -lr * H_t^{-1/2} g. В отличие от диагонального
    Adagrad матрица предобусловливания 2x2 учитывает корреляцию координат градиента
    и подстраивается под ориентацию оврага функции.
    """

    param_descriptions = {
        "lr": "скорость обучения — масштаб шага",
        "eps": "добавка eps*I к накопителю перед обращением — численная защита собственных значений",
    }

    h: np.ndarray

    def __init__(self, initial_x: np.ndarray, function, lr: float = 0.5, eps: float = 1e-06) -> None:
        params = dict(lr=lr, eps=eps)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)
        self.h = self.h + np.outer(gradient, gradient)
        # обратный корень симметричной матрицы 2x2 через спектральное разложение;
        # eps * I гарантирует положительность собственных значений
        eigenvalues, eigenvectors = np.linalg.eigh(self.h + self.params["eps"] * np.eye(2))
        inv_sqrt_h = eigenvectors @ np.diag(1 / np.sqrt(eigenvalues)) @ eigenvectors.T
        next_x = self.x - self.params["lr"] * inv_sqrt_h @ gradient
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.h = np.zeros([2, 2])
