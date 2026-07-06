import type { OptimizerDescriptor } from "./types";
import { add2, scale2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const lionOptimizer: OptimizerDescriptor = {
  name: "Lion",
  params: {
    lr: { default: 0.02, description: "скорость обучения; из-за sign шаг по каждой оси всегда имеет длину lr" },
    beta1: { default: 0.9, description: "вес момента при интерполяции текущего градиента и момента для выбора направления шага" },
    beta2: { default: 0.99, description: "коэффициент EMA момента — скорость обновления памяти о прошлых градиентах" },
    weightDecay: { default: 0.0, description: "затухание весов — тянет точку к началу координат, искажая минимизируемую функцию" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let v: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        // направление шага — только знак интерполяции момента и градиента,
        // поэтому шаг по каждой оси всегда имеет длину lr
        const interpolated = add2(scale2(v, params.beta1), scale2(grad, 1 - params.beta1));
        const update: Vec2 = [Math.sign(interpolated[0]), Math.sign(interpolated[1])];
        v = add2(scale2(v, params.beta2), scale2(grad, 1 - params.beta2));
        const decayed: Vec2 = scale2(x, 1 - params.lr * params.weightDecay);
        x = [decayed[0] - params.lr * update[0], decayed[1] - params.lr * update[1]];
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        v = zero2();
      },
    };
  },
};
