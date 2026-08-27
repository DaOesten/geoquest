import { questSchema, type Quest } from "./quest-schema";
import { stripHtmlTags } from "./sanitize";

const STORAGE_KEY = "gq_quests";

export function getAllQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Quest[];
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
  };
}

export function isQuestComplete(quest: Quest): boolean {
  return questSchema.safeParse(quest).success;
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
