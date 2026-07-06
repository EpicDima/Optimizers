"""Разовая генерация golden-фикстур для сверки TS-порта вычислительного
движка (web/src/shared/lib/optimization-engine/) с эталонной Python-
реализацией.

Property-тесты (сходимость на сфере, границы и т.п.) перенесены отдельно
и один в один для всех оптимизаторов/планировщиков. Эти фикстуры точечно
ловят числовые расхождения, которые property-тесты структурно не могут
поймать: eps-чувствительность конечных разностей на функциях с большими
по модулю аргументами (Eggholder, Швефель), накопление ошибки в матричной
арифметике Newton/Shampoo/LevenbergMarquardt/LBFGS, кусочные формулы
планировщиков на границах фаз.

Запуск: uv run python scripts/export_golden_fixtures.py
"""

import json
from pathlib import Path

import numpy as np

from Function import Function
from optimizers.LBFGS import LBFGS
from optimizers.LevenbergMarquardt import LevenbergMarquardt
from optimizers.Newton import Newton
from optimizers.Shampoo import Shampoo
from schedulers.CosineWarmRestarts import CosineWarmRestarts
from schedulers.Noam import Noam
from schedulers.OneCycle import OneCycle
from schedulers.REX import REX
from schedulers.WSD import WSD

OUTPUT_DIR = (
    Path(__file__).resolve().parent.parent
    / "web"
    / "src"
    / "shared"
    / "lib"
    / "optimization-engine"
    / "__fixtures__"
    / "golden"
)

ROSENBROCK = "(1 - x)^2 + 100 * (y - x^2)^2"
EGGHOLDER = "-(y + 47) * sin(sqrt(abs(x / 2 + y + 47))) - x * sin(sqrt(abs(x - y - 47)))"
SCHWEFEL = "418.9829 * 2 - x * sin(sqrt(abs(x))) - y * sin(sqrt(abs(y)))"

# точки со скромными и с большими по модулю аргументами — вторые нужны,
# чтобы поймать eps-чувствительность конечных разностей
CALCULUS_CASES = {
    "rosenbrock": (ROSENBROCK, [(-1.2, 1.0), (2.0, -1.0), (0.5, 0.5)]),
    "eggholder": (EGGHOLDER, [(0.0, 0.0), (200.0, -300.0), (-450.0, 400.0)]),
    "schwefel": (SCHWEFEL, [(-100.0, -100.0), (300.0, -250.0), (500.0, 500.0)]),
}


def export_calculus(function: Function) -> dict:
    points = []
    for name, (formula, cases) in CALCULUS_CASES.items():
        function.check_function(formula)
        for x, y in cases:
            point = np.array([x, y], dtype=float)
            grad = function.grad(point)
            hesse = function.hesse(point)
            points.append(
                {
                    "function": name,
                    "x": x,
                    "y": y,
                    "grad": grad.tolist(),
                    "hesse": hesse.tolist(),
                }
            )
    return {"points": points}


def run_optimizer(cls, initial: tuple[float, float], function: Function, steps: int) -> dict:
    optimizer = cls(np.array(initial, dtype=float), function)
    xs = [float(optimizer.x[0])]
    ys = [float(optimizer.x[1])]
    values = [float(function(optimizer.x))]
    for _ in range(steps):
        point, value = optimizer.next_point()
        xs.append(float(point[0]))
        ys.append(float(point[1]))
        values.append(float(value))
    return {"x": xs, "y": ys, "value": values}


def export_optimizers(function: Function) -> dict:
    function.check_function(ROSENBROCK)
    start = (-1.2, 1.0)
    return {
        "Newton": run_optimizer(Newton, start, function, 50),
        "Shampoo": run_optimizer(Shampoo, start, function, 50),
        "LevenbergMarquardt": run_optimizer(LevenbergMarquardt, start, function, 30),
        "LBFGS": run_optimizer(LBFGS, start, function, 30),
    }


def export_schedulers() -> dict:
    total_steps = 100
    base_lr = 0.5
    schedulers = {
        "OneCycle": OneCycle(),
        "CosineWarmRestarts": CosineWarmRestarts(),
        "WSD": WSD(),
        "REX": REX(),
        "Noam": Noam(),
    }
    return {
        name: {
            "totalSteps": total_steps,
            "baseLr": base_lr,
            "lr": [scheduler.lr(step, total_steps, base_lr) for step in range(total_steps)],
        }
        for name, scheduler in schedulers.items()
    }


def main() -> None:
    function = Function()
    fixtures = {
        "calculus": export_calculus(function),
        "optimizers": export_optimizers(function),
        "schedulers": export_schedulers(),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, data in fixtures.items():
        path = OUTPUT_DIR / f"{name}.json"
        path.write_text(json.dumps(data, indent=1), encoding="utf-8")
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
