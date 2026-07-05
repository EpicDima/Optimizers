import { useEffect, useRef } from "react";

// plotly.js-dist-min — уже собранный бандл (с gl3d для surface/scatter3d),
// поэтому react-plotly.js подключается через фабрику, а не готовый default-экспорт
import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

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
