from .Scheduler import Scheduler, np


class OneCycle(Scheduler):
    """
    OneCycle — один цикл скорости обучения («суперсходимость»).

    Первоисточник: Smith L.N., Topin N. "Super-Convergence: Very Fast
    Training of Neural Networks Using Large Learning Rates". 2017.
    https://arxiv.org/abs/1708.07120
    Смысл: временно очень большая скорость обучения ускоряет проход
    плато и работает как регуляризатор.

    Формула (t — шаг с нуля, T — полное число шагов; base_lr — пик):
    T_up = max(1, round(pct_start * T)); start_factor = 1/div;
    final_factor = 1/(div * final_div).
    Фаза роста (t < T_up):
    lr(t) = base_lr * (start_factor + (1 - start_factor) * 0.5 * (1 - cos(pi * t / T_up))).
    Фаза спада (t >= T_up): progress = (t - T_up) / max(T - 1 - T_up, 1);
    lr(t) = base_lr * (final_factor + (1 - final_factor) * 0.5 * (1 + cos(pi * progress))).
    Скорость обучения растёт от base_lr/div до пика base_lr на шаге T_up,
    затем затухает почти до нуля (base_lr/(div*final_div)).

    Адаптации относительно оригинала: в статье интерполяция линейная,
    цикл короче полного бюджета, а в конце — отдельная фаза
    дотормаживания ниже стартовой скорости обучения; косинусная форма
    и данная параметризация (pct_start, div_factor, final_div_factor)
    взяты из реализации PyTorch OneCycleLR:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.OneCycleLR.html
    Границы в оригинале и в PyTorch — абсолютные, у нас — доли от base_lr.
    """

    param_descriptions = {
        "pct_start": "доля шагов на фазу роста скорости обучения (пик достигается на шаге pct_start * T)",
        "div": "во сколько раз стартовая скорость обучения меньше пиковой (старт с base_lr/div)",
        "final_div": "во сколько раз финальная скорость обучения меньше стартовой (финиш на base_lr/(div*final_div))",
    }

    def __init__(self, pct_start: float = 0.3, div: float = 25.0, final_div: float = 10000.0) -> None:
        params = dict(pct_start=pct_start, div=div, final_div=final_div)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        start_factor = 1 / self.params["div"]
        final_factor = 1 / (self.params["div"] * self.params["final_div"])
        t_up = max(1, round(self.params["pct_start"] * total_steps))
        if step < t_up:
            factor = start_factor + (1 - start_factor) * 0.5 * (1 - np.cos(np.pi * step / t_up))
        else:
            progress = (step - t_up) / max(total_steps - 1 - t_up, 1)
            factor = final_factor + (1 - final_factor) * 0.5 * (1 + np.cos(np.pi * progress))
        return float(base_lr * factor)
