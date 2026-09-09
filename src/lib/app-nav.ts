import {
  BookOpen,
  Coffee,
  Gamepad2,
  Info,
  Pencil,
  ScrollText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

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
  /**
   * Ziel liegt außerhalb der App (aktuell nur Ko-fi).
   *
   * Steuert drei Dinge auf einmal, deshalb ein Flag am Link statt einer
   * zweiten Datenstruktur: `target`/`rel`, ein `<a>` statt `next/link`
   * (Prefetch trägt auf fremder Domain nichts bei) und der unterdrückte
   * `aria-current`-Zweig — ein externes Ziel ist nie „die aktuelle Seite".
   */
  external?: boolean;
}

/**
 * Freiwillige Unterstützung (PROJ-1 / PROJ-13, Refinement 2026-09-09).
 *
 * Steht hier und nicht als Literal an den zwei Einbauorten: Das Burger-Menu
 * (`app-nav-menu.tsx`) und die Kopfzeile der Info-Seiten
 * (`info-page-shell.tsx`) zeigen auf dasselbe Ziel und würden beim nächsten
 * Ändern sonst auseinanderlaufen.
 */
export const KOFI_URL = "https://ko-fi.com/technolomagie";

export interface AppNavGroup {
  /** Überschrift der Gruppe im Menu. */
  title: string;
  links: readonly AppNavLink[];
}

export const APP_NAV_GROUPS: readonly AppNavGroup[] = [
  {
    title: "App",
    links: [
      // Controller statt Play-Dreieck: Das Dreieck liest sich als "Video
      // abspielen", der Controller sagt "Spielen" — und trifft den Gaming-Ton
      // der Zielgruppe (PRD: 10-15 Jahre).
      { href: "/play", label: "Play", icon: Gamepad2 },
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
  // Letzte Gruppe, ohne Hervorhebung: Play und Create sind der Zweck der App,
  // Rechtliches ist Pflicht, Unterstützen ist freiwillig. Adressat sind die
  // erwachsenen Ersteller (Eltern, Lehrkräfte, Jugendleiter) — nicht der
  // Spieler, der unterwegs eine Station sucht. Kaffeetasse, weil Ko-fi als
  // "buy me a coffee" bekannt ist; ein Herz läse sich als "Favorit".
  {
    title: "Unterstützen",
    links: [{ href: KOFI_URL, label: "Support me", icon: Coffee, external: true }],
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
