import type { ContinuationMap } from "@shared/lib/optimization-engine/run";

// один инстанс на вкладку вместо серверной Session с TTL — вкладка и так
// живёт в памяти одного процесса, эвикция не нужна
export const continuationMap: ContinuationMap = new Map();

export function clearContinuationSlot(slotId: string): void {
  continuationMap.delete(slotId);
}
