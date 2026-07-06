import type { SchedulerDescriptor } from "./types";

export const rexScheduler: SchedulerDescriptor = {
  name: "REX",
  params: {},
  lr(_params, step, totalSteps, baseLr) {
    const z = 1 - step / totalSteps;
    return (baseLr * z) / (0.5 + 0.5 * z);
  },
};
