from .Scheduler import Scheduler, np


class CosineAnnealing(Scheduler):
    """
    Косинусное затухание скорости обучения (одна дуга, без рестартов).

    Первоисточник: Loshchilov I., Hutter F. "SGDR: Stochastic Gradient
    Descent with Warm Restarts". ICLR 2017.
    https://arxiv.org/abs/1608.03983
    Уравнение (5): η_t = η_min + 0.5·(η_max − η_min)·(1 + cos(π·T_cur/T_i)).
    Наш вариант — один цикл длиной в весь прогон, без рестартов.

    Формула (t — шаг с нуля, T — полное число шагов):
    lr(t) = base_lr * (min_factor + 0.5 * (1 - min_factor) * (1 + cos(pi * t / (T - 1)))).
    Скорость обучения плавно спадает от base_lr на первом шаге
    до base_lr * min_factor на последнем.

    Адаптации относительно оригинала: в статье T_cur измеряется в эпохах
    и дробно обновляется на каждом батче — пошаговая запись эквивалентна;
    нижняя граница задаётся не абсолютным η_min, а долей min_factor
    от базовой скорости обучения.
    """

    param_descriptions = {
        "min_factor": "нижняя граница скорости обучения как доля от базовой (0 — затухание до нуля)",
    }

    def __init__(self, min_factor: float = 0.0) -> None:
        params = dict(min_factor=min_factor)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        min_factor = self.params["min_factor"]
        denom = max(total_steps - 1, 1)
        factor = min_factor + 0.5 * (1 - min_factor) * (1 + np.cos(np.pi * step / denom))
        return float(base_lr * factor)
