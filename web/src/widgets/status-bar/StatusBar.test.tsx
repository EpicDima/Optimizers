import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useRunsStore } from "@entities/run";

import { StatusBar } from "./StatusBar";

function renderWithProviders() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <StatusBar />
    </QueryClientProvider>,
  );
}

describe("StatusBar", () => {
  const initialState = useRunsStore.getState();

  afterEach(() => {
    useRunsStore.setState(initialState, true);
  });

  it("renders without throwing in the idle empty state", () => {
    useRunsStore.setState({ slots: [], results: {}, isRunning: false, error: null });
    expect(() => renderWithProviders()).not.toThrow();
  });

  it("renders without throwing with a populated run result and a slot-level error", () => {
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
          x: [],
          y: [],
          value: [],
          lr: null,
          error: "unknown optimizer",
        },
      },
      isRunning: false,
      error: null,
    });

    const { getByText } = renderWithProviders();
    expect(getByText(/Adam/)).toBeInTheDocument();
  });

  it("shows the computing message while a run is in progress", () => {
    useRunsStore.setState({ isRunning: true });
    const { getByText } = renderWithProviders();
    expect(getByText("Считаем…")).toBeInTheDocument();
  });

  it("shows the top-level request error when set", () => {
    useRunsStore.setState({ isRunning: false, error: "Не удалось выполнить запрос" });
    const { getByText } = renderWithProviders();
    expect(getByText("Не удалось выполнить запрос")).toBeInTheDocument();
  });
});
