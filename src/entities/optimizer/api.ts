import { useQuery } from "@tanstack/react-query";

import { getOptimizerDescriptor, optimizerNames } from "@shared/lib/optimization-engine/optimizers";

import type { OptimizerMeta } from "./model";

function listOptimizers(): OptimizerMeta[] {
  return optimizerNames().map((name) => {
    const descriptor = getOptimizerDescriptor(name);
    if (!descriptor) throw new Error(`Unknown optimizer: ${name}`);
    return { name: descriptor.name, params: descriptor.params };
  });
}

export function useOptimizers() {
  return useQuery({
    queryKey: ["optimizers"],
    queryFn: () => listOptimizers(),
    staleTime: Infinity,
  });
}
