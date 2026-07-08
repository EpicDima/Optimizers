import type { OptimizerDescriptor } from "./types";
import { add2, scale2, sub2, zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const adanOptimizer: OptimizerDescriptor = {
  name: "Adan",
  params: {
    lr: { default: 0.05, description: "скорость обучения — масштаб шага" },
    beta1: { default: 0.98, description: "коэффициент EMA самого градиента (первый момент m)" },
    beta2: {
      default: 0.92,
      description: "коэффициент EMA разности соседних градиентов и её вес в Nesterov-поправке шага",
    },
    beta3: { default: 0.99, description: "коэффициент EMA квадрата скорректированного градиента — адаптивный масштаб шага" },
    eps: { default: 1e-8, description: "малая добавка в знаменатель для численной устойчивости, настраивать обычно не нужно" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let m: Vec2 = zero2();
    let v: Vec2 = zero2();
    let n: Vec2 = zero2();
    let gPrev: Vec2 = zero2();
    let t = 0;
    return {
      get x() { return x; },
      params,
      next() {
        t += 1;
        const grad = gradient(fn, x[0], x[1]);
        // на первом шаге разность градиентов считается нулевой (как в референсной реализации)
        const diff: Vec2 = t > 1 ? sub2(grad, gPrev) : zero2();
        m = add2(scale2(m, params.beta1), scale2(grad, 1 - params.beta1));
        v = add2(scale2(v, params.beta2), scale2(diff, 1 - params.beta2));
        // n - EMA квадрата градиента с Nesterov-поправкой на изменение градиента
        const corrected = add2(grad, scale2(diff, 1 - params.beta2));
        const correctedSq: Vec2 = [corrected[0] ** 2, corrected[1] ** 2];
        n = add2(scale2(n, params.beta3), scale2(correctedSq, 1 - params.beta3));
        const eta: Vec2 = [
          params.lr / (Math.sqrt(n[0]) + params.eps),
          params.lr / (Math.sqrt(n[1]) + params.eps),
        ];
        const inner = add2(m, scale2(v, 1 - params.beta2));
        x = sub2(x, [eta[0] * inner[0], eta[1] * inner[1]]);
        gPrev = grad;
        return { x, value: fn(x[0], x[1]), internals: {
          "m.x": m[0], "m.y": m[1], "|m|": Math.sqrt(m[0] ** 2 + m[1] ** 2),
          "v.x": v[0], "v.y": v[1], "|v|": Math.sqrt(v[0] ** 2 + v[1] ** 2),
          "n.x": n[0], "n.y": n[1],
          t,
        } };
      },
      reset() {
        x = initialX;
        m = zero2();
        v = zero2();
        n = zero2();
        gPrev = zero2();
        t = 0;
      },
    };
  },
};
