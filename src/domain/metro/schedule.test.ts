import { afterEach, describe, expect, it } from "vitest";

import { specialDates } from "../../data/specialDates";
import type { MetroTime } from "../time";
import {
  getUpcomingTrains,
  resolveDaySchedule,
  resolveMetroState,
  resolveMetroStateFromSchedules,
} from "./schedule.service";

const MOCK_TIME: MetroTime = {
  dateString: "2024-01-01",
  dayOfWeek: 1,
  isWeekend: false,
  hours: 12,
  minutes: 0,
  seconds: 0,
  totalSeconds: 12 * 3600,
};

const MOCK_SCHEDULE = ["11:50", "11:58", "12:05", "12:10", "12:15", "12:20", "12:25"];

afterEach(() => {
  specialDates.length = 0;
});

describe("Schedule Service", () => {
  it("finds next trains correctly", () => {
    const result = getUpcomingTrains(MOCK_SCHEDULE, MOCK_TIME);
    expect(result.status).toBe("ok");
    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.nearest?.status).toBe("waiting");
    expect(result.next.map((train) => train.scheduleTime)).toEqual([
      "12:10",
      "12:15",
      "12:20",
      "12:25",
    ]);
  });

  it("limits the secondary list to four trains after the nearest one", () => {
    const result = getUpcomingTrains(
      ["11:55", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30"],
      MOCK_TIME,
    );

    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.next).toHaveLength(4);
    expect(result.next.map((train) => train.scheduleTime)).toEqual([
      "12:10",
      "12:15",
      "12:20",
      "12:25",
    ]);
  });

  it("returns fewer than four trains when fewer future trains remain", () => {
    const result = getUpcomingTrains(["11:55", "12:05", "12:10", "12:15"], MOCK_TIME);

    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.next.map((train) => train.scheduleTime)).toEqual(["12:10", "12:15"]);
  });

  it("handles empty schedule", () => {
    const result = getUpcomingTrains([], MOCK_TIME);
    expect(result.status).toBe("error");
  });

  it("handles approaching state (<= 30 seconds)", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 12 * 3600 + 4 * 60 + 40 };
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.nearest?.status).toBe("approaching");
    expect(result.nearest?.secondsLeft).toBe(20);
  });

  it("handles arriving state (0 to 15 seconds after)", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 12 * 3600 + 5 * 60 + 5 };
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.nearest?.status).toBe("arriving");
    expect(result.nearest?.secondsLeft).toBe(-5);
  });

  it("does not mark a regular nearest train as the last one", () => {
    const result = getUpcomingTrains(["12:05", "12:10"], MOCK_TIME);

    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.nearest?.isLastTrain).toBe(false);
  });

  it("marks the nearest train as the last one during waiting, approaching and arriving", () => {
    const waiting = getUpcomingTrains(["12:05"], MOCK_TIME);
    const approaching = getUpcomingTrains(["12:05"], {
      totalSeconds: 12 * 3600 + 4 * 60 + 40,
    });
    const arriving = getUpcomingTrains(["12:05"], {
      totalSeconds: 12 * 3600 + 5 * 60 + 5,
    });

    expect(waiting.nearest?.isLastTrain).toBe(true);
    expect(approaching.nearest?.status).toBe("approaching");
    expect(approaching.nearest?.isLastTrain).toBe(true);
    expect(arriving.nearest?.status).toBe("arriving");
    expect(arriving.nearest?.isLastTrain).toBe(true);
  });

  it("switches to next train after arriving window", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 12 * 3600 + 5 * 60 + 20 };
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.nearest?.scheduleTime).toBe("12:10");
    expect(result.nearest?.status).toBe("waiting");
    expect(result.next.map((train) => train.scheduleTime)).toEqual([
      "12:15",
      "12:20",
      "12:25",
    ]);
    expect(result.next.map((train) => train.scheduleTime)).not.toContain("12:10");
  });

  it("returns not_found if all trains passed", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 23 * 3600 };
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.status).toBe("not_found");
    expect(result.nearest).toBeNull();
  });

  it("keeps next-day calendar times readable after midnight", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      hours: 23,
      minutes: 58,
      totalSeconds: 23 * 3600 + 58 * 60,
    };
    const result = getUpcomingTrains(["23:55", "24:05", "24:31", "24:40"], time);

    expect(result.nearest?.displayTime).toBe("00:05");
    expect(result.next.map((train) => train.displayTime)).toEqual(["00:31", "00:40"]);
  });
});

