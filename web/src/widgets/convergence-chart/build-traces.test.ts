import { describe, expect, it } from "vitest";

import type { RunConfig, RunResult } from "@entities/run";

import { buildConvergenceTraces } from "./build-traces";

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
    const results = { [slot.slotId]: makeResult({ lr: [0.1, 0.1, 0.1] }) };
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

  it("builds a single step-indexed value trace on the left axis when there is no lr", () => {
    const slot = makeSlot();
    const result = makeResult({ value: [10, 5, 1, 0.5], lr: null });
    const traces = buildConvergenceTraces([slot], { [slot.slotId]: result });

    expect(traces).toHaveLength(1);
    expect(traces[0]).toMatchObject({
      type: "scatter",
      mode: "lines",
      x: [0, 1, 2, 3],
      y: [10, 5, 1, 0.5],
      line: { color: slot.color, width: 2, dash: "solid" },
      name: slot.optimizer,
      showlegend: false,
    });
    expect(traces[0]).not.toHaveProperty("yaxis");
  });

  it("adds a dashed lr trace on the secondary y-axis when lr is present", () => {
    const slot = makeSlot();
    const result = makeResult({ value: [10, 5, 1, 0.5], lr: [0.3, 0.27, 0.24, 0.22] });
    const traces = buildConvergenceTraces([slot], { [slot.slotId]: result });

    expect(traces).toHaveLength(2);
    const [valueTrace, lrTrace] = traces;

    expect(valueTrace).toMatchObject({ line: { color: slot.color, dash: "solid" } });
    expect(valueTrace).not.toHaveProperty("yaxis");

    expect(lrTrace).toMatchObject({
      type: "scatter",
      mode: "lines",
      x: [0, 1, 2, 3],
      y: [0.3, 0.27, 0.24, 0.22],
      yaxis: "y2",
      line: { color: slot.color, width: 2, dash: "dot" },
      name: `${slot.optimizer} · lr`,
      showlegend: false,
    });
  });

  it("keeps value and lr traces tied to the same slot color", () => {
    const slot = makeSlot({ color: "#32cd32" });
    const result = makeResult({ lr: [0.1, 0.1] });
    const [valueTrace, lrTrace] = buildConvergenceTraces([slot], { [slot.slotId]: result });

    expect((valueTrace as { line: { color: string } }).line.color).toBe(slot.color);
    expect((lrTrace as { line: { color: string } }).line.color).toBe(slot.color);
  });

  it("omits the lr trace for optimizers without lr (e.g. LBFGS)", () => {
    const slot = makeSlot({ optimizer: "LBFGS" });
    const result = makeResult({ lr: null });
    const traces = buildConvergenceTraces([slot], { [slot.slotId]: result });

    expect(traces).toHaveLength(1);
  });

  it("builds traces per visible slot with a valid result", () => {
    const slotA = makeSlot({ slotId: "a", color: "#ff2d2d" });
    const slotB = makeSlot({ slotId: "b", color: "#32cd32", optimizer: "Momentum" });
    const results = {
      a: makeResult({ slotId: "a", lr: [0.1, 0.1, 0.1] }),
      b: makeResult({ slotId: "b", value: [4, 2] }),
    };

    const traces = buildConvergenceTraces([slotA, slotB], results);
    // slotA: value + lr, slotB: value only
    expect(traces).toHaveLength(3);
  });
});
