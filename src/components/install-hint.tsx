"use client";

import { Download, Share, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { cn } from "@/lib/utils";

/**
 * Hinweis, dass Geo Quest sich als App installieren lässt (PROJ-12).
 *
 * Steht auf `/` und `/play` — den beiden Screens vor dem Loslaufen. **Nicht**
 * im Spielverlauf (analog zur Ko-fi-Regel des PRD: „kein Hinweis im
 * Spielverlauf") und nicht im Creator, der überwiegend am Desktop läuft.
 *
 * **Schwebend, nicht im Seitenfluss** (Refinement 2026-09-20). Die erste
 * Fassung war eine Karte im Fluss, begründet mit dem Bottom-Nav-Verbot des
 * Design Systems. Diese Auslegung war zu weit: Die Regel zielt auf dauerhaftes
 * Navigations-Mobiliar, und dieser Hinweis ist weder dauerhaft (ein Tap auf ✕
 * und er schweigt 30 Tage) noch navigiert er irgendwohin.
 *
 * Der Preis der alten Fassung war messbar: Im Fluss schob die volle Karte den
 * Startscreen um 195px auf 799px und brach damit das PROJ-1-Kriterium
 * „`/` scrollt auf 360x640 nicht" — weshalb es eine zweite, abgespeckte
 * Fassung nur für `/` gab. Schwebend kostet der Hinweis **null** Layout-Höhe;
 * damit ist eine Fassung für beide Screens genug.
 *
 * Zwei Zweige, weil es zwei Wege gibt: Android/Chrome öffnet einen echten
 * Dialog per Knopfdruck, iOS Safari kennt keinen programmatischen Weg und
 * bekommt stattdessen die Kurzanleitung „Teilen → Home-Bildschirm". Welcher
 * Weg gilt — und ob überhaupt einer gilt —, entscheidet `useInstallPrompt`.
 */
interface InstallHintProps {
  className?: string;
}

export function InstallHint({ className }: InstallHintProps) {
  const { shouldShow, method, promptInstall, dismiss } = useInstallPrompt();

  if (!shouldShow) return null;

  return (
    <aside
      aria-label="Geo Quest als App installieren"
      className={cn(
        /* `fixed` ist der Kern dieses Refinements: Der Hinweis nimmt keine
           Layout-Höhe ein, der Inhalt scrollt unverändert darunter weiter.
           Messbar daran, dass `scrollHeight` mit und ohne sichtbaren Hinweis
           identisch ist. */
        "fixed bottom-0 left-0 right-0 z-50",
        /* Der Inhalt bleibt auf Desktop auf Handy-Maß — dieselbe Breite, die
           das Design System für jeden Content-Container vorschreibt. */
        "mx-auto max-w-[430px]",
        /* Safe Area: Auf einem iPhone mit Home-Indikator läge das Schließen-X
           sonst teilweise unter der Gestenleiste. 14px ist der Safe-Area-Wert
           des Design Systems für eine fest stehende untere Aktion; auf Geräten
           ohne Systemleiste ist `env()` 0 und es bleiben genau diese 14px. */
        "pb-[calc(env(safe-area-inset-bottom)+14px)] px-3 pt-3",
        className
      )}
    >
      <div className="flex items-center gap-1 rounded-[14px] border border-gq-teal/25 bg-[#0F2429] pl-1 pr-1 shadow-lg shadow-black/40">
        {method === "prompt" ? (
          <button
            type="button"
            onClick={promptInstall}
            aria-label="Installieren"
            className="flex-1 min-w-0 flex items-center gap-2 h-11 px-3 rounded-[12px] text-left text-gq-teal transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.98]"
          >
            <Download className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate text-tech text-[11px] uppercase tracking-[0.08em]">
              Als App installieren
            </span>
          </button>
        ) : (
          /* iOS: kein Button, weil es keinen programmatischen Weg gibt — ein
             Knopf, der nichts tun kann, wäre genau der Fehler aus BUG-6.

             Die Kurzform statt der früheren zweischrittigen Anleitung: Ein
             Overlay verdeckt Inhalt, solange es steht, und die zweizeilige
             Fassung hätte den Hinweis je Plattform unterschiedlich hoch
             gemacht. Gemessen in der Frontend-Phase am 2026-09-19: Die
             ausgeschriebene Fassung ("Als App: Teilen → Zum Home-Bildschirm")
             braucht 224px und wurde auf 320px bei 184px gekappt — diese passt
             ab 320px. */
          <p className="flex-1 min-w-0 flex items-center gap-2 h-11 px-3 text-gq-grey">
            <Share className="w-4 h-4 flex-shrink-0 text-gq-teal" aria-hidden="true" />
            <span className="min-w-0 truncate font-body text-[12px] leading-tight">
              <span className="text-gq-white">Teilen</span> →{" "}
              <span className="text-gq-white">Home-Bildschirm</span>
            </span>
          </p>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Hinweis ausblenden"
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full text-gq-grey transition-colors duration-base ease-gq hover:text-gq-white hover:bg-white/5 active:scale-[0.96]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
