import { describe, expect, it } from "vitest";

import { functionPresets } from "./presets";

describe("functionPresets", () => {
  it("has exactly 30 entries", () => {
    expect(functionPresets.length).toBe(30);
  });

  it("has the sphere function first, with value 0 at the origin", () => {
    const sphere = functionPresets[0];
    expect(sphere.name).toBe("Функция сферы");
    expect(sphere.range).toEqual([-5, 5, -5, 5]);
    expect(sphere.start).toEqual([-4, 4]);
    expect(sphere.fn(0, 0)).toBe(0);
  });

  it("has the Rosenbrock function with value 0 at its minimum (1, 1)", () => {
    const rosenbrock = functionPresets.find((preset) => preset.name === "Функция Розенброка");
    expect(rosenbrock).toBeDefined();
    expect(rosenbrock?.range).toEqual([-2, 2, -1, 3]);
    expect(rosenbrock?.start).toEqual([-1.2, 1]);
    expect(rosenbrock?.fn(1, 1)).toBe(0);
  });

  it("evaluates the Booth function correctly at its own start point", () => {
    const booth = functionPresets.find((preset) => preset.name === "Функция Бута");
    expect(booth).toBeDefined();
    // (x + 2y - 7)^2 + (2x + y - 5)^2 at (-8, -8): (-8-16-7)^2 + (-16-8-5)^2 = (-31)^2 + (-29)^2
    expect(booth?.fn(-8, -8)).toBeCloseTo((-31) ** 2 + (-29) ** 2, 10);
  });

  it("evaluates the Himmelblau function correctly at its start point (0, 0)", () => {
    const himmelblau = functionPresets.find((preset) => preset.name === "Функция Химмельблау");
    expect(himmelblau).toBeDefined();
    // (0 + 0 - 11)^2 + (0 + 0 - 7)^2 = 121 + 49 = 170
    expect(himmelblau?.fn(0, 0)).toBeCloseTo(170, 10);
  });

  it("evaluates the saddle function correctly at its start point", () => {
    const saddle = functionPresets.find((preset) => preset.name === "Функция седловая");
    expect(saddle).toBeDefined();
    // x^2 - y^2 at (4, 0.01): 16 - 0.0001
    expect(saddle?.fn(4, 0.01)).toBeCloseTo(16 - 0.0001, 10);
  });

  it("evaluates the Zakharov function correctly at the origin", () => {
    const zakharov = functionPresets.find((preset) => preset.name === "Функция Захарова");
    expect(zakharov).toBeDefined();
    expect(zakharov?.fn(0, 0)).toBe(0);
  });
});
