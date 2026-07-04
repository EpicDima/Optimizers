from .Scheduler import Scheduler, np


class CosineWarmRestarts(Scheduler):
    """
    Косинусное затухание с тёплыми рестартами (SGDR).

    Первоисточник: Loshchilov I., Hutter F. "SGDR: Stochastic Gradient
    Descent with Warm Restarts". ICLR 2017.
    https://arxiv.org/abs/1608.03983
    Уравнение (5): η_t = η_min + 0.5·(η_max − η_min)·(1 + cos(π·T_cur/T_i));
    после каждого цикла длина следующего умножается на T_mult
    (авторы рекомендуют T_mult = 2).

    Формула (t — шаг с нуля, T — полное число шагов):
    длина первого цикла T_0 = max(1, round(t0_frac * T)), далее циклы
    T_0, T_0·m, T_0·m², ..., где m = max(int(t_mult), 1); для шага t
    заново от нуля находится текущий цикл длиной T_i и позиция t_cur в нём;
    lr(t) = base_lr * (min_factor + 0.5 * (1 - min_factor) * (1 + cos(pi * t_cur / T_i))).
    Деление на T_i (а не T_i - 1) даёт в начале каждого цикла скачок
    скорости обучения обратно к base_lr — тёплый рестарт. Рестарты
    «выбивают» траекторию из плохих локальных бассейнов — на
    мультимодальных 2D-функциях это видно наглядно.

    Адаптации относительно оригинала: в статье длины циклов задаются
    в эпохах с дробным T_cur на каждом батче — у нас в шагах, через долю
    t0_frac от полного бюджета; нижняя граница — не абсолютное η_min,
    а доля min_factor от базовой скорости обучения.
    """

    param_descriptions = {
        "t0_frac": "доля шагов на первый цикл (при T=100 и t_mult=2 циклы 15+30+60 — финиш почти на минимуме)",
        "t_mult": "множитель длины каждого следующего цикла (авторы рекомендуют 2)",
        "min_factor": "нижняя граница скорости обучения как доля от базовой (0 — затухание до нуля)",
    }

    def __init__(self, t0_frac: float = 0.15, t_mult: float = 2.0, min_factor: float = 0.0) -> None:
        params = dict(t0_frac=t0_frac, t_mult=t_mult, min_factor=min_factor)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        min_factor = self.params["min_factor"]
        t_mult = max(int(self.params["t_mult"]), 1)
        cycle_len = max(1, round(self.params["t0_frac"] * total_steps))
        t_cur = step
        while t_cur >= cycle_len:
            t_cur -= cycle_len
            cycle_len *= t_mult
        factor = min_factor + 0.5 * (1 - min_factor) * (1 + np.cos(np.pi * t_cur / cycle_len))
        return float(base_lr * factor)
