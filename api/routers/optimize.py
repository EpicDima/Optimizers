import contextlib

import numpy as np
from fastapi import APIRouter, Depends, HTTPException

from api.config import MAX_TOTAL_STEPS
from api.deps import get_session
from api.registries import get_optimizer_class, get_scheduler_class
from api.schemas.optimize import OptimizeRequest, OptimizeResponse, RunConfig, RunResult
from api.session import Session, SlotState
from Function import Function

router = APIRouter(tags=["optimize"])


def _apply_known_params(target: dict[str, float], updates: dict[str, float]) -> None:
    """Как OptimizerWidget.get_params(): только уже существующие ключи, лишнее из запроса игнорируется."""
    for key in target:
        if key in updates:
            target[key] = updates[key]


def _failed(slot_id: str, error: str) -> RunResult:
    return RunResult(slot_id=slot_id, x=[], y=[], value=[], error=error)


def _run_slot(function: Function, cfg: RunConfig, session: Session | None, steps: int) -> RunResult:
    slot = session.slots.get(cfg.slot_id) if session is not None else None
    # продолжаем существующий инстанс только если не просили сброс и тип
    # оптимизатора для этого слота не поменялся (смена типа в десктопном
    # виджете всегда пересоздаёт self.optimizer, вне зависимости от чекбокса)
    if not cfg.reset and slot is not None and slot.optimizer_name == cfg.optimizer:
        optimizer = slot.optimizer
        _apply_known_params(optimizer.params, cfg.optimizer_params)
    else:
        cls = get_optimizer_class(cfg.optimizer)
        if cls is None:
            return _failed(cfg.slot_id, f"неизвестный оптимизатор: {cfg.optimizer}")
        try:
            # подклассы Optimizer принимают именованные float-параметры вместо
            # params: dict базового __init__ — тот же динамический вызов, что
            # и в OptimizerWidget.change_optimizer, статически не проверяется
            optimizer = cls(np.array(cfg.start, dtype=float), function, **cfg.optimizer_params)  # type: ignore[call-arg,arg-type]
        except Exception as exc:
            return _failed(cfg.slot_id, f"некорректные параметры оптимизатора: {exc}")
        if session is not None:
            session.slots[cfg.slot_id] = SlotState(cfg.optimizer, optimizer)

    scheduler_cls = get_scheduler_class(cfg.scheduler)
    if scheduler_cls is None:
        return _failed(cfg.slot_id, f"неизвестный планировщик: {cfg.scheduler}")
    try:
        scheduler = scheduler_cls(**cfg.scheduler_params)  # type: ignore[call-arg,arg-type]
    except Exception as exc:
        return _failed(cfg.slot_id, f"некорректные параметры планировщика: {exc}")

    # цикл дословно повторяет OptimizerWidget.optimize: расписание
    # подставляется в lr перед каждым шагом, base_lr восстанавливается в конце
    xs = [float(optimizer.x[0])]
    ys = [float(optimizer.x[1])]
    values = [float(function(optimizer.x))]
    base_lr = optimizer.params.get("lr")
    lrs = None if base_lr is None else [scheduler.lr(0, steps, base_lr)]

    for step in range(steps):
        if base_lr is not None:
            assert lrs is not None  # lrs заведён именно тогда, когда base_lr задан
            optimizer.params["lr"] = scheduler.lr(step, steps, base_lr)
            lrs.append(optimizer.params["lr"])
        point, value = optimizer.next_point()
        xs.append(float(point[0]))
        ys.append(float(point[1]))
        values.append(float(value))

    if base_lr is not None:
        optimizer.params["lr"] = base_lr

    return RunResult(slot_id=cfg.slot_id, x=xs, y=ys, value=values, lr=lrs)


@router.post("/optimize", response_model=OptimizeResponse)
def optimize(payload: OptimizeRequest, session: Session | None = Depends(get_session)) -> OptimizeResponse:
    if payload.steps * len(payload.runs) > MAX_TOTAL_STEPS:
        raise HTTPException(422, f"суммарный объём шагов (steps * количество запусков) превышает {MAX_TOTAL_STEPS}")

    function = session.function if session is not None else Function()

    with session.lock if session is not None else contextlib.nullcontext():
        code = function.check_function(payload.function.formula)
        if code == 0:
            raise HTTPException(422, "недопустимая или некорректная формула")

        results = [_run_slot(function, cfg, session, payload.steps) for cfg in payload.runs]

    return OptimizeResponse(runs=results)
