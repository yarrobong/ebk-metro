import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { useAppStore } from "./store";

describe("App", () => {
  beforeEach(() => {
    useAppStore.setState({
      screen: "stations",
      selectedStationId: null,
      selectedDirectionId: null,
      selectedDestinationId: null,
      isDirectionModalOpen: false,
    });
  });

  it("отображает экран выбора станции", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Выберите станцию",
      }),
    ).toBeInTheDocument();
  });

  it("navigates between main screens via bottom navigation", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Go to Settings
    await user.click(screen.getByText("Настройки"));
    expect(await screen.findByText("Показывать секунды")).toBeInTheDocument();

    // Go to About
    await user.click(screen.getByText("О приложении", { selector: "button *" }));
    expect(await screen.findByText("Метро Екатеринбурга")).toBeInTheDocument();

    // Go to Stations
    await user.click(screen.getByText("Станции"));
    expect(await screen.findByText("Выберите станцию")).toBeInTheDocument();
  });

  it("completes full E2E selection flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Select station 'Geologicheskaya'
    await user.click(screen.getByText("Геологическая"));

    // Select direction 'Botanicheskaya'
    const botanicalBtn = await screen.findByText("В сторону Ботанической");
    await user.click(botanicalBtn);

    // Verify Trains screen
    expect(await screen.findByText("Следующий поезд")).toBeInTheDocument();
    expect(screen.getByText("Геологическая")).toBeInTheDocument();
    expect(screen.getByText("Чкаловская")).toBeInTheDocument();

    // Change direction on Trains screen
    await user.click(screen.getByText("К Пр. Космонавтов"));

    // Validate next station changed to Ploshchad 1905 goda
    expect(await screen.findByText("Площадь 1905 года")).toBeInTheDocument();

    // Change station
    await user.click(screen.getByText("Изменить"));
    expect(screen.getByText("Выберите станцию")).toBeInTheDocument();

    // Pick Terminus
    await user.click(screen.getByText("Ботаническая"));

    // Ensure direction skipped straight to Trains
    expect(await screen.findByText("Следующий поезд")).toBeInTheDocument();
    expect(screen.getByText("Чкаловская")).toBeInTheDocument();
    expect(screen.queryByText("В сторону Проспекта Космонавтов")).toBeInTheDocument();
  });
});
