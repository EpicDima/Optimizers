import numpy as np
import pytest

from Function import Function

# Известные из литературы глобальные минимумы предустановленных функций
# в пределах области пресета: (список точек, допуск по координатам).
# У функций с очень пологим дном (Шаффер, Букина) и минимумом на границе
# (Eggholder) допуск ослаблен: там численное уточнение упирается
# в шум float64.
KNOWN_MINIMA = {
    "Функция сферы": ([(0, 0)], 1e-3),
    "Функция трёхгорбого верблюда": ([(0, 0)], 1e-3),
    "Функция Экли": ([(0, 0)], 1e-3),
    "Функция Розенброка": ([(1, 1)], 1e-3),
    "Функция Била": ([(3, 0.5)], 1e-3),
    "Функция Гольдштейна-Прайса": ([(0, -1)], 1e-3),
    "Функция Бута": ([(1, 3)], 1e-3),
    "Функция Букина": ([(-10, 1)], 0.05),
    "Функция Матьяса": ([(0, 0)], 1e-3),
    "Функция Леви": ([(1, 1)], 1e-3),
    "Функция Химмельблау": (
        [(3, 2), (-2.805118, 3.131312), (-3.779310, -3.283186), (3.584428, -1.848126)],
        1e-3,
    ),
    "Функция Растригина": ([(0, 0)], 1e-3),
    "Функция Изома": ([(np.pi, np.pi)], 1e-3),
    "Функция Cross-in-tray": (
        [(1.349406, 1.349406), (1.349406, -1.349406), (-1.349406, 1.349406), (-1.349406, -1.349406)],
        1e-3,
    ),
    "Функция Хольдера": (
        [(9.646168, 9.646168), (9.646168, -9.646168), (-9.646168, 9.646168), (-9.646168, -9.646168)],
        1e-3,
    ),
    "Функция МакКормика": ([(-0.547198, -1.547198)], 1e-3),
    "Функция Стыбинского-Танга": ([(-2.903534, -2.903534)], 1e-3),
    "Функция Шаффера": ([(0, 0)], 0.05),
    "Функция Гривенка": ([(0, 0)], 1e-3),
    "Функция Drop-Wave": ([(0, 0)], 1e-3),
    "Функция седловая": ([(0, -5), (0, 5)], 1e-3),
    "Функция обезьянье седло": ([(2, -2), (2, 2)], 1e-3),
    "Функция шестигорбого верблюда": ([(0.089842, -0.712656), (-0.089842, 0.712656)], 1e-3),
    "Функция Захарова": ([(0, 0)], 1e-3),
    "Функция Швефеля": ([(420.9687, 420.9687)], 1e-3),
    "Функция Eggholder": ([(512, 404.2319)], 0.05),
    "Функция Мишры-Бёрда": ([(-3.130247, -1.582142)], 1e-3),
}


def make_function(name):
    function = Function()
    preset = function.standard_functions[name]
    function.set_params((*preset.range, function.count))
    assert function.check_function(preset.formula) != 0
    function.create_surface()
    return function


@pytest.mark.parametrize("name", KNOWN_MINIMA)
def test_known_global_minima(name):
    function = make_function(name)
    expected, tolerance = KNOWN_MINIMA[name]
    found = [tuple(point) for point in function.minima]
    assert len(found) == len(expected)
    for expected_point in expected:
        matches = [point for point in found if np.allclose(point, expected_point, atol=tolerance)]
        assert len(matches) == 1, (expected_point, found)


@pytest.mark.parametrize("name", list(Function().standard_functions))
def test_minima_invariants(name):
    function = make_function(name)
    minima = function.minima

    assert len(minima) >= 1
    values = [float(function(point)) for point in minima]
    best = min(values)

    # уточнённый минимум не хуже лучшего узла сетки
    assert best <= float(np.min(function.y)) + 1e-9 * max(abs(best), 1.0)

    for point, value in zip(minima, values):
        assert function.from_x - 1e-9 <= point[0] <= function.to_x + 1e-9
        assert function.from_y - 1e-9 <= point[1] <= function.to_y + 1e-9
        # все отмеченные минимумы действительно глобальные (равны лучшему)
        assert value <= best + 1e-6 * max(abs(best), 1.0)


def test_minima_cached_and_reset():
    function = make_function("Функция Химмельблау")
    first = function.minima
    assert function.minima is first
    assert function.check_function("x^2 + y^2") == 2
    second = function.minima
    assert second is not first
    assert len(second) == 1
    assert np.allclose(second[0], (0, 0), atol=1e-3)
