import { Download } from "lucide-react";
import { useCallback, useState } from "react";

import { usePlaybackStore } from "@entities/playback";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { Button, Checkbox, Panel, Slider } from "@shared/ui";

import { exportGif } from "./export-gif";
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
  const stepMode = usePlaybackStore((state) => state.stepMode);
  const setStepMode = usePlaybackStore((state) => state.setStepMode);
  const maxFrame = usePlaybackStore((state) => state.maxFrame);

  const tailLength = usePlotSettingsStore((state) => state.tailLength);
  const setTailLength = usePlotSettingsStore((state) => state.setTailLength);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  const handleExportGif = useCallback(async () => {
    setIsExporting(true);
    setExportProgress("0%");
    try {
      const blob = await exportGif({
        fps: 10,
        frameStep: Math.max(1, Math.floor(maxFrame / 200)),
        onProgress: (current, total) => {
          setExportProgress(`${current}/${total}`);
        },
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimization.gif";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* export cancelled or failed */
    } finally {
      setIsExporting(false);
      setExportProgress("");
    }
  }, [maxFrame]);

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
        <Checkbox checked={stepMode} onChange={setStepMode} label="Пошаговый режим" />

        <Button
          variant="ghost"
          size="sm"
          disabled={maxFrame === 0 || isExporting}
          onClick={handleExportGif}
        >
          <Download size={14} />
          {isExporting ? `Экспорт… ${exportProgress}` : "Экспорт GIF"}
        </Button>
      </div>
    </Panel>
  );
}
