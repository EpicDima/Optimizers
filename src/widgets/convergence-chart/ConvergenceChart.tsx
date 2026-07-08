import { useMemo, useState } from "react";
import type { Layout } from "plotly.js";

import { usePlaybackStore } from "@entities/playback";
import { useRunsStore } from "@entities/run";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel, Select } from "@shared/ui";

import { buildConvergenceTraces, collectAvailableMetrics } from "./build-traces";
import { metricLabel } from "./metric-labels";

const VALUE_OPTION = { value: "__value__", label: "f(x,y) — значение функции" };

export function ConvergenceChart() {
  const { slots, results } = useRunsStore();
  const frame = usePlaybackStore((state) => state.frame);
  const resolvedTheme = useResolvedTheme();
  const [primaryMetric, setPrimaryMetric] = useState("__value__");
  const [secondaryMetric, setSecondaryMetric] = useState<string | null>("lr");
  const [logLeft, setLogLeft] = useState(false);
  const [logRight, setLogRight] = useState(false);

  const availableMetrics = useMemo(
    () => collectAvailableMetrics(slots, results),
    [slots, results],
  );

  const metricOptions = useMemo(
    () => [VALUE_OPTION, ...availableMetrics.map((key) => ({ value: key, label: metricLabel(key) }))],
    [availableMetrics],
  );

  const data = useMemo(
    () => buildConvergenceTraces(slots, results, frame, primaryMetric, secondaryMetric),
    [slots, results, frame, primaryMetric, secondaryMetric],
  );

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
      margin: { l: 44, r: secondaryMetric ? 44 : 16, t: 10, b: 32 },
      showlegend: false,
      uirevision: "keep",
      hovermode: "x unified",
      hoverlabel: {
        bgcolor: theme.paper,
        bordercolor: theme.lineColor,
        font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
      },
      xaxis: { title: { text: "Шаг" }, gridcolor: theme.gridColor, color: theme.mutedFontColor, zeroline: false },
      yaxis: {
        type: logLeft ? "log" : "linear",
        rangemode: "tozero",
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        zeroline: false,
      },
      yaxis2: {
        overlaying: "y",
        side: "right",
        showgrid: false,
        type: logRight ? "log" : "linear",
        rangemode: "tozero",
        color: theme.mutedFontColor,
        zeroline: false,
        visible: !!secondaryMetric,
      },
    };
  }, [resolvedTheme, logLeft, logRight, secondaryMetric]);

  const plotRef = usePlotlyAutoResize();

  return (
    <Panel
      heading={
        <div className="flex items-center gap-1.5">
          <Select value={primaryMetric} onChange={setPrimaryMetric} options={metricOptions} className="w-48" />
          <Checkbox checked={logLeft} onChange={setLogLeft} label="Лог. шкала" />
        </div>
      }
      actions={
        <div className="flex items-center gap-1.5">
          <Checkbox checked={logRight} onChange={setLogRight} label="Лог. шкала" disabled={!secondaryMetric} />
          <Select
            value={secondaryMetric ?? "__none__"}
            onChange={(v) => setSecondaryMetric(v === "__none__" ? null : v)}
            options={[{ value: "__none__", label: "—" }, ...metricOptions]}
            className="w-48"
          />
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
