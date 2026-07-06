import type { OptimizerDescriptor } from "./types";
import { add2, scale2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const adamaxOptimizer: OptimizerDescriptor = {
  name: "Adamax",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага" },
    beta1: { default: 0.9, description: "коэффициент EMA первого момента (сглаживание направления градиента)" },
    beta2: { default: 0.999, description: "коэффициент затухания бесконечной нормы: как быстро забывается прошлый максимум |градиента|" },
    eps: { default: 1e-8, description: "малая добавка к модулю градиента перед взятием максимума — защита от деления на ноль" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let v: Vec2 = zero2();
    let acc: Vec2 = zero2();
    let t = 0;
    return {
      get x() { return x; },
      params,
      next() {
        t += 1;
        const grad = gradient(fn, x[0], x[1]);
        v = add2(scale2(v, params.beta1), scale2(grad, 1 - params.beta1));
        acc = [
          Math.max(params.beta2 * acc[0], Math.abs(grad[0]) + params.eps),
          Math.max(params.beta2 * acc[1], Math.abs(grad[1]) + params.eps),
        ];
        const clr = params.lr / (1 - params.beta1 ** t);
        x = [x[0] - (clr * v[0]) / acc[0], x[1] - (clr * v[1]) / acc[1]];
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        v = zero2();
        acc = zero2();
        t = 0;
      },
    };
  },
};
