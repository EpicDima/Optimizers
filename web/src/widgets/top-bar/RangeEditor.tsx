import { useFunctionStore } from "@entities/test-function";
import { NumberField } from "@shared/ui";

/** Границы области построения (from_x, to_x, from_y, to_y) — зеркалит
 * Function.get_params на бэкенде. */
export function RangeEditor() {
  const range = useFunctionStore((state) => state.range);
  const setRange = useFunctionStore((state) => state.setRange);
  const [fromX, toX, fromY, toY] = range;

  return (
    <div className="flex items-end gap-1.5">
      <NumberField label="X от" value={fromX} onChange={(value) => setRange([value, toX, fromY, toY])} className="w-16" />
      <NumberField label="X до" value={toX} onChange={(value) => setRange([fromX, value, fromY, toY])} className="w-16" />
      <NumberField label="Y от" value={fromY} onChange={(value) => setRange([fromX, toX, value, toY])} className="w-16" />
      <NumberField label="Y до" value={toY} onChange={(value) => setRange([fromX, toX, fromY, value])} className="w-16" />
    </div>
  );
}
