import { describe, expect, it } from "vitest";

import { getSchedulerDescriptor, schedulerNames } from "./registry";
import type { SchedulerDescriptor } from "./types";

function descriptorFor(name: string): SchedulerDescriptor {
  const descriptor = getSchedulerDescriptor(name);
  if (!descriptor) throw new Error(`unknown scheduler: ${name}`);
  return descriptor;
}

function defaultParams(descriptor: SchedulerDescriptor): Record<string, number> {
  return Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));
}

describe("schedulerNames", () => {
  it("lists Constant first, then the rest sorted alphabetically case-insensitively", () => {
    expect(schedulerNames()).toEqual([
      "Constant",
      "CosineAnnealing",
      "CosineWarmRestarts",
      "Cyclical",
      "ExponentialDecay",
      "InverseTimeDecay",
      "LinearDecay",
      "Noam",
      "OneCycle",
      "PolynomialDecay",
      "REX",
      "StepDecay",
      "WarmupCosine",
      "WSD",
    ]);
  });
});

describe("scheduler properties", () => {
  it.each(schedulerNames())("%s produces finite, non-negative learning rates over 100 steps", (name) => {
    const descriptor = descriptorFor(name);
    const params = defaultParams(descriptor);
    const lrs = Array.from({ length: 100 }, (_, step) => descriptor.lr(params, step, 100, 0.5));
    expect(lrs.every((lr) => Number.isFinite(lr))).toBe(true);
    expect(lrs.every((lr) => lr >= 0)).toBe(true);
    expect(Math.max(...lrs)).toBeGreaterThan(0);
  });

  it.each(schedulerNames())("%s does not crash for short horizons of totalSteps in 1..3", (name) => {
    const descriptor = descriptorFor(name);
    const params = defaultParams(descriptor);
    for (const totalSteps of [1, 2, 3]) {
      for (let step = 0; step < totalSteps; step++) {
        expect(Number.isFinite(descriptor.lr(params, step, totalSteps, 0.5))).toBe(true);
      }
    }
  });

  it.each(schedulerNames())("%s is deterministic across repeated calls with identical arguments", (name) => {
    const descriptor = descriptorFor(name);
    const params = defaultParams(descriptor);
    const first = Array.from({ length: 100 }, (_, step) => descriptor.lr(params, step, 100, 0.5));
    const second = Array.from({ length: 100 }, (_, step) => descriptor.lr(params, step, 100, 0.5));
    expect(first).toEqual(second);
  });

  it.each(schedulerNames())("%s scales linearly with baseLr", (name) => {
    const descriptor = descriptorFor(name);
    const params = defaultParams(descriptor);
    for (let step = 0; step < 100; step += 7) {
      const doubled = descriptor.lr(params, step, 100, 0.6);
      const base = descriptor.lr(params, step, 100, 0.3);
      expect(doubled).toBeCloseTo(2 * base, 9);
    }
  });

  it.each(schedulerNames())("%s has a non-empty description for every parameter", (name) => {
    const descriptor = descriptorFor(name);
    expect(Object.values(descriptor.params).every((meta) => Boolean(meta.description))).toBe(true);
  });
});

describe("constantScheduler", () => {
  it("returns baseLr exactly regardless of step or totalSteps", () => {
    const descriptor = descriptorFor("Constant");
    expect(descriptor.lr({}, 0, 100, 0.37)).toBe(0.37);
    expect(descriptor.lr({}, 99, 100, 0.37)).toBe(0.37);
  });
});
