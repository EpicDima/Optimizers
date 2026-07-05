import { describe, expect, it } from "vitest";

import type { RunConfig, RunResult } from "@entities/run";

import { buildConvergenceTraces, buildLrTraces } from "./build-traces";

function makeSlot(patch: Partial<RunConfig> = {}): RunConfig {
  return {
    slotId: "slot-1",
    optimizer: "Adam",
    optimizerParams: {},
    scheduler: "Constant",
    schedulerParams: {},
    start: [0, 0],
    color: "#ff2d2d",
    visible: true,
    ...patch,
  };
}

function makeResult(patch: Partial<RunResult> = {}): RunResult {
  return {
    slotId: "slot-1",
    x: [0, 1, 2],
    y: [0, 1, 2],
    value: [10, 5, 1],
    lr: null,
    error: null,
    ...patch,
  };
}

describe("buildConvergenceTraces", () => {
  it("returns an empty array for no slots", () => {
    expect(buildConvergenceTraces([], {})).toEqual([]);
  });

  it("excludes slots marked as not visible", () => {
    const slot = makeSlot({ visible: false });
    const results = { [slot.slotId]: makeResult() };
    expect(buildConvergenceTraces([slot], results)).toEqual([]);
  });

  it("excludes slots whose result has an error", () => {
    const slot = makeSlot();
    const results = { [slot.slotId]: makeResult({ error: "unknown optimizer" }) };
    expect(buildConvergenceTraces([slot], results)).toEqual([]);
  });

  it("excludes slots with no result at all", () => {
    const slot = makeSlot();
    expect(buildConvergenceTraces([slot], {})).toEqual([]);
  });

  it("builds a step-indexed x/y trace for a normal populated result", () => {
    const slot = makeSlot();
    const result = makeResult({ value: [10, 5, 1, 0.5] });
    const [trace] = buildConvergenceTraces([slot], { [slot.slotId]: result });

    expect(trace).toMatchObject({
      type: "scatter",
      mode: "lines",
      x: [0, 1, 2, 3],
      y: [10, 5, 1, 0.5],
      line: { color: slot.color, width: 2 },
      name: slot.optimizer,
      showlegend: false,
    });
  });

  it("builds one trace per visible slot with a valid result", () => {
    const slotA = makeSlot({ slotId: "a", color: "#ff2d2d" });
    const slotB = makeSlot({ slotId: "b", color: "#32cd32", optimizer: "Momentum" });
    const results = {
      a: makeResult({ slotId: "a" }),
      b: makeResult({ slotId: "b", value: [4, 2] }),
    };

    const traces = buildConvergenceTraces([slotA, slotB], results);
    expect(traces).toHaveLength(2);
  });
});

describe("buildLrTraces", () => {
  it("returns an empty array for no slots", () => {
    expect(buildLrTraces([], {})).toEqual([]);
  });

  it("excludes slots marked as not visible", () => {
    const slot = makeSlot({ visible: false });
    const results = { [slot.slotId]: makeResult({ lr: [0.1, 0.1, 0.1] }) };
    expect(buildLrTraces([slot], results)).toEqual([]);
  });

  it("excludes slots whose result has an error", () => {
    const slot = makeSlot();
    const results = { [slot.slotId]: makeResult({ lr: [0.1, 0.1, 0.1], error: "unknown optimizer" }) };
    expect(buildLrTraces([slot], results)).toEqual([]);
  });

  it("excludes slots with no result at all", () => {
    const slot = makeSlot();
    expect(buildLrTraces([slot], {})).toEqual([]);
  });

  it("excludes slots whose optimizer has no lr (e.g. LBFGS)", () => {
    const slot = makeSlot({ optimizer: "LBFGS" });
    const results = { [slot.slotId]: makeResult({ lr: null }) };
    expect(buildLrTraces([slot], results)).toEqual([]);
  });

  it("builds a step-indexed x/y trace from the lr series", () => {
    const slot = makeSlot();
    const result = makeResult({ lr: [0.1, 0.09, 0.081, 0.073] });
    const [trace] = buildLrTraces([slot], { [slot.slotId]: result });

    expect(trace).toMatchObject({
      type: "scatter",
      mode: "lines",
      x: [0, 1, 2, 3],
      y: [0.1, 0.09, 0.081, 0.073],
      line: { color: slot.color, width: 2 },
      name: slot.optimizer,
      showlegend: false,
    });
  });

  it("builds one trace per visible slot with a non-null lr series", () => {
    const slotA = makeSlot({ slotId: "a", color: "#ff2d2d" });
    const slotB = makeSlot({ slotId: "b", color: "#32cd32", optimizer: "LBFGS" });
    const results = {
      a: makeResult({ slotId: "a", lr: [0.1, 0.1] }),
      b: makeResult({ slotId: "b", lr: null }),
    };

    const traces = buildLrTraces([slotA, slotB], results);
    expect(traces).toHaveLength(1);
  });
});
