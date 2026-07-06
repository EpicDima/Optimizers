import { describe, expect, it } from "vitest";

import { getOptimizerDescriptor, optimizerNames } from "./registry";

describe("optimizerNames", () => {
  it("lists all 29 optimizers sorted like Python's sorted() (case-sensitive, ASCII order)", () => {
    expect(optimizerNames()).toEqual([
      "ADOPT",
      "ASGD",
      "AdEMAMix",
      "AdaBelief",
      "Adadelta",
      "Adafactor",
      "Adagrad",
      "Adam",
      "AdamW",
      "Adamax",
      "Adan",
      "CautiousAdamW",
      "LBFGS",
      "LevenbergMarquardt",
      "Lion",
      "MARS",
      "Momentum",
      "NAdam",
      "Nesterov",
      "Newton",
      "Prodigy",
      "QuickProp",
      "RAdam",
      "RMSprop",
      "Rprop",
      "SGD",
      "ScheduleFreeAdamW",
      "Shampoo",
      "Sophia",
    ]);
  });
});

describe("getOptimizerDescriptor", () => {
  it.each(optimizerNames())("resolves %s to a descriptor with a matching name", (name) => {
    const descriptor = getOptimizerDescriptor(name);
    expect(descriptor?.name).toBe(name);
  });

  it("returns undefined for an unknown name", () => {
    expect(getOptimizerDescriptor("NotAnOptimizer")).toBeUndefined();
  });
});
