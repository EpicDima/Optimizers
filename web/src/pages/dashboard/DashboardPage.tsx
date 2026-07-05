import { ConvergenceChart } from "@widgets/convergence-chart";
import { PlaybackControls } from "@widgets/playback-controls";
import { PlotPanel } from "@widgets/plot-panel";
import { RunsSidebar } from "@widgets/runs-sidebar";
import { StatusBar } from "@widgets/status-bar";
import { TopBar } from "@widgets/top-bar";

/** Главная (и пока единственная) страница дашборда — композиция всех
 * виджетов без собственного состояния. */
export function DashboardPage() {
  return (
    <div className="flex h-screen flex-col bg-bg">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 pb-3">
        <TopBar />
        <div className="flex min-h-0 flex-1 gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="min-h-0 flex-1">
              <PlotPanel />
            </div>
            <div className="flex h-72 shrink-0 gap-3">
              <PlaybackControls />
              <div className="min-w-0 flex-1">
                <ConvergenceChart />
              </div>
            </div>
          </div>
          <div className="h-full w-80 shrink-0">
            <RunsSidebar />
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
