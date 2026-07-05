from pydantic import Field

from api.config import MAX_GRID_COUNT, MIN_GRID_COUNT
from api.schemas.base import CamelModel

Range = tuple[float, float, float, float]


class FunctionPreset(CamelModel):
    name: str
    formula: str
    range: Range
    start: tuple[float, float]


class FunctionPreviewRequest(CamelModel):
    formula: str
    range: Range
    count: int = Field(ge=MIN_GRID_COUNT, le=MAX_GRID_COUNT)


class FunctionPreviewResponse(CamelModel):
    valid: bool
    error: str | None = None
    mesh_x: list[float] = []
    mesh_y: list[float] = []
    z: list[list[float]] = []
    # (x, y, значение функции) — высота нужна фронтенду для звёзд-маркеров в 3D
    minima: list[tuple[float, float, float]] = []


class FunctionValueRequest(CamelModel):
    formula: str
    x: float
    y: float


class FunctionValueResponse(CamelModel):
    valid: bool
    error: str | None = None
    value: float | None = None
