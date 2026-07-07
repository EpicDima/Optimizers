import { useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { useSensitivityStore } from "@entities/sensitivity";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel } from "@shared/ui";

export function SensitivityConvergenceChart() {
  const { results, paramName } = useSensitivityStore();
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(true);
  const plotRef = usePlotlyAutoResize();

  const data = useMemo((): Data[] =>
    results.map((r) => ({
      type: "scatter" as const,
      mode: "lines" as const,
      x: r.values.map((_, i) => i),
      y: r.values,
      name: `${paramName}=${Number(r.paramValue.toPrecision(4))}`,
      line: { color: r.color, width: 1.5 },
    })),
    [results, paramName],
  );

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
      margin: { l: 50, r: 16, t: 10, b: 36 },
      showlegend: true,
      legend: { font: { size: 10 }, bgcolor: "rgba(0,0,0,0)" },
      uirevision: "keep",
      hovermode: "x unified",
      xaxis: { title: { text: "Шаг" }, gridcolor: theme.gridColor, color: theme.mutedFontColor, zeroline: false },
      yaxis: {
        title: { text: "Значение" },
        type: logScale ? "log" : "linear",
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        zeroline: false,
      },
    };
  }, [resolvedTheme, logScale]);

  return (
    <Panel
      heading="Сходимость"
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
