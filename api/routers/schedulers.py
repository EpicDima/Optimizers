from fastapi import APIRouter

from api.registries import default_scheduler_instance, scheduler_names
from api.schemas.common import AlgorithmMeta, ParamMeta

router = APIRouter(tags=["schedulers"])


@router.get("/schedulers", response_model=list[AlgorithmMeta])
def list_schedulers() -> list[AlgorithmMeta]:
    metas = []
    for name in scheduler_names():
        instance = default_scheduler_instance(name)
        params = {
            key: ParamMeta(default=value, description=instance.param_descriptions.get(key))
            for key, value in instance.params.items()
        }
        metas.append(AlgorithmMeta(name=name, params=params))
    return metas
