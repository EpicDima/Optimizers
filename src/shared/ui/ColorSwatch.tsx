import { cn } from "@shared/lib/cn";

interface ColorSwatchProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
  title?: string;
}

/** Квадрат цвета траектории, клик открывает нативный color-picker. */
export function ColorSwatch({ color, onChange, className, title }: ColorSwatchProps) {
  return (
    <label
      className={cn("relative block size-5 shrink-0 cursor-pointer rounded-sm border border-border-strong", className)}
      style={{ backgroundColor: color }}
      title={title}
    >
      <input
        type="color"
        value={color}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </label>
  );
}
