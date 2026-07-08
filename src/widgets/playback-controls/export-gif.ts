import { encode } from "modern-gif";
import gifWorkerUrl from "modern-gif/worker?url";

import { computeMaxFrame, usePlaybackStore } from "@entities/playback";
import { BASE_TICK_MS, speedFromStep } from "@entities/playback/model";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { useRunsStore } from "@entities/run";
import { useFunctionStore } from "@entities/test-function";
import { toPlotlyColorscale } from "@entities/colormap";
import type { ColormapCatalog } from "@entities/colormap";
import { functionPresets } from "@shared/lib/optimization-engine/functions";
import { buildSurface } from "@shared/lib/optimization-engine/functions/surface";
import { resolveTheme, useThemeStore } from "@shared/lib/theme";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";

export interface ExportGifOptions {
  width?: number;
  height?: number;
  maxFrames?: number;
  onProgress?: (current: number, total: number) => void;
}

const SURFACE_GRID = 300;
const PAD_TOP = 16;
const PAD_RIGHT = 16;
const PAD_BOTTOM = 36;
const PAD_LEFT = 50;
const MIN_GIF_DELAY = 20;

type Stops = [number, string][];

function parseHex(hex: string): [number, number, number] {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpColor(stops: Stops, t: number): [number, number, number] {
  if (stops.length === 0) return [0, 0, 0];
  if (t <= stops[0][0]) return parseHex(stops[0][1]);
  if (t >= stops[stops.length - 1][0]) return parseHex(stops[stops.length - 1][1]);
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const f = (t - p0) / (p1 - p0);
      const a = parseHex(c0);
      const b = parseHex(c1);
      return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
      ];
    }
  }
  return parseHex(stops[stops.length - 1][1]);
}

function niceTicks(lo: number, hi: number, maxCount: number): number[] {
  const range = hi - lo;
  if (range <= 0) return [lo];
  const rough = range / maxCount;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = norm <= 1 ? mag : norm <= 2 ? 2 * mag : norm <= 5 ? 5 * mag : 10 * mag;
  const start = Math.ceil(lo / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= hi + step * 0.001; v += step) ticks.push(v);
  return ticks;
}

function formatTick(v: number): string {
  return Math.abs(v) < 1e-10 ? "0" : Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function bakeBackground(
  z: number[][],
  stops: Stops,
  cx: number,
  cy: number,
  cw: number,
  ch: number,
  totalW: number,
  totalH: number,
  bgColor: string,
  fontColor: string,
  gridColor: string,
  range: readonly [number, number, number, number],
): HTMLCanvasElement {
  const rows = z.length;
  const cols = z[0].length;
  let min = Infinity;
  let max = -Infinity;
  for (const row of z) for (const v of row) { if (v < min) min = v; if (v > max) max = v; }
  const span = max > min ? max - min : 1;

  const tile = document.createElement("canvas");
  tile.width = cols;
  tile.height = rows;
  const tCtx = tile.getContext("2d")!;
  const img = tCtx.createImageData(cols, rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = (z[r][c] - min) / span;
      const [rv, gv, bv] = lerpColor(stops, t);
      const i = ((rows - 1 - r) * cols + c) * 4;
      img.data[i] = rv;
      img.data[i + 1] = gv;
      img.data[i + 2] = bv;
      img.data[i + 3] = 255;
    }
  }
  tCtx.putImageData(img, 0, 0);

  const out = document.createElement("canvas");
  out.width = totalW;
  out.height = totalH;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, totalW, totalH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(tile, cx, cy, cw, ch);

  const [x0, x1, y0, y1] = range;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = fontColor;
  ctx.font = "12px sans-serif";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";

  for (const v of niceTicks(x0, x1, 8)) {
    const px = cx + ((v - x0) / (x1 - x0)) * cw;
    ctx.beginPath();
    ctx.moveTo(px, cy + ch);
    ctx.lineTo(px, cy + ch + 4);
    ctx.stroke();
    ctx.fillText(formatTick(v), px, cy + ch + 6);
  }

  ctx.textBaseline = "middle";
  ctx.textAlign = "right";

  for (const v of niceTicks(y0, y1, 6)) {
    const py = cy + ch - ((v - y0) / (y1 - y0)) * ch;
    ctx.beginPath();
    ctx.moveTo(cx - 4, py);
    ctx.lineTo(cx, py);
    ctx.stroke();
    ctx.fillText(formatTick(v), cx - 7, py);
  }

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx, cy, cw, ch);

  return out;
}

function toPixel(
  wx: number,
  wy: number,
  range: readonly [number, number, number, number],
  cx: number,
  cy: number,
  cw: number,
  ch: number,
): [number, number] {
  const [x0, x1, y0, y1] = range;
  return [
    cx + ((wx - x0) / (x1 - x0)) * cw,
    cy + ch - ((wy - y0) / (y1 - y0)) * ch,
  ];
}

