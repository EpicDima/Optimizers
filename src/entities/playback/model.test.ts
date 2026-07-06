import { describe, expect, it } from "vitest";

import { clamp, computeMaxFrame, formatSpeed, speedFromStep } from "./model";

describe("speedFromStep", () => {
  it.each([
    [-3, 0.125],
    [0, 1],
    [6, 64],
  ])("2**%i -> %s", (step, expected) => {
    expect(speedFromStep(step)).toBe(expected);
  });
});

describe("formatSpeed", () => {
  it.each([
    [-3, "×0.125"],
    [0, "×1"],
    [6, "×64"],
  ])("trims trailing zeros for step %i", (step, expected) => {
    expect(formatSpeed(step)).toBe(expected);
  });
});

describe("clamp", () => {
  it("clamps below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("passes through in-range values", () => {
    expect(clamp(4, 0, 10)).toBe(4);
  });
});

describe("computeMaxFrame", () => {
  it("returns 0 when there are no results", () => {
    expect(computeMaxFrame([])).toBe(0);
  });

  it("takes the longest run's last index", () => {
    // три слота: 1 шаг (ещё не считался, дефолт длина 1), 100 шагов, 42 шага
    expect(computeMaxFrame([1, 100, 42])).toBe(99);
  });

  it("never goes negative for empty trajectories", () => {
    expect(computeMaxFrame([0, 0])).toBe(0);
  });
});
