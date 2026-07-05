import { describe, expect, it } from "vitest";

import {
  addScaledIdentity2,
  det2,
  eigh2,
  eigvalsh2,
  invSqrtSymmetric2,
  type Mat2,
  outer2,
  solve2,
} from "./matrix2x2";

function multiplyMat2(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

function expectMatrixCloseTo(actual: Mat2, expected: Mat2, precision = 9) {
  expect(actual[0][0]).toBeCloseTo(expected[0][0], precision);
  expect(actual[0][1]).toBeCloseTo(expected[0][1], precision);
  expect(actual[1][0]).toBeCloseTo(expected[1][0], precision);
  expect(actual[1][1]).toBeCloseTo(expected[1][1], precision);
}

describe("det2", () => {
  it.each<[Mat2, number]>([
    [[[1, 2], [3, 4]], -2],
    [[[2, 0], [0, 3]], 6],
    [[[1, 0], [0, 1]], 1],
  ])("determinant of %j is %d", (m, expected) => {
    expect(det2(m)).toBe(expected);
  });
});

describe("eigvalsh2", () => {
  it("returns the diagonal entries in ascending order for a diagonal matrix", () => {
    expect(eigvalsh2([[3, 0], [0, 5]])).toEqual([3, 5]);
  });

  it("sorts ascending regardless of which diagonal entry is larger", () => {
    expect(eigvalsh2([[5, 0], [0, 3]])).toEqual([3, 5]);
  });

  it("returns 1 and 3 for the textbook matrix [[2,1],[1,2]]", () => {
    const [lo, hi] = eigvalsh2([[2, 1], [1, 2]]);
    expect(lo).toBeCloseTo(1, 9);
    expect(hi).toBeCloseTo(3, 9);
  });

  it("returns a repeated eigenvalue for a multiple of the identity", () => {
    expect(eigvalsh2([[4, 0], [0, 4]])).toEqual([4, 4]);
  });
});

describe("eigh2", () => {
  it("returns the identity basis for an already-diagonal matrix", () => {
    const { values, vectors } = eigh2([[3, 0], [0, 5]]);
    expect(values).toEqual([3, 5]);
    expect(vectors).toEqual([[1, 0], [0, 1]]);
  });

  it("swaps basis columns when the smaller eigenvalue sits on the second diagonal entry", () => {
    const { values, vectors } = eigh2([[5, 0], [0, 3]]);
    expect(values).toEqual([3, 5]);
    expect(vectors).toEqual([[0, 1], [1, 0]]);
  });

  it("returns the identity basis for a multiple of the identity", () => {
    const { vectors } = eigh2([[4, 0], [0, 4]]);
    expect(vectors).toEqual([[1, 0], [0, 1]]);
  });

  it("returns orthonormal eigenvectors that reconstruct the original matrix", () => {
    const m: Mat2 = [[2, 1], [1, 2]];
    const { values, vectors } = eigh2(m);
    const v0: [number, number] = [vectors[0][0], vectors[1][0]];
    const v1: [number, number] = [vectors[0][1], vectors[1][1]];

    expect(v0[0] * v0[0] + v0[1] * v0[1]).toBeCloseTo(1, 9);
    expect(v1[0] * v1[0] + v1[1] * v1[1]).toBeCloseTo(1, 9);
    expect(v0[0] * v1[0] + v0[1] * v1[1]).toBeCloseTo(0, 9);

    const diag: Mat2 = [[values[0], 0], [0, values[1]]];
    const reconstructed = multiplyMat2(multiplyMat2(vectors, diag), [
      [vectors[0][0], vectors[1][0]],
      [vectors[0][1], vectors[1][1]],
    ]);
    expectMatrixCloseTo(reconstructed, m);
  });
});

describe("solve2", () => {
  it("solves a diagonal system", () => {
    expect(solve2([[2, 0], [0, 3]], [4, 9])).toEqual([2, 3]);
  });

  it("solves a general 2x2 system via Cramer's rule", () => {
    const result = solve2([[1, 2], [3, 4]], [5, 6]);
    expect(result?.[0]).toBeCloseTo(-4, 9);
    expect(result?.[1]).toBeCloseTo(4.5, 9);
  });

  it("returns null for a singular matrix instead of throwing", () => {
    expect(solve2([[1, 2], [2, 4]], [1, 1])).toBeNull();
  });
});

describe("outer2", () => {
  it("computes the outer product a ⊗ b", () => {
    expect(outer2([1, 2], [3, 4])).toEqual([[3, 4], [6, 8]]);
  });
});

describe("addScaledIdentity2", () => {
  it("adds k only to the diagonal entries", () => {
    expect(addScaledIdentity2([[1, 2], [3, 4]], 5)).toEqual([[6, 2], [3, 9]]);
  });
});

describe("invSqrtSymmetric2", () => {
  it("inverts the square root of a diagonal positive-definite matrix", () => {
    const result = invSqrtSymmetric2([[4, 0], [0, 9]]);
    expectMatrixCloseTo(result, [[0.5, 0], [0, 1 / 3]]);
  });

  it("satisfies result @ result @ m ≈ I for a non-diagonal positive-definite matrix", () => {
    const m: Mat2 = [[2, 1], [1, 2]];
    const result = invSqrtSymmetric2(m);
    const reconstructed = multiplyMat2(multiplyMat2(result, result), m);
    expectMatrixCloseTo(reconstructed, [[1, 0], [0, 1]]);
  });
});
