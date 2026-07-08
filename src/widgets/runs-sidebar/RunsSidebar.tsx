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
    gradientNoise,
    setGradientNoise,
    resetOnStart,
    setResetOnStart,
    runAll,
    isRunning,
    error,
  } = useRunsStore();
  const seeded = useRef(false);

  // Adam(lr=0.3) и Momentum(lr=0.005) на Химмельблау — контрастное поведение
  // на одной паре минимумов
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
    <div className="flex h-full flex-col gap-3">
      <Panel
        heading="Оптимизаторы"
        className="min-h-0 flex-1"
        actions={
          <Button size="sm" variant="ghost" onClick={handleAdd} disabled={slots.length >= MAX_RUNS}>
            <Plus size={13} />
            Добавить
          </Button>
        }
      >
        <div className="flex h-full flex-col gap-2 overflow-y-auto p-2">
          {slots.map((slot) => (
            <RunCard key={slot.slotId} slot={slot} canRemove={slots.length > 1} />
          ))}
        </div>
      </Panel>

      <Panel heading="Запуск" className="shrink-0">
        <div className="flex flex-col gap-2 p-3">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="x₀" value={globalStart[0]} onChange={(x) => setGlobalStart([x, globalStart[1]])} />
            <NumberField label="y₀" value={globalStart[1]} onChange={(y) => setGlobalStart([globalStart[0], y])} />
          </div>
          <NumberField label="Шагов" value={steps} onChange={setSteps} />
          <NumberField
            label="Шум градиента (σ)"
            value={gradientNoise}
            onChange={setGradientNoise}
            description="Имитация стохастического градиента (SGD на мини-батчах): в реальном обучении градиент зашумлён, потому что считается не по всем данным, а по выборке. σ — стандартное отклонение гауссова шума к f(x,y). Типичные значения: 1e-7–1e-5. Значения ≥0.01 забивают градиент."
          />
          <Checkbox checked={resetOnStart} onChange={setResetOnStart} label="Сбрасывать позицию" />
          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button variant="solid" onClick={() => void runAll(formula)} disabled={isRunning || slots.length === 0}>
            {isRunning ? "Считаем…" : "Start"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
