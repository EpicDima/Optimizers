import { createHashRouter, Navigate } from "react-router";

import { RootLayout } from "./layouts/RootLayout";

export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/main" replace /> },
      {
        path: "main",
        lazy: () => import("@pages/main/MainPage").then((m) => ({ Component: m.MainPage })),
      },
      {
        path: "gallery",
        lazy: () => import("@pages/gallery/GalleryPage").then((m) => ({ Component: m.GalleryPage })),
      },
      {
        path: "analysis",
        lazy: () => import("@pages/analysis/AnalysisPage").then((m) => ({ Component: m.AnalysisPage })),
      },
    ],
  },
]);
