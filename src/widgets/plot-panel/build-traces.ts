import type { Data } from "plotly.js";

import type { ContourMode } from "@entities/plot-settings";
import type { RunConfig, RunResult } from "@entities/run";
import type { FunctionPreviewResult, FunctionRange } from "@entities/test-function";
import { gradient } from "@shared/lib/optimization-engine/functions";

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
 * В 3D "contour" означает линии поверх скрытой поверхности (аналог
 * ax.contour), а "mesh" — сплошную закрашенную поверхность (аналог
 * plot_surface).
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
      // которую приходится собирать в обход недостающих типов.
      //
      // size сам по себе Plotly молча игнорирует: gl3d-сцена на каждый кадр
      // рендера (scene.js render -> trace.setContourLevels) применяет
      // пользовательский size только если ЗАОДНО заданы start и end
      // (convert.js setContourLevels: contourStart/contourEnd !== null) —
      // иначе откатывается на scene.contourLevels, посчитанный из авто-тиков
      // оси z (tick_marks.js, обычно 4-9 уровней), и слайдер уровней ни на
      // что не влияет. Поэтому здесь обязательно передаются все три поля.
      const { min, max } = zExtent(preview.z);
      return {
        ...base,
        type: "surface",
        hidesurface: true,
        contours: {
          z: { show: true, usecolormap: true, project: { z: false }, start: min, end: max, size: (max - min) / contourLevels },
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

/** Форматирует значение функции для customdata тултипов: до прогона value
 * ещё не определено (стартовая точка слота), поэтому вместо доверия
 * Plotly-форматированию возможного undefined подставляется явный прочерк. */
function formatValue(value: number | undefined): string {
  return value !== undefined ? value.toFixed(4) : "—";
}

/** Диапазон значений z по сетке. Вырожденный случай (плоская функция,
 * max === min) разводится в единичный интервал, иначе end > start
 * не выполняется и Plotly откатится на авто-уровни (см. buildSurfaceTrace). */
function zExtent(z: number[][]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const row of z) {
    for (const value of row) {
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  return max > min ? { min, max } : { min, max: min + 1 };
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
    customdata: preview.minima.map((point) => point[2]),
    marker: { ...style, symbol: "star", size: 14 },
    showlegend: false,
    hovertemplate: "x=%{x:.4f}<br>y=%{y:.4f}<br>z=%{customdata}<extra></extra>",
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
  const customdata = points.map((p) => formatValue(p.value));
  const hovertemplate = "x=%{x:.4f}<br>y=%{y:.4f}<br>z=%{customdata}<extra></extra>";

  if (is3D) {
    return {
      type: "scatter3d",
      mode: "markers",
      x: points.map((p) => p.x),
      y: points.map((p) => p.y),
      z: points.map((p) => p.value ?? 0),
      customdata,
      marker: { ...style, symbol: "circle", size: 4 },
      showlegend: false,
      hovertemplate,
    };
  }

  return {
    type: "scatter",
    mode: "markers",
    x: points.map((p) => p.x),
    y: points.map((p) => p.y),
    customdata,
    marker: { ...style, symbol: "circle", size: 8 },
    showlegend: false,
    hovertemplate,
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

/** Индекс начала хвоста траектории относительно конца массива (0 — показать всё). */
export function tailStart(length: number, tailLength: number): number {
  return tailLength > 0 ? Math.max(length - 1 - tailLength, 0) : 0;
}

/** Траектория одного запуска, обрезанная по длине хвоста — плюс чёрная
 * обводка под цветной линией и кружок на текущем конце пути. Обводка
 * отдельным трейсом, потому что scatter/scatter3d не поддерживают
 * стро́ковый path-effect — рисуется тем же путём, но чуть шире и чёрным,
 * под цветной линией. */
export function buildTrajectoryTrace(
  config: RunConfig,
  result: RunResult | undefined,
  is3D: boolean,
  tailLength: number,
): Data[] {
  const x = result?.x ?? [];
  const y = result?.y ?? [];
  const value = result?.value ?? [];
  const start = tailStart(x.length, tailLength);

  const xs = x.slice(start);
  const ys = y.slice(start);
  const zs = value.slice(start);
  const lineWidth = is3D ? 4 : 2;

  const customdata = zs.map((v) => formatValue(v));
  const hovertemplate = "x=%{x:.4f}<br>y=%{y:.4f}<br>z=%{customdata}<extra></extra>";

  const shared = {
    type: is3D ? ("scatter3d" as const) : ("scatter" as const),
    mode: "lines" as const,
    x: xs,
    y: ys,
    ...(is3D ? { z: zs } : {}),
    customdata,
    visible: config.visible,
    showlegend: false,
  };

  const traces: Data[] = [
    { ...shared, line: { color: "#000000", width: lineWidth + 2 }, hoverinfo: "skip" },
    { ...shared, line: { color: config.color, width: lineWidth }, name: config.optimizer, hovertemplate },
  ];

  if (xs.length > 0) {
    const lastIndex = xs.length - 1;
    const marker = { size: is3D ? 5 : 8, color: config.color, line: { color: "#000000", width: 1 } };
    traces.push(
      is3D
        ? {
            type: "scatter3d",
            mode: "markers",
            x: [xs[lastIndex]],
            y: [ys[lastIndex]],
            z: [zs[lastIndex]],
            marker,
            visible: config.visible,
            showlegend: false,
            hoverinfo: "skip",
          }
        : {
            type: "scatter",
            mode: "markers",
            x: [xs[lastIndex]],
            y: [ys[lastIndex]],
            marker,
            visible: config.visible,
            showlegend: false,
            hoverinfo: "skip",
          },
    );
  }

  return traces;
}

const GRADIENT_GRID = 20;
const ARROW_SCALE = 0.35;
const ARROWHEAD_SIZE = 0.25;
const GRADIENT_COLOR = "rgba(80, 80, 80, 0.55)";

interface GradientFieldParams {
  fn: (x: number, y: number) => number;
  range: FunctionRange;
}

export function buildGradientFieldTrace({ fn, range }: GradientFieldParams): Data {
  const [fromX, toX, fromY, toY] = range;
  const dx = (toX - fromX) / GRADIENT_GRID;
  const dy = (toY - fromY) / GRADIENT_GRID;
  const spacing = Math.min(dx, dy);
  const maxLen = ARROW_SCALE * spacing;

  const xs: (number | null)[] = [];
  const ys: (number | null)[] = [];

  for (let i = 0; i <= GRADIENT_GRID; i++) {
    const gx = fromX + i * dx;
    for (let j = 0; j <= GRADIENT_GRID; j++) {
      const gy = fromY + j * dy;
      const [gradX, gradY] = gradient(fn, gx, gy);
      const negX = -gradX;
      const negY = -gradY;
      const mag = Math.sqrt(negX * negX + negY * negY);
      if (mag < 1e-12) continue;

      const scale = Math.min(maxLen, maxLen * (mag / (mag + maxLen))) / mag;
      const tipX = gx + negX * scale;
      const tipY = gy + negY * scale;

      xs.push(gx, tipX, null);
      ys.push(gy, tipY, null);

      const arrowLen = Math.sqrt((tipX - gx) ** 2 + (tipY - gy) ** 2) * ARROWHEAD_SIZE;
      const ux = tipX - gx;
      const uy = tipY - gy;
      const uMag = Math.sqrt(ux * ux + uy * uy);
      if (uMag < 1e-12) continue;
      const unx = ux / uMag;
      const uny = uy / uMag;
      const perpX = -uny;
      const perpY = unx;

      const baseX = tipX - unx * arrowLen;
      const baseY = tipY - uny * arrowLen;
      xs.push(baseX + perpX * arrowLen * 0.5, tipX, baseX - perpX * arrowLen * 0.5, null);
      ys.push(baseY + perpY * arrowLen * 0.5, tipY, baseY - perpY * arrowLen * 0.5, null);
    }
  }

  return {
    type: "scatter",
    mode: "lines",
    x: xs,
    y: ys,
    line: { color: GRADIENT_COLOR, width: 1 },
    showlegend: false,
    hoverinfo: "skip",
  };
}
