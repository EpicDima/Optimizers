import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@shared/api/client";

import type { FunctionPreset, FunctionPreviewResult, FunctionRange, FunctionValueResult } from "./model";

export function useFunctionPresets() {
  return useQuery({
    queryKey: ["functions"],
    queryFn: () => apiClient.get<FunctionPreset[]>("/functions"),
    staleTime: Infinity,
  });
}

interface PreviewParams {
  formula: string;
  range: FunctionRange;
  count: number;
}

export function fetchFunctionPreview(params: PreviewParams) {
  return apiClient.post<FunctionPreviewResult>("/function/preview", params);
}

export function useFunctionPreview(params: PreviewParams | null) {
  return useQuery({
    queryKey: ["function-preview", params],
    queryFn: () => fetchFunctionPreview(params!),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  });
}

export function fetchFunctionValue(params: { formula: string; x: number; y: number }) {
  return apiClient.post<FunctionValueResult>("/function/value", params);
}
