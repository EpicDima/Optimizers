import { describe, expect, it } from "vitest";

import { formatCompactCount, formatSignificant } from "./format-value";

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

describe("formatCompactCount", () => {
  it("leaves counts below 100 000 as plain digits", () => {
    expect(formatCompactCount(0)).toBe("0");
    expect(formatCompactCount(200)).toBe("200");
    expect(formatCompactCount(99_999)).toBe("99999");
  });

  it("abbreviates counts from 100 000 up", () => {
    // Intl вставляет неразрывный пробел (U+00A0) перед единицей измерения
    expect(formatCompactCount(100_000)).toBe("100 тыс.");
    expect(formatCompactCount(5_000_000)).toBe("5 млн");
  });
});
