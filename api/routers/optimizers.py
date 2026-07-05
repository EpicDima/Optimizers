from fastapi import APIRouter

from api.registries import default_optimizer_instance, optimizer_names
from api.schemas.common import AlgorithmMeta, ParamMeta

router = APIRouter(tags=["optimizers"])


@router.get("/optimizers", response_model=list[AlgorithmMeta])
def list_optimizers() -> list[AlgorithmMeta]:
    metas = []
    for name in optimizer_names():
        instance = default_optimizer_instance(name)
        params = {
            key: ParamMeta(default=value, description=instance.param_descriptions.get(key))
            for key, value in instance.params.items()
        }
        metas.append(AlgorithmMeta(name=name, params=params))
    return metas
