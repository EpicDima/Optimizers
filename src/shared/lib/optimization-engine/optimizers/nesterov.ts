import type { OptimizerDescriptor } from "./types";
import { add2, scale2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const nesterovOptimizer: OptimizerDescriptor = {
  name: "Nesterov",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага" },
    coef: {
      default: 0.9,
      description: "коэффициент момента: затухание накопленной скорости и вес «заглядывающей вперёд» добавки в шаге",
    },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let v: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        v = add2(scale2(v, params.coef), grad);
        x = sub2(x, scale2(add2(grad, scale2(v, params.coef)), params.lr));
        return { x, value: fn(x[0], x[1]), internals: { "v.x": v[0], "v.y": v[1], "|v|": Math.sqrt(v[0] ** 2 + v[1] ** 2) } };
      },
      reset() {
        x = initialX;
        v = zero2();
      },
    };
  },
};
