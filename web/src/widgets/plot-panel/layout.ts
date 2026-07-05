import type { Layout } from "plotly.js";

import type { FunctionRange } from "@entities/test-function";

import type { PlotlyThemeColors } from "./plotly-theme";

export function buildLayout(is3D: boolean, theme: PlotlyThemeColors, range: FunctionRange): Partial<Layout> {
  const [fromX, toX, fromY, toY] = range;

  const common: Partial<Layout> = {
    paper_bgcolor: theme.paper,
    plot_bgcolor: theme.paper,
    font: { color: theme.fontColor, family: "Space Grotesk, Inter, system-ui, sans-serif", size: 11 },
    margin: is3D ? { l: 0, r: 0, t: 10, b: 0 } : { l: 44, r: 10, t: 10, b: 32 },
    showlegend: false,
    // сохраняет пользовательский зум/поворот камеры между перестроениями фигуры
    uirevision: "keep",
  };

  if (is3D) {
    return {
      ...common,
      scene: {
        bgcolor: theme.paper,
        xaxis: {
          range: [fromX, toX],
          gridcolor: theme.gridColor,
          color: theme.mutedFontColor,
          zerolinecolor: theme.lineColor,
        },
        yaxis: {
          range: [fromY, toY],
          gridcolor: theme.gridColor,
          color: theme.mutedFontColor,
          zerolinecolor: theme.lineColor,
        },
        zaxis: { gridcolor: theme.gridColor, color: theme.mutedFontColor, zerolinecolor: theme.lineColor },
      },
    };
  }

  return {
    ...common,
    // без scaleanchor: matplotlib по умолчанию тоже растягивает непрямоугольные
    // области (Bukin, Mishra-Bird и т.п.) под форму осей, а не сохраняет пропорции
    xaxis: { range: [fromX, toX], gridcolor: theme.gridColor, color: theme.mutedFontColor, zeroline: false },
    yaxis: { range: [fromY, toY], gridcolor: theme.gridColor, color: theme.mutedFontColor, zeroline: false },
  };
}
