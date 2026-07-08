import type { OptimizerDescriptor } from "./types";
import { add2, scale2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const adamWOptimizer: OptimizerDescriptor = {
  name: "AdamW",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага (умножается и на weight_decay)" },
    beta1: { default: 0.9, description: "коэффициент EMA первого момента (сглаживание направления градиента)" },
    beta2: { default: 0.999, description: "коэффициент EMA второго момента (сглаживание квадрата градиента)" },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
    weightDecay: {
      default: 0.01,
      description: "отвязанная от градиента регуляризация: каждый шаг тянет точку к началу координат, смещая минимум",
    },
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
        const grad = gradient(fn, x[0], x[1]);
        t += 1;
        const decayed: Vec2 = scale2(x, 1 - params.lr * params.weightDecay);
        v = add2(scale2(v, params.beta1), scale2(grad, 1 - params.beta1));
        const gradSq: Vec2 = [grad[0] ** 2, grad[1] ** 2];
        acc = add2(scale2(acc, params.beta2), scale2(gradSq, 1 - params.beta2));
        const biasCorrection1 = 1 - params.beta1 ** t;
        const biasCorrection2 = 1 - params.beta2 ** t;
        const stepSize = params.lr / biasCorrection1;
        const denom: Vec2 = [
          Math.sqrt(acc[0]) / Math.sqrt(biasCorrection2) + params.eps,
          Math.sqrt(acc[1]) / Math.sqrt(biasCorrection2) + params.eps,
        ];
        x = [
          decayed[0] - stepSize * (v[0] / denom[0]),
          decayed[1] - stepSize * (v[1] / denom[1]),
        ];
        return { x, value: fn(x[0], x[1]), internals: { "v.x": v[0], "v.y": v[1], "|v|": Math.sqrt(v[0] ** 2 + v[1] ** 2), "acc.x": acc[0], "acc.y": acc[1], "|acc|": Math.sqrt(acc[0] ** 2 + acc[1] ** 2), t } };
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
