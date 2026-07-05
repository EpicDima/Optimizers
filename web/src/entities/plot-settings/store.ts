import { create } from "zustand";

import { DEFAULT_TAIL } from "@shared/config/constants";

import type { ContourMode, PlotSettings } from "./model";

interface PlotSettingsState extends PlotSettings {
  setIs3D: (is3D: boolean) => void;
  setContourMode: (mode: ContourMode) => void;
  setContourLevels: (levels: number) => void;
  setColormap: (colormap: string) => void;
  setColormapReversed: (reversed: boolean) => void;
  setTailLength: (length: number) => void;
}

// умолчания совпадают с graphics.Graphics: threedimensional=False,
// contour_type=True, cmap="inferno", contour_number=30, not_disappearing=50
export const usePlotSettingsStore = create<PlotSettingsState>((set) => ({
  is3D: false,
  contourMode: "contour",
  contourLevels: 30,
  colormap: "inferno",
  colormapReversed: false,
  tailLength: DEFAULT_TAIL,
  setIs3D: (is3D) => set({ is3D }),
  setContourMode: (contourMode) => set({ contourMode }),
  setContourLevels: (contourLevels) => set({ contourLevels }),
  setColormap: (colormap) => set({ colormap }),
  setColormapReversed: (colormapReversed) => set({ colormapReversed }),
  setTailLength: (tailLength) => set({ tailLength }),
}));
