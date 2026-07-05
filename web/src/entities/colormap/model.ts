export type ColormapType = "continuous" | "qualitative";

/** stops — пары [позиция 0..1, "#rrggbb"], сгенерированы scripts/generate_colormaps.py. */
export interface ColormapEntry {
  type: ColormapType;
  stops: [number, string][];
}

export type ColormapCatalog = Record<string, ColormapEntry>;
