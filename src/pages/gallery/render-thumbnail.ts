const VIRIDIS: [number, number, number][] = [
  [68, 1, 84], [72, 35, 116], [64, 67, 135], [52, 94, 141],
  [41, 120, 142], [32, 144, 140], [34, 167, 132], [68, 190, 112],
  [121, 209, 81], [189, 222, 38], [253, 231, 37],
];

function viridis(t: number): [number, number, number] {
  const n = VIRIDIS.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const f = t * n - i;
  const a = VIRIDIS[i];
  const b = VIRIDIS[i + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ];
}

export function renderHeatmapThumbnail(
  z: number[][],
  size: number,
  bgColor: string,
): string {
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
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  const cellW = size / cols;
  const cellH = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = (z[r][c] - min) / range;
      const [rv, gv, bv] = viridis(t);
      ctx.fillStyle = `rgb(${rv},${gv},${bv})`;
      ctx.fillRect(Math.floor(c * cellW), Math.floor((rows - 1 - r) * cellH), Math.ceil(cellW), Math.ceil(cellH));
    }
  }

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
