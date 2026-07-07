import { useNavigate } from "react-router";

import { useRunsStore } from "@entities/run";
import { useFunctionStore } from "@entities/test-function";
import type { FunctionDescriptor } from "@shared/lib/optimization-engine/functions/types";

import { useInView } from "./useInView";
import { useThumbnailImage } from "./useThumbnailSurface";

interface GalleryCardProps {
  preset: FunctionDescriptor;
}

export function GalleryCard({ preset }: GalleryCardProps) {
  const { ref, visible } = useInView<HTMLDivElement>();
  const { data: src } = useThumbnailImage(preset, visible);
  const navigate = useNavigate();

  function handleClick() {
    useFunctionStore.getState().applyPreset({
      name: preset.name,
      formula: preset.formula,
      range: [...preset.range],
      start: [...preset.start],
    });
    useRunsStore.getState().setGlobalStart([...preset.start]);
    useRunsStore.getState().clearResults();
    useRunsStore.getState().resetSlotStarts();
    navigate("/dashboard");
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="group flex cursor-pointer flex-col overflow-hidden border border-border bg-bg-elevated transition-all hover:ring-2 hover:ring-accent"
    >
      <div className="aspect-square w-full">
        {src ? (
          <img src={src} alt={preset.name} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full items-center justify-center bg-bg-sunken">
            <span className="text-xs text-text-muted">Загрузка…</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="font-sans text-sm font-semibold text-text">{preset.name}</span>
        <span className="truncate font-mono text-xs text-text-muted" title={preset.formula}>
          {preset.formula}
        </span>
      </div>
    </div>
  );
}
