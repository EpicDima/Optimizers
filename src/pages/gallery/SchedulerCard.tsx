import { useMemo, useState } from "react";

import type { SchedulerDescriptor } from "@shared/lib/optimization-engine/schedulers/types";
import { useResolvedTheme } from "@shared/lib/theme";
import { NumberField } from "@shared/ui";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";

import { renderLineThumbnail } from "./render-thumbnail";

const TOTAL_STEPS = 10_000;
const ACCENT_LIGHT = "#0284c7";
const ACCENT_DARK = "#3bb2ff";

interface SchedulerCardProps {
  descriptor: SchedulerDescriptor;
}

export function SchedulerCard({ descriptor }: SchedulerCardProps) {
  const resolvedTheme = useResolvedTheme();

  const [params, setParams] = useState<Record<string, number>>(() =>
    Object.fromEntries(Object.entries(descriptor.params).map(([k, v]) => [k, v.default])),
  );
  const [baseLr, setBaseLr] = useState(0.01);

  const src = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let step = 0; step < TOTAL_STEPS; step++) {
      xs.push(step);
      ys.push(descriptor.lr(params, step, TOTAL_STEPS, baseLr));
    }
    const bg = plotlyThemeColors(resolvedTheme).paper;
    const lineColor = resolvedTheme === "dark" ? ACCENT_DARK : ACCENT_LIGHT;
    return renderLineThumbnail(xs, ys, 560, 256, lineColor, bg);
  }, [descriptor, params, baseLr, resolvedTheme]);

  const paramEntries = Object.entries(descriptor.params);

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-border bg-bg-elevated">
      <div className="h-32">
        <img src={src} alt={descriptor.name} className="h-full w-full object-cover" draggable={false} />
      </div>
      <div className="flex flex-col gap-2 border-t border-border px-3 py-2">
        <span className="font-sans text-sm font-medium text-text">{descriptor.name}</span>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          <NumberField label="lr" value={baseLr} onChange={setBaseLr} description="Базовый learning rate" />
          {paramEntries.map(([key, meta]) => (
            <NumberField
              key={key}
              label={key}
              description={meta.description ?? undefined}
              value={params[key]}
              onChange={(v) => setParams((prev) => ({ ...prev, [key]: v }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
