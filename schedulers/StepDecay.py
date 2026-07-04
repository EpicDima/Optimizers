from .Scheduler import Scheduler


class StepDecay(Scheduler):
    """
    Ступенчатое затухание скорости обучения.

    Формула: lr(t) = base_lr * gamma^floor(t / step_size),
    где t — шаг с нуля, T — полное число шагов,
    step_size = max(1, round(step_frac * T)).

    Первоисточник: достоверно не установлен — фольклорный приём.
    Самое раннее подтверждённое употребление — AlexNet:
    Krizhevsky A., Sutskever I., Hinton G. "ImageNet Classification
    with Deep Convolutional Neural Networks". NIPS 2012.
    https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf
    Там скорость обучения делили на 10 по плато ошибки валидации;
    фиксированный период ступени — позднейшая канонизация во
    фреймворках (PyTorch StepLR).

    Адаптации относительно оригинала: период ступени задаётся долей
    step_frac от полного числа шагов, а не абсолютным числом шагов;
    вместо классического gamma = 0.1 (за три ступени почти
    останавливает точку на 2D-функциях) по умолчанию взято более
    наглядное gamma = 0.5.
    """

    param_descriptions = {
        "step_frac": "доля полного числа шагов на одну ступень (при T=100 — ступень 25 шагов, три спуска за прогон)",
        "gamma": "множитель скорости обучения на каждой ступени",
    }

    def __init__(self, step_frac: float = 0.25, gamma: float = 0.5) -> None:
        params = dict(step_frac=step_frac, gamma=gamma)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        step_size = max(1, round(self.params["step_frac"] * total_steps))
        return float(base_lr * self.params["gamma"] ** (step // step_size))