describe("Operational day handling", () => {
  it("moves to after_close once the last train arrival window finishes", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-03",
      dayOfWeek: 3,
      isWeekend: false,
      hours: 23,
      minutes: 59,
      seconds: 16,
      totalSeconds: 23 * 3600 + 59 * 60 + 16,
    };

    const state = resolveMetroStateFromSchedules({
      currentSchedule: ["06:00", "23:59"],
      currentDayType: "weekday",
      currentDate: "2024-01-03",
      currentTime: time,
      nextSchedule: ["06:10", "23:30"],
      nextDayType: "weekday",
      nextDate: "2024-01-04",
      previousSchedule: ["06:00", "23:40"],
      previousDayType: "weekday",
      previousDate: "2024-01-02",
    });

    expect(state.status).toBe("after_close");
    expect(state.nearest).toBeNull();
    expect(state.firstTrain?.displayTime).toBe("06:10");
  });

  it("keeps previous operational day active after midnight while the last train is arriving", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-06",
      dayOfWeek: 6,
      isWeekend: true,
      hours: 0,
      minutes: 0,
      seconds: 5,
      totalSeconds: 5,
    };

    const state = resolveMetroState("prospekt-kosmonavtov", "to-botanicheskaya", time);

    expect(state.status).toBe("running");
    expect(state.isPreviousOperationalDay).toBe(true);
    expect(state.operationalDate).toBe("2024-01-05");
    expect(state.nearest?.scheduleTime).toBe("24:02");
    expect(state.nearest?.status).toBe("waiting");
    expect(state.dayType).toBe("weekday");
  });

  it("shows before_open after midnight when previous operational day has already finished", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-06",
      dayOfWeek: 6,
      isWeekend: true,
      hours: 0,
      minutes: 20,
      seconds: 0,
      totalSeconds: 20 * 60,
    };

    const state = resolveMetroState("prospekt-kosmonavtov", "to-botanicheskaya", time);

    expect(state.status).toBe("before_open");
    expect(state.isPreviousOperationalDay).toBe(false);
    expect(state.operationalDate).toBe("2024-01-06");
    expect(state.firstTrain?.displayTime).toBe("05:49");
    expect(state.secondsUntilFirstTrain).toBe(5 * 3600 + 29 * 60);
    expect(state.dayType).toBe("weekend");
  });

  it("switches to after_close and points to the first train of the next day", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-03",
      dayOfWeek: 3,
      isWeekend: false,
      hours: 23,
      minutes: 50,
      seconds: 0,
      totalSeconds: 23 * 3600 + 50 * 60,
    };

    const state = resolveMetroStateFromSchedules({
      currentSchedule: ["06:00", "23:40"],
      currentDayType: "weekday",
      currentDate: "2024-01-03",
      currentTime: time,
      nextSchedule: ["06:10", "23:30"],
      nextDayType: "weekday",
      nextDate: "2024-01-04",
      previousSchedule: ["06:00", "23:50"],
      previousDayType: "weekday",
      previousDate: "2024-01-02",
    });

    expect(state.status).toBe("after_close");
    expect(state.firstTrain?.displayTime).toBe("06:10");
    expect(state.secondsUntilFirstTrain).toBe(6 * 3600 + 20 * 60);
    expect(state.operationalDate).toBe("2024-01-04");
  });

  it("returns a readable error when schedule data is missing", () => {
    const state = resolveMetroStateFromSchedules({
      currentSchedule: null,
      currentDayType: "weekday",
      currentDate: "2024-01-03",
      currentTime: MOCK_TIME,
    });

    expect(state.status).toBe("error");
    expect(state.message).toMatch(/Расписание/);
  });
});

