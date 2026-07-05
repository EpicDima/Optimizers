import type { Data } from "plotly.js";

import type { RunConfig, RunResult } from "@entities/run";

/** Полная кривая «значение функции от шага» для каждого видимого запуска —
 * статичный снимок текущего результата, без привязки к состоянию воспроизведения
 * анимации (это отдельная возможность, реализуемая параллельно). Цвет линии
 * совпадает с цветом траектории на основном графике (slot.color), чтобы связать
 * два графика визуально без легенды Plotly (она отключена по всему проекту).
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
      line: { color: slot.color, width: 2 },
      name: slot.optimizer,
      showlegend: false,
      hoverinfo: "x+y",
    });
  }

  return traces;
}

/** То же самое, но для learning rate по шагам — есть не у всех оптимизаторов
 * (например, у LBFGS или Ньютона нет параметра lr), поэтому такие видимые
 * запуски здесь молча пропускаются, в отличие от buildConvergenceTraces. */
export function buildLrTraces(slots: RunConfig[], results: Record<string, RunResult>): Data[] {
  const traces: Data[] = [];

  for (const slot of slots) {
    if (!slot.visible) continue;
    const result = results[slot.slotId];
    if (!result || result.error || !result.lr) continue;

    traces.push({
      type: "scatter",
      mode: "lines",
      x: result.lr.map((_, i) => i),
      y: result.lr,
      line: { color: slot.color, width: 2 },
      name: slot.optimizer,
      showlegend: false,
      hoverinfo: "x+y",
    });
  }

  return traces;
}
