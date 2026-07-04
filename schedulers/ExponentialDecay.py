from .Scheduler import Scheduler


class ExponentialDecay(Scheduler):
    """
    Экспоненциальное затухание скорости обучения.

    Формула: lr(t) = base_lr * gamma^t,
    где t — шаг с нуля.

    Первоисточник: достоверно не установлен — фольклорный приём.
    Каноническая современная формулировка — TensorFlow ExponentialDecay:
    https://www.tensorflow.org/api_docs/python/tf/keras/optimizers/schedules/ExponentialDecay
    Исторический ориентир (только библиография, текст о расписании
    не сверялся): LeCun Y., Bottou L., Bengio Y., Haffner P.
    "Gradient-based learning applied to document recognition".
    Proceedings of the IEEE 86(11), 1998.
    https://doi.org/10.1109/5.726791

    Адаптации относительно канонической формулировки: затухание
    применяется на каждом шаге (без периода decay_steps); gamma
    по умолчанию подобрана под прогон T=100 по правилу
    gamma = (lr_final / base_lr)^(1/T).
    """

    param_descriptions = {
        "gamma": "множитель скорости обучения за один шаг; правило подбора: gamma = (lr_final/base_lr)^(1/T), "
        "по умолчанию 0.955 — за 100 шагов скорость обучения падает примерно до 1% от базовой",
    }

    def __init__(self, gamma: float = 0.955) -> None:
        params = dict(gamma=gamma)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        return float(base_lr * self.params["gamma"] ** step)
