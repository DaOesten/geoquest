import { questSchema, stationSchema, type Quest, type Station, type Module } from "./quest-schema";
import { stripHtmlTags } from "./sanitize";
import { markCreatedHere } from "./quest-access";

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
 * Builds a new Quest for the Creator's "Neue Quest erstellen" flow. Name,
 * intro and outro are required inputs (PROJ-6 refinement) — every quest
 * created through the app now satisfies questSchema except for its empty
 * station list, which is the only thing that still makes it a draft.
 */
export function createDraftQuest(name: string, intro: Quest["intro"], outro: Quest["outro"]): Quest {
  const id = crypto.randomUUID();
  markCreatedHere(id);
  return {
    version: 1,
    id,
    name: stripHtmlTags(name).trim(),
    lastModified: new Date().toISOString(),
    intro,
    outro,
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
 * A station that would make a published file un-importable, with the label to
 * name it by in the error message (PROJ-9 refinement 2026-09-27).
 */
export type PublishBlocker = {
  /** 1-based position, as the creator counts stations in the editor. */
  stationNumber: number;
  /** The station's name, or "Station N" when it has none — never an empty string. */
  label: string;
};

/**
 * Which stations block publishing, in order. Empty array = safe to publish.
 *
 * WHY THIS IS SEPARATE FROM `isPlayable`: `isPlayable` also gates Play-mode
 * visibility (see play/page.tsx). Tightening it there would silently drop
 * already-imported quests out of a player's list — a side effect nobody asked
 * for. Publishing is the stricter of the two on purpose: a backup is for me,
 * a published file is for someone else.
 *
 * WHY THE RULE IS DERIVED, NOT COPIED: The bug this fixes existed because two
 * places answered "is this quest valid?" differently — publishing said yes,
 * the import schema said no. Re-typing `modules.length < 1` here would let them
 * drift apart again the moment the schema changes. Instead each station is
 * checked against the real `stationSchema`, so the rule cannot disagree with
 * the one the importer applies.
 */
export function getPublishBlockers(quest: Quest): PublishBlocker[] {
  return quest.stations.flatMap((station, index) => {
    // Only the modules constraint is a publish blocker. A station may still be
    // missing a name or coordinates while the creator works on it; those are
    // caught by isQuestComplete and must not block publishing on their own.
    if (stationSchema.shape.modules.safeParse(station.modules).success) return [];

    const stationNumber = index + 1;
    /**
     * `typeof`-Pruefung, nicht nur `.trim()`: `normalizeQuest` garantiert oben,
     * dass `modules` ein Array ist, aber NICHT, dass `name` ein String ist.
     * Eine korrupte localStorage-Fassung (fehlender oder numerischer Name)
     * liess `.trim()` hier werfen — gemessen `TypeError: station.name.trim is
     * not a function`. Das Projekt sichert an anderer Stelle ausdruecklich zu,
     * dass korrupte `gq_quests`-Daten keinen `pageerror` erzeugen.
     */
    const name = typeof station.name === "string" ? station.name.trim() : "";
    return [{
      stationNumber,
      label: name || `Station ${stationNumber}`,
    }];
  });
}

/**
 * Publishes a quest if it has at least one station AND every station passes the
 * import schema's modules rule. Returns whether publishing succeeded.
 *
 * The modules check was added on 2026-09-27: publishing previously only counted
 * stations, so a quest with an empty station could be published, exported and
 * handed to someone whose import then rejected it. Callers that need to tell the
 * user *which* station is missing content use `getPublishBlockers` — this
 * function stays boolean for the existing call sites.
 */
export function publishQuest(id: string): boolean {
  const quest = getQuestById(id);
  if (!quest || !isPlayable(quest)) return false;
  if (getPublishBlockers(quest).length > 0) return false;
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

/**
 * Updates a quest's name, intro, outro and Creator-access password hash together —
 * the "Bearbeiten" flow (PROJ-6/PROJ-11). Leaves stations/modules untouched.
 * `passwordHash` is `undefined` to remove protection, or omitted to leave it unchanged.
 */
export function updateQuestDetails(
  id: string,
  details: { name: string; intro: Quest["intro"]; outro: Quest["outro"]; passwordHash?: string }
): void {
  const quest = getQuestById(id);
  if (!quest) return;
  saveQuest({
    ...quest,
    name: stripHtmlTags(details.name).trim(),
    intro: details.intro,
    outro: details.outro,
    passwordHash: details.passwordHash,
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
