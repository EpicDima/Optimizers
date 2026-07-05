from fastapi import Header

from api.session import Session, session_store


def get_session(x_session_id: str | None = Header(default=None)) -> Session | None:
    """Сессия существует, только если клиент передал X-Session-Id — без него
    /optimize работает как чистая безсостоятельная функция (всегда reset)."""
    if x_session_id is None:
        return None
    return session_store.get(x_session_id)
