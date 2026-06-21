import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useAppStore } from "../app/store";
import { useThemeStore } from "../app/theme-store";
import { SettingsPage } from "./SettingsPage";

const { reportIssue } = vi.hoisted(() => ({
  reportIssue: vi.fn(),
}));

vi.mock("../lib/userActions", () => ({
  reportIssue,
  shareApp: vi.fn().mockResolvedValue("copied"),
}));

vi.mock("../app/usePwa", () => ({
  usePwa: () => ({
    checkForUpdates: vi.fn(),
    isCheckingForUpdates: false,
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      screen: "settings",
      showSeconds: true,
      selectedStationId: "geologicheskaya",
      selectedDirectionId: "to-botanicheskaya",
      selectedDestinationId: "botanicheskaya",
      isDirectionModalOpen: false,
      isDestinationSheetOpen: false,
      activeToast: null,
    });
    useThemeStore.getState().reset();
  });

  it("toggles seconds and keeps the setting in store", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const switchButton = screen.getByRole("switch", { name: "Показывать секунды" });
    await user.click(switchButton);

    expect(useAppStore.getState().showSeconds).toBe(false);
    expect(useAppStore.getState().activeToast?.message).toBe("Настройка сохранена");
  });

  it("navigates to helper screens from settings", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /Как установить/i }));
    expect(useAppStore.getState().screen).toBe("install");

    useAppStore.setState({ screen: "settings" });
    await user.click(screen.getByRole("button", { name: /О приложении/i }));
    expect(useAppStore.getState().screen).toBe("about");
  });

  it("opens GitHub Issues for support", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /Сообщить об ошибке/i }));

    expect(reportIssue).toHaveBeenCalledWith({
      stationId: "geologicheskaya",
      directionId: "to-botanicheskaya",
      destinationId: "botanicheskaya",
      metroState: null,
    });
  });

  it("shows all three theme options with radio semantics", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const themeGroup = screen.getByRole("radiogroup", { name: "Тема приложения" });
    expect(themeGroup).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Автоматически" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await user.click(screen.getByRole("radio", { name: "Светлая" }));

    expect(useThemeStore.getState().preference).toBe("light");
    expect(screen.getByRole("radio", { name: "Светлая" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
