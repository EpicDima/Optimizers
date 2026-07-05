import type { OptimizerDescriptor } from "./types";
import { scale2, sub2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const sgdOptimizer: OptimizerDescriptor = {
  name: "SGD",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага против градиента" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    return {
      get x() { return x; },
      params,
      next() {
        x = sub2(x, scale2(gradient(fn, x[0], x[1]), params.lr));
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
      },
    };
  },
};
