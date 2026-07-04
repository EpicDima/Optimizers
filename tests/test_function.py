import numpy as np
import pytest

from Function import Function


@pytest.fixture
def function():
    return Function()


class TestConvert:
    def test_simple_polynomial(self, function):
        assert function.convert("x^2 + y^2") == "x[0]**2 + x[1]**2"

    def test_numpy_names_are_prefixed(self, function):
        converted = function.convert("sin(x) + cos(y)")
        assert converted == "np.sin(x[0]) + np.cos(x[1])"

    def test_constants(self, function):
        converted = function.convert("pi * e")
        assert converted == "np.pi * np.e"


class TestCheckFunction:
    def test_same_string_returns_1(self, function):
        assert function.check_function(function.raw_str_fx) == 1

    def test_new_valid_function_returns_2_and_applies(self, function):
        assert function.check_function("x^2 + 2 * y^2") == 2
        assert function.raw_str_fx == "x^2 + 2 * y^2"
        assert function(np.array([1.0, 2.0])) == pytest.approx(9.0)

    def test_invalid_function_returns_0_and_keeps_old(self, function):
        old = function.raw_str_fx
        assert function.check_function("x^2 +* y") == 0
        assert function.raw_str_fx == old

    @pytest.mark.parametrize(
        "malicious",
        [
            '__import__("os").getcwd()',
            "().__class__.__mro__",
            "open('/etc/hosts').read()",
            "x + save(1)",
            "load('data.npy')",
            "lambda: 1",
            "[i for i in (1, 2)]",
        ],
    )
    def test_arbitrary_code_is_rejected(self, function, malicious):
        old = function.raw_str_fx
        assert function.check_function(malicious) == 0
        assert function.raw_str_fx == old


class TestEvaluation:
    def test_sphere_value(self, function):
        assert function(np.array([3.0, 4.0])) == pytest.approx(25.0)

    def test_gradient_of_sphere(self, function):
        grad = function.grad(np.array([1.0, 2.0]))
        assert grad == pytest.approx(np.array([2.0, 4.0]), abs=1e-4)

    def test_surface_shape(self, function):
        assert function.y.shape == (function.count, function.count)


class TestStandardFunctions:
    def test_all_standard_functions_are_valid(self, function):
        for name, expr in function.standard_functions.items():
            code = function.check_function(expr)
            assert code in (1, 2), f"функция {name!r} не прошла проверку"
            value = function(np.array([0.5, -0.5]))
            assert np.isfinite(value), f"функция {name!r} вернула {value}"
