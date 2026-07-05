import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@shared/api/client";

import type { OptimizerMeta } from "./model";

export function useOptimizers() {
  return useQuery({
    queryKey: ["optimizers"],
    queryFn: () => apiClient.get<OptimizerMeta[]>("/optimizers"),
    staleTime: Infinity,
  });
}
