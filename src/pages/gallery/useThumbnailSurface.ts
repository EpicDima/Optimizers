import { useQuery } from "@tanstack/react-query";

import { buildSurface } from "@shared/lib/optimization-engine/functions/surface";
import type { FunctionDescriptor } from "@shared/lib/optimization-engine/functions/types";
import { useResolvedTheme } from "@shared/lib/theme";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";

import { renderThumbnail } from "./render-thumbnail";

const GRID = 50;
const SIZE = 400;

export function useThumbnailImage(preset: FunctionDescriptor, enabled: boolean) {
  const theme = useResolvedTheme();

  return useQuery({
    queryKey: ["gallery-thumbnail", preset.name, theme],
    queryFn: async () => {
      const surface = buildSurface(preset.fn, preset.range, GRID);
      const colors = plotlyThemeColors(theme);
      return renderThumbnail(
        [
          {
            type: "contour",
            x: surface.meshX,
            y: surface.meshY,
            z: surface.z,
            colorscale: "Viridis",
            showscale: false,
            contours: { coloring: "heatmap" },
            hoverinfo: "none",
          },
        ],
        {
          paper_bgcolor: colors.paper,
          plot_bgcolor: colors.paper,
          margin: { l: 0, r: 0, t: 0, b: 0 },
          xaxis: { visible: false },
          yaxis: { visible: false, scaleanchor: "x" },
          showlegend: false,
        },
        SIZE,
      );
    },
    staleTime: Infinity,
    enabled,
  });
}
