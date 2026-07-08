import { encode } from "modern-gif";
import gifWorkerUrl from "modern-gif/worker?url";

import { computeMaxFrame } from "@entities/playback";
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
  fps?: number;
  maxFrames?: number;
  onProgress?: (current: number, total: number) => void;
}

const SURFACE_GRID = 300;
const PAD = 24;

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

function bakeHeatmap(
  z: number[][],
  stops: Stops,
  chartX: number,
  chartY: number,
  chartW: number,
  chartH: number,
  totalW: number,
  totalH: number,
  bgColor: string,
): HTMLCanvasElement {
  const rows = z.length;
  const cols = z[0].length;
  let min = Infinity;
  let max = -Infinity;
  for (const row of z) for (const v of row) { if (v < min) min = v; if (v > max) max = v; }
  const range = max > min ? max - min : 1;

  const tile = document.createElement("canvas");
  tile.width = cols;
  tile.height = rows;
  const tCtx = tile.getContext("2d")!;
  const img = tCtx.createImageData(cols, rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = (z[r][c] - min) / range;
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
  ctx.drawImage(tile, chartX, chartY, chartW, chartH);
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
  const { width = 1200, height = 800, fps = 10, maxFrames = 200, onProgress } = options;

  const { slots, results } = useRunsStore.getState();
  const { tailLength } = usePlotSettingsStore.getState();
  const { colormap, colormapReversed } = usePlotSettingsStore.getState();
  const { formula, range } = useFunctionStore.getState();

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

  const chartX = PAD;
  const chartY = PAD;
  const chartW = width - PAD * 2;
  const chartH = height - PAD * 2;

  const bg = bakeHeatmap(surface.z, stops, chartX, chartY, chartW, chartH, width, height, colors.paper);

  const visibleSlots = slots.filter((s) => s.visible && results[s.slotId]);

  const bgWithLegend = document.createElement("canvas");
  bgWithLegend.width = width;
  bgWithLegend.height = height;
  const bgCtx = bgWithLegend.getContext("2d")!;
  bgCtx.drawImage(bg, 0, 0);
  if (visibleSlots.length > 0) {
    const lx = chartX + 10;
    let ly = chartY + 18;
    bgCtx.font = "bold 14px sans-serif";
    bgCtx.textBaseline = "middle";
    for (const slot of visibleSlots) {
      bgCtx.fillStyle = slot.color;
      bgCtx.beginPath();
      bgCtx.arc(lx, ly, 5, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.strokeStyle = "#000";
      bgCtx.lineWidth = 0.8;
      bgCtx.stroke();
      bgCtx.fillStyle = colors.fontColor;
      bgCtx.fillText(slot.optimizer, lx + 12, ly);
      ly += 22;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const gifFrames: Array<{ data: Uint8ClampedArray; delay: number }> = [];
  const delay = Math.round(1000 / fps);

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
          const [px, py] = toPixel(res.x[i], res.y[i], range, chartX, chartY, chartW, chartH);
          if (i === start) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = slot.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = start; i < end; i++) {
          const [px, py] = toPixel(res.x[i], res.y[i], range, chartX, chartY, chartW, chartH);
          if (i === start) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      const [mx, my] = toPixel(res.x[end - 1], res.y[end - 1], range, chartX, chartY, chartW, chartH);
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
