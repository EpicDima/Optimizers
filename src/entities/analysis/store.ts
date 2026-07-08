import { create } from "zustand";
import { persist } from "zustand/middleware";

import { colorForSlot } from "@shared/config/colors";
import { useRunsStore } from "@entities/run";
import { useFunctionStore } from "@entities/test-function";
import { functionPresets } from "@shared/lib/optimization-engine/functions";
import { getOptimizerDescriptor, optimizerNames } from "@shared/lib/optimization-engine/optimizers/registry";
import { runInWorker } from "@shared/lib/optimization-engine/run";
import type { EngineSlotInput } from "@shared/lib/optimization-engine/run";

export interface AnalysisResult {
  paramValue: number;
  color: string;
  values: number[];
  finalValue: number;
}

export type AnalysisMode = "sweep" | "heatmap";

export interface HeatmapData {
  xs: number[];
  ys: number[];
  z: number[][];
  surfaceXs: number[];
  surfaceYs: number[];
  surfaceZ: number[][];
}

interface AnalysisState {
  mode: AnalysisMode;
  optimizerName: string;
  paramName: string;
  paramFrom: number;
  paramTo: number;
  sampleCount: number;
  steps: number;
  results: AnalysisResult[];
  heatmapResolution: number;
  heatmapParams: Record<string, number>;
  heatmapData: HeatmapData | null;
  isRunning: boolean;
  error: string | null;

  setMode: (mode: AnalysisMode) => void;
  setOptimizerName: (name: string) => void;
  setParamName: (name: string) => void;
  setParamFrom: (value: number) => void;
  setParamTo: (value: number) => void;
  setSampleCount: (count: number) => void;
  setSteps: (steps: number) => void;
  setHeatmapResolution: (n: number) => void;
  setHeatmapParam: (key: string, value: number) => void;
  runSweep: () => Promise<void>;
  runHeatmap: () => Promise<void>;
}

function firstOptimizerName(): string {
  const slots = useRunsStore.getState().slots;
  if (slots.length > 0) return slots[0].optimizer;
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

function defaultParams(optimizerName: string): Record<string, number> {
  const descriptor = getOptimizerDescriptor(optimizerName);
  if (!descriptor) return {};
  const params: Record<string, number> = {};
  for (const [key, meta] of Object.entries(descriptor.params)) {
    params[key] = meta.default;
  }
  return params;
}

export const useAnalysisStore = create<AnalysisState>()(persist((set, get) => {
  const initOptimizer = firstOptimizerName();
  const initParam = firstParamName(initOptimizer);
  const initRange = defaultRange(initOptimizer, initParam);

  return {
    mode: "sweep" as AnalysisMode,
    optimizerName: initOptimizer,
    paramName: initParam,
    paramFrom: initRange.from,
    paramTo: initRange.to,
    sampleCount: 10,
    steps: 200,
    results: [],
    heatmapResolution: 30,
    heatmapParams: defaultParams(initOptimizer),
    heatmapData: null,
    isRunning: false,
    error: null,

    setMode: (mode) => set({ mode }),
    setOptimizerName: (optimizerName) => {
      const param = firstParamName(optimizerName);
      const range = defaultRange(optimizerName, param);
      set({ optimizerName, paramName: param, paramFrom: range.from, paramTo: range.to, heatmapParams: defaultParams(optimizerName) });
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
    setHeatmapResolution: (heatmapResolution) => set({ heatmapResolution }),
    setHeatmapParam: (key, value) => set((s) => ({ heatmapParams: { ...s.heatmapParams, [key]: value } })),

    runSweep: async () => {
      const { optimizerName, paramName, paramFrom, paramTo, sampleCount, steps, isRunning } = get();
      if (isRunning) return;

      const { presetName, formula } = useFunctionStore.getState();
      const { globalStart, gradientNoise } = useRunsStore.getState();
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
          slotId: `analysis-${i}`,
          optimizer: optimizerName,
          optimizerParams: { ...defaultParams, [paramName]: value },
          scheduler: "Constant",
          schedulerParams: {},
          start: [globalStart[0], globalStart[1]],
          reset: true,
        }));

        const engineResults = await runInWorker(formula, slots, steps, gradientNoise);

        const firstError = engineResults.find((r) => r.error);
        if (firstError) {
          set({ isRunning: false, error: firstError.error });
          return;
        }

        const results: AnalysisResult[] = engineResults.map((r, i) => ({
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

    runHeatmap: async () => {
      const { optimizerName, steps, heatmapResolution, heatmapParams, isRunning } = get();
      if (isRunning) return;

      const { presetName, formula } = useFunctionStore.getState();
      const { gradientNoise } = useRunsStore.getState();
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

      set({ isRunning: true, error: null, heatmapData: null });

      try {
        const [xMin, xMax, yMin, yMax] = preset.range;
        const n = heatmapResolution;
        const xs: number[] = [];
        const ys: number[] = [];
        for (let i = 0; i < n; i++) {
          xs.push(xMin + (i / (n - 1)) * (xMax - xMin));
          ys.push(yMin + (i / (n - 1)) * (yMax - yMin));
        }

        const slots: EngineSlotInput[] = [];
        for (let iy = 0; iy < n; iy++) {
          for (let ix = 0; ix < n; ix++) {
            slots.push({
              slotId: `heatmap-${iy}-${ix}`,
              optimizer: optimizerName,
              optimizerParams: { ...heatmapParams },
              scheduler: "Constant",
              schedulerParams: {},
              start: [xs[ix], ys[iy]],
              reset: true,
            });
          }
        }

        const engineResults = await runInWorker(formula, slots, steps, gradientNoise);

        const z: number[][] = [];
        for (let iy = 0; iy < n; iy++) {
          const row: number[] = [];
          for (let ix = 0; ix < n; ix++) {
            const r = engineResults[iy * n + ix];
            if (r.error) {
              row.push(NaN);
            } else {
              const vals = r.value;
              row.push(vals.length > 0 ? vals[vals.length - 1] : NaN);
            }
          }
          z.push(row);
        }

        const surfaceN = 100;
        const surfaceXs: number[] = [];
        const surfaceYs: number[] = [];
        for (let i = 0; i < surfaceN; i++) {
          surfaceXs.push(xMin + (i / (surfaceN - 1)) * (xMax - xMin));
          surfaceYs.push(yMin + (i / (surfaceN - 1)) * (yMax - yMin));
        }
        const surfaceZ = surfaceYs.map((yVal) => surfaceXs.map((xVal) => preset.fn(xVal, yVal)));

        set({ isRunning: false, heatmapData: { xs, ys, z, surfaceXs, surfaceYs, surfaceZ } });
      } catch (err) {
        set({ isRunning: false, error: err instanceof Error ? err.message : String(err) });
      }
    },
  };
}, {
  name: "optimizers-analysis",
  partialize: (s) => ({ mode: s.mode, heatmapResolution: s.heatmapResolution }),
}));
