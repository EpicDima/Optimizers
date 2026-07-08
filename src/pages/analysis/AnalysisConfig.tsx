import { Play } from "lucide-react";

import { useRunsStore } from "@entities/run";
import { useAnalysisStore } from "@entities/analysis";
import { useFunctionPresets, useFunctionStore } from "@entities/test-function";
import { getOptimizerDescriptor, optimizerNames } from "@shared/lib/optimization-engine/optimizers/registry";
import { Button, NumberField, Panel, Select } from "@shared/ui";

export function AnalysisConfig() {
  const {
    optimizerName,
    paramName,
    paramFrom,
    paramTo,
    sampleCount,
    steps,
    isRunning,
    setOptimizerName,
    setParamName,
    setParamFrom,
    setParamTo,
    setSampleCount,
    setSteps,
    runSweep,
  } = useAnalysisStore();

  const { data: presets } = useFunctionPresets();
  const presetName = useFunctionStore((state) => state.presetName);
  const formula = useFunctionStore((state) => state.formula);
  const applyPreset = useFunctionStore((state) => state.applyPreset);
  const setGlobalStart = useRunsStore((state) => state.setGlobalStart);

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

  return (
    <Panel heading="Конфигурация" className="h-full">
      <div className="flex flex-col gap-3 p-3">
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

        <label className="flex flex-col gap-1">
          <span className="font-sans text-[11px] text-text-muted">Оптимизатор</span>
          <Select
            value={optimizerName}
            onChange={setOptimizerName}
            options={optimizerNames()}
          />
        </label>

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
        <NumberField label="Шаги" value={steps} onChange={setSteps} />

        <Button variant="solid" size="md" disabled={isRunning} onClick={() => void runSweep()}>
          <Play size={14} />
          {isRunning ? "Вычисление..." : "Запустить"}
        </Button>
      </div>
    </Panel>
  );
}
