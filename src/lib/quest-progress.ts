export interface QuestProgress {
  visitedStations: string[];
  currentScreen: "intro" | "stations" | "navigation";
  lastStationIndex: number;
}

const PREFIX = "gq_progress_";

function getKey(questId: string): string {
  return `${PREFIX}${questId}`;
}

export function getProgress(questId: string): QuestProgress | null {
  try {
    const raw = localStorage.getItem(getKey(questId));
    if (!raw) return null;
    return JSON.parse(raw) as QuestProgress;
  } catch {
    return null;
  }
}

export function saveProgress(questId: string, progress: QuestProgress): void {
  try {
    localStorage.setItem(getKey(questId), JSON.stringify(progress));
  } catch {
    // localStorage full — silently fail, progress is non-critical
  }
}

export function markStationVisited(questId: string, stationId: string): void {
  const progress = getProgress(questId) ?? {
    visitedStations: [],
    currentScreen: "stations",
    lastStationIndex: 0,
  };
  if (!progress.visitedStations.includes(stationId)) {
    progress.visitedStations.push(stationId);
  }
  saveProgress(questId, progress);
}

export function isStationVisited(questId: string, stationId: string): boolean {
  const progress = getProgress(questId);
  return progress?.visitedStations.includes(stationId) ?? false;
}
