import type { SchedulerDescriptor } from "./types";

export const cosineWarmRestartsScheduler: SchedulerDescriptor = {
  name: "CosineWarmRestarts",
  params: {
    t0Frac: {
      default: 0.15,
      description: "доля шагов на первый цикл (при T=100 и t_mult=2 циклы 15+30+60 — финиш почти на минимуме)",
    },
    tMult: { default: 2.0, description: "множитель длины каждого следующего цикла (авторы рекомендуют 2)" },
    minFactor: {
      default: 0.0,
      description: "нижняя граница скорости обучения как доля от базовой (0 — затухание до нуля)",
    },
  },
  lr(params, step, totalSteps, baseLr) {
    const minFactor = params.minFactor;
    const tMult = Math.max(Math.trunc(params.tMult), 1);
    let cycleLen = Math.max(1, Math.round(params.t0Frac * totalSteps));
    let tCur = step;
    // заново находим текущий цикл и позицию в нём — циклы не хранятся между вызовами
    while (tCur >= cycleLen) {
      tCur -= cycleLen;
      cycleLen *= tMult;
    }
    const factor = minFactor + 0.5 * (1 - minFactor) * (1 + Math.cos((Math.PI * tCur) / cycleLen));
    return baseLr * factor;
  },
};
