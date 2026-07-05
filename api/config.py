"""Настройки веб-API: ограничения на нагрузку и время жизни сессий.

Значения подобраны по замеру: самый медленный оптимизатор (Newton) делает
~54000 next_point()/с, поэтому лимит total_steps держит худший случай
одного запроса /optimize в пределах нескольких секунд.
"""

API_PREFIX = "/api/v1"

MAX_RUNS = 15
MAX_STEPS_PER_RUN = 20_000
MAX_TOTAL_STEPS = 200_000

MIN_GRID_COUNT = 10
MAX_GRID_COUNT = 400

SESSION_TTL_SECONDS = 2 * 60 * 60
