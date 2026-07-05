import type { ButtonHTMLAttributes } from "react";

import { cn } from "@shared/lib/cn";

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  solid: "bg-accent text-accent-text border-transparent hover:brightness-110",
  outline: "bg-transparent text-text border-border-strong hover:bg-bg-sunken",
  ghost: "bg-transparent text-text-muted border-transparent hover:bg-bg-sunken hover:text-text",
  danger: "bg-transparent text-danger border-danger hover:bg-danger-bg",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
};

export function Button({ variant = "outline", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap rounded-sm border font-sans font-medium",
        "transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-accent",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
