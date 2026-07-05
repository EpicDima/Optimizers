import type { SchedulerDescriptor } from "./types";

export const cyclicalScheduler: SchedulerDescriptor = {
  name: "Cyclical",
  params: {
    stepsizeFrac: {
      default: 0.25,
      description: "длина полуцикла как доля от полного числа шагов (0.25 — два полных цикла за прогон)",
    },
    minFactor: {
      default: 0.25,
      description: "нижняя граница скорости обучения как доля от пиковой (в статье — 1/3–1/4 от верхней)",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const minFactor = params.minFactor;
    const stepsize = Math.max(1, Math.round(params.stepsizeFrac * totalSteps));
    const cycle = Math.floor(1 + step / (2 * stepsize));
    const x = Math.abs(step / stepsize - 2 * cycle + 1);
    const factor = minFactor + (1 - minFactor) * Math.max(0, 1 - x);
    return baseLr * factor;
  },
};
