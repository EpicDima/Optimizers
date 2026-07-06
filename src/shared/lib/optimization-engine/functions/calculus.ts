import type { Mat2, Vec2 } from "@shared/lib/optimization-engine/linalg";

export const GRAD_EPS = 1e-5;
export const HESSE_EPS = 1e-4;

export function gradient(fn: (x: number, y: number) => number, x: number, y: number): Vec2 {
  const e = GRAD_EPS;
  const gx = (fn(x + e, y) - fn(x - e, y)) / (2 * e);
  const gy = (fn(x, y + e) - fn(x, y - e)) / (2 * e);
  return [gx, gy];
}

export function hessian(fn: (x: number, y: number) => number, x: number, y: number): Mat2 {
  const h = HESSE_EPS;
  const f0 = fn(x, y);
  const fxx = (fn(x + h, y) - 2 * f0 + fn(x - h, y)) / h ** 2;
  const fyy = (fn(x, y + h) - 2 * f0 + fn(x, y - h)) / h ** 2;
  const fxy = (fn(x + h, y + h) - fn(x + h, y - h) - fn(x - h, y + h) + fn(x - h, y - h)) / (4 * h ** 2);
  return [
    [fxx, fxy],
    [fxy, fyy],
  ];
}
