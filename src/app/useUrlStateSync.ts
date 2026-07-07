import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { usePlotSettingsStore } from "@entities/plot-settings";
import { useRunsStore } from "@entities/run";
import { useFunctionStore } from "@entities/test-function";
import { colorForSlot } from "@shared/config/colors";
import { functionPresets } from "@shared/lib/optimization-engine/functions";
import { deserializeDashboardState, serializeDashboardState } from "@shared/lib/url-state";
import type { DashboardRunUrlState } from "@shared/lib/url-state";

const WRITE_DEBOUNCE_MS = 350;

export function useUrlStateSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const state = deserializeDashboardState(searchParams);

    if (state.presetName !== undefined) {
      const preset = functionPresets.find((p) => p.name === state.presetName);
      if (preset) {
        useFunctionStore.setState({ formula: preset.formula, presetName: preset.name });
      }
    }
    if (state.range !== undefined) useFunctionStore.getState().setRange(state.range);

    if (state.is3D !== undefined) usePlotSettingsStore.getState().setIs3D(state.is3D);
    if (state.contourMode !== undefined) usePlotSettingsStore.getState().setContourMode(state.contourMode);
    if (state.contourLevels !== undefined) usePlotSettingsStore.getState().setContourLevels(state.contourLevels);
    if (state.colormap !== undefined) usePlotSettingsStore.getState().setColormap(state.colormap);
    if (state.colormapReversed !== undefined) usePlotSettingsStore.getState().setColormapReversed(state.colormapReversed);

    if (state.runs !== undefined) {
      useRunsStore.setState({
        slots: state.runs.map((run, index) => ({
          slotId: crypto.randomUUID(),
          optimizer: run.optimizer,
          optimizerParams: run.optimizerParams,
          scheduler: run.scheduler,
          schedulerParams: run.schedulerParams,
          start: run.start,
          color: colorForSlot(index),
          visible: run.visible,
        })),
      });
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formula = useFunctionStore((state) => state.formula);
  const presetName = useFunctionStore((state) => state.presetName);
  const range = useFunctionStore((state) => state.range);
  const is3D = usePlotSettingsStore((state) => state.is3D);
  const contourMode = usePlotSettingsStore((state) => state.contourMode);
  const contourLevels = usePlotSettingsStore((state) => state.contourLevels);
  const colormap = usePlotSettingsStore((state) => state.colormap);
  const colormapReversed = usePlotSettingsStore((state) => state.colormapReversed);
  const slots = useRunsStore((state) => state.slots);

  useEffect(() => {
    if (!hydrated) return;

    const runs: DashboardRunUrlState[] = slots.map((slot) => ({
      optimizer: slot.optimizer,
      optimizerParams: slot.optimizerParams,
      scheduler: slot.scheduler,
      schedulerParams: slot.schedulerParams,
      start: slot.start,
      visible: slot.visible,
    }));

    const timeout = setTimeout(() => {
      const params = serializeDashboardState({
        formula,
        presetName: presetName ?? undefined,
        range,
        is3D,
        contourMode,
        contourLevels,
        colormap,
        colormapReversed,
        runs,
      });
      setSearchParams(params, { replace: true });
    }, WRITE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [hydrated, formula, presetName, range, is3D, contourMode, contourLevels, colormap, colormapReversed, slots, setSearchParams]);
}
