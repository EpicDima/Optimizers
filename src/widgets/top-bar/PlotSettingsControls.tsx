import { usePlotSettingsStore } from "@entities/plot-settings";
import { Checkbox, Slider, ToggleGroup } from "@shared/ui";

import { ColormapPicker } from "./ColormapPicker";

const DIMENSION_OPTIONS = [
  { value: "2d", label: "2D" },
  { value: "3d", label: "3D" },
] as const;

const CONTOUR_MODE_OPTIONS = [
  { value: "contour", label: "Линии" },
  { value: "mesh", label: "Заливка" },
] as const;

const MIN_CONTOUR_LEVELS = 5;
const MAX_CONTOUR_LEVELS = 100;

/** Настройки отображения графика: проекция, режим рельефа, число уровней
 * контура и палитра. */
export function PlotSettingsControls() {
  const is3D = usePlotSettingsStore((state) => state.is3D);
  const setIs3D = usePlotSettingsStore((state) => state.setIs3D);
  const contourMode = usePlotSettingsStore((state) => state.contourMode);
  const setContourMode = usePlotSettingsStore((state) => state.setContourMode);
  const contourLevels = usePlotSettingsStore((state) => state.contourLevels);
  const setContourLevels = usePlotSettingsStore((state) => state.setContourLevels);
  const colormap = usePlotSettingsStore((state) => state.colormap);
  const setColormap = usePlotSettingsStore((state) => state.setColormap);
  const colormapReversed = usePlotSettingsStore((state) => state.colormapReversed);
  const setColormapReversed = usePlotSettingsStore((state) => state.setColormapReversed);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <span className="font-sans text-[11px] text-text-muted">Вид</span>
        <ToggleGroup value={is3D ? "3d" : "2d"} onChange={(value) => setIs3D(value === "3d")} options={DIMENSION_OPTIONS} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-sans text-[11px] text-text-muted">Рельеф</span>
        <ToggleGroup
          value={contourMode}
          onChange={(value) => setContourMode(value === "mesh" ? "mesh" : "contour")}
          options={CONTOUR_MODE_OPTIONS}
        />
      </div>

      <div className="flex w-32 flex-col gap-1">
        <span className="font-sans text-[11px] text-text-muted">Уровни: {contourLevels}</span>
        <Slider value={contourLevels} onChange={setContourLevels} min={MIN_CONTOUR_LEVELS} max={MAX_CONTOUR_LEVELS} />
      </div>

      <ColormapPicker colormap={colormap} colormapReversed={colormapReversed} onChange={setColormap} />

      <Checkbox checked={colormapReversed} onChange={setColormapReversed} label="Инверсия" className="pb-1.5" />
    </div>
  );
}
