import { create } from "zustand";

import {
  getSystemTheme,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme";

interface ThemeState {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  syncSystemTheme: (systemTheme: ResolvedTheme) => void;
  reset: () => void;
}

function getInitialThemeState() {
  const preference = readThemePreference();

  return {
    preference,
    resolvedTheme: resolveTheme(preference, getSystemTheme()),
  };
}

export const useThemeStore = create<ThemeState>((set) => ({
  ...getInitialThemeState(),

  setPreference: (preference) => {
    writeThemePreference(preference);
    set({
      preference,
      resolvedTheme: resolveTheme(preference, getSystemTheme()),
    });
  },

  syncSystemTheme: (systemTheme) =>
    set((state) => {
      if (state.preference !== "system" || state.resolvedTheme === systemTheme) {
        return state;
      }

      return {
        resolvedTheme: systemTheme,
      };
    }),

  reset: () => {
    set(getInitialThemeState());
  },
}));
