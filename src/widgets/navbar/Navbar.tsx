import { GalleryHorizontalEnd, LayoutDashboard, SlidersHorizontal } from "lucide-react";
import { NavLink } from "react-router";

import { usePlotSettingsStore } from "@entities/plot-settings";
import { Checkbox } from "@shared/ui";
import { ColormapPicker } from "@widgets/top-bar/ColormapPicker";
import { ThemeToggle } from "@widgets/top-bar/ThemeToggle";

const tabs = [
  { to: "/main", label: "Главная", icon: LayoutDashboard },
  { to: "/gallery", label: "Галерея", icon: GalleryHorizontalEnd },
  { to: "/analysis", label: "Анализ", icon: SlidersHorizontal },
] as const;

export function Navbar() {
  const colormap = usePlotSettingsStore((s) => s.colormap);
  const setColormap = usePlotSettingsStore((s) => s.setColormap);
  const colormapReversed = usePlotSettingsStore((s) => s.colormapReversed);
  const setColormapReversed = usePlotSettingsStore((s) => s.setColormapReversed);

  return (
    <nav className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-bg-elevated px-4">
      <div className="flex items-center gap-6">
        <span className="font-sans text-sm font-semibold tracking-tight text-text">Optimizers</span>
        <div className="flex items-center gap-1">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-text-muted hover:text-text"
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ColormapPicker colormap={colormap} colormapReversed={colormapReversed} onChange={setColormap} />
        <Checkbox checked={colormapReversed} onChange={setColormapReversed} label="Инверсия" />
        <ThemeToggle />
      </div>
    </nav>
  );
}
