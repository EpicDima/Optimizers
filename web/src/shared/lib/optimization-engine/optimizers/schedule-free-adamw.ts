import type { OptimizerDescriptor } from "./types";
import { zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const scheduleFreeAdamWOptimizer: OptimizerDescriptor = {
  name: "ScheduleFreeAdamW",
  params: {
    lr: { default: 0.1, description: "скорость обучения — масштаб шага быстрой последовательности z" },
    beta1: {
      default: 0.9,
      description: "вес усреднённой точки x_avg при выборе точки y, в которой считается градиент (аналог момента)",
    },
    beta2: {
      default: 0.999,
      description: "коэффициент EMA второго момента (квадратов градиента) для адаптивного масштаба шага",
    },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
    weightDecay: {
      default: 0.0,
      description: "затухание весов (в градиент в точке y) — тянет точку к началу координат, искажая минимизируемую функцию",
    },
  },
  createInstance(fn, initialX, params) {
    let z: Vec2 = initialX;
    let xAvg: Vec2 = initialX;
    let v: Vec2 = zero2();
    let t = 0;
    return {
      get x() { return xAvg; },
      params,
      next() {
        t += 1;
        // градиент считается в промежуточной точке y между быстрой z и средней x_avg
        const y: Vec2 = [
          (1 - params.beta1) * z[0] + params.beta1 * xAvg[0],
          (1 - params.beta1) * z[1] + params.beta1 * xAvg[1],
        ];
        const rawGrad = gradient(fn, y[0], y[1]);
        const grad: Vec2 = [rawGrad[0] + params.weightDecay * y[0], rawGrad[1] + params.weightDecay * y[1]];
        v = [
          params.beta2 * v[0] + (1 - params.beta2) * grad[0] ** 2,
          params.beta2 * v[1] + (1 - params.beta2) * grad[1] ** 2,
        ];
        const denom: Vec2 = [
          Math.sqrt(v[0] / (1 - params.beta2 ** t)) + params.eps,
          Math.sqrt(v[1] / (1 - params.beta2 ** t)) + params.eps,
        ];
        z = [z[0] - (params.lr * grad[0]) / denom[0], z[1] - (params.lr * grad[1]) / denom[1]];
        // равномерное усреднение c_{t+1} = 1 / (t + 1); в статье веса lr^2,
        // но при постоянном lr это одно и то же
        const c = 1 / t;
        xAvg = [(1 - c) * xAvg[0] + c * z[0], (1 - c) * xAvg[1] + c * z[1]];
        // наружу отдаётся именно усреднённая последовательность — она и рисуется на графике
        return { x: xAvg, value: fn(xAvg[0], xAvg[1]) };
      },
      reset() {
        z = initialX;
        xAvg = initialX;
        v = zero2();
        t = 0;
      },
    };
  },
};
