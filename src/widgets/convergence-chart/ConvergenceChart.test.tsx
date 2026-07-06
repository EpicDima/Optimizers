import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { useRunsStore } from "@entities/run";

import { ConvergenceChart } from "./ConvergenceChart";

// jsdom не реализует matchMedia — useResolvedTheme("system") обращается к
// нему при разрешении темы, поэтому нужен минимальный полифилл для рендера
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
});

function renderWithProviders() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ConvergenceChart />
    </QueryClientProvider>,
  );
}

describe("ConvergenceChart", () => {
  const initialState = useRunsStore.getState();

  afterEach(() => {
    useRunsStore.setState(initialState, true);
  });

  it("renders without throwing when there are no runs yet", () => {
    useRunsStore.setState({ slots: [], results: {} });
    expect(() => renderWithProviders()).not.toThrow();
  });

  it("renders without throwing with a populated run result", () => {
    seedRunWithResult();
    expect(() => renderWithProviders()).not.toThrow();
  });
});

function seedRunWithResult() {
  useRunsStore.setState({
    slots: [
      {
        slotId: "slot-1",
        optimizer: "Adam",
        optimizerParams: { lr: 0.3 },
        scheduler: "Constant",
        schedulerParams: {},
        start: [0, 0],
        color: "#ff2d2d",
        visible: true,
      },
    ],
    results: {
      "slot-1": {
        slotId: "slot-1",
        x: [0, 1, 2],
        y: [0, 1, 2],
        value: [10, 5, 1],
        lr: [0.3, 0.27, 0.24],
        error: null,
      },
    },
  });
}
