import type { Data } from "plotly.js";

import type { RunConfig, RunResult } from "@entities/run";

/** По одному трейсу «значение» (левая ось) и, если у оптимизатора есть
 * learning rate, трейсу lr (правая ось y2, пунктиром) на каждый видимый
 * запуск — наложены на один график, чтобы сравнивать динамику значения и lr
 * без переключения вкладок. Обе линии одного запуска красятся в slot.color
 * (связь с траекторией на основном графике), пунктир — единственное, что
 * отличает lr от значения при таком же цвете. Строит полную кривую последнего
 * посчитанного результата, без привязки к состоянию воспроизведения анимации
 * (это отдельная возможность, реализуемая параллельно). lr есть не у всех
 * оптимизаторов (например, у LBFGS или Ньютона его нет) — такие запуски молча
 * остаются без второй линии.
 *
 * hoverinfo включает "name": в едином (hovermode: "x unified") тултипе
 * Plotly обнуляет trace.name у точек, чей hoverinfo не перечисляет "name" —
 * без этого строки «значение» и «lr» в общем окне навести было бы нечем
 * различить.
 */
export function buildConvergenceTraces(slots: RunConfig[], results: Record<string, RunResult>): Data[] {
  const traces: Data[] = [];

  for (const slot of slots) {
    if (!slot.visible) continue;
    const result = results[slot.slotId];
    if (!result || result.error) continue;

    traces.push({
      type: "scatter",
      mode: "lines",
      x: result.value.map((_, i) => i),
      y: result.value,
      line: { color: slot.color, width: 2, dash: "solid" },
      name: slot.optimizer,
      showlegend: false,
      hoverinfo: "x+y+name",
    });

    if (!result.lr) continue;

    traces.push({
      type: "scatter",
      mode: "lines",
      x: result.lr.map((_, i) => i),
      y: result.lr,
      yaxis: "y2",
      line: { color: slot.color, width: 2, dash: "dot" },
      name: `${slot.optimizer} · lr`,
      showlegend: false,
      hoverinfo: "x+y+name",
    });
  }

  return traces;
}
