# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production
- **Verworfen** - feature was fully specced (and possibly implemented) but deliberately dropped from scope; spec kept as reference, excluded from Build Order

## Features

| ID | Feature | Priority | Dependencies | Status | Spec | Created |
|----|---------|----------|--------------|--------|------|---------|
| PROJ-1 | App Shell & Mode Switch | P0 | None | Deployed | [Spec](PROJ-1-app-shell-mode-switch.md) | 2026-08-23 |
| PROJ-2 | Quest Data Model & JSON Import | P0 | PROJ-1 | Deployed | [Spec](PROJ-2-quest-data-model-json-import.md) | 2026-08-23 |
| PROJ-3 | Player — GPS-Navigation | P0 | PROJ-1, PROJ-2 | In Progress | [Spec](PROJ-3-player-gps-navigation.md) | 2026-08-23 |
| PROJ-4 | Player — Modul-Rendering | P0 | PROJ-2, PROJ-3 | Deployed | [Spec](PROJ-4-player-modul-rendering.md) | 2026-08-23 |
| PROJ-5 | Player — Fortschritt & Abschluss | P0 | PROJ-3, PROJ-4 | Deployed | [Spec](PROJ-5-player-fortschritt-abschluss.md) | 2026-08-23 |
| PROJ-6 | Creator — Quest-Verwaltung | P0 | PROJ-1, PROJ-2 | Deployed | [Spec](PROJ-6-creator-quest-verwaltung.md) | 2026-08-23 |
| PROJ-7 | Creator — Stationen-Editor | P0 | PROJ-6 | Deployed | [Spec](PROJ-7-creator-stationen-editor.md) | 2026-08-23 |
| PROJ-8 | Creator — Modul-Editor | P0 | PROJ-7 | Deployed | [Spec](PROJ-8-creator-modul-editor.md) | 2026-08-23 |
| PROJ-9 | Creator — JSON-Export | P0 | PROJ-6 | Deployed | [Spec](PROJ-9-creator-json-export.md) | 2026-08-23 |
| PROJ-10 | Creator — Vorschau / Testmodus | ~~P0~~ | PROJ-4, PROJ-5, PROJ-8 | Verworfen | [Spec](PROJ-10-creator-vorschau-testmodus.md) | 2026-08-23 |
| PROJ-11 | Import — Passwortschutz | P0 | PROJ-2 | Deployed | [Spec](PROJ-11-import-passwortschutz.md) | 2026-08-23 |
| PROJ-12 | PWA-Installation | P0 | PROJ-1 | Roadmap | — | 2026-08-23 |
| PROJ-13 | Landing Page | P1 | PROJ-1 | Deployed | [Spec](PROJ-13-landing-page.md) | 2026-08-23 |

<!-- Add features above this line -->

## Build Order
PROJ-1 → PROJ-2 → PROJ-3 → PROJ-4 → PROJ-5 → PROJ-6 → PROJ-7 → PROJ-8 → PROJ-9 → PROJ-11 → PROJ-12 → PROJ-13

_PROJ-10 (Verworfen) ist bewusst nicht Teil der Build Order — siehe Status-Spalte und Spec._

## Laufende Änderung: App-weite Navigation (2026-09-06)
Ein Refinement über drei Specs hinweg — **deployed am 2026-09-06** (Tag `v1.21.0-PROJ-1`):
- **PROJ-1** trägt das Modell: Burger-Menu (App / Info / Rechtliches) auf allen Screens, Zurück-Pfeil links, keine Pin-Bildmarke mehr, kein Sticky-Header auf Play/Create
- **PROJ-7** verlegt den Quest-Bearbeiten-Stift aus der Kopfzeile neben den Quest-Titel, weil dort jetzt das Menu sitzt
- **PROJ-13** gibt sein Info-Seiten-Menu an PROJ-1 ab und bindet stattdessen die gemeinsame Komponente ein

Gebaut, QA-geprüft und deployt am 2026-09-06 — live auf https://geoquesty.vercel.app und dort verifiziert (Navigation, Themes, Kontrast, Stift). Offen bleiben zwei vorbestehende, nicht blockierende Befunde: BUG-2 (16px-Schließen-X in allen Sheets) und BUG-3 (Kontrast auf den Creator-Screens) — beide in PROJ-1 dokumentiert.

