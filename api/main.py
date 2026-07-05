"""FastAPI-приложение: тонкий шлюз к неизменному Function/optimizers/schedulers.

Никакой числовой логики здесь нет и не должно появляться — эндпоинты
только валидируют вход, вызывают существующие классы и сериализуют
результат. Источник истины по поведению алгоритмов — Python-модули
optimizers/, schedulers/, Function.py, используемые и десктопным GUI.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.config import API_PREFIX
from api.routers import functions, optimize, optimizers, schedulers

app = FastAPI(title="Optimizers API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:47913", "http://127.0.0.1:47913"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimizers.router, prefix=API_PREFIX)
app.include_router(schedulers.router, prefix=API_PREFIX)
app.include_router(functions.router, prefix=API_PREFIX)
app.include_router(optimize.router, prefix=API_PREFIX)

# в production фронтенд собран в web/dist и отдаётся тем же процессом —
# `uv run webapp.py` поднимает всё приложение одной командой
_frontend_dist = Path(__file__).resolve().parent.parent / "web" / "dist"
if _frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=_frontend_dist, html=True), name="frontend")
