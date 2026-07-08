import type { OptimizerDescriptor } from "./types";
import { zero2, type Vec2 } from "@shared/lib/optimization-engine/linalg";
import { gradient } from "@shared/lib/optimization-engine/functions";

export const rpropOptimizer: OptimizerDescriptor = {
  name: "Rprop",
  params: {
    decFactor: {
      default: 0.5,
      description: "множитель уменьшения длины шага при смене знака градиента (минимум проскочен)",
    },
    incFactor: {
      default: 1.2,
      description: "множитель увеличения длины шага, пока знак градиента по координате не меняется",
    },
    stepMin: { default: 1e-6, description: "нижняя граница длины шага по каждой координате" },
    stepMax: { default: 50, description: "верхняя граница длины шага по каждой координате" },
  },
  createInstance(fn, initialX, params) {
    let x: Vec2 = initialX;
    let lastGradient: Vec2 = zero2();
    let stepSize: Vec2 = [1, 1];
    return {
      get x() { return x; },
      params,
      next() {
        const grad = gradient(fn, x[0], x[1]);
        const step = (i: 0 | 1): { grad: number; size: number } => {
          const mul = grad[i] * lastGradient[i];
          const factor = mul > 0 ? params.incFactor : mul < 0 ? params.decFactor : 1.0;
          const size = Math.min(Math.max(stepSize[i] * factor, params.stepMin), params.stepMax);
          return { grad: mul < 0 ? 0.0 : grad[i], size };
        };
        const s0 = step(0);
        const s1 = step(1);
        stepSize = [s0.size, s1.size];
        lastGradient = [s0.grad, s1.grad];
        x = [
          x[0] - Math.sign(lastGradient[0]) * stepSize[0],
          x[1] - Math.sign(lastGradient[1]) * stepSize[1],
        ];
        return { x, value: fn(x[0], x[1]), internals: {
          "step.x": stepSize[0], "step.y": stepSize[1],
          "grad.x": lastGradient[0], "grad.y": lastGradient[1],
        } };
      },
      reset() {
        x = initialX;
        lastGradient = zero2();
        stepSize = [1, 1];
      },
    };
  },
};
