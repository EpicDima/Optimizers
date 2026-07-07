import { encode } from "modern-gif";
import Plotly from "plotly.js/lib/core";
import type { Data, Layout } from "plotly.js";

import { computeMaxFrame } from "@entities/playback";
import { usePlotSettingsStore } from "@entities/plot-settings";
import { useRunsStore } from "@entities/run";
import { buildTrajectoryTrace, sliceResultToFrame } from "@widgets/plot-panel/build-traces";
import { plotDivRef } from "@widgets/plot-panel";

export interface ExportGifOptions {
  width?: number;
  height?: number;
  fps?: number;
  maxFrames?: number;
  onProgress?: (current: number, total: number) => void;
}

const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

interface PlotlyDiv extends HTMLDivElement {
  data: Data[];
  layout: Partial<Layout>;
}

export async function exportGif(options: ExportGifOptions = {}): Promise<Blob> {
  const { width = 1200, height = 800, fps = 10, maxFrames = 200, onProgress } = options;

  const plotEl = plotDivRef.current as PlotlyDiv | null;
  if (!plotEl?.data || !plotEl.layout) throw new Error("Plot element not available");

  const { slots, results } = useRunsStore.getState();
  const { is3D, tailLength } = usePlotSettingsStore.getState();

  const maxFrame = computeMaxFrame(slots.map((s) => results[s.slotId]?.x.length ?? 1));
  if (maxFrame <= 0) throw new Error("No animation frames to export");

  const frameStep = Math.max(1, Math.floor(maxFrame / maxFrames));

  const sampleTrajectories = slots.flatMap((slot) =>
    buildTrajectoryTrace(slot, sliceResultToFrame(results[slot.slotId], 0), is3D, tailLength),
  );
  const staticCount = plotEl.data.length - sampleTrajectories.length;
  const staticTraces: Data[] = JSON.parse(JSON.stringify(plotEl.data.slice(0, staticCount)));
  const layout: Partial<Layout> = JSON.parse(JSON.stringify(plotEl.layout));

  const offscreen = document.createElement("div");
  offscreen.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${width}px;height:${height}px;overflow:hidden;pointer-events:none`;
  document.body.appendChild(offscreen);

  const totalFrames = Math.ceil((maxFrame + 1) / frameStep);
  const gifFrames: Array<{ data: CanvasImageSource; delay: number }> = [];
  const delay = Math.round(1000 / fps);

  try {
    for (let f = 0; f <= maxFrame; f += frameStep) {
      const trajectories = slots.flatMap((slot) =>
        buildTrajectoryTrace(slot, sliceResultToFrame(results[slot.slotId], f), is3D, tailLength),
      );
      await Plotly.react(offscreen, [...staticTraces, ...trajectories], layout, { displayModeBar: false });

      const dataUrl = await Plotly.toImage(offscreen, { format: "png", width, height });
      const img = await dataUrlToImage(dataUrl);
      gifFrames.push({ data: img, delay });
      onProgress?.(gifFrames.length, totalFrames);
      await yieldToMain();
    }

    return (await encode({
      width,
      height,
      frames: gifFrames.map((f) => ({ data: f.data, delay: f.delay })),
      format: "blob",
    })) as unknown as Blob;
  } finally {
    Plotly.purge(offscreen);
    offscreen.remove();
  }
}
