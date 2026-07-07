import { Play } from "lucide-react";

import { useSensitivityStore } from "@entities/sensitivity";
import { functionPresets } from "@shared/lib/optimization-engine/functions";
import { getOptimizerDescriptor, optimizerNames } from "@shared/lib/optimization-engine/optimizers/registry";
import { Button, NumberField, Panel, Select } from "@shared/ui";

export function SensitivityConfig() {
  const {
    presetName,
    optimizerName,
    paramName,
    paramFrom,
    paramTo,
    sampleCount,
    steps,
    isRunning,
    setPresetName,
    setOptimizerName,
    setParamName,
    setParamFrom,
    setParamTo,
    setSampleCount,
    setSteps,
    runSweep,
  } = useSensitivityStore();

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
          <span className="font-sans text-[11px] text-text-muted">Функция</span>
          <Select
            value={presetName}
            onChange={setPresetName}
            options={functionPresets.map((p) => p.name)}
          />
        </label>

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
