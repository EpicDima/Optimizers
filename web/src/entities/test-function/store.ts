import { create } from "zustand";

import { DEFAULT_GRID_COUNT } from "@shared/config/constants";

import type { FunctionPreset, FunctionRange } from "./model";

interface FunctionState {
  formula: string;
  range: FunctionRange;
  gridCount: number;
  presetName: string | null;
  setFormula: (formula: string) => void;
  setRange: (range: FunctionRange) => void;
  setGridCount: (count: number) => void;
  applyPreset: (preset: FunctionPreset) => void;
}

// умолчание совпадает с десктопным GUI: main.pyw вызывает
// set_standard_function("Функция Химмельблау") сразу после старта
export const useFunctionStore = create<FunctionState>((set) => ({
  formula: "(x^2 + y - 11)^2 + (x + y^2 - 7)^2",
  range: [-5, 5, -5, 5],
  gridCount: DEFAULT_GRID_COUNT,
  presetName: "Функция Химмельблау",
  setFormula: (formula) => set({ formula, presetName: null }),
  setRange: (range) => set({ range }),
  setGridCount: (gridCount) => set({ gridCount }),
  applyPreset: (preset) =>
    set({
      formula: preset.formula,
      range: preset.range,
      presetName: preset.name,
    }),
}));
