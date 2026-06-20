import { describe, it, expect } from "vitest";

import {
  getStationById,
  getDirectionById,
  getAvailableDirections,
  getNextStation,
} from "./index";

describe("Metro Domain Logic", () => {
  it("should find station by id", () => {
    const station = getStationById("geologicheskaya");
    expect(station).toBeDefined();
    expect(station?.name).toBe("Геологическая");
  });

  it("should return undefined for unknown station", () => {
    // @ts-expect-error Testing invalid input
    const station = getStationById("unknown-station");
    expect(station).toBeUndefined();
  });

  it("should find direction by id", () => {
    const dir = getDirectionById("to-botanicheskaya");
    expect(dir).toBeDefined();
    expect(dir?.name).toBe("В сторону Ботанической");
  });

  it("should return available directions for a station", () => {
    // Intermediate station
    const dirs1 = getAvailableDirections("geologicheskaya");
    expect(dirs1.length).toBe(2);
    expect(dirs1).toContain("to-botanicheskaya");
    expect(dirs1).toContain("to-prospekt-kosmonavtov");

    // Terminus
    const dirs2 = getAvailableDirections("botanicheskaya");
    expect(dirs2.length).toBe(1);
    expect(dirs2).toContain("to-prospekt-kosmonavtov");
  });

  it("should determine next station correctly", () => {
    // intermediate -> target
    const next1 = getNextStation("geologicheskaya", "to-botanicheskaya");
    expect(next1?.id).toBe("chkalovskaya");

    const next2 = getNextStation("geologicheskaya", "to-prospekt-kosmonavtov");
    expect(next2?.id).toBe("ploshchad-1905-goda");

    // terminus -> target
    const next3 = getNextStation("prospekt-kosmonavtov", "to-botanicheskaya");
    expect(next3?.id).toBe("uralmash");

    const next4 = getNextStation("botanicheskaya", "to-prospekt-kosmonavtov");
    expect(next4?.id).toBe("chkalovskaya");
  });

  it("should return undefined for invalid next station requests", () => {
    // end of line
    const invalid1 = getNextStation("botanicheskaya", "to-botanicheskaya");
    expect(invalid1).toBeUndefined();

    const invalid2 = getNextStation("prospekt-kosmonavtov", "to-prospekt-kosmonavtov");
    expect(invalid2).toBeUndefined();
  });
});
