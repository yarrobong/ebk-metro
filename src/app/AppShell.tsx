import type { ReactNode } from "react";

import { BottomNavigation } from "../components/layout/BottomNavigation";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      <main className="app-safe-area mx-auto w-full max-w-[520px] pb-28">{children}</main>

      <BottomNavigation />
    </div>
  );
}
