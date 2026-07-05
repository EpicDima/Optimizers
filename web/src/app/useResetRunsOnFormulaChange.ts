import { useEffect } from "react";

import { useRunsStore } from "@entities/run";
import { useFunctionStore } from "@entities/test-function";

/** При смене формулы старые results относятся к прошлой функции и не должны
 * рисоваться поверх нового рельефа/системы координат — очищаем их здесь, а не
 * в сторах напрямую, потому что entities/run и entities/test-function — соседние
 * сущности и не должны знать друг о друге (FSD). */
export function useResetRunsOnFormulaChange() {
  const formula = useFunctionStore((state) => state.formula);

  useEffect(() => {
    useRunsStore.getState().clearResults();
  }, [formula]);
}
