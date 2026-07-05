import { apiClient } from "@shared/api/client";

import type { RunResult } from "./model";

export interface OptimizeRunPayload {
  slotId: string;
  optimizer: string;
  optimizerParams: Record<string, number>;
  scheduler: string;
  schedulerParams: Record<string, number>;
  start: [number, number];
  reset: boolean;
}

export interface OptimizeRequestPayload {
  function: { formula: string };
  runs: OptimizeRunPayload[];
  steps: number;
}

/** Не обёрнуто в useQuery/useMutation — результат живёт в runs-сторе
 * (Zustand), а не в кеше react-query, см. widgets/runs-sidebar. */
export function fetchOptimize(payload: OptimizeRequestPayload) {
  return apiClient.post<{ runs: RunResult[] }>("/optimize", payload);
}
