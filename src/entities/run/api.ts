import { runAll as runAllSlots } from "@shared/lib/optimization-engine/run";
import type { EngineSlotInput } from "@shared/lib/optimization-engine/run";

import { continuationMap } from "./continuation";
import type { RunConfig, RunResult } from "./model";

export function computeRuns(
  fn: (x: number, y: number) => number,
  slots: RunConfig[],
  globalStart: [number, number],
  steps: number,
  resetOnStart: boolean,
): RunResult[] {
  const inputs: EngineSlotInput[] = slots.map((slot) => ({
    slotId: slot.slotId,
    optimizer: slot.optimizer,
    optimizerParams: slot.optimizerParams,
    scheduler: slot.scheduler,
    schedulerParams: slot.schedulerParams,
    start: resetOnStart ? globalStart : slot.start,
    reset: resetOnStart,
  }));

  return runAllSlots(fn, inputs, continuationMap, steps);
}
