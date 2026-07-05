import { describe, expect, it } from "vitest";

import { formatSignificant } from "./format-value";

describe("formatSignificant", () => {
  it("strips trailing zeros like Python's %g", () => {
    expect(formatSignificant(1, 4)).toBe("1");
    expect(formatSignificant(50, 4)).toBe("50");
    expect(formatSignificant(0.01, 3)).toBe("0.01");
  });

  it("keeps significant decimals", () => {
    expect(formatSignificant(123.456, 4)).toBe("123.5");
  });

  it("passes through non-finite values", () => {
    expect(formatSignificant(NaN, 4)).toBe("NaN");
    expect(formatSignificant(Infinity, 4)).toBe("Infinity");
  });

  it("leaves exponential notation untouched", () => {
    // toPrecision переходит в экспоненциальную запись, когда порядок числа
    // выходит за пределы точности (здесь 1.235e+8 при precision=4)
    expect(formatSignificant(123456789, 4)).toContain("e");
  });
});
