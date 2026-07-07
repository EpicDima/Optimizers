import type { RunConfig, RunResult } from "@entities/run";

import { formatSignificant } from "./format-value";

interface StepInfoOverlayProps {
  slots: RunConfig[];
  results: Record<string, RunResult>;
  frame: number;
}

export function StepInfoOverlay({ slots, results, frame }: StepInfoOverlayProps) {
  const visibleSlots = slots.filter((slot) => slot.visible);
  if (visibleSlots.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-12 left-2 z-10 max-w-[70%]
        border border-border bg-bg-elevated/90 px-2.5 py-2 backdrop-blur-sm"
    >
      <div className="mb-1 font-sans text-[11px] font-medium text-text-muted">Шаг {frame}</div>
      <div className="flex flex-col gap-1">
        {visibleSlots.map((slot) => {
          const result = results[slot.slotId];
          if (!result || result.error) {
            return (
              <div key={slot.slotId} className="flex items-center gap-1.5">
                <span className="inline-block size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: slot.color }} />
                <span className="font-sans text-[11px] text-text">{slot.optimizer}</span>
                {result?.error && <span className="font-mono text-[11px] text-danger">ошибка</span>}
              </div>
            );
          }

          const idx = Math.min(frame, result.x.length - 1);
          const x = result.x[idx];
          const y = result.y[idx];
          const value = result.value[idx];
          const lr = result.lr?.[idx] ?? null;

          return (
            <div key={slot.slotId} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: slot.color }} />
                <span className="font-sans text-[11px] font-medium text-text">{slot.optimizer}</span>
              </div>
              <div className="pl-3.5 font-mono text-[11px] leading-tight text-text-muted">
                <span>x={formatSignificant(x, 4)}, y={formatSignificant(y, 4)}</span>
                <br />
                <span>f={formatSignificant(value, 4)}</span>
                {lr !== null && <span>, lr={formatSignificant(lr, 3)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
