import { schedule } from "../../data/schedule";
import { specialDates } from "../../data/specialDates";
import { timeStringToSeconds } from "../time";
import type { MetroTime } from "../time";
import type { DayType, StationId, DirectionId } from "./metro.types";

export type TrainStatus = "waiting" | "approaching" | "arriving" | "not_found" | "error";

export interface NearestTrain {
  scheduleTime: string; // "18:27" or "24:10"
  displayTime: string; // "18:27" or "00:10"
  totalSeconds: number; // internal
  secondsLeft: number;
  status: TrainStatus;
  isLast: boolean;
  originalIndex: number;
}

export interface UpcomingTrains {
  nearest: NearestTrain | null;
  next: NearestTrain[];
  status: "ok" | "not_found" | "error";
  dayType: DayType;
}

export function getDayTypeForDate(dateString: string, isWeekend: boolean): DayType {
  const special = specialDates.find((d) => d.date === dateString);
  if (special) {
    return special.type;
  }
  return isWeekend ? "weekend" : "weekday";
}

export function getScheduleFor(
  stationId: StationId,
  directionId: DirectionId,
  dayType: DayType,
): string[] | null {
  const stSchedule = schedule[stationId];
  if (!stSchedule) return null;

  const dirSchedule = stSchedule[directionId];
  if (!dirSchedule) return null;

  const key = dayType === "weekend" ? "weekends" : "weekdays";
  return dirSchedule[key] || null;
}

const ARRIVAL_WINDOW_SECONDS = 15;
const APPROACHING_THRESHOLD_SECONDS = 30;

export function getUpcomingTrains(
  scheduleTimes: string[],
  metroTime: MetroTime,
): UpcomingTrains {
  if (!scheduleTimes || scheduleTimes.length === 0) {
    return { nearest: null, next: [], status: "error", dayType: "weekday" };
  }

  let nearestIdx = -1;
  let status: TrainStatus = "waiting";
  let secondsLeft = 0;

  for (let i = 0; i < scheduleTimes.length; i++) {
    const tSec = timeStringToSeconds(scheduleTimes[i]!);
    const diff = tSec - metroTime.totalSeconds;

    // Arriving state: time hasn't passed more than 15 seconds
    if (diff > -ARRIVAL_WINDOW_SECONDS) {
      nearestIdx = i;
      secondsLeft = diff;

      if (diff <= 0 && diff > -ARRIVAL_WINDOW_SECONDS) {
        status = "arriving";
      } else if (diff > 0 && diff <= APPROACHING_THRESHOLD_SECONDS) {
        status = "approaching";
      } else {
        status = "waiting";
      }
      break;
    }
  }

  if (nearestIdx === -1) {
    return { nearest: null, next: [], status: "not_found", dayType: "weekday" };
  }

  const parseDisplayTime = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(":");
    const dH = parseInt(hStr!, 10) % 24;
    return `${String(dH).padStart(2, "0")}:${mStr}`;
  };

  const nearestTimeStr = scheduleTimes[nearestIdx]!;
  const nearest: NearestTrain = {
    scheduleTime: nearestTimeStr,
    displayTime: parseDisplayTime(nearestTimeStr),
    totalSeconds: timeStringToSeconds(nearestTimeStr),
    secondsLeft,
    status,
    isLast: nearestIdx === scheduleTimes.length - 1,
    originalIndex: nearestIdx,
  };

  const nextTrains: NearestTrain[] = [];
  for (let i = nearestIdx + 1; i < nearestIdx + 5 && i < scheduleTimes.length; i++) {
    const tStr = scheduleTimes[i]!;
    nextTrains.push({
      scheduleTime: tStr,
      displayTime: parseDisplayTime(tStr),
      totalSeconds: timeStringToSeconds(tStr),
      secondsLeft: timeStringToSeconds(tStr) - metroTime.totalSeconds,
      status: "waiting",
      isLast: i === scheduleTimes.length - 1,
      originalIndex: i,
    });
  }

  return { nearest, next: nextTrains, status: "ok", dayType: "weekday" }; // dayType will be set later by caller
}
