"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface QuestNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel: string;
  initialValue?: string;
  onConfirm: (name: string) => void;
}

export function QuestNameDialog({
  open,
  onOpenChange,
  title,
  confirmLabel,
  initialValue = "",
  onConfirm,
}: QuestNameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset the form when the dialog transitions from closed to open, without an effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValue(initialValue);
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Der Name darf nicht leer sein.");
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
          and its text color here (color is otherwise inherited pre-computed from <body>'s dark default) so
          descendants without their own explicit color class render correctly. */}
      <DialogContent data-theme="light" className="text-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display italic text-2xl uppercase">{title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="quest-name" className="text-tech text-[10px] tracking-[0.1em]">
              Quest-Name
            </Label>
            <Input
              id="quest-name"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              autoFocus
              maxLength={200}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="rounded-pill h-11 text-tech text-xs tracking-[0.08em]"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="rounded-pill h-11 bg-primary text-primary-foreground text-tech text-xs tracking-[0.08em] active:scale-[0.96] transition-all duration-fast ease-gq"
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
