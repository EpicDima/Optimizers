import { Moon, Sun } from "lucide-react";

import { useResolvedTheme, useThemeStore } from "@shared/lib/theme";
import { Button } from "@shared/ui";

/** Переключатель темы: чередует light/dark по фактически применённой теме,
 * минуя "system" — как только пользователь коснулся переключателя, выбор
 * персистится явно (useThemeStore уже завязан на zustand/persist). */
export function ThemeToggle() {
  const resolved = useResolvedTheme();
  const setTheme = useThemeStore((state) => state.setTheme);
  const isDark = resolved === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </Button>
  );
}
