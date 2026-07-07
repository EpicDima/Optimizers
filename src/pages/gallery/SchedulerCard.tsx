import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { SchedulerDescriptor } from "@shared/lib/optimization-engine/schedulers/types";
import { useResolvedTheme } from "@shared/lib/theme";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";

import { renderLineThumbnail } from "./render-thumbnail";

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

  const { data: src } = useQuery({
    queryKey: ["scheduler-thumbnail", descriptor.name, resolvedTheme],
    queryFn: () => {
      const xs: number[] = [];
      const ys: number[] = [];
      for (let step = 0; step < TOTAL_STEPS; step++) {
        xs.push(step);
        ys.push(descriptor.lr(defaults, step, TOTAL_STEPS, BASE_LR));
      }
      const bg = plotlyThemeColors(resolvedTheme).paper;
      const lineColor = resolvedTheme === "dark" ? ACCENT_DARK : ACCENT_LIGHT;
      return renderLineThumbnail(xs, ys, 560, 256, lineColor, bg);
    },
    staleTime: Infinity,
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-border bg-bg-elevated">
      <div className="h-32">
        {src ? (
          <img src={src} alt={descriptor.name} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full items-center justify-center bg-bg-sunken">
            <span className="text-xs text-text-muted">Загрузка…</span>
          </div>
        )}
      </div>
      <div className="border-t border-border px-3 py-2">
        <span className="font-sans text-sm font-medium text-text">{descriptor.name}</span>
      </div>
    </div>
  );
}
