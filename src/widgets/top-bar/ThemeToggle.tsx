import { Monitor, Moon, Sun } from "lucide-react";

import type { Theme } from "@shared/lib/theme";
import { useThemeStore } from "@shared/lib/theme";

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "system", icon: Monitor },
  { value: "dark", icon: Moon },
];

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="flex items-center rounded-md border border-border bg-bg-sunken p-0.5">
      {THEMES.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`rounded-sm p-1 transition-colors ${
            theme === value
              ? "bg-bg-elevated text-text shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
          aria-label={value}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}
