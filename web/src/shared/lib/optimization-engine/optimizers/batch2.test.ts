import { describe, expect, it } from "vitest";

import type { OptimizerDescriptor } from "./types";
import type { Vec2 } from "@shared/lib/optimization-engine/linalg";
import { marsOptimizer } from "./mars";
import { momentumOptimizer } from "./momentum";
import { nAdamOptimizer } from "./nadam";
import { nesterovOptimizer } from "./nesterov";
import { prodigyOptimizer } from "./prodigy";
import { quickPropOptimizer } from "./quickprop";
import { rAdamOptimizer } from "./radam";
import { rmsPropOptimizer } from "./rmsprop";
import { rpropOptimizer } from "./rprop";
import { scheduleFreeAdamWOptimizer } from "./schedule-free-adamw";
import { sgdOptimizer } from "./sgd";
import { sophiaOptimizer } from "./sophia";

const descriptors: OptimizerDescriptor[] = [
  marsOptimizer,
  momentumOptimizer,
  nAdamOptimizer,
  nesterovOptimizer,
  prodigyOptimizer,
  quickPropOptimizer,
  rAdamOptimizer,
  rmsPropOptimizer,
  rpropOptimizer,
  scheduleFreeAdamWOptimizer,
  sgdOptimizer,
  sophiaOptimizer,
];

const sphereFn = (x: number, y: number): number => x ** 2 + y ** 2;
const initialX: Vec2 = [1.5, -1.5];

function defaultParams(descriptor: OptimizerDescriptor): Record<string, number> {
  return Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));
}

describe.each(descriptors)("$name", (descriptor) => {
  it("converges on sphere", () => {
    const instance = descriptor.createInstance(sphereFn, initialX, defaultParams(descriptor));
    let step = { x: instance.x, value: sphereFn(initialX[0], initialX[1]) };
    for (let i = 0; i < 200; i++) {
      step = instance.next();
    }
    expect(step.x.every((coord) => Number.isFinite(coord))).toBe(true);
    expect(step.value).toBeLessThan(sphereFn(initialX[0], initialX[1]));
  });

  it("reset restores initial point and is deterministic", () => {
    const instance = descriptor.createInstance(sphereFn, initialX, defaultParams(descriptor));

    instance.next();
    instance.reset();
    expect(instance.x).toEqual(initialX);

    const firstRun = instance.next();

    instance.reset();
    const secondRun = instance.next();

    expect(firstRun.value).toBeCloseTo(secondRun.value);
  });

  it("exposes a non-empty params object", () => {
    expect(Object.keys(descriptor.params).length).toBeGreaterThan(0);
  });

  it("has a description for every param, with no extra or missing keys", () => {
    const params = defaultParams(descriptor);
    expect(Object.keys(descriptor.params).sort()).toEqual(Object.keys(params).sort());
    expect(Object.values(descriptor.params).every((meta) => Boolean(meta.description))).toBe(true);
  });
});
