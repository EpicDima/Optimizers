import { Separator } from "react-resizable-panels";

import { cn } from "@shared/lib/cn";

interface ResizeHandleProps {
  /** Ориентация родительской Group (та же строка, что передана ей в orientation) */
  orientation: "horizontal" | "vertical";
}

/** Разделитель между Panel'ями внутри Group из react-resizable-panels —
 * тонкая линия, которая утолщается и подсвечивается акцентным цветом при
 * наведении/перетаскивании ("потягушка"). Видимая ширина/высота меньше
 * фактической hit-зоны — её раздвигает сама библиотека (resizeTargetMinimumSize). */
export function ResizeHandle({ orientation }: ResizeHandleProps) {
  const isHorizontal = orientation === "horizontal";
  return (
    <Separator
      className={cn(
        "group relative shrink-0 outline-none",
        isHorizontal ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-strong transition-colors",
          "group-data-[separator=hover]:bg-accent group-data-[separator=active]:bg-accent",
          isHorizontal ? "h-10 w-1" : "h-1 w-10",
        )}
      />
    </Separator>
  );
}
