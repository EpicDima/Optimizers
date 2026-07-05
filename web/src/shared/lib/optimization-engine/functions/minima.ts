import type { Vec2 } from "@shared/lib/optimization-engine/linalg";
import { det2, norm2, scale2, solve2, sub2 } from "@shared/lib/optimization-engine/linalg";

import { gradient, hessian } from "./calculus";
import type { SurfaceGrid } from "./surface";
import type { FunctionRange } from "./types";

type Fn2 = (x: number, y: number) => number;

// узлы сетки, не превосходящие всех восьми соседей (граница — как будто соседи там +Infinity)
function gridMinimaCandidates(grid: SurfaceGrid): Vec2[] {
  const { meshX, meshY, z } = grid;
  const n = z.length;
  const m = meshX.length;
  const neighbor = (i: number, j: number): number => (i >= 0 && i < n && j >= 0 && j < m ? z[i][j] : Infinity);
  const candidates: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      let isMin = true;
      for (let di = -1; di <= 1 && isMin; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          if (z[i][j] > neighbor(i + di, j + dj)) {
            isMin = false;
            break;
          }
        }
      }
      if (isMin) candidates.push([meshX[j], meshY[i]]);
    }
  }
  return candidates;
}

function clip(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

function refineMinimum(fn: Fn2, range: FunctionRange, start: Vec2): Vec2 {
  const low: Vec2 = [range[0], range[2]];
  const high: Vec2 = [range[1], range[3]];
  const span = Math.max(range[1] - range[0], range[3] - range[2]);
  let point = start;
  let value = fn(point[0], point[1]);
  for (let outer = 0; outer < 100; outer++) {
    const grad = gradient(fn, point[0], point[1]);
    const hess = hessian(fn, point[0], point[1]);
    const determinant = det2(hess);
    let step: Vec2;
    if (hess[0][0] > 0 && determinant > 0) {
      const solved = solve2(hess, grad);
      // sign check passed but solve2 still reports near-singular: fall back to gradient descent
      // instead of crashing (Python would proceed with a poorly-conditioned solve here)
      step = solved ? scale2(solved, -1) : scale2(grad, -1);
    } else {
      step = scale2(grad, -1);
    }
    const norm = norm2(step);
    if (!Number.isFinite(norm) || norm === 0) break;
    if (norm > span) step = scale2(step, span / norm);

    // backtracking: keep the best (point, value) seen in this pass; stop early once a
    // trial fails to improve on it and it already beat the pre-loop value
    let scale = 1.0;
    let newPoint = point;
    let newValue = value;
    for (let lsIter = 0; lsIter < 40; lsIter++) {
      const trialPoint: Vec2 = [
        clip(point[0] + scale * step[0], low[0], high[0]),
        clip(point[1] + scale * step[1], low[1], high[1]),
      ];
      const trialValue = fn(trialPoint[0], trialPoint[1]);
      if (trialValue < newValue) {
        newPoint = trialPoint;
        newValue = trialValue;
      } else if (newValue < value) {
        break;
      }
      scale *= 0.5;
    }

    if (newValue >= value) break;
    const moved = norm2(sub2(newPoint, point));
    point = newPoint;
    value = newValue;
    if (moved < 1e-10 * span) break;
  }
  return point;
}

// узлы одного бассейна уточняются в одну и ту же точку — совпавшие сливаются
function deduplicate(points: Vec2[], range: FunctionRange): Vec2[] {
  const span = Math.max(range[1] - range[0], range[3] - range[2]);
  const unique: Vec2[] = [];
  for (const point of points) {
    if (unique.every((other) => norm2(sub2(point, other)) > 1e-4 * span)) {
      unique.push(point);
    }
  }
  return unique;
}

export function findMinima(fn: Fn2, range: FunctionRange, grid: SurfaceGrid): Vec2[] {
  const candidates = gridMinimaCandidates(grid);
  if (candidates.length === 0) return [];
  if (candidates.length > 1000) {
    // degenerate plateau: refining every candidate is pointless, keep the single global argmin node
    const { meshX, meshY, z } = grid;
    let bestI = 0;
    let bestJ = 0;
    let bestValue = Infinity;
    for (let i = 0; i < z.length; i++) {
      for (let j = 0; j < meshX.length; j++) {
        if (z[i][j] < bestValue) {
          bestValue = z[i][j];
          bestI = i;
          bestJ = j;
        }
      }
    }
    return [[meshX[bestJ], meshY[bestI]]];
  }
  const points = candidates.map((point) => refineMinimum(fn, range, point));
  const values = points.map((point) => fn(point[0], point[1]));
  const best = Math.min(...values);
  const tolerance = 1e-6 * Math.max(Math.abs(best), 1);
  const kept = points.filter((_, idx) => values[idx] <= best + tolerance);
  return deduplicate(kept, range);
}
