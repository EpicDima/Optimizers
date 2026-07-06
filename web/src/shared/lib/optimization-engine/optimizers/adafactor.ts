import type { OptimizerDescriptor } from "./types";
import { norm2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

const DIM_SQRT = Math.sqrt(2);

export const adafactorOptimizer: OptimizerDescriptor = {
  name: "Adafactor",
  params: {
    lr: { default: 0.1, description: "верхняя граница относительного шага rho_t = min(lr, 1/sqrt(t))" },
    beta2Decay: {
      default: -0.8,
      description: "показатель затухания второго момента: вес свежего квадрата градиента равен t^beta2_decay",
    },
    eps1: { default: 1e-15, description: "нижний порог оценки второго момента — численная защита знаменателя" },
    eps2: { default: 0.001, description: "нижний порог масштаба параметра: не даёт шагу вырождаться около начала координат" },
    d: { default: 1.0, description: "порог клиппинга: обновление с RMS выше d пропорционально урезается" },
    weightDecay: { default: 0.0, description: "L2-штраф: тянет точку к началу координат, искажая минимизируемую функцию" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let step = 0;
    let variance: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        step += 1;
        // для одномерного параметра PyTorch использует нефакторизованную оценку второго момента
        const oneMinusBeta2T = step ** params.beta2Decay;
        const rhoT = Math.min(params.lr, 1 / Math.sqrt(step));
        const alpha = Math.max(params.eps2, norm2(x) / DIM_SQRT) * rhoT;
        const decayed: Vec2 = [x[0] * (1 - params.lr * params.weightDecay), x[1] * (1 - params.lr * params.weightDecay)];
        variance = [
          variance[0] + (grad[0] ** 2 - variance[0]) * oneMinusBeta2T,
          variance[1] + (grad[1] ** 2 - variance[1]) * oneMinusBeta2T,
        ];
        const update: Vec2 = [
          grad[0] / Math.sqrt(Math.max(variance[0], params.eps1 ** 2)),
          grad[1] / Math.sqrt(Math.max(variance[1], params.eps1 ** 2)),
        ];
        const denom = Math.max(1.0, norm2(update) / (DIM_SQRT * params.d));
        x = [decayed[0] - (alpha / denom) * update[0], decayed[1] - (alpha / denom) * update[1]];
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        step = 0;
        variance = zero2();
      },
    };
  },
};
