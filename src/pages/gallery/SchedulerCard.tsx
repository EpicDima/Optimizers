import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import type { SchedulerDescriptor } from "@shared/lib/optimization-engine/schedulers/types";
import { Plot } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";

const TOTAL_STEPS = 200;
const BASE_LR = 0.01;

const ACCENT_LIGHT = "#0284c7";
const ACCENT_DARK = "#3bb2ff";

interface SchedulerCardProps {
  descriptor: SchedulerDescriptor;
}

export function SchedulerCard({ descriptor }: SchedulerCardProps) {
  const resolvedTheme = useResolvedTheme();

  const defaults = useMemo(
    () => Object.fromEntries(Object.entries(descriptor.params).map(([k, v]) => [k, v.default])),
    [descriptor],
  );

  const trace = useMemo((): Data[] => {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let step = 0; step < TOTAL_STEPS; step++) {
      xs.push(step);
      ys.push(descriptor.lr(defaults, step, TOTAL_STEPS, BASE_LR));
    }
    return [
      {
        x: xs,
        y: ys,
        type: "scatter" as const,
        mode: "lines" as const,
        line: { color: resolvedTheme === "dark" ? ACCENT_DARK : ACCENT_LIGHT, width: 2 },
        hoverinfo: "skip" as const,
      },
    ];
  }, [descriptor, defaults, resolvedTheme]);

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      xaxis: { visible: false },
      yaxis: { visible: false },
      showlegend: false,
    };
  }, [resolvedTheme]);

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-border bg-bg-elevated">
      <div className="h-32">
        <Plot
          data={trace}
          layout={layout}
          config={{ staticPlot: true, responsive: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="border-t border-border px-3 py-2">
        <span className="font-sans text-sm font-medium text-text">{descriptor.name}</span>
      </div>
    </div>
  );
}
