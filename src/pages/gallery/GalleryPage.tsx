import { functionPresets } from "@shared/lib/optimization-engine/functions";

import { GalleryCard } from "./GalleryCard";

export function GalleryPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="font-sans text-lg font-semibold text-text">Галерея тестовых функций</h1>
      <p className="mt-1 text-sm text-text-muted">
        Нажмите на карточку, чтобы открыть функцию на площадке
      </p>
      <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {functionPresets.map((preset) => (
          <GalleryCard key={preset.name} preset={preset} />
        ))}
      </div>
    </div>
  );
}
