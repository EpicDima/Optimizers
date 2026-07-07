import { useMemo } from "react";

import { getSchedulerDescriptor, schedulerNames } from "@shared/lib/optimization-engine/schedulers/registry";

import { SchedulerCard } from "./SchedulerCard";

export function SchedulerGallery() {
  const descriptors = useMemo(
    () => schedulerNames().map((n) => getSchedulerDescriptor(n)!),
    [],
  );

  return (
    <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
      {descriptors.map((d) => (
        <SchedulerCard key={d.name} descriptor={d} />
      ))}
    </div>
  );
}
