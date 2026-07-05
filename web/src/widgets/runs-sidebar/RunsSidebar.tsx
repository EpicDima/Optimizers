import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";

import { useOptimizers } from "@entities/optimizer";
import { useRunsStore } from "@entities/run";
import { useSchedulers } from "@entities/scheduler";
import { useFunctionStore } from "@entities/test-function";
import { MAX_RUNS } from "@shared/config/constants";
import { defaultParams } from "@shared/lib/algorithm";
import { Button, Checkbox, NumberField, Panel } from "@shared/ui";

import { RunCard } from "./RunCard";

export function RunsSidebar() {
  const { data: optimizers } = useOptimizers();
  const { data: schedulers } = useSchedulers();
  const formula = useFunctionStore((state) => state.formula);
  const {
    slots,
    addSlot,
    globalStart,
    setGlobalStart,
    steps,
    setSteps,
    resetOnStart,
    setResetOnStart,
    runAll,
    isRunning,
    error,
  } = useRunsStore();
  const seeded = useRef(false);

  // умолчания повторяют main.pyw: Adam(lr=0.3) и Momentum(lr=0.005) на
  // Химмельблау — контрастное поведение на одной паре минимумов
  useEffect(() => {
    if (seeded.current || slots.length > 0 || !optimizers || !schedulers) return;
    const adam = optimizers.find((option) => option.name === "Adam");
    const momentum = optimizers.find((option) => option.name === "Momentum");
    const constant = schedulers.find((option) => option.name === "Constant");
    if (!adam || !momentum || !constant) return;

    seeded.current = true;
    addSlot({
      optimizer: "Adam",
      optimizerParams: { ...defaultParams(adam), lr: 0.3 },
      scheduler: "Constant",
      schedulerParams: defaultParams(constant),
    });
    addSlot({
      optimizer: "Momentum",
      optimizerParams: { ...defaultParams(momentum), lr: 0.005 },
      scheduler: "Constant",
      schedulerParams: defaultParams(constant),
    });
  }, [optimizers, schedulers, slots.length, addSlot]);

  function handleAdd() {
    if (!optimizers || !schedulers || slots.length >= MAX_RUNS) return;
    const optimizer = optimizers[0];
    const scheduler = schedulers[0];
    addSlot({
      optimizer: optimizer.name,
      optimizerParams: defaultParams(optimizer),
      scheduler: scheduler.name,
      schedulerParams: defaultParams(scheduler),
    });
  }

  return (
    <Panel
      heading="Оптимизаторы"
      className="h-full"
      actions={
        <Button size="sm" variant="ghost" onClick={handleAdd} disabled={slots.length >= MAX_RUNS}>
          <Plus size={13} />
          Добавить
        </Button>
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto">
          {slots.map((slot) => (
            <RunCard key={slot.slotId} slot={slot} canRemove={slots.length > 1} />
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-border p-3">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="x₀" value={globalStart[0]} onChange={(x) => setGlobalStart([x, globalStart[1]])} />
            <NumberField label="y₀" value={globalStart[1]} onChange={(y) => setGlobalStart([globalStart[0], y])} />
          </div>
          <NumberField label="Шагов" value={steps} onChange={setSteps} />
          <Checkbox checked={resetOnStart} onChange={setResetOnStart} label="Сбрасывать позицию" />
          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button variant="solid" onClick={() => void runAll(formula)} disabled={isRunning || slots.length === 0}>
            {isRunning ? "Считаем…" : "Start"}
          </Button>
        </div>
      </div>
    </Panel>
  );
}
