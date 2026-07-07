import { create } from "zustand";

import { colorForSlot } from "@shared/config/colors";
import { functionPresets } from "@shared/lib/optimization-engine/functions";
import { getOptimizerDescriptor, optimizerNames } from "@shared/lib/optimization-engine/optimizers/registry";
import { runInWorker } from "@shared/lib/optimization-engine/run";
import type { EngineSlotInput } from "@shared/lib/optimization-engine/run";

export interface SensitivityResult {
  paramValue: number;
  color: string;
  values: number[];
  finalValue: number;
}

interface SensitivityState {
  presetName: string;
  optimizerName: string;
  paramName: string;
  paramFrom: number;
  paramTo: number;
  sampleCount: number;
  steps: number;
  results: SensitivityResult[];
  isRunning: boolean;
  error: string | null;

  setPresetName: (name: string) => void;
  setOptimizerName: (name: string) => void;
  setParamName: (name: string) => void;
  setParamFrom: (value: number) => void;
  setParamTo: (value: number) => void;
  setSampleCount: (count: number) => void;
  setSteps: (steps: number) => void;
  runSweep: () => Promise<void>;
}

function firstOptimizerName(): string {
  return optimizerNames()[0];
}

function firstParamName(optimizerName: string): string {
  const descriptor = getOptimizerDescriptor(optimizerName);
  if (!descriptor) return "";
  const keys = Object.keys(descriptor.params);
  return keys[0] ?? "";
}

function paramDefault(optimizerName: string, paramName: string): number {
  const descriptor = getOptimizerDescriptor(optimizerName);
  if (!descriptor) return 1;
  return descriptor.params[paramName]?.default ?? 1;
}

function defaultRange(optimizerName: string, paramName: string): { from: number; to: number } {
  const def = paramDefault(optimizerName, paramName);
  if (def === 0) return { from: 0, to: 1 };
  return { from: def * 0.1, to: def * 10 };
}

export const useSensitivityStore = create<SensitivityState>((set, get) => {
  const initOptimizer = firstOptimizerName();
  const initParam = firstParamName(initOptimizer);
  const initRange = defaultRange(initOptimizer, initParam);

  return {
    presetName: functionPresets[0].name,
    optimizerName: initOptimizer,
    paramName: initParam,
    paramFrom: initRange.from,
    paramTo: initRange.to,
    sampleCount: 10,
    steps: 200,
    results: [],
    isRunning: false,
    error: null,

    setPresetName: (presetName) => set({ presetName }),

    setOptimizerName: (optimizerName) => {
      const param = firstParamName(optimizerName);
      const range = defaultRange(optimizerName, param);
      set({ optimizerName, paramName: param, paramFrom: range.from, paramTo: range.to });
    },

    setParamName: (paramName) => {
      const { optimizerName } = get();
      const range = defaultRange(optimizerName, paramName);
      set({ paramName, paramFrom: range.from, paramTo: range.to });
    },

    setParamFrom: (paramFrom) => set({ paramFrom }),
    setParamTo: (paramTo) => set({ paramTo }),
    setSampleCount: (sampleCount) => set({ sampleCount }),
    setSteps: (steps) => set({ steps }),

    runSweep: async () => {
      const { presetName, optimizerName, paramName, paramFrom, paramTo, sampleCount, steps, isRunning } = get();
      if (isRunning) return;

      const preset = functionPresets.find((p) => p.name === presetName);
      if (!preset) {
        set({ error: "неизвестная функция" });
        return;
      }

      const descriptor = getOptimizerDescriptor(optimizerName);
      if (!descriptor) {
        set({ error: "неизвестный оптимизатор" });
        return;
      }

      set({ isRunning: true, error: null, results: [] });

      try {
        const defaultParams: Record<string, number> = {};
        for (const [key, meta] of Object.entries(descriptor.params)) {
          defaultParams[key] = meta.default;
        }

        const sampledValues: number[] = [];
        for (let i = 0; i < sampleCount; i++) {
          const t = sampleCount <= 1 ? 0.5 : i / (sampleCount - 1);
          sampledValues.push(paramFrom + t * (paramTo - paramFrom));
        }

        const slots: EngineSlotInput[] = sampledValues.map((value, i) => ({
          slotId: `sensitivity-${i}`,
          optimizer: optimizerName,
          optimizerParams: { ...defaultParams, [paramName]: value },
          scheduler: "none",
          schedulerParams: {},
          start: [preset.start[0], preset.start[1]],
          reset: true,
        }));

        const engineResults = await runInWorker(preset.formula, slots, steps);

        const results: SensitivityResult[] = engineResults.map((r, i) => ({
          paramValue: sampledValues[i],
          color: colorForSlot(i),
          values: r.value,
          finalValue: r.value.length > 0 ? r.value[r.value.length - 1] : NaN,
        }));

        set({ isRunning: false, results });
      } catch (err) {
        set({ isRunning: false, error: err instanceof Error ? err.message : String(err) });
      }
    },
  };
});
