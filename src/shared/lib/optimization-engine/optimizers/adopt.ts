import type { OptimizerDescriptor } from "./types";
import { add2, scale2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

export const adoptOptimizer: OptimizerDescriptor = {
  name: "ADOPT",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага" },
    beta1: {
      default: 0.9,
      description: "коэффициент EMA момента, который копит уже нормированный и клиппированный градиент",
    },
    beta2: {
      default: 0.9999,
      description: "коэффициент EMA второго момента; нормировка берёт его с прошлого шага, поэтому сходится при любом beta2",
    },
    eps: { default: 1e-6, description: "нижний порог знаменателя при нормировке градиента — численная защита" },
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
        if (t === 1) {
          // v_0 = g_0^2 — второй момент инициализируется первым градиентом
          acc = [grad[0] ** 2, grad[1] ** 2];
        }
        // градиент нормируется на второй момент ПРОШЛОГО шага (до его обновления)
        // и клиппируется порогом t^0.25 — это и даёт доказуемую сходимость
        const clip = t ** 0.25;
        const normedGradient: Vec2 = [
          clamp(grad[0] / Math.max(Math.sqrt(acc[0]), params.eps), -clip, clip),
          clamp(grad[1] / Math.max(Math.sqrt(acc[1]), params.eps), -clip, clip),
        ];
        v = add2(scale2(v, params.beta1), scale2(normedGradient, 1 - params.beta1));
        x = sub2(x, scale2(v, params.lr));
        const gradSq: Vec2 = [grad[0] ** 2, grad[1] ** 2];
        acc = add2(scale2(acc, params.beta2), scale2(gradSq, 1 - params.beta2));
        return { x, value: fn(x[0], x[1]), internals: {
          "v.x": v[0], "v.y": v[1], "|v|": Math.sqrt(v[0] ** 2 + v[1] ** 2),
          "acc.x": acc[0], "acc.y": acc[1],
          t, clip,
        } };
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
