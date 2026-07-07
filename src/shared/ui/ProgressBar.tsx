import { cn } from "@shared/lib/cn";

interface ProgressBarProps {
  value: number;
  className?: string;
}

/** value — доля выполненного (0..1). */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1 w-full overflow-hidden rounded-sm bg-bg-sunken", className)}
    >
      <div className="h-full rounded-sm bg-accent transition-[width] duration-150" style={{ width: `${percent}%` }} />
    </div>
  );
}
