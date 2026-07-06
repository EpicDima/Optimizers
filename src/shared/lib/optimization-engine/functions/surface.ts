import type { FunctionRange } from "./types";

export interface SurfaceGrid {
  meshX: number[];
  meshY: number[];
  z: number[][];
}

function linspace(from: number, to: number, count: number): number[] {
  if (count === 1) return [from];
  const step = (to - from) / (count - 1);
  return Array.from({ length: count }, (_, i) => (i === count - 1 ? to : from + i * step));
}

export function buildSurface(fn: (x: number, y: number) => number, range: FunctionRange, count: number): SurfaceGrid {
  const [fromX, toX, fromY, toY] = range;
  const meshX = linspace(fromX, toX, count);
  const meshY = linspace(fromY, toY, count);
  // строка i соответствует Y-сетке, столбец j — X-сетке (numpy meshgrid "xy")
  const z = meshY.map((yValue) => meshX.map((xValue) => fn(xValue, yValue)));
  return { meshX, meshY, z };
}
