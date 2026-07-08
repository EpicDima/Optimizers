import { useEffect, useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js";

import { useAnalysisStore } from "@entities/analysis";
import { toPlotlyColorscale, useColormapCatalog } from "@entities/colormap";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";
import { Plot, usePlotlyAutoResize } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import { Checkbox, Panel, Slider } from "@shared/ui";

function zAtStep(values: number[][][], step: number): { z: number[][]; raw: number[][] } {
  const z: number[][] = [];
  const raw: number[][] = [];
  for (const row of values) {
    const zRow: number[] = [];
    const rawRow: number[] = [];
    for (const trajectory of row) {
      const idx = Math.min(step, trajectory.length - 1);
      const v = trajectory.length > 0 ? trajectory[idx] : NaN;
      rawRow.push(v);
      zRow.push(v);
    }
    z.push(zRow);
    raw.push(rawRow);
  }
  return { z, raw };
}

export function HeatmapChart() {
  const heatmapData = useAnalysisStore((s) => s.heatmapData);
  const colormap = usePlotSettingsStore((s) => s.colormap);
  const colormapReversed = usePlotSettingsStore((s) => s.colormapReversed);
  const { data: catalog } = useColormapCatalog();
  const resolvedTheme = useResolvedTheme();
  const [logScale, setLogScale] = useState(true);
  const [showBase, setShowBase] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);
  const [step, setStep] = useState(Infinity);
  const plotRef = usePlotlyAutoResize();

  const totalSteps = heatmapData?.totalSteps ?? 0;
  const displayStep = Math.min(step, totalSteps);

  useEffect(() => {
    setStep(Infinity);
  }, [heatmapData]);

  const baseColorscale = useMemo(
    () => (catalog ? toPlotlyColorscale(catalog, colormap, colormapReversed) : undefined),
    [catalog, colormap, colormapReversed],
  );

  const zRange = useMemo(() => {
    if (!heatmapData) return null;
    let min = Infinity;
    let max = -Infinity;
    for (const row of heatmapData.values) {
      for (const trajectory of row) {
        for (const v of trajectory) {
          if (!Number.isFinite(v)) continue;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }
    if (!Number.isFinite(min)) return null;
    return { min, max };
  }, [heatmapData]);

  const { zDisplay, rawZ } = useMemo(() => {
    if (!heatmapData) return { zDisplay: [], rawZ: [] };
    const { z, raw } = zAtStep(heatmapData.values, displayStep);
    const zDisplay = logScale
      ? z.map((row) => row.map((v) => (v > 0 ? Math.log10(v) : NaN)))
      : z;
    return { zDisplay, rawZ: raw };
  }, [heatmapData, displayStep, logScale]);

  const data = useMemo((): Data[] => {
    if (!heatmapData || !baseColorscale || zDisplay.length === 0 || !zRange) return [];

    const zmin = logScale ? (zRange.min > 0 ? Math.log10(zRange.min) : -10) : zRange.min;
    const zmax = logScale ? (zRange.max > 0 ? Math.log10(zRange.max) : 0) : zRange.max;

    const traces: Data[] = [];

    if (showBase) {
      traces.push({
        type: "heatmap" as const,
        x: heatmapData.surfaceXs,
        y: heatmapData.surfaceYs,
        z: heatmapData.surfaceZ,
        colorscale: baseColorscale,
        showscale: false,
        hoverinfo: "skip" as const,
      });
    }

    traces.push({
      type: "heatmap" as const,
      x: heatmapData.xs,
      y: heatmapData.ys,
      z: zDisplay,
      zmin,
      zmax,
      zauto: false,
      colorscale: baseColorscale,
      opacity: showBase ? overlayOpacity : 1,
      colorbar: {
        title: { text: logScale ? "log₁₀ z" : "z", side: "right" as const },
        thickness: 12,
        len: 0.9,
      },
      hovertemplate: "x₀=%{x:.2f}<br>y₀=%{y:.2f}<br>z=%{customdata:.4g}<extra></extra>",
      customdata: rawZ,
    });

    return traces;
  }, [heatmapData, baseColorscale, zDisplay, rawZ, zRange, showBase, overlayOpacity, logScale]);

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
      margin: { l: 50, r: 80, t: 10, b: 36 },
      uirevision: "keep",
      xaxis: {
        title: { text: "x₀" },
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
      },
      yaxis: {
        title: { text: "y₀" },
        gridcolor: theme.gridColor,
        color: theme.mutedFontColor,
        scaleanchor: "x",
      },
    };
  }, [resolvedTheme]);

  return (
    <Panel
      heading={`Значение на шаге ${displayStep} из ${totalSteps}`}
      actions={
        <div className="flex items-center gap-3">
          <Checkbox checked={showBase} onChange={setShowBase} label="Подложка" />
          {showBase && (
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={overlayOpacity}
              onChange={setOverlayOpacity}
              className="w-24"
            />
          )}
          <Checkbox checked={logScale} onChange={setLogScale} label="Лог. шкала" />
        </div>
      }
      className="h-full min-h-0"
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          <Plot
            ref={plotRef}
            data={data}
            layout={layout}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        {totalSteps > 0 && (
          <div className="shrink-0 px-4 pb-2">
            <Slider
              min={0}
              max={totalSteps}
              step={1}
              value={displayStep}
              onChange={setStep}
            />
          </div>
        )}
      </div>
    </Panel>
  );
}
