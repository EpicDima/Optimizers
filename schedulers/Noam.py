from .Scheduler import Scheduler, np


class Noam(Scheduler):
    """
    Расписание Noam — линейный разогрев и затухание по обратному корню, из трансформера.

    Первоисточник: Vaswani A. et al. "Attention Is All You Need". 2017.
    https://arxiv.org/abs/1706.03762 — раздел 5.3:
    lrate = d_model^{-0.5} * min(step^{-0.5}, step * warmup_steps^{-1.5}),
    warmup_steps = 4000.

    Формула (t — шаг с нуля, T — полное число шагов, s = t + 1, чтобы не делить
    на ноль, T_w = max(1, round(warmup_frac * T))):
    lr = base_lr * min(s / T_w, sqrt(T_w / s)).
    Пик равен base_lr и достигается на шаге t = T_w - 1.

    Адаптации относительно оригинала: в статье масштаб задаёт размерность модели
    d_model (пик равен (d_model * warmup_steps)^{-0.5}), у нас пик задаёт base_lr;
    длительность разогрева — доля от T, а не абсолютное число шагов. Затухание
    пропорционально 1/sqrt(t), «бесконечное» и от T не зависит: к шагу 100 при
    T_w = 10 lr падает лишь до ~0.32 * base_lr, что наглядно отличает Noam от
    расписаний, затухающих к нулю.
    """

    param_descriptions = {
        "warmup_frac": "доля полного числа шагов, отведённая под линейный разогрев от нуля до пика base_lr",
    }

    def __init__(self, warmup_frac: float = 0.1) -> None:
        params = dict(warmup_frac=warmup_frac)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        warmup_steps = max(1, round(self.params["warmup_frac"] * total_steps))
        s = step + 1
        return float(base_lr * min(s / warmup_steps, np.sqrt(warmup_steps / s)))
