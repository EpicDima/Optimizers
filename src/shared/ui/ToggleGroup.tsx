import * as RadixToggleGroup from "@radix-ui/react-toggle-group";

import { cn } from "@shared/lib/cn";

export interface ToggleGroupOption {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly ToggleGroupOption[];
  className?: string;
}

/** Сегментированный переключатель — веб-аналог пары радиокнопок/чекбоксов
 * десктопного GUI (2D/3D, contour/mesh и т.п.), но компактнее пары чекбоксов. */
export function ToggleGroup({ value, onChange, options, className }: ToggleGroupProps) {
  return (
    <RadixToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      className={cn("inline-flex rounded-sm border border-border", className)}
    >
      {options.map((option) => (
        <RadixToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "h-7 px-2.5 font-sans text-xs text-text-muted first:rounded-l-sm last:rounded-r-sm",
            "border-r border-border last:border-r-0",
            "data-[state=on]:bg-accent data-[state=on]:text-accent-text data-[state=on]:font-medium",
            "hover:not-data-[state=on]:bg-bg-sunken hover:not-data-[state=on]:text-text",
          )}
        >
          {option.label}
        </RadixToggleGroup.Item>
      ))}
    </RadixToggleGroup.Root>
  );
}
