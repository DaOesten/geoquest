"use client";

import { useState, useCallback } from "react";
import { getProgress, saveProgress, markStationVisited, type QuestProgress } from "@/lib/quest-progress";
import type { Station } from "@/lib/quest-schema";

export type StationStatus = "visited" | "current" | "locked";

export interface UseQuestProgressReturn {
  progress: QuestProgress;
  getStationStatus: (station: Station, index: number) => StationStatus;
  getCurrentStationIndex: () => number;
  visitStation: (stationId: string) => void;
  setScreen: (screen: QuestProgress["currentScreen"]) => void;
  hasExistingProgress: boolean;
}

export function useQuestProgress(questId: string, stations: Station[]): UseQuestProgressReturn {
  const [progress, setProgress] = useState<QuestProgress>(() => {
    return getProgress(questId) ?? {
      visitedStations: [],
      currentScreen: "intro",
      lastStationIndex: 0,
    };
  });

  const hasExistingProgress = progress.visitedStations.length > 0;

  const getStationStatus = useCallback(
    (station: Station, index: number): StationStatus => {
      if (progress.visitedStations.includes(station.id)) return "visited";
      const firstUnvisitedIndex = stations.findIndex(
        (s) => !progress.visitedStations.includes(s.id)
      );
      if (index === firstUnvisitedIndex) return "current";
      return "locked";
    },
    [progress.visitedStations, stations]
  );

  const getCurrentStationIndex = useCallback((): number => {
    const idx = stations.findIndex(
      (s) => !progress.visitedStations.includes(s.id)
    );
    return idx === -1 ? stations.length - 1 : idx;
  }, [progress.visitedStations, stations]);

  const visitStation = useCallback(
    (stationId: string) => {
      markStationVisited(questId, stationId);
      setProgress((prev) => ({
        ...prev,
        visitedStations: [...prev.visitedStations, stationId],
      }));
    },
    [questId]
  );

  const setScreen = useCallback(
    (screen: QuestProgress["currentScreen"]) => {
      const updated = { ...progress, currentScreen: screen };
      saveProgress(questId, updated);
      setProgress(updated);
    },
    [questId, progress]
  );

  return {
    progress,
    getStationStatus,
    getCurrentStationIndex,
    visitStation,
    setScreen,
    hasExistingProgress,
  };
}