export async function exportGif(options: ExportGifOptions = {}): Promise<Blob> {
  const { width = 1200, height = 800, maxFrames = 200, onProgress } = options;

  const { slots, results } = useRunsStore.getState();
  const { tailLength } = usePlotSettingsStore.getState();
  const { colormap, colormapReversed } = usePlotSettingsStore.getState();
  const { formula, range } = useFunctionStore.getState();
  const { speedStep } = usePlaybackStore.getState();

  const preset = functionPresets.find((p) => p.formula === formula);
  if (!preset) throw new Error("Функция не найдена");

  const theme = resolveTheme(useThemeStore.getState().theme);
  const colors = plotlyThemeColors(theme);

  const catalogResp = await fetch("/colormaps.json");
  const catalog: ColormapCatalog = await catalogResp.json();
  const stops = toPlotlyColorscale(catalog, colormap, colormapReversed);

  const surface = buildSurface(preset.fn, range, SURFACE_GRID);

  const maxFrame = computeMaxFrame(slots.map((s) => results[s.slotId]?.x.length ?? 1));
  if (maxFrame <= 0) throw new Error("No animation frames to export");

  const frameStep = Math.max(1, Math.floor(maxFrame / maxFrames));
  const totalFrames = Math.ceil((maxFrame + 1) / frameStep);

  const speed = speedFromStep(speedStep);
  const delay = Math.max(MIN_GIF_DELAY, Math.round((frameStep * BASE_TICK_MS) / speed));

  const cx = PAD_LEFT;
  const cy = PAD_TOP;
  const cw = width - PAD_LEFT - PAD_RIGHT;
  const ch = height - PAD_TOP - PAD_BOTTOM;

  const bg = bakeBackground(surface.z, stops, cx, cy, cw, ch, width, height, colors.paper, colors.fontColor, colors.lineColor, range);

  const visibleSlots = slots.filter((s) => s.visible && results[s.slotId]);

  const bgWithLegend = document.createElement("canvas");
  bgWithLegend.width = width;
  bgWithLegend.height = height;
  const bgCtx = bgWithLegend.getContext("2d")!;
  bgCtx.drawImage(bg, 0, 0);

  if (visibleSlots.length > 0) {
    bgCtx.font = "bold 13px sans-serif";
    bgCtx.textBaseline = "middle";

    const labels = visibleSlots.map((s) => ({ name: s.optimizer, color: s.color }));
    const dotR = 5;
    const gap = 6;
    const itemGap = 14;
    const measurements = labels.map((l) => bgCtx.measureText(l.name).width);
    const totalLegendW = measurements.reduce((s, w, i) => s + dotR * 2 + gap + w + (i < labels.length - 1 ? itemGap : 0), 0);
    const lx = cx + cw - totalLegendW - 6;
    const ly = cy - 2;

    let curX = lx;
    for (let i = 0; i < labels.length; i++) {
      bgCtx.fillStyle = labels[i].color;
      bgCtx.beginPath();
      bgCtx.arc(curX + dotR, ly, dotR, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.strokeStyle = "#000";
      bgCtx.lineWidth = 0.8;
      bgCtx.stroke();
      curX += dotR * 2 + gap;
      bgCtx.fillStyle = colors.fontColor;
      bgCtx.fillText(labels[i].name, curX, ly);
      curX += measurements[i] + itemGap;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const gifFrames: Array<{ data: Uint8ClampedArray; delay: number }> = [];

  for (let f = 0, idx = 0; f <= maxFrame; f += frameStep, idx++) {
    ctx.drawImage(bgWithLegend, 0, 0);

    for (const slot of visibleSlots) {
      const res = results[slot.slotId];
      if (!res || res.error) continue;

      const end = Math.min(f + 1, res.x.length);
      const start = tailLength > 0 ? Math.max(end - 1 - tailLength, 0) : 0;
      if (end <= start) continue;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      if (end - start >= 2) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = start; i < end; i++) {
          const [px, py] = toPixel(res.x[i], res.y[i], range, cx, cy, cw, ch);
          if (i === start) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = slot.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = start; i < end; i++) {
          const [px, py] = toPixel(res.x[i], res.y[i], range, cx, cy, cw, ch);
          if (i === start) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      const [mx, my] = toPixel(res.x[end - 1], res.y[end - 1], range, cx, cy, cw, ch);
      ctx.fillStyle = slot.color;
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    gifFrames.push({ data: ctx.getImageData(0, 0, width, height).data, delay });
    onProgress?.(idx + 1, totalFrames);

    if (idx % 20 === 0) await new Promise<void>((r) => setTimeout(r, 0));
  }

  onProgress?.(totalFrames, totalFrames);

  return (await encode({
    width,
    height,
    workerUrl: gifWorkerUrl,
    frames: gifFrames,
    format: "blob",
  })) as unknown as Blob;
}
