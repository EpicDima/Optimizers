import { create } from "zustand";

import { colorForSlot } from "@shared/config/colors";
import { DEFAULT_STEPS } from "@shared/config/constants";
import { functionPresets } from "@shared/lib/optimization-engine/functions";
import { clearWorkerContinuationSlot } from "@shared/lib/optimization-engine/run";

import { computeRuns } from "./api";
import type { RunConfig, RunResult } from "./model";

interface NewSlotDefaults {
  optimizer: string;
  optimizerParams: Record<string, number>;
  scheduler: string;
  schedulerParams: Record<string, number>;
}

interface RunsState {
  slots: RunConfig[];
  results: Record<string, RunResult>;
  globalStart: [number, number];
  steps: number;
  gradientNoise: number;
  resetOnStart: boolean;
  isRunning: boolean;
  error: string | null;

  addSlot: (defaults: NewSlotDefaults) => void;
  removeSlot: (slotId: string) => void;
  updateSlot: (slotId: string, patch: Partial<RunConfig>) => void;
  setGlobalStart: (start: [number, number]) => void;
  setSteps: (steps: number) => void;
  setGradientNoise: (noise: number) => void;
  setResetOnStart: (reset: boolean) => void;
  runAll: (formula: string) => Promise<void>;
  clearResults: () => void;
  resetSlotStarts: () => void;
}

// старт (-4, 4), минимум один слот
export const useRunsStore = create<RunsState>((set, get) => ({
  slots: [],
  results: {},
  globalStart: [-4, 4],
  steps: DEFAULT_STEPS,
  gradientNoise: 0,
  resetOnStart: true,
  isRunning: false,
  error: null,

  addSlot: (defaults) =>
    set((state) => {
      const slotId = crypto.randomUUID();
      const slot: RunConfig = {
        slotId,
        optimizer: defaults.optimizer,
        optimizerParams: defaults.optimizerParams,
        scheduler: defaults.scheduler,
        schedulerParams: defaults.schedulerParams,
        start: state.globalStart,
        color: colorForSlot(state.slots.length),
        visible: true,
      };
      return { slots: [...state.slots, slot] };
    }),

  removeSlot: (slotId) =>
    set((state) => {
      if (state.slots.length <= 1) return state;
      clearWorkerContinuationSlot(slotId);
      const { [slotId]: _removed, ...results } = state.results;
      return { slots: state.slots.filter((slot) => slot.slotId !== slotId), results };
    }),

  updateSlot: (slotId, patch) =>
    set((state) => ({
      slots: state.slots.map((slot) => (slot.slotId === slotId ? { ...slot, ...patch } : slot)),
    })),

  setGlobalStart: (globalStart) => set({ globalStart }),
  setSteps: (steps) => set({ steps }),
  setGradientNoise: (gradientNoise) => set({ gradientNoise }),
  setResetOnStart: (resetOnStart) => set({ resetOnStart }),

  runAll: async (formula) => {
    const { slots, globalStart, steps, gradientNoise, resetOnStart, isRunning } = get();
    // одно вычисление за раз — повторный запуск, пока идёт предыдущее,
    // просто игнорируется
    if (isRunning || slots.length === 0) return;

    const preset = functionPresets.find((p) => p.formula === formula);
    if (!preset) {
      set({ error: "неизвестная формула" });
      return;
    }

    set({ isRunning: true, error: null });

    try {
      const runs = await computeRuns(formula, slots, globalStart, steps, resetOnStart, gradientNoise);
      const results: Record<string, RunResult> = {};
      for (const run of runs) results[run.slotId] = run;

      set((state) => ({
        isRunning: false,
        results: { ...state.results, ...results },
        // локальная копия последней позиции — резервный старт, если тип
        // оптимизатора слота сменился и continuation для него сбросилась
        slots: state.slots.map((slot) => {
          const result = results[slot.slotId];
          if (!result || result.error || result.x.length === 0) return slot;
          const lastIndex = result.x.length - 1;
          return { ...slot, start: [result.x[lastIndex], result.y[lastIndex]] };
        }),
      }));
    } catch (err) {
      set({ isRunning: false, error: err instanceof Error ? err.message : String(err) });
    }
  },

  clearResults: () => set({ results: {} }),

  resetSlotStarts: () =>
    set((state) => ({
      slots: state.slots.map((slot) => ({ ...slot, start: state.globalStart })),
    })),
}));
