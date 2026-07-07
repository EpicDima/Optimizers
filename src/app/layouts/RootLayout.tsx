import { Outlet } from "react-router";

import { Navbar } from "@widgets/navbar";

export function RootLayout() {
  return (
    <div className="flex h-screen flex-col bg-bg">
      <Navbar />
      <div className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
