import * as RadixSlider from "@radix-ui/react-slider";

import { cn } from "@shared/lib/cn";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
}

export function Slider({ value, onChange, min, max, step = 1, className }: SliderProps) {
  return (
    <RadixSlider.Root
      value={[value]}
      onValueChange={([next]) => onChange(next)}
      min={min}
      max={max}
      step={step}
      className={cn("relative flex h-4 w-full touch-none items-center", className)}
    >
      <RadixSlider.Track className="relative h-1 grow rounded-sm bg-bg-sunken">
        <RadixSlider.Range className="absolute h-full rounded-sm bg-accent" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className={cn(
          "block size-3.5 rounded-full border border-accent bg-bg-elevated",
          "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-accent",
        )}
      />
    </RadixSlider.Root>
  );
}
