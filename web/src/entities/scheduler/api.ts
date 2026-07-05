import { useQuery } from "@tanstack/react-query";

import { getSchedulerDescriptor, schedulerNames } from "@shared/lib/optimization-engine/schedulers";

import type { SchedulerMeta } from "./model";

function listSchedulers(): SchedulerMeta[] {
  return schedulerNames().map((name) => {
    const descriptor = getSchedulerDescriptor(name);
    if (!descriptor) throw new Error(`Unknown scheduler: ${name}`);
    return { name: descriptor.name, params: descriptor.params };
  });
}

export function useSchedulers() {
  return useQuery({
    queryKey: ["schedulers"],
    queryFn: () => listSchedulers(),
    staleTime: Infinity,
  });
}
