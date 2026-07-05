import { useQuery } from "@tanstack/react-query";

import type { ColormapCatalog } from "./model";

async function fetchColormapCatalog(): Promise<ColormapCatalog> {
  const response = await fetch("/colormaps.json");
  if (!response.ok) throw new Error("не удалось загрузить colormaps.json");
  return response.json() as Promise<ColormapCatalog>;
}

export function useColormapCatalog() {
  return useQuery({
    queryKey: ["colormap-catalog"],
    queryFn: fetchColormapCatalog,
    staleTime: Infinity,
  });
}
