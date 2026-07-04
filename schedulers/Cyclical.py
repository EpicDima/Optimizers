from .Scheduler import Scheduler, np


class Cyclical(Scheduler):
    """
    Циклическое треугольное расписание скорости обучения (CLR, политика triangular).

    Первоисточник: Smith L.N. "Cyclical Learning Rates for Training
    Neural Networks". WACV 2017.
    https://arxiv.org/abs/1506.01186
    https://doi.org/10.1109/WACV.2017.58
    Раздел 3.1, политика triangular: скорость обучения линейно растёт
    от нижней границы к верхней и обратно; в статье нижняя граница
    рекомендуется на уровне 1/3–1/4 от верхней.

    Формула (t — шаг с нуля, T — полное число шагов):
    stepsize = max(1, round(stepsize_frac * T)) — длина полуцикла;
    cycle = floor(1 + t / (2 * stepsize)); x = |t / stepsize - 2 * cycle + 1|;
    lr(t) = base_lr * (min_factor + (1 - min_factor) * max(0, 1 - x)).
    При значениях по умолчанию и T=100 — два полных цикла с пиками
    на шагах 25 и 75 и финишем на минимуме скорости обучения,
    как рекомендует Смит.

    Адаптации относительно оригинала: в статье границы называются
    base_lr (нижняя) и max_lr (верхняя) и задаются абсолютными
    значениями; у нас пользовательская базовая скорость обучения — это
    пик, нижняя граница задаётся долей min_factor от неё, а полуцикл —
    долей stepsize_frac от полного числа шагов (в статье stepsize —
    в итерациях, кратных размеру эпохи).
    """

    param_descriptions = {
        "stepsize_frac": "длина полуцикла как доля от полного числа шагов (0.25 — два полных цикла за прогон)",
        "min_factor": "нижняя граница скорости обучения как доля от пиковой (в статье — 1/3–1/4 от верхней)",
    }

    def __init__(self, stepsize_frac: float = 0.25, min_factor: float = 0.25) -> None:
        params = dict(stepsize_frac=stepsize_frac, min_factor=min_factor)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        min_factor = self.params["min_factor"]
        stepsize = max(1, round(self.params["stepsize_frac"] * total_steps))
        cycle = np.floor(1 + step / (2 * stepsize))
        x = abs(step / stepsize - 2 * cycle + 1)
        factor = min_factor + (1 - min_factor) * max(0.0, 1 - x)
        return float(base_lr * factor)
