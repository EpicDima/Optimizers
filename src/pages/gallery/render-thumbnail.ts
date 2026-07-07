import Plotly from "plotly.js/lib/core";
import type { Data, Layout } from "plotly.js";

import "@shared/lib/plotly";

let queue = Promise.resolve();

const yieldToMain = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

export function renderThumbnail(data: Data[], layout: Partial<Layout>, size: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    queue = queue.then(() => yieldToMain()).then(async () => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${size}px;height:${size}px;overflow:hidden;pointer-events:none`;
      document.body.appendChild(el);
      try {
        await Plotly.newPlot(el, data, layout, { staticPlot: true, displayModeBar: false });
        const url = await Plotly.toImage(el, { format: "png", width: size, height: size });
        resolve(url);
      } catch (err) {
        reject(err);
      } finally {
        Plotly.purge(el);
        el.remove();
      }
    });
  });
}
