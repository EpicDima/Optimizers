import { useMemo, useState } from "react";
import type { Layout } from "plotly.js";

import { useRunsStore } from "@entities/run";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel } from "@shared/ui";

import { buildConvergenceTraces } from "./build-traces";

/** Мини-график «значение функции и learning rate от шага» — то, чего нет в
 * десктопном приложении (там в легенде видно только текущее значение).
 * Значение и lr наложены на один график одновременно: значение — сплошной
 * линией по левой оси, lr — пунктиром по правой (y2), у обеих линий одного
 * запуска общий цвет slot.color. Показывает полную кривую последнего
 * посчитанного результата каждого видимого запуска, не привязан к состоянию
 * проигрывания анимации. lr есть не у всех оптимизаторов (например, у LBFGS
 * или Ньютона его нет) — такие запуски молча остаются без пунктирной линии.
 * Ховер собран в один блок (hovermode: "x unified") — наведение в любой точке
 * графика сразу показывает значения всех видимых линий на этом шаге, а не
 * только той, что под курсором. */
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
      margin: { l: 44, r: 44, t: 10, b: 32 },
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
        title: { text: "Значение" },
        type: logScale ? "log" : "linear",
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        zeroline: false,
      },
      yaxis2: {
        title: { text: "lr" },
        overlaying: "y",
        side: "right",
        showgrid: false,
        color: theme.mutedFontColor,
        zeroline: false,
      },
    };
  }, [resolvedTheme, logScale]);

  const plotRef = usePlotlyAutoResize();

  return (
    <Panel
      heading="Сходимость"
      actions={<Checkbox checked={logScale} onChange={setLogScale} label="Лог. шкала (значение)" />}
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
