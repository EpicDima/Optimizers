import { encode } from "modern-gif";
import Plotly from "plotly.js/lib/core";

import { usePlaybackStore } from "@entities/playback";
import { plotDivRef } from "@widgets/plot-panel";

export interface ExportGifOptions {
  width?: number;
  height?: number;
  fps?: number;
  frameStep?: number;
  onProgress?: (current: number, total: number) => void;
}

function waitForRender(ms = 60): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, ms);
    });
  });
}

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function exportGif(options: ExportGifOptions = {}): Promise<Blob> {
  const { width = 600, height = 400, fps = 10, frameStep = 1, onProgress } = options;

  const plotEl = plotDivRef.current;
  if (!plotEl) throw new Error("Plot element not available");

  const store = usePlaybackStore.getState();
  const { maxFrame, frame: originalFrame, isPlaying: wasPlaying } = store;
  if (maxFrame <= 0) throw new Error("No animation frames to export");

  if (wasPlaying) usePlaybackStore.getState().pause();

  const totalFrames = Math.ceil((maxFrame + 1) / frameStep);
  const gifFrames: Array<{ data: CanvasImageSource; delay: number }> = [];
  const delay = Math.round(1000 / fps);

  try {
    for (let f = 0; f <= maxFrame; f += frameStep) {
      usePlaybackStore.setState({ frame: f });
      await waitForRender();

      const dataUrl = await Plotly.toImage(plotEl, { format: "png", width, height });
      const img = await dataUrlToImage(dataUrl);
      gifFrames.push({ data: img, delay });
      onProgress?.(gifFrames.length, totalFrames);
    }

    const blob = await encode({
      width,
      height,
      frames: gifFrames.map((f) => ({ data: f.data, delay: f.delay })),
      format: "blob",
    });

    return blob;
  } finally {
    usePlaybackStore.setState({ frame: originalFrame, isPlaying: wasPlaying });
  }
}
