/** Округляет до `precision` значащих цифр и убирает незначащие нули — как
 * формат `%.4g`/`%.3g` (toPrecision в JS, в отличие от 'g', нули не убирает
 * сам). Экспоненциальную запись (очень большие/малые значения) не трогаем —
 * она и так компактна. */
export function formatSignificant(value: number, precision: number): string {
  if (!Number.isFinite(value)) return String(value);

  const fixed = value.toPrecision(precision);
  if (fixed.includes("e")) return fixed;
  return fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
}
