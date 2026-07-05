import { Group, Panel as SplitPanel, useDefaultLayout } from "react-resizable-panels";

import { ConvergenceChart } from "@widgets/convergence-chart";
import { PlaybackControls } from "@widgets/playback-controls";
import { PlotPanel } from "@widgets/plot-panel";
import { RunsSidebar } from "@widgets/runs-sidebar";
import { TopBar } from "@widgets/top-bar";
import { ResizeHandle } from "@shared/ui";

/** Главная (и пока единственная) страница дашборда — композиция всех
 * виджетов. Секции перетаскиваемые (react-resizable-panels), размеры
 * запоминаются в localStorage через useDefaultLayout — каждая Group
 * персистится отдельно под своим id. */
export function DashboardPage() {
  const rootLayout = useDefaultLayout({ id: "dashboard-root", onlySaveAfterUserInteractions: true });
  const mainRowsLayout = useDefaultLayout({ id: "dashboard-main-rows", onlySaveAfterUserInteractions: true });
  const bottomRowLayout = useDefaultLayout({ id: "dashboard-bottom-row", onlySaveAfterUserInteractions: true });

  return (
    <div className="flex h-screen flex-col bg-bg">
      <div className="min-h-0 flex-1 p-4 pb-3">
        <Group id="dashboard-root" orientation="horizontal" defaultLayout={rootLayout.defaultLayout} onLayoutChanged={rootLayout.onLayoutChanged}>
          <SplitPanel id="main-column" defaultSize="76" minSize={480}>
            <div className="flex h-full min-w-0 flex-col gap-3">
              <TopBar />
              <div className="min-h-0 flex-1">
                <Group
                  id="dashboard-main-rows"
                  orientation="vertical"
                  defaultLayout={mainRowsLayout.defaultLayout}
                  onLayoutChanged={mainRowsLayout.onLayoutChanged}
                >
                  <SplitPanel id="plot" defaultSize="68" minSize={280}>
                    <PlotPanel />
                  </SplitPanel>
                  <ResizeHandle orientation="vertical" />
                  <SplitPanel id="bottom-row" defaultSize="32" minSize={220}>
                    <Group
                      id="dashboard-bottom-row"
                      orientation="horizontal"
                      defaultLayout={bottomRowLayout.defaultLayout}
                      onLayoutChanged={bottomRowLayout.onLayoutChanged}
                    >
                      <SplitPanel id="playback" defaultSize="20" minSize={260}>
                        <PlaybackControls />
                      </SplitPanel>
                      <ResizeHandle orientation="horizontal" />
                      <SplitPanel id="convergence" defaultSize="80" minSize={280}>
                        <ConvergenceChart />
                      </SplitPanel>
                    </Group>
                  </SplitPanel>
                </Group>
              </div>
            </div>
          </SplitPanel>
          <ResizeHandle orientation="horizontal" />
          <SplitPanel id="sidebar" defaultSize="24" minSize={260}>
            <RunsSidebar />
          </SplitPanel>
        </Group>
      </div>
    </div>
  );
}