## Offenes Refinement: Stations-Sheet überlagert Speichern-Button (2026-09-06)
**PROJ-7** war deployed und bleibt auf In Progress — ein Handy-Test zeigte, dass die Karte im Stations-Sheet den "Speichern"-Button verdeckt. Ursache: `SheetContent` ist `h-[92dvh] flex flex-col` ohne Scroll-Container, die Karten-Mindesthöhe (`min-h-[220px]`) gewinnt gegen `flex-1`, der Footer wird aus dem sichtbaren Bereich herausgedrückt. Auf kleinen Geräten ist der Stationen-Editor damit funktional gesperrt — eingegebene Daten lassen sich nicht sichern.

Entschiedene Lösung: dreiteiliges Sheet-Layout — fixierte Titelzeile, scrollbarer Inhaltsbereich (Name, Adresssuche, Karte, Radius), fixierte Button-Zeile. Karten-Mindesthöhe bleibt erhalten. Spec ist aktualisiert (User Story 11, Acceptance-Criteria-Block "Sheet-Layout auf kleinen Bildschirmen", Edge Cases 14–16, Technical Requirements, Decision Log).

**Frontend umgesetzt am 2026-09-06.** Zusätzlich nötig geworden: shadcns `SheetFooter` stapelt auf Mobile (`flex-col-reverse`) und schob "Abbrechen" unter den Bildschirmrand — jetzt `flex-row` mit 14px Safe-Area nach Design System. 7 neue E2E-Tests auf dem Referenz-Viewport 360×640, Gesamtsuite **280 passed / 2 skipped / 0 failed**, Build und Lint sauber. Damit erfüllt das Sheet auch die beiden bereits dokumentierten Design-System-Regeln, die es vorher verletzte ("Primary Action unten fest", "Mitte scrollt"). **QA am 2026-09-06 abgeschlossen: keine Bugs in PROJ-7, Production-Ready.** Geprüft wurden beide offenen Änderungen (Sheet-Layout und Quest-Bearbeiten-Stift); für den Stift gab es bisher nur eine manuelle Abnahme — 5 neue E2E-Tests schließen diese Lücke, PROJ-7-Suite jetzt 39 statt 27 Tests. Verifiziert auf sechs Viewports (320–1440px inkl. Landscape) und erstmals auf zwei Browser-Engines.

**Das projektlange Chromium-Problem ist geklärt:** `~/Library/Caches/ms-playwright/chromium-1208/` ist mit 428 KB eine Ruine eines abgebrochenen Downloads (WebKit: 294 MB) — der Launcher ist da, das ~200 MB große Framework fehlt. `playwright install --dry-run` meldet den Browser trotzdem als vorhanden, daher wirkte der Fehler unerklärlich. Es liegt ein funktionsfähiges Google Chrome 152 in `/Applications`; mit `channel: 'chrome'` in `playwright.config.ts` läuft die Suite ohne jeden Download auf Desktop-Chrome. **Empfohlene Änderung ist dokumentiert, aber bewusst nicht vorgenommen** (QA fixt nicht).

Dabei aufgefallen: **BUG-6 (Medium, PROJ-3)** — der "Laufe ein paar Schritte"-Hinweis rendert unter Chrome nicht. **Am 2026-09-07 geklärt: echter Produktfehler, kein Testumgebungs-Artefakt** — siehe das Refinement unten.

**Am 2026-09-07 nach Production deployt** (Tag `v1.23.0-PROJ-7`, Commits `7228d61`/`bdd66c1`/`cba6f21`) und dort per Smoketest auf 360×640 verifiziert: Stift 44×44 neben dem Titel, "Speichern" endet bei 602/640, Buttons nebeneinander, Karte exakt 220px, Station end-to-end angelegt, 0 Konsolenfehler. Mit diesem Deploy geht auch der Quest-Bearbeiten-Stift erstmals QA-abgesichert live.

Offen bleibt aus diesem Refinement nur Edge Case 16 (Bildschirmtastatur) — konstruktiv abgedeckt, aber von Playwright nicht emulierbar; eine kurze Gegenprüfung auf einem echten iPhone wäre die letzte Bestätigung.

Bewusst nicht mitgezogen: der Modul-Editor (PROJ-8) hat dieselbe `h-[92dvh]`-Struktur, aber mit `overflow-y-auto` auf dem ganzen `SheetContent` — er überläuft nicht, sein Footer scrollt nur mit. Scope bleibt eng am tatsächlichen Fehler; die Uneinheitlichkeit zwischen beiden Sheets ist bekannt und akzeptiert.

