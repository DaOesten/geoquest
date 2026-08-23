"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getAllQuests } from "@/lib/quest-storage";
import type { Quest } from "@/lib/quest-schema";

const STORAGE_KEY = "gq_quests";

let cachedQuests: Quest[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): Quest[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedQuests = raw ? JSON.parse(raw) : [];
  }
  return cachedQuests;
}

function getServerSnapshot(): Quest[] {
  return [];
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
