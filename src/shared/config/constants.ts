export const API_BASE_URL = "/api/v1";

// зеркалит api/config.py — держим на клиенте только для мгновенной
// валидации формы до отправки запроса, источник истины всё равно бэкенд
export const MAX_RUNS = 15;
export const MAX_STEPS_PER_RUN = 20_000;
export const MAX_TOTAL_STEPS = 200_000;

// повторяет умолчания steps_textedit/tail_textedit из ui_templates/ui_mainwindow.py
export const DEFAULT_STEPS = 100;
export const DEFAULT_TAIL = 50;
export const DEFAULT_GRID_COUNT = 200;
