import type { SchedulerDescriptor } from "./types";

export const exponentialDecayScheduler: SchedulerDescriptor = {
  name: "ExponentialDecay",
  params: {
    gamma: {
      default: 0.955,
      description:
        "множитель скорости обучения за один шаг; правило подбора: gamma = (lr_final/base_lr)^(1/T), по умолчанию 0.955 — за 100 шагов скорость обучения падает примерно до 1% от базовой",
    },
  },
  lr(params, step, _totalSteps, baseLr) {
    return baseLr * params.gamma ** step;
  },
};
