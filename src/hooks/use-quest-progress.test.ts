/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuestProgress } from "./use-quest-progress";
import type { Station } from "@/lib/quest-schema";

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

function makeStation(id: string): Station {
  return {
    id,
    name: id,
    lat: 0,
    lng: 0,
    radiusMeters: 10,
    modules: [{ type: "text", content: "x" }],
  };
}

const stations: Station[] = [makeStation("s1"), makeStation("s2"), makeStation("s3")];

describe("useQuestProgress", () => {
  beforeEach(() => {
    store.clear();
  });

  it("marks the first station as current and the rest locked with no progress", () => {
    const { result } = renderHook(() => useQuestProgress("q1", stations));
    expect(result.current.getStationStatus(stations[0], 0)).toBe("current");
    expect(result.current.getStationStatus(stations[1], 1)).toBe("locked");
    expect(result.current.getStationStatus(stations[2], 2)).toBe("locked");
    expect(result.current.getCurrentStationIndex()).toBe(0);
    expect(result.current.hasExistingProgress).toBe(false);
  });

  it("marks a visited-but-not-completed station as visited, not current", () => {
    const { result } = renderHook(() => useQuestProgress("q1", stations));
    act(() => result.current.visitStation("s1"));
    expect(result.current.getStationStatus(stations[0], 0)).toBe("visited");
    expect(result.current.hasExistingProgress).toBe(true);
  });

  it("keeps the next station locked until the current one is completed (not just visited)", () => {
    const { result } = renderHook(() => useQuestProgress("q1", stations));
    act(() => result.current.visitStation("s1"));
    // s1 visited but not completed -> s2 must stay locked, not unlock early
    expect(result.current.getStationStatus(stations[1], 1)).toBe("locked");
  });

  it("unlocks the next station as current once the previous one is completed", () => {
    const { result } = renderHook(() => useQuestProgress("q1", stations));
    act(() => {
      result.current.visitStation("s1");
      result.current.completeStation("s1");
    });
    expect(result.current.getStationStatus(stations[0], 0)).toBe("completed");
    expect(result.current.getStationStatus(stations[1], 1)).toBe("current");
    expect(result.current.getCurrentStationIndex()).toBe(1);
  });

  it("returns the last index from getCurrentStationIndex once all stations are completed", () => {
    const { result } = renderHook(() => useQuestProgress("q1", stations));
    act(() => {
      result.current.completeStation("s1");
      result.current.completeStation("s2");
      result.current.completeStation("s3");
    });
    expect(result.current.getCurrentStationIndex()).toBe(2);
    expect(result.current.getStationStatus(stations[2], 2)).toBe("completed");
  });

  it("tracks solved tasks per station and persists them", () => {
    const { result } = renderHook(() => useQuestProgress("q1", stations));
    act(() => result.current.solveTask("s1", 0));
    expect(result.current.isTaskSolved("s1", 0)).toBe(true);
    expect(result.current.isTaskSolved("s1", 1)).toBe(false);

    const { result: reloaded } = renderHook(() => useQuestProgress("q1", stations));
    expect(reloaded.current.isTaskSolved("s1", 0)).toBe(true);
  });

  it("resumes existing progress from localStorage on mount", () => {
    const { result } = renderHook(() => useQuestProgress("q1", stations));
    act(() => {
      result.current.visitStation("s1");
      result.current.completeStation("s1");
    });

    const { result: reloaded } = renderHook(() => useQuestProgress("q1", stations));
    expect(reloaded.current.hasExistingProgress).toBe(true);
    expect(reloaded.current.getStationStatus(stations[0], 0)).toBe("completed");
    expect(reloaded.current.getStationStatus(stations[1], 1)).toBe("current");
  });
});
