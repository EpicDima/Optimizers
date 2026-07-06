import type { SchedulerDescriptor } from "./types";

export const cosineAnnealingScheduler: SchedulerDescriptor = {
  name: "CosineAnnealing",
  params: {
    minFactor: {
      default: 0.0,
      description: "нижняя граница скорости обучения как доля от базовой (0 — затухание до нуля)",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const minFactor = params.minFactor;
    const denom = Math.max(totalSteps - 1, 1);
    const factor = minFactor + 0.5 * (1 - minFactor) * (1 + Math.cos((Math.PI * step) / denom));
    return baseLr * factor;
  },
};
