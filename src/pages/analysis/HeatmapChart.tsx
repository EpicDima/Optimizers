import { useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { useAnalysisStore } from "@entities/analysis";
import { toPlotlyColorscale, useColormapCatalog } from "@entities/colormap";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel } from "@shared/ui";

export function HeatmapChart() {
  const heatmapData = useAnalysisStore((s) => s.heatmapData);
  const colormap = usePlotSettingsStore((s) => s.colormap);
  const colormapReversed = usePlotSettingsStore((s) => s.colormapReversed);
  const { data: catalog } = useColormapCatalog();
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(true);
  const [showContour, setShowContour] = useState(true);
  const plotRef = usePlotlyAutoResize();

  const colorscale = useMemo(
    () => (catalog ? toPlotlyColorscale(catalog, colormap, colormapReversed) : undefined),
    [catalog, colormap, colormapReversed],
  );

  const data = useMemo((): Data[] => {
    if (!heatmapData || !colorscale) return [];

    const z = logScale
      ? heatmapData.z.map((row) => row.map((v) => (v > 0 ? Math.log10(v) : NaN)))
      : heatmapData.z;

    const traces: Data[] = [
      {
        type: "heatmap" as const,
        x: heatmapData.xs,
        y: heatmapData.ys,
        z,
        colorscale,
        colorbar: {
          title: { text: logScale ? "log₁₀ f" : "f(x,y)", side: "right" as const },
          thickness: 12,
          len: 0.9,
        },
        hovertemplate: "x₀=%{x:.2f}<br>y₀=%{y:.2f}<br>f=%{customdata:.4g}<extra></extra>",
        customdata: heatmapData.z,
      },
    ];

    if (showContour) {
      const contourColor = resolvedTheme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";
      traces.push({
        type: "contour" as const,
        x: heatmapData.surfaceXs,
        y: heatmapData.surfaceYs,
        z: heatmapData.surfaceZ,
        contours: { coloring: "none" as const },
        line: { color: contourColor, width: 1.5 },
        showscale: false,
        hoverinfo: "skip" as const,
      });
    }

    return traces;
  }, [heatmapData, colorscale, logScale, showContour, resolvedTheme]);

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
      margin: { l: 50, r: 80, t: 10, b: 36 },
      uirevision: "keep",
      xaxis: {
        title: { text: "x₀" },
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
      },
      yaxis: {
        title: { text: "y₀" },
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        scaleanchor: "x",
      },
    };
  }, [resolvedTheme]);

  return (
    <Panel
      heading="Финальное f(x,y) от начальной точки"
      actions={
        <div className="flex items-center gap-3">
          <Checkbox checked={showContour} onChange={setShowContour} label="Рельеф" />
          <Checkbox checked={logScale} onChange={setLogScale} label="Лог. шкала" />
        </div>
      }
      className="h-full min-h-0"
    >
      <Plot
        ref={plotRef}
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </Panel>
  );
}
