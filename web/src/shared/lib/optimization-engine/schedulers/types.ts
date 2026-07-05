import type { AlgorithmMeta } from "@shared/api/types";

export interface SchedulerDescriptor extends AlgorithmMeta {
  lr(params: Record<string, number>, step: number, totalSteps: number, baseLr: number): number;
}
