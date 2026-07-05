from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Модели отдают camelCase JSON (идиоматично для TS-фронтенда), но
    по-прежнему принимают snake_case на вход (populate_by_name) — так
    существующие вызовы с python-именами полей не ломаются."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
