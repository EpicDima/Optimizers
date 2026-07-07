import { useMemo } from "react";
import { useNavigate } from "react-router";
import type { Data, Layout } from "plotly.js";

import { useRunsStore } from "@entities/run";
import { useFunctionStore } from "@entities/test-function";
import { Plot } from "@shared/lib/plotly";
import { useResolvedTheme } from "@shared/lib/theme";
import type { FunctionDescriptor } from "@shared/lib/optimization-engine/functions/types";
import { plotlyThemeColors } from "@widgets/plot-panel/plotly-theme";

import { useInView } from "./useInView";
import { useThumbnailSurface } from "./useThumbnailSurface";

interface GalleryCardProps {
  preset: FunctionDescriptor;
}

export function GalleryCard({ preset }: GalleryCardProps) {
  const { ref, visible } = useInView<HTMLDivElement>();
  const { data: surface } = useThumbnailSurface(preset, visible);
  const navigate = useNavigate();
  const resolvedTheme = useResolvedTheme();

  function handleClick() {
    useFunctionStore.getState().applyPreset({
      name: preset.name,
      formula: preset.formula,
      range: [...preset.range],
      start: [...preset.start],
    });
    useRunsStore.getState().setGlobalStart([...preset.start]);
    useRunsStore.getState().clearResults();
    useRunsStore.getState().resetSlotStarts();
    navigate("/dashboard");
  }

  const plotData = useMemo((): Data[] => {
    if (!surface) return [];
    return [
      {
        type: "contour",
        x: surface.meshX,
        y: surface.meshY,
        z: surface.z,
        colorscale: "Viridis",
        showscale: false,
        contours: { coloring: "heatmap" },
        hoverinfo: "none",
      } as Data,
    ];
  }, [surface]);

  const layout = useMemo((): Partial<Layout> => {
    const theme = plotlyThemeColors(resolvedTheme);
    return {
      paper_bgcolor: theme.paper,
      plot_bgcolor: theme.paper,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      xaxis: { visible: false },
      yaxis: { visible: false, scaleanchor: "x" },
      showlegend: false,
    };
  }, [resolvedTheme]);

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="group flex cursor-pointer flex-col overflow-hidden border border-border bg-bg-elevated transition-all hover:ring-2 hover:ring-accent"
    >
      <div className="aspect-square w-full">
        {surface ? (
          <Plot
            data={plotData}
            layout={layout}
            config={{ staticPlot: true, displayModeBar: false }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-bg-sunken">
            <span className="text-xs text-text-muted">Загрузка…</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="font-sans text-sm font-semibold text-text">{preset.name}</span>
        <span className="truncate font-mono text-xs text-text-muted" title={preset.formula}>
          {preset.formula}
        </span>
      </div>
    </div>
  );
}
