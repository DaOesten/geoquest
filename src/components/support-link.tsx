"use client";

import { Coffee } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KOFI_URL } from "@/lib/app-nav";

/**
 * Ko-fi-Icon in der Kopfzeile der Info-Seiten (PROJ-13, Refinement 2026-09-09).
 *
 * Eigene Komponente statt inline in `info-page-shell.tsx`, weil Radix' Tooltip
 * Client-JS braucht (Hover-State, Portal, Positionierung) und die Shell sonst
 * als Ganzes zur Client-Komponente würde — für vier statische Textseiten der
 * falsche Tausch. So bleibt genau dieser Button interaktiv, der Rest der Seite
 * wird weiterhin auf dem Server gerendert.
 *
 * Der Tooltip ist eine Ergänzung, kein Ersatz: Er erscheint nur bei Hover und
 * Tastatur-Fokus und bleibt auf Touch-Geräten unsichtbar. Die Bedeutung des
 * Icons trägt deshalb weiterhin das `aria-label` — Screenreader und
 * Touch-Nutzer sind darauf angewiesen, und die ausgeschriebene Fassung
 * „Support me" steht ohnehin im Burger-Menu.
 *
 * Ghost-Optik (kein Rahmen, keine Füllung) hält „Zur App" daneben als den
 * stärkeren der beiden Buttons; `text-muted-foreground` statt `gq-*`-Hex, weil
 * die Shell auch das Light-Theme der Rechtstexte trägt (BUG-1).
 */
export function SupportLink() {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support me — auf Ko-fi unterstützen (öffnet neuen Tab)"
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground transition-colors duration-base ease-gq hover:text-primary hover:bg-primary/10 active:scale-[0.96]"
          >
            <Coffee className="w-5 h-5" aria-hidden="true" />
          </a>
        </TooltipTrigger>

        {/* `text-tech` + Tracking wie die übrigen Kopfzeilen-Labels; die
            Farbtokens tragen den Tooltip in beiden Themes. */}
        <TooltipContent
          side="bottom"
          className="border-border bg-background text-foreground text-tech text-[11px] tracking-[0.08em]"
        >
          Unterstütze mich
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
