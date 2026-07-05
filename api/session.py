"""In-memory сессии: живые экземпляры Function/Optimizer между вызовами
/optimize, нужные только чтобы «продолжить без сброса» (reset=false в
RunConfig) работало так же, как self.optimizer, переживающий несколько
кликов Start в OptimizerWidget — тот же объект, то же накопленное
состояние (моменты Adam, история LBFGS и т.п.), а не просто те же числа.

Хранится в памяти одного процесса, без персистентности между перезапусками
и без claim на горизонтальное масштабирование — сознательное упрощение
для локального/однопользовательского сценария использования этого
инструмента (как и сам десктопный GUI, который тоже держит своё состояние
только в памяти одного процесса).
"""

import threading
import time
from dataclasses import dataclass, field

from api.config import SESSION_TTL_SECONDS
from Function import Function
from optimizers.Optimizer import Optimizer


@dataclass(repr=False)
class SlotState:
    optimizer_name: str
    optimizer: Optimizer


@dataclass(repr=False)
class Session:
    function: Function = field(default_factory=Function)
    slots: dict[str, SlotState] = field(default_factory=dict)
    lock: threading.Lock = field(default_factory=threading.Lock)
    last_seen: float = field(default_factory=time.monotonic)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}
        self._store_lock = threading.Lock()

    def get(self, session_id: str) -> Session:
        with self._store_lock:
            self._evict_expired()
            session = self._sessions.get(session_id)
            if session is None:
                session = Session()
                self._sessions[session_id] = session
            session.last_seen = time.monotonic()
            return session

    def _evict_expired(self) -> None:
        now = time.monotonic()
        expired = [sid for sid, s in self._sessions.items() if now - s.last_seen > SESSION_TTL_SECONDS]
        for sid in expired:
            del self._sessions[sid]


session_store = SessionStore()
