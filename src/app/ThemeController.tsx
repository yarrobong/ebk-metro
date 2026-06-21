import { useEffect, useLayoutEffect, type ReactNode } from "react";

import { useThemeStore } from "./theme-store";
import { applyResolvedTheme, subscribeToSystemTheme } from "./theme";

interface ThemeControllerProps {
  children: ReactNode;
}

export function ThemeController({ children }: ThemeControllerProps) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  useLayoutEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    return subscribeToSystemTheme((systemTheme) => {
      useThemeStore.getState().syncSystemTheme(systemTheme);
    });
  }, []);

  return children;
}
