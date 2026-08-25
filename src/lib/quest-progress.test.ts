import { describe, it, expect, beforeEach, vi } from "vitest";
import { getProgress, saveProgress, markStationVisited, isStationVisited } from "./quest-progress";

const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  get length() { return store.size; },
  key: (_i: number) => null,
};

vi.stubGlobal("localStorage", mockLocalStorage);

describe("quest-progress", () => {
  beforeEach(() => {
    store.clear();
  });

  describe("getProgress / saveProgress", () => {
    it("returns null when no progress exists", () => {
      expect(getProgress("quest-1")).toBeNull();
    });

    it("saves and retrieves progress", () => {
      const progress = {
        visitedStations: ["s1", "s2"],
        currentScreen: "stations" as const,
        lastStationIndex: 1,
      };
      saveProgress("quest-1", progress);
      expect(getProgress("quest-1")).toEqual(progress);
    });

    it("uses quest-specific keys", () => {
      saveProgress("q1", { visitedStations: ["a"], currentScreen: "intro", lastStationIndex: 0 });
      saveProgress("q2", { visitedStations: ["b"], currentScreen: "stations", lastStationIndex: 0 });
      expect(getProgress("q1")?.visitedStations).toEqual(["a"]);
      expect(getProgress("q2")?.visitedStations).toEqual(["b"]);
    });

    it("returns null for corrupt JSON", () => {
      store.set("gq_progress_bad", "not-json{{{");
      expect(getProgress("bad")).toBeNull();
    });
  });

  describe("markStationVisited", () => {
    it("creates progress if none exists", () => {
      markStationVisited("quest-new", "station-1");
      const p = getProgress("quest-new");
      expect(p?.visitedStations).toEqual(["station-1"]);
    });

    it("appends to existing visited stations", () => {
      markStationVisited("q", "s1");
      markStationVisited("q", "s2");
      expect(getProgress("q")?.visitedStations).toEqual(["s1", "s2"]);
    });

    it("does not duplicate station IDs", () => {
      markStationVisited("q", "s1");
      markStationVisited("q", "s1");
      expect(getProgress("q")?.visitedStations).toEqual(["s1"]);
    });
  });

  describe("isStationVisited", () => {
    it("returns false when no progress exists", () => {
      expect(isStationVisited("q", "s1")).toBe(false);
    });

    it("returns true for visited station", () => {
      markStationVisited("q", "s1");
      expect(isStationVisited("q", "s1")).toBe(true);
    });

    it("returns false for unvisited station", () => {
      markStationVisited("q", "s1");
      expect(isStationVisited("q", "s2")).toBe(false);
    });
  });
});
