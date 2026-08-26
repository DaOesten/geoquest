"use client";

import { useState, useCallback } from "react";
import { getProgress, saveProgress, markStationVisited, markStationCompleted, markTaskSolved, type QuestProgress } from "@/lib/quest-progress";
import type { Station } from "@/lib/quest-schema";

export type StationStatus = "completed" | "visited" | "current" | "locked";

export interface UseQuestProgressReturn {
  progress: QuestProgress;
  getStationStatus: (station: Station, index: number) => StationStatus;
  getCurrentStationIndex: () => number;
  visitStation: (stationId: string) => void;
  completeStation: (stationId: string) => void;
  solveTask: (stationId: string, moduleIndex: number) => void;
  isTaskSolved: (stationId: string, moduleIndex: number) => boolean;
  setScreen: (screen: QuestProgress["currentScreen"]) => void;
  hasExistingProgress: boolean;
}

export function useQuestProgress(questId: string, stations: Station[]): UseQuestProgressReturn {
  const [progress, setProgress] = useState<QuestProgress>(() => {
    return getProgress(questId) ?? {
      visitedStations: [],
      completedStations: [],
      solvedTasks: {},
      currentScreen: "intro",
      lastStationIndex: 0,
    };
  });

  const hasExistingProgress = progress.visitedStations.length > 0;

  const getStationStatus = useCallback(
    (station: Station, index: number): StationStatus => {
      if (progress.completedStations.includes(station.id)) return "completed";
      if (progress.visitedStations.includes(station.id)) return "visited";
      const firstUncompletedIndex = stations.findIndex(
        (s) => !progress.completedStations.includes(s.id)
      );
      if (index === firstUncompletedIndex) return "current";
      return "locked";
    },
    [progress.completedStations, progress.visitedStations, stations]
  );

  const getCurrentStationIndex = useCallback((): number => {
    const idx = stations.findIndex(
      (s) => !progress.completedStations.includes(s.id)
    );
    return idx === -1 ? stations.length - 1 : idx;
  }, [progress.completedStations, stations]);

  const visitStation = useCallback(
    (stationId: string) => {
      markStationVisited(questId, stationId);
      setProgress((prev) => ({
        ...prev,
        visitedStations: prev.visitedStations.includes(stationId)
          ? prev.visitedStations
          : [...prev.visitedStations, stationId],
      }));
    },
    [questId]
  );

  const completeStation = useCallback(
    (stationId: string) => {
      markStationCompleted(questId, stationId);
      setProgress((prev) => ({
        ...prev,
        completedStations: prev.completedStations.includes(stationId)
          ? prev.completedStations
          : [...prev.completedStations, stationId],
      }));
    },
    [questId]
  );

  const solveTask = useCallback(
    (stationId: string, moduleIndex: number) => {
      markTaskSolved(questId, stationId, moduleIndex);
      setProgress((prev) => {
        const existing = prev.solvedTasks[stationId] ?? [];
        if (existing.includes(moduleIndex)) return prev;
        return {
          ...prev,
          solvedTasks: {
            ...prev.solvedTasks,
            [stationId]: [...existing, moduleIndex],
          },
        };
      });
    },
    [questId]
  );

  const isTaskSolvedLocal = useCallback(
    (stationId: string, moduleIndex: number): boolean => {
      return progress.solvedTasks[stationId]?.includes(moduleIndex) ?? false;
    },
    [progress.solvedTasks]
  );

  const setScreen = useCallback(
    (screen: QuestProgress["currentScreen"]) => {
      setProgress((prev) => {
        const updated = { ...prev, currentScreen: screen };
        saveProgress(questId, updated);
        return updated;
      });
    },
    [questId]
  );

  return {
    progress,
    getStationStatus,
    getCurrentStationIndex,
    visitStation,
    completeStation,
    solveTask,
    isTaskSolved: isTaskSolvedLocal,
    setScreen,
    hasExistingProgress,
  };
}
