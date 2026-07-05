export type Vec2 = readonly [number, number];

export function zero2(): Vec2 {
  return [0, 0];
}

export function add2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scale2(a: Vec2, k: number): Vec2 {
  return [a[0] * k, a[1] * k];
}

export function dot2(a: Vec2, b: Vec2): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function norm2(a: Vec2): number {
  return Math.sqrt(dot2(a, a));
}
