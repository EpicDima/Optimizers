import { useEffect } from "react";

import { useRunsStore } from "@entities/run";
import { useFunctionStore } from "@entities/test-function";

export function useResetRunsOnFormulaChange() {
  const formula = useFunctionStore((state) => state.formula);

  useEffect(() => {
    useRunsStore.getState().clearResults();
    useRunsStore.getState().resetSlotStarts();
  }, [formula]);
}
