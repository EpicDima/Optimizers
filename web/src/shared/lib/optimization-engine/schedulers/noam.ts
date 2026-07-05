import type { SchedulerDescriptor } from "./types";

export const noamScheduler: SchedulerDescriptor = {
  name: "Noam",
  params: {
    warmupFrac: {
      default: 0.1,
      description: "доля полного числа шагов, отведённая под линейный разогрев от нуля до пика base_lr",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const warmupSteps = Math.max(1, Math.round(params.warmupFrac * totalSteps));
    const s = step + 1;
    return baseLr * Math.min(s / warmupSteps, Math.sqrt(warmupSteps / s));
  },
};
