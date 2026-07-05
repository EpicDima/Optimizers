import { Trash2 } from "lucide-react";

import { useOptimizers } from "@entities/optimizer";
import type { RunConfig } from "@entities/run";
import { useRunsStore } from "@entities/run";
import { useSchedulers } from "@entities/scheduler";
import { defaultParams } from "@shared/lib/algorithm";
import { Button, Checkbox, ColorSwatch, Select } from "@shared/ui";

import { ParamForm } from "./ParamForm";

interface RunCardProps {
  slot: RunConfig;
  canRemove: boolean;
}

export function RunCard({ slot, canRemove }: RunCardProps) {
  const { data: optimizers } = useOptimizers();
  const { data: schedulers } = useSchedulers();
  const updateSlot = useRunsStore((state) => state.updateSlot);
  const removeSlot = useRunsStore((state) => state.removeSlot);

  const optimizerMeta = optimizers?.find((option) => option.name === slot.optimizer);
  const schedulerMeta = schedulers?.find((option) => option.name === slot.scheduler);
  const hasLr = optimizerMeta ? "lr" in optimizerMeta.params : false;

  function handleOptimizerChange(name: string) {
    const meta = optimizers?.find((option) => option.name === name);
    if (!meta) return;
    updateSlot(slot.slotId, { optimizer: name, optimizerParams: defaultParams(meta) });
  }

  function handleSchedulerChange(name: string) {
    const meta = schedulers?.find((option) => option.name === name);
    if (!meta) return;
    updateSlot(slot.slotId, { scheduler: name, schedulerParams: defaultParams(meta) });
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border p-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <ColorSwatch color={slot.color} onChange={(color) => updateSlot(slot.slotId, { color })} title="Цвет траектории" />
        <Select
          value={slot.optimizer}
          onChange={handleOptimizerChange}
          options={optimizers?.map((option) => option.name) ?? []}
          className="flex-1"
        />
        <Button variant="ghost" size="sm" onClick={() => removeSlot(slot.slotId)} disabled={!canRemove} aria-label="Удалить оптимизатор">
          <Trash2 size={14} />
        </Button>
      </div>

      <ParamForm
        meta={optimizerMeta}
        values={slot.optimizerParams}
        onChange={(key, value) => updateSlot(slot.slotId, { optimizerParams: { ...slot.optimizerParams, [key]: value } })}
      />

      <div className="flex items-center gap-2 pt-1">
        <span className="w-16 shrink-0 font-sans text-[11px] text-text-muted">Scheduler</span>
        <Select
          value={slot.scheduler}
          onChange={handleSchedulerChange}
          options={schedulers?.map((option) => option.name) ?? []}
          disabled={!hasLr}
          className="flex-1"
        />
      </div>
      {hasLr && (
        <ParamForm
          meta={schedulerMeta}
          values={slot.schedulerParams}
          onChange={(key, value) => updateSlot(slot.slotId, { schedulerParams: { ...slot.schedulerParams, [key]: value } })}
        />
      )}

      <Checkbox checked={slot.visible} onChange={(visible) => updateSlot(slot.slotId, { visible })} label="Показывать траекторию" />
    </div>
  );
}
