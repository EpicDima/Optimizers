from .Scheduler import Scheduler


class REX(Scheduler):
    """
    REX (Reflected Exponential) — расписание без гиперпараметров.

    Первоисточник: Chen J., Wolfe C., Kyrillidis A. "REX: Revisiting Budgeted
    Training with an Improved Schedule". 2021. https://arxiv.org/abs/2107.04197

    Формула (t — шаг с нуля, T — полное число шагов, z = 1 - t / T):
    lr = base_lr * z / (0.5 + 0.5 * z).
    lr(0) = base_lr, далее монотонно убывает к нулю: сначала медленнее линейного
    расписания, к концу — быстрее.

    По данным авторов не уступает линейному, ступенчатому, косинусному и OneCycle
    расписаниям и особенно хорошо работает при малом бюджете шагов — как раз наш
    случай (~100 шагов).
    """

    def __init__(self) -> None:
        super().__init__(dict())

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        z = 1 - step / total_steps
        return float(base_lr * z / (0.5 + 0.5 * z))
