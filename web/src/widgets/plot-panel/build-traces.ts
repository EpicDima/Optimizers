import type { Data } from "plotly.js";

import type { ContourMode } from "@entities/plot-settings";
import type { RunConfig, RunResult } from "@entities/run";
import type { FunctionPreviewResult } from "@entities/test-function";

const MINIMUM_MARKER_COLOR = "#ffe14d";

interface SurfaceTraceParams {
  preview: FunctionPreviewResult;
  is3D: boolean;
  contourMode: ContourMode;
  contourLevels: number;
  colorscale: [number, string][];
}

/** Фон графика: контур/поверхность рельефа функции.
 *
 * В 3D названия режимов зеркалят draw_3d_function_plot из graphics/Graphics.py
 * буквально: contour_type=True там рисует ЛИНИИ (ax.contour), а не заливку —
 * поэтому "contour" здесь тоже означает линии поверх скрытой поверхности,
 * а "mesh" — сплошную закрашенную поверхность (аналог plot_surface).
 */
export function buildSurfaceTrace({ preview, is3D, contourMode, contourLevels, colorscale }: SurfaceTraceParams): Data {
  const base = {
    x: preview.meshX,
    y: preview.meshY,
    z: preview.z,
    colorscale,
    showscale: true,
    colorbar: { thickness: 10, len: 0.7, outlinewidth: 0 },
    hoverinfo: "x+y+z" as const,
  };

  if (is3D) {
    if (contourMode === "contour") {
      // @types/plotly.js не описывает вложенный contours.{x,y,z} у surface
      // (только плоскую форму 2D-контура) — это валидная опция рантайма Plotly,
      // которую приходится собирать в обход недостающих типов
      return {
        ...base,
        type: "surface",
        hidesurface: true,
        contours: {
          z: { show: true, usecolormap: true, project: { z: false }, size: rangeSize(preview.z) / contourLevels },
        },
      } as unknown as Data;
    }
    return { ...base, type: "surface" };
  }

  if (contourMode === "contour") {
    return { ...base, type: "contour", ncontours: contourLevels, contours: { coloring: "fill" }, line: { width: 0 } };
  }
  return { ...base, type: "heatmap" };
}

function rangeSize(z: number[][]): number {
  let min = Infinity;
  let max = -Infinity;
  for (const row of z) {
    for (const value of row) {
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  return max > min ? max - min : 1;
}

/** Звёзды глобальных минимумов — в scatter3d нет символа «звезда», ближайший
 * встроенный вариант ромб (diamond), это единственное визуальное отличие от десктопа. */
export function buildMinimaTrace(preview: FunctionPreviewResult, is3D: boolean): Data {
  const style = {
    color: MINIMUM_MARKER_COLOR,
    line: { color: "#000000", width: 1 },
  };

  if (is3D) {
    return {
      type: "scatter3d",
      mode: "markers",
      x: preview.minima.map((point) => point[0]),
      y: preview.minima.map((point) => point[1]),
      z: preview.minima.map((point) => point[2]),
      marker: { ...style, symbol: "diamond", size: 5 },
      showlegend: false,
      hoverinfo: "x+y+z",
      name: "минимум",
    };
  }

  return {
    type: "scatter",
    mode: "markers",
    x: preview.minima.map((point) => point[0]),
    y: preview.minima.map((point) => point[1]),
    marker: { ...style, symbol: "star", size: 14 },
    showlegend: false,
    hoverinfo: "x+y",
    name: "минимум",
  };
}

/** Один агрегированный трейс на все слоты — белые маркеры точки старта:
 * пока прогона не было, это конфигурируемая стартовая точка слота (живой
 * предпросмотр), после прогона — первая точка фактической траектории. */
export function buildStartMarkersTrace(slots: RunConfig[], results: Record<string, RunResult>, is3D: boolean): Data {
  const points = slots.map((slot) => {
    const result = results[slot.slotId];
    if (result && !result.error && result.x.length > 0) {
      return { x: result.x[0], y: result.y[0], value: result.value[0] };
    }
    return { x: slot.start[0], y: slot.start[1], value: undefined };
  });

  const style = { color: "#ffffff", line: { color: "#000000", width: 1.5 } };

  if (is3D) {
    return {
      type: "scatter3d",
      mode: "markers",
      x: points.map((p) => p.x),
      y: points.map((p) => p.y),
      z: points.map((p) => p.value ?? 0),
      marker: { ...style, symbol: "circle", size: 4 },
      showlegend: false,
      hoverinfo: "skip",
    };
  }

  return {
    type: "scatter",
    mode: "markers",
    x: points.map((p) => p.x),
    y: points.map((p) => p.y),
    marker: { ...style, symbol: "circle", size: 8 },
    showlegend: false,
    hoverinfo: "skip",
  };
}

/** Обрезает результат до текущего кадра анимации [0, frame] включительно.
 * Передавая сюда усечённый результат перед buildTrajectoryTrace, хвостовое
 * окно этой функции (которое считает "конец" как конец переданного массива)
 * автоматически оказывается относительно кадра анимации, а не относительно
 * длины всего прогона — именно так тикает tail_start(frame_idx) в десктопе:
 * на 40-м кадре при хвосте 50 видно max(40-50,0)..40, а не последние 50 точек
 * финальной траектории. */
export function sliceResultToFrame(result: RunResult | undefined, frame: number): RunResult | undefined {
  if (!result) return undefined;
  const end = Math.max(0, Math.min(frame + 1, result.x.length));
  return {
    ...result,
    x: result.x.slice(0, end),
    y: result.y.slice(0, end),
    value: result.value.slice(0, end),
    lr: result.lr ? result.lr.slice(0, end) : result.lr,
  };
}

/** Траектория одного запуска, обрезанная по длине хвоста с конца массива
 * (совпадает с Graphics.tail_start: 0 — показать всё). Легенда своя, не
 * плотличная — см. StatusBar/readout-оверлей, поэтому showlegend всегда false. */
export function buildTrajectoryTrace(
  config: RunConfig,
  result: RunResult | undefined,
  is3D: boolean,
  tailLength: number,
): Data {
  const x = result?.x ?? [];
  const y = result?.y ?? [];
  const value = result?.value ?? [];
  const start = tailLength > 0 ? Math.max(x.length - 1 - tailLength, 0) : 0;

  const common = {
    line: { color: config.color, width: is3D ? 4 : 2 },
    visible: config.visible,
    showlegend: false,
    name: config.optimizer,
    hoverinfo: "x+y" as const,
  };

  if (is3D) {
    return {
      ...common,
      type: "scatter3d",
      mode: "lines",
      x: x.slice(start),
      y: y.slice(start),
      z: value.slice(start),
    };
  }

  return {
    ...common,
    type: "scatter",
    mode: "lines",
    x: x.slice(start),
    y: y.slice(start),
  };
}
