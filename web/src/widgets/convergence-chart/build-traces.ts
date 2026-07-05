import type { Data } from "plotly.js";

import type { RunConfig, RunResult } from "@entities/run";

/** Обрезает плоскую серию (value или lr) до текущего кадра анимации [0, frame]
 * включительно. Логика та же, что у sliceResultToFrame из plot-panel/build-traces
 * (см. её комментарий про tail_start(frame_idx) в десктопе), но здесь нечего
 * переиспользовать напрямую: виджеты — один слой FSD и не должны зависеть друг
 * от друга, а этому графику не нужны ни x/y, ни хвостовое окно — только
 * усечение одного числового массива. */
function sliceToFrame(series: number[], frame: number): number[] {
  const end = Math.max(0, Math.min(frame + 1, series.length));
  return series.slice(0, end);
}

/** По одному трейсу «значение» (левая ось) и, если у оптимизатора есть
 * learning rate, трейсу lr (правая ось y2, пунктиром) на каждый видимый
 * запуск — наложены на один график, чтобы сравнивать динамику значения и lr
 * без переключения вкладок. Обе линии одного запуска красятся в slot.color
 * (связь с траекторией на основном графике), пунктир — единственное, что
 * отличает lr от значения при таком же цвете. Обе серии обрезаются до текущего
 * кадра анимации (frame из usePlaybackStore) — график остаётся синхронным и
 * с автовоспроизведением, и с ручной перемоткой таймлайна на основном графике,
 * а не всегда показывает целиком последний посчитанный результат. lr есть не
 * у всех оптимизаторов (например, у LBFGS или Ньютона его нет) — такие запуски
 * молча остаются без второй линии.
 *
 * hoverinfo включает "name": в едином (hovermode: "x unified") тултипе
 * Plotly обнуляет trace.name у точек, чей hoverinfo не перечисляет "name" —
 * без этого строки «значение» и «lr» в общем окне навести было бы нечем
 * различить.
 *
 * showLr — чекбокс «lr» в ConvergenceChart: при выключении lr-трейсы совсем
 * не строятся (а не просто скрываются через visible), чтобы правая ось не
 * маячила пустой шкалой поверх чужого масштаба значений.
 */
export function buildConvergenceTraces(
  slots: RunConfig[],
  results: Record<string, RunResult>,
  frame: number,
  showLr: boolean,
): Data[] {
  const traces: Data[] = [];

  for (const slot of slots) {
    if (!slot.visible) continue;
    const result = results[slot.slotId];
    if (!result || result.error) continue;

    const value = sliceToFrame(result.value, frame);
    traces.push({
      type: "scatter",
      mode: "lines",
      x: value.map((_, i) => i),
      y: value,
      line: { color: slot.color, width: 2, dash: "solid" },
      name: slot.optimizer,
      showlegend: false,
      hoverinfo: "x+y+name",
    });

    // Кружок на текущем (последнем видимом) шаге линии значения — во время
    // анимации линия растёт слева направо, и без этого маркера непонятно,
    // где именно сейчас находится каждый оптимизатор, не сверяясь с легендой
    // цветов. hoverinfo: "skip", чтобы не дублировать в едином тултипе строку,
    // которую и так даёт линия в этой же точке.
    if (value.length > 0) {
      const headIndex = value.length - 1;
      traces.push({
        type: "scatter",
        mode: "markers",
        x: [headIndex],
        y: [value[headIndex]],
        marker: { size: 8, color: slot.color },
        showlegend: false,
        hoverinfo: "skip",
      });
    }

    if (!showLr || !result.lr) continue;

    const lr = sliceToFrame(result.lr, frame);
    traces.push({
      type: "scatter",
      mode: "lines",
      x: lr.map((_, i) => i),
      y: lr,
      yaxis: "y2",
      line: { color: slot.color, width: 2, dash: "dot" },
      name: `${slot.optimizer} · lr`,
      showlegend: false,
      hoverinfo: "x+y+name",
    });
  }

  return traces;
}
