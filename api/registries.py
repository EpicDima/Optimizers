"""Обнаружение доступных оптимизаторов и планировщиков.

Тот же приём, что и в widgets/OptimizerWidget.refresh_schedulers: перебор
атрибутов модуля с проверкой isinstance/issubclass, а не хрупкий список
имён — новый файл в optimizers/ или schedulers/ появляется в API без
изменений где-либо ещё.
"""

from typing import Any

import numpy as np

import optimizers
import schedulers
from Function import Function
from optimizers.Optimizer import Optimizer
from schedulers.Scheduler import Scheduler


def _subclasses(module: Any, base: type) -> dict[str, type]:
    return {
        name: obj
        for name in dir(module)
        if isinstance(obj := getattr(module, name), type) and issubclass(obj, base) and obj is not base
    }


def optimizer_classes() -> dict[str, type[Optimizer]]:
    return _subclasses(optimizers, Optimizer)


def scheduler_classes() -> dict[str, type[Scheduler]]:
    return _subclasses(schedulers, Scheduler)


def optimizer_names() -> list[str]:
    return sorted(optimizer_classes())


def scheduler_names() -> list[str]:
    """Constant первым, остальные по алфавиту без учёта регистра — как в GUI."""
    rest = sorted((name for name in scheduler_classes() if name != "Constant"), key=str.lower)
    return ["Constant", *rest]


def get_optimizer_class(name: str) -> type[Optimizer] | None:
    return optimizer_classes().get(name)


def get_scheduler_class(name: str) -> type[Scheduler] | None:
    return scheduler_classes().get(name)


_PROBE_FUNCTION = Function()


def default_optimizer_instance(name: str) -> Optimizer:
    """Экземпляр с параметрами по умолчанию — только чтобы прочитать .params/.param_descriptions.

    Конкретные подклассы принимают именованные float-параметры вместо params:
    dict базового Optimizer.__init__, поэтому конструктор здесь всегда
    расходится с типом type[Optimizer] — это тот же приём динамического
    создания, что и в widgets/OptimizerWidget.py, статически не проверяется.
    """
    cls = get_optimizer_class(name)
    if cls is None:
        raise KeyError(name)
    return cls(np.array([0.0, 0.0]), _PROBE_FUNCTION)  # type: ignore[call-arg]


def default_scheduler_instance(name: str) -> Scheduler:
    cls = get_scheduler_class(name)
    if cls is None:
        raise KeyError(name)
    return cls()  # type: ignore[call-arg]
