import { getOptimizerDescriptor, type OptimizerInstance } from "@shared/lib/optimization-engine/optimizers";
import { getSchedulerDescriptor } from "@shared/lib/optimization-engine/schedulers";

import type { ContinuationMap, EngineRunResult, EngineSlotInput } from "./types";

function defaultParamsOf(descriptor: { params: Record<string, { default: number }> }): Record<string, number> {
  return Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));
}

// как OptimizerWidget.get_params(): только уже существующие ключи, лишнее из вызова игнорируется
function applyKnownParams(target: Record<string, number>, updates: Record<string, number>): void {
  for (const key of Object.keys(target)) {
    if (key in updates) target[key] = updates[key];
  }
}

// JS молча пропускает лишние ключи в объекте параметров — в отличие от Python,
// где конструктор с незнакомым kwarg падает TypeError'ом; здесь эта проверка явная
function mergeValidatedParams(defaults: Record<string, number>, overrides: Record<string, number>): Record<string, number> | null {
  for (const key of Object.keys(overrides)) {
    if (!(key in defaults)) return null;
  }
  return { ...defaults, ...overrides };
}

function failed(slotId: string, error: string): EngineRunResult {
  return { slotId, x: [], y: [], value: [], lr: null, error };
}

export function runSlot(
  fn: (x: number, y: number) => number,
  cfg: EngineSlotInput,
  continuation: ContinuationMap,
  steps: number,
): EngineRunResult {
  const existing = continuation.get(cfg.slotId);
  let instance: OptimizerInstance;

  // продолжаем существующий инстанс только если не просили сброс и тип
  // оптимизатора для этого слота не поменялся
  if (!cfg.reset && existing !== undefined && existing.optimizerName === cfg.optimizer) {
    instance = existing.instance;
    applyKnownParams(instance.params, cfg.optimizerParams);
  } else {
    const descriptor = getOptimizerDescriptor(cfg.optimizer);
    if (descriptor === undefined) return failed(cfg.slotId, `неизвестный оптимизатор: ${cfg.optimizer}`);
    const params = mergeValidatedParams(defaultParamsOf(descriptor), cfg.optimizerParams);
    if (params === null) return failed(cfg.slotId, `некорректные параметры оптимизатора: ${cfg.optimizer}`);
    instance = descriptor.createInstance(fn, cfg.start, params);
    continuation.set(cfg.slotId, { optimizerName: cfg.optimizer, instance });
  }

  const schedulerDescriptor = getSchedulerDescriptor(cfg.scheduler);
  if (schedulerDescriptor === undefined) return failed(cfg.slotId, `неизвестный планировщик: ${cfg.scheduler}`);
  const schedulerParams = mergeValidatedParams(defaultParamsOf(schedulerDescriptor), cfg.schedulerParams);
  if (schedulerParams === null) return failed(cfg.slotId, `некорректные параметры планировщика: ${cfg.scheduler}`);

  // цикл дословно повторяет OptimizerWidget.optimize: расписание подставляется
  // в lr перед каждым шагом, base_lr восстанавливается в конце
  const xs = [instance.x[0]];
  const ys = [instance.x[1]];
  const values = [fn(instance.x[0], instance.x[1])];
  const baseLr = instance.params.lr;
  const hasLr = baseLr !== undefined;
  const lrs: number[] | null = hasLr ? [schedulerDescriptor.lr(schedulerParams, 0, steps, baseLr)] : null;

  for (let step = 0; step < steps; step++) {
    if (hasLr) {
      instance.params.lr = schedulerDescriptor.lr(schedulerParams, step, steps, baseLr);
      lrs?.push(instance.params.lr);
    }
    const point = instance.next();
    xs.push(point.x[0]);
    ys.push(point.x[1]);
    values.push(point.value);
  }

  if (hasLr) instance.params.lr = baseLr;

  return { slotId: cfg.slotId, x: xs, y: ys, value: values, lr: lrs, error: null };
}

export function runAll(
  fn: (x: number, y: number) => number,
  slots: EngineSlotInput[],
  continuation: ContinuationMap,
  steps: number,
): EngineRunResult[] {
  return slots.map((cfg) => runSlot(fn, cfg, continuation, steps));
}
