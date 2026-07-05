import type { OptimizerDescriptor } from "./types";
import { norm2, scale2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const marsOptimizer: OptimizerDescriptor = {
  name: "MARS",
  params: {
    lr: { default: 0.05, description: "скорость обучения — масштаб шага" },
    gamma: {
      default: 0.025,
      description: "сила вариационной поправки; здесь, при точном градиенте, действует как экстраполяция градиента",
    },
    beta1: {
      default: 0.95,
      description: "коэффициент EMA первого момента (по скорректированному градиенту c); входит и в масштаб поправки",
    },
    beta2: { default: 0.99, description: "коэффициент EMA второго момента (квадратов скорректированного градиента)" },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
    weightDecay: {
      default: 0.0,
      description: "затухание весов — тянет точку к началу координат, искажая минимизируемую функцию",
    },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let m: Vec2 = zero2();
    let v: Vec2 = zero2();
    let prevG: Vec2 = zero2();
    let t = 0;
    return {
      get x() { return x; },
      params,
      next() {
        t += 1;
        const grad = gradient(fn, x[0], x[1]);
        // на первом шаге g_prev = g_t, поэтому вариационная поправка нулевая
        const gPrevUsed = t === 1 ? grad : prevG;
        const scale = (params.gamma * params.beta1) / (1 - params.beta1);
        let c: Vec2 = [grad[0] + scale * (grad[0] - gPrevUsed[0]), grad[1] + scale * (grad[1] - gPrevUsed[1])];
        // клиппинг из статьи: скорректированный градиент нормируется к единичной норме
        const cNorm = norm2(c);
        if (cNorm > 1) c = scale2(c, 1 / cNorm);
        m = [params.beta1 * m[0] + (1 - params.beta1) * c[0], params.beta1 * m[1] + (1 - params.beta1) * c[1]];
        v = [params.beta2 * v[0] + (1 - params.beta2) * c[0] ** 2, params.beta2 * v[1] + (1 - params.beta2) * c[1] ** 2];
        const mHat: Vec2 = [m[0] / (1 - params.beta1 ** t), m[1] / (1 - params.beta1 ** t)];
        const vHat: Vec2 = [v[0] / (1 - params.beta2 ** t), v[1] / (1 - params.beta2 ** t)];
        const denom: Vec2 = [Math.sqrt(vHat[0]) + params.eps, Math.sqrt(vHat[1]) + params.eps];
        x = [
          x[0] - params.lr * (mHat[0] / denom[0] + params.weightDecay * x[0]),
          x[1] - params.lr * (mHat[1] / denom[1] + params.weightDecay * x[1]),
        ];
        prevG = grad;
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        m = zero2();
        v = zero2();
        prevG = zero2();
        t = 0;
      },
    };
  },
};
