import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_TAIL } from "@shared/config/constants";

import type { ContourMode, PlotSettings } from "./model";

interface PlotSettingsState extends PlotSettings {
  setIs3D: (is3D: boolean) => void;
  setContourMode: (mode: ContourMode) => void;
  setContourLevels: (levels: number) => void;
  setColormap: (colormap: string) => void;
  setColormapReversed: (reversed: boolean) => void;
  setTailLength: (length: number) => void;
  setShowGradientField: (show: boolean) => void;
}

export const usePlotSettingsStore = create<PlotSettingsState>()(
  persist(
    (set) => ({
      is3D: false,
      contourMode: "contour",
      contourLevels: 30,
      colormap: "inferno",
      colormapReversed: false,
      tailLength: DEFAULT_TAIL,
      showGradientField: false,
      setIs3D: (is3D) => set({ is3D }),
      setContourMode: (contourMode) => set({ contourMode }),
      setContourLevels: (contourLevels) => set({ contourLevels }),
      setColormap: (colormap) => set({ colormap }),
      setColormapReversed: (colormapReversed) => set({ colormapReversed }),
      setTailLength: (tailLength) => set({ tailLength }),
      setShowGradientField: (showGradientField) => set({ showGradientField }),
    }),
    { name: "optimizers-plot-settings" },
  ),
);
