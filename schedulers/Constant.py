from .Scheduler import Scheduler


class Constant(Scheduler):
    """
    Постоянная скорость обучения — отсутствие расписания.

    Планировщик по умолчанию: на каждом шаге возвращает базовую
    скорость обучения без изменений.
    """

    def __init__(self) -> None:
        super().__init__(dict())

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        return base_lr
