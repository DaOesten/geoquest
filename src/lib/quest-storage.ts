import { questSchema, type Quest } from "./quest-schema";
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
 * Whether this quest is visible/playable in the Play-mode list. Defaults to
 * true when the field is absent so quests saved before this feature existed
 * stay visible without a migration step — only new drafts explicitly start
 * unpublished (see createDraftQuest).
 */
export function isPublished(quest: Quest): boolean {
  return quest.published ?? true;
}

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
