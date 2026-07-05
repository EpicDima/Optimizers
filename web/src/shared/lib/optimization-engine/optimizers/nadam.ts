import type { OptimizerDescriptor } from "./types";
import { zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const nAdamOptimizer: OptimizerDescriptor = {
  name: "NAdam",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага" },
    beta1: { default: 0.9, description: "коэффициент EMA первого момента (сглаживание направления градиента)" },
    beta2: { default: 0.999, description: "коэффициент EMA второго момента (усреднение квадратов градиента)" },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
    weightDecay: {
      default: 0.0,
      description: "L2-штраф: тянет точку к началу координат, искажая минимизируемую функцию",
    },
    momentumDecay: {
      default: 0.004,
      description: "темп прогрева нестеровского момента: чем больше, тем быстрее mu_t растёт к beta1",
    },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let v: Vec2 = zero2();
    let acc: Vec2 = zero2();
    let muProduct = 1.0;
    let t = 0;
    return {
      get x() { return x; },
      params,
      next() {
        const rawGrad = gradient(fn, x[0], x[1]);
        t += 1;
        const grad: Vec2 = [rawGrad[0] + params.weightDecay * x[0], rawGrad[1] + params.weightDecay * x[1]];
        const mu = params.beta1 * (1 - 0.5 * 0.96 ** (t * params.momentumDecay));
        const muNext = params.beta1 * (1 - 0.5 * 0.96 ** ((t + 1) * params.momentumDecay));
        muProduct *= mu;
        const muProductNext = muProduct * muNext;
        v = [
          params.beta1 * v[0] + (1 - params.beta1) * grad[0],
          params.beta1 * v[1] + (1 - params.beta1) * grad[1],
        ];
        acc = [
          params.beta2 * acc[0] + (1 - params.beta2) * grad[0] ** 2,
          params.beta2 * acc[1] + (1 - params.beta2) * grad[1] ** 2,
        ];
        const biasCorrection2 = 1 - params.beta2 ** t;
        const denom: Vec2 = [
          Math.sqrt(acc[0] / biasCorrection2) + params.eps,
          Math.sqrt(acc[1] / biasCorrection2) + params.eps,
        ];
        x = [
          x[0]
            - (params.lr * (1 - mu)) / (1 - muProduct) * (grad[0] / denom[0])
            - (params.lr * muNext) / (1 - muProductNext) * (v[0] / denom[0]),
          x[1]
            - (params.lr * (1 - mu)) / (1 - muProduct) * (grad[1] / denom[1])
            - (params.lr * muNext) / (1 - muProductNext) * (v[1] / denom[1]),
        ];
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        v = zero2();
        acc = zero2();
        muProduct = 1.0;
        t = 0;
      },
    };
  },
};
