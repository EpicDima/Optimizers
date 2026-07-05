import type { SchedulerDescriptor } from "./types";

export const stepDecayScheduler: SchedulerDescriptor = {
  name: "StepDecay",
  params: {
    stepFrac: {
      default: 0.25,
      description: "доля полного числа шагов на одну ступень (при T=100 — ступень 25 шагов, три спуска за прогон)",
    },
    gamma: { default: 0.5, description: "множитель скорости обучения на каждой ступени" },
  },
  lr(params, step, totalSteps, baseLr) {
    const stepSize = Math.max(1, Math.round(params.stepFrac * totalSteps));
    return baseLr * params.gamma ** Math.floor(step / stepSize);
  },
};
