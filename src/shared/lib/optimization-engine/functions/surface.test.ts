import { describe, expect, it } from "vitest";

import type { FunctionRange } from "./types";
import { buildSurface } from "./surface";

const sphere = (x: number, y: number) => x ** 2 + y ** 2;
const range: FunctionRange = [-2, 2, -4, 4];

describe("buildSurface", () => {
  it("produces a grid with the requested shape", () => {
    const count = 5;
    const { meshX, meshY, z } = buildSurface(sphere, range, count);
    expect(meshX.length).toBe(count);
    expect(meshY.length).toBe(count);
    expect(z.length).toBe(count);
    expect(z.every((row) => row.length === count)).toBe(true);
  });

  it("spans the range inclusively at both ends", () => {
    const { meshX, meshY } = buildSurface(sphere, range, 5);
    expect(meshX[0]).toBe(-2);
    expect(meshX[meshX.length - 1]).toBe(2);
    expect(meshY[0]).toBe(-4);
    expect(meshY[meshY.length - 1]).toBe(4);
  });

  it("indexes z as z[i][j] === fn(meshX[j], meshY[i])", () => {
    const asymmetric = (x: number, y: number) => x + 10 * y;
    const { meshX, meshY, z } = buildSurface(asymmetric, range, 5);
    expect(z[0][0]).toBe(asymmetric(meshX[0], meshY[0]));
    expect(z[2][3]).toBe(asymmetric(meshX[3], meshY[2]));
    expect(z[4][1]).toBe(asymmetric(meshX[1], meshY[4]));
  });
});
