import numpy as np
import pytest

import optimizers
from Function import Function
from optimizers.Optimizer import Optimizer

OPTIMIZER_CLASSES = [
    getattr(optimizers, name)
    for name in dir(optimizers)
    if not name.startswith("__")
    and name != "Optimizer"
    and isinstance(getattr(optimizers, name), type)
    and issubclass(getattr(optimizers, name), Optimizer)
]


@pytest.fixture(scope="module")
def sphere():
    return Function()


@pytest.mark.parametrize("optimizer_class", OPTIMIZER_CLASSES, ids=lambda c: c.__name__)
class TestOptimizer:
    def test_converges_on_sphere(self, optimizer_class, sphere):
        initial_x = np.array([1.5, -1.5])
        optimizer = optimizer_class(initial_x, sphere)

        for _ in range(200):
            x, y = optimizer.next_point()

        assert np.all(np.isfinite(x))
        assert y < sphere(initial_x)

    def test_reset_restores_initial_point(self, optimizer_class, sphere):
        initial_x = np.array([1.5, -1.5])
        optimizer = optimizer_class(initial_x, sphere)

        optimizer.next_point()
        optimizer.reset()

        assert np.array_equal(optimizer.x, initial_x)
        first_run = optimizer.next_point()

        optimizer.reset()
        second_run = optimizer.next_point()
        assert first_run[1] == pytest.approx(second_run[1])

    def test_params_exposed_for_ui(self, optimizer_class, sphere):
        optimizer = optimizer_class(np.array([0.0, 0.0]), sphere)
        assert isinstance(optimizer.params, dict)
        assert len(optimizer.params) > 0

    def test_param_descriptions_cover_all_params(self, optimizer_class, sphere):
        optimizer = optimizer_class(np.array([0.0, 0.0]), sphere)
        assert set(optimizer.param_descriptions) == set(optimizer.params)
        assert all(optimizer.param_descriptions.values())
