import { describe, expect, it } from "vitest";

import { findMinima } from "./minima";
import { functionPresets } from "./presets";
import { buildSurface } from "./surface";

// Function.py::create_surface строит поверхность с count=200 — та же сетка,
// на которой найдены KNOWN_MINIMA в tests/test_function_minima.py
const GRID_COUNT = 200;

// Порт KNOWN_MINIMA из tests/test_function_minima.py: известные из литературы
// глобальные минимумы предустановок в пределах их области + допуск по координатам
const KNOWN_MINIMA: Record<string, { points: ReadonlyArray<readonly [number, number]>; tolerance: number }> = {
  "Функция сферы": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция трёхгорбого верблюда": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция Экли": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция Розенброка": { points: [[1, 1]], tolerance: 1e-3 },
  "Функция Била": { points: [[3, 0.5]], tolerance: 1e-3 },
  "Функция Гольдштейна-Прайса": { points: [[0, -1]], tolerance: 1e-3 },
  "Функция Бута": { points: [[1, 3]], tolerance: 1e-3 },
  "Функция Букина": { points: [[-10, 1]], tolerance: 0.05 },
  "Функция Матьяса": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция Леви": { points: [[1, 1]], tolerance: 1e-3 },
  "Функция Химмельблау": {
    points: [
      [3, 2],
      [-2.805118, 3.131312],
      [-3.77931, -3.283186],
      [3.584428, -1.848126],
    ],
    tolerance: 1e-3,
  },
  "Функция Растригина": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция Изома": { points: [[Math.PI, Math.PI]], tolerance: 1e-3 },
  "Функция Cross-in-tray": {
    points: [
      [1.349406, 1.349406],
      [1.349406, -1.349406],
      [-1.349406, 1.349406],
      [-1.349406, -1.349406],
    ],
    tolerance: 1e-3,
  },
  "Функция Хольдера": {
    points: [
      [9.646168, 9.646168],
      [9.646168, -9.646168],
      [-9.646168, 9.646168],
      [-9.646168, -9.646168],
    ],
    tolerance: 1e-3,
  },
  "Функция МакКормика": { points: [[-0.547198, -1.547198]], tolerance: 1e-3 },
  "Функция Стыбинского-Танга": { points: [[-2.903534, -2.903534]], tolerance: 1e-3 },
  "Функция Шаффера": { points: [[0, 0]], tolerance: 0.05 },
  "Функция Гривенка": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция Drop-Wave": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция седловая": {
    points: [
      [0, -5],
      [0, 5],
    ],
    tolerance: 1e-3,
  },
  "Функция обезьянье седло": {
    points: [
      [2, -2],
      [2, 2],
    ],
    tolerance: 1e-3,
  },
  "Функция шестигорбого верблюда": {
    points: [
      [0.089842, -0.712656],
      [-0.089842, 0.712656],
    ],
    tolerance: 1e-3,
  },
  "Функция Захарова": { points: [[0, 0]], tolerance: 1e-3 },
  "Функция Швефеля": { points: [[420.9687, 420.9687]], tolerance: 1e-3 },
  "Функция Eggholder": { points: [[512, 404.2319]], tolerance: 0.05 },
  "Функция Мишры-Бёрда": { points: [[-3.130247, -1.582142]], tolerance: 1e-3 },
};

function presetByName(name: string) {
  const preset = functionPresets.find((candidate) => candidate.name === name);
  if (!preset) throw new Error(`unknown preset: ${name}`);
  return preset;
}

describe("findMinima matches the literature's known global minima", () => {
  it.each(Object.entries(KNOWN_MINIMA))("finds the expected minima for %s", (name, { points, tolerance }) => {
    const preset = presetByName(name);
    const grid = buildSurface(preset.fn, preset.range, GRID_COUNT);

    const found = findMinima(preset.fn, preset.range, grid);

    expect(found.length).toBe(points.length);
    for (const expected of points) {
      const matches = found.filter(
        (point) => Math.hypot(point[0] - expected[0], point[1] - expected[1]) <= tolerance,
      );
      expect(matches.length).toBe(1);
    }
  });
});

describe("findMinima invariants hold for every preset", () => {
  it.each(functionPresets)("holds for $name", (preset) => {
    const grid = buildSurface(preset.fn, preset.range, GRID_COUNT);

    const minima = findMinima(preset.fn, preset.range, grid);
    expect(minima.length).toBeGreaterThanOrEqual(1);

    const values = minima.map((point) => preset.fn(point[0], point[1]));
    const best = Math.min(...values);
    const gridMin = Math.min(...grid.z.flat());
    // уточнённый минимум не хуже лучшего узла сетки
    expect(best).toBeLessThanOrEqual(gridMin + 1e-9 * Math.max(Math.abs(best), 1));

    const [fromX, toX, fromY, toY] = preset.range;
    minima.forEach((point, idx) => {
      expect(point[0]).toBeGreaterThanOrEqual(fromX - 1e-9);
      expect(point[0]).toBeLessThanOrEqual(toX + 1e-9);
      expect(point[1]).toBeGreaterThanOrEqual(fromY - 1e-9);
      expect(point[1]).toBeLessThanOrEqual(toY + 1e-9);
      // все отмеченные минимумы действительно глобальные (равны лучшему)
      expect(values[idx]).toBeLessThanOrEqual(best + 1e-6 * Math.max(Math.abs(best), 1));
    });
  });
});
