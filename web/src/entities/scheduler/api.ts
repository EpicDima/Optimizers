import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@shared/api/client";

import type { SchedulerMeta } from "./model";

export function useSchedulers() {
  return useQuery({
    queryKey: ["schedulers"],
    queryFn: () => apiClient.get<SchedulerMeta[]>("/schedulers"),
    staleTime: Infinity,
  });
}
