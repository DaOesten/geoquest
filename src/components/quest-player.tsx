"use client";

import { useState, useCallback } from "react";
import type { Quest } from "@/lib/quest-schema";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";
import { useQuestProgress } from "@/hooks/use-quest-progress";
import { PermissionScreen } from "./permission-screen";
import { IntroScreen } from "./intro-screen";
import { StationList } from "./station-list";
import { NavigationScreen } from "./navigation-screen";

type Screen = "permission" | "intro" | "stations" | "navigation";

interface QuestPlayerProps {
  quest: Quest;
}

export function QuestPlayer({ quest }: QuestPlayerProps) {
  const {
    getStationStatus,
    getCurrentStationIndex,
    visitStation,
    setScreen: persistScreen,
    hasExistingProgress,
    progress,
  } = useQuestProgress(quest.id, quest.stations);

  const [screen, setScreenState] = useState<Screen>(() => {
    if (hasExistingProgress) return "stations";
    return "permission";
  });
  const [navigatingIndex, setNavigatingIndex] = useState<number | null>(null);

  const setScreen = useCallback(
    (s: Screen) => {
      setScreenState(s);
      if (s === "intro" || s === "stations" || s === "navigation") {
        persistScreen(s === "navigation" ? "stations" : s);
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

  const handleArrived = useCallback(() => {
    if (navigatingIndex === null) return;
    const station = quest.stations[navigatingIndex];
    visitStation(station.id);
    setNavigatingIndex(null);
    setScreen("stations");
  }, [navigatingIndex, quest.stations, visitStation, setScreen]);

  const handleBackFromNavigation = useCallback(() => {
    setNavigatingIndex(null);
    setScreen("stations");
  }, [setScreen]);

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
          visitedCount={progress.visitedStations.length}
          onNavigate={handleNavigate}
          onBack={() => {
            window.history.back();
          }}
        />
      );

    case "navigation": {
      if (navigatingIndex === null) {
        setScreenState("stations");
        return null;
      }
      const station = quest.stations[navigatingIndex];
      const nextStation = quest.stations[navigatingIndex + 1];
      return (
        <NavigationScreen
          station={station}
          stationIndex={navigatingIndex}
          totalStations={quest.stations.length}
          nextStationName={nextStation?.name}
          onArrived={handleArrived}
          onBack={handleBackFromNavigation}
          geoState={geo}
        />
      );
    }
  }
}
