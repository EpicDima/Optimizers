import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopBar } from "./TopBar";

// jsdom не реализует ResizeObserver, а Radix Slider (используется в
// PlotSettingsControls) вызывает его в layout-эффекте — локальный стаб
// только для этого файла, чтобы не трогать общий test-setup.ts.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!("ResizeObserver" in globalThis)) {
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;
}

// jsdom не реализует matchMedia, а ThemeToggle (через useResolvedTheme)
// вызывает его при монтировании — тот же приём, что и со ResizeObserver выше.
class MediaQueryListStub {
  matches = false;
  addEventListener() {}
  removeEventListener() {}
}
if (typeof window.matchMedia !== "function") {
  (window as unknown as { matchMedia: (query: string) => MediaQueryListStub }).matchMedia = () => new MediaQueryListStub();
}

// Смоук-тест: TopBar должен рендериться без исключений поверх пустого
// react-query кэша (presets/colormaps/preview ещё не загружены) — полное
// покрытие поведения появится в отдельной тестовой задаче позже.
function renderTopBar() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TopBar />
    </QueryClientProvider>,
  );
}

describe("TopBar", () => {
  it("рендерится без ошибок и показывает основные контролы", () => {
    renderTopBar();

    expect(screen.getByText("Формула f(x, y)")).toBeInTheDocument();
    expect(screen.getByText("Пресет")).toBeInTheDocument();
    expect(screen.getByText("X от")).toBeInTheDocument();
    expect(screen.getByText("2D")).toBeInTheDocument();
    expect(screen.getByText("3D")).toBeInTheDocument();
    expect(screen.getByText("Линии")).toBeInTheDocument();
    expect(screen.getByText("Заливка")).toBeInTheDocument();
  });
});
