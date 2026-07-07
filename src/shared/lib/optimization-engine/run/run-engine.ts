import { getOptimizerDescriptor, type OptimizerInstance } from "@shared/lib/optimization-engine/optimizers";
import { getSchedulerDescriptor } from "@shared/lib/optimization-engine/schedulers";

import type { ContinuationMap, EngineRunResult, EngineSlotInput } from "./types";

// как часто отдаём управление event loop и шлём прогресс во время долгого
// расчёта — компромисс между отзывчивостью UI и накладными расходами на yield
const YIELD_INTERVAL_MS = 50;

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function defaultParamsOf(descriptor: { params: Record<string, { default: number }> }): Record<string, number> {
  return Object.fromEntries(Object.entries(descriptor.params).map(([key, meta]) => [key, meta.default]));
}

// только уже существующие ключи, лишнее из вызова игнорируется
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

export async function runSlotAsync(
  fn: (x: number, y: number) => number,
  cfg: EngineSlotInput,
  continuation: ContinuationMap,
  steps: number,
): Promise<EngineRunResult> {
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

  // расписание подставляется в lr перед каждым шагом, base_lr восстанавливается в конце
  const xs = [instance.x[0]];
  const ys = [instance.x[1]];
  const values = [fn(instance.x[0], instance.x[1])];
  const baseLr = instance.params.lr;
  const hasLr = baseLr !== undefined;
  const lrs: number[] | null = hasLr ? [schedulerDescriptor.lr(schedulerParams, 0, steps, baseLr)] : null;

  let lastYield = performance.now();
  for (let step = 0; step < steps; step++) {
    if (hasLr) {
      instance.params.lr = schedulerDescriptor.lr(schedulerParams, step, steps, baseLr);
      lrs?.push(instance.params.lr);
    }
    const point = instance.next();
    xs.push(point.x[0]);
    ys.push(point.x[1]);
    values.push(point.value);

    const now = performance.now();
    if (now - lastYield >= YIELD_INTERVAL_MS) {
      await yieldToEventLoop();
      lastYield = performance.now();
    }
  }

  if (hasLr) instance.params.lr = baseLr;

  return { slotId: cfg.slotId, x: xs, y: ys, value: values, lr: lrs, error: null };
}

export async function runAllAsync(
  fn: (x: number, y: number) => number,
  slots: EngineSlotInput[],
  continuation: ContinuationMap,
  steps: number,
): Promise<EngineRunResult[]> {
  const results: EngineRunResult[] = [];
  for (const cfg of slots) {
    results.push(await runSlotAsync(fn, cfg, continuation, steps));
  }
  return results;
}
