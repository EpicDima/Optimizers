import type { OptimizerDescriptor } from "./types";
import { add2, scale2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const asgdOptimizer: OptimizerDescriptor = {
  name: "ASGD",
  params: {
    lr: { default: 0.01, description: "начальная скорость обучения; эффективный шаг eta затухает с ростом номера итерации" },
    lambd: { default: 0.0001, description: "коэффициент затухания: сжимает точку на каждом шаге и ускоряет убывание eta" },
    alpha: { default: 0.75, description: "степень в законе убывания шага eta = lr / (1 + lambd*lr*t)^alpha" },
    t0: { default: 1000000.0, description: "номер шага, начиная с которого усредняется траектория (усреднённая точка Поляка)" },
    weightDecay: { default: 0.0, description: "L2-штраф: тянет точку к началу координат, искажая минимизируемую функцию" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let step = 0;
    let ax: Vec2 = zero2();
    return {
      get x() { return x; },
      params,
      next() {
        const lr = params.lr;
        const lambd = params.lambd;
        // eta и mu в PyTorch пересчитываются после шага, поэтому на шаге t
        // используются значения, посчитанные по счётчику предыдущего шага
        const eta = lr / (1 + lambd * lr * step) ** params.alpha;
        const mu = 1 / Math.max(1.0, step - params.t0);
        step += 1;
        const grad = add2(gradient(fn, x[0], x[1]), scale2(x, params.weightDecay));
        const nextX = sub2(scale2(x, 1 - lambd * eta), scale2(grad, eta));
        // усреднённая точка поддерживается как внутреннее состояние,
        // траектория (x) идёт по фактическим шагам, как param в PyTorch
        ax = add2(ax, scale2(sub2(nextX, ax), mu));
        x = nextX;
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        step = 0;
        ax = zero2();
      },
    };
  },
};
