export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "metro-theme";
export const DARK_THEME_COLOR = "#0B0E12";
export const LIGHT_THEME_COLOR = "#F4F7F6";
const SYSTEM_THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function normalizeThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : "system";
}

export function readThemePreference(): ThemePreference {
  try {
    const savedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    const preference = normalizeThemePreference(savedPreference);

    if (savedPreference !== null && savedPreference !== preference) {
      window.localStorage.setItem(THEME_STORAGE_KEY, "system");
    }

    return preference;
  } catch {
    return "system";
  }
}

export function writeThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // LocalStorage may be blocked, but theming should still work for the session.
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia(SYSTEM_THEME_MEDIA_QUERY).matches ? "dark" : "light";
}

export function resolveTheme(
  preference: ThemePreference,
  systemTheme: ResolvedTheme = getSystemTheme(),
): ResolvedTheme {
  return preference === "system" ? systemTheme : preference;
}

export function getThemeColor(theme: ResolvedTheme): string {
  return theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
}

export function applyResolvedTheme(
  theme: ResolvedTheme,
  documentRef: Document = document,
) {
  const root = documentRef.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = getThemeColor(theme);
  root.style.backgroundColor = themeColor;
  documentRef.body.style.backgroundColor = themeColor;

  const themeColorMeta = documentRef.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", themeColor);
  }

  const colorSchemeMeta = documentRef.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (colorSchemeMeta) {
    colorSchemeMeta.setAttribute("content", theme);
  }
}

export function subscribeToSystemTheme(onChange: (theme: ResolvedTheme) => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(SYSTEM_THEME_MEDIA_QUERY);
  const handleChange = (event: MediaQueryListEvent) => {
    onChange(event.matches ? "dark" : "light");
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }

  mediaQuery.addListener(handleChange);

  return () => {
    mediaQuery.removeListener(handleChange);
  };
}
