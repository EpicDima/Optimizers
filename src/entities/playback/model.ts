// speed = 2**value, экспонента -3..6 даёт 0.125x..64x, 0 -> 1x по умолчанию
export const MIN_SPEED_STEP = -3;
export const MAX_SPEED_STEP = 6;
export const DEFAULT_SPEED_STEP = 0;

// базовый интервал тика в графике десктопа (30мс при speed=1x). Это НЕ таймер
// здесь — цикл на requestAnimationFrame использует его только как масштаб "кадров за миллисекунду"
export const BASE_TICK_MS = 30;

/** speed = 2**speedStep. */
export function speedFromStep(speedStep: number): number {
  return 2 ** speedStep;
}

/** Подпись скорости в формате десктопа: f"Speed ×{speed:g}" — без незначащих
 * нулей (×0.125, ×1, ×64), т.к. все шаги -3..6 дают точные степени двойки. */
export function formatSpeed(speedStep: number): string {
  const speed = speedFromStep(speedStep);
  return `×${trimTrailingZeros(speed.toFixed(3))}`;
}

function trimTrailingZeros(value: string): string {
  return value.includes(".") ? value.replace(/0+$/, "").replace(/\.$/, "") : value;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Последний доступный кадр анимации — максимум по всем прогонам слотов,
 * зеркалит `Math.max(0, ...slots.map(s => (results[s.slotId]?.x.length ?? 1) - 1))`.
 * Принимает только длины массивов, а не сами RunConfig/RunResult, чтобы
 * entities/playback не тянул зависимость на entities/run. */
export function computeMaxFrame(resultLengths: number[]): number {
  return Math.max(0, ...resultLengths.map((length) => length - 1));
}
