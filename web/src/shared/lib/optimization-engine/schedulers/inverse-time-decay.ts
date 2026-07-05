import type { SchedulerDescriptor } from "./types";

export const inverseTimeDecayScheduler: SchedulerDescriptor = {
  name: "InverseTimeDecay",
  params: {
    k: { default: 0.1, description: "коэффициент скорости затухания — множитель при номере шага в знаменателе" },
    power: {
      default: 1.0,
      description: "показатель степени знаменателя; условиям Роббинса–Монро удовлетворяет при 1/2 < power <= 1",
    },
  },
  lr(params, step, _totalSteps, baseLr) {
    return baseLr / (1 + params.k * step) ** params.power;
  },
};