describe("Day schedule resolution", () => {
  it("returns the full weekday schedule in operational order", () => {
    const result = resolveDaySchedule(
      "geologicheskaya",
      "to-botanicheskaya",
      MOCK_TIME,
      "weekday",
    );

    expect(result.status).toBe("ok");
    expect(result.trains[0]?.sourceTime).toBe("06:02");
    expect(result.trains.at(-1)?.sourceTime).toBe("24:15");
    expect(result.trains.slice(-2).map((train) => train.displayTime)).toEqual([
      "00:01",
      "00:15",
    ]);
  });

  it("returns the full weekend schedule in operational order", () => {
    const result = resolveDaySchedule(
      "geologicheskaya",
      "to-botanicheskaya",
      MOCK_TIME,
      "weekend",
    );

    expect(result.status).toBe("ok");
    expect(result.trains.slice(0, 4).map((train) => train.sourceTime)).toEqual([
      "06:02",
      "06:14",
      "06:26",
      "06:38",
    ]);
  });

  it("gives a special date higher priority than the weekday or weekend default", () => {
    specialDates.push({
      date: "2024-01-06",
      type: "weekday",
      reason: "Тест",
    });

    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-06",
      dayOfWeek: 6,
      isWeekend: true,
      hours: 12,
      minutes: 0,
      totalSeconds: 12 * 3600,
    };
    const result = resolveDaySchedule(
      "geologicheskaya",
      "to-botanicheskaya",
      time,
      "today",
    );

    expect(result.dayType).toBe("special");
    expect(result.scheduleDayType).toBe("weekday");
    expect(result.trains[1]?.sourceTime).toBe("06:10");
  });

  it("marks the first, last and nearest train consistently", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-05",
      dayOfWeek: 5,
      isWeekend: false,
      hours: 18,
      minutes: 24,
      totalSeconds: 18 * 3600 + 24 * 60,
    };
    const result = resolveDaySchedule(
      "geologicheskaya",
      "to-botanicheskaya",
      time,
      "today",
    );

    expect(result.firstTrain?.sourceTime).toBe("06:02");
    expect(result.lastTrain?.sourceTime).toBe("24:15");
    expect(result.lastTrain?.isLast).toBe(true);
    expect(result.nextTrain?.sourceTime).toBe("18:27");
    expect(result.trains.find((train) => train.sourceTime === "18:22")?.isPast).toBe(
      true,
    );
  });

  it("keeps after-midnight trains at the end and groups them separately", () => {
    const result = resolveDaySchedule(
      "geologicheskaya",
      "to-botanicheskaya",
      MOCK_TIME,
      "weekday",
    );

    expect(result.trains.slice(-2).map((train) => train.sourceTime)).toEqual([
      "24:01",
      "24:15",
    ]);
    expect(result.trains.slice(-2).map((train) => train.displayTime)).toEqual([
      "00:01",
      "00:15",
    ]);
    expect(result.groups.at(-1)?.isAfterMidnight).toBe(true);
    expect(result.groups.at(-1)?.displayHour).toBe("00");
  });

  it("returns a safe error state when schedule data is missing", () => {
    const result = resolveDaySchedule(
      "botanicheskaya",
      "to-botanicheskaya",
      MOCK_TIME,
      "weekday",
    );

    expect(result.status).toBe("error");
    expect(result.trains).toHaveLength(0);
    expect(result.message).toMatch(/расписание/i);
  });

  it("uses the previous operational day after midnight on friday night", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-06",
      dayOfWeek: 6,
      isWeekend: true,
      hours: 0,
      minutes: 0,
      seconds: 5,
      totalSeconds: 5,
    };
    const result = resolveDaySchedule(
      "prospekt-kosmonavtov",
      "to-botanicheskaya",
      time,
      "today",
    );

    expect(result.isPreviousOperationalDay).toBe(true);
    expect(result.serviceDate).toBe("2024-01-05");
    expect(result.nextTrain?.sourceTime).toBe("24:02");
  });

  it("uses the previous operational day after midnight on sunday night", () => {
    const time: MetroTime = {
      ...MOCK_TIME,
      dateString: "2024-01-08",
      dayOfWeek: 1,
      isWeekend: false,
      hours: 0,
      minutes: 0,
      seconds: 5,
      totalSeconds: 5,
    };
    const result = resolveDaySchedule(
      "prospekt-kosmonavtov",
      "to-botanicheskaya",
      time,
      "today",
    );

    expect(result.isPreviousOperationalDay).toBe(true);
    expect(result.serviceDate).toBe("2024-01-07");
    expect(result.dayType).toBe("weekend");
  });

  it("does not depend on the current time in weekday or weekend modes", () => {
    const midday = resolveDaySchedule(
      "geologicheskaya",
      "to-botanicheskaya",
      MOCK_TIME,
      "weekday",
    );
    const lateNight = resolveDaySchedule(
      "geologicheskaya",
      "to-botanicheskaya",
      {
        ...MOCK_TIME,
        hours: 23,
        minutes: 58,
        totalSeconds: 23 * 3600 + 58 * 60,
      },
      "weekday",
    );

    expect(midday.nextTrain).toBeNull();
    expect(lateNight.nextTrain).toBeNull();
    expect(midday.trains.map((train) => train.sourceTime)).toEqual(
      lateNight.trains.map((train) => train.sourceTime),
    );
  });
});
