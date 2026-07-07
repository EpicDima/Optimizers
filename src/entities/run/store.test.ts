import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RunProgress } from "@shared/lib/optimization-engine/run";

import { computeRuns } from "./api";
import type { RunConfig, RunResult } from "./model";
import { useRunsStore } from "./store";

vi.mock("./api", () => ({ computeRuns: vi.fn() }));

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

beforeEach(() => {
  vi.mocked(computeRuns).mockReset();
  useRunsStore.setState({ slots: [], results: {}, globalStart: [-4, 4], isRunning: false, progress: null, error: null });
});

describe("resetSlotStarts", () => {
  it("resets every slot's start to the current globalStart", () => {
    const slotA = makeSlot({ slotId: "a", start: [3.7, -2.1] });
    const slotB = makeSlot({ slotId: "b", start: [5, 5] });
    useRunsStore.setState({ slots: [slotA, slotB], globalStart: [-1.2, 1] });

    useRunsStore.getState().resetSlotStarts();

    expect(useRunsStore.getState().slots.map((slot) => slot.start)).toEqual([
      [-1.2, 1],
      [-1.2, 1],
    ]);
  });

  it("does nothing when there are no slots", () => {
    useRunsStore.setState({ slots: [], globalStart: [-1.2, 1] });

    expect(() => useRunsStore.getState().resetSlotStarts()).not.toThrow();
    expect(useRunsStore.getState().slots).toEqual([]);
  });
});

describe("runAll", () => {
  it("ignores a second call while a run is already in progress", async () => {
    let resolveFirst: (value: RunResult[]) => void = () => {};
    const pending = new Promise<RunResult[]>((resolve) => {
      resolveFirst = resolve;
    });
    vi.mocked(computeRuns).mockReturnValue(pending);
    useRunsStore.setState({ slots: [makeSlot()] });

    const first = useRunsStore.getState().runAll("x^2 + y^2");
    await Promise.resolve();
    expect(useRunsStore.getState().isRunning).toBe(true);

    await useRunsStore.getState().runAll("x^2 + y^2");
    expect(computeRuns).toHaveBeenCalledTimes(1);

    resolveFirst([]);
    await first;
    expect(useRunsStore.getState().isRunning).toBe(false);
  });

  it("tracks overall progress across the reported slot fractions and clears it when done", async () => {
    let onProgress: ((progress: RunProgress) => void) | undefined;
    let resolveRun: (value: RunResult[]) => void = () => {};
    const pending = new Promise<RunResult[]>((resolve) => {
      resolveRun = resolve;
    });
    vi.mocked(computeRuns).mockImplementation((_formula, _slots, _start, _steps, _reset, progressCb) => {
      onProgress = progressCb;
      return pending;
    });
    useRunsStore.setState({ slots: [makeSlot()] });

    const run = useRunsStore.getState().runAll("x^2 + y^2");
    await Promise.resolve();
    onProgress?.({ slotIndex: 0, totalSlots: 1, slotId: "slot-1", completedSteps: 50, totalSteps: 200 });

    expect(useRunsStore.getState().progress).toBeCloseTo(0.25);

    resolveRun([]);
    await run;
    expect(useRunsStore.getState().progress).toBeNull();
  });
});
