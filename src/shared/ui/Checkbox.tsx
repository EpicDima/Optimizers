import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, className, disabled }: CheckboxProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 font-sans text-xs text-text", disabled && "pointer-events-none opacity-50", className)}>
      <RadixCheckbox.Root
        disabled={disabled}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-bg",
          "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
          "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-accent",
        )}
      >
        <RadixCheckbox.Indicator>
          <Check size={11} className="text-accent-text" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {label}
    </label>
  );
}
