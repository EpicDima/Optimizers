from .Scheduler import Scheduler


class LinearDecay(Scheduler):
    """
    Линейное затухание скорости обучения.

    Формула: lr(t) = base_lr * (end_factor + (1 - end_factor) * (1 - t / denom)),
    где t — шаг с нуля, T — полное число шагов, denom = max(T - 1, 1) —
    на последнем шаге достигается ровно end_factor * base_lr.

    Первоисточник: достоверно не установлен — простейшая интерполяция.
    Подтверждённое авторитетное употребление — BERT: Devlin J., Chang M.-W.,
    Lee K., Toutanova K. "BERT: Pre-training of Deep Bidirectional
    Transformers for Language Understanding". 2018.
    https://arxiv.org/abs/1810.04805 (Appendix A.2: линейное затухание
    после разогрева).

    Частный случай полиномиального затухания при power = 1.

    Адаптации относительно употребления в BERT: без фазы разогрева;
    финальное значение задаётся долей end_factor от базовой скорости
    обучения, а не абсолютным значением.
    """

    param_descriptions = {
        "end_factor": "финальная скорость обучения как доля от базовой (достигается на последнем шаге)",
    }

    def __init__(self, end_factor: float = 0.0) -> None:
        params = dict(end_factor=end_factor)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        denom = max(total_steps - 1, 1)
        # ограничение снизу нулём — защита от отрицательных значений за горизонтом T
        remaining = max(1 - step / denom, 0.0)
        end_factor = self.params["end_factor"]
        return float(base_lr * (end_factor + (1 - end_factor) * remaining))
