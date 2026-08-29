import type { Quest } from "./quest-schema";

const CREATED_HERE_KEY = "gq_created_here";
const UNLOCKED_HERE_KEY = "gq_unlocked_here";

function readIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function addToIdSet(key: string, id: string): void {
  const ids = readIdSet(key);
  ids.add(id);
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable — silently fail, access just stays gated on this device
  }
}

/** Marks a quest as authored on this device (PROJ-11) — called once, when it's first created via "Neue Quest". */
export function markCreatedHere(questId: string): void {
  addToIdSet(CREATED_HERE_KEY, questId);
}

function isCreatedHere(questId: string): boolean {
  return readIdSet(CREATED_HERE_KEY).has(questId);
}

/** Marks a quest as unlocked on this device (PROJ-11) — called once, after a correct password entry. */
function markUnlockedHere(questId: string): void {
  addToIdSet(UNLOCKED_HERE_KEY, questId);
}

function isUnlockedHere(questId: string): boolean {
  return readIdSet(UNLOCKED_HERE_KEY).has(questId);
}

/**
 * Whether this device may open the Creator view (station list, module editor,
 * edit dialog) for this quest. True when the quest has no password, when this
 * device created it, or when this device has unlocked it before — false only
 * when none of those hold, in which case the caller should show the password
 * prompt instead of the Creator content.
 */
export function hasCreatorAccess(quest: Quest): boolean {
  if (!quest.passwordHash) return true;
  if (isCreatedHere(quest.id)) return true;
  return isUnlockedHere(quest.id);
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hashes a new Creator-access password for storage on the quest (PROJ-11 "Quest bearbeiten"). */
export async function hashNewPassword(password: string): Promise<string> {
  return hashPassword(password);
}

/**
 * Checks a password attempt against the quest's stored hash. On success, marks
 * this device as unlocked for the quest so it isn't asked again.
 */
export async function verifyPassword(quest: Quest, password: string): Promise<boolean> {
  if (!quest.passwordHash) return true;
  const attemptHash = await hashPassword(password);
  const correct = attemptHash === quest.passwordHash;
  if (correct) markUnlockedHere(quest.id);
  return correct;
}
