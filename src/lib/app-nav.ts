import {
  Coffee,
  Gamepad2,
  Info,
  Pencil,
  ScrollText,
  ShieldCheck,
  Sparkles,
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
 * Kein Eintrag für den Startscreen `/app`: er bietet nichts als die Wahl
 * zwischen Play und Create, und beide stehen hier direkt darüber.
 */

/**
 * Die Seitenadressen der App an einer Stelle (PROJ-16, 2026-10-24).
 *
 * Seit PROJ-16 liegt die Landingpage auf `/`, der Startscreen auf `/app` und
 * die KI-Seite auf `/mit-ki-erstellen`. Vorher standen die Adressen als
 * Zeichenketten in rund einem Dutzend Dateien, und `HEADER_NAV_LINKS` fand den
 * KI-Link über den Text `"/anleitung"`: Wäre die Adresse an einer Stelle
 * geändert worden und an der anderen nicht, wäre der Link still verschwunden.
 */
export const ROUTES = {
  home: "/",
  app: "/app",
  play: "/play",
  create: "/create",
  mitKiErstellen: "/mit-ki-erstellen",
  impressum: "/impressum",
  datenschutz: "/datenschutz",
  /** Nur als iframe auf `/` eingebettet, `noindex`, in keiner Navigation. */
  simulation: "/simulation",
} as const;

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
      { href: ROUTES.play, label: "Play", icon: Gamepad2 },
      { href: ROUTES.create, label: "Create", icon: Pencil },
      // Seit PROJ-16 hier statt unter „Info": Die Seite ist ein Werkzeug, um
      // eine Quest zu bauen, keine Information über die App. Daher auch der
      // Name des Hero-Buttons statt „Anleitung" — Klick und Ziel heißen gleich.
      { href: ROUTES.mitKiErstellen, label: "Mit KI erstellen", icon: Sparkles },
    ],
  },
  {
    title: "Info",
    links: [
      { href: ROUTES.home, label: "Über", icon: Info },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { href: ROUTES.impressum, label: "Impressum", icon: ScrollText },
      { href: ROUTES.datenschutz, label: "Datenschutz", icon: ShieldCheck },
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
  ({ href }) => href === ROUTES.mitKiErstellen
);

/**
 * Speicherschlüssel für das Wegklicken des Installations-Hinweises (PROJ-12).
 *
 * Gleiches Präfix und gleicher Mechanismus wie `gq_first_visit_done` (PROJ-1).
 * Der Unterschied: Hier liegt ein **Zeitstempel** statt eines Wahrheitswerts,
 * weil sich die 30-Tage-Frist sonst nicht berechnen ließe.
 */
export const INSTALL_HINT_STORAGE_KEY = "gq_install_hint_dismissed";

/**
 * Wie lange der Installations-Hinweis nach dem Wegklicken schweigt (PROJ-12).
 *
 * 30 Tage: lang genug, um nicht zu nörgeln; kurz genug, dass jemand, der die
 * App ein zweites Mal für einen Ausflug nutzt, das Angebot noch einmal bekommt.
 * Bewusst abweichend vom Erststart-Dialog, der dauerhaft verschwindet — der ist
 * eine Pflichtinformation, dieser hier ein Angebot.
 */
export const INSTALL_HINT_DISMISS_DAYS = 30;
export const INSTALL_HINT_DISMISS_MS = INSTALL_HINT_DISMISS_DAYS * 24 * 60 * 60 * 1000;
