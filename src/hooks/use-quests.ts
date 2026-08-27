"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getAllQuests } from "@/lib/quest-storage";
import type { Quest } from "@/lib/quest-schema";

const STORAGE_KEY = "gq_quests";

const EMPTY_QUESTS: Quest[] = [];

let cachedQuests: Quest[] = EMPTY_QUESTS;
let cachedRaw: string | null = null;

function getSnapshot(): Quest[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    // Routes through getAllQuests() rather than JSON.parse-ing raw here, so a
    // malformed/corrupted entry gets normalized (or dropped) instead of crashing
    // the page on first render.
    cachedQuests = raw ? getAllQuests() : EMPTY_QUESTS;
  }
  return cachedQuests;
}

function getServerSnapshot(): Quest[] {
  return EMPTY_QUESTS;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useQuests() {
  const quests = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const refreshQuests = useCallback(() => {
    cachedRaw = null;
    cachedQuests = getAllQuests();
    window.dispatchEvent(new Event("storage"));
  }, []);

  return { quests, refreshQuests };
}
