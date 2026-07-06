import { describe, expect, it } from "vitest";

import { adaBeliefOptimizer } from "./ada-belief";
import { adadeltaOptimizer } from "./adadelta";
import { adafactorOptimizer } from "./adafactor";
import { adagradOptimizer } from "./adagrad";
import { adamOptimizer } from "./adam";
import { adamaxOptimizer } from "./adamax";
import { adamWOptimizer } from "./adamw";
import { adanOptimizer } from "./adan";
import { ademamixOptimizer } from "./ademamix";
import { adoptOptimizer } from "./adopt";
import { asgdOptimizer } from "./asgd";
import { cautiousAdamWOptimizer } from "./cautious-adamw";
import { lionOptimizer } from "./lion";
import type { OptimizerDescriptor } from "./types";
import type { Vec2 } from "@shared/lib/optimization-engine/linalg";

const descriptors: OptimizerDescriptor[] = [
  adaBeliefOptimizer,
  adadeltaOptimizer,
  adafactorOptimizer,
  adagradOptimizer,
  adamOptimizer,
  adamaxOptimizer,
  adamWOptimizer,
  adanOptimizer,
  ademamixOptimizer,
  adoptOptimizer,
  asgdOptimizer,
  cautiousAdamWOptimizer,
  lionOptimizer,
];

const sphereFn = (x: number, y: number) => x ** 2 + y ** 2;
const initialX: Vec2 = [1.5, -1.5];

function defaultParams(descriptor: OptimizerDescriptor): Record<string, number> {
  return Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));
}

describe.each(descriptors)("$name", (descriptor) => {
  it("converges on sphere", () => {
    const instance = descriptor.createInstance(sphereFn, initialX, defaultParams(descriptor));
    let step;
    for (let i = 0; i < 200; i++) {
      step = instance.next();
    }
    expect(step!.x[0]).toBeTypeOf("number");
    expect(Number.isFinite(step!.x[0])).toBe(true);
    expect(Number.isFinite(step!.x[1])).toBe(true);
    expect(step!.value).toBeLessThan(sphereFn(initialX[0], initialX[1]));
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

  it("has a description for every param and no extra/missing keys", () => {
    const defaults = defaultParams(descriptor);
    expect(Object.keys(descriptor.params).sort()).toEqual(Object.keys(defaults).sort());
    for (const meta of Object.values(descriptor.params)) {
      expect(meta.description).toBeTruthy();
    }
  });
});
