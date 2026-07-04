from .Scheduler import Scheduler


class WSD(Scheduler):
    """
    WSD (warmup-stable-decay) — трапециевидное расписание: разогрев, плато, охлаждение.

    Первоисточник (три слоя): трапециевидная форма — Zhai X., Kolesnikov A.,
    Houlsby N., Beyer L. "Scaling Vision Transformers". 2021.
    https://arxiv.org/abs/2106.04560 (раздел 3.5: разогрев + константа + линейное
    охлаждение; позволяет продолжать обучение неограниченно и снимать несколько
    длительностей с одного прогона). Название WSD и популяризация — MiniCPM:
    Hu S. et al. 2024. https://arxiv.org/abs/2404.06395 (у них охлаждение
    экспоненциальное, ~10% бюджета). Систематическое сравнение с косинусом и форма
    охлаждения «1-sqrt» — Hägele A. et al. "Scaling Laws and Compute-Optimal
    Training Beyond Fixed Training Durations". 2024. https://arxiv.org/abs/2405.18392

    Формула (t — шаг с нуля, T — полное число шагов,
    T_w = max(1, round(warmup_frac * T)), T_d = max(1, round(decay_frac * T))):
    при t < T_w: lr = base_lr * (t + 1) / T_w (разогрев);
    иначе при t >= T - T_d: lr = base_lr * (T - t) / T_d (линейное охлаждение);
    иначе: lr = base_lr (плато). Разогрев проверяется первым, чтобы при очень
    малых T фазы не конфликтовали.

    Мы реализуем линейное охлаждение, как у Zhai et al.; альтернативные формы —
    экспоненциальное (MiniCPM) и «1-sqrt» (Hägele et al.). Длина охлаждения по
    умолчанию 20% бюджета — Hägele et al. рекомендуют 10-20%. Смысл: главный тренд
    2024-2025 в предобучении LLM — не требует знать T заранее, качество не хуже
    косинусного расписания.
    """

    param_descriptions = {
        "warmup_frac": "доля полного числа шагов, отведённая под линейный разогрев от нуля до base_lr",
        "decay_frac": "доля полного числа шагов в конце прогона, отведённая под линейное охлаждение до нуля",
    }

    def __init__(self, warmup_frac: float = 0.1, decay_frac: float = 0.2) -> None:
        params = dict(warmup_frac=warmup_frac, decay_frac=decay_frac)
        super().__init__(params)

    def lr(self, step: int, total_steps: int, base_lr: float) -> float:
        warmup_steps = max(1, round(self.params["warmup_frac"] * total_steps))
        decay_steps = max(1, round(self.params["decay_frac"] * total_steps))
        if step < warmup_steps:
            return float(base_lr * (step + 1) / warmup_steps)
        if step >= total_steps - decay_steps:
            return float(base_lr * (total_steps - step) / decay_steps)
        return float(base_lr)
