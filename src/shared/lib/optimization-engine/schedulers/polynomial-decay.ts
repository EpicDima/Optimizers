import type { SchedulerDescriptor } from "./types";

export const polynomialDecayScheduler: SchedulerDescriptor = {
  name: "PolynomialDecay",
  params: {
    power: {
      default: 0.9,
      description: "показатель степени полинома; 0.9 — каноническое значение DeepLab, 1 — линейное затухание",
    },
    endFactor: {
      default: 0.0,
      description: "финальная скорость обучения как доля от базовой (достигается на последнем шаге)",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const denom = Math.max(totalSteps - 1, 1);
    // ограничение снизу нулём — защита от отрицательного основания дробной степени за горизонтом T
    const remaining = Math.max(1 - step / denom, 0);
    const endFactor = params.endFactor;
    return baseLr * (endFactor + (1 - endFactor) * remaining ** params.power);
  },
};
