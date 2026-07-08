import { useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { useAnalysisStore } from "@entities/analysis";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel } from "@shared/ui";

export function FinalValueChart() {
  const { results, paramName } = useAnalysisStore();
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(true);
  const plotRef = usePlotlyAutoResize();

  const data = useMemo((): Data[] => {
    if (results.length === 0) return [];
    return [
      {
        type: "scatter" as const,
        mode: "lines+markers" as const,
        x: results.map((r) => r.paramValue),
        y: results.map((r) => r.finalValue),
        marker: {
          color: results.map((r) => r.color),
          size: 7,
        },
        line: { color: results[0].color, width: 1.5, dash: "dot" as const },
      },
    ];
  }, [results, paramName]);

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
      margin: { l: 50, r: 16, t: 10, b: 36 },
      showlegend: false,
      uirevision: "keep",
      hovermode: "x unified",
      xaxis: {
        title: { text: paramName },
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        zeroline: false,
      },
      yaxis: {
        title: { text: "Финальное значение" },
        type: logScale ? "log" : "linear",
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        zeroline: false,
      },
    };
  }, [resolvedTheme, paramName, logScale]);

  return (
    <Panel
      heading={`${paramName} → финальное f(x,y)`}
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
