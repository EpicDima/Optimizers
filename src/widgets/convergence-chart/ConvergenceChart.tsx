import { useMemo, useState } from "react";
import type { Layout } from "plotly.js";

import { usePlaybackStore } from "@entities/playback";
import { useRunsStore } from "@entities/run";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel, Select } from "@shared/ui";

import { buildConvergenceTraces, collectAvailableMetrics } from "./build-traces";

/** Мини-график «значение функции и learning rate от шага».
 * Значение и lr наложены на один график одновременно: значение — сплошной
 * линией по левой оси, lr — пунктиром по правой (y2), у обеих линий одного
 * запуска общий цвет slot.color. Показывает полную кривую последнего
 * посчитанного результата каждого видимого запуска, не привязан к состоянию
 * проигрывания анимации. lr есть не у всех оптимизаторов (например, у LBFGS
 * или Ньютона его нет) — такие запуски молча остаются без пунктирной линии.
 * Ховер собран в один блок (hovermode: "x unified") — наведение в любой точке
 * графика сразу показывает значения всех видимых линий на этом шаге, а не
 * только той, что под курсором. Кривые обрезаны до текущего кадра
 * usePlaybackStore — во время автовоспроизведения и при ручной перемотке
 * таймлайна график остаётся синхронным с основным графиком, а не показывает
 * сразу всю финальную кривую. */
export function ConvergenceChart() {
  const { slots, results } = useRunsStore();
  const frame = usePlaybackStore((state) => state.frame);
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(false);
  const [secondaryMetric, setSecondaryMetric] = useState<string | null>("lr");

  const availableMetrics = useMemo(
    () => collectAvailableMetrics(slots, results),
    [slots, results],
  );

  const data = useMemo(
    () => buildConvergenceTraces(slots, results, frame, secondaryMetric),
    [slots, results, frame, secondaryMetric],
  );

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
        title: secondaryMetric ? { text: secondaryMetric } : undefined,
        overlaying: "y",
        side: "right",
        showgrid: false,
        color: theme.mutedFontColor,
        zeroline: false,
        visible: !!secondaryMetric,
      },
    };
  }, [resolvedTheme, logScale, secondaryMetric]);

  const plotRef = usePlotlyAutoResize();

  return (
    <Panel
      heading="Сходимость"
      actions={
        <div className="flex items-center gap-2">
          <Select
            value={secondaryMetric ?? "__none__"}
            onChange={(v) => setSecondaryMetric(v === "__none__" ? null : v)}
            options={[{ value: "__none__", label: "—" }, ...availableMetrics]}
            className="w-28"
          />
          <Checkbox checked={logScale} onChange={setLogScale} label="Лог. шкала (значение)" />
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
