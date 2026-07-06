import type { OptimizerDescriptor } from "./types";
import { add2, scale2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const ademamixOptimizer: OptimizerDescriptor = {
  name: "AdEMAMix",
  params: {
    lr: { default: 0.01, description: "скорость обучения — масштаб шага" },
    beta1: { default: 0.9, description: "коэффициент быстрой EMA момента m1 (как beta1 в Adam)" },
    beta2: {
      default: 0.999,
      description: "коэффициент EMA второго момента (квадратов градиента) для адаптивного масштаба шага",
    },
    beta3: { default: 0.99, description: "коэффициент медленной EMA момента m2 — долгой памяти о старых градиентах" },
    alpha: { default: 5.0, description: "вес медленной EMA m2 в шаге: чем больше, тем сильнее вклад старых градиентов" },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let m1: Vec2 = zero2();
    let m2: Vec2 = zero2();
    let v: Vec2 = zero2();
    let t = 0;
    return {
      get x() { return x; },
      params,
      next() {
        t += 1;
        const grad = gradient(fn, x[0], x[1]);
        m1 = add2(scale2(m1, params.beta1), scale2(grad, 1 - params.beta1));
        // медленная EMA намеренно без bias-коррекции, как в статье
        m2 = add2(scale2(m2, params.beta3), scale2(grad, 1 - params.beta3));
        const gradSq: Vec2 = [grad[0] ** 2, grad[1] ** 2];
        v = add2(scale2(v, params.beta2), scale2(gradSq, 1 - params.beta2));
        const m1Hat = scale2(m1, 1 / (1 - params.beta1 ** t));
        const vHat = scale2(v, 1 / (1 - params.beta2 ** t));
        const denom: Vec2 = [Math.sqrt(vHat[0]) + params.eps, Math.sqrt(vHat[1]) + params.eps];
        const combined = add2(m1Hat, scale2(m2, params.alpha));
        x = sub2(x, [params.lr * (combined[0] / denom[0]), params.lr * (combined[1] / denom[1])]);
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        m1 = zero2();
        m2 = zero2();
        v = zero2();
        t = 0;
      },
    };
  },
};
