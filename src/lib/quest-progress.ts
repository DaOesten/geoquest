export interface QuestProgress {
  visitedStations: string[];
  completedStations: string[];
  solvedTasks: Record<string, number[]>;
  currentScreen: "intro" | "stations" | "navigation" | "modules";
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
    const parsed = JSON.parse(raw);
    return {
      visitedStations: parsed.visitedStations ?? [],
      completedStations: parsed.completedStations ?? [],
      solvedTasks: parsed.solvedTasks ?? {},
      currentScreen: parsed.currentScreen ?? "intro",
      lastStationIndex: parsed.lastStationIndex ?? 0,
    };
  } catch {
    return null;
  }
}

export function saveProgress(questId: string, progress: QuestProgress): void {
  try {
    localStorage.setItem(getKey(questId), JSON.stringify(progress));
  } catch {
    // localStorage full — silently fail
  }
}

export function deleteProgress(questId: string): void {
  try {
    localStorage.removeItem(getKey(questId));
  } catch {
    // localStorage unavailable — silently fail
  }
}

export type QuestListStatus = "new" | "live" | "done";

export function getQuestListStatus(progress: QuestProgress | null, totalStations: number): QuestListStatus {
  if (!progress || progress.visitedStations.length === 0) return "new";
  if (progress.completedStations.length >= totalStations) return "done";
  return "live";
}

export function markStationVisited(questId: string, stationId: string): void {
  const progress = getProgress(questId) ?? {
    visitedStations: [],
    completedStations: [],
    solvedTasks: {},
    currentScreen: "stations",
    lastStationIndex: 0,
  };
  if (!progress.visitedStations.includes(stationId)) {
    progress.visitedStations.push(stationId);
  }
  saveProgress(questId, progress);
}

export function markStationCompleted(questId: string, stationId: string): void {
  const progress = getProgress(questId) ?? {
    visitedStations: [],
    completedStations: [],
    solvedTasks: {},
    currentScreen: "stations",
    lastStationIndex: 0,
  };
  if (!progress.completedStations.includes(stationId)) {
    progress.completedStations.push(stationId);
  }
  saveProgress(questId, progress);
}

export function markTaskSolved(questId: string, stationId: string, moduleIndex: number): void {
  const progress = getProgress(questId) ?? {
    visitedStations: [],
    completedStations: [],
    solvedTasks: {},
    currentScreen: "stations",
    lastStationIndex: 0,
  };
  const stationTasks = progress.solvedTasks[stationId] ?? [];
  if (!stationTasks.includes(moduleIndex)) {
    stationTasks.push(moduleIndex);
  }
  progress.solvedTasks[stationId] = stationTasks;
  saveProgress(questId, progress);
}

export function isStationVisited(questId: string, stationId: string): boolean {
  const progress = getProgress(questId);
  return progress?.visitedStations.includes(stationId) ?? false;
}

export function isStationCompleted(questId: string, stationId: string): boolean {
  const progress = getProgress(questId);
  return progress?.completedStations.includes(stationId) ?? false;
}

export function isTaskSolved(questId: string, stationId: string, moduleIndex: number): boolean {
  const progress = getProgress(questId);
  return progress?.solvedTasks[stationId]?.includes(moduleIndex) ?? false;
}
