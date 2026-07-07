import type { EngineRunResult, EngineSlotInput } from "./types";
import type { RunWorkerRequest, RunWorkerResponse } from "./worker-protocol";

let worker: Worker | null = null;
let nextRequestId = 0;

function getWorker(): Worker {
  worker ??= new Worker(new URL("./run.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

export function runInWorker(formula: string, slots: EngineSlotInput[], steps: number): Promise<EngineRunResult[]> {
  const requestId = nextRequestId++;
  const instance = getWorker();

  return new Promise((resolve, reject) => {
    function handleMessage(event: MessageEvent<RunWorkerResponse>): void {
      const message = event.data;
      if (message.requestId !== requestId) return;

      instance.removeEventListener("message", handleMessage);
      if (message.type === "done") resolve(message.results);
      else reject(new Error(message.message));
    }

    instance.addEventListener("message", handleMessage);
    instance.postMessage({ type: "run", requestId, formula, slots, steps } satisfies RunWorkerRequest);
  });
}

// сбрасывает состояние оптимизатора для удалённого слота внутри воркера;
// если воркер ещё не создавался — чистить нечего
export function clearWorkerContinuationSlot(slotId: string): void {
  if (worker === null) return;
  worker.postMessage({ type: "clear", slotId } satisfies RunWorkerRequest);
}
