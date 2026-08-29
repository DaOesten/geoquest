"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Quest } from "@/lib/quest-schema";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";
import { useQuestProgress } from "@/hooks/use-quest-progress";
import { PermissionScreen } from "./permission-screen";
import { IntroScreen } from "./intro-screen";
import { StationList } from "./station-list";
import { NavigationScreen } from "./navigation-screen";
import { StationModules } from "./station-modules";
import { OutroScreen } from "./outro-screen";

type Screen = "permission" | "intro" | "stations" | "navigation" | "modules" | "outro";

interface QuestPlayerProps {
  quest: Quest;
}

export function QuestPlayer({ quest }: QuestPlayerProps) {
  const router = useRouter();
  const {
    getStationStatus,
    getCurrentStationIndex,
    visitStation,
    completeStation,
    solveTask,
    isTaskSolved,
    setScreen: persistScreen,
    hasExistingProgress,
    progress,
  } = useQuestProgress(quest.id, quest.stations);

  const [screen, setScreenState] = useState<Screen>(() => {
    if (hasExistingProgress) return "stations";
    return "permission";
  });
  const [navigatingIndex, setNavigatingIndex] = useState<number | null>(null);
  const [viewingModulesIndex, setViewingModulesIndex] = useState<number | null>(null);

  const setScreen = useCallback(
    (s: Screen) => {
      setScreenState(s);
      if (s === "intro" || s === "stations" || s === "modules" || s === "outro") {
        persistScreen(s === "modules" || s === "outro" ? "stations" : s);
      }
    },
    [persistScreen]
  );

  const handleGpsReady = useCallback(() => {
    setScreenState((current) => {
      if (current === "permission") return "intro";
      return current;
    });
  }, []);

  const geo = useGeolocation({ onFirstPosition: handleGpsReady });
  const orientation = useDeviceOrientation();

  const handlePermissionRequest = useCallback(() => {
    geo.requestPermission();
    orientation.requestPermission();
  }, [geo, orientation]);

  const handleIntroStart = useCallback(() => {
    setScreen("stations");
  }, [setScreen]);

  const handleNavigate = useCallback((index: number) => {
    setNavigatingIndex(index);
    setScreenState("navigation");
  }, []);

  const handleOpenModules = useCallback((index: number) => {
    setViewingModulesIndex(index);
    setScreen("modules");
  }, [setScreen]);

  const handleArrived = useCallback(() => {
    if (navigatingIndex === null) return;
    const station = quest.stations[navigatingIndex];
    visitStation(station.id);
    setViewingModulesIndex(navigatingIndex);
    setNavigatingIndex(null);
    setScreen("modules");
  }, [navigatingIndex, quest.stations, visitStation, setScreen]);

  const handleBackFromNavigation = useCallback(() => {
    setNavigatingIndex(null);
    setScreen("stations");
  }, [setScreen]);

  const handleBackFromModules = useCallback(() => {
    setViewingModulesIndex(null);
    setScreen("stations");
  }, [setScreen]);

  const handleCompleteStation = useCallback(() => {
    if (viewingModulesIndex === null) return;
    const station = quest.stations[viewingModulesIndex];
    const isLastStation = viewingModulesIndex === quest.stations.length - 1;
    completeStation(station.id);
    setViewingModulesIndex(null);
    setScreen(isLastStation ? "outro" : "stations");
  }, [viewingModulesIndex, quest.stations, completeStation, setScreen]);

  const handleOutroDone = useCallback(() => {
    router.push("/play");
  }, [router]);

  const handleSolveTask = useCallback((moduleIndex: number) => {
    if (viewingModulesIndex === null) return;
    const station = quest.stations[viewingModulesIndex];
    solveTask(station.id, moduleIndex);
  }, [viewingModulesIndex, quest.stations, solveTask]);

  switch (screen) {
    case "permission":
      return (
        <PermissionScreen
          permissionState={geo.permission}
          onRequest={handlePermissionRequest}
        />
      );

    case "intro":
      return <IntroScreen quest={quest} onStart={handleIntroStart} />;

    case "stations":
      return (
        <StationList
          questName={quest.name}
          stations={quest.stations}
          getStatus={getStationStatus}
          onNavigate={handleNavigate}
          onOpenModules={handleOpenModules}
        />
      );

    case "navigation": {
      if (navigatingIndex === null) {
        setScreenState("stations");
        return null;
      }
      const station = quest.stations[navigatingIndex];
      const nextStation = quest.stations[navigatingIndex + 1];
      const alreadyVisited = progress.visitedStations.includes(station.id);
      return (
        <NavigationScreen
          station={station}
          stationIndex={navigatingIndex}
          totalStations={quest.stations.length}
          nextStationName={nextStation?.name}
          alreadyVisited={alreadyVisited}
          onArrived={handleArrived}
          onBack={handleBackFromNavigation}
          geoState={geo}
        />
      );
    }

    case "modules": {
      if (viewingModulesIndex === null) {
        setScreenState("stations");
        return null;
      }
      const station = quest.stations[viewingModulesIndex];
      const solvedTaskIndices = progress.solvedTasks[station.id] ?? [];
      const isCompleted = progress.completedStations.includes(station.id);
      return (
        <StationModules
          station={station}
          stationIndex={viewingModulesIndex}
          totalStations={quest.stations.length}
          solvedTasks={solvedTaskIndices}
          onSolveTask={handleSolveTask}
          onComplete={handleCompleteStation}
          onBack={handleBackFromModules}
          readOnly={isCompleted}
        />
      );
    }

    case "outro":
      return (
        <OutroScreen
          quest={quest}
          completedCount={progress.completedStations.length}
          totalCount={quest.stations.length}
          onDone={handleOutroDone}
        />
      );
  }
}
