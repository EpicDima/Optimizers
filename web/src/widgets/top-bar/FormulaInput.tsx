import { useEffect, useRef, useState } from "react";

import { useFunctionPreview, useFunctionStore } from "@entities/test-function";
import { cn } from "@shared/lib/cn";

const DEBOUNCE_MS = 350;

/** Текстовый буфер формулы: коммит в стор (и, как следствие, сетевой запрос
 * предпросмотра) откладывается до паузы в наборе — тот же приём, что и в
 * NumberField, но здесь буфер строковый, а не числовой. */
export function FormulaInput() {
  const formula = useFunctionStore((state) => state.formula);
  const setFormula = useFunctionStore((state) => state.setFormula);
  const range = useFunctionStore((state) => state.range);
  const gridCount = useFunctionStore((state) => state.gridCount);

  const [text, setText] = useState(formula);
  const focused = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!focused.current) setText(formula);
  }, [formula]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // тот же запрос уже делает PlotPanel с теми же параметрами — react-query
  // отдаст закэшированный результат, лишнего похода в сеть не будет
  const preview = useFunctionPreview({ formula, range, count: gridCount });
  const error = preview.data && !preview.data.valid ? preview.data.error : null;

  function handleChange(next: string) {
    setText(next);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFormula(next), DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-[11px] text-text-muted">Формула f(x, y)</span>
      <input
        type="text"
        value={text}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
        }}
        onChange={(event) => handleChange(event.target.value)}
        className={cn(
          "h-7 w-64 rounded-sm border bg-bg px-2 font-mono text-xs text-text",
          "focus:outline focus:outline-1 focus:outline-accent",
          error ? "border-danger" : "border-border",
        )}
      />
      {error && <p className="max-w-64 font-body text-[11px] text-danger">{error}</p>}
    </div>
  );
}
