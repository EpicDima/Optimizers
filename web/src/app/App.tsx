import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { TooltipProvider } from "@shared/ui";

import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

export default function App() {
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
