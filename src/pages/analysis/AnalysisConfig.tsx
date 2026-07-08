import { Play } from "lucide-react";

import { useRunsStore } from "@entities/run";
import { useAnalysisStore } from "@entities/analysis";
import type { AnalysisMode } from "@entities/analysis";
import { useFunctionPresets, useFunctionStore } from "@entities/test-function";
import { getOptimizerDescriptor, optimizerNames } from "@shared/lib/optimization-engine/optimizers/registry";
import { Button, NumberField, Panel, Select, ToggleGroup } from "@shared/ui";

const MODE_OPTIONS = [
  { value: "sweep", label: "Развёртка" },
  { value: "heatmap", label: "Тепловая карта" },
] as const;

export function AnalysisConfig() {
  const {
    mode,
    optimizerName,
    paramName,
    paramFrom,
    paramTo,
    sampleCount,
    steps,
    heatmapResolution,
    isRunning,
    setMode,
    setOptimizerName,
    setParamName,
    setParamFrom,
    setParamTo,
    setSampleCount,
    setSteps,
    setHeatmapResolution,
    runSweep,
    runHeatmap,
  } = useAnalysisStore();

  const { data: presets } = useFunctionPresets();
  const presetName = useFunctionStore((state) => state.presetName);
  const formula = useFunctionStore((state) => state.formula);
  const applyPreset = useFunctionStore((state) => state.applyPreset);
  const globalStart = useRunsStore((state) => state.globalStart);
  const setGlobalStart = useRunsStore((state) => state.setGlobalStart);
  const gradientNoise = useRunsStore((state) => state.gradientNoise);
  const setGradientNoise = useRunsStore((state) => state.setGradientNoise);

  function handlePresetChange(name: string) {
    const preset = presets?.find((item) => item.name === name);
    if (!preset) return;
    applyPreset(preset);
    setGlobalStart(preset.start);
  }

  const descriptor = getOptimizerDescriptor(optimizerName);
  const paramKeys = descriptor ? Object.keys(descriptor.params) : [];
  const paramOptions = paramKeys.map((key) => ({
    value: key,
    label: descriptor ? `${key} (${descriptor.params[key].default})` : key,
  }));

  const handleRun = mode === "sweep" ? runSweep : runHeatmap;

  return (
    <Panel heading="Конфигурация" className="h-full min-h-0">
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
        <ToggleGroup
          value={mode}
          onChange={(v) => setMode(v as AnalysisMode)}
          options={MODE_OPTIONS}
          className="w-full [&>*]:flex-1"
        />

        <label className="flex flex-col gap-1">
          <span className="font-sans text-[11px] text-text-muted">Пресет</span>
          <Select
            value={presetName ?? ""}
            onChange={handlePresetChange}
            options={presets?.map((p) => p.name) ?? []}
            placeholder="Своя формула"
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="font-sans text-[11px] text-text-muted">Формула f(x, y)</span>
          <p
            className="flex h-7 items-center overflow-x-auto whitespace-nowrap rounded-sm border border-border bg-bg-sunken px-2 font-mono text-xs text-text-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            title={formula}
          >
            {formula}
          </p>
        </div>

        {mode === "sweep" && (
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="x₀" value={globalStart[0]} onChange={(x) => setGlobalStart([x, globalStart[1]])} />
            <NumberField label="y₀" value={globalStart[1]} onChange={(y) => setGlobalStart([globalStart[0], y])} />
          </div>
        )}

        <NumberField label="Шаги" value={steps} onChange={setSteps} />

        <NumberField
          label="Шум градиента (σ)"
          value={gradientNoise}
          onChange={setGradientNoise}
          description="Лёгкий шум: 1e-5–1e-4, сильный: 1e-3–1e-2."
        />

        <label className="flex flex-col gap-1">
          <span className="font-sans text-[11px] text-text-muted">Оптимизатор</span>
          <Select
            value={optimizerName}
            onChange={setOptimizerName}
            options={optimizerNames()}
          />
        </label>

        {mode === "sweep" ? (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-sans text-[11px] text-text-muted">Параметр</span>
              <Select
                value={paramName}
                onChange={setParamName}
                options={paramOptions}
                disabled={paramOptions.length === 0}
              />
            </label>

            <NumberField label="От" value={paramFrom} onChange={setParamFrom} />
            <NumberField label="До" value={paramTo} onChange={setParamTo} />
            <NumberField label="Точек" value={sampleCount} onChange={setSampleCount} />
          </>
        ) : (
          <NumberField label="Разрешение сетки" value={heatmapResolution} onChange={setHeatmapResolution} />
        )}

        <Button variant="solid" size="md" disabled={isRunning} onClick={() => void handleRun()}>
          <Play size={14} />
          {isRunning ? "Вычисление..." : "Запустить"}
        </Button>
      </div>
    </Panel>
  );
}
