import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAllQuests,
  getQuestById,
  saveQuest,
  deleteQuest,
  questExists,
  createDraftQuest,
  createDraftStation,
  isQuestComplete,
  isPlayable,
  isPublished,
  publishQuest,
  hasUnsavedChanges,
  markExported,
  renameQuest,
  upsertStation,
  deleteStation,
  reorderStations,
  getStationById,
  upsertModule,
  deleteModule,
  reorderModules,
  type DraftModule,
} from "./quest-storage";
import type { Quest } from "./quest-schema";

const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  get length() { return store.size; },
  key: (_i: number) => null,
};

vi.stubGlobal("localStorage", mockLocalStorage);

const completeQuest: Quest = {
  version: 1,
  id: crypto.randomUUID(),
  name: "Vollständige Quest",
  lastModified: new Date().toISOString(),
  intro: { text: "Willkommen" },
  outro: { text: "Geschafft" },
  stations: [
    {
      id: crypto.randomUUID(),
      name: "Station 1",
      lat: 52.5,
      lng: 13.4,
      radiusMeters: 10,
      modules: [{ type: "text", content: "Hallo" }],
    },
  ],
};

describe("quest-storage", () => {
  beforeEach(() => {
    store.clear();
  });

  describe("getAllQuests / saveQuest / deleteQuest / questExists", () => {
    it("returns an empty array when nothing is stored", () => {
      expect(getAllQuests()).toEqual([]);
    });

    it("saves a new quest and finds it by id", () => {
      saveQuest(completeQuest);
      expect(questExists(completeQuest.id)).toBe(true);
      expect(getQuestById(completeQuest.id)).toEqual(completeQuest);
    });

    it("overwrites an existing quest with the same id instead of duplicating it", () => {
      saveQuest(completeQuest);
      saveQuest({ ...completeQuest, name: "Neuer Name" });
      const all = getAllQuests();
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe("Neuer Name");
    });

    it("deleteQuest removes only the targeted quest", () => {
      const other: Quest = { ...completeQuest, id: crypto.randomUUID() };
      saveQuest(completeQuest);
      saveQuest(other);
      deleteQuest(completeQuest.id);
      expect(questExists(completeQuest.id)).toBe(false);
      expect(questExists(other.id)).toBe(true);
    });

    it("saveQuest throws a user-facing error when localStorage is full", () => {
      const full = {
        ...mockLocalStorage,
        setItem: () => { throw new Error("QuotaExceededError"); },
      };
      vi.stubGlobal("localStorage", full);
      expect(() => saveQuest(completeQuest)).toThrow("Speicher voll. Lösche eine Quest und versuche es erneut.");
      vi.stubGlobal("localStorage", mockLocalStorage);
    });

    it("drops a stored entry with no id instead of returning it broken", () => {
      store.set("gq_quests", JSON.stringify([{ name: "Ohne ID" }, completeQuest]));
      const all = getAllQuests();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(completeQuest.id);
    });

    it("normalizes a stored entry missing stations/intro/outro instead of crashing on it", () => {
      store.set("gq_quests", JSON.stringify([{ id: "legacy-1", name: "Alte Quest" }]));
      const all = getAllQuests();
      expect(all).toHaveLength(1);
      expect(all[0].stations).toEqual([]);
      expect(all[0].intro).toEqual({ text: "" });
      expect(all[0].outro).toEqual({ text: "" });
    });

    it("normalizes a station missing modules instead of crashing on it", () => {
      store.set("gq_quests", JSON.stringify([
        { id: "legacy-2", name: "Quest", stations: [{ id: "s1", name: "Station ohne Module" }] },
      ]));
      const all = getAllQuests();
      expect(all[0].stations[0].modules).toEqual([]);
    });

    it("still returns [] for syntactically invalid JSON", () => {
      store.set("gq_quests", "not-json{{{");
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("createDraftQuest", () => {
    it("creates a minimal quest with an empty station list and empty intro/outro text", () => {
      const draft = createDraftQuest("Meine neue Quest");
      expect(draft.name).toBe("Meine neue Quest");
      expect(draft.stations).toEqual([]);
      expect(draft.intro.text).toBe("");
      expect(draft.outro.text).toBe("");
      expect(draft.version).toBe(1);
    });

    it("generates a unique UUID per call", () => {
      const a = createDraftQuest("A");
      const b = createDraftQuest("B");
      expect(a.id).not.toBe(b.id);
      expect(a.id).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it("sets lastModified to a valid ISO timestamp", () => {
      const draft = createDraftQuest("Zeitstempel-Test");
      expect(() => new Date(draft.lastModified).toISOString()).not.toThrow();
      expect(new Date(draft.lastModified).toISOString()).toBe(draft.lastModified);
    });

    it("strips HTML tags and trims the name", () => {
      const draft = createDraftQuest("  <b>Fett</b>  ");
      expect(draft.name).toBe("Fett");
    });

    it("starts unpublished", () => {
      const draft = createDraftQuest("Entwurf");
      expect(draft.published).toBe(false);
    });
  });

  describe("isQuestComplete", () => {
    it("returns true for a quest that satisfies the full schema", () => {
      expect(isQuestComplete(completeQuest)).toBe(true);
    });

    it("returns false for a fresh draft (no stations)", () => {
      const draft = createDraftQuest("Entwurf");
      expect(isQuestComplete(draft)).toBe(false);
    });

    it("returns false when intro text is empty even if stations exist", () => {
      const quest = { ...completeQuest, intro: { text: "" } };
      expect(isQuestComplete(quest)).toBe(false);
    });

    it("returns false when a station has no modules", () => {
      const quest = { ...completeQuest, stations: [{ ...completeQuest.stations[0], modules: [] }] };
      expect(isQuestComplete(quest)).toBe(false);
    });
  });

  describe("isPlayable", () => {
    it("returns false for a fresh draft with no stations", () => {
      const draft = createDraftQuest("Entwurf");
      expect(isPlayable(draft)).toBe(false);
    });

    it("returns true as soon as a quest has at least one station, even if otherwise incomplete", () => {
      const partiallyBuilt = { ...createDraftQuest("Halbfertig"), stations: completeQuest.stations };
      expect(isPlayable(partiallyBuilt)).toBe(true);
      // still structurally incomplete (empty intro/outro) — playable and "Entwurf" are independent
      expect(isQuestComplete(partiallyBuilt)).toBe(false);
    });

    it("returns true for a fully complete quest", () => {
      expect(isPlayable(completeQuest)).toBe(true);
    });
  });

  describe("isPublished / publishQuest", () => {
    it("defaults to true when the field is absent (quests saved before this feature)", () => {
      const legacyQuest = { ...completeQuest };
      // @ts-expect-error simulating a quest saved before `published` existed
      delete legacyQuest.published;
      expect(isPublished(legacyQuest)).toBe(true);
    });

    it("returns false for a quest explicitly marked unpublished", () => {
      expect(isPublished({ ...completeQuest, published: false })).toBe(false);
    });

    it("returns true for a quest explicitly marked published", () => {
      expect(isPublished({ ...completeQuest, published: true })).toBe(true);
    });

    it("publishQuest sets published to true, updates lastModified, and returns true when playable", () => {
      const draft = { ...completeQuest, published: false, lastModified: "2020-01-01T00:00:00.000Z" };
      saveQuest(draft);
      expect(publishQuest(draft.id)).toBe(true);
      const updated = getQuestById(draft.id);
      expect(updated?.published).toBe(true);
      expect(updated?.lastModified).not.toBe("2020-01-01T00:00:00.000Z");
    });

    it("publishQuest returns false and leaves published unchanged when the quest has no stations", () => {
      const draft = createDraftQuest("Leerer Entwurf");
      saveQuest(draft);
      expect(publishQuest(draft.id)).toBe(false);
      expect(getQuestById(draft.id)?.published).toBe(false);
    });

    it("publishQuest is a no-op and returns false when the quest id does not exist", () => {
      expect(publishQuest("does-not-exist")).toBe(false);
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("hasUnsavedChanges / markExported", () => {
    it("returns true when the quest has never been exported", () => {
      const quest = { ...completeQuest };
      // @ts-expect-error simulating a quest that was never exported
      delete quest.lastExported;
      expect(hasUnsavedChanges(quest)).toBe(true);
    });

    it("returns false when exported after the last modification", () => {
      const quest = { ...completeQuest, lastModified: "2020-01-01T00:00:00.000Z", lastExported: "2020-01-02T00:00:00.000Z" };
      expect(hasUnsavedChanges(quest)).toBe(false);
    });

    it("returns true when modified again after the last export", () => {
      const quest = { ...completeQuest, lastModified: "2020-01-02T00:00:00.000Z", lastExported: "2020-01-01T00:00:00.000Z" };
      expect(hasUnsavedChanges(quest)).toBe(true);
    });

    it("markExported stamps lastExported to now", () => {
      const draft = createDraftQuest("Zu sichern");
      saveQuest(draft);
      markExported(draft.id);
      const updated = getQuestById(draft.id);
      expect(updated?.lastExported).toBeDefined();
      expect(hasUnsavedChanges(updated!)).toBe(false);
    });

    it("markExported is a no-op when the quest id does not exist", () => {
      markExported("does-not-exist");
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("renameQuest", () => {
    it("updates the name and lastModified of an existing quest", () => {
      saveQuest(completeQuest);
      const before = completeQuest.lastModified;
      renameQuest(completeQuest.id, "Umbenannt");
      const updated = getQuestById(completeQuest.id);
      expect(updated?.name).toBe("Umbenannt");
      expect(updated?.lastModified).not.toBe(before);
    });

    it("strips HTML tags and trims the new name", () => {
      saveQuest(completeQuest);
      renameQuest(completeQuest.id, "  <b>Sauber</b>  ");
      expect(getQuestById(completeQuest.id)?.name).toBe("Sauber");
    });

    it("is a no-op when the quest id does not exist", () => {
      renameQuest("does-not-exist", "Neu");
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("createDraftStation", () => {
    it("creates a station with a unique id, empty name, default radius, no position, no modules", () => {
      const station = createDraftStation();
      expect(station.id).toBeTruthy();
      expect(station.name).toBe("");
      expect(station.radiusMeters).toBe(10);
      expect(station.lat).toBeUndefined();
      expect(station.lng).toBeUndefined();
      expect(station.modules).toEqual([]);
    });
  });

  describe("upsertStation", () => {
    it("appends a new station to the quest and updates lastModified", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      draftQuest.lastModified = new Date(0).toISOString();
      saveQuest(draftQuest);

      const station = createDraftStation();
      upsertStation(draftQuest.id, { ...station, name: "Erste Station" });

      const updated = getQuestById(draftQuest.id);
      expect(updated?.stations).toHaveLength(1);
      expect(updated?.stations[0].name).toBe("Erste Station");
      expect(updated?.lastModified).not.toBe(draftQuest.lastModified);
    });

    it("saves a station without lat/lng (draft principle — position is optional)", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();

      upsertStation(draftQuest.id, station);

      const updated = getQuestById(draftQuest.id);
      expect(updated?.stations[0].lat).toBeUndefined();
      expect(updated?.stations[0].lng).toBeUndefined();
    });

    it("updates an existing station in place when the id matches", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, { ...station, name: "Original" });

      upsertStation(draftQuest.id, { ...station, name: "Geändert", lat: 52.5, lng: 13.4 });

      const updated = getQuestById(draftQuest.id);
      expect(updated?.stations).toHaveLength(1);
      expect(updated?.stations[0].name).toBe("Geändert");
      expect(updated?.stations[0].lat).toBe(52.5);
    });

    it("strips HTML tags and trims the station name", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();

      upsertStation(draftQuest.id, { ...station, name: "  <b>Brunnen</b>  " });

      expect(getQuestById(draftQuest.id)?.stations[0].name).toBe("Brunnen");
    });

    it("is a no-op when the quest id does not exist", () => {
      upsertStation("does-not-exist", createDraftStation());
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("deleteStation", () => {
    it("removes the station from the quest and updates lastModified", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);
      const before = new Date(0).toISOString();
      const quest = getQuestById(draftQuest.id)!;
      saveQuest({ ...quest, lastModified: before });

      deleteStation(draftQuest.id, station.id);

      const updated = getQuestById(draftQuest.id);
      expect(updated?.stations).toHaveLength(0);
      expect(updated?.lastModified).not.toBe(before);
    });

    it("is a no-op when the quest id does not exist", () => {
      deleteStation("does-not-exist", "some-station-id");
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("reorderStations", () => {
    it("persists the new station order", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const stationA = { ...createDraftStation(), name: "A" };
      const stationB = { ...createDraftStation(), name: "B" };
      upsertStation(draftQuest.id, stationA);
      upsertStation(draftQuest.id, stationB);

      reorderStations(draftQuest.id, [stationB.id, stationA.id]);

      const updated = getQuestById(draftQuest.id);
      expect(updated?.stations.map((s) => s.name)).toEqual(["B", "A"]);
    });

    it("drops ids from the ordering list that no longer exist on the quest", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);

      reorderStations(draftQuest.id, [station.id, "ghost-id"]);

      const updated = getQuestById(draftQuest.id);
      expect(updated?.stations).toHaveLength(1);
    });

    it("is a no-op when the quest id does not exist", () => {
      reorderStations("does-not-exist", ["a", "b"]);
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("getStationById", () => {
    it("finds a station by id within a quest", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = { ...createDraftStation(), name: "Gesucht" };
      upsertStation(draftQuest.id, station);

      expect(getStationById(draftQuest.id, station.id)?.name).toBe("Gesucht");
    });

    it("returns undefined when the station id does not exist", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      expect(getStationById(draftQuest.id, "ghost")).toBeUndefined();
    });
  });

  describe("upsertModule", () => {
    it("appends a new module to the station and updates lastModified", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      draftQuest.lastModified = new Date(0).toISOString();
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);

      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "Hallo" });

      const updated = getStationById(draftQuest.id, station.id);
      expect(updated?.modules).toHaveLength(1);
      expect(updated?.modules[0]).toEqual({ type: "text", content: "Hallo" });
      expect(getQuestById(draftQuest.id)?.lastModified).not.toBe(draftQuest.lastModified);
    });

    it("saves an incomplete module (draft principle — empty content is allowed)", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);

      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "" });

      expect(getStationById(draftQuest.id, station.id)?.modules[0]).toEqual({ type: "text", content: "" });
    });

    it("updates an existing module in place when the index matches", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);
      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "Original" });

      upsertModule(draftQuest.id, station.id, 0, { type: "text", content: "Geändert" });

      const updated = getStationById(draftQuest.id, station.id);
      expect(updated?.modules).toHaveLength(1);
      expect(updated?.modules[0]).toEqual({ type: "text", content: "Geändert" });
    });

    it("strips HTML tags from text content", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);

      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "<b>Fett</b>" });

      expect(getStationById(draftQuest.id, station.id)?.modules[0]).toEqual({ type: "text", content: "Fett" });
    });

    it("strips HTML tags from media url and caption", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);

      upsertModule(draftQuest.id, station.id, null, {
        type: "image",
        url: "  https://example.com/<script>.jpg  ",
        caption: "<i>Bild</i>",
      });

      expect(getStationById(draftQuest.id, station.id)?.modules[0]).toEqual({
        type: "image",
        url: "https://example.com/.jpg",
        caption: "Bild",
      });
    });

    it("strips HTML tags from multiple-choice question and options", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);

      const draft: DraftModule = {
        type: "task",
        taskType: "multiple-choice",
        question: "<b>Frage?</b>",
        options: ["<i>A</i>", "B"],
        correctIndices: [0],
      };
      upsertModule(draftQuest.id, station.id, null, draft);

      expect(getStationById(draftQuest.id, station.id)?.modules[0]).toEqual({
        type: "task",
        taskType: "multiple-choice",
        question: "Frage?",
        options: ["A", "B"],
        correctIndices: [0],
      });
    });

    it("is a no-op when the quest id does not exist", () => {
      upsertModule("does-not-exist", "some-station", null, { type: "text", content: "x" });
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("deleteModule", () => {
    it("removes the module at the given index and updates lastModified", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);
      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "A" });
      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "B" });
      const before = new Date(0).toISOString();
      const quest = getQuestById(draftQuest.id)!;
      saveQuest({ ...quest, lastModified: before });

      deleteModule(draftQuest.id, station.id, 0);

      const updated = getStationById(draftQuest.id, station.id);
      expect(updated?.modules).toHaveLength(1);
      expect(updated?.modules[0]).toEqual({ type: "text", content: "B" });
      expect(getQuestById(draftQuest.id)?.lastModified).not.toBe(before);
    });

    it("is a no-op when the quest id does not exist", () => {
      deleteModule("does-not-exist", "some-station", 0);
      expect(getAllQuests()).toEqual([]);
    });
  });

  describe("reorderModules", () => {
    it("persists the new module order", () => {
      const draftQuest = createDraftQuest("Neue Quest");
      saveQuest(draftQuest);
      const station = createDraftStation();
      upsertStation(draftQuest.id, station);
      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "A" });
      upsertModule(draftQuest.id, station.id, null, { type: "text", content: "B" });

      reorderModules(draftQuest.id, station.id, [1, 0]);

      const updated = getStationById(draftQuest.id, station.id);
      expect(updated?.modules.map((m) => (m.type === "text" ? m.content : ""))).toEqual(["B", "A"]);
    });

    it("is a no-op when the quest id does not exist", () => {
      reorderModules("does-not-exist", "some-station", [0, 1]);
      expect(getAllQuests()).toEqual([]);
    });
  });
});
