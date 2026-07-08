import type { RunConfig, RunResult } from "@entities/run";

import { formatSignificant } from "./format-value";

interface TrajectoryReadoutProps {
  slots: RunConfig[];
  results: Record<string, RunResult>;
  frame: number;
  showCoords?: boolean;
}

export function TrajectoryReadout({ slots, results, frame, showCoords }: TrajectoryReadoutProps) {
  const visibleSlots = slots.filter((slot) => slot.visible);
  if (visibleSlots.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-3 left-3 z-10 max-h-40 max-w-[65%] overflow-y-auto
        border border-border bg-bg-elevated/90 px-2 py-1.5 backdrop-blur-sm"
    >
      {visibleSlots.map((slot) => {
        const result = results[slot.slotId];
        const idx = result && !result.error ? Math.min(frame, result.value.length - 1) : -1;
        const value = idx >= 0 ? result?.value[idx] : undefined;
        const lr = idx >= 0 ? (result?.lr?.[idx] ?? null) : null;
        const x = idx >= 0 ? result?.x[idx] : undefined;
        const y = idx >= 0 ? result?.y[idx] : undefined;

        return (
          <div key={slot.slotId} className="flex items-center gap-1.5 py-0.5 whitespace-nowrap">
            <span className="inline-block size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: slot.color }} />
            <span className="font-sans text-xs text-text">{slot.optimizer}</span>
            {result?.error ? (
              <span className="font-mono text-xs text-danger">ошибка</span>
            ) : value !== undefined ? (
              <span className="font-mono text-xs text-text-muted">
                {`= ${formatSignificant(value, 4)}`}
                {lr !== null && `, lr: ${formatSignificant(lr, 3)}`}
                {showCoords && x !== undefined && y !== undefined && (
                  <>, x: {formatSignificant(x, 4)}, y: {formatSignificant(y, 4)}</>
                )}
                {showCoords && result?.internals && (() => {
                  const step = Math.min(frame, (Object.values(result.internals)[0]?.length ?? 1) - 1);
                  if (step < 0) return null;
                  const entries = Object.entries(result.internals);
                  if (entries.length === 0) return null;
                  return entries.slice(0, 4).map(([key, arr]) => (
                    <span key={key}>, {key}: {formatSignificant(arr[step], 3)}</span>
                  ));
                })()}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
