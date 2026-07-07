import { useQuery } from "@tanstack/react-query";

import { buildSurface } from "@shared/lib/optimization-engine/functions/surface";
import type { FunctionDescriptor } from "@shared/lib/optimization-engine/functions/types";

import { renderHeatmapThumbnail } from "./render-thumbnail";

const GRID = 80;

export function useThumbnailImage(preset: FunctionDescriptor, enabled: boolean) {
  return useQuery({
    queryKey: ["gallery-thumbnail", preset.name],
    queryFn: () => {
      const surface = buildSurface(preset.fn, preset.range, GRID);
      return renderHeatmapThumbnail(surface.z);
    },
    staleTime: Infinity,
    enabled,
  });
}
