"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "gq_first_visit_done";

function getIsFirstVisit() {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }
}

const subscribe = () => () => {};

export function FirstVisitDialog() {
  const isFirstVisit = useSyncExternalStore(
    subscribe,
    getIsFirstVisit,
    () => false
  );
  const [dismissed, setDismissed] = useState(false);

  const open = isFirstVisit && !dismissed;

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage unavailable — dialog will show again next visit
    }
    setDismissed(true);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleDismiss()}>
      <DialogContent className="bg-[#0F2429] border-border text-gq-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-display text-2xl text-gq-white">
            Willkommen bei Geo Quest
          </DialogTitle>
          <DialogDescription className="text-gq-grey text-sm leading-relaxed space-y-3">
            <span className="block">
              Deine Quests und dein Fortschritt werden lokal in deinem Browser
              gespeichert.
            </span>
            <span className="block">
              Wenn du den Browser-Speicher löschst, gehen deine Daten verloren.
              Exportiere wichtige Quests als JSON-Datei, um sie zu sichern.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleDismiss}
            className="w-full bg-gq-teal text-gq-black font-tech text-xs uppercase tracking-[0.08em] hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq rounded-pill h-11"
          >
            Verstanden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
