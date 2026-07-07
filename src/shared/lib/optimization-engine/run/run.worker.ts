import { functionPresets } from "@shared/lib/optimization-engine/functions";

import { runAllAsync } from "./run-engine";
import type { ContinuationMap } from "./types";
import type { RunWorkerRequest, RunWorkerResponse } from "./worker-protocol";

// живёт внутри воркера на весь срок его жизни — оптимизаторы держат
// замыкания и не переживают структурное клонирование через postMessage
const continuation: ContinuationMap = new Map();

function post(message: RunWorkerResponse): void {
  self.postMessage(message);
}

self.onmessage = async (event: MessageEvent<RunWorkerRequest>) => {
  const request = event.data;

  if (request.type === "clear") {
    continuation.delete(request.slotId);
    return;
  }

  const { requestId, formula, slots, steps, gradientNoise } = request;
  const preset = functionPresets.find((p) => p.formula === formula);
  if (!preset) {
    post({ type: "error", requestId, message: `неизвестная формула: ${formula}` });
    return;
  }

  try {
    const results = await runAllAsync(preset.fn, slots, continuation, steps, gradientNoise);
    post({ type: "done", requestId, results });
  } catch (err) {
    post({ type: "error", requestId, message: err instanceof Error ? err.message : String(err) });
  }
};
