import type { OptimizerDescriptor } from "./types";
import { add2, scale2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const adaBeliefOptimizer: OptimizerDescriptor = {
  name: "AdaBelief",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага" },
    beta1: { default: 0.9, description: "коэффициент EMA первого момента (сглаживание направления градиента)" },
    beta2: {
      default: 0.999,
      description: "коэффициент EMA «неожиданности» (g - m)^2 — отклонения градиента от момента вместо квадрата градиента",
    },
    eps: { default: 1e-8, description: "малая добавка (внутри EMA и в знаменателе) для численной устойчивости" },
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
        // в отличие от Adam второй момент копит не g^2, а отклонение градиента
        // от момента — "неожиданность" градиента; eps добавляется и внутри
        const surprise = sub2(grad, v);
        const surpriseSq: Vec2 = [surprise[0] ** 2, surprise[1] ** 2];
        acc = [
          params.beta2 * acc[0] + (1 - params.beta2) * surpriseSq[0] + params.eps,
          params.beta2 * acc[1] + (1 - params.beta2) * surpriseSq[1] + params.eps,
        ];
        const biasCorrection1 = 1 - params.beta1 ** t;
        const biasCorrection2 = 1 - params.beta2 ** t;
        const denom: Vec2 = [
          Math.sqrt(acc[0]) / Math.sqrt(biasCorrection2) + params.eps,
          Math.sqrt(acc[1]) / Math.sqrt(biasCorrection2) + params.eps,
        ];
        x = [
          x[0] - (params.lr / biasCorrection1) * (v[0] / denom[0]),
          x[1] - (params.lr / biasCorrection1) * (v[1] / denom[1]),
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
