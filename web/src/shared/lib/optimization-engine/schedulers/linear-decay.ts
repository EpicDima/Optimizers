import type { SchedulerDescriptor } from "./types";

export const linearDecayScheduler: SchedulerDescriptor = {
  name: "LinearDecay",
  params: {
    endFactor: {
      default: 0.0,
      description: "финальная скорость обучения как доля от базовой (достигается на последнем шаге)",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const denom = Math.max(totalSteps - 1, 1);
    // ограничение снизу нулём — защита от отрицательных значений за горизонтом T
    const remaining = Math.max(1 - step / denom, 0);
    const endFactor = params.endFactor;
    return baseLr * (endFactor + (1 - endFactor) * remaining);
  },
};
