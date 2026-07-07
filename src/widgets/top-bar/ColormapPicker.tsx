import { useMemo } from "react";

import { useColormapCatalog } from "@entities/colormap";
import { Select } from "@shared/ui";

import { colormapGradientCss } from "./colormap-gradient";

interface ColormapPickerProps {
  colormap: string;
  colormapReversed: boolean;
  onChange: (colormap: string) => void;
}

export function ColormapPicker({ colormap, colormapReversed, onChange }: ColormapPickerProps) {
  const { data: catalog } = useColormapCatalog();

  const names = useMemo(() => Object.keys(catalog ?? {}).sort((a, b) => a.localeCompare(b)), [catalog]);
  const gradient = useMemo(
    () => (catalog ? colormapGradientCss(catalog, colormap, colormapReversed) : undefined),
    [catalog, colormap, colormapReversed],
  );

  return (
    <div className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="h-6 w-5 shrink-0 rounded-sm border border-border-strong"
        style={gradient ? { background: gradient } : undefined}
      />
      <Select value={colormap} onChange={onChange} options={names} className="w-32" />
    </div>
  );
}
