import { formatSpeed, MAX_SPEED_STEP, MIN_SPEED_STEP, usePlaybackStore } from "@entities/playback";
import { Slider } from "@shared/ui";

/** Лог2-слайдер скорости, -3..6 -> ×0.125..×64 (см. entities/playback/model.ts) —
 * зеркалит Speed-слайдер из main.pyw, применяется на лету через usePlaybackTicker,
 * который читает speedStep из стора на каждом rAF-тике. */
export function SpeedControl() {
  const speedStep = usePlaybackStore((state) => state.speedStep);
  const setSpeedStep = usePlaybackStore((state) => state.setSpeedStep);

  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 font-sans text-[11px] text-text-muted">Скорость</span>
      <Slider value={speedStep} onChange={setSpeedStep} min={MIN_SPEED_STEP} max={MAX_SPEED_STEP} step={1} className="flex-1" />
      <span className="w-12 shrink-0 text-right font-mono text-xs text-text">{formatSpeed(speedStep)}</span>
    </div>
  );
}
