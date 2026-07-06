import { describe, expect, it } from "vitest";

import { gradient, hessian } from "./calculus";

const sphere = (x: number, y: number) => x ** 2 + y ** 2;

describe("gradient", () => {
  it.each<[number, number]>([
    [0, 0],
    [1, 2],
    [-3, 4.5],
  ])("matches the analytic gradient [2x, 2y] at (%d, %d)", (x, y) => {
    const [gx, gy] = gradient(sphere, x, y);
    expect(gx).toBeCloseTo(2 * x, 6);
    expect(gy).toBeCloseTo(2 * y, 6);
  });
});

describe("hessian", () => {
  it.each<[number, number]>([
    [0, 0],
    [1, 2],
    [-3, 4.5],
  ])("matches the analytic hessian [[2,0],[0,2]] at (%d, %d)", (x, y) => {
    const [[fxx, fxy], [fyx, fyy]] = hessian(sphere, x, y);
    expect(fxx).toBeCloseTo(2, 6);
    expect(fyy).toBeCloseTo(2, 6);
    expect(fxy).toBeCloseTo(0, 6);
    expect(fyx).toBeCloseTo(0, 6);
  });
});
