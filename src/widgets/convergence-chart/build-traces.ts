import type { Data } from "plotly.js";

import type { RunConfig, RunResult } from "@entities/run";

function sliceToFrame(series: number[], frame: number): number[] {
  const end = Math.max(0, Math.min(frame + 1, series.length));
  return series.slice(0, end);
}

function resolveSeries(result: RunResult, metric: string, frame: number): number[] | undefined {
  let raw: number[] | undefined;
  if (metric === "__value__") raw = result.value;
  else if (metric === "lr") raw = result.lr ?? undefined;
  else raw = result.internals?.[metric];
  return raw ? sliceToFrame(raw, frame) : undefined;
}

export function buildConvergenceTraces(
  slots: RunConfig[],
  results: Record<string, RunResult>,
  frame: number,
  primaryMetric: string,
  secondaryMetric: string | null,
): Data[] {
  const traces: Data[] = [];

  for (const slot of slots) {
    if (!slot.visible) continue;
    const result = results[slot.slotId];
    if (!result || result.error) continue;

    const primary = resolveSeries(result, primaryMetric, frame);
    if (primary && primary.length > 0) {
      traces.push({
        type: "scatter",
        mode: "lines",
        x: primary.map((_, i) => i),
        y: primary,
        line: { color: slot.color, width: 2, dash: "solid" },
        name: slot.optimizer,
        showlegend: false,
        hoverinfo: "x+y+name",
      });

      const headIndex = primary.length - 1;
      traces.push({
        type: "scatter",
        mode: "markers",
        x: [headIndex],
        y: [primary[headIndex]],
        marker: { size: 8, color: slot.color },
        showlegend: false,
        hoverinfo: "skip",
      });
    }

    if (!secondaryMetric) continue;

    const secondary = resolveSeries(result, secondaryMetric, frame);
    if (!secondary || secondary.length === 0) continue;

    traces.push({
      type: "scatter",
      mode: "lines",
      x: secondary.map((_, i) => i),
      y: secondary,
      yaxis: "y2",
      line: { color: slot.color, width: 2, dash: "dot" },
      name: `${slot.optimizer} · ${secondaryMetric}`,
      showlegend: false,
      hoverinfo: "x+y+name",
    });
  }

  return traces;
}

export function collectAvailableMetrics(
  slots: RunConfig[],
  results: Record<string, RunResult>,
): string[] {
  const keys = new Set<string>();
  let hasLr = false;
  for (const slot of slots) {
    if (!slot.visible) continue;
    const result = results[slot.slotId];
    if (!result || result.error) continue;
    if (result.lr) hasLr = true;
    if (result.internals) {
      for (const key of Object.keys(result.internals)) keys.add(key);
    }
  }
  keys.delete("t");
  keys.delete("step");
  const sorted = [...keys].sort();
  if (hasLr) sorted.unshift("lr");
  return sorted;
}
