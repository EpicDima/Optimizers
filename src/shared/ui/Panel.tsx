import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  heading?: ReactNode;
  actions?: ReactNode;
}

/** Базовый строительный блок дашборда: волосяная граница, без тени —
 * плотная приборная панель, а не карточка маркетингового сайта. */
export function Panel({ heading, actions, className, children, ...props }: PanelProps) {
  return (
    <div className={cn("flex flex-col border border-border bg-bg-elevated", className)} {...props}>
      {(heading || actions) && (
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          {heading && (
            <h2 className="font-sans text-[11px] font-medium tracking-wide text-text-muted uppercase">{heading}</h2>
          )}
          {actions}
        </div>
      )}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
