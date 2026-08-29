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
import { hashNewPassword } from "@/lib/quest-access";
import type { Quest } from "@/lib/quest-schema";

export interface QuestFormValues {
  name: string;
  intro: Quest["intro"];
  outro: Quest["outro"];
  /** `undefined` removes protection, omitted (not passed to onConfirm) leaves it unchanged. */
  passwordHash?: string;
}

interface QuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel: string;
  initialValues?: QuestFormValues;
  /** Whether the quest currently has a Creator-access password set — controls the field's initial "already set" state. */
  hasExistingPassword?: boolean;
  onConfirm: (values: QuestFormValues) => void;
}

const EMPTY_VALUES: QuestFormValues = {
  name: "",
  intro: { text: "" },
  outro: { text: "" },
};

const MIN_PASSWORD_LENGTH = 4;

export function QuestFormDialog({
  open,
  onOpenChange,
  title,
  confirmLabel,
  initialValues = EMPTY_VALUES,
  hasExistingPassword = false,
  onConfirm,
}: QuestFormDialogProps) {
  const [name, setName] = useState(initialValues.name);
  const [introText, setIntroText] = useState(initialValues.intro.text);
  const [introUrl, setIntroUrl] = useState(initialValues.intro.mediaUrl ?? "");
  const [outroText, setOutroText] = useState(initialValues.outro.text);
  const [outroUrl, setOutroUrl] = useState(initialValues.outro.mediaUrl ?? "");
  const [password, setPassword] = useState("");
  const [keepExistingPassword, setKeepExistingPassword] = useState(hasExistingPassword);
  const [errors, setErrors] = useState<{ name?: string; introText?: string; introUrl?: string; outroText?: string; outroUrl?: string; password?: string }>({});
  const [prevOpen, setPrevOpen] = useState(open);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setPassword("");
      setKeepExistingPassword(hasExistingPassword);
      setErrors({});
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate against the sanitized value — text made only of HTML tags (e.g.
    // "<b></b>") passes a raw trim() check but collapses to "" once stripHtmlTags()
    // runs on save, so checking the raw value alone would let empty content through.
    const sanitizedName = stripHtmlTags(name).trim();
    const sanitizedIntroText = stripHtmlTags(introText).trim();
    const sanitizedOutroText = stripHtmlTags(outroText).trim();
    const trimmedIntroUrl = introUrl.trim();
    const trimmedOutroUrl = outroUrl.trim();
    const trimmedPassword = password.trim();

    const nextErrors: typeof errors = {};
    if (!sanitizedName) nextErrors.name = "Der Name darf nicht leer sein.";
    if (!sanitizedIntroText) nextErrors.introText = "Der Intro-Text darf nicht leer sein.";
    if (!sanitizedOutroText) nextErrors.outroText = "Der Outro-Text darf nicht leer sein.";
    if (trimmedIntroUrl !== "" && !trimmedIntroUrl.startsWith("https://")) nextErrors.introUrl = "Nur HTTPS-URLs sind erlaubt.";
    if (trimmedOutroUrl !== "" && !trimmedOutroUrl.startsWith("https://")) nextErrors.outroUrl = "Nur HTTPS-URLs sind erlaubt.";
    if (!keepExistingPassword && trimmedPassword !== "" && trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const passwordHash = keepExistingPassword
      ? initialValues.passwordHash
      : trimmedPassword === ""
        ? undefined
        : await hashNewPassword(trimmedPassword);
    setIsSubmitting(false);

    onConfirm({
      name: sanitizedName,
      intro: trimmedIntroUrl
        ? { text: sanitizedIntroText, mediaUrl: trimmedIntroUrl, mediaType: "image" }
        : { text: sanitizedIntroText },
      outro: trimmedOutroUrl
        ? { text: sanitizedOutroText, mediaUrl: trimmedOutroUrl, mediaType: "image" }
        : { text: sanitizedOutroText },
      passwordHash,
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="quest-password" className="text-tech text-[10px] tracking-[0.1em]">
                Passwort (optional)
              </Label>
              <p className="font-body text-xs text-muted-foreground">
                Schützt diese Quest davor, dass andere sie im Ersteller-Modus öffnen und die Lösungen sehen. Du selbst
                wirst auf diesem Gerät nie danach gefragt. Kann nicht zurückgesetzt werden, falls du es vergisst — gut
                aufbewahren.
              </p>
              {keepExistingPassword ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 h-11">
                  <span className="font-body text-sm text-muted-foreground">Passwort ist gesetzt</span>
                  <button
                    type="button"
                    onClick={() => setKeepExistingPassword(false)}
                    className="text-tech text-[10px] tracking-[0.08em] text-primary underline underline-offset-4"
                  >
                    Ändern
                  </button>
                </div>
              ) : (
                <Input
                  id="quest-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder={hasExistingPassword ? "Leer lassen, um das Passwort zu entfernen" : "Mind. 4 Zeichen"}
                  maxLength={200}
                />
              )}
              {errors.password && <p className="font-body text-xs text-destructive">{errors.password}</p>}
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
              disabled={isSubmitting}
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
