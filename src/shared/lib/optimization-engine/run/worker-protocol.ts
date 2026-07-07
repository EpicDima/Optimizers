import type { EngineRunResult, EngineSlotInput, RunProgress } from "./types";

export interface RunWorkerRunRequest {
  type: "run";
  requestId: number;
  formula: string;
  slots: EngineSlotInput[];
  steps: number;
}

export interface RunWorkerClearRequest {
  type: "clear";
  slotId: string;
}

export type RunWorkerRequest = RunWorkerRunRequest | RunWorkerClearRequest;

export interface RunWorkerProgressMessage {
  type: "progress";
  requestId: number;
  progress: RunProgress;
}

export interface RunWorkerDoneMessage {
  type: "done";
  requestId: number;
  results: EngineRunResult[];
}

export interface RunWorkerErrorMessage {
  type: "error";
  requestId: number;
  message: string;
}

export type RunWorkerResponse = RunWorkerProgressMessage | RunWorkerDoneMessage | RunWorkerErrorMessage;
