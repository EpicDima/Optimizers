import type { AlgorithmMeta } from "@shared/api/types";
import type { Vec2 } from "@shared/lib/optimization-engine/linalg";

export interface OptimizerStep {
  x: Vec2;
  value: number;
}

export interface OptimizerInstance {
  readonly x: Vec2;
  readonly params: Record<string, number>;
  next(): OptimizerStep;
  reset(): void;
}

export interface OptimizerDescriptor extends AlgorithmMeta {
  // params всегда содержит полный набор ключей descriptor.params (дефолты уже
  // подставлены и объединены с пользовательскими значениями вызывающей стороной,
  // как аргументы конструктора Python-класса перед первым next_point()).
  createInstance(fn: (x: number, y: number) => number, initialX: Vec2, params: Record<string, number>): OptimizerInstance;
}
