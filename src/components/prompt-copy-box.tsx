"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptCopyBoxProps {
  prompt: string;
}

type CopyState = "idle" | "copied" | "failed";

/**
 * The prompt itself is plain server-rendered text inside a scrollable box, so it
 * stays readable and selectable even when the clipboard is blocked or JS is off
 * (PROJ-13). The button is convenience only — on failure we tell the user to
 * select manually rather than leaving them stuck.
 */
export function PromptCopyBox({ prompt }: PromptCopyBoxProps) {
  const [state, setState] = useState<CopyState>("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-tech text-[10px] tracking-[0.12em] text-gq-grey">
          Prompt-Vorlage
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-2 h-11 px-5 rounded-pill border text-tech text-[11px] tracking-[0.08em]",
            "transition-all duration-base ease-gq active:scale-[0.96]",
            state === "copied"
              ? "border-gq-lime text-gq-lime"
              : "border-gq-teal text-gq-teal hover:bg-gq-teal/10 hover:glow-teal"
          )}
          aria-live="polite"
        >
          {state === "copied" ? (
            <>
              <Check className="w-4 h-4" />
              Kopiert
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Kopieren
            </>
          )}
        </button>
      </div>

      {state === "failed" && (
        <p className="mt-3 rounded-[12px] border border-gq-lime/40 bg-gq-lime/10 px-4 py-3 font-body text-sm leading-relaxed text-gq-white">
          Kopieren hat nicht geklappt. Markier den Text unten von Hand und kopier
          ihn mit Strg+C (am Mac: Cmd+C).
        </p>
      )}

      <div
        className="mt-3 max-h-[380px] lg:max-h-[560px] overflow-y-auto rounded-card border border-border bg-gq-dark-teal/70 p-4 sm:p-6 shadow-card"
        tabIndex={0}
        role="region"
        aria-label="Prompt-Vorlage zum Kopieren"
      >
        <pre className="whitespace-pre-wrap break-words font-body text-[13px] lg:text-sm leading-relaxed text-[#E7EAEC] select-text">
          {prompt}
        </pre>
      </div>

      <p className="mt-2 font-body text-xs leading-relaxed text-gq-grey">
        Du musst den Text nicht lesen — kopieren reicht. Die markierten Stellen
        füllst du in deinem KI-Tool aus.
      </p>
    </div>
  );
}
