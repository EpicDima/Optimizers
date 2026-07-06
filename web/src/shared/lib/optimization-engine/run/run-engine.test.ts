import { describe, expect, it } from "vitest";

import { runAll, runSlot } from "./run-engine";
import type { ContinuationMap, EngineSlotInput } from "./types";

const sphere = (x: number, y: number): number => x ** 2 + y ** 2;

function slot(overrides: Partial<EngineSlotInput> = {}): EngineSlotInput {
  return {
    slotId: "a",
    optimizer: "Adam",
    optimizerParams: { lr: 0.3, beta1: 0.9, beta2: 0.999, eps: 1e-8 },
    scheduler: "Constant",
    schedulerParams: {},
    start: [-4, 4],
    reset: true,
    ...overrides,
  };
}

describe("runSlot", () => {
  it("produces a run of length steps+1 with matching lr when the optimizer has one", () => {
    const continuation: ContinuationMap = new Map();
    const result = runSlot(sphere, slot(), continuation, 50);

    expect(result.error).toBeNull();
    expect(result.x).toHaveLength(51);
    expect(result.y).toHaveLength(51);
    expect(result.value).toHaveLength(51);
    expect(result.lr).toHaveLength(51);
    expect(result.lr?.every((lr) => lr === 0.3)).toBe(true);
    expect(Math.abs(result.x.at(-1)!)).toBeLessThan(Math.abs(result.x[0]));
    expect(Math.abs(result.y.at(-1)!)).toBeLessThan(Math.abs(result.y[0]));
  });

  it("returns a per-slot error for an unknown optimizer instead of throwing", () => {
    const continuation: ContinuationMap = new Map();
    const result = runSlot(sphere, slot({ optimizer: "NoSuchOptimizer" }), continuation, 50);

    expect(result.error).not.toBeNull();
    expect(result.x).toEqual([]);
  });

  it("returns a per-slot error for an unknown scheduler instead of throwing", () => {
    const continuation: ContinuationMap = new Map();
    const result = runSlot(sphere, slot({ scheduler: "NoSuchScheduler" }), continuation, 50);

    expect(result.error).not.toBeNull();
    expect(result.x).toEqual([]);
  });

  it("returns a per-slot error for an unknown optimizer param instead of silently ignoring it", () => {
    const continuation: ContinuationMap = new Map();
    const result = runSlot(sphere, slot({ optimizerParams: { lr: 0.1, notARealParam: 1.0 } }), continuation, 50);

    expect(result.error).not.toBeNull();
  });

  it("returns a per-slot error for an unknown scheduler param instead of silently ignoring it", () => {
    const continuation: ContinuationMap = new Map();
    const result = runSlot(sphere, slot({ schedulerParams: { notARealParam: 1.0 } }), continuation, 50);

    expect(result.error).not.toBeNull();
  });

  it("leaves lr null when the optimizer has no lr param, ignoring the scheduler", () => {
    const continuation: ContinuationMap = new Map();
    const result = runSlot(
      sphere,
      slot({
        optimizer: "Rprop",
        optimizerParams: { decFactor: 0.5, incFactor: 1.2, stepMin: 1e-6, stepMax: 1.0 },
        scheduler: "OneCycle",
        schedulerParams: { pctStart: 0.3, div: 25.0, finalDiv: 10000.0 },
      }),
      continuation,
      10,
    );

    expect(result.error).toBeNull();
    expect(result.lr).toBeNull();
  });

  it("continues an existing instance across calls with the same slotId when reset is false", () => {
    const continuation: ContinuationMap = new Map();
    const first = runSlot(sphere, slot({ reset: true }), continuation, 20);
    const second = runSlot(sphere, slot({ reset: false }), continuation, 20);

    expect(second.x[0]).toBe(first.x.at(-1));
    expect(second.y[0]).toBe(first.y.at(-1));
  });

  it("starts fresh from cfg.start when the optimizer type changes even if reset is false", () => {
    const continuation: ContinuationMap = new Map();
    runSlot(sphere, slot({ optimizer: "Adam", reset: true }), continuation, 20);
    const second = runSlot(sphere, slot({ optimizer: "SGD", optimizerParams: {}, reset: false }), continuation, 20);

    expect(second.x[0]).toBe(-4);
    expect(second.y[0]).toBe(4);
  });
});

describe("runAll", () => {
  it("runs every slot independently and preserves slotId ordering", () => {
    const continuation: ContinuationMap = new Map();
    const results = runAll(
      sphere,
      [slot({ slotId: "a" }), slot({ slotId: "b", optimizer: "SGD", optimizerParams: {} })],
      continuation,
      10,
    );

    expect(results.map((r) => r.slotId)).toEqual(["a", "b"]);
    expect(results.every((r) => r.error === null)).toBe(true);
  });
});
