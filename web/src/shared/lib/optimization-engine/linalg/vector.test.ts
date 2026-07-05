import { describe, expect, it } from "vitest";

import { add2, dot2, norm2, scale2, sub2, type Vec2, zero2 } from "./vector";

describe("zero2", () => {
  it("returns the zero vector", () => {
    expect(zero2()).toEqual([0, 0]);
  });
});

describe("add2", () => {
  it("adds two vectors componentwise", () => {
    expect(add2([1, 2], [3, 4])).toEqual([4, 6]);
  });

  it("is undone by sub2 with the same vector", () => {
    const a: Vec2 = [1.5, -2.25];
    const b: Vec2 = [0.5, 3];
    expect(sub2(add2(a, b), b)).toEqual(a);
  });
});

describe("sub2", () => {
  it("subtracts two vectors componentwise", () => {
    expect(sub2([5, 7], [2, 3])).toEqual([3, 4]);
  });
});

describe("scale2", () => {
  it.each<[Vec2, number, Vec2]>([
    [[1, 2], 3, [3, 6]],
    [[1, 2], 0, [0, 0]],
    [[1, 2], -1, [-1, -2]],
  ])("scales %j by %d to give %j", (a, k, expected) => {
    expect(scale2(a, k)).toEqual(expected);
  });
});

describe("dot2", () => {
  it("computes the dot product of two vectors", () => {
    expect(dot2([1, 2], [3, 4])).toBe(11);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(dot2([1, 0], [0, 1])).toBe(0);
  });
});

describe("norm2", () => {
  it.each<[Vec2, number]>([
    [[3, 4], 5],
    [[0, 0], 0],
    [[-6, 8], 10],
  ])("norm of %j is %d", (a, expected) => {
    expect(norm2(a)).toBe(expected);
  });
});
