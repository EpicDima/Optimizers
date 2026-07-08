import type { OptimizerDescriptor } from "./types";
import { zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient, hessian } from "@shared/lib/optimization-engine/functions";

export const sophiaOptimizer: OptimizerDescriptor = {
  name: "Sophia",
  params: {
    lr: { default: 0.5, description: "скорость обучения — масштаб шага" },
    beta1: { default: 0.96, description: "коэффициент EMA первого момента (сглаживание направления градиента)" },
    beta2: {
      default: 0.99,
      description: "коэффициент EMA диагонали гессиана (оценка кривизны; отрицательная кривизна обрезается нулём)",
    },
    rho: {
      default: 1.0,
      description: "порог покомпонентного клиппинга шага — максимальная длина шага по оси равна lr * rho",
    },
    eps: { default: 1e-12, description: "нижний порог оценки кривизны h в знаменателе — численная защита" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let m: Vec2 = zero2();
    let h: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        const hesse = hessian(fn, x[0], x[1]);
        const hesseDiag: Vec2 = [hesse[0][0], hesse[1][1]];
        m = [
          params.beta1 * m[0] + (1 - params.beta1) * grad[0],
          params.beta1 * m[1] + (1 - params.beta1) * grad[1],
        ];
        h = [
          params.beta2 * h[0] + (1 - params.beta2) * Math.max(hesseDiag[0], 0),
          params.beta2 * h[1] + (1 - params.beta2) * Math.max(hesseDiag[1], 0),
        ];
        const update: Vec2 = [
          Math.min(Math.max(m[0] / Math.max(h[0], params.eps), -params.rho), params.rho),
          Math.min(Math.max(m[1] / Math.max(h[1], params.eps), -params.rho), params.rho),
        ];
        x = [x[0] - params.lr * update[0], x[1] - params.lr * update[1]];
        return { x, value: fn(x[0], x[1]), internals: {
          "m.x": m[0], "m.y": m[1], "|m|": Math.sqrt(m[0] ** 2 + m[1] ** 2),
          "h.x": h[0], "h.y": h[1],
          "update.x": update[0], "update.y": update[1],
        } };
      },
      reset() {
        x = initialX;
        m = zero2();
        h = zero2();
      },
    };
  },
};