## Offenes Refinement: GPS- & Kompass-Ausfallmodi (2026-09-06)
**PROJ-3** war deployed und ist zurück auf In Progress — eine Testquest zeigte einen Richtungspfeil, der sich auf dem iPhone nicht bewegte. Die Analyse legte drei stille Ausfallmodi offen, die die Spec bisher nicht kannte:
- **GPS-Fix bleibt aus trotz erteilter Permission** (drinnen/Keller) — Code wertet nur `PERMISSION_DENIED` aus, `POSITION_UNAVAILABLE`/`TIMEOUT` verschwinden lautlos
- **Pfeil ohne Heading zeigt Rotation 0** — von "geradeaus" nicht unterscheidbar
- **iOS-Sensorfreigabe beim Wiedereinstieg übersprungen** — Kompass bleibt die ganze Session stumm (wahrscheinlichste Ursache des Testbefunds)

Spec ist aktualisiert (Acceptance Criteria, Edge Cases 9–12, Technical Requirements, Decision Log). **Frontend umgesetzt am 2026-09-06** (nach Deploy des Navigations-Umbaus, daher kein Konflikt in `navigation-screen.tsx`): neue Zustände `no-fix`/`insecure-context`/`searching`, richtungsloser Pfeil, "Kompass aktivieren"-Button für iOS. 10 neue Unit-Tests. **Am 2026-09-06 ohne QA nach Production deployt** (Commit `cb3b6a2`, Tag `v1.22.0-PROJ-3`) — bewusste Entscheidung, weil der iOS-Kompass-Pfad nur auf einem echten iPhone über HTTPS pruefbar ist und `/qa` dieselben Suiten wie das Frontend-Build fahren wuerde. **QA am 2026-09-06 nachgezogen: keine Bugs, Production-Ready.** Der iOS-Kompass-Pfad ist auf einem echten iPhone bestätigt; 6 neue E2E-Tests schließen die Regressionslücke (PROJ-3 jetzt 19 statt 13 Tests, Suite 267/267 grün). Offen bleibt nur die Chromium-/Android-Abdeckung — Browser-Binary lokal nicht lauffähig.

## Next Available ID: PROJ-14

## Offenes Refinement: BUG-6 — falsche iOS-Erkennung beim Kompass (2026-09-07)
**PROJ-3** geht von Deployed zurück auf In Progress. BUG-6 stand als vermutliches Testumgebungs-Artefakt in den Notizen ("Playwright liefert unter Chrome keinen Fix, `position` bleibt null"). Auf echtem Chrome 152 reproduziert und instrumentiert — **diese Diagnose ist widerlegt**: Die Position liegt vor, die Distanz rendert mit `12514m`, der Nachbartest im selben Block besteht.

Die wahre Ursache ist `isIOS()` in `src/hooks/use-device-orientation.ts:22-27`. Die Funktion schließt allein daraus auf iOS, dass `DeviceOrientationEvent.requestPermission` eine Funktion ist — Desktop-Chrome erfüllt das ebenfalls (gemessen: beide `"function"`). Dadurch ist `canRequestPermission === true`, und `navigation-screen.tsx:168` zeigt den "Kompass aktivieren"-Button statt des Hinweises. Der Button ist eine Sackgasse: `requestPermission()` liefert `denied`, und **erst danach** erscheint der Rat, der tatsächlich hilft.

Nutzerauswirkung: Auf Chrome bekommt der Spieler einen Button angeboten, der garantiert fehlschlägt, bevor er die richtige Anweisung sieht — genau der stille Ausfallmodus, den das Refinement vom 2026-09-06 beseitigen wollte. Die Feature-Erkennung greift nur eine Ebene zu flach.

Beschlossene Lösung (zwei unabhängige Schutzebenen):
1. **Echte Plattformerkennung** — `requestPermission`-Duck-Typing allein genügt nicht, zusätzliches Plattform-Signal nötig
2. **`denied`-Rückfall** — ein abgelehntes oder fehlgeschlagenes `requestPermission()` mündet sofort im "Laufe ein paar Schritte"-Zustand, unabhängig davon, ob die Erkennung richtig lag

Ebene 2 macht das Verhalten auch auf **Android-Chrome** korrekt, das lokal nicht messbar ist (kein Gerät, kein lauffähiges Chromium-Binary) — als offene Frage in der Spec vermerkt, für die Korrektheit aber unkritisch.

Spec ist aktualisiert (2 neue Acceptance Criteria, Edge Cases 13–14, 2 Technical Requirements, 2 Decision-Log-Einträge, 1 Open Question). **Nächster Schritt `/frontend`.**
