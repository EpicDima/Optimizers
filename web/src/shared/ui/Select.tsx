import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@shared/lib/cn";

export interface SelectOption {
  value: string;
  label?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly (SelectOption | string)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function normalize(option: SelectOption | string): SelectOption {
  return typeof option === "string" ? { value: option } : option;
}

export function Select({ value, onChange, options, placeholder, className, disabled }: SelectProps) {
  const selectedLabel = options.map(normalize).find((option) => option.value === value)?.label ?? value;

  return (
    <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger
        title={selectedLabel || undefined}
        className={cn(
          "flex h-7 w-full items-center justify-between gap-2 rounded-sm border border-border bg-bg px-2",
          "font-sans text-xs text-text disabled:opacity-40",
          "focus:outline focus:outline-1 focus:outline-accent data-[placeholder]:text-text-muted",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} className="min-w-0 flex-1 truncate text-left" />
        <RadixSelect.Icon className="shrink-0">
          <ChevronDown size={13} className="text-text-muted" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-72 overflow-hidden rounded-sm border border-border-strong bg-bg-elevated text-xs shadow-none"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => {
              const { value: optionValue, label } = normalize(option);
              return (
                <RadixSelect.Item
                  key={optionValue}
                  value={optionValue}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-text outline-none",
                    "data-[highlighted]:bg-bg-sunken",
                  )}
                >
                  <RadixSelect.ItemText>{label ?? optionValue}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check size={12} className="text-accent" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              );
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
