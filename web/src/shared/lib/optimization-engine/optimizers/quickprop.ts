import type { OptimizerDescriptor } from "./types";
import { sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const quickPropOptimizer: OptimizerDescriptor = {
  name: "QuickProp",
  params: {
    lr: {
      default: 0.01,
      description: "скорость обучения для градиентного шага по координате, когда её предыдущий шаг нулевой",
    },
    alphaMax: {
      default: 1.75,
      description: "максимальный фактор роста: во сколько раз новый шаг может превысить предыдущий",
    },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let previousUpdate: Vec2 = zero2();
    let previousGradient: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        const componentUpdate = (i: 0 | 1): number => {
          const denominator = previousGradient[i] - grad[i];
          const temp = denominator !== 0 ? grad[i] / denominator : 0;
          const alpha = Math.min(Math.max(temp, -params.alphaMax), params.alphaMax);
          return previousUpdate[i] === 0 ? params.lr * grad[i] : alpha * previousUpdate[i];
        };
        const update: Vec2 = [componentUpdate(0), componentUpdate(1)];
        previousGradient = grad;
        previousUpdate = update;
        x = sub2(x, update);
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        previousUpdate = zero2();
        previousGradient = zero2();
      },
    };
  },
};
