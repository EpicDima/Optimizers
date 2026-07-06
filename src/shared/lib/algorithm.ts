import type { AlgorithmMeta } from "@shared/api/types";

/** Значения по умолчанию для формы параметров оптимизатора/планировщика. */
export function defaultParams(meta: AlgorithmMeta): Record<string, number> {
  return Object.fromEntries(Object.entries(meta.params).map(([key, param]) => [key, param.default]));
}
