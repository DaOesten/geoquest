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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { stripHtmlTags } from "@/lib/sanitize";
import type { Quest } from "@/lib/quest-schema";

export interface QuestFormValues {
  name: string;
  intro: Quest["intro"];
  outro: Quest["outro"];
}

interface QuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel: string;
  initialValues?: QuestFormValues;
  onConfirm: (values: QuestFormValues) => void;
}

const EMPTY_VALUES: QuestFormValues = {
  name: "",
  intro: { text: "" },
  outro: { text: "" },
};

export function QuestFormDialog({
  open,
  onOpenChange,
  title,
  confirmLabel,
  initialValues = EMPTY_VALUES,
  onConfirm,
}: QuestFormDialogProps) {
  const [name, setName] = useState(initialValues.name);
  const [introText, setIntroText] = useState(initialValues.intro.text);
  const [introUrl, setIntroUrl] = useState(initialValues.intro.mediaUrl ?? "");
  const [outroText, setOutroText] = useState(initialValues.outro.text);
  const [outroUrl, setOutroUrl] = useState(initialValues.outro.mediaUrl ?? "");
  const [errors, setErrors] = useState<{ name?: string; introText?: string; introUrl?: string; outroText?: string; outroUrl?: string }>({});
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset the form when the dialog transitions from closed to open, without an effect
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(initialValues.name);
      setIntroText(initialValues.intro.text);
      setIntroUrl(initialValues.intro.mediaUrl ?? "");
      setOutroText(initialValues.outro.text);
      setOutroUrl(initialValues.outro.mediaUrl ?? "");
      setErrors({});
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate against the sanitized value — text made only of HTML tags (e.g.
    // "<b></b>") passes a raw trim() check but collapses to "" once stripHtmlTags()
    // runs on save, so checking the raw value alone would let empty content through.
    const sanitizedName = stripHtmlTags(name).trim();
    const sanitizedIntroText = stripHtmlTags(introText).trim();
    const sanitizedOutroText = stripHtmlTags(outroText).trim();
    const trimmedIntroUrl = introUrl.trim();
    const trimmedOutroUrl = outroUrl.trim();

    const nextErrors: typeof errors = {};
    if (!sanitizedName) nextErrors.name = "Der Name darf nicht leer sein.";
    if (!sanitizedIntroText) nextErrors.introText = "Der Intro-Text darf nicht leer sein.";
    if (!sanitizedOutroText) nextErrors.outroText = "Der Outro-Text darf nicht leer sein.";
    if (trimmedIntroUrl !== "" && !trimmedIntroUrl.startsWith("https://")) nextErrors.introUrl = "Nur HTTPS-URLs sind erlaubt.";
    if (trimmedOutroUrl !== "" && !trimmedOutroUrl.startsWith("https://")) nextErrors.outroUrl = "Nur HTTPS-URLs sind erlaubt.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onConfirm({
      name: sanitizedName,
      intro: trimmedIntroUrl
        ? { text: sanitizedIntroText, mediaUrl: trimmedIntroUrl, mediaType: "image" }
        : { text: sanitizedIntroText },
      outro: trimmedOutroUrl
        ? { text: sanitizedOutroText, mediaUrl: trimmedOutroUrl, mediaType: "image" }
        : { text: sanitizedOutroText },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
          and its text color here (color is otherwise inherited pre-computed from <body>'s dark default) so
          descendants without their own explicit color class render correctly. */}
      <DialogContent data-theme="light" className="text-foreground max-h-[85dvh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display italic text-2xl uppercase">{title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quest-name" className="text-tech text-[10px] tracking-[0.1em]">
                Quest-Name
              </Label>
              <Input
                id="quest-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                autoFocus
                maxLength={200}
              />
              {errors.name && <p className="font-body text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="intro-text" className="text-tech text-[10px] tracking-[0.1em]">
                Intro-Text
              </Label>
              <Textarea
                id="intro-text"
                value={introText}
                onChange={(e) => {
                  setIntroText(e.target.value);
                  if (errors.introText) setErrors((prev) => ({ ...prev, introText: undefined }));
                }}
                placeholder="Willkommensnachricht vor der ersten Station"
              />
              {errors.introText && <p className="font-body text-xs text-destructive">{errors.introText}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="intro-url" className="text-tech text-[10px] tracking-[0.1em]">
                Intro-Bild-URL (optional)
              </Label>
              <Input
                id="intro-url"
                value={introUrl}
                onChange={(e) => {
                  setIntroUrl(e.target.value);
                  if (errors.introUrl) setErrors((prev) => ({ ...prev, introUrl: undefined }));
                }}
                placeholder="https://beispiel.de/bild.jpg"
              />
              {errors.introUrl && <p className="font-body text-xs text-destructive">{errors.introUrl}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="outro-text" className="text-tech text-[10px] tracking-[0.1em]">
                Outro-Text
              </Label>
              <Textarea
                id="outro-text"
                value={outroText}
                onChange={(e) => {
                  setOutroText(e.target.value);
                  if (errors.outroText) setErrors((prev) => ({ ...prev, outroText: undefined }));
                }}
                placeholder="Abschlussnachricht nach der letzten Station"
              />
              {errors.outroText && <p className="font-body text-xs text-destructive">{errors.outroText}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="outro-url" className="text-tech text-[10px] tracking-[0.1em]">
                Outro-Bild-URL (optional)
              </Label>
              <Input
                id="outro-url"
                value={outroUrl}
                onChange={(e) => {
                  setOutroUrl(e.target.value);
                  if (errors.outroUrl) setErrors((prev) => ({ ...prev, outroUrl: undefined }));
                }}
                placeholder="https://beispiel.de/bild.jpg"
              />
              {errors.outroUrl && <p className="font-body text-xs text-destructive">{errors.outroUrl}</p>}
            </div>
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
