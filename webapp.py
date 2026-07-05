"""Запуск веб-версии: uv run webapp.py

Поднимает FastAPI-бэкенд (api/) на localhost:58217. В разработке фронтенд
запускается отдельно (`npm run dev` в web/, см. web/README) и обращается
сюда через Vite-прокси; в production в web/dist собран статический
фронтенд, и этот же процесс отдаёт его напрямую (api/main.py).
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="127.0.0.1", port=58217, reload=True)
