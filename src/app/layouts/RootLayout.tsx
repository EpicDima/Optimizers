import { lazy, Suspense, useRef } from "react";
import { useLocation } from "react-router";

import { Navbar } from "@widgets/navbar";

const MainPage = lazy(() => import("@pages/main/MainPage").then((m) => ({ default: m.MainPage })));
const GalleryPage = lazy(() => import("@pages/gallery/GalleryPage").then((m) => ({ default: m.GalleryPage })));
const AnalysisPage = lazy(() => import("@pages/analysis/AnalysisPage").then((m) => ({ default: m.AnalysisPage })));

const pages = [
  { path: "/main", Component: MainPage },
  { path: "/gallery", Component: GalleryPage },
  { path: "/analysis", Component: AnalysisPage },
] as const;

export function RootLayout() {
  const { pathname } = useLocation();
  const visited = useRef(new Set<string>());
  visited.current.add(pathname);

  return (
    <div className="flex h-screen flex-col bg-bg">
      <Navbar />
      <div className="min-h-0 flex-1 overflow-hidden">
        {pages.map(({ path, Component }) =>
          visited.current.has(path) && (
            <div key={path} className={pathname === path ? "h-full" : "hidden"}>
              <Suspense>
                <Component />
              </Suspense>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
