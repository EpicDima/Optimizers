import { useQuery } from "@tanstack/react-query";

import { buildSurface } from "@shared/lib/optimization-engine/functions/surface";
import type { FunctionDescriptor } from "@shared/lib/optimization-engine/functions/types";
import { useResolvedTheme } from "@shared/lib/theme";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";

import { renderHeatmapThumbnail } from "./render-thumbnail";

const GRID = 50;
const SIZE = 400;

export function useThumbnailImage(preset: FunctionDescriptor, enabled: boolean) {
  const theme = useResolvedTheme();

  return useQuery({
    queryKey: ["gallery-thumbnail", preset.name, theme],
    queryFn: () => {
      const surface = buildSurface(preset.fn, preset.range, GRID);
      const bg = plotlyThemeColors(theme).paper;
      return renderHeatmapThumbnail(surface.z, SIZE, bg);
    },
    staleTime: Infinity,
    enabled,
  });
}
