import type { OptimizerDescriptor } from "./types";
import { add2, dot2, norm2, scale2, sub2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const lbfgsOptimizer: OptimizerDescriptor = {
  name: "LBFGS",
  params: {
    lr: { default: 1.0, description: "начальная длина пробного шага линейного поиска вдоль квазиньютоновского направления" },
    historySize: { default: 10, description: "число хранимых пар (s, y) для двухцикловой аппроксимации обратного гессиана" },
    c1: { default: 0.0001, description: "коэффициент условия Армихо — требуемая доля предсказанного убывания функции" },
    tau: { default: 0.5, description: "множитель уменьшения шага при откате (backtracking) в линейном поиске" },
    maxLsSteps: { default: 20, description: "максимум уменьшений шага в линейном поиске; если шаг не найден — остаёмся на месте" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let sHistory: Vec2[] = [];
    let yHistory: Vec2[] = [];
    let prevX: Vec2 | null = null;
    let prevGradient: Vec2 | null = null;

    function updateHistory(grad: Vec2): void {
      if (prevX === null || prevGradient === null) return;
      const s = sub2(x, prevX);
      const y = sub2(grad, prevGradient);
      const sy = dot2(s, y);
      // negative-curvature guard: such a pair would break positive-definiteness
      // of the inverse-Hessian approximation
      if (!Number.isFinite(sy) || sy <= 1e-10) return;
      sHistory.push(s);
      yHistory.push(y);
      const historySize = Math.max(Math.trunc(params.historySize), 1);
      while (sHistory.length > historySize) {
        sHistory.shift();
        yHistory.shift();
      }
    }

    function computeDirection(grad: Vec2): Vec2 {
      if (sHistory.length === 0) return scale2(grad, -1);

      let q = grad;
      const rhos: number[] = [];
      const alphas: number[] = [];
      for (let i = sHistory.length - 1; i >= 0; i--) {
        const s = sHistory[i];
        const y = yHistory[i];
        const rho = 1 / dot2(y, s);
        const alpha = rho * dot2(s, q);
        q = sub2(q, scale2(y, alpha));
        rhos.push(rho);
        alphas.push(alpha);
      }

      const lastS = sHistory[sHistory.length - 1];
      const lastY = yHistory[yHistory.length - 1];
      let r = scale2(q, dot2(lastS, lastY) / dot2(lastY, lastY));

      for (let i = 0; i < sHistory.length; i++) {
        const s = sHistory[i];
        const y = yHistory[i];
        const rho = rhos[rhos.length - 1 - i];
        const alpha = alphas[alphas.length - 1 - i];
        const beta = rho * dot2(y, r);
        r = add2(r, scale2(s, alpha - beta));
      }

      return scale2(r, -1);
    }

    function lineSearch(direction: Vec2, grad: Vec2): Vec2 {
      const f0 = fn(x[0], x[1]);
      const slope = dot2(grad, direction);
      let t = params.lr;
      const maxLsSteps = Math.max(Math.trunc(params.maxLsSteps), 1);
      for (let i = 0; i < maxLsSteps; i++) {
        const trialX = add2(x, scale2(direction, t));
        const value = fn(trialX[0], trialX[1]);
        if (Number.isFinite(value) && value <= f0 + params.c1 * t * slope) return trialX;
        t *= params.tau;
      }
      return x;
    }

    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        updateHistory(grad);
        prevX = x;
        prevGradient = grad;

        // degenerate cases: minimum already found or gradient undefined
        if (!Number.isFinite(grad[0]) || !Number.isFinite(grad[1]) || norm2(grad) < 1e-12) {
          return { x, value: fn(x[0], x[1]) };
        }

        let direction = computeDirection(grad);
        if (!Number.isFinite(direction[0]) || !Number.isFinite(direction[1]) || dot2(grad, direction) >= 0) {
          // direction undefined or not a descent direction — fall back to steepest descent
          direction = scale2(grad, -1);
        }

        x = lineSearch(direction, grad);
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        sHistory = [];
        yHistory = [];
        prevX = null;
        prevGradient = null;
      },
    };
  },
};
