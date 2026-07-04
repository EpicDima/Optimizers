from .Scheduler import Scheduler


class InverseTimeDecay(Scheduler):
    """
    Обратное затухание скорости обучения по времени.

    Формула: lr(t) = base_lr / (1 + k * t)^power,
    где t — шаг с нуля.

    Первоисточник: Robbins H., Monro S. "A Stochastic Approximation
    Method". The Annals of Mathematical Statistics 22(3), 1951.
    https://doi.org/10.1214/aoms/1177729586
    Условия Роббинса–Монро: сумма шагов бесконечна, сумма квадратов
    шагов конечна; их пример — a_n = 1/n. Варианту 1/(1 + t)^p эти
    условия удовлетворяют при 1/2 < p <= 1.

    Честная оговорка: условия Роббинса–Монро нужны для подавления
    стохастического шума; в нашей детерминированной песочнице они
    не обязательны — расписание здесь как историческая классика.

    Адаптации относительно оригинала: добавлены коэффициент скорости
    затухания k и показатель степени power (в статье — частный случай
    k = 1, power = 1).
    """

    param_descriptions = {
        "k": "коэффициент скорости затухания — множитель при номере шага в знаменателе",
        "power": "показатель степени знаменателя; условиям Роббинса–Монро удовлетворяет при 1/2 < power <= 1",
    }

    def __init__(self, k: float = 0.1, power: float = 1.0) -> None:
        params = dict(k=k, power=power)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        return float(base_lr / (1 + self.params["k"] * step) ** self.params["power"])
