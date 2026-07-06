import { cosineAnnealingScheduler } from "./cosine-annealing";
import { cosineWarmRestartsScheduler } from "./cosine-warm-restarts";
import { constantScheduler } from "./constant";
import { cyclicalScheduler } from "./cyclical";
import { exponentialDecayScheduler } from "./exponential-decay";
import { inverseTimeDecayScheduler } from "./inverse-time-decay";
import { linearDecayScheduler } from "./linear-decay";
import { noamScheduler } from "./noam";
import { oneCycleScheduler } from "./one-cycle";
import { polynomialDecayScheduler } from "./polynomial-decay";
import { rexScheduler } from "./rex";
import { stepDecayScheduler } from "./step-decay";
import type { SchedulerDescriptor } from "./types";
import { warmupCosineScheduler } from "./warmup-cosine";
import { wsdScheduler } from "./wsd";

const SCHEDULERS: readonly SchedulerDescriptor[] = [
  constantScheduler,
  stepDecayScheduler,
  exponentialDecayScheduler,
  linearDecayScheduler,
  inverseTimeDecayScheduler,
  polynomialDecayScheduler,
  cosineAnnealingScheduler,
  cosineWarmRestartsScheduler,
  oneCycleScheduler,
  cyclicalScheduler,
  noamScheduler,
  rexScheduler,
  warmupCosineScheduler,
  wsdScheduler,
];

const REGISTRY = new Map(SCHEDULERS.map((scheduler) => [scheduler.name, scheduler]));

export function schedulerNames(): string[] {
  const rest = SCHEDULERS.map((scheduler) => scheduler.name)
    .filter((name) => name !== "Constant")
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  return ["Constant", ...rest];
}

export function getSchedulerDescriptor(name: string): SchedulerDescriptor | undefined {
  return REGISTRY.get(name);
}
