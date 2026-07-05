import type { SchedulerDescriptor } from "./types";

export const oneCycleScheduler: SchedulerDescriptor = {
  name: "OneCycle",
  params: {
    pctStart: {
      default: 0.3,
      description: "доля шагов на фазу роста скорости обучения (пик достигается на шаге pct_start * T)",
    },
    div: { default: 25.0, description: "во сколько раз стартовая скорость обучения меньше пиковой (старт с base_lr/div)" },
    finalDiv: {
      default: 10000.0,
      description: "во сколько раз финальная скорость обучения меньше стартовой (финиш на base_lr/(div*final_div))",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const startFactor = 1 / params.div;
    const finalFactor = 1 / (params.div * params.finalDiv);
    const tUp = Math.max(1, Math.round(params.pctStart * totalSteps));
    let factor: number;
    if (step < tUp) {
      factor = startFactor + (1 - startFactor) * 0.5 * (1 - Math.cos((Math.PI * step) / tUp));
    } else {
      const progress = (step - tUp) / Math.max(totalSteps - 1 - tUp, 1);
      factor = finalFactor + (1 - finalFactor) * 0.5 * (1 + Math.cos(Math.PI * progress));
    }
    return baseLr * factor;
  },
};
