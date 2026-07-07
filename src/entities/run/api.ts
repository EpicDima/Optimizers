import { runInWorker } from "@shared/lib/optimization-engine/run";
import type { EngineSlotInput } from "@shared/lib/optimization-engine/run";

import type { RunConfig, RunResult } from "./model";

export function computeRuns(
  formula: string,
  slots: RunConfig[],
  globalStart: [number, number],
  steps: number,
  resetOnStart: boolean,
  gradientNoise: number = 0,
): Promise<RunResult[]> {
  const inputs: EngineSlotInput[] = slots.map((slot) => ({
    slotId: slot.slotId,
    optimizer: slot.optimizer,
    optimizerParams: slot.optimizerParams,
    scheduler: slot.scheduler,
    schedulerParams: slot.schedulerParams,
    start: resetOnStart ? globalStart : slot.start,
    reset: resetOnStart,
  }));

  return runInWorker(formula, inputs, steps, gradientNoise);
}
