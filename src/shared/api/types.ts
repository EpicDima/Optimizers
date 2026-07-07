interface ParamMeta {
  default: number;
  description: string | null;
}

/** Метаданные одного оптимизатора или планировщика — форма ответа одинакова для обоих. */
export interface AlgorithmMeta {
  name: string;
  params: Record<string, ParamMeta>;
}
