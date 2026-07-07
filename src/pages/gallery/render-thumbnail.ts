export type ColorStops = [number, string][];

function parseHex(hex: string): [number, number, number] {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function interpolateStops(stops: ColorStops, t: number): [number, number, number] {
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

export function renderHeatmapThumbnail(z: number[][], stops: ColorStops): string {
  const rows = z.length;
  const cols = z[0].length;
  let min = Infinity;
  let max = -Infinity;
  for (const row of z) {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const range = max > min ? max - min : 1;

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(cols, rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = (z[r][c] - min) / range;
      const [rv, gv, bv] = interpolateStops(stops, t);
      const i = ((rows - 1 - r) * cols + c) * 4;
      img.data[i] = rv;
      img.data[i + 1] = gv;
      img.data[i + 2] = bv;
      img.data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

export function renderLineThumbnail(
  xs: number[],
  ys: number[],
  size: number,
  lineColor: string,
  bgColor: string,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  if (xs.length < 2) return canvas.toDataURL("image/png");

  const pad = size * 0.08;
  const w = size - pad * 2;
  const h = size - pad * 2;

  const xMin = xs[0];
  const xMax = xs[xs.length - 1];
  const xRange = xMax > xMin ? xMax - xMin : 1;

  let yMin = Infinity;
  let yMax = -Infinity;
  for (const y of ys) {
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  const yRange = yMax > yMin ? yMax - yMin : 1;

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < xs.length; i++) {
    const px = pad + ((xs[i] - xMin) / xRange) * w;
    const py = pad + (1 - (ys[i] - yMin) / yRange) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  return canvas.toDataURL("image/png");
}
