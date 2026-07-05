import type { Vec2 } from "./vector";

export type Mat2 = readonly [readonly [number, number], readonly [number, number]];

const NEAR_ZERO = 1e-10;

export function det2(m: Mat2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function eigvalsh2(m: Mat2): [number, number] {
  const half = (m[0][0] + m[1][1]) / 2;
  // symmetric 2x2 closed form: half-trace ± sqrt(half-trace^2 - det); clamp
  // the radicand at 0 to absorb float noise on near-degenerate matrices
  const spread = Math.sqrt(Math.max(half * half - det2(m), 0));
  return [half - spread, half + spread];
}

export function eigh2(m: Mat2): { values: [number, number]; vectors: Mat2 } {
  const values = eigvalsh2(m);
  const [[a, b], [, d]] = m;
  if (Math.abs(b) < NEAR_ZERO) {
    // already diagonal: axis-aligned basis, ordered so column i pairs with values[i]
    return { values, vectors: a <= d ? [[1, 0], [0, 1]] : [[0, 1], [1, 0]] };
  }
  const [lo, hi] = values;
  const normalize = (v: Vec2): Vec2 => {
    const n = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / n, v[1] / n];
  };
  const v0 = normalize([b, lo - a]);
  const v1 = normalize([b, hi - a]);
  return { values, vectors: [[v0[0], v1[0]], [v0[1], v1[1]]] };
}

export function solve2(m: Mat2, v: Vec2): Vec2 | null {
  const determinant = det2(m);
  // near-singular: callers (Newton/LevenbergMarquardt) fall back to a plain
  // gradient step instead of the exception numpy raises on a singular matrix
  if (Math.abs(determinant) < NEAR_ZERO) {
    return null;
  }
  return [
    (v[0] * m[1][1] - m[0][1] * v[1]) / determinant,
    (m[0][0] * v[1] - v[0] * m[1][0]) / determinant,
  ];
}

export function outer2(a: Vec2, b: Vec2): Mat2 {
  return [
    [a[0] * b[0], a[0] * b[1]],
    [a[1] * b[0], a[1] * b[1]],
  ];
}

export function addScaledIdentity2(m: Mat2, k: number): Mat2 {
  return [
    [m[0][0] + k, m[0][1]],
    [m[1][0], m[1][1] + k],
  ];
}

export function invSqrtSymmetric2(m: Mat2): Mat2 {
  const { values, vectors } = eigh2(m);
  const [[v00, v01], [v10, v11]] = vectors;
  const d0 = 1 / Math.sqrt(values[0]);
  const d1 = 1 / Math.sqrt(values[1]);
  // V @ diag(1/sqrt(λ)) @ Vᵀ, mirroring Shampoo.py's eigenvectors @ diag(...) @ eigenvectors.T
  return [
    [v00 * v00 * d0 + v01 * v01 * d1, v00 * v10 * d0 + v01 * v11 * d1],
    [v10 * v00 * d0 + v11 * v01 * d1, v10 * v10 * d0 + v11 * v11 * d1],
  ];
}
