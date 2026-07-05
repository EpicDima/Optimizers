from pydantic import Field

from api.config import MAX_RUNS, MAX_STEPS_PER_RUN
from api.schemas.base import CamelModel


class RunConfig(CamelModel):
    """Один слот из боковой панели: пара оптимизатор+планировщик со своими параметрами."""

    slot_id: str
    optimizer: str
    optimizer_params: dict[str, float]
    scheduler: str = "Constant"
    scheduler_params: dict[str, float] = {}
    start: tuple[float, float]
    # False — продолжить с прошлой позиции того же слота (нужна сессия), True — начать заново
    reset: bool = True


class OptimizeFunction(CamelModel):
    """Диапазон построения графика на шаг оптимизатора не влияет (next_point
    не знает границ), поэтому здесь только формула."""

    formula: str


class OptimizeRequest(CamelModel):
    function: OptimizeFunction
    runs: list[RunConfig] = Field(min_length=1, max_length=MAX_RUNS)
    steps: int = Field(ge=1, le=MAX_STEPS_PER_RUN)


class RunResult(CamelModel):
    slot_id: str
    x: list[float]
    y: list[float]
    value: list[float]
    lr: list[float] | None = None
    error: str | None = None


class OptimizeResponse(CamelModel):
    runs: list[RunResult]
