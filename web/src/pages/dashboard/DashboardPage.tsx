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
 * персистится отдельно под своим id.
 *
 * defaultLayout передаётся с фолбэком на статическую карту id → проценты:
 * без него, пока localStorage пуст, вложенные Group считают самый первый
 * layout по замеру offsetWidth дочерних панелей — на вложенных группах этот
 * замер срабатывает раньше, чем предки получают свой финальный flex-grow, и
 * даёт неверные пропорции (например 50/50 вместо 68/32 или 48/52 вместо
 * 25/75), причём без последующей самокоррекции при ресайзе. Явная карта
 * задаёт проценты напрямую, минуя этот замер. */
const ROOT_DEFAULT_LAYOUT = { "main-column": 76, sidebar: 24 };
const MAIN_ROWS_DEFAULT_LAYOUT = { plot: 68, "bottom-row": 32 };
const BOTTOM_ROW_DEFAULT_LAYOUT = { playback: 25, convergence: 75 };

export function DashboardPage() {
  const rootLayout = useDefaultLayout({ id: "dashboard-root", onlySaveAfterUserInteractions: true });
  const mainRowsLayout = useDefaultLayout({ id: "dashboard-main-rows", onlySaveAfterUserInteractions: true });
  const bottomRowLayout = useDefaultLayout({ id: "dashboard-bottom-row", onlySaveAfterUserInteractions: true });

  return (
    <div className="flex h-screen flex-col bg-bg">
      <div className="min-h-0 flex-1 p-4 pb-3">
        <Group
          id="dashboard-root"
          orientation="horizontal"
          defaultLayout={rootLayout.defaultLayout ?? ROOT_DEFAULT_LAYOUT}
          onLayoutChanged={rootLayout.onLayoutChanged}
        >
          <SplitPanel id="main-column" defaultSize="76" minSize={480}>
            <div className="flex h-full min-w-0 flex-col gap-3">
              <TopBar />
              <div className="min-h-0 flex-1">
                <Group
                  id="dashboard-main-rows"
                  orientation="vertical"
                  defaultLayout={mainRowsLayout.defaultLayout ?? MAIN_ROWS_DEFAULT_LAYOUT}
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
                      defaultLayout={bottomRowLayout.defaultLayout ?? BOTTOM_ROW_DEFAULT_LAYOUT}
                      onLayoutChanged={bottomRowLayout.onLayoutChanged}
                    >
                      <SplitPanel id="playback" defaultSize="25" minSize={260}>
                        <PlaybackControls />
                      </SplitPanel>
                      <ResizeHandle orientation="horizontal" />
                      <SplitPanel id="convergence" defaultSize="75" minSize={280}>
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
