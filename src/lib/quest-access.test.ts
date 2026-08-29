import { describe, it, expect, beforeEach, vi } from "vitest";
import { markCreatedHere, hasCreatorAccess, hashNewPassword, verifyPassword } from "./quest-access";
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

function makeQuest(id: string, passwordHash?: string): Quest {
  return {
    version: 1,
    id,
    name: "Test Quest",
    lastModified: new Date().toISOString(),
    intro: { text: "intro" },
    outro: { text: "outro" },
    stations: [],
    passwordHash,
  };
}

describe("quest-access", () => {
  beforeEach(() => {
    store.clear();
  });

  describe("hasCreatorAccess", () => {
    it("grants access when the quest has no password", () => {
      expect(hasCreatorAccess(makeQuest("q1"))).toBe(true);
    });

    it("denies access to a password-protected quest never seen on this device", () => {
      expect(hasCreatorAccess(makeQuest("q1", "somehash"))).toBe(false);
    });

    it("grants access to a password-protected quest created on this device", () => {
      const quest = makeQuest("q1", "somehash");
      markCreatedHere(quest.id);
      expect(hasCreatorAccess(quest)).toBe(true);
    });

    it("does not grant access to a different quest just because another was created here", () => {
      markCreatedHere("q1");
      const otherQuest = makeQuest("q2", "somehash");
      expect(hasCreatorAccess(otherQuest)).toBe(false);
    });
  });

  describe("hashNewPassword / verifyPassword", () => {
    it("produces a hash that verifies against the same password", async () => {
      const hash = await hashNewPassword("geheim");
      const quest = makeQuest("q1", hash);
      expect(await verifyPassword(quest, "geheim")).toBe(true);
    });

    it("rejects an incorrect password", async () => {
      const hash = await hashNewPassword("geheim");
      const quest = makeQuest("q1", hash);
      expect(await verifyPassword(quest, "falsch")).toBe(false);
    });

    it("never stores the plaintext password in the hash", async () => {
      const hash = await hashNewPassword("geheim");
      expect(hash).not.toContain("geheim");
    });

    it("produces different hashes for different passwords", async () => {
      const hashA = await hashNewPassword("passwortA");
      const hashB = await hashNewPassword("passwortB");
      expect(hashA).not.toBe(hashB);
    });

    it("grants Creator access on this device after a correct verification", async () => {
      const hash = await hashNewPassword("geheim");
      const quest = makeQuest("q1", hash);
      expect(hasCreatorAccess(quest)).toBe(false);

      await verifyPassword(quest, "geheim");
      expect(hasCreatorAccess(quest)).toBe(true);
    });

    it("does not grant access after an incorrect verification attempt", async () => {
      const hash = await hashNewPassword("geheim");
      const quest = makeQuest("q1", hash);

      await verifyPassword(quest, "falsch");
      expect(hasCreatorAccess(quest)).toBe(false);
    });

    it("treats a quest with no password as always verifiable", async () => {
      const quest = makeQuest("q1");
      expect(await verifyPassword(quest, "irgendwas")).toBe(true);
    });
  });
});
