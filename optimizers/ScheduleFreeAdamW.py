from .Optimizer import Optimizer, np


class ScheduleFreeAdamW(Optimizer):
    """
    Оптимизатор Schedule-Free AdamW.

    Первоисточник: Defazio et al. "The Road Less Scheduled". 2024.
    https://arxiv.org/abs/2405.15682
    """

    param_descriptions = {
        "lr": "скорость обучения — масштаб шага быстрой последовательности z",
        "beta1": "вес усреднённой точки x_avg при выборе точки y, в которой считается градиент (аналог момента)",
        "beta2": "коэффициент EMA второго момента (квадратов градиента) для адаптивного масштаба шага",
        "eps": "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно",
        "weight_decay": "затухание весов (в градиент в точке y) — тянет точку к началу координат, искажая минимизируемую функцию",
    }

    z: np.ndarray
    x_avg: np.ndarray
    v: np.ndarray
    t: int

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        lr: float = 0.1,
        beta1: float = 0.9,
        beta2: float = 0.999,
        eps: float = 1e-08,
        weight_decay: float = 0.0,
    ) -> None:
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps, weight_decay=weight_decay)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        self.t += 1
        # градиент считается в промежуточной точке y между быстрой z и средней x_avg
        y = (1 - self.params["beta1"]) * self.z + self.params["beta1"] * self.x_avg
        gradient = self.function.grad(y) + self.params["weight_decay"] * y
        self.v = self.params["beta2"] * self.v + (1 - self.params["beta2"]) * gradient**2
        denom = np.sqrt(self.v / (1 - self.params["beta2"] ** self.t)) + self.params["eps"]
        self.z = self.z - self.params["lr"] * gradient / denom
        # равномерное усреднение c_{t+1} = 1 / (t + 1); в статье веса lr^2,
        # но при постоянном lr это одно и то же
        c = 1 / self.t
        self.x_avg = (1 - c) * self.x_avg + c * self.z
        # наружу отдаётся именно усреднённая последовательность — она и рисуется на графике
        return self.move_next(self.x_avg)

    def reset(self) -> None:
        super().reset()
        # np.asarray: GUI создаёт оптимизатор со стартовой точкой-списком, у которого нет astype
        self.z = np.asarray(self.initial_x, dtype=float)
        self.x_avg = np.asarray(self.initial_x, dtype=float)
        self.v = np.zeros([2])
        self.t = 0
