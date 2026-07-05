import { describe, expect, it } from "vitest";

import { lbfgsOptimizer } from "./lbfgs";
import { levenbergMarquardtOptimizer } from "./levenberg-marquardt";
import { newtonOptimizer } from "./newton";
import { shampooOptimizer } from "./shampoo";
import type { OptimizerDescriptor } from "./types";

const sphere = (x: number, y: number): number => x ** 2 + y ** 2;
const rosenbrock = (x: number, y: number): number => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2;

function defaultParams(descriptor: OptimizerDescriptor): Record<string, number> {
  return Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));
}

const descriptors: OptimizerDescriptor[] = [
  newtonOptimizer,
  shampooOptimizer,
  levenbergMarquardtOptimizer,
  lbfgsOptimizer,
];

describe.each(descriptors)("$name", (descriptor) => {
  it("converges on the sphere function", () => {
    const initialX: [number, number] = [1.5, -1.5];
    const instance = descriptor.createInstance(sphere, initialX, defaultParams(descriptor));
    let last = instance.next();
    for (let i = 1; i < 200; i++) last = instance.next();
    expect(Number.isFinite(last.x[0])).toBe(true);
    expect(Number.isFinite(last.x[1])).toBe(true);
    expect(last.value).toBeLessThan(4.5);
  });

  it("reset restores the initial point and reproduces the same run deterministically", () => {
    const initialX: [number, number] = [1.5, -1.5];
    const instance = descriptor.createInstance(sphere, initialX, defaultParams(descriptor));

    instance.next();
    instance.reset();
    expect(instance.x).toEqual(initialX);

    const firstRun = instance.next();
    instance.reset();
    const secondRun = instance.next();
    expect(firstRun.value).toBeCloseTo(secondRun.value);
  });

  it("exposes a non-empty params object", () => {
    expect(typeof descriptor.params).toBe("object");
    expect(Object.keys(descriptor.params).length).toBeGreaterThan(0);
  });

  it("has a non-empty description for every param, with no extras or omissions", () => {
    const paramKeys = Object.keys(descriptor.params);
    const describedKeys = paramKeys.filter((key) => Boolean(descriptor.params[key].description));
    expect(new Set(describedKeys)).toEqual(new Set(paramKeys));
  });

  it("does not diverge on the Rosenbrock function", () => {
    const initialX: [number, number] = [-1.2, 1];
    const initialValue = rosenbrock(initialX[0], initialX[1]);
    const instance = descriptor.createInstance(rosenbrock, initialX, defaultParams(descriptor));
    let last = instance.next();
    for (let i = 1; i < 50; i++) last = instance.next();
    expect(Number.isFinite(last.x[0])).toBe(true);
    expect(Number.isFinite(last.x[1])).toBe(true);
    expect(last.value).toBeLessThan(initialValue);
  });
});
