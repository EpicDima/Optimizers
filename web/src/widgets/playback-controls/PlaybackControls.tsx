import { Pause, Play } from "lucide-react";

import { usePlaybackStore } from "@entities/playback";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { Button, Checkbox, Panel, Slider } from "@shared/ui";

import { SpeedControl } from "./SpeedControl";

// Хвостовое окно не завязано на useRunsStore (виджет намеренно развязан от
// entities/run, весь нужный playback-стейт уже лежит в usePlaybackStore) —
// фиксированный потолок слайдера, 0 по-прежнему означает "вся траектория".
const TAIL_LENGTH_CAP = 500;

/** Панель управления воспроизведением траекторий — play/pause, перемотка,
 * скорость (лог2-слайдер как в main.pyw) и длина хвоста (Graphics.not_disappearing).
 * Читает/пишет только usePlaybackStore + usePlotSettingsStore.tailLength,
 * поэтому монтируется независимо от PlotPanel/RunsSidebar. */
export function PlaybackControls() {
  const frame = usePlaybackStore((state) => state.frame);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const autoPlay = usePlaybackStore((state) => state.autoPlay);
  const maxFrame = usePlaybackStore((state) => state.maxFrame);
  const toggle = usePlaybackStore((state) => state.toggle);
  const seek = usePlaybackStore((state) => state.seek);
  const setAutoPlay = usePlaybackStore((state) => state.setAutoPlay);

  const tailLength = usePlotSettingsStore((state) => state.tailLength);
  const setTailLength = usePlotSettingsStore((state) => state.setTailLength);

  const canPlay = maxFrame > 0;

  return (
    <Panel heading="Воспроизведение" className="shrink-0">
      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            disabled={!canPlay}
            aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          <span className="w-14 shrink-0 text-right font-mono text-xs text-text-muted">
            {frame} / {maxFrame}
          </span>
          <Slider value={frame} onChange={seek} min={0} max={maxFrame} step={1} className="flex-1" />
        </div>

        <SpeedControl />

        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 font-sans text-[11px] text-text-muted">Хвост</span>
          <Slider value={tailLength} onChange={setTailLength} min={0} max={TAIL_LENGTH_CAP} step={5} className="flex-1" />
          <span className="w-12 shrink-0 text-right font-mono text-xs text-text">{tailLength === 0 ? "∞" : tailLength}</span>
        </div>

        <Checkbox checked={autoPlay} onChange={setAutoPlay} label="Автовоспроизведение" />
      </div>
    </Panel>
  );
}
