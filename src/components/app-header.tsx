"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppNavMenu } from "@/components/app-nav-menu";

interface AppHeaderProps {
  title?: string;
  backHref?: string;
  /** Use instead of backHref when "back" means popping in-memory screen state rather than navigating to a URL. */
  onBack?: () => void;
  /** Omit the background/blur/border so an ambient backdrop (e.g. QuestListBackdrop) shows through unbroken. */
  transparent?: boolean;
}

/**
 * Kopfzeile der App-Screens (PROJ-1).
 *
 * Aufteilung seit dem Refinement vom 2026-09-06: Zurück-Pfeil links, Burger-Menu
 * rechts, dazwischen optional ein Titel. Vorher stand links auf den Top-Level-
 * Ansichten die Pin-Bildmarke als Weg zum Startscreen — die ist ersatzlos
 * entfallen, weil `/` nichts anbietet als die Wahl zwischen Play und Create und
 * beide jetzt direkt im Menu stehen.
 *
 * Bewusst NICHT sticky: auf 430px verdeckte die klebende Zeile dauerhaft
 * Inhalt, ohne beizutragen — die App-Screens sind Listen, die man von oben nach
 * unten liest. Die Info-Seiten (PROJ-13) behalten ihren Sticky-Header, weil das
 * lange Fließtext-Seiten sind.
 */
export function AppHeader({ title, backHref, onBack, transparent = false }: AppHeaderProps) {
  const backButtonClassName =
    "flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]";

  return (
    <header
      className={
        "flex h-14 items-center gap-3 px-5" +
        (transparent ? "" : " bg-background/80 backdrop-blur-sm border-b border-border")
      }
    >
      {onBack ? (
        <button type="button" onClick={onBack} className={backButtonClassName} aria-label="Zurück">
          <ArrowLeft className="w-5 h-5 text-gq-teal" />
        </button>
      ) : backHref ? (
        <Link href={backHref} className={backButtonClassName} aria-label="Zurück">
          <ArrowLeft className="w-5 h-5 text-gq-teal" />
        </Link>
      ) : null}

      {title && (
        <h1 className="text-tech text-lg flex-1 truncate">{title}</h1>
      )}

      {/* ml-auto trägt das Menu auch dann nach rechts, wenn links nichts steht
          (Top-Level-Ansichten) oder kein Titel die Lücke füllt. */}
      <div className="flex-shrink-0 ml-auto -mr-2">
        <AppNavMenu />
      </div>
    </header>
  );
}
