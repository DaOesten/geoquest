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

/**
 * Ist die KI-Anleitung (`/anleitung`) freigeschaltet? (PROJ-14)
 *
 * **Der eine Schalter für fünf Stellen.** Die App wird ohne die KI-Anleitung
 * gelauncht, kündigt sie aber an. Fünf Stellen müssen davon wissen:
 *
 *   1. die Seite selbst          — Ankündigung statt Prompt und Schritten
 *   2. dieses Modul, Menu-Gruppe — Eintrag trägt die Kennzeichnung "Bald"
 *   3. dieses Modul, `HEADER_NAV_LINKS` — kein Textlink in der Info-Kopfzeile
 *   4. `/about`, zweiter Hero-CTA — "Mit KI erstellen" entfällt
 *   5. `/create`, Leeransicht     — "Quest mit KI bauen" entfällt
 *
 * Alle fünf lesen diesen Wert. Zum Freischalten genügt `true` — Seite, Menu,
 * Kopfzeile und beide CTAs kommen gleichzeitig zurück. Ohne diesen
 * gemeinsamen Ursprung wäre der Fehler beim Freischalten *still*: eine
 * funktionierende Anleitung, deren Menu-Eintrag weiterhin "Bald" sagt —
 * nichts stürzt ab, nichts warnt.
 *
 * Bewusst eine Konstante und keine Umgebungsvariable: Die betroffenen Seiten
 * sind statisch (0,07–0,09 s) und blieben es nur so. Nebeneffekt, der ein
 * Spec-Kriterium erfüllt — bei `false` landet die Prompt-Vorlage gar nicht
 * erst im ausgelieferten HTML, statt dort nur versteckt zu liegen.
 */
export const ANLEITUNG_VERFUEGBAR = false;

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
  /**
   * Kennzeichnung rechts im Menu-Eintrag, z.B. "Bald" für eine angekündigte,
   * noch nicht verfügbare Funktion (PROJ-14).
   *
   * Echter Text statt Farbe oder Icon, damit Screenreader ihn vorlesen:
   * "Anleitung, Bald". Ein rein visuelles Signal erfüllte das nicht.
   */
  badge?: string;
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
      // Bleibt sichtbar und klickbar, solange die Anleitung nicht
      // freigeschaltet ist — der Eintrag IST die Ankündigung. Ein
      // ausgegrauter, toter Eintrag kündigt an, ohne zu erklären; der Klick
      // führt auf die Seite, die die Ankündigung ausführt.
      {
        href: "/anleitung",
        label: "Anleitung",
        icon: BookOpen,
        ...(ANLEITUNG_VERFUEGBAR ? {} : { badge: "Bald" }),
      },
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
export const HEADER_NAV_LINKS = ANLEITUNG_VERFUEGBAR
  ? APP_NAV_GROUPS.flatMap((group) => group.links).filter(
      ({ href }) => href === "/anleitung"
    )
  : // Solange die Anleitung nur angekündigt ist, führt die Kopfzeile keinen
    // Textlink (PROJ-14). Kein Ersatzziel rückt nach: Ein anderes Ziel hier
    // einzusetzen würde die Navigation über die Ankündigung hinaus ändern.
    // Die Kopfzeile trägt dann nur noch Ko-fi-Icon und "Zur App", beide
    // rechtsbündig — die leere Liste hinterlässt keine Lücke.
    [];

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
