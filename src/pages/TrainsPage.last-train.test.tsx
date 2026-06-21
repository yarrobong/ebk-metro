import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { useAppStore } from "../app/store";
import type { DayScheduleResult, MetroServiceState } from "../domain/metro";
import { TrainsPage } from "./TrainsPage";

const { resolveMetroStateMock, resolveDayScheduleMock } = vi.hoisted(() => ({
  resolveMetroStateMock: vi.fn(),
  resolveDayScheduleMock: vi.fn(),
}));

vi.mock("../app/hooks/useLiveMetroTime", () => ({
  useLiveMetroTime: () => ({
    dateString: "2024-01-05",
    dayOfWeek: 5,
    isWeekend: false,
    hours: 23,
    minutes: 58,
    seconds: 0,
    totalSeconds: 23 * 3600 + 58 * 60,
  }),
}));

vi.mock("../app/usePwa", () => ({
  usePwa: () => ({
    installMethod: "manual",
    shouldShowInstallPrompt: false,
    dismissInstallPrompt: vi.fn(),
    openInstallPrompt: vi.fn(),
  }),
}));

vi.mock("../domain/metro/schedule.service", () => {
  return {
    resolveMetroState: resolveMetroStateMock,
    resolveDaySchedule: resolveDayScheduleMock,
  };
});

function createMetroState(overrides: Partial<MetroServiceState> = {}): MetroServiceState {
  return {
    status: "running",
    dayType: "weekday",
    scheduleDayType: "weekday",
    operationalDate: "2024-01-05",
    isPreviousOperationalDay: false,
    nearest: {
      scheduleTime: "24:05",
      displayTime: "00:05",
      totalSeconds: 24 * 3600 + 5 * 60,
      secondsLeft: 7 * 60,
      status: "waiting",
      isLastTrain: true,
      originalIndex: 9,
    },
    next: [],
    firstTrain: null,
    lastTrain: null,
    secondsUntilFirstTrain: null,
    ...overrides,
  };
}

function createDayScheduleResult(
  overrides: Partial<DayScheduleResult> = {},
): DayScheduleResult {
  return {
    stationId: "geologicheskaya",
    directionId: "to-botanicheskaya",
    mode: "today",
    status: "ok",
    serviceDate: "2024-01-05",
    dayType: "weekday",
    scheduleDayType: "weekday",
    trains: [],
    groups: [],
    firstTrain: {
      sourceTime: "06:02",
      displayTime: "06:02",
      operationalMinutes: 6 * 60 + 2,
      displayHour: 6,
      displayMinute: 2,
      isAfterMidnight: false,
      isPast: true,
      isNext: false,
      isCurrent: false,
      isLast: false,
      secondsFromNow: -1,
    },
    lastTrain: {
      sourceTime: "24:05",
      displayTime: "00:05",
      operationalMinutes: 24 * 60 + 5,
      displayHour: 0,
      displayMinute: 5,
      isAfterMidnight: true,
      isPast: false,
      isNext: true,
      isCurrent: false,
      isLast: true,
      secondsFromNow: 420,
    },
    nextTrain: null,
    totalCount: 120,
    isPreviousOperationalDay: false,
    ...overrides,
  };
}

describe("TrainsPage last train states", () => {
  beforeEach(() => {
    useAppStore.setState({
      screen: "trains",
      selectedStationId: "geologicheskaya",
      selectedDirectionId: "to-botanicheskaya",
      selectedDestinationId: null,
      isDirectionModalOpen: false,
      isDestinationSheetOpen: false,
      activeToast: null,
    });

    resolveMetroStateMock.mockReset();
    resolveDayScheduleMock.mockReset();
    resolveDayScheduleMock.mockReturnValue(createDayScheduleResult());
  });

  it("shows the last-train explanation for the nearest train", () => {
    resolveMetroStateMock.mockReturnValue(createMetroState());

    render(<TrainsPage />);

    expect(screen.getByText("Последний поезд")).toBeInTheDocument();
    expect(
      screen.getByText("После него поездов по этому направлению сегодня больше не будет"),
    ).toBeInTheDocument();
  });

  it("marks the last upcoming train in the secondary list", () => {
    resolveMetroStateMock.mockReturnValue(
      createMetroState({
        nearest: {
          scheduleTime: "23:58",
          displayTime: "23:58",
          totalSeconds: 23 * 3600 + 58 * 60,
          secondsLeft: 0,
          status: "arriving",
          isLastTrain: false,
          originalIndex: 8,
        },
        next: [
          {
            scheduleTime: "24:05",
            displayTime: "00:05",
            totalSeconds: 24 * 3600 + 5 * 60,
            secondsLeft: 7 * 60,
            status: "waiting",
            isLastTrain: true,
            originalIndex: 9,
          },
        ],
      }),
    );

    render(<TrainsPage />);

    expect(screen.getByText("последний")).toBeInTheDocument();
  });
});
