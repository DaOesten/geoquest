import { describe, it, expect, beforeEach, vi } from "vitest";
import { getProgress, saveProgress, markStationVisited, markStationCompleted, markTaskSolved, isStationVisited, isStationCompleted, isTaskSolved, deleteProgress, getQuestListStatus } from "./quest-progress";

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
        completedStations: ["s1"],
        solvedTasks: { s1: [0, 1] },
        currentScreen: "stations" as const,
        lastStationIndex: 1,
      };
      saveProgress("quest-1", progress);
      expect(getProgress("quest-1")).toEqual(progress);
    });

    it("uses quest-specific keys", () => {
      saveProgress("q1", { visitedStations: ["a"], completedStations: [], solvedTasks: {}, currentScreen: "intro", lastStationIndex: 0 });
      saveProgress("q2", { visitedStations: ["b"], completedStations: [], solvedTasks: {}, currentScreen: "stations", lastStationIndex: 0 });
      expect(getProgress("q1")?.visitedStations).toEqual(["a"]);
      expect(getProgress("q2")?.visitedStations).toEqual(["b"]);
    });

    it("returns null for corrupt JSON", () => {
      store.set("gq_progress_bad", "not-json{{{");
      expect(getProgress("bad")).toBeNull();
    });

    it("fills missing fields with defaults for old format", () => {
      store.set("gq_progress_old", JSON.stringify({ visitedStations: ["s1"], currentScreen: "stations", lastStationIndex: 0 }));
      const p = getProgress("old");
      expect(p?.completedStations).toEqual([]);
      expect(p?.solvedTasks).toEqual({});
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

  describe("markStationCompleted", () => {
    it("creates progress if none exists", () => {
      markStationCompleted("quest-new", "station-1");
      const p = getProgress("quest-new");
      expect(p?.completedStations).toEqual(["station-1"]);
    });

    it("does not duplicate station IDs", () => {
      markStationCompleted("q", "s1");
      markStationCompleted("q", "s1");
      expect(getProgress("q")?.completedStations).toEqual(["s1"]);
    });
  });

  describe("markTaskSolved", () => {
    it("creates progress and marks task", () => {
      markTaskSolved("q", "s1", 0);
      const p = getProgress("q");
      expect(p?.solvedTasks["s1"]).toEqual([0]);
    });

    it("appends multiple tasks for same station", () => {
      markTaskSolved("q", "s1", 0);
      markTaskSolved("q", "s1", 2);
      expect(getProgress("q")?.solvedTasks["s1"]).toEqual([0, 2]);
    });

    it("does not duplicate module indices", () => {
      markTaskSolved("q", "s1", 0);
      markTaskSolved("q", "s1", 0);
      expect(getProgress("q")?.solvedTasks["s1"]).toEqual([0]);
    });
  });

  describe("isStationVisited / isStationCompleted / isTaskSolved", () => {
    it("returns false when no progress exists", () => {
      expect(isStationVisited("q", "s1")).toBe(false);
      expect(isStationCompleted("q", "s1")).toBe(false);
      expect(isTaskSolved("q", "s1", 0)).toBe(false);
    });

    it("returns true for visited station", () => {
      markStationVisited("q", "s1");
      expect(isStationVisited("q", "s1")).toBe(true);
    });

    it("returns true for completed station", () => {
      markStationCompleted("q", "s1");
      expect(isStationCompleted("q", "s1")).toBe(true);
    });

    it("returns true for solved task", () => {
      markTaskSolved("q", "s1", 2);
      expect(isTaskSolved("q", "s1", 2)).toBe(true);
      expect(isTaskSolved("q", "s1", 0)).toBe(false);
    });
  });

  describe("deleteProgress", () => {
    it("removes the stored progress entry", () => {
      markStationVisited("q", "s1");
      expect(getProgress("q")).not.toBeNull();
      deleteProgress("q");
      expect(getProgress("q")).toBeNull();
    });

    it("does nothing when no progress exists", () => {
      expect(() => deleteProgress("never-played")).not.toThrow();
    });
  });

  describe("getQuestListStatus", () => {
    it("returns 'new' when no progress exists", () => {
      expect(getQuestListStatus(null, 5)).toBe("new");
    });

    it("returns 'new' when no station has been visited yet", () => {
      const progress = { visitedStations: [], completedStations: [], solvedTasks: {}, currentScreen: "intro" as const, lastStationIndex: 0 };
      expect(getQuestListStatus(progress, 5)).toBe("new");
    });

    it("returns 'live' when at least one station is visited but not all completed", () => {
      const progress = { visitedStations: ["s1"], completedStations: ["s1"], solvedTasks: {}, currentScreen: "stations" as const, lastStationIndex: 1 };
      expect(getQuestListStatus(progress, 5)).toBe("live");
    });

    it("returns 'done' when all stations are completed", () => {
      const progress = { visitedStations: ["s1", "s2"], completedStations: ["s1", "s2"], solvedTasks: {}, currentScreen: "stations" as const, lastStationIndex: 1 };
      expect(getQuestListStatus(progress, 2)).toBe("done");
    });
  });
});
