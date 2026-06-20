import { create } from "zustand";

import type { AppScreen } from "./app.types";
import type { StationId, DirectionId } from "../domain/metro/metro.types";

interface AppState {
  screen: AppScreen;
  showSeconds: boolean;
  selectedStationId: StationId | null;
  selectedDirectionId: DirectionId | null;
  selectedDestinationId: StationId | null;
  isDirectionModalOpen: boolean;

  setScreen: (screen: AppScreen) => void;
  setShowSeconds: (showSeconds: boolean) => void;
  selectStation: (stationId: StationId) => void;
  selectDirection: (directionId: DirectionId) => void;
  openDirectionModal: () => void;
  closeDirectionModal: () => void;
  clearSelection: () => void;
}

const readShowSeconds = (): boolean => {
  try {
    const savedValue = window.localStorage.getItem("metro-show-seconds");

    if (savedValue === null) {
      return true;
    }

    return savedValue === "true";
  } catch {
    return true;
  }
};

export const useAppStore = create<AppState>((set) => ({
  screen: "stations",
  showSeconds: readShowSeconds(),
  selectedStationId: null,
  selectedDirectionId: null,
  selectedDestinationId: null,
  isDirectionModalOpen: false,

  setScreen: (screen) => {
    set({ screen });
  },

  setShowSeconds: (showSeconds) => {
    try {
      window.localStorage.setItem("metro-show-seconds", String(showSeconds));
    } catch {
      // Приложение продолжает работать,
      // даже если LocalStorage недоступен.
    }

    set({ showSeconds });
  },

  selectStation: (stationId) => {
    set({
      selectedStationId: stationId,
      selectedDirectionId: null,
      selectedDestinationId: null,
    });
  },

  selectDirection: (directionId) => {
    set({
      selectedDirectionId: directionId,
      selectedDestinationId: null,
      isDirectionModalOpen: false,
    });
  },

  openDirectionModal: () => set({ isDirectionModalOpen: true }),
  closeDirectionModal: () => set({ isDirectionModalOpen: false }),

  clearSelection: () => {
    set({
      selectedStationId: null,
      selectedDirectionId: null,
      selectedDestinationId: null,
      isDirectionModalOpen: false,
    });
  },
}));
