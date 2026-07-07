import { createHashRouter, Navigate } from "react-router";

import { RootLayout } from "./layouts/RootLayout";

export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        lazy: () => import("@pages/dashboard/DashboardPage").then((m) => ({ Component: m.DashboardPage })),
      },
      {
        path: "gallery",
        lazy: () => import("@pages/gallery/GalleryPage").then((m) => ({ Component: m.GalleryPage })),
      },
    ],
  },
]);
