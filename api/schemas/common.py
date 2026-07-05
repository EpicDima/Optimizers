from api.schemas.base import CamelModel


class ParamMeta(CamelModel):
    default: float
    description: str | None = None


class AlgorithmMeta(CamelModel):
    """Метаданные одного оптимизатора или планировщика: имя + описания параметров."""

    name: str
    params: dict[str, ParamMeta]
