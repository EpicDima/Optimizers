import { beforeEach, describe, expect, it } from "vitest";

import type { RunConfig } from "./model";
import { useRunsStore } from "./store";

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
  useRunsStore.setState({ slots: [], results: {}, globalStart: [-4, 4] });
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
