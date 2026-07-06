import type { OptimizerDescriptor } from "./types";
import { sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const adadeltaOptimizer: OptimizerDescriptor = {
  name: "Adadelta",
  params: {
    lr: {
      default: 0.01,
      description: "скорость обучения — дополнительный масштаб обновления (есть в PyTorch, в статье Зейлера отсутствует)",
    },
    rho: { default: 0.975, description: "коэффициент затухания накопителей квадратов градиентов и квадратов обновлений" },
    eps: {
      default: 1e-2,
      description: "малая добавка под корнями: численная защита и стартовый масштаб шага, пока накопители пусты",
    },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let acc1: Vec2 = zero2();
    let acc2: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        acc1 = [
          params.rho * acc1[0] + (1 - params.rho) * grad[0] ** 2,
          params.rho * acc1[1] + (1 - params.rho) * grad[1] ** 2,
        ];
        const update: Vec2 = [
          (grad[0] * Math.sqrt(acc2[0] + params.eps)) / Math.sqrt(acc1[0] + params.eps),
          (grad[1] * Math.sqrt(acc2[1] + params.eps)) / Math.sqrt(acc1[1] + params.eps),
        ];
        acc2 = [
          params.rho * acc2[0] + (1 - params.rho) * update[0] ** 2,
          params.rho * acc2[1] + (1 - params.rho) * update[1] ** 2,
        ];
        x = sub2(x, [params.lr * update[0], params.lr * update[1]]);
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        acc1 = zero2();
        acc2 = zero2();
      },
    };
  },
};
