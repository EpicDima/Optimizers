import { useFunctionStore } from "@entities/test-function";

export function FormulaDisplay() {
  const formula = useFunctionStore((state) => state.formula);
  return (
    <div className="flex flex-col gap-1">
      <span className="font-sans text-[11px] text-text-muted">Формула f(x, y)</span>
      <p
        className="flex h-7 w-64 items-center rounded-sm border border-border bg-bg-sunken px-2 font-mono text-xs text-text-muted"
        title={formula}
      >
        {formula}
      </p>
    </div>
  );
}
