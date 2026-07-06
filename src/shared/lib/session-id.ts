const STORAGE_KEY = "optimizers-session-id";

/** Стабильный id вкладки/браузера — включает продолжение оптимизации без
 * сброса позиции на сервере (см. api/session.py). */
export function getSessionId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
