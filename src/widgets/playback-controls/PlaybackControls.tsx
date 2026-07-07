import { usePlaybackStore } from "@entities/playback";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { Checkbox, Panel, Slider } from "@shared/ui";

import { SpeedControl } from "./SpeedControl";

// Хвостовое окно не завязано на useRunsStore (виджет намеренно развязан от
// entities/run, весь нужный playback-стейт уже лежит в usePlaybackStore) —
// фиксированный потолок слайдера, 0 по-прежнему означает "вся траектория".
const TAIL_LENGTH_CAP = 500;

/** Настройки воспроизведения — скорость (лог2-слайдер) и длина
 * хвоста. Play/pause и шкала перемотки — на
 * PlotPanel, под графиком, как таймлайн в видеоплеере. Читает/пишет только
 * usePlaybackStore + usePlotSettingsStore.tailLength, поэтому монтируется
 * независимо от PlotPanel/RunsSidebar. */
export function PlaybackControls() {
  const autoPlay = usePlaybackStore((state) => state.autoPlay);
  const setAutoPlay = usePlaybackStore((state) => state.setAutoPlay);

  const tailLength = usePlotSettingsStore((state) => state.tailLength);
  const setTailLength = usePlotSettingsStore((state) => state.setTailLength);

  return (
    <Panel heading="Воспроизведение" className="h-full min-h-0">
      <div className="flex flex-col gap-3 p-3">
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
