import type { OptimizerDescriptor } from "./types";
import { add2, scale2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const momentumOptimizer: OptimizerDescriptor = {
  name: "Momentum",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага вдоль накопленной скорости" },
    coef: {
      default: 0.9,
      description: "коэффициент затухания скорости: какая доля прошлой скорости сохраняется на каждом шаге",
    },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let v: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        v = add2(scale2(v, params.coef), gradient(fn, x[0], x[1]));
        x = sub2(x, scale2(v, params.lr));
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        v = zero2();
      },
    };
  },
};
