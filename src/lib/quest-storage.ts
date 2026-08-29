import { questSchema, type Quest, type Station, type Module } from "./quest-schema";
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
 * Whether the creator has published this quest (PROJ-9 "Veröffentlichen").
 * Defaults to true when the field is absent so quests saved before this
 * existed aren't affected.
 */
export function isPublished(quest: Quest): boolean {
  return quest.published ?? true;
}

/**
 * Publishes a quest if it's playable (has at least one station) — the same
 * rule that gates Play-mode visibility (PROJ-6). Returns whether publishing
 * succeeded so the caller (PROJ-9's "Veröffentlichen" menu item) can show
 * the right toast; a non-playable quest keeps its current `published` value.
 */
export function publishQuest(id: string): boolean {
  const quest = getQuestById(id);
  if (!quest || !isPlayable(quest)) return false;
  saveQuest({
    ...quest,
    published: true,
    lastModified: new Date().toISOString(),
  });
  return true;
}

/**
 * Whether this device has ever downloaded a backup of the quest since its
 * last change (PROJ-9 "Sicherung"). A quest that was never exported, or was
 * modified after its last export, counts as not backed up.
 */
export function hasUnsavedChanges(quest: Quest): boolean {
  return !quest.lastExported || quest.lastExported < quest.lastModified;
}

/** Stamps the quest as backed up on this device. Called after a successful file download (PROJ-9). */
export function markExported(id: string): void {
  const quest = getQuestById(id);
  if (!quest) return;
  saveQuest({
    ...quest,
    lastExported: new Date().toISOString(),
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

/**
 * A module as held by the PROJ-8 editor: required fields (content, question/answer,
 * options, items, correctIndices) are relaxed so a module can be saved before it's
 * complete, mirroring DraftStation above (see PROJ-8 spec, "Speichern (Entwurfsprinzip)").
 * isQuestComplete() treats an incomplete module as incomplete via the normal Zod
 * check — the relaxed shape here only exists so the UI doesn't have to fake values.
 */
export type DraftModule =
  | { type: "text"; content: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "audio"; url: string; caption?: string }
  | { type: "video"; url: string; caption?: string }
  | { type: "task"; taskType: "code"; question: string; answer: string }
  | { type: "task"; taskType: "multiple-choice"; question: string; options: string[]; correctIndices: number[] }
  | { type: "task"; taskType: "sorting"; question: string; items: string[] };

export function getStationById(questId: string, stationId: string): DraftStation | undefined {
  const quest = getQuestById(questId);
  return quest?.stations.find((s) => s.id === stationId) as DraftStation | undefined;
}

/** Inserts a new module or updates an existing one (matched by index) in the station's module list, then persists. */
export function upsertModule(questId: string, stationId: string, moduleIndex: number | null, draft: DraftModule): void {
  const quest = getQuestById(questId);
  if (!quest) return;

  const sanitized = sanitizeDraftModule(draft);
  const stations = quest.stations.map((station) => {
    if (station.id !== stationId) return station;
    const modules = [...station.modules];
    if (moduleIndex !== null && moduleIndex >= 0 && moduleIndex < modules.length) {
      modules[moduleIndex] = sanitized as Module;
    } else {
      modules.push(sanitized as Module);
    }
    return { ...station, modules };
  });

  saveQuest({ ...quest, stations, lastModified: new Date().toISOString() });
}

export function deleteModule(questId: string, stationId: string, moduleIndex: number): void {
  const quest = getQuestById(questId);
  if (!quest) return;
  const stations = quest.stations.map((station) => {
    if (station.id !== stationId) return station;
    return { ...station, modules: station.modules.filter((_, i) => i !== moduleIndex) };
  });
  saveQuest({ ...quest, stations, lastModified: new Date().toISOString() });
}

/** Persists a full reorder of a station's modules (e.g. after a drag-and-drop reorder in PROJ-8). */
export function reorderModules(questId: string, stationId: string, orderedIndices: number[]): void {
  const quest = getQuestById(questId);
  if (!quest) return;
  const stations = quest.stations.map((station) => {
    if (station.id !== stationId) return station;
    const modules = orderedIndices.map((i) => station.modules[i]).filter((m): m is Module => m !== undefined);
    return { ...station, modules };
  });
  saveQuest({ ...quest, stations, lastModified: new Date().toISOString() });
}

function sanitizeDraftModule(draft: DraftModule): DraftModule {
  switch (draft.type) {
    case "text":
      return { ...draft, content: stripHtmlTags(draft.content) };
    case "image":
    case "audio":
    case "video":
      return {
        ...draft,
        url: stripHtmlTags(draft.url).trim(),
        caption: draft.caption !== undefined ? stripHtmlTags(draft.caption) : undefined,
      };
    case "task":
      switch (draft.taskType) {
        case "code":
          return { ...draft, question: stripHtmlTags(draft.question), answer: stripHtmlTags(draft.answer) };
        case "multiple-choice":
          return {
            ...draft,
            question: stripHtmlTags(draft.question),
            options: draft.options.map(stripHtmlTags),
          };
        case "sorting":
          return {
            ...draft,
            question: stripHtmlTags(draft.question),
            items: draft.items.map(stripHtmlTags),
          };
      }
  }
}
