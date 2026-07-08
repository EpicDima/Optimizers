import { createHashRouter, Navigate } from "react-router";

import { RootLayout } from "./layouts/RootLayout";

export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/main" replace /> },
      { path: "main" },
      { path: "gallery" },
      { path: "analysis" },
    ],
  },
]);
