// Plotly для 3D (gl3d/WebGL) не понимает CSS-переменные — нужны литеральные
// значения, вручную синхронизированные с токенами в app/styles/globals.css
export interface PlotlyThemeColors {
  paper: string;
  gridColor: string;
  lineColor: string;
  fontColor: string;
  mutedFontColor: string;
}

const LIGHT: PlotlyThemeColors = {
  paper: "#ffffff",
  gridColor: "#e8eaed",
  lineColor: "#b8bcc2",
  fontColor: "#14171a",
  mutedFontColor: "#5b626b",
};

const DARK: PlotlyThemeColors = {
  paper: "#14171b",
  gridColor: "#262b31",
  lineColor: "#3a4048",
  fontColor: "#e7eaed",
  mutedFontColor: "#8b929b",
};

export function plotlyThemeColors(mode: "light" | "dark"): PlotlyThemeColors {
  return mode === "dark" ? DARK : LIGHT;
}
