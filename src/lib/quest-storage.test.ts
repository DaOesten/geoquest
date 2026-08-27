import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAllQuests,
  getQuestById,
  saveQuest,
  deleteQuest,
  questExists,
  createDraftQuest,
  isQuestComplete,
  renameQuest,
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
});
