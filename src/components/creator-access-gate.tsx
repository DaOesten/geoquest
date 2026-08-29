"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasCreatorAccess, verifyPassword } from "@/lib/quest-access";
import type { Quest } from "@/lib/quest-schema";

interface CreatorAccessGateProps {
  quest: Quest;
  /** Re-runs the access check (e.g. after a correct password unlocks the device) so the caller re-renders its content. */
  onUnlocked: () => void;
  children: React.ReactNode;
}

/**
 * Wraps Creator-only content (station list, module editor) and shows a password
 * prompt instead whenever this device doesn't have Creator access to the quest
 * (PROJ-11) — i.e. it's an import, not authored here, and never unlocked before.
 */
export function CreatorAccessGate({ quest, onUnlocked, children }: CreatorAccessGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  if (hasCreatorAccess(quest)) {
    return <>{children}</>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsChecking(true);
    const correct = await verifyPassword(quest, password);
    setIsChecking(false);
    if (correct) {
      onUnlocked();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-5 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-10 h-10 text-primary" />
      </div>

      <div className="flex flex-col gap-2 max-w-xs">
        <h2 className="text-display text-2xl">Passwort erforderlich</h2>
        <p className="font-body text-sm text-muted-foreground">
          Diese Quest ist geschützt. Gib das Passwort ein, um sie im Ersteller-Modus zu öffnen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(false);
          }}
          placeholder="Passwort"
          autoFocus
        />
        {error && <p className="font-body text-xs text-destructive">Falsches Passwort.</p>}
        <Button
          type="submit"
          disabled={isChecking || password === ""}
          className="rounded-pill h-12 bg-primary text-primary-foreground text-tech text-xs uppercase tracking-[0.08em] active:scale-[0.96] transition-all duration-fast ease-gq"
        >
          Entsperren
        </Button>
      </form>
    </div>
  );
}
