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

const compactCountFormat = new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 0 });

// поле "Шагов" не ограничено сверху, поэтому счётчик кадров плеера иначе
// растягивается на произвольную ширину (5000000 -> "5 млн"); ниже 100 тыс.
// сокращать незачем — сам номер и так короткий
export function formatCompactCount(value: number): string {
  return value >= 100_000 ? compactCountFormat.format(value) : String(value);
}
