import type { OptimizerDescriptor } from "./types";
import { zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const adagradOptimizer: OptimizerDescriptor = {
  name: "Adagrad",
  params: {
    lr: { default: 0.01, description: "базовая скорость обучения, делится на корень из суммы квадратов всех прошлых градиентов" },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let acc: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        acc = [acc[0] + grad[0] ** 2, acc[1] + grad[1] ** 2];
        const adaptiveLr: Vec2 = [
          params.lr / (Math.sqrt(acc[0]) + params.eps),
          params.lr / (Math.sqrt(acc[1]) + params.eps),
        ];
        x = [x[0] - adaptiveLr[0] * grad[0], x[1] - adaptiveLr[1] * grad[1]];
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        acc = zero2();
      },
    };
  },
};
