import type { OptimizerDescriptor } from "./types";
import { zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const rmsPropOptimizer: OptimizerDescriptor = {
  name: "RMSprop",
  params: {
    lr: {
      default: 0.01,
      description: "базовая скорость обучения, делится на корень из скользящего среднего квадратов градиентов",
    },
    coef: { default: 0.8, description: "коэффициент затухания скользящего среднего квадратов градиентов" },
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
        acc = [
          params.coef * acc[0] + (1 - params.coef) * grad[0] ** 2,
          params.coef * acc[1] + (1 - params.coef) * grad[1] ** 2,
        ];
        x = [
          x[0] - (params.lr / (Math.sqrt(acc[0]) + params.eps)) * grad[0],
          x[1] - (params.lr / (Math.sqrt(acc[1]) + params.eps)) * grad[1],
        ];
        return { x, value: fn(x[0], x[1]), internals: { "acc.x": acc[0], "acc.y": acc[1], "|acc|": Math.sqrt(acc[0] ** 2 + acc[1] ** 2) } };
      },
      reset() {
        x = initialX;
        acc = zero2();
      },
    };
  },
};
