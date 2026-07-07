import { Pause, Play } from "lucide-react";
import { useEffect, useMemo } from "react";

import { toPlotlyColorscale, useColormapCatalog } from "@entities/colormap";
import { computeMaxFrame, usePlaybackStore, usePlaybackTicker } from "@entities/playback";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { useRunsStore } from "@entities/run";
import { useFunctionPreview, useFunctionStore } from "@entities/test-function";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Button, Panel, Slider } from "@shared/ui";

import { buildMinimaTrace, buildStartMarkersTrace, buildSurfaceTrace, buildTrajectoryTrace, sliceResultToFrame } from "./build-traces";
import { buildLayout } from "./layout";
import { plotlyThemeColors } from "./plotly-theme";
import { TrajectoryReadout } from "./TrajectoryReadout";

export function PlotPanel() {
  const { formula, range, gridCount } = useFunctionStore();
  const { is3D, contourMode, contourLevels, colormap, colormapReversed, tailLength } = usePlotSettingsStore();
  const { slots, results } = useRunsStore();
  const colormapCatalog = useColormapCatalog();
  const resolvedTheme = useResolvedTheme();

  const frame = usePlaybackStore((state) => state.frame);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const autoPlay = usePlaybackStore((state) => state.autoPlay);
  const startAnimationFor = usePlaybackStore((state) => state.startAnimationFor);
  const skipToEnd = usePlaybackStore((state) => state.skipToEnd);
  const seek = usePlaybackStore((state) => state.seek);
  const toggle = usePlaybackStore((state) => state.toggle);

  const preview = useFunctionPreview({ formula, range, count: gridCount });

  const colorscale = useMemo(
    () => (colormapCatalog.data ? toPlotlyColorscale(colormapCatalog.data, colormap, colormapReversed) : undefined),
    [colormapCatalog.data, colormap, colormapReversed],
  );

  const maxFrame = useMemo(
    () => computeMaxFrame(slots.map((slot) => results[slot.slotId]?.x.length ?? 1)),
    [slots, results],
  );

  // Новая партия результатов (успешный runAll) — при включённом autoPlay
  // анимация всегда стартует заново с нулевого кадра; иначе сразу финальный
  // кадр, как при выключенной анимации. Намеренно завязано только на
  // results: смена слотов/autoPlay сама по себе кадр не трогает.
  useEffect(() => {
    if (autoPlay) startAnimationFor(maxFrame);
    else skipToEnd(maxFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  usePlaybackTicker(maxFrame);

  const data = useMemo(() => {
    if (!preview.data?.valid || !colorscale) return [];
    return [
      buildSurfaceTrace({ preview: preview.data, is3D, contourMode, contourLevels, colorscale }),
      buildMinimaTrace(preview.data, is3D),
      buildStartMarkersTrace(slots, results, is3D),
      ...slots.flatMap((slot) => buildTrajectoryTrace(slot, sliceResultToFrame(results[slot.slotId], frame), is3D, tailLength)),
    ];
  }, [preview.data, colorscale, is3D, contourMode, contourLevels, slots, results, tailLength, frame]);

  const layout = useMemo(() => buildLayout(is3D, plotlyThemeColors(resolvedTheme), range), [is3D, resolvedTheme, range]);

  const plotRef = usePlotlyAutoResize();

  const canPlay = maxFrame > 0;

  return (
    <Panel className="h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col">
        <div className="relative min-h-0 flex-1">
          {preview.data && !preview.data.valid && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/85 px-6 text-center font-body text-sm text-danger">
              {preview.data.error}
            </div>
          )}
          <Plot
            ref={plotRef}
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
          {(!preview.data || preview.data.valid) && <TrajectoryReadout slots={slots} results={results} frame={frame} />}
        </div>
        {/* Таймлайн под графиком, как в видеоплеере: play/pause слева от шкалы
            перемотки. Остальные настройки воспроизведения (скорость, хвост,
            автовоспроизведение) остаются в PlaybackControls. */}
        <div className="flex shrink-0 items-center gap-3 border-t border-border px-3 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            disabled={!canPlay}
            aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          <Slider value={frame} onChange={seek} min={0} max={maxFrame} step={1} className="flex-1" />
          <span className="w-20 shrink-0 text-right font-mono text-xs whitespace-nowrap text-text-muted">
            {frame} / {maxFrame}
          </span>
        </div>
      </div>
    </Panel>
  );
}
