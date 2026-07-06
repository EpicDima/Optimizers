import { describe, expect, it } from "vitest";

import { functionPresets, gradient, hessian } from "./functions";
import { getOptimizerDescriptor } from "./optimizers";
import { getSchedulerDescriptor } from "./schedulers";

// сгенерированы scripts/export_golden_fixtures.py из эталонной Python-реализации —
// ловят числовые расхождения, которые property-тесты структурно не поймают
// (см. комментарий в самом скрипте)
import calculusFixtureJson from "./__fixtures__/golden/calculus.json";
import optimizersFixtureJson from "./__fixtures__/golden/optimizers.json";
import schedulersFixtureJson from "./__fixtures__/golden/schedulers.json";

// не бит-в-бит: Math.cos/Math.sqrt в V8 и numpy/C дают безобидное расхождение на уровне ULP
const EPSILON = 1e-8;
// за десятки шагов адаптивных методов (damping, line search) ULP-шум накапливается сильнее
const TRAJECTORY_EPSILON = 1e-6;

function expectClose(actual: number, expected: number, epsilon = EPSILON): void {
  expect(Math.abs(actual - expected)).toBeLessThan(epsilon);
}

interface CalculusFixture {
  points: {
    function: "rosenbrock" | "eggholder" | "schwefel";
    x: number;
    y: number;
    grad: [number, number];
    hesse: [[number, number], [number, number]];
  }[];
}

interface OptimizerTrajectoryFixture {
  x: number[];
  y: number[];
  value: number[];
}

interface SchedulerFixture {
  totalSteps: number;
  baseLr: number;
  lr: number[];
}

const PRESET_NAME_BY_FIXTURE_KEY: Record<CalculusFixture["points"][number]["function"], string> = {
  rosenbrock: "Функция Розенброка",
  eggholder: "Функция Eggholder",
  schwefel: "Функция Швефеля",
};

function fnByPresetName(name: string): (x: number, y: number) => number {
  const preset = functionPresets.find((p) => p.name === name);
  if (!preset) throw new Error(`unknown preset: ${name}`);
  return preset.fn;
}

describe("golden fixtures: calculus", () => {
  const fixture = calculusFixtureJson as CalculusFixture;

  it.each(fixture.points)("$function grad/hesse at ($x, $y) matches Python", (point) => {
    const fn = fnByPresetName(PRESET_NAME_BY_FIXTURE_KEY[point.function]);
    const [gx, gy] = gradient(fn, point.x, point.y);
    expectClose(gx, point.grad[0]);
    expectClose(gy, point.grad[1]);

    const hesse = hessian(fn, point.x, point.y);
    expectClose(hesse[0][0], point.hesse[0][0]);
    expectClose(hesse[0][1], point.hesse[0][1]);
    expectClose(hesse[1][0], point.hesse[1][0]);
    expectClose(hesse[1][1], point.hesse[1][1]);
  });
});

describe("golden fixtures: optimizers on Rosenbrock from (-1.2, 1)", () => {
  const fixture = optimizersFixtureJson as Record<string, OptimizerTrajectoryFixture>;
  const rosenbrock = fnByPresetName("Функция Розенброка");

  it.each(Object.keys(fixture))("%s trajectory matches Python step by step", (name) => {
    const expected = fixture[name];
    const descriptor = getOptimizerDescriptor(name);
    if (!descriptor) throw new Error(`unknown optimizer: ${name}`);
    const params = Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));
    const instance = descriptor.createInstance(rosenbrock, [expected.x[0], expected.y[0]], params);

    const steps = expected.x.length - 1;
    for (let step = 0; step < steps; step++) {
      const point = instance.next();
      expectClose(point.x[0], expected.x[step + 1], TRAJECTORY_EPSILON);
      expectClose(point.x[1], expected.y[step + 1], TRAJECTORY_EPSILON);
      expectClose(point.value, expected.value[step + 1], TRAJECTORY_EPSILON);
    }
  });
});

describe("golden fixtures: schedulers at phase boundaries", () => {
  const fixture = schedulersFixtureJson as Record<string, SchedulerFixture>;

  it.each(Object.keys(fixture))("%s lr curve matches Python across all steps", (name) => {
    const expected = fixture[name];
    const descriptor = getSchedulerDescriptor(name);
    if (!descriptor) throw new Error(`unknown scheduler: ${name}`);
    const params = Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));

    for (let step = 0; step < expected.totalSteps; step++) {
      const lr = descriptor.lr(params, step, expected.totalSteps, expected.baseLr);
      expectClose(lr, expected.lr[step]);
    }
  });
});
