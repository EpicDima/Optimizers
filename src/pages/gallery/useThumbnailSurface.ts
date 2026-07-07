import { useQuery } from "@tanstack/react-query";

import { buildSurface } from "@shared/lib/optimization-engine/functions/surface";
import type { FunctionDescriptor } from "@shared/lib/optimization-engine/functions/types";

const THUMBNAIL_GRID_SIZE = 50;

export function useThumbnailSurface(preset: FunctionDescriptor, enabled: boolean) {
  return useQuery({
    queryKey: ["gallery-thumbnail", preset.name],
    queryFn: () => buildSurface(preset.fn, preset.range, THUMBNAIL_GRID_SIZE),
    staleTime: Infinity,
    enabled,
  });
}
