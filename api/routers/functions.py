import numpy as np
from fastapi import APIRouter, HTTPException

from api.schemas.function import (
    FunctionPreset,
    FunctionPreviewRequest,
    FunctionPreviewResponse,
    FunctionValueRequest,
    FunctionValueResponse,
)
from Function import Function

router = APIRouter(tags=["functions"])

_catalog = Function()


@router.get("/functions", response_model=list[FunctionPreset])
def list_functions() -> list[FunctionPreset]:
    return [
        FunctionPreset(name=name, formula=preset.formula, range=preset.range, start=preset.start)
        for name, preset in _catalog.standard_functions.items()
    ]


@router.post("/function/preview", response_model=FunctionPreviewResponse)
def preview_function(payload: FunctionPreviewRequest) -> FunctionPreviewResponse:
    from_x, to_x, from_y, to_y = payload.range
    if from_x >= to_x or from_y >= to_y:
        raise HTTPException(422, "некорректный диапазон: from должен быть меньше to по каждой оси")

    function = Function()
    function.set_params((from_x, to_x, from_y, to_y, payload.count))
    function.create_surface()
    code = function.check_function(payload.formula)
    if code == 0:
        return FunctionPreviewResponse(valid=False, error="недопустимая или некорректная формула")

    mesh_x = function.x[0][0, :].tolist()
    mesh_y = function.x[1][:, 0].tolist()
    z = function.y.tolist()
    minima = [(float(point[0]), float(point[1]), float(function(point))) for point in function.minima]
    return FunctionPreviewResponse(valid=True, mesh_x=mesh_x, mesh_y=mesh_y, z=z, minima=minima)


@router.post("/function/value", response_model=FunctionValueResponse)
def function_value(payload: FunctionValueRequest) -> FunctionValueResponse:
    # только точечная оценка — не трогаем create_surface/reset_fx, чтобы
    # частые вызовы при живом предпросмотре стартовой точки были дешёвыми
    probe = Function()
    try:
        converted = probe.convert(payload.formula)
        fx = probe.compile_fx(converted)
        value = float(fx(np.array([payload.x, payload.y])))
    except Exception:
        return FunctionValueResponse(valid=False, error="недопустимая или некорректная формула")
    if not np.isfinite(value):
        return FunctionValueResponse(valid=False, error="функция не определена в этой точке")
    return FunctionValueResponse(valid=True, value=value)
