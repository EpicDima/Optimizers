import type { ContinuationMap } from "@shared/lib/optimization-engine/run";

// состояние живёт в памяти вкладки, пока она открыта — специальной очистки
// по времени не нужно
export const continuationMap: ContinuationMap = new Map();

export function clearContinuationSlot(slotId: string): void {
  continuationMap.delete(slotId);
}
