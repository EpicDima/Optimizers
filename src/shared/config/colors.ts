/** Цвета траекторий — не зависят от темы. Расширяется до MAX_RUNS
 * различимых цветов; пользователь может переопределить любой. */
const RUN_COLORS = [
  "#ff2d2d",
  "#32cd32",
  "#00bfff",
  "#ffa500",
  "#00e5e5",
  "#d946ef",
  "#eab308",
  "#8b5cf6",
  "#14b8a6",
  "#f472b6",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#10b981",
  "#ef4444",
] as const;

export function colorForSlot(index: number): string {
  return RUN_COLORS[index % RUN_COLORS.length];
}
