import type { OptimizerDescriptor } from "./types";
import {
  addScaledIdentity2,
  invSqrtSymmetric2,
  outer2,
  scale2,
  sub2,
  type Mat2,
  type Vec2,
} from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

function addMat2(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] + b[0][0], a[0][1] + b[0][1]],
    [a[1][0] + b[1][0], a[1][1] + b[1][1]],
  ];
}

function matVec2(m: Mat2, v: Vec2): Vec2 {
  return [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
}

export const shampooOptimizer: OptimizerDescriptor = {
  name: "Shampoo",
  params: {
    lr: { default: 0.5, description: "скорость обучения — масштаб шага" },
    eps: { default: 1e-6, description: "добавка eps*I к накопителю перед обращением — численная защита собственных значений" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let h: Mat2 = [[0, 0], [0, 0]];
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        h = addMat2(h, outer2(grad, grad));
        const invSqrtH = invSqrtSymmetric2(addScaledIdentity2(h, params.eps));
        const update = matVec2(invSqrtH, grad);
        x = sub2(x, scale2(update, params.lr));
        return { x, value: fn(x[0], x[1]) };
      },
      reset() {
        x = initialX;
        h = [[0, 0], [0, 0]];
      },
    };
  },
};
