import { BookOpen, Info, Pencil, Play, ScrollText, ShieldCheck, type LucideIcon } from "lucide-react";

/**
 * Die Navigation der gesamten App (PROJ-1, Refinement 2026-09-06).
 *
 * Vorgänger war `info-nav.ts` mit vier Zielen, das ausschließlich die
 * Info-Seiten (PROJ-13) bedient hat — der einzige Ort in der App mit einer
 * echten Navigation. Wer in `/play/[id]` oder `/create/[id]` steckte, hatte
 * gar keine. Diese Struktur bedient jetzt beides: das Burger-Menu der
 * App-Screens und das der Info-Seiten sind dieselbe Komponente über
 * denselben Daten, damit sie nicht auseinanderlaufen können.
 *
 * Bleibt ein Plain-Modul (kein `"use client"`): ein Wert, der aus einer
 * Client-Komponente heraus exportiert und serverseitig importiert wird, kommt
 * dort als Referenz-Proxy an, nicht als das Array selbst.
 *
 * Kein Eintrag für den Startscreen `/`: er bietet nichts als die Wahl
 * zwischen Play und Create, und beide stehen hier direkt darüber.
 */

export interface AppNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AppNavGroup {
  /** Überschrift der Gruppe im Menu. */
  title: string;
  links: readonly AppNavLink[];
}

export const APP_NAV_GROUPS: readonly AppNavGroup[] = [
  {
    title: "App",
    links: [
      // Play/Create tragen die Icons ihrer Mode-Cards auf dem Startscreen,
      // damit das Menu dieselbe Sprache spricht wie der Einstieg.
      { href: "/play", label: "Play", icon: Play },
      { href: "/create", label: "Create", icon: Pencil },
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/about", label: "Über", icon: Info },
      { href: "/anleitung", label: "Anleitung", icon: BookOpen },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { href: "/impressum", label: "Impressum", icon: ScrollText },
      { href: "/datenschutz", label: "Datenschutz", icon: ShieldCheck },
    ],
  },
] as const;

/**
 * Die Teilmenge, die als Textlinks in der Desktop-Header-Zeile der Info-Seiten
 * steht (PROJ-13).
 *
 * Dort deckt der Aktions-Button „Zur App" bereits den App-Einstieg ab, und
 * Impressum/Datenschutz stehen im Footer, wo Besucher Rechtstexte zuerst
 * suchen. Im Burger-Menu bleiben dagegen alle sechs Ziele.
 */
export const HEADER_NAV_LINKS = APP_NAV_GROUPS.flatMap((group) => group.links).filter(
  ({ href }) => href === "/anleitung"
);
