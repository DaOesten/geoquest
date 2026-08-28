import { questSchema, type Quest, type Station } from "./quest-schema";
import { stripHtmlTags } from "./sanitize";

const STORAGE_KEY = "gq_quests";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Coerces a raw parsed localStorage entry into a renderable Quest shape, or
 * drops it (returns null) if it's missing what's needed to even identify it.
 * Storage is never re-validated against the strict questSchema here — a draft
 * quest is intentionally incomplete (see createDraftQuest) — this only guards
 * the array/object accesses (`quest.stations.length`, `station.modules`, …)
 * that would otherwise crash the whole page on a corrupted or very old entry.
 */
function normalizeQuest(raw: unknown): Quest | null {
  if (!isRecord(raw) || typeof raw.id !== "string") return null;

  const intro = isRecord(raw.intro) && typeof raw.intro.text === "string" ? raw.intro : { text: "" };
  const outro = isRecord(raw.outro) && typeof raw.outro.text === "string" ? raw.outro : { text: "" };
  const stations = Array.isArray(raw.stations)
    ? raw.stations.filter(isRecord).map((station) => ({
        ...station,
        modules: Array.isArray(station.modules) ? station.modules : [],
      }))
    : [];

  return {
    ...raw,
    name: typeof raw.name === "string" ? raw.name : "",
    intro,
    outro,
    stations,
  } as Quest;
}

export function getAllQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeQuest).filter((q): q is Quest => q !== null);
  } catch {
    return [];
  }
}

export function getQuestById(id: string): Quest | undefined {
  return getAllQuests().find((q) => q.id === id);
}

export function saveQuest(quest: Quest): void {
  const quests = getAllQuests();
  const index = quests.findIndex((q) => q.id === quest.id);
  if (index >= 0) {
    quests[index] = quest;
  } else {
    quests.push(quest);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
  } catch {
    throw new Error("Speicher voll. Lösche eine Quest und versuche es erneut.");
  }
}

export function deleteQuest(id: string): void {
  const quests = getAllQuests().filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
}

export function questExists(id: string): boolean {
  return getAllQuests().some((q) => q.id === id);
}

/**
 * Builds a new, minimal Quest for the Creator's "Neue Quest erstellen" flow.
 * Intentionally does not satisfy questSchema (empty stations, empty intro/outro
 * text) — the strict schema only gates file import/export, not in-app drafts.
 * Use isQuestComplete() to check whether a quest is ready to play/export.
 */
export function createDraftQuest(name: string): Quest {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name: stripHtmlTags(name).trim(),
    lastModified: new Date().toISOString(),
    intro: { text: "" },
    outro: { text: "" },
    stations: [],
    published: false,
  };
}

export function isQuestComplete(quest: Quest): boolean {
  return questSchema.safeParse(quest).success;
}

/**
 * Whether this quest has anything to navigate to. This is what gates
 * visibility in the Play-mode list — a creator can test a quest as soon as
 * it has at least one station, even if it's still an incomplete "Entwurf"
 * (that badge is informational for the Creator's own list only, see PROJ-6
 * spec's "Play-Sichtbarkeit" — it intentionally does NOT gate Play visibility).
 */
export function isPlayable(quest: Quest): boolean {
  return quest.stations.length > 0;
}

/**
 * Not currently used anywhere (Play visibility is governed by isPlayable()
 * above, not this) — kept because PROJ-9 (Export) is expected to need a
 * "has the creator released this quest" concept. Defaults to true when the
 * field is absent so quests saved before this existed aren't affected.
 */
export function isPublished(quest: Quest): boolean {
  return quest.published ?? true;
}

/** Not currently called anywhere — kept for PROJ-9, see isPublished() above. */
export function publishQuest(id: string): void {
  const quest = getQuestById(id);
  if (!quest) return;
  saveQuest({
    ...quest,
    published: true,
    lastModified: new Date().toISOString(),
  });
}

export function renameQuest(id: string, name: string): void {
  const quest = getQuestById(id);
  if (!quest) return;
  saveQuest({
    ...quest,
    name: stripHtmlTags(name).trim(),
    lastModified: new Date().toISOString(),
  });
}

/**
 * A station as held by the PROJ-7 editor: lat/lng are optional, unlike the
 * strict Station type (questSchema), because a draft station may be saved
 * before its position is set on the map (see PROJ-7 spec, "Speichern
 * (Entwurfsprinzip)"). isQuestComplete() treats a station missing lat/lng as
 * incomplete via the normal Zod check, no separate validation needed here.
 */
export type DraftStation = Omit<Station, "lat" | "lng"> & {
  lat?: number;
  lng?: number;
};

export function createDraftStation(): DraftStation {
  return {
    id: crypto.randomUUID(),
    name: "",
    radiusMeters: 10,
    modules: [],
  };
}

/** Inserts a new station or updates an existing one (matched by id) in the quest's station list, then persists. */
export function upsertStation(questId: string, station: DraftStation): void {
  const quest = getQuestById(questId);
  if (!quest) return;

  const sanitized: DraftStation = { ...station, name: stripHtmlTags(station.name).trim() };
  const index = quest.stations.findIndex((s) => s.id === sanitized.id);
  const stations = [...quest.stations];
  if (index >= 0) {
    stations[index] = sanitized as Station;
  } else {
    stations.push(sanitized as Station);
  }

  saveQuest({ ...quest, stations, lastModified: new Date().toISOString() });
}

export function deleteStation(questId: string, stationId: string): void {
  const quest = getQuestById(questId);
  if (!quest) return;
  saveQuest({
    ...quest,
    stations: quest.stations.filter((s) => s.id !== stationId),
    lastModified: new Date().toISOString(),
  });
}

/** Persists a full reorder of the quest's stations (e.g. after a drag-and-drop reorder in PROJ-7). */
export function reorderStations(questId: string, orderedStationIds: string[]): void {
  const quest = getQuestById(questId);
  if (!quest) return;
  const byId = new Map(quest.stations.map((s) => [s.id, s]));
  const stations = orderedStationIds.map((id) => byId.get(id)).filter((s): s is Station => s !== undefined);
  saveQuest({ ...quest, stations, lastModified: new Date().toISOString() });
}
