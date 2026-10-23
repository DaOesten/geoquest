"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PromptCopyBox } from "@/components/prompt-copy-box";
import {
  PROMPT_ANGABEN,
  buildQuestAiPrompt,
  normalizeAngabe,
  validateAnzahl,
  type PromptAngabeKey,
  type PromptAngabenWerte,
} from "@/lib/quest-ai-prompt";
import { cn } from "@/lib/utils";

const FIELD =
  "h-12 rounded-[12px] border-border bg-gq-black/40 px-4 font-body text-base md:text-base text-gq-white placeholder:text-gq-grey focus-visible:ring-gq-teal focus-visible:ring-offset-0";

/** Normalised snapshot, so "Piraten " and "Piraten" don't count as a change. */
function snapshot(werte: PromptAngabenWerte): string {
  return JSON.stringify(
    PROMPT_ANGABEN.map(({ key }) => normalizeAngabe(werte[key]))
  );
}

/**
 * „Meine Angaben" as a form (PROJ-14, Refinement 2026-10-23).
 *
 * The prompt box appears only after „Prompt erzeugen" — fill in, then
 * generate. Changing a field afterwards does NOT rewrite the prompt silently;
 * a hint above the box says the shown prompt is outdated and offers to
 * regenerate. Empty fields are fine: their line keeps the bracketed example,
 * and the prompt itself tells the AI to ask for what is missing.
 *
 * Nothing is stored and nothing leaves the browser.
 */
export function PromptGenerator() {
  const [werte, setWerte] = useState<PromptAngabenWerte>({});
  const [prompt, setPrompt] = useState<string | null>(null);
  const [erzeugtAus, setErzeugtAus] = useState<string>("");
  const [anzahlFehler, setAnzahlFehler] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [scrollToken, setScrollToken] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const veraltet = prompt !== null && snapshot(werte) !== erzeugtAus;

  useEffect(() => {
    if (scrollToken === 0 || !boxRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    boxRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [scrollToken]);

  function setWert(key: PromptAngabeKey, value: string) {
    setWerte((prev) => ({ ...prev, [key]: value }));
    if (key === "anzahl" && anzahlFehler) setAnzahlFehler(null);
  }

  function erzeugen() {
    const fehler = validateAnzahl(werte.anzahl);
    setAnzahlFehler(fehler);
    if (fehler) {
      document.getElementById("angabe-anzahl")?.focus();
      return;
    }
    const neu = prompt !== null;
    setPrompt(buildQuestAiPrompt(werte));
    setErzeugtAus(snapshot(werte));
    // Wechselnder Text, damit die Live-Region auch beim zweiten Mal ansagt.
    setStatus(neu ? "Prompt neu erzeugt." : "Prompt erzeugt.");
    setScrollToken((t) => t + 1);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    erzeugen();
  }

  return (
    <div className="mt-4">
      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-card border border-border bg-gq-dark-teal/70 p-5 sm:p-6 shadow-card"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {PROMPT_ANGABEN.map(({ key, label, beispiel, maxLength }) => {
            const id = `angabe-${key}`;
            const istAnzahl = key === "anzahl";
            const istWunsch = key === "wuensche";
            const fehlerId = `${id}-fehler`;
            return (
              <div key={key} className={cn("flex flex-col gap-2", istWunsch && "sm:col-span-2")}>
                <Label htmlFor={id} className="font-body text-[15px] font-medium leading-snug text-gq-white">
                  {label}
                </Label>
                {istWunsch ? (
                  <Textarea
                    id={id}
                    value={werte[key] ?? ""}
                    onChange={(e) => setWert(key, e.target.value)}
                    placeholder={beispiel}
                    maxLength={maxLength}
                    rows={3}
                    className={cn(FIELD, "h-auto min-h-[96px] py-3 resize-y")}
                  />
                ) : (
                  <Input
                    id={id}
                    value={werte[key] ?? ""}
                    onChange={(e) => setWert(key, e.target.value)}
                    placeholder={beispiel}
                    maxLength={maxLength}
                    autoComplete="off"
                    {...(istAnzahl && { inputMode: "numeric" as const, pattern: "[0-9]*" })}
                    aria-invalid={istAnzahl && anzahlFehler ? true : undefined}
                    aria-describedby={istAnzahl && anzahlFehler ? fehlerId : undefined}
                    className={cn(FIELD, istAnzahl && anzahlFehler && "border-gq-lime")}
                  />
                )}
                {istAnzahl && anzahlFehler && (
                  <p id={fehlerId} className="font-body text-sm leading-snug text-gq-lime">
                    {anzahlFehler}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-5 font-body text-sm leading-relaxed text-gq-grey">
          Felder, die du leer lässt, fragt die KI im Chat bei dir nach.
        </p>

        <Button
          type="submit"
          className="mt-5 h-12 w-full sm:w-auto px-8 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-base ease-gq"
        >
          <Sparkles className="w-4 h-4" />
          Prompt erzeugen
        </Button>
      </form>

      <p className="sr-only" aria-live="polite" role="status">
        {status}
      </p>

      {prompt !== null && (
        <div ref={boxRef} className="mt-8 scroll-mt-20">
          {veraltet && (
            <div className="flex flex-col gap-3 rounded-[12px] border border-gq-teal/40 bg-gq-teal/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body text-sm leading-relaxed text-gq-white">
                Angaben geändert. Der Prompt unten zeigt noch den alten Stand.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={erzeugen}
                className="flex-shrink-0 h-11 px-5 rounded-pill border-gq-teal bg-transparent text-gq-teal text-tech text-[11px] tracking-[0.08em] hover:bg-gq-teal/10 hover:text-gq-teal active:scale-[0.96] transition-all duration-base ease-gq"
              >
                <RefreshCw className="w-4 h-4" />
                Prompt neu erzeugen
              </Button>
            </div>
          )}
          <PromptCopyBox prompt={prompt} />
        </div>
      )}
    </div>
  );
}
