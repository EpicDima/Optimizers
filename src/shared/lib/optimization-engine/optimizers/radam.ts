import type { OptimizerDescriptor } from "./types";
import { zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const rAdamOptimizer: OptimizerDescriptor = {
  name: "RAdam",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага" },
    beta1: { default: 0.9, description: "коэффициент EMA первого момента (сглаживание направления градиента)" },
    beta2: {
      default: 0.999,
      description: "коэффициент EMA второго момента; от него же зависит порог включения ректификации",
    },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
    weightDecay: {
      default: 0.0,
      description: "L2-штраф: тянет точку к началу координат, искажая минимизируемую функцию",
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
        const rawGrad = gradient(fn, x[0], x[1]);
        t += 1;
        const grad: Vec2 = [rawGrad[0] + params.weightDecay * x[0], rawGrad[1] + params.weightDecay * x[1]];
        v = [
          params.beta1 * v[0] + (1 - params.beta1) * grad[0],
          params.beta1 * v[1] + (1 - params.beta1) * grad[1],
        ];
        acc = [
          params.beta2 * acc[0] + (1 - params.beta2) * grad[0] ** 2,
          params.beta2 * acc[1] + (1 - params.beta2) * grad[1] ** 2,
        ];
        const biasCorrection1 = 1 - params.beta1 ** t;
        const biasCorrection2 = 1 - params.beta2 ** t;
        const correctedV: Vec2 = [v[0] / biasCorrection1, v[1] / biasCorrection1];
        const rhoInf = 2 / (1 - params.beta2) - 1;
        const rhoT = rhoInf - (2 * t * params.beta2 ** t) / biasCorrection2;
        if (rhoT > 5.0) {
          const rect = Math.sqrt(
            ((rhoT - 4) * (rhoT - 2) * rhoInf) / ((rhoInf - 4) * (rhoInf - 2) * rhoT),
          );
          const adaptiveLr: Vec2 = [
            Math.sqrt(biasCorrection2) / (Math.sqrt(acc[0]) + params.eps),
            Math.sqrt(biasCorrection2) / (Math.sqrt(acc[1]) + params.eps),
          ];
          x = [
            x[0] - params.lr * rect * adaptiveLr[0] * correctedV[0],
            x[1] - params.lr * rect * adaptiveLr[1] * correctedV[1],
          ];
        } else {
          x = [x[0] - params.lr * correctedV[0], x[1] - params.lr * correctedV[1]];
        }
        return { x, value: fn(x[0], x[1]), internals: { "v.x": v[0], "v.y": v[1], "|v|": Math.sqrt(v[0] ** 2 + v[1] ** 2), "acc.x": acc[0], "acc.y": acc[1], "|acc|": Math.sqrt(acc[0] ** 2 + acc[1] ** 2), t, rhoT } };
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
