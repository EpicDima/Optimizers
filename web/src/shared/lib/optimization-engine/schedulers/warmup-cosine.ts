import type { SchedulerDescriptor } from "./types";

export const warmupCosineScheduler: SchedulerDescriptor = {
  name: "WarmupCosine",
  params: {
    warmupFrac: {
      default: 0.1,
      description: "доля полного числа шагов, отведённая под линейный разогрев от нуля до base_lr",
    },
    minFactor: {
      default: 0.1,
      description: "доля base_lr, до которой затухает скорость обучения к концу прогона",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const warmupSteps = Math.max(1, Math.round(params.warmupFrac * totalSteps));
    if (step < warmupSteps) {
      return (baseLr * (step + 1)) / warmupSteps;
    }
    const minFactor = params.minFactor;
    const progress = (step - warmupSteps) / Math.max(totalSteps - 1 - warmupSteps, 1);
    return baseLr * (minFactor + 0.5 * (1 - minFactor) * (1 + Math.cos(Math.PI * progress)));
  },
};
