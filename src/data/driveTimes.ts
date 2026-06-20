import type { DriveTime } from "../domain/metro/metro.types";

// Base travel times in seconds between adjacent stations, including stops.
export const driveTimes: DriveTime[] = [
  // To Botanicheskaya
  { from: "prospekt-kosmonavtov", to: "uralmash", timeSeconds: 120 },
  { from: "uralmash", to: "mashinostroiteley", timeSeconds: 120 },
  { from: "mashinostroiteley", to: "uralskaya", timeSeconds: 180 },
  { from: "uralskaya", to: "dinamo", timeSeconds: 120 },
  { from: "dinamo", to: "ploshchad-1905-goda", timeSeconds: 120 },
  { from: "ploshchad-1905-goda", to: "geologicheskaya", timeSeconds: 120 },
  { from: "geologicheskaya", to: "chkalovskaya", timeSeconds: 180 },
  { from: "chkalovskaya", to: "botanicheskaya", timeSeconds: 180 },

  // To Prospekt Kosmonavtov
  { from: "botanicheskaya", to: "chkalovskaya", timeSeconds: 180 },
  { from: "chkalovskaya", to: "geologicheskaya", timeSeconds: 180 },
  { from: "geologicheskaya", to: "ploshchad-1905-goda", timeSeconds: 120 },
  { from: "ploshchad-1905-goda", to: "dinamo", timeSeconds: 120 },
  { from: "dinamo", to: "uralskaya", timeSeconds: 120 },
  { from: "uralskaya", to: "mashinostroiteley", timeSeconds: 180 },
  { from: "mashinostroiteley", to: "uralmash", timeSeconds: 120 },
  { from: "uralmash", to: "prospekt-kosmonavtov", timeSeconds: 120 },
];
