import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeController } from "./ThemeController";
import { useThemeStore } from "./theme-store";
import {
  DARK_THEME_COLOR,
  LIGHT_THEME_COLOR,
  readThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
} from "./theme";
import { useAppStore } from "./store";

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  let listener: ((event: MediaQueryListEvent) => void) | null = null;
  const addEventListener = vi.fn(
    (_eventName: string, callback: (event: MediaQueryListEvent) => void) => {
      listener = callback;
    },
  );
  const removeEventListener = vi.fn(
    (_eventName: string, callback: (event: MediaQueryListEvent) => void) => {
      if (listener === callback) {
        listener = null;
      }
    },
  );

  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener,
    removeEventListener,
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.mocked(window.matchMedia).mockImplementation(() => mediaQueryList);

  return {
    mediaQueryList,
    addEventListener,
    removeEventListener,
    dispatch(nextMatches: boolean) {
      matches = nextMatches;
      listener?.({ matches: nextMatches } as MediaQueryListEvent);
    },
  };
}

describe("theme system", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = [
      '<meta name="theme-color" content="#F4F7F6" />',
      '<meta name="color-scheme" content="light" />',
    ].join("");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
    document.documentElement.style.backgroundColor = "";
    document.body.style.backgroundColor = "";
    installMatchMedia(false);
    useThemeStore.getState().reset();
    useAppStore.setState({
      screen: "stations",
      showSeconds: true,
      selectedStationId: null,
      selectedDirectionId: null,
      selectedDestinationId: null,
      isDirectionModalOpen: false,
      isDestinationSheetOpen: false,
      activeToast: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses system by default", () => {
    expect(readThemePreference()).toBe("system");
  });

  it("resolves dark when the system theme is dark", () => {
    installMatchMedia(true);
    useThemeStore.getState().reset();

    render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("resolves light when the system theme is light", () => {
    installMatchMedia(false);
    useThemeStore.getState().reset();

    render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("ignores system changes after selecting light manually", () => {
    const media = installMatchMedia(true);
    useThemeStore.getState().reset();
    useThemeStore.getState().setPreference("light");

    render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    act(() => {
      media.dispatch(true);
    });

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("ignores system changes after selecting dark manually", () => {
    const media = installMatchMedia(false);
    useThemeStore.getState().reset();
    useThemeStore.getState().setPreference("dark");

    render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    act(() => {
      media.dispatch(false);
    });

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("follows the device again after returning to system mode", () => {
    const media = installMatchMedia(false);
    useThemeStore.getState().reset();
    useThemeStore.getState().setPreference("dark");

    render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    act(() => {
      useThemeStore.getState().setPreference("system");
    });

    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    act(() => {
      media.dispatch(true);
    });

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("persists the selected preference", () => {
    useThemeStore.getState().setPreference("dark");

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(readThemePreference()).toBe("dark");
  });

  it("resets an invalid LocalStorage value back to system", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "sepia");

    expect(readThemePreference()).toBe("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("removes the system theme listener on unmount", () => {
    const media = installMatchMedia(false);

    const { unmount } = render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    unmount();

    expect(media.addEventListener).toHaveBeenCalledTimes(1);
    expect(media.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("does not register duplicate listeners on rerender", () => {
    const media = installMatchMedia(false);

    const { rerender } = render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    rerender(
      <ThemeController>
        <div>theme updated</div>
      </ThemeController>,
    );

    expect(screen.getByText("theme updated")).toBeInTheDocument();
    expect(media.addEventListener).toHaveBeenCalledTimes(1);
  });

  it("updates the runtime theme-color meta tag", () => {
    installMatchMedia(false);
    useThemeStore.getState().reset();

    render(
      <ThemeController>
        <div>theme</div>
      </ThemeController>,
    );

    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      LIGHT_THEME_COLOR,
    );

    act(() => {
      useThemeStore.getState().setPreference("dark");
    });

    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      DARK_THEME_COLOR,
    );
  });

  it("keeps the current route selection when the theme changes", () => {
    useAppStore.setState({
      selectedStationId: "geologicheskaya",
      selectedDirectionId: "to-botanicheskaya",
      selectedDestinationId: "botanicheskaya",
    });

    useThemeStore.getState().setPreference("dark");

    expect(useAppStore.getState().selectedStationId).toBe("geologicheskaya");
    expect(useAppStore.getState().selectedDirectionId).toBe("to-botanicheskaya");
    expect(useAppStore.getState().selectedDestinationId).toBe("botanicheskaya");
  });

  it("keeps preference and resolved theme separate", () => {
    expect(resolveTheme("system", "dark")).toBe("dark");
    expect(resolveTheme("light", "dark")).toBe("light");
  });
});
