import { useEffect, useRef } from "react";

import Plotly from "plotly.js/lib/core";
import contour from "plotly.js/lib/contour";
import heatmap from "plotly.js/lib/heatmap";
import scatter from "plotly.js/lib/scatter";
import scatter3d from "plotly.js/lib/scatter3d";
import surface from "plotly.js/lib/surface";
import createPlotlyComponent from "react-plotly.js/factory";

Plotly.register([scatter, scatter3d, surface, contour, heatmap]);

export const Plot = createPlotlyComponent(Plotly);

/** react-plotly.js's useResizeHandler подписан только на window resize, а не
 * на изменение размера самого контейнера — график не подстраивается, когда
 * контейнер меняется без ресайза окна (например, при перетаскивании
 * разделителей react-resizable-panels). ResizeObserver на графике вызывает
 * Plotly.Plots.resize напрямую. Ref повесить на сам <Plot> — рендерит div, в
 * который встраивается график. */
export function usePlotlyAutoResize() {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      void Plotly.Plots.resize(el);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return plotRef;
}
