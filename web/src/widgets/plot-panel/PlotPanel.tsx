import { useEffect, useMemo } from "react";

import { toPlotlyColorscale, useColormapCatalog } from "@entities/colormap";
import { computeMaxFrame, usePlaybackStore, usePlaybackTicker } from "@entities/playback";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { useRunsStore } from "@entities/run";
import { useFunctionPreview, useFunctionStore } from "@entities/test-function";
import { Plot } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Panel } from "@shared/ui";

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
  const autoPlay = usePlaybackStore((state) => state.autoPlay);
  const startAnimationFor = usePlaybackStore((state) => state.startAnimationFor);
  const skipToEnd = usePlaybackStore((state) => state.skipToEnd);

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
  // анимация всегда стартует заново с нулевого кадра (зеркалит дефолтное
  // animation_checkbox=true и plot() в main.pyw); иначе сразу финальный кадр,
  // как при выключенной анимации на десктопе. Намеренно завязано только на
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
      ...slots.map((slot) => buildTrajectoryTrace(slot, sliceResultToFrame(results[slot.slotId], frame), is3D, tailLength)),
    ];
  }, [preview.data, colorscale, is3D, contourMode, contourLevels, slots, results, tailLength, frame]);

  const layout = useMemo(() => buildLayout(is3D, plotlyThemeColors(resolvedTheme), range), [is3D, resolvedTheme, range]);

  return (
    <Panel className="relative h-full min-h-0">
      {preview.data && !preview.data.valid && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/85 px-6 text-center font-body text-sm text-danger">
          {preview.data.error}
        </div>
      )}
      <Plot
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
      {(!preview.data || preview.data.valid) && <TrajectoryReadout slots={slots} results={results} frame={frame} />}
    </Panel>
  );
}
