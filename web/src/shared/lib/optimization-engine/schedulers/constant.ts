import type { SchedulerDescriptor } from "./types";

export const constantScheduler: SchedulerDescriptor = {
  name: "Constant",
  params: {},
  lr(_params, _step, _totalSteps, baseLr) {
    return baseLr;
  },
};
