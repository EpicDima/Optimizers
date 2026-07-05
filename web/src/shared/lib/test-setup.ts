import "@testing-library/jest-dom/vitest";

// jsdom не реализует ResizeObserver — нужен для usePlotlyAutoResize (@shared/lib/plotly)
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
