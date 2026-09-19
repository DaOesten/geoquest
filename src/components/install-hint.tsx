"use client";

import { Download, Share, SquarePlus, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { cn } from "@/lib/utils";

/**
 * Hinweis, dass Geo Quest sich als App installieren lässt (PROJ-12).
 *
 * Steht auf `/` und `/play` — den beiden Screens vor dem Loslaufen. **Nicht**
 * im Spielverlauf (analog zur Ko-fi-Regel des PRD: „kein Hinweis im
 * Spielverlauf") und nicht im Creator, der überwiegend am Desktop läuft.
 *
 * **Im Seitenfluss, nicht fixiert.** Das Design System verbietet ausdrücklich
 * Bottom-Navigation und Tab-Bars; ein fixierter Banner am unteren Rand läse
 * sich genau als solche. Als normale Karte verdeckt er nichts und schiebt
 * nichts weg.
 *
 * Zwei Fassungen, weil es zwei Wege gibt: Android/Chrome öffnet einen echten
 * Dialog per Knopfdruck, iOS Safari kennt keinen programmatischen Weg und
 * bekommt stattdessen die Anleitung „Teilen → Zum Home-Bildschirm". Welcher
 * Weg gilt — und ob überhaupt einer gilt —, entscheidet `useInstallPrompt`.
 */
interface InstallHintProps {
  className?: string;
  /**
   * Kompakte einzeilige Fassung für den Startscreen (`/`).
   *
   * **Gemessen, nicht geschätzt:** Die volle Karte ist 195px hoch. Auf 360x640
   * endet die zweite Mode-Card bei 559px; mit 24px Seitenpolsterung und 20px
   * Abstand bleiben rund 37px. Die volle Fassung liess die Seite auf 799px
   * wachsen und brach damit das PROJ-1-Kriterium "Startscreen scrollt auf
   * 360x640 nicht" — ein Kriterium, das aelter ist als dieses Feature und
   * Vorrang hat.
   *
   * Die kompakte Fassung traegt deshalb nur eine Zeile: keinen Eyebrow, keine
   * Display-Ueberschrift, keinen Beschreibungstext. Auf `/play` gibt es kein
   * solches Kriterium — dort steht die volle Karte.
   */
  compact?: boolean;
}

export function InstallHint({ className, compact = false }: InstallHintProps) {
  const { shouldShow, method, promptInstall, dismiss } = useInstallPrompt();

  if (!shouldShow) return null;

  if (compact) {
    return (
      <aside
        aria-label="Geo Quest als App installieren"
        className={cn("flex items-center gap-1", className)}
      >
        {method === "prompt" ? (
          <button
            type="button"
            onClick={promptInstall}
            className="flex-1 min-w-0 flex items-center gap-2 h-11 px-3 rounded-[12px] text-left text-gq-teal transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.98]"
          >
            <Download className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate text-tech text-[11px] uppercase tracking-[0.08em]">
              Als App installieren
            </span>
          </button>
        ) : (
          /* iOS: kein Button, weil es keinen programmatischen Weg gibt — ein
             Knopf, der nichts tun kann, waere genau der Fehler aus BUG-6. Die
             Anleitung steht als eine Zeile da. */
          <p className="flex-1 min-w-0 flex items-center gap-2 h-11 px-2 text-gq-grey">
            <Share className="w-4 h-4 flex-shrink-0 text-gq-teal" aria-hidden="true" />
            {/* Gemessen: Die ausgeschriebene Fassung ("Als App: Teilen → Zum
                Home-Bildschirm") braucht 224px und wurde auf 320px auf 184px
                abgeschnitten — der Nutzer haette eine halbe Anweisung gesehen.
                Diese Fassung passt auf allen Breiten ab 320px. Die vollstaendige
                Anleitung mit beiden Schritten steht auf `/play`. */}
            <span className="min-w-0 font-body text-[12px] leading-tight">
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
      </aside>
    );
  }

  return (
    <aside
      aria-label="Geo Quest als App installieren"
      className={cn(
        "relative rounded-[16px] border border-gq-teal/25 bg-[#0F2429] p-4 pr-12",
        className
      )}
    >
      {/* Wegklicken. 44x44 Tap-Ziel (PRD/WCAG AA) mit kleinerem Icon darin —
          das `-mr-1 -mt-1` holt die optische Kante zurück an den Kartenrand,
          ohne das Ziel zu verkleinern. */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hinweis ausblenden"
        className="absolute top-2 right-2 flex items-center justify-center w-11 h-11 rounded-full text-gq-grey transition-colors duration-base ease-gq hover:text-gq-white hover:bg-white/5 active:scale-[0.96]"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <p className="text-tech text-[10px] tracking-[0.12em] uppercase text-gq-teal">
        Tipp
      </p>

      <p className="mt-1.5 text-display text-lg leading-tight text-gq-white">
        Geo Quest als App
      </p>

      {method === "prompt" ? (
        <>
          <p className="mt-1.5 font-body text-[13px] leading-[1.45] text-[#A0A7AD]">
            Leg Geo Quest auf deinen Homescreen — startet im Vollbild, ohne
            Browser-Leiste.
          </p>

          <button
            type="button"
            onClick={promptInstall}
            className="mt-3 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill bg-gq-teal text-gq-black text-tech text-xs uppercase tracking-[0.08em] transition-all duration-fast ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Installieren
          </button>
        </>
      ) : (
        <>
          <p className="mt-1.5 font-body text-[13px] leading-[1.45] text-[#A0A7AD]">
            Leg Geo Quest auf deinen Homescreen — startet im Vollbild, ohne
            Browser-Leiste. In Safari:
          </p>

          {/*
            Kein Button, weil iOS keinen programmatischen Weg anbietet — ein
            Button, der nichts tun kann, wäre genau der Fehler aus BUG-6. Die
            Icons stehen neben dem Text, weil der Nutzer sie im Safari-Menu
            wiedererkennen soll; `aria-hidden`, weil der Text sie bereits nennt.
          */}
          <ol className="mt-2.5 flex flex-col gap-2 font-body text-[13px] leading-[1.45] text-[#A0A7AD]">
            <li className="flex items-center gap-2">
              <Share className="w-4 h-4 flex-shrink-0 text-gq-teal" aria-hidden="true" />
              <span>
                Tippe auf <span className="text-gq-white">Teilen</span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <SquarePlus className="w-4 h-4 flex-shrink-0 text-gq-teal" aria-hidden="true" />
              <span>
                Dann <span className="text-gq-white">Zum Home-Bildschirm</span>
              </span>
            </li>
          </ol>
        </>
      )}
    </aside>
  );
}
