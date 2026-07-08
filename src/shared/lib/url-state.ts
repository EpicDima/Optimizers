/** Сериализация ключевого состояния дашборда в query-параметры URL и обратно.
 * Чистые функции без зависимости от React/Zustand/стора — типы намеренно
 * структурные (не импортируются из entities/*), чтобы shared не тянул
 * зависимость на вышестоящие слои; вызывающий код (app/) сам сопоставляет
 * поля со сторами. */

type DashboardRange = [number, number, number, number];
type DashboardContourMode = "contour" | "mesh";

export interface DashboardRunUrlState {
  optimizer: string;
  optimizerParams: Record<string, number>;
  scheduler: string;
  schedulerParams: Record<string, number>;
  start: [number, number];
  visible: boolean;
}

export interface DashboardUrlState {
  formula?: string;
  presetName?: string;
  range?: DashboardRange;
  globalStart?: [number, number];
  is3D?: boolean;
  contourMode?: DashboardContourMode;
  contourLevels?: number;
  colormap?: string;
  colormapReversed?: boolean;
  runs?: DashboardRunUrlState[];
}

const PARAM_FORMULA = "formula";
const PARAM_PRESET = "preset";
const PARAM_RANGE = "range";
const PARAM_DIM = "dim";
const PARAM_MODE = "mode";
const PARAM_LEVELS = "levels";
const PARAM_CMAP = "cmap";
const PARAM_CMAP_REVERSED = "cmapRev";
const PARAM_START = "start";
const PARAM_RUNS = "runs";

export function serializeDashboardState(state: DashboardUrlState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.formula !== undefined) params.set(PARAM_FORMULA, state.formula);
  if (state.presetName) params.set(PARAM_PRESET, state.presetName);
  if (state.range !== undefined) params.set(PARAM_RANGE, state.range.join(","));
  if (state.globalStart !== undefined) params.set(PARAM_START, state.globalStart.join(","));
  if (state.is3D !== undefined) params.set(PARAM_DIM, state.is3D ? "3d" : "2d");
  if (state.contourMode !== undefined) params.set(PARAM_MODE, state.contourMode);
  if (state.contourLevels !== undefined) params.set(PARAM_LEVELS, String(state.contourLevels));
  if (state.colormap !== undefined) params.set(PARAM_CMAP, state.colormap);
  if (state.colormapReversed !== undefined) params.set(PARAM_CMAP_REVERSED, state.colormapReversed ? "1" : "0");
  if (state.runs !== undefined && state.runs.length > 0) params.set(PARAM_RUNS, JSON.stringify(state.runs));

  return params;
}

export function deserializeDashboardState(params: URLSearchParams): DashboardUrlState {
  const result: DashboardUrlState = {};

  const formula = params.get(PARAM_FORMULA);
  if (formula) result.formula = formula;

  const presetName = params.get(PARAM_PRESET);
  if (presetName) result.presetName = presetName;

  const range = parseRange(params.get(PARAM_RANGE));
  if (range) result.range = range;

  const start = parseStart(params.get(PARAM_START));
  if (start) result.globalStart = start;

  const dim = params.get(PARAM_DIM);
  if (dim === "2d" || dim === "3d") result.is3D = dim === "3d";

  const mode = params.get(PARAM_MODE);
  if (mode === "contour" || mode === "mesh") result.contourMode = mode;

  const levels = parsePositiveInt(params.get(PARAM_LEVELS));
  if (levels !== null) result.contourLevels = levels;

  const cmap = params.get(PARAM_CMAP);
  if (cmap) result.colormap = cmap;

  const cmapReversed = params.get(PARAM_CMAP_REVERSED);
  if (cmapReversed === "1" || cmapReversed === "0") result.colormapReversed = cmapReversed === "1";

  const runs = parseRuns(params.get(PARAM_RUNS));
  if (runs) result.runs = runs;

  return result;
}

function parseRange(raw: string | null): DashboardRange | null {
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  return parts as DashboardRange;
}

function parseStart(raw: string | null): [number, number] | null {
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  return parts as [number, number];
}

function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parseRuns(raw: string | null): DashboardRunUrlState[] | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const runs = parsed.filter(isValidRunUrlState);
  return runs.length > 0 ? runs : null;
}

function isValidRunUrlState(value: unknown): value is DashboardRunUrlState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.optimizer === "string" &&
    typeof v.scheduler === "string" &&
    isNumberRecord(v.optimizerParams) &&
    isNumberRecord(v.schedulerParams) &&
    isNumberPair(v.start) &&
    typeof v.visible === "boolean"
  );
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((n) => typeof n === "number" && Number.isFinite(n));
}

function isNumberPair(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && value.every((n) => typeof n === "number" && Number.isFinite(n));
}
