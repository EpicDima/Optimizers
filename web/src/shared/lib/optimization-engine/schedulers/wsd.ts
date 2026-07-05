import type { SchedulerDescriptor } from "./types";

export const wsdScheduler: SchedulerDescriptor = {
  name: "WSD",
  params: {
    warmupFrac: {
      default: 0.1,
      description: "доля полного числа шагов, отведённая под линейный разогрев от нуля до base_lr",
    },
    decayFrac: {
      default: 0.2,
      description: "доля полного числа шагов в конце прогона, отведённая под линейное охлаждение до нуля",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const warmupSteps = Math.max(1, Math.round(params.warmupFrac * totalSteps));
    const decaySteps = Math.max(1, Math.round(params.decayFrac * totalSteps));
    // разогрев проверяется первым, чтобы при очень малых totalSteps фазы не конфликтовали
    if (step < warmupSteps) {
      return (baseLr * (step + 1)) / warmupSteps;
    }
    if (step >= totalSteps - decaySteps) {
      return (baseLr * (totalSteps - step)) / decaySteps;
    }
    return baseLr;
  },
};
