/** (from_x, to_x, from_y, to_y) — совпадает с Function.get_params на бэкенде. */
export type FunctionRange = [number, number, number, number];

export interface FunctionPreset {
  name: string;
  formula: string;
  range: FunctionRange;
  start: [number, number];
}

export interface FunctionPreviewResult {
  valid: boolean;
  error: string | null;
  meshX: number[];
  meshY: number[];
  z: number[][];
  /** (x, y, значение функции) — высота нужна для звёзд-маркеров в 3D. */
  minima: [number, number, number][];
}

export interface FunctionValueResult {
  valid: boolean;
  error: string | null;
  value: number | null;
}
