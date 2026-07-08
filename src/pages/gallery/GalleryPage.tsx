import { useState } from "react";
import { useLocation, useSearchParams } from "react-router";

import { functionPresets } from "@shared/lib/optimization-engine/functions";
import { ToggleGroup } from "@shared/ui";

import { GalleryCard } from "./GalleryCard";
import { SchedulerGallery } from "./SchedulerGallery";

type Tab = "functions" | "schedulers";

const TAB_OPTIONS = [
  { value: "functions", label: "Функции" },
  { value: "schedulers", label: "Планировщики" },
] as const;

function readInitialTab(): Tab {
  const hash = window.location.hash;
  const query = hash.split("?")[1];
  if (query) {
    const params = new URLSearchParams(query);
    if (params.get("tab") === "schedulers") return "schedulers";
  }
  return "functions";
}

export function GalleryPage() {
  const [, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [tab, setTabState] = useState<Tab>(readInitialTab);
  const setTab = (value: string) => {
    setTabState(value as Tab);
    if (pathname === "/gallery") {
      setSearchParams({ tab: value }, { replace: true });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-sans text-lg font-semibold text-text">Галерея</h1>
        <ToggleGroup
          value={tab}
          onChange={(val) => setTab(val as Tab)}
          options={TAB_OPTIONS}
        />
      </div>

      {tab === "functions" ? (
        <>
          <p className="mt-1 text-sm text-text-muted">
            Нажмите на карточку, чтобы открыть функцию на главной
          </p>
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {functionPresets.map((preset) => (
              <GalleryCard key={preset.name} preset={preset} />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-text-muted">
            Кривые learning rate для каждого планировщика с параметрами по умолчанию
          </p>
          <SchedulerGallery />
        </>
      )}
    </div>
  );
}
