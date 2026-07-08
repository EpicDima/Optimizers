import { useAnalysisStore } from "@entities/analysis";

import { AnalysisConvergenceChart } from "./ConvergenceChart";
import { FinalValueChart } from "./FinalValueChart";
import { HeatmapChart } from "./HeatmapChart";
import { AnalysisConfig } from "./AnalysisConfig";

export function AnalysisPage() {
  const mode = useAnalysisStore((s) => s.mode);
  const error = useAnalysisStore((s) => s.error);

  return (
    <div className="flex h-full gap-3 p-4 pb-3">
      <div className="w-72 shrink-0">
        <AnalysisConfig />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {error && (
          <div className="rounded-sm border border-danger bg-danger-bg px-3 py-2 font-sans text-xs text-danger">
            {error}
          </div>
        )}
        {mode === "sweep" ? (
          <>
            <div className="min-h-0 flex-1">
              <AnalysisConvergenceChart />
            </div>
            <div className="min-h-0 flex-1">
              <FinalValueChart />
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1">
            <HeatmapChart />
          </div>
        )}
      </div>
    </div>
  );
}
