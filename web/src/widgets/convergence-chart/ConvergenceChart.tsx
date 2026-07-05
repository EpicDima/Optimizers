import { useMemo, useState } from "react";
import type { Layout } from "plotly.js";

import { useRunsStore } from "@entities/run";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel, ToggleGroup } from "@shared/ui";
import type { ToggleGroupOption } from "@shared/ui";

import { buildConvergenceTraces, buildLrTraces } from "./build-traces";

type Metric = "value" | "lr";

const METRIC_OPTIONS: ToggleGroupOption[] = [
  { value: "value", label: "Значение" },
  { value: "lr", label: "lr" },
];

const METRIC_Y_TITLE: Record<Metric, string> = {
  value: "Значение",
  lr: "lr",
};

/** Мини-график «значение функции от шага» — то, чего нет в десктопном
 * приложении (там в легенде видно только текущее значение). Показывает
 * полную кривую последнего посчитанного результата каждого видимого запуска,
 * не привязан к состоянию проигрывания анимации. Вкладка lr показывает ту же
 * кривую, но для learning rate по шагам — есть не у всех оптимизаторов
 * (например, LBFGS или Ньютон без lr молча выпадают из этой вкладки). */
export function ConvergenceChart() {
  const { slots, results } = useRunsStore();
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(false);
  const [metric, setMetric] = useState<Metric>("value");

  const data = useMemo(
    () => (metric === "value" ? buildConvergenceTraces(slots, results) : buildLrTraces(slots, results)),
    [metric, slots, results],
  );

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
      margin: { l: 44, r: 10, t: 10, b: 32 },
      showlegend: false,
      uirevision: "keep",
      xaxis: { title: { text: "Шаг" }, gridcolor: theme.gridColor, color: theme.mutedFontColor, zeroline: false },
      yaxis: {
        title: { text: METRIC_Y_TITLE[metric] },
        type: logScale ? "log" : "linear",
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        zeroline: false,
      },
    };
  }, [resolvedTheme, logScale, metric]);

  const plotRef = usePlotlyAutoResize();

  return (
    <Panel
      heading="Сходимость"
      actions={
        <div className="flex items-center gap-2">
          <ToggleGroup value={metric} onChange={(next) => setMetric(next as Metric)} options={METRIC_OPTIONS} />
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
