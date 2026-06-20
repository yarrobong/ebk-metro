import { describe, it, expect } from "vitest";
import { getUpcomingTrains } from "./schedule.service";
import type { MetroTime } from "../time";

const MOCK_TIME: MetroTime = {
  dateString: "2024-01-01",
  dayOfWeek: 1,
  isWeekend: false,
  hours: 12,
  minutes: 0,
  seconds: 0,
  totalSeconds: 12 * 3600,
};

const MOCK_SCHEDULE = [
  "11:50", "11:58", "12:05", "12:10", "12:15", "12:20", "12:25"
];

describe("Schedule Service", () => {
  it("finds next trains correctly", () => {
    const result = getUpcomingTrains(MOCK_SCHEDULE, MOCK_TIME);
    expect(result.status).toBe("ok");
    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.nearest?.status).toBe("waiting");
    expect(result.next.map(t => t.scheduleTime)).toEqual(["12:10", "12:15", "12:20", "12:25"]);
  });

  it("handles empty schedule", () => {
    const result = getUpcomingTrains([], MOCK_TIME);
    expect(result.status).toBe("error");
  });

  it("handles approaching state (<= 30 seconds)", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 12 * 3600 + 4 * 60 + 40 }; // 12:04:40
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.nearest?.status).toBe("approaching");
    expect(result.nearest?.secondsLeft).toBe(20);
  });

  it("handles arriving state (0 to 15 seconds after)", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 12 * 3600 + 5 * 60 + 5 }; // 12:05:05
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.nearest?.scheduleTime).toBe("12:05");
    expect(result.nearest?.status).toBe("arriving");
    expect(result.nearest?.secondsLeft).toBe(-5);
  });

  it("switches to next train after arriving window", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 12 * 3600 + 5 * 60 + 20 }; // 12:05:20
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.nearest?.scheduleTime).toBe("12:10"); // Switched to next!
    expect(result.nearest?.status).toBe("waiting");
  });

  it("returns not_found if all trains passed", () => {
    const time: MetroTime = { ...MOCK_TIME, totalSeconds: 23 * 3600 };
    const result = getUpcomingTrains(MOCK_SCHEDULE, time);
    expect(result.status).toBe("not_found");
    expect(result.nearest).toBeNull();
  });
});
