import type { Vec2 } from "@shared/lib/optimization-engine/linalg";
import type { OptimizerInstance } from "@shared/lib/optimization-engine/optimizers";

export interface EngineSlotInput {
  slotId: string;
  optimizer: string;
  optimizerParams: Record<string, number>;
  scheduler: string;
  schedulerParams: Record<string, number>;
  start: Vec2;
  // false — продолжить с прошлой позиции того же слота, true — начать заново
  reset: boolean;
}

export interface EngineRunResult {
  slotId: string;
  x: number[];
  y: number[];
  value: number[];
  lr: number[] | null;
  internals: Record<string, number[]> | null;
  error: string | null;
}

interface ContinuationSlot {
  optimizerName: string;
  instance: OptimizerInstance;
}

// состояние живёт в памяти процесса ровно столько, сколько живёт сама вкладка
export type ContinuationMap = Map<string, ContinuationSlot>;
