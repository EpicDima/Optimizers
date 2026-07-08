import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { buildSurface, findMinima, functionPresets } from "@shared/lib/optimization-engine/functions";

import type { FunctionPreset, FunctionPreviewResult, FunctionRange } from "./model";

function listFunctionPresets(): FunctionPreset[] {
  return functionPresets.map((preset) => ({
    name: preset.name,
    formula: preset.formula,
    range: [preset.range[0], preset.range[1], preset.range[2], preset.range[3]],
    start: [preset.start[0], preset.start[1]],
  }));
}

export function useFunctionPresets() {
  return useQuery({
    queryKey: ["functions"],
    queryFn: () => listFunctionPresets(),
    staleTime: Infinity,
  });
}

interface PreviewParams {
  formula: string;
  range: FunctionRange;
  count: number;
}

function fetchFunctionPreview(params: PreviewParams): FunctionPreviewResult {
  const preset = functionPresets.find((p) => p.formula === params.formula);
  if (!preset) {
    return { valid: false, error: "неизвестная формула", meshX: [], meshY: [], z: [], minima: [] };
  }

  const [fromX, toX, fromY, toY] = params.range;
  if (fromX >= toX || fromY >= toY) {
    return {
      valid: false,
      error: "некорректный диапазон: from должен быть меньше to по каждой оси",
      meshX: [],
      meshY: [],
      z: [],
      minima: [],
    };
  }

  const grid = buildSurface(preset.fn, params.range, params.count);
  const minimaPoints = findMinima(preset.fn, params.range, grid);
  return {
    valid: true,
    error: null,
    meshX: grid.meshX,
    meshY: grid.meshY,
    z: grid.z,
    minima: minimaPoints.map(([x, y]) => [x, y, preset.fn(x, y)] as [number, number, number]),
  };
}

export function useFunctionPreview(params: PreviewParams | null) {
  return useQuery({
    queryKey: ["function-preview", params],
    queryFn: () => fetchFunctionPreview(params!),
    enabled: params !== null,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
}
