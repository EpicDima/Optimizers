from .Scheduler import Scheduler, np


class WarmupCosine(Scheduler):
    """
    Линейный разогрев + косинусное затухание — стандарт де-факто для обучения нейросетей.

    Первоисточник: у связки как таковой отдельного первоисточника нет — это соединение
    двух приёмов. Линейный разогрев: Goyal P. et al. "Accurate, Large Minibatch SGD:
    Training ImageNet in 1 Hour". 2017. https://arxiv.org/abs/1706.02677
    (ранее у He K. et al., https://arxiv.org/abs/1512.03385 , разогрев был константным
    малым lr). Косинусное затухание: SGDR, Loshchilov I., Hutter F.
    https://arxiv.org/abs/1608.03983 . Канонический пример употребления — GPT-3:
    Brown T. et al. "Language Models are Few-Shot Learners". 2020.
    https://arxiv.org/abs/2005.14165 (разогрев + косинус до 10% пика).

    Формула (t — шаг с нуля, T — полное число шагов, T_w = max(1, round(warmup_frac * T))):
    при t < T_w: lr = base_lr * (t + 1) / T_w;
    иначе: progress = (t - T_w) / max(T - 1 - T_w, 1),
    lr = base_lr * (min_factor + 0.5 * (1 - min_factor) * (1 + cos(pi * progress))).

    Адаптации относительно оригиналов: длительность разогрева задаётся долей от T
    (а не абсолютным числом шагов/эпох), нижняя граница — долей min_factor от base_lr;
    перезапусков, как в SGDR, нет — один косинусный полупериод на весь прогон.
    """

    param_descriptions = {
        "warmup_frac": "доля полного числа шагов, отведённая под линейный разогрев от нуля до base_lr",
        "min_factor": "доля base_lr, до которой затухает скорость обучения к концу прогона",
    }

    def __init__(self, warmup_frac: float = 0.1, min_factor: float = 0.1) -> None:
        params = dict(warmup_frac=warmup_frac, min_factor=min_factor)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        warmup_steps = max(1, round(self.params["warmup_frac"] * total_steps))
        if step < warmup_steps:
            return float(base_lr * (step + 1) / warmup_steps)
        min_factor = self.params["min_factor"]
        progress = (step - warmup_steps) / max(total_steps - 1 - warmup_steps, 1)
        return float(base_lr * (min_factor + 0.5 * (1 - min_factor) * (1 + np.cos(np.pi * progress))))
