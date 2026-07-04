import numpy as np
import pytest

import schedulers
from schedulers.Scheduler import Scheduler

SCHEDULER_CLASSES = [
    getattr(schedulers, name)
    for name in dir(schedulers)
    if not name.startswith("__")
    and name != "Scheduler"
    and isinstance(getattr(schedulers, name), type)
    and issubclass(getattr(schedulers, name), Scheduler)
]


@pytest.mark.parametrize("scheduler_class", SCHEDULER_CLASSES, ids=lambda c: c.__name__)
class TestScheduler:
    def test_lr_finite_and_nonnegative(self, scheduler_class):
        scheduler = scheduler_class()
        lrs = [scheduler.lr(step, 100, 0.5) for step in range(100)]
        assert all(np.isfinite(lr) for lr in lrs)
        assert all(lr >= 0 for lr in lrs)
        assert max(lrs) > 0

    def test_short_horizon_does_not_crash(self, scheduler_class):
        scheduler = scheduler_class()
        for total_steps in (1, 2, 3):
            for step in range(total_steps):
                assert np.isfinite(scheduler.lr(step, total_steps, 0.5))

    def test_stateless_and_deterministic(self, scheduler_class):
        scheduler = scheduler_class()
        first = [scheduler.lr(step, 100, 0.5) for step in range(100)]
        second = [scheduler.lr(step, 100, 0.5) for step in range(100)]
        assert first == second

    def test_scales_linearly_with_base_lr(self, scheduler_class):
        scheduler = scheduler_class()
        for step in range(0, 100, 7):
            assert scheduler.lr(step, 100, 0.6) == pytest.approx(2 * scheduler.lr(step, 100, 0.3))

    def test_params_exposed_for_ui(self, scheduler_class):
        scheduler = scheduler_class()
        assert isinstance(scheduler.params, dict)

    def test_param_descriptions_cover_all_params(self, scheduler_class):
        scheduler = scheduler_class()
        assert set(scheduler.param_descriptions) == set(scheduler.params)
        assert all(scheduler.param_descriptions.values())


def test_constant_returns_base_lr():
    scheduler = schedulers.Constant()
    assert scheduler.lr(0, 100, 0.37) == 0.37
    assert scheduler.lr(99, 100, 0.37) == 0.37
