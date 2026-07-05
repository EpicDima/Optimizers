import type { OptimizerDescriptor } from "./types";
import { dot2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const prodigyOptimizer: OptimizerDescriptor = {
  name: "Prodigy",
  params: {
    lr: { default: 1.0, description: "безразмерный множитель поверх автоматически подбираемого масштаба d, обычно 1.0" },
    beta1: { default: 0.9, description: "коэффициент EMA первого момента (сглаживание направления градиента)" },
    beta2: {
      default: 0.999,
      description: "коэффициент EMA второго момента; sqrt(beta2) также сглаживает счётчики r и s D-адаптации",
    },
    d0: {
      default: 1e-6,
      description: "стартовое значение масштаба d — оценки расстояния до минимума; дальше d только растёт",
    },
    eps: { default: 1e-8, description: "малая добавка в знаменатель (умножается на d) для численной устойчивости" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let m: Vec2 = zero2();
    let v: Vec2 = zero2();
    let s: Vec2 = zero2();
    let r = 0;
    let d = params.d0;
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        const lr = params.lr;
        const dCurrent = d;
        const sqrtBeta2 = Math.sqrt(params.beta2);
        m = [
          params.beta1 * m[0] + (1 - params.beta1) * dCurrent * grad[0],
          params.beta1 * m[1] + (1 - params.beta1) * dCurrent * grad[1],
        ];
        v = [
          params.beta2 * v[0] + (1 - params.beta2) * dCurrent ** 2 * grad[0] ** 2,
          params.beta2 * v[1] + (1 - params.beta2) * dCurrent ** 2 * grad[1] ** 2,
        ];
        // r накапливает d^2 * <g, x0 - x> — нижнюю оценку расстояния
        // от стартовой точки до минимума (после нормировки на ||s||_1)
        const diffDot = dot2(grad, sub2(initialX, x));
        r = sqrtBeta2 * r + (1 - sqrtBeta2) * lr * dCurrent ** 2 * diffDot;
        s = [
          sqrtBeta2 * s[0] + (1 - sqrtBeta2) * lr * dCurrent ** 2 * grad[0],
          sqrtBeta2 * s[1] + (1 - sqrtBeta2) * lr * dCurrent ** 2 * grad[1],
        ];
        const sNorm = Math.abs(s[0]) + Math.abs(s[1]);
        if (sNorm > 0) {
          // d монотонно не убывает: раскручивается от d0 до оценки расстояния до минимума
          d = Math.max(dCurrent, r / sNorm);
        }
        // без bias-коррекции — как в Algorithm 1 статьи
        // и в референсной реализации konstmish/prodigy по умолчанию
        x = [
          x[0] - lr * dCurrent * (m[0] / (Math.sqrt(v[0]) + dCurrent * params.eps)),
          x[1] - lr * dCurrent * (m[1] / (Math.sqrt(v[1]) + dCurrent * params.eps)),
        ];
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        m = zero2();
        v = zero2();
        s = zero2();
        r = 0;
        d = params.d0;
      },
    };
  },
};
