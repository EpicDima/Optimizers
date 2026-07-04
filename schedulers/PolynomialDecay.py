from .Scheduler import Scheduler


class PolynomialDecay(Scheduler):
    """
    Полиномиальное затухание скорости обучения («poly»).

    Формула: lr(t) = base_lr * (end_factor + (1 - end_factor) * (1 - t / denom)^power),
    где t — шаг с нуля, T — полное число шагов, denom = max(T - 1, 1) —
    на последнем шаге достигается ровно end_factor * base_lr.

    При power < 1 высокая скорость обучения держится дольше и резче
    тормозится в конце, при power > 1 — наоборот; power = 1 совпадает
    с линейным затуханием.

    Первоисточник: как отдельная публикация не установлен — политика
    «poly» разошлась из экосистемы Caffe. Систематическое употребление —
    DeepLab: Chen L.-C., Papandreou G., Kokkinos I., Murphy K., Yuille A.
    "DeepLab: Semantic Image Segmentation with Deep Convolutional Nets,
    Atrous Convolution, and Fully Connected CRFs". 2016.
    https://arxiv.org/abs/1606.00915 (раздел 4.1.2, power = 0.9).
    Более ранняя ссылка оттуда — ParseNet: Liu W., Rabinovich A., Berg A.
    https://arxiv.org/abs/1506.04579 (подтверждены только метаданные).
    Каноническая формула с финальным значением — TensorFlow PolynomialDecay.

    Адаптации относительно оригинала: финальное значение задаётся долей
    end_factor от базовой скорости обучения, а не абсолютным значением.
    """

    param_descriptions = {
        "power": "показатель степени полинома; 0.9 — каноническое значение DeepLab, 1 — линейное затухание",
        "end_factor": "финальная скорость обучения как доля от базовой (достигается на последнем шаге)",
    }

    def __init__(self, power: float = 0.9, end_factor: float = 0.0) -> None:
        params = dict(power=power, end_factor=end_factor)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        denom = max(total_steps - 1, 1)
        # ограничение снизу нулём — защита от отрицательного основания дробной степени за горизонтом T
        remaining = max(1 - step / denom, 0.0)
        end_factor = self.params["end_factor"]
        return float(base_lr * (end_factor + (1 - end_factor) * remaining ** self.params["power"]))
