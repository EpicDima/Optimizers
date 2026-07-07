import { useQuery } from "@tanstack/react-query";

import { toPlotlyColorscale, useColormapCatalog } from "@entities/colormap";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { buildSurface } from "@shared/lib/optimization-engine/functions/surface";
import type { FunctionDescriptor } from "@shared/lib/optimization-engine/functions/types";

import { renderHeatmapThumbnail } from "./render-thumbnail";

const GRID = 300;

export function useThumbnailImage(preset: FunctionDescriptor, enabled: boolean) {
  const { data: catalog } = useColormapCatalog();
  const colormap = usePlotSettingsStore((s) => s.colormap);
  const reversed = usePlotSettingsStore((s) => s.colormapReversed);

  const stops = catalog ? toPlotlyColorscale(catalog, colormap, reversed) : null;

  return useQuery({
    queryKey: ["gallery-thumbnail", preset.name, colormap, reversed],
    queryFn: () => {
      const surface = buildSurface(preset.fn, preset.range, GRID);
      return renderHeatmapThumbnail(surface.z, stops!);
    },
    staleTime: Infinity,
    enabled: enabled && stops !== null,
  });
}
