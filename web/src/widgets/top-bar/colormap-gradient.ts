import { toPlotlyColorscale } from "@entities/colormap";
import type { ColormapCatalog } from "@entities/colormap";

/** CSS-градиент для превью текущей палитры рядом с Select — переиспользует ту
 * же интерполяцию стопов (и ту же логику реверса), что и трейсы Plotly, чтобы
 * превью не расходилось с фактическим фоном графика. */
export function colormapGradientCss(catalog: ColormapCatalog, name: string, reversed: boolean): string {
  const scale = toPlotlyColorscale(catalog, name, reversed);
  const stops = scale.map(([position, color]) => `${color} ${Math.round(position * 100)}%`).join(", ");
  return `linear-gradient(to right, ${stops})`;
}
