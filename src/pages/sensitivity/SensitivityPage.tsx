import { useSensitivityStore } from "@entities/sensitivity";

import { SensitivityConvergenceChart } from "./ConvergenceChart";
import { FinalValueChart } from "./FinalValueChart";
import { SensitivityConfig } from "./SensitivityConfig";

export function SensitivityPage() {
  const error = useSensitivityStore((s) => s.error);

  return (
    <div className="flex h-full gap-3 p-4 pb-3">
      <div className="w-72 shrink-0">
        <SensitivityConfig />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {error && (
          <div className="rounded-sm border border-danger bg-danger-bg px-3 py-2 font-sans text-xs text-danger">
            {error}
          </div>
        )}
        <div className="min-h-0 flex-1">
          <SensitivityConvergenceChart />
        </div>
        <div className="min-h-0 flex-1">
          <FinalValueChart />
        </div>
      </div>
    </div>
  );
}
