import { create } from "zustand";

import { colorForSlot } from "@shared/config/colors";
import { DEFAULT_STEPS } from "@shared/config/constants";
import { ApiError } from "@shared/api/client";

import { fetchOptimize } from "./api";
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
  resetOnStart: boolean;
  isRunning: boolean;
  error: string | null;

  addSlot: (defaults: NewSlotDefaults) => void;
  removeSlot: (slotId: string) => void;
  updateSlot: (slotId: string, patch: Partial<RunConfig>) => void;
  setGlobalStart: (start: [number, number]) => void;
  setSteps: (steps: number) => void;
  setResetOnStart: (reset: boolean) => void;
  runAll: (formula: string) => Promise<void>;
}

// умолчания совпадают с main.pyw: старт (-4, 4), 100(-200) шагов — здесь
// взят более наглядный дефолт для анимации, минимум один слот
export const useRunsStore = create<RunsState>((set, get) => ({
  slots: [],
  results: {},
  globalStart: [-4, 4],
  steps: DEFAULT_STEPS,
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
      const { [slotId]: _removed, ...results } = state.results;
      return { slots: state.slots.filter((slot) => slot.slotId !== slotId), results };
    }),

  updateSlot: (slotId, patch) =>
    set((state) => ({
      slots: state.slots.map((slot) => (slot.slotId === slotId ? { ...slot, ...patch } : slot)),
    })),

  setGlobalStart: (globalStart) => set({ globalStart }),
  setSteps: (steps) => set({ steps }),
  setResetOnStart: (resetOnStart) => set({ resetOnStart }),

  runAll: async (formula) => {
    const { slots, globalStart, steps, resetOnStart } = get();
    if (slots.length === 0) return;

    set({ isRunning: true, error: null });
    try {
      const response = await fetchOptimize({
        function: { formula },
        steps,
        runs: slots.map((slot) => ({
          slotId: slot.slotId,
          optimizer: slot.optimizer,
          optimizerParams: slot.optimizerParams,
          scheduler: slot.scheduler,
          schedulerParams: slot.schedulerParams,
          start: resetOnStart ? globalStart : slot.start,
          reset: resetOnStart,
        })),
      });

      const results: Record<string, RunResult> = {};
      for (const run of response.runs) results[run.slotId] = run;

      set((state) => ({
        isRunning: false,
        results: { ...state.results, ...results },
        // локальная копия последней позиции — резервный старт, если сессия
        // на сервере истекла или тип оптимизатора слота сменился
        slots: state.slots.map((slot) => {
          const result = results[slot.slotId];
          if (!result || result.error || result.x.length === 0) return slot;
          const lastIndex = result.x.length - 1;
          return { ...slot, start: [result.x[lastIndex], result.y[lastIndex]] };
        }),
      }));
    } catch (err) {
      set({ isRunning: false, error: err instanceof ApiError ? err.message : "Не удалось выполнить запрос" });
    }
  },
}));
