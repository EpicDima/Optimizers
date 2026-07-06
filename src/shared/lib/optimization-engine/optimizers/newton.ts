import type { OptimizerDescriptor } from "./types";
import { eigvalsh2, scale2, solve2, sub2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient, hessian } from "@shared/lib/optimization-engine/functions";

export const newtonOptimizer: OptimizerDescriptor = {
  name: "Newton",
  params: {
    lr: { default: 0.01, description: "демпфер ньютоновского шага: 1 — полный шаг x - H^(-1) g, меньше — осторожнее" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        const hesse = hessian(fn, x[0], x[1]);
        let update: Vec2;
        if (eigvalsh2(hesse)[0] > 0) {
          const solved = solve2(hesse, grad);
          // near-singular гессиан: Python's raw sign-check would proceed into a
          // poorly-conditioned solve here, we fall back to the gradient instead
          update = solved ?? grad;
        } else {
          update = grad;
        }
        x = sub2(x, scale2(update, params.lr));
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
      },
    };
  },
};
