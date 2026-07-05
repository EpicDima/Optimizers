import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { TooltipProvider } from "@shared/ui";

import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useResetRunsOnFormulaChange } from "./useResetRunsOnFormulaChange";
import { useUrlStateSync } from "./useUrlStateSync";

export default function App() {
  useUrlStateSync();
  useResetRunsOnFormulaChange();

  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider>
          <DashboardPage />
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
