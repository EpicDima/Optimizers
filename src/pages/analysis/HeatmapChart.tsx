import { useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { useAnalysisStore } from "@entities/analysis";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel } from "@shared/ui";

export function HeatmapChart() {
  const heatmapData = useAnalysisStore((s) => s.heatmapData);
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(true);
  const plotRef = usePlotlyAutoResize();

  const data = useMemo((): Data[] => {
    if (!heatmapData) return [];
    const z = logScale
      ? heatmapData.z.map((row) => row.map((v) => (v > 0 ? Math.log10(v) : NaN)))
      : heatmapData.z;
    return [
      {
        type: "heatmap" as const,
        x: heatmapData.xs,
        y: heatmapData.ys,
        z,
        colorscale: "Viridis",
        reversescale: true,
        colorbar: {
          title: { text: logScale ? "log₁₀ f" : "f(x,y)", side: "right" as const },
          thickness: 12,
          len: 0.9,
        },
        hovertemplate: "x₀=%{x:.2f}<br>y₀=%{y:.2f}<br>f=%{customdata:.4g}<extra></extra>",
        customdata: heatmapData.z,
      },
    ];
  }, [heatmapData, logScale]);

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
      actions={<Checkbox checked={logScale} onChange={setLogScale} label="Лог. шкала" />}
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
