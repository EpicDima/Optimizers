import { describe, expect, it } from "vitest";

import type { RunConfig, RunResult } from "@entities/run";

import { buildConvergenceTraces } from "./build-traces";

/** Заведомо больше длины любой серии в тестах — эквивалент «без обрезки». */
const FULL = Number.POSITIVE_INFINITY;

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
    internals: null,
    error: null,
    ...patch,
  };
}

describe("buildConvergenceTraces", () => {
  it("returns an empty array for no slots", () => {
    expect(buildConvergenceTraces([], {}, FULL, "__value__", "lr")).toEqual([]);
  });

  it("excludes slots marked as not visible", () => {
    const slot = makeSlot({ visible: false });
    const results = { [slot.slotId]: makeResult({ lr: [0.1, 0.1, 0.1] }) };
    expect(buildConvergenceTraces([slot], results, FULL, "__value__", "lr")).toEqual([]);
  });

  it("excludes slots whose result has an error", () => {
    const slot = makeSlot();
    const results = { [slot.slotId]: makeResult({ error: "unknown optimizer" }) };
    expect(buildConvergenceTraces([slot], results, FULL, "__value__", "lr")).toEqual([]);
  });

  it("excludes slots with no result at all", () => {
    const slot = makeSlot();
    expect(buildConvergenceTraces([slot], {}, FULL, "__value__", "lr")).toEqual([]);
  });

  it("builds a single step-indexed value trace on the left axis when there is no lr", () => {
    const slot = makeSlot();
    const result = makeResult({ value: [10, 5, 1, 0.5], lr: null });
    const traces = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", "lr");

    expect(traces).toHaveLength(2);
    expect(traces[0]).toMatchObject({
      type: "scatter",
      mode: "lines",
      x: [0, 1, 2, 3],
      y: [10, 5, 1, 0.5],
      line: { color: slot.color, width: 2, dash: "solid" },
      name: slot.optimizer,
      showlegend: false,
      hoverinfo: "x+y+name",
    });
    expect(traces[0]).not.toHaveProperty("yaxis");
  });

  it("adds a small head marker at the current end of the value line", () => {
    const slot = makeSlot();
    const result = makeResult({ value: [10, 5, 1, 0.5], lr: null });
    const [, headMarker] = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", "lr");

    expect(headMarker).toMatchObject({
      type: "scatter",
      mode: "markers",
      x: [3],
      y: [0.5],
      marker: { size: 8, color: slot.color },
      showlegend: false,
      hoverinfo: "skip",
    });
  });

  it("adds a dashed lr trace on the secondary y-axis when lr is present", () => {
    const slot = makeSlot();
    const result = makeResult({ value: [10, 5, 1, 0.5], lr: [0.3, 0.27, 0.24, 0.22] });
    const traces = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", "lr");

    expect(traces).toHaveLength(3);
    const [valueTrace, headMarker, lrTrace] = traces;

    expect(valueTrace).toMatchObject({ line: { color: slot.color, dash: "solid" } });
    expect(valueTrace).not.toHaveProperty("yaxis");

    expect(headMarker).toMatchObject({ mode: "markers", marker: { color: slot.color } });

    expect(lrTrace).toMatchObject({
      type: "scatter",
      mode: "lines",
      x: [0, 1, 2, 3],
      y: [0.3, 0.27, 0.24, 0.22],
      yaxis: "y2",
      line: { color: slot.color, width: 2, dash: "dot" },
      name: `${slot.optimizer} · lr`,
      showlegend: false,
      hoverinfo: "x+y+name",
    });
  });

  it("keeps trace names in hoverinfo so the unified tooltip can tell lines apart", () => {
    const slot = makeSlot();
    const result = makeResult({ lr: [0.1, 0.1] });
    const traces = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", "lr");

    // Кружок-маркер намеренно исключён из единого тултипа (hoverinfo: "skip"),
    // проверка касается только линий значения и lr.
    const lineTraces = traces.filter((trace) => (trace as { mode: string }).mode === "lines");
    for (const trace of lineTraces) {
      expect((trace as { hoverinfo: string }).hoverinfo).toContain("name");
    }
  });

  it("keeps value and lr traces tied to the same slot color", () => {
    const slot = makeSlot({ color: "#32cd32" });
    const result = makeResult({ lr: [0.1, 0.1] });
    const [valueTrace, headMarker, lrTrace] = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", "lr");

    expect((valueTrace as { line: { color: string } }).line.color).toBe(slot.color);
    expect((headMarker as { marker: { color: string } }).marker.color).toBe(slot.color);
    expect((lrTrace as { line: { color: string } }).line.color).toBe(slot.color);
  });

  it("omits the lr trace for optimizers without lr (e.g. LBFGS)", () => {
    const slot = makeSlot({ optimizer: "LBFGS" });
    const result = makeResult({ lr: null });
    const traces = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", "lr");

    expect(traces).toHaveLength(2);
  });

  it("builds traces per visible slot with a valid result", () => {
    const slotA = makeSlot({ slotId: "a", color: "#ff2d2d" });
    const slotB = makeSlot({ slotId: "b", color: "#32cd32", optimizer: "Momentum" });
    const results = {
      a: makeResult({ slotId: "a", lr: [0.1, 0.1, 0.1] }),
      b: makeResult({ slotId: "b", value: [4, 2] }),
    };

    const traces = buildConvergenceTraces([slotA, slotB], results, FULL, "__value__", "lr");
    // slotA: value + marker + lr, slotB: value + marker only
    expect(traces).toHaveLength(5);
  });

  describe("secondaryMetric toggle", () => {
    it("omits lr traces entirely when secondaryMetric is null, even if lr data is present", () => {
      const slot = makeSlot();
      const result = makeResult({ value: [10, 5, 1], lr: [0.3, 0.27, 0.24] });
      const traces = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", null);

      expect(traces).toHaveLength(2);
      expect(traces[0]).not.toHaveProperty("yaxis");
    });

    it("still builds the value trace when secondaryMetric is null", () => {
      const slot = makeSlot();
      const result = makeResult({ value: [10, 5, 1], lr: [0.3, 0.27, 0.24] });
      const [valueTrace] = buildConvergenceTraces([slot], { [slot.slotId]: result }, FULL, "__value__", null);

      expect(valueTrace).toMatchObject({ y: [10, 5, 1] });
    });
  });

  describe("frame truncation", () => {
    it("truncates value and lr series to [0, frame] inclusive", () => {
      const slot = makeSlot();
      const result = makeResult({ value: [10, 5, 1, 0.5], lr: [0.3, 0.27, 0.24, 0.22] });
      const [valueTrace, headMarker, lrTrace] = buildConvergenceTraces([slot], { [slot.slotId]: result }, 1, "__value__", "lr");

      expect(valueTrace).toMatchObject({ x: [0, 1], y: [10, 5] });
      expect(headMarker).toMatchObject({ x: [1], y: [5] });
      expect(lrTrace).toMatchObject({ x: [0, 1], y: [0.3, 0.27] });
    });

    it("clamps frame 0 to a single point", () => {
      const slot = makeSlot();
      const result = makeResult({ value: [10, 5, 1] });
      const [valueTrace] = buildConvergenceTraces([slot], { [slot.slotId]: result }, 0, "__value__", "lr");

      expect(valueTrace).toMatchObject({ x: [0], y: [10] });
    });

    it("clamps a frame past the end of the series to the full series", () => {
      const slot = makeSlot();
      const result = makeResult({ value: [10, 5, 1] });
      const [valueTrace] = buildConvergenceTraces([slot], { [slot.slotId]: result }, 100, "__value__", "lr");

      expect(valueTrace).toMatchObject({ x: [0, 1, 2], y: [10, 5, 1] });
    });

    it("clamps a negative frame to no traces", () => {
      const slot = makeSlot();
      const result = makeResult({ value: [10, 5, 1] });
      const traces = buildConvergenceTraces([slot], { [slot.slotId]: result }, -1, "__value__", "lr");

      expect(traces).toHaveLength(0);
    });
  });
});
