import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { useAppStore } from "../app/store";
import { TrainsPage } from "./TrainsPage";

describe("TrainsPage component", () => {
  beforeEach(() => {
    useAppStore.setState({
      screen: "trains",
      selectedStationId: null,
      selectedDirectionId: null,
      selectedDestinationId: null,
      isDirectionModalOpen: false,
    });
  });

  it("shows empty state when no station is selected", () => {
    render(<TrainsPage />);

    expect(screen.getByText("Станция не выбрана")).toBeInTheDocument();

    // Check navigation to stations
    const btn = screen.getByRole("button", { name: "Выбрать станцию" });
    fireEvent.click(btn);
    expect(useAppStore.getState().screen).toBe("stations");
  });

  it("shows station details perfectly for intermediate station", () => {
    useAppStore.setState({
      selectedStationId: "uralskaya",
      selectedDirectionId: "to-botanicheskaya",
    });

    render(<TrainsPage />);

    expect(screen.getByText("Уральская")).toBeInTheDocument();

    // Next station for Uralsakaya -> Botanicheskaya should be Dinamo
    expect(screen.getByText("Динамо")).toBeInTheDocument();

    // Change direction
    const btn = screen.getByRole("button", { name: /К Пр. Космонавтов/i });
    fireEvent.click(btn);

    expect(useAppStore.getState().selectedDirectionId).toBe("to-prospekt-kosmonavtov");
  });

  it("handles terminus properly", () => {
    useAppStore.setState({
      selectedStationId: "botanicheskaya",
      selectedDirectionId: "to-prospekt-kosmonavtov",
    });

    render(<TrainsPage />);

    expect(screen.getByText("Ботаническая")).toBeInTheDocument();
    // Only one direction, verify it shows the direction text.
    expect(screen.getByText(/В сторону Проспекта Космонавтов/i)).toBeInTheDocument();
  });
});
