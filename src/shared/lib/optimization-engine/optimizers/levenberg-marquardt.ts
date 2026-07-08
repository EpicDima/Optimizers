import type { OptimizerDescriptor } from "./types";
import { addScaledIdentity2, scale2, solve2, sub2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient, hessian } from "@shared/lib/optimization-engine/functions";

export const levenbergMarquardtOptimizer: OptimizerDescriptor = {
  name: "LevenbergMarquardt",
  params: {
    lr: { default: 1.0, description: "масштаб шага по решению системы (H + m*I) d = g, обычно 1" },
    damping: { default: 0.001, description: "начальный демпфер m: сдвигает шаг от ньютоновского к градиентному; далее адаптируется сам" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let m = params.damping;
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        const hesse = hessian(fn, x[0], x[1]);
        const solved = solve2(addScaledIdentity2(hesse, m), grad);
        // near-singular (H + m*I): mirrors Python's except LinAlgError fallback
        const update = solved ?? grad;
        const nextX = sub2(x, scale2(update, params.lr));

        if (fn(nextX[0], nextX[1]) < fn(x[0], x[1])) {
          m = Math.max(m / 3, 1e-12);
          x = nextX;
          return { x, value: fn(x[0], x[1]), internals: {
            "grad.x": grad[0], "grad.y": grad[1], "|grad|": Math.sqrt(grad[0] ** 2 + grad[1] ** 2),
            damping: m,
            "H.00": hesse[0][0], "H.01": hesse[0][1], "H.11": hesse[1][1],
            accepted: 1,
          } };
        }

        // rejected step: stay put and increase damping, matching Python's
        // return self.move_next(self.x) which re-evaluates at the unchanged x
        m *= 2;
        return { x, value: fn(x[0], x[1]), internals: {
          "grad.x": grad[0], "grad.y": grad[1], "|grad|": Math.sqrt(grad[0] ** 2 + grad[1] ** 2),
          damping: m,
          "H.00": hesse[0][0], "H.01": hesse[0][1], "H.11": hesse[1][1],
          accepted: 0,
        } };
      },
      reset() {
        x = initialX;
        m = params.damping;
      },
    };
  },
};
