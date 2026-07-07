import Plotly from "plotly.js/lib/core";
import type { Data, Layout } from "plotly.js";

let queue = Promise.resolve();
let offscreen: HTMLDivElement | null = null;

function getOffscreen(): HTMLDivElement {
  if (!offscreen) {
    offscreen = document.createElement("div");
    offscreen.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:400px;height:400px;overflow:hidden;pointer-events:none";
    document.body.appendChild(offscreen);
  }
  return offscreen;
}

export function renderThumbnail(data: Data[], layout: Partial<Layout>, size: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    queue = queue.then(async () => {
      const el = getOffscreen();
      try {
        await Plotly.react(el, data, layout, { staticPlot: true, displayModeBar: false });
        const url = await Plotly.toImage(el, { format: "png", width: size, height: size });
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });
  });
}
