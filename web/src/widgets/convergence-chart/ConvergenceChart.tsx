import { useMemo, useState } from "react";
import type { Layout } from "plotly.js";

import { useRunsStore } from "@entities/run";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel } from "@shared/ui";

import { buildConvergenceTraces } from "./build-traces";

/** Мини-график «значение функции от шага» — то, чего нет в десктопном
 * приложении (там в легенде видно только текущее значение). Показывает
 * полную кривую последнего посчитанного результата каждого видимого запуска,
 * не привязан к состоянию проигрывания анимации. */
export function ConvergenceChart() {
  const { slots, results } = useRunsStore();
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(false);

  const data = useMemo(() => buildConvergenceTraces(slots, results), [slots, results]);

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
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </Panel>
  );
}
