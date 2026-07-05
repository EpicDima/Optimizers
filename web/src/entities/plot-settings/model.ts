export type ContourMode = "contour" | "mesh";

export interface PlotSettings {
  is3D: boolean;
  contourMode: ContourMode;
  contourLevels: number;
  colormap: string;
  colormapReversed: boolean;
  tailLength: number;
}
