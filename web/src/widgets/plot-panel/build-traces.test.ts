import { describe, expect, it } from "vitest";

import type { RunConfig, RunResult } from "@entities/run";
import type { FunctionPreviewResult } from "@entities/test-function";

import { buildSurfaceTrace, buildTrajectoryTrace, sliceResultToFrame } from "./build-traces";

function makeResult(length: number, withLr: boolean): RunResult {
  return {
    slotId: "a",
    x: Array.from({ length }, (_, i) => i),
    y: Array.from({ length }, (_, i) => i * 2),
    value: Array.from({ length }, (_, i) => i * 3),
    lr: withLr ? Array.from({ length }, (_, i) => i * 0.1) : null,
    error: null,
  };
}

const slot: RunConfig = {
  slotId: "a",
  optimizer: "Adam",
  optimizerParams: {},
  schedulerParams: {},
  scheduler: "Constant",
  start: [0, 0],
  color: "#ff0000",
  visible: true,
};

describe("sliceResultToFrame", () => {
  it("returns undefined for a missing result", () => {
    expect(sliceResultToFrame(undefined, 5)).toBeUndefined();
  });

  it("slices arrays to [0, frame] inclusive", () => {
    const result = makeResult(10, true);
    const sliced = sliceResultToFrame(result, 3);
    expect(sliced?.x).toEqual([0, 1, 2, 3]);
    expect(sliced?.y).toEqual([0, 2, 4, 6]);
    expect(sliced?.value).toEqual([0, 3, 6, 9]);
    // та же формула, что и в makeResult (i * 0.1), чтобы не спотыкаться о
    // погрешность двоичной плавающей точки при сравнении литералов
    expect(sliced?.lr).toEqual([0, 1, 2, 3].map((i) => i * 0.1));
  });

  it("clamps when frame exceeds the result length", () => {
    const result = makeResult(5, false);
    const sliced = sliceResultToFrame(result, 100);
    expect(sliced?.x).toEqual([0, 1, 2, 3, 4]);
    expect(sliced?.lr).toBeNull();
  });

  it("clamps negative frames to an empty slice", () => {
    const result = makeResult(5, false);
    const sliced = sliceResultToFrame(result, -1);
    expect(sliced?.x).toEqual([]);
  });
});

describe("buildSurfaceTrace 3D contour lines", () => {
  const preview: FunctionPreviewResult = {
    valid: true,
    error: null,
    meshX: [0, 1],
    meshY: [0, 1],
    z: [
      [0, 5],
      [10, 20],
    ],
    minima: [],
  };

  it("sets start/end alongside size so Plotly doesn't silently ignore the custom interval", () => {
    // Plotly.js (gl3d scene render -> surface trace setContourLevels) only
    // honours contours.z.size when start/end are ALSO set (both non-null,
    // end > start) — иначе откатывается на авто-уровни оси z и число линий
    // не следует за contourLevels, что и было причиной бага.
    const trace = buildSurfaceTrace({
      preview,
      is3D: true,
      contourMode: "contour",
      contourLevels: 5,
      colorscale: [[0, "#000000"]],
    }) as unknown as { contours: { z: { start: number; end: number; size: number } } };

    expect(trace.contours.z.start).toBe(0);
    expect(trace.contours.z.end).toBe(20);
    expect(trace.contours.z.size).toBeCloseTo(4);
  });

  it("scales size inversely with contourLevels so the slider has a visible effect", () => {
    const few = buildSurfaceTrace({
      preview,
      is3D: true,
      contourMode: "contour",
      contourLevels: 5,
      colorscale: [[0, "#000000"]],
    }) as unknown as { contours: { z: { size: number } } };
    const many = buildSurfaceTrace({
      preview,
      is3D: true,
      contourMode: "contour",
      contourLevels: 80,
      colorscale: [[0, "#000000"]],
    }) as unknown as { contours: { z: { size: number } } };

    expect(many.contours.z.size).toBeLessThan(few.contours.z.size);
  });
});

describe("buildTrajectoryTrace tail window relative to the current frame", () => {
  it("agrees with max(frame - tailLength, 0) when tailLength > 0", () => {
    const full = makeResult(60, false);

    // кадр 40, хвост 50 -> max(40-50,0)=0 (весь путь пройденный к кадру ещё короче хвоста)
    const atFrame40 = buildTrajectoryTrace(slot, sliceResultToFrame(full, 40), false, 50) as { x: number[] };
    expect(atFrame40.x).toEqual(Array.from({ length: 41 }, (_, i) => i));

    // кадр 10, хвост 3 -> start = max(10-3,0) = 7, показываем точки 7..10
    const atFrame10 = buildTrajectoryTrace(slot, sliceResultToFrame(full, 10), false, 3) as { x: number[] };
    expect(atFrame10.x).toEqual([7, 8, 9, 10]);
  });

  it("shows the full trajectory up to the frame when tailLength is 0", () => {
    const full = makeResult(60, false);
    const atFrame25 = buildTrajectoryTrace(slot, sliceResultToFrame(full, 25), false, 0) as { x: number[] };
    expect(atFrame25.x).toEqual(Array.from({ length: 26 }, (_, i) => i));
  });

  it("is NOT relative to the final trajectory length (regression guard)", () => {
    // если бы хвост считался от конца финального прогона (старое поведение),
    // на кадре 40 с хвостом 50 из полного прогона длиной 200 увидели бы
    // последние 50 точек всего пути (150..199), а не текущие точки до кадра 40
    const full = makeResult(200, false);
    const atFrame40 = buildTrajectoryTrace(slot, sliceResultToFrame(full, 40), false, 50) as { x: number[] };
    expect(atFrame40.x[0]).toBe(0);
    expect(atFrame40.x.at(-1)).toBe(40);
  });
});
