import type { ColormapCatalog } from "./model";

/** Плотли интерполирует между stops линейно — для реверса нужно менять
 * порядок цветов, но не позиции, иначе полосы качественных палитр сдвинутся. */
export function toPlotlyColorscale(
  catalog: ColormapCatalog,
  name: string,
  reversed: boolean,
): [number, string][] {
  const entry = catalog[name] ?? Object.values(catalog)[0];
  if (!entry) return [[0, "#000000"], [1, "#ffffff"]];
  if (!reversed) return entry.stops;

  const colors = entry.stops.map(([, color]) => color).reverse();
  return entry.stops.map(([position], index) => [position, colors[index]]);
}
