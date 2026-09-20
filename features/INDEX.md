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
| PROJ-3 | Player — GPS-Navigation | P0 | PROJ-1, PROJ-2 | Deployed | [Spec](PROJ-3-player-gps-navigation.md) | 2026-08-23 |
| PROJ-4 | Player — Modul-Rendering | P0 | PROJ-2, PROJ-3 | Deployed | [Spec](PROJ-4-player-modul-rendering.md) | 2026-08-23 |
| PROJ-5 | Player — Fortschritt & Abschluss | P0 | PROJ-3, PROJ-4 | Deployed | [Spec](PROJ-5-player-fortschritt-abschluss.md) | 2026-08-23 |
| PROJ-6 | Creator — Quest-Verwaltung | P0 | PROJ-1, PROJ-2 | Deployed | [Spec](PROJ-6-creator-quest-verwaltung.md) | 2026-08-23 |
| PROJ-7 | Creator — Stationen-Editor | P0 | PROJ-6 | Deployed | [Spec](PROJ-7-creator-stationen-editor.md) | 2026-08-23 |
| PROJ-8 | Creator — Modul-Editor | P0 | PROJ-7 | Deployed | [Spec](PROJ-8-creator-modul-editor.md) | 2026-08-23 |
| PROJ-9 | Creator — JSON-Export | P0 | PROJ-6 | Deployed | [Spec](PROJ-9-creator-json-export.md) | 2026-08-23 |
| PROJ-10 | Creator — Vorschau / Testmodus | ~~P0~~ | PROJ-4, PROJ-5, PROJ-8 | Verworfen | [Spec](PROJ-10-creator-vorschau-testmodus.md) | 2026-08-23 |
| PROJ-11 | Import — Passwortschutz | P0 | PROJ-2 | Deployed | [Spec](PROJ-11-import-passwortschutz.md) | 2026-08-23 |
| PROJ-12 | PWA-Installation | P0 | PROJ-1 | In Progress | [Spec](PROJ-12-pwa-installation.md) | 2026-08-23 |
| PROJ-13 | Landing Page | P1 | PROJ-1 | Deployed | [Spec](PROJ-13-landing-page.md) | 2026-08-23 |
| PROJ-14 | KI-Anleitung — „Coming soon“ zum Launch | P0 | PROJ-13, PROJ-1 | Deployed | [Spec](PROJ-14-anleitung-coming-soon.md) | 2026-09-17 |

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

## Offenes Refinement: `/about` wird zur Marketing-Landingpage (2026-09-07)
**PROJ-13** war deployed und bleibt auf In Progress — der Betreiber hat neue Marketing-Copy geliefert. Die bisherige `/about` erklärt das Produkt sachlich, verkauft es aber nicht: Der Hero („Draußen ist das Spielfeld.") beschreibt einen Zustand statt ein Versprechen, und die Seite beantwortet „Was ist das?" ausführlicher als „Warum sollte ich das wollen?". Für die einzige Seite, die per QR-Code, Social-Media-Link oder Suchergebnis den Erstkontakt trägt, ist das die falsche Gewichtung.

Elf gelieferte Textblöcke werden zu **acht Sektionen**: Hero → Draußen spielen. Wie ein Game. → Jeder Ort kann ein Level sein. → Nicht nur spielen. Selber machen. → Eine Quest erstellen? Ganz einfach. → Für wen ist Geo Quest? → Häufige Fragen → Abschluss-CTA. Drei Dopplungen der Vorlage werden gebündelt statt einzeln umgesetzt.

**Vokabular (nach Diskussion revidiert):** Der Hero sagt einmal „GPS-Rallye" und holt den Besucher in seiner Suchsprache ab — **ab Sektion 2 heißt es durchgehend „Quest"**, dieselbe Sprache, die ihn in der App erwartet. Die erste Fassung hätte „Rallye" auf der ganzen Seite verwendet und damit einen Bruch beim Klick auf `/create` erzeugt. „Schnitzeljagd" bleibt in Meta-Title, Keywords und JSON-LD. Primäre Zielgruppe bleiben die **Ersteller** — das „du" adressiert den Erwachsenen, nicht das Kind.

**Zwei Sektionen der alten Seite entfallen ersatzlos:** „Was drin steckt" (drei Feature-Karten) und „Der Unterschied" — letztere war die vierte Wiederholung von „kostenlos, kein Account". Der Inhalt der Feature-Karten wandert vollständig in eine **neue fünfte FAQ-Frage** („Was kann ich in eine Quest einbauen?") und bleibt damit im HTML und im JSON-LD, ohne den Lesefluss zu unterbrechen. Ebenfalls gestrichen: die Zeitangabe „in einer halben Stunde" — sie bleibt allein der FAQ vorbehalten. Die Hero-CTAs führen neu direkt nach `/create` statt über den Mode-Switch `/`.

Spec ist aktualisiert (Seitenaufbau, 23 Acceptance Criteria, 15 Decision-Log-Einträge inkl. zweier dokumentierter Revisionen, Wegfall-Tabelle, vollständige Copy im Abschnitt „Refinement 4"). `/anleitung`, `/impressum`, `/datenschutz` und der gesamte Seitenrahmen bleiben unangetastet.

**Frontend umgesetzt am 2026-09-08.** Nur `src/app/(info)/about/page.tsx` angefasst — keine neue Komponente, kein neues Paket, keine neue Route. Zwei bewusste Abweichungen von der Spec-Vorlage, beide nach Rückfrage: **Lucide-Icons statt der Emoji** in den Zielgruppen-Karten (das Design System schließt Emojis aus), und **Sektion 4 steht in einer Karte mit Lime-Rahmen** — nach dem Wegfall von „Was drin steckt" folgten sonst drei Textblöcke aufeinander.

Die Browser-Verifikation (390×844 und 1440×900) förderte drei Dinge zutage, die im Code nicht auffielen und nachgezogen wurden: die „Kostenlos"-Zeile war ebenfalls Lime (zwei Lime-Elemente auf einem Screen verstoßen gegen das Design System, jetzt Teal), die FAQ-Accordion lief auf halber Breite, und der Headline-Umbruch ließ „WIRD" allein stehen.

**Nach der Abnahme auf sieben Sektionen gestrafft (2026-09-08).** Die Sektion „Draußen spielen. Wie ein Game." ist ersatzlos entfallen — ihr rhetorischer Hook doppelte die Headline direkt darüber; die Erklärung der Spielmechanik (Laufen, Aufgaben, GPS), die es sonst nirgends gab, steht jetzt im Hero. „Jeder Ort kann ein Level sein." wurde zur Karte mit Teal-Rahmen und bildet mit der Game-Designer-Karte ein Paar in der Seitenmitte; Teal, weil das Design System nur ein Lime-Element pro Screen zulässt. Desktop-Länge von ~3900px auf ~3750px.

Testabdeckung: 24 Tests in `tests/proj-13-landing-refinement.spec.ts` (darunter ein Wächter, der festhält, dass die Spielmechanik im Hero steht), dazu Assertions in den beiden bestehenden PROJ-13-Suiten auf die neue Fassung gezogen. **PROJ-13 74/74 auf Chrome; Gesamtsuiten 313/313 (Chrome) und 310 passed / 2 skipped (Mobile Safari); Unit 186/186; Build und Lint sauber.** **QA am 2026-09-08 abgeschlossen: 23/23 Acceptance Criteria erfüllt, keine Critical- oder High-Bugs, produktionsreif.**

Drei Acceptance Criteria waren gegenüber den später getroffenen Entscheidungen veraltet (acht statt sieben Sektionen, Emoji statt Lucide-Icons, Button-Beschriftung „Rallye erstellen") — getestet wurde gegen Decision Log und Implementation Notes, die AC-Liste ist entsprechend korrigiert.

Kontrast gemessen statt geschätzt: schlechtester Wert **6.96:1** bei 4.5:1 Vorgabe. Überschriften-Hierarchie ohne Sprünge, FAQ per Tastatur bedienbar, ein Lime-Element wie vom Design System verlangt, WebKit und Chrome strukturgleich. Security-Audit ohne Befund — die Seite ist statisch, hat keine Eingaben, lädt keinen fremden Host, und das JSON-LD escaped `<` korrekt. Nachbarseiten byte-identisch (leerer `git diff`).

**BUG-7 (Medium, offen):** Der primäre CTA liegt auf 1366×768 (140px), 1280×800 (108px) und knapp auf 1440×900 (8px) unter dem Falz — Ursache ist das Logo-Lockup, das mit Rand 192px vor der Headline verbraucht. Kein Funktionsfehler und mobil nicht vorhanden, aber es schwächt genau den Zweck der Seite. Dazu zwei **vorbestehende** Low-Befunde, die den ganzen Info-Bereich betreffen: BUG-8 (Sektions-Kicker sind `h2`, die echten Titel `h3` — Screenreader hören das dekorative Label als Überschrift) und BUG-9 (kein `:focus-visible` in `globals.css`, der Browser-Standard ist auf dunklem Grund kaum sichtbar).

17 neue Tests in `tests/proj-13-landing-qa.spec.ts` für das, was die Frontend-Phase nicht abdeckte (Kontrast, Tastatur, Semantik, Rhythmus, fünf Viewports, Security). Per Gegenprobe geschärft: mit absichtlich gebrochenem Code fallen genau die zwei zuständigen Tests um. PROJ-13 jetzt **91 Tests**. Suiten: **Chrome 330/330**, **Mobile Safari 317 passed / 2 skipped**, **Unit 186/186**, Build und Lint sauber.

**BUG-7 behoben am 2026-09-09.** Drei Eingriffe: Das Logo-Lockup weicht ab `lg` (`lg:hidden`) — am Desktop stehen Navigation und Marke ohnehin im Header und in der Headline, auf Handy und Tablet bleibt es der Markenanker. Der Kopfabstand steigt erst ab `xl` wieder, weil ab `lg` die Bildschirmhöhe der knappe Faktor ist, nicht die Breite. Und der Hero-Lead ist auf Wunsch des Betreibers über die Bugbehebung hinaus auf das Nötigste gekürzt: Zielgruppen-Aufzählung und Spielmechanik sind raus — zusammen 168px an der teuersten Stelle der Seite, während die Zielgruppen als vier Karten und die Mechanik in den Schritten und der FAQ ohnehin ausführlicher stehen. Der Hero trägt jetzt Headline, Subline, Preiszeile und die beiden CTAs.

Als Folge richtet das Hero-Grid ab `lg` oben aus statt zu zentrieren — das trifft auch `/anleitung` (ebenfalls mit `aside`) und verbessert die Ausrichtung dort ebenso.

**Ergebnis: Der CTA steht auf allen elf geprüften Viewports über dem Falz** (320×568 bis 1920×1080). Vorher waren sechs davon abgeschnitten, darunter 1366×768 mit 140px. Sechs neue Tests halten das fest, per Gegenprobe geschärft; zwei Tests, die auf die gelöschten Absätze prüften, sind umgebaut — einer stellt jetzt sicher, dass die Spielmechanik zwar aus dem Hero, aber nicht von der Seite verschwindet. PROJ-13 jetzt **98 Tests**.

Weiterhin offen: BUG-8 (Sektions-Kicker als `h2`) und BUG-9 (kein `:focus-visible`) — beide vorbestehend und app-weit, ein eigenes Refinement wert.

**Am 2026-09-09 nach Production deployt** (Tag `v1.25.0-PROJ-13`) — live auf https://geoquesty.vercel.app/about und dort verifiziert. **BUG-7 ist in Production bestätigt behoben:** alle elf Viewports von 320×568 bis 1920×1080 zeigen den primären CTA vollständig, die Werte decken sich exakt mit den lokalen Messungen. Alle sieben Routen HTTP 200 mit 0,07–0,09s Ladezeit, Struktur und Inhalte wie gebaut, Konsole ohne einen einzigen fehlgeschlagenen Request, Security-Header aktiv, SEO-Metadaten und `FAQPage`-JSON-LD ausgeliefert. Die Nachbarseiten wurden wegen der Änderung an `InfoPageShell` mitgeprüft und sind unbeschädigt — die Prompt-Vorlage auf `/anleitung` ist mit 6956 Zeichen vollständig.

## Offenes Refinement 5: Copy-Feinschliff `/about` (2026-09-09)
**PROJ-13** geht von Deployed zurück auf In Progress — fünf Textänderungen an der live stehenden Seite, vom Betreiber vorgegeben. Kein struktureller Eingriff.

Der Eyebrow „Über Geo Quest" entfällt (er beschrieb die Seite, statt den Besucher anzusprechen). Der Hero bekommt einen zweiten, gleichrangigen Satz zum Spielerlebnis — die Seite adressiert Ersteller, aber wer eine Quest baut, will wissen, was die Gruppe erlebt. Der sekundäre CTA heißt „Mit KI erstellen", die Merkzeile der ersten Karte „Draußen ist das Game.", und die Schul-Karte ist auf zwei Sätze gekürzt.

Zwei Vorgaben habe ich nach Rückfrage angepasst: Der CTA lautet „Mit KI erstellen" statt „Quest mit KI erstellen" — die längere Fassung hätte den sekundären Button breiter gemacht als den primären und ihn optisch zum Haupt-CTA befördert. Und die gestrichenen Fachbeispiele in der Schul-Karte waren in Refinement 4 die Begründung dafür, die eigene Lernpfad-Sektion zu streichen; der Betreiber hat die Kürzung bestätigt.

**Technische Folge:** `eyebrow` in `InfoPageShell` ist jetzt optional — ein leerer String hätte ein leeres `<p>` als Leerraum über der Headline hinterlassen. Die drei anderen Info-Seiten setzen die Prop weiterhin und sind unverändert.

**BUG-7 bleibt behoben:** Der zweite Lead-Satz kostet 51px, alle elf Viewports zeigen den CTA weiterhin vollständig. Knappster Fall ist 320×568 mit 27px Luft (vorher 98px). Zwei neue Tests halten den fehlenden Eyebrow und die gleiche Formatierung beider Hero-Sätze fest; vier Assertions sind auf die neue Copy gezogen. PROJ-13 jetzt **105 Tests**.

**QA am 2026-09-09 abgeschlossen: alle fünf Änderungen bestätigt, keine Bugs, produktionsreif.** „In der gleichen Formatierung" wurde gemessen statt geschätzt — beide Hero-Sätze sind exakt 20px/w400/lh28/Rubik. Der sekundäre CTA ist mit 225px sogar 7px schmaler als der primäre (232px), die Entscheidung gegen die längere Fassung hat also gegriffen. Die Kürzung der Schul-Karte hat ihr Ziel erreicht: Sie ist mit 108 Zeichen nicht mehr die längste (das ist jetzt „Gruppen & Events" mit 132), die vier Karten stehen paarweise gleich hoch bei 24px Spanne.

Der kritische Regressionspunkt — `eyebrow` wurde in der geteilten `InfoPageShell` optional — ist geprüft: `/anleitung`, `/impressum` und `/datenschutz` behalten ihre Eyebrows. BUG-7 bleibt behoben, alle neun Viewports zeigen den CTA vollständig. Security unverändert ohne Befund.

Fünf neue Tests, per Gegenprobe geschärft: Mit drei absichtlich eingebauten Fehlern (Eyebrow zurück, längerer CTA, Satz 2 kleiner) fallen genau die drei zuständigen um. **Chrome 344/344, Mobile Safari 341 passed / 2 skipped, Unit 186/186, PROJ-13 105/105.**

**Beobachtung ohne Bug-Status:** 320×568 hat nur noch 27px Luft unter dem CTA (vorher 98px) — kein Fehler, aber die Stelle, die zuerst kippt, falls der Hero künftig wächst.

**Am 2026-09-09 nach Production deployt** (Tag `v1.26.0-PROJ-13`) — live auf https://geoquesty.vercel.app/about und dort verifiziert. Alle fünf Änderungen bestätigt, alte Fassungen restlos verschwunden. In Production gemessen: beide Hero-Sätze identisch formatiert (`20px|400|28px|Rubik`), der sekundäre Button mit 225px schmaler als der primäre (232px), kein leeres `<p>` an der Stelle des entfernten Eyebrows. **BUG-7 bleibt behoben** — alle neun Viewports von 320 bis 1920px zeigen den CTA vollständig. Sieben Routen HTTP 200 mit 0,08–0,22s, Konsole ohne JS-Fehler und ohne fehlgeschlagenen Request, Security-Header aktiv.

Der kritische Regressionspunkt ist in Production bestätigt: `eyebrow` wurde in der geteilten `InfoPageShell` optional, und `/anleitung`, `/impressum` und `/datenschutz` behalten ihre Eyebrows.

**PROJ-13 ist abgeschlossen.** Offen bleiben BUG-8 (Sektions-Kicker als `h2`) und BUG-9 (kein `:focus-visible`) — beide vorbestehend, app-weit und ein eigenes Refinement wert. Dazu die Beobachtung, dass 320×568 nur noch 27px Luft unter dem CTA hat.

## Abgeschlossen: Refinement 4 (Marketing-Landingpage)
Deployt am 2026-09-09 (Tag `v1.25.0-PROJ-13`). Offen bleiben zwei Low-Befunde aus der QA, die den gesamten Info-Bereich betreffen und ein eigenes Refinement wert wären: BUG-8 (Sektions-Kicker als `h2`, die echten Titel als `h3` — Screenreader hören das dekorative Label als Überschrift) und BUG-9 (kein `:focus-visible` in `globals.css`, app-weit).

## Offenes Refinement: Gratulationsscreen nach Stationsankunft (2026-09-19)
**PROJ-3** geht von Deployed zurück auf In Progress; **PROJ-5** ist mitbetroffen und bleibt auf Deployed. Drei Befunde des Betreibers am Ankunfts-Screen (`ArrivalOverlay` in `navigation-screen.tsx`), alle im Code bestätigt:

1. **Die Karte „Nächstes Ziel" nimmt vorweg, was der Spieler gerade erst erreicht hat** — sie entfällt ersatzlos. Erwogen und verworfen: ein Fortschrittszähler an ihrer Stelle (wäre keine Belohnung, sondern dieselbe Zeile, die der Navigations-Screen schon führt). Der Screen wird kürzer, nicht anders gefüllt; der Blick geht ohne Umweg auf „Station entdecken". Nebeneffekt: Der Sonderfall „letzte Station" verschwindet — der Screen sieht überall gleich aus.

2. **Das Pin-Logo zeichnet sich als Rechteck vom Hintergrund ab.** Ursache gefunden: `mark-pin.jpg` ist ein JPEG **ohne Alpha-Kanal** und bringt seinen eigenen Grund mit. Dieselbe Kante war schon bei den PWA-Icons (PROJ-12, 2026-09-19) gemessen worden — das Quellbild misst rgb(4,10,11), der Token-Hintergrund ist `#0B0F12`. Lösung an der Wurzel: ein freigestelltes PNG, erzeugt durch ein **eingechecktes Skript** statt von Hand, nach dem Muster der PWA-Icons. Das JPEG bleibt liegen (es speist die PWA-Icons); nur die beiden Celebration-Screens ziehen um.

3. **Das Konfetti rieselt von oben und läuft endlos** — es soll wie aus einer **Konfetti-Kanone** von unten mittig nach oben schießen, **einmalig**, danach Ruhe. „Rieseln ist Wetter, kein Jubel." Das `infinite` entfällt, was nebenbei 40 dauerhaft animierte Elemente beendet und der Motion-Regel des Design Systems entspricht („keine Ambient-Loops").

**Reichweite:** `ConfettiEffect` ist eine geteilte Komponente — sie läuft auch auf dem Outro-Screen am Quest-Ende (PROJ-5). Entschieden: **beide** Screens bekommen die Kanone, statt eine Varianten-Prop einzuführen. Der Outro ist der größere Anlass und würde sonst ausgerechnet dort mit dem schwächeren Effekt zurückbleiben. PROJ-5 trägt einen entsprechenden Vermerk; sein Outro-Screen wird nicht angefasst und erbt das Verhalten.

**Mitgenommen:** `prefers-reduced-motion` wird in der Konfetti-Komponente behandelt — bisher fehlt das ganz. Und die Prop `nextStationName` wird über die ganze Kette entfernt (`ArrivalOverlay` → `NavigationScreen` → `quest-player.tsx`), nicht nur ignoriert.

Spec ist aktualisiert (8 neue Acceptance Criteria im Block „Ankunft — Gratulationsscreen", Edge Cases 15–17, 7 Technical Requirements, 7 Produkt- und 6 technische Entscheidungen, 2 neue Open Questions; zwei überholte Design-Entscheidungen von 2026-08-24 sind als solche markiert statt gelöscht).

**Frontend umgesetzt am 2026-09-19.** Fünf Dateien, kein neues Paket, keine neue Komponente, keine neue Route. Beide offenen Fragen sind am Bildschirm beantwortet: **ein** Ursprung unten mittig (der 62°-Fächer deckt die Breite ohnehin ab), Schussdauer 1,7–2,7s je Partikel, nach rund 3s ist der Screen ruhig.

**Die Architektur-Annahme zum Pin war falsch — und der Fehler dadurch größer als gedacht.** Die Spec erwartete denselben flachen Grund wie beim PWA-Icon (rgb(4,10,11)). Gemessen ist der Grund von `mark-pin.jpg` ein **Verlauf**: mittlere Luminanz 42.8 oben links gegen 24.9 unten rechts, gegen einen App-Hintergrund von 14.2. Keine feste Ersatzfarbe hätte das je getroffen — Freistellen war nicht die elegantere, sondern die einzige Lösung. Zwei Fallstricke, die eine einfache Schwelle nicht löst: Die dunkle Kreisfläche in der Pin-Mitte hätte ein Loch bekommen (gelöst per Flood-Fill vom Rand), und der Neon-Glow wäre zu einem gezackten Halo abgeschnitten worden (gelöst per Alpha-Rampe über das Histogramm-Tal bei Luminanz 96–127, nur 1.3% aller Pixel). Ergebnis: 76,9% freigestellt, alle vier Eckpixel Alpha 0.

**Am Bildschirm geprüft, nicht nur gemessen** — bei einer Design-Änderung hätten Zahlen allein nicht gereicht: Der Fächer steht nach 260ms voll im Bild (23 Partikel gleichzeitig, volle Breite), bei 600ms fällt er sichtbar aus, nach 3s ist der Screen ruhig und der CTA allein. Der Outro-Screen erbt PNG und Kanone, ohne dass seine Datei dafür angefasst werden musste.

**Eine eigene Behauptung korrigiert:** Ein Screenshot bei 700ms zeigte nur 5 Partikel und sah nach einem zusammengefallenen Fächer aus; ich habe daraufhin Parameter geändert und eine Begründung in den Test geschrieben. Die Gegenprobe gegen die echte Ursprungsfassung hat sie widerlegt — die zeigte bei 200ms **40** gleichzeitig sichtbare Partikel, mehr als die neue Fassung. Die dünne Stelle war ein Zeitpunkt-Artefakt meiner Aufnahme. Die Einheiten-Vereinheitlichung (`vh` für beide Achsen statt `vw`/`vh` gemischt) bleibt richtig, aber als Vorsorge gegen geräteabhängige Abschusswinkel, nicht als Behebung eines gemessenen Fehlers. Code-Kommentar und Test sind entsprechend korrigiert; der Test prüft jetzt nur noch, was er belegen kann.

**Ein Fehler in den Tests selbst** (das Produkt war richtig): `test.use({ reducedMotion: "reduce" })` kommt unter Playwright 1.58.2 mit `channel: 'chrome'` in der Seite nicht an — `matchMedia(...).matches` bleibt `false`. Der Test hätte 44 sichtbare Partikel als Produktfehler gemeldet. `page.emulateMedia()` wirkt; beide reduced-motion-Tests prüfen jetzt zuerst, dass die Media Query überhaupt greift.

19 neue Tests, per Gegenprobe geschärft: JPEG zurück → genau 2 Tests fallen, Karte zurück → genau 2, altes Rieseln zurück → genau 6. Suiten gegen den Production-Build: **Chrome 152: 460 passed / 23 skipped / 0 failed. Mobile Safari: 454 passed / 29 skipped / 0 failed. Unit 219/219.** Build und Lint sauber.

Nicht abgedeckt und benannt: der Pin auf einem echten Gerätedisplay, die Performance von 70 Partikeln auf schwacher Android-Hardware, und der unveränderte Vibrations-Pfad.

**QA am 2026-09-20 abgeschlossen: 8/8 Acceptance Criteria erfüllt, keine Bugs jeglicher Schwere, Production-Ready.**

Weil das Feature in derselben Sitzung gebaut wurde, habe ich die zentralen Behauptungen **nicht übernommen, sondern neu gemessen** — und beim Pin ein schärferes Ergebnis erzielt als die Frontend-Phase. Die prüfte die vier Eckpixel des PNG; das beweist aber nicht, dass der Pin auf dem **echten App-Hintergrund** kantenfrei ist. Nachgeholt: Das PNG auf `#0B0F12` kompositiert ergibt über den gesamten äußeren 12px-Rahmen eine **maximale Farbabweichung von 0** — mathematisch nicht vom Hintergrund unterscheidbar. Die Gegenprobe mit dem alten JPEG ergibt **43**. Das war die Kante, die der Betreiber sah. Dazu: **jeder** Randpixel (nicht nur die Ecken) hat Alpha 0, das ausgelieferte PNG ist byte-identisch zur Repo-Datei, 23,1% opakes Motiv und 3,4% Teil-Alpha für den Glow.

Konfetti gemessen: Ursprung `bottom: 0` / `left: 195px` bei 390px Breite (exakt mittig), `iteration-count: 1` auf allen 70 Partikeln, und nach 3,5 s **0 von 70** bewegt, **0** sichtbar. Bei `prefers-reduced-motion` nicht nur 0 Partikel, sondern auch alle vier Einblend-Schritte bei **opacity 1** — der naheliegende Folgefehler (Inhalt bleibt unsichtbar hängen) tritt nicht ein.

Kontrast: Stationsname **7,97:1**, Headline 19,40:1, CTA 11,53:1. Der Name nutzt `text-gq-grey` — die Klasse der BUG-1-Falle; hier unkritisch, weil `play/layout.tsx` `data-theme="dark"` festsetzt. Geprüft, nicht angenommen.

**Security ohne Befund:** Der Stationsname ist das einzige angreiferkontrollierte Feld auf dem Screen. `<img onerror>` und `<script>` im Namen werden als **escapter Text** gerendert, keine Ausführung, keine injizierten Elemente, keine Dialoge. Keine Secrets in 20 Bundles, Header aktiv.

**PROJ-5 regressionsfrei:** Eigener Durchlauf bis zum Quest-Ende auf beiden Engines — der Outro erbt PNG und Kanone, Inhalt vollständig, „Fertig" führt nach `/play`. Damit ist auch die „leere Outro-Screenshot"-Beobachtung der Frontend-Phase geklärt: reine Aufnahme-Zeit vor Ablauf der Einblend-Animationen.

**Gegenproben schärfer geführt als in der Frontend-Phase:** Karte zurück → genau 2 Tests fallen, JPEG zurück → genau 2, `prefers-reduced-motion` entfernt → genau 1. Und die **echte alte Konfetti-Komponente aus `HEAD~1`** eingespielt → **7** Tests fallen, darunter der Fächer-Test, den die Frontend-Phase als wirkungslos notiert hatte. Sie hatte nur einzelne Parameter der neuen Fassung verändert, nicht die alte Komponente. Produktcode danach per `git diff` als byte-identisch bestätigt.

Zusätzlich geprüft und in der Spec nicht gefordert: Umlaute/Emoji/Markup im Namen, leerer Stationsname, Tastaturbedienung (der Screen hat **genau ein** fokussierbares Element — 1× Tab, Enter öffnet den Modul-Screen).

Suiten gegen den Production-Build: **Unit 219/219. Chrome 152: 460 passed / 23 skipped / 0 failed. Mobile Safari: 454 passed / 29 skipped / 0 failed.** Build und Lint sauber.

**Drei Messfehler offen benannt** (alle meine, nicht das Produkt): eine Regex gegen `innerText` bei `uppercase`-Transform; ein Locator-Timeout, weil der Stationsname im `aria-label` steckt und der Payload den Textfilter unbrauchbar machte; und ein hängender Hintergrundlauf durch parallele Sonden gegen denselben Server — genau das in INDEX.md dokumentierte Muster.

**Nicht abgedeckt:** das Erscheinungsbild auf einem echten Gerätedisplay, 70 Partikel auf schwacher Android-Hardware, Firefox (Binary fehlt; Risiko gering, da nur CSS-Animationen und PNG-Alpha genutzt werden), und der unveränderte Vibrations-Pfad.

**Am 2026-09-20 nach Production deployt** (Tag `v1.31.0-PROJ-3`, Commits `c0016c0`/`eddf9f6`) — live auf https://geoquesty.vercel.app und dort verifiziert. Vercel deployte automatisch von `main`, live nach ~56 Sekunden.

**Der Kern ist in Production bestätigt — am live ausgelieferten Asset, nicht an der lokalen Datei:** Das Live-PNG ist byte-identisch zum Repo (197.276 Bytes), und auf `#0B0F12` kompositiert ergibt es über den gesamten äußeren 12px-Rahmen eine **Farbabweichung von 0**; das alte JPEG ergibt an derselben Stelle **43**. Der gemeldete Befund ist damit in Production messbar behoben.

Im Live-Browser auf **beiden Engines** geprüft: Der Screen liest `ZIEL ERREICHT! | LIVE ERSTE STATION | STATION ENTDECKEN` — **kein Hinweis auf die nächste Station**, obwohl die Testquest eine zweite hat. Pin als PNG mit `radius 0px` geladen, Kanone `gq-cannon` mit `iteration-count: 1` und Ursprung `bottom: 0` / `left: 195px` (exakt mittig), nach 3,5 s **0 von 70 bewegt und 0 sichtbar**. **WebKit mit 0 Konsolenfehlern und 0 fehlgeschlagenen Requests.** Am Bildschirm abgenommen: Fächer über die volle Breite bei 260 ms, vollständig ruhiger Screen nach 3,5 s.

**PROJ-5 (Outro) in Production regressionsfrei** — eigener Durchlauf bis zum Quest-Ende: erbt PNG und Kanone, Inhalt vollständig.

Alle sieben Routen HTTP 200 mit 0,30–0,47 s, Security-Header aktiv inkl. HSTS, PNG mit `image/png` und `nosniff`. Nachbarseiten unbeschädigt: `/about` mit `FAQPage` und 1× Ko-fi, `/anleitung` weiterhin **0 Treffer** für den zurückgehaltenen Prompt.

**Eine Auffälligkeit geprüft statt weggewunken:** Der Durchlauf meldete 2 Konsolen-404s. Ein normaler Besuch von `/` und `/play` erzeugt **0 Requests mit Status 404** — die beiden stammen aus `/play/<id>`, das serverseitig 404 liefert, weil Quests nur im localStorage liegen. Für den Nutzer unsichtbar, vorbestehend, bereits im Deploy vom 2026-09-07 dokumentiert.

**PROJ-3 ist abgeschlossen.**


## Offenes Refinement: Ankunftsradius auf kleinen Geräten verdeckt (2026-09-20)
**PROJ-7** geht von Deployed zurück auf In Progress. Betreiber-Befund: *"ich sehe den Radius mobile nicht mehr, wenn ich eine Station bearbeite"* — im Production-Build gegen Chrome 152 reproduziert und gemessen.

**Der Radius liegt hinter der Karte, und Scrollen hilft nicht.** Gemessen im Pfad "Station bearbeiten": auf 320×568 um **111px** verdeckt, auf 360×640 um **45px**; ab 390px sichtbar. Auf 360×640 sind von der gesamten Radius-Einheit nur noch die Stufenbeschriftungen ("10 m / 25 m / 50 m / 100 m") unterhalb der Karte zu sehen — Label, Wertanzeige und Slider liegen dahinter.

**Ursache: derselbe Konflikt wie beim Speichern-Button vom 2026-09-06, eine Ebene tiefer.** Der damalige Fix gab `SheetContent` einen Scroll-Container und rettete den Footer, ließ aber den Karten-Wrapper mit `flex-1 min-h-[220px]` unberührt. Auf kleinen Höhen gewinnt die Mindesthöhe gegen den verfügbaren Platz, der Wrapper wächst über die Unterkante des Scroll-Bereichs hinaus (320×568: Scroller endet bei y 470, Karten-Container bei y 524) und überlagert den dahinter liegenden Radius-Block. Scrollen löst es nicht, weil der Scroller weniger Überlauf hat (54px), als die Karte ihn überragt.

**Entschiedene Lösung: Der Radius-Regler wandert über die Karte.** Neue Reihenfolge: Name → Position/GPS → Adresssuche → **Radius** → Karte. Die Karte wird das letzte Element und ist das einzige, das beim Öffnen angeschnitten sein darf — sie erfüllt ihren Zweck auch teilweise sichtbar und bleibt per Scroll vollständig erreichbar, während jedes Bedienelement über ihr angeschnitten unbrauchbar wäre. Damit kehrt sich die Priorität um: Die Karte war bisher das Element, das alles andere verdrängt hat, und ist jetzt das, was als erstes weicht. **Die 220px-Mindesthöhe vom 2026-09-06 bleibt unangetastet.**

Erwogen und verworfen: die Karte schrumpfen zu lassen (hätte die 220px-Entscheidung umgekehrt und die Karte auf 320px auf ~160px gedrückt) und den Radius nur erscrollbar zu machen (hätte ihn erreichbar, aber beim Öffnen weiterhin unsichtbar gelassen — also den eigentlichen Befund nicht behoben).

**Mitgenommen auf Betreiber-Entscheidung:** Der Button "Aktuelle Position verwenden" läuft auf 320 und 360px rechts aus dem sichtbaren Bereich. Gleiche Datei, gleiche Fehlerklasse (Layout auf schmalen Geräten), gleicher Prüf-Durchlauf — ein eigener Zyklus hätte für eine Zeile mehr gekostet als die Scope-Erweiterung.

Spec ist aktualisiert (User Story 12, zwei neue Acceptance-Criteria-Blöcke mit 9 Kriterien, Edge Cases 17–19, 5 Technical Requirements, 4 Produkt- und 3 technische Entscheidungen, 6 neue Open Questions, dazu ein eigener Abschnitt "Refinement 3" mit der vollständigen Messtabelle).

**Für `/frontend` zu beachten:** Die Reihenfolge-Änderung passiert im Markup, nicht per CSS `order` — sonst laufen visuelle und DOM-Reihenfolge auseinander (Tab-Reihenfolge und Screenreader folgen dem DOM). Bestehende PROJ-7-E2E-Tests, die Positionen im Sheet prüfen, werden durch die neue Reihenfolge möglicherweise falsch und sind zu ziehen, nicht zu löschen. Zwei Detailfragen sind bewusst offen gelassen und am Bildschirm zu entscheiden: ob der GPS-Button umbricht oder eine kürzere Beschriftung bekommt.

**Frontend umgesetzt am 2026-09-20.** Eine Datei (`station-editor-sheet.tsx`), kein neues Paket, keine neue Komponente, keine neue Route. Drei Eingriffe: Feldreihenfolge im Markup umgestellt (nicht per CSS `order` — sonst laufen Tab-Reihenfolge und Screenreader gegen die sichtbare Ordnung), der Zwischen-Container um die Karte aufgelöst, und die Positions-Zeile bricht auf schmalen Breiten um.

**Eine Annahme der Spec war falsch — und die Korrektur ist aufschlussreicher als der Plan.** Die Spec forderte, der Karten-Container dürfe den Scroll-Container nicht mehr überragen. Er überragt ihn weiterhin (320×568: 169px), nur ist das folgenlos: `overflow-y-auto` schneidet ihn dort ab, und dahinter liegt kein Bedienelement mehr. **Wirksam war allein die Reihenfolge.** Ein erster Versuch, den Überhang tatsächlich zu unterbinden (`h-[220px] shrink-0`), nagelte die Karte auf allen Bildschirmen auf 220px fest und brach das bestehende Kriterium, dass sie auf großen Bildschirmen wächst — zurückgenommen.

Gemessen im Production-Build: Der Radius ist auf **allen fünf Viewports ohne jede Scroll-Bewegung vollständig sichtbar** (320/360/390/430/1440), die Karte behält 220px auf kleinen und wächst auf großen (304/408/379px), der GPS-Button hat 0px Textüberlauf, und es entsteht auf keiner Breite ein horizontaler Scrollbalken. Am Bildschirm abgenommen auf beiden Engines.

**Zwei Fehler in den neuen Tests gefunden, das Produkt war richtig.** Der wichtigere: Der Sichtbarkeitstest hätte den gemeldeten Fehler **durchgelassen** — er prüfte den Slider-Thumb, der zufällig über die Kartenkante ragte, während Label und Meter-Anzeige vollständig verdeckt waren. Aufgefallen ist das erst durch die Gegenprobe, nicht durch den grünen Lauf. Nach der Korrektur auf das Label fallen bei der Gegenprobe **8 statt 4** Tests.

**Ein bestehender Test war zu Recht falsch geworden:** Fünf Tests klickten in die Mitte der *Layout*-Box der Karte, die seit dem Umbau auf WebKit hinter dem fixierten Footer liegt. Neuer Helfer `clickMapCenter` zielt auf die Mitte der *sichtbaren* Fläche. Gegengeprüft, dass es kein Produktfehler ist — ein Klick dorthin setzt den Pin zuverlässig. Eine zwischenzeitliche Fehldiagnose meinerseits ("der Nutzer trifft den Footer") ist in der Spec offen benannt und widerlegt.

17 neue Tests, PROJ-7 jetzt **56 statt 39**. Suiten gegen den Production-Build: **Chrome 152: 480 passed / 23 skipped / 0 failed. Mobile Safari: 474 passed / 29 skipped / 0 failed. Unit 226/226.** Build und Lint sauber.

**Nicht abgedeckt:** Edge Case 16 (Bildschirmtastatur, seit 2026-09-06 offen) und die Frage, ob die auf 320×568 stark angeschnittene Karte (~50px von 220px beim Öffnen) am echten Gerät zum Platzieren ausreicht.

**QA am 2026-09-20 abgeschlossen: 9/9 Acceptance Criteria erfüllt, keine Bugs jeglicher Schwere, Production-Ready.**

Weil das Feature in derselben Sitzung gebaut wurde, habe ich die zentralen Behauptungen **nicht übernommen, sondern neu gemessen** — auf 6 Viewports × 2 Einstiegspfaden statt 5, zusätzlich auf WebKit, und um zwei Dinge erweitert, die die Frontend-Phase nicht prüfte: die **Meter-Wertanzeige** (sie war im Originalbefund mit verdeckt und ist das, was der Ersteller liest) und **768×1024**. Alle 12 Kombinationen bestätigen Sichtbarkeit bei `scrollTop: 0`, zusätzlich per Hit-Test als oberstes Element.

**Der wichtigste Einzelbefund betrifft die Testqualität, nicht das Produkt:** Mit der echten Vorgängerfassung aus `HEAD~1` bestehen die **39 bestehenden PROJ-7-Tests auf beiden Engines vollständig**. Sie hätten den gemeldeten Fehler nie gefangen — sie prüften `toBeVisible()` und Geometrie gegen den Footer, während der Radius im DOM war, formal sichtbar und vom Footer weit entfernt, nur eben hinter der Kartenfläche. Genau diese Lücke schließen die 17 neuen Tests, von denen **8** bei derselben Gegenprobe fallen.

Zusätzlich geprüft und in der Spec nicht gefordert: Tastatur-Reihenfolge (Slider wird **vor** der Karte fokussiert — die Umsortierung im Markup statt per CSS `order` hat ihren Zweck erfüllt), Radius per Tastatur inkl. Deckelung am Maximum, BUG-2-Regression mit `radiusMeters: 37`, und dass die auf 51px angeschnittene Karte trotzdem zuverlässig einen Pin setzt.

**Security ohne Befund:** Markup im Stationsnamen wird als Feldwert gerendert — 0 injizierte Elemente, 0 Dialoge, Sanitizing greift beim Speichern. Manipulierte `radiusMeters` (999999, -5, 0) und ein 200-Zeichen-Name sprengen das Layout nicht.

**Kontrast gemessen:** Label und Wertanzeige 18.21:1, Stufenbeschriftungen 5.30:1, GPS-Button 18.21:1 — alle über der 4.5:1-Vorgabe. Die Stufenbeschriftungen nutzen das Token `text-muted-foreground`, nicht den festen Hex-Wert `text-gq-grey`; die BUG-1-Falle ist vermieden.

**0 Skips in beiden PROJ-7-Dateien** — alle 56 Tests laufen wirklich. Suiten: **Chrome 152: 480 passed / 23 skipped / 0 failed. Mobile Safari: 474 passed / 29 skipped / 0 failed. Unit 226/226.** Build und Lint sauber. Produktcode nach den Gegenproben per `diff` als byte-identisch bestätigt.

**Drei Beobachtungen ohne Bug-Status:** Die Karte ist auf 320×568 beim Öffnen auf **51px** angeschnitten (von 220px) — konstruktiv gewollt, per Scroll vollständig erreichbar, aber nur am echten Gerät zu beurteilen. Edge Case 16 (Bildschirmtastatur) bleibt wie seit 2026-09-06 konstruktiv abgedeckt. Und Firefox bleibt ungetestet (Binary fehlt trotz gegenteiliger `--dry-run`-Meldung; Risiko gering, da nur Flexbox-Standardverhalten genutzt wird und zwei unabhängige Engines identisch messen).

**Am 2026-09-20 nach Production deployt** (Tag `v1.33.0-PROJ-7`, Commits `5143a9f`/`b4b950a`). Pre-Deployment-Checks alle grün: Build sauber, Lint 0 Errors, QA approved ohne Bugs, keine Secrets versioniert. Der Commit `b4b950a` ist per GitHub-API auf `main` bestätigt, Vercels Auto-Deploy damit ausgelöst.

**Die Live-Verifikation konnte diesmal nicht stattfinden — anders als bei allen vorherigen Deploys.** Vercels Bot-Schutz beantwortet jeden Request aus dieser Umgebung mit HTTP 403 (`x-vercel-mitigated: challenge`), auch über einen echten Browser und einen Browser-User-Agent. Dass die Sperre **alle** Routen trifft und auch Dateien erfasst, die dieses Deployment gar nicht angefasst hat (`manifest.webmanifest`, `sw.js`, `icon-192.png` aus PROJ-12), belegt: Es ist eine Zugriffssperre gegen diese Umgebung, kein fehlgeschlagenes Deployment. Belegt ist der Code auf `main` — **nicht belegt ist der Zustand der ausgelieferten Seite.**

**Ein eigener Messfehler, offen benannt:** Mein erster Live-Check wartete 304 Sekunden darauf, dass Sheet-Markup im HTML von `/create` erscheint. Der Check konnte nie anschlagen — das Stations-Sheet rendert clientseitig, das Markup steht auch lokal nicht im HTML (gegengeprüft: 0 Treffer). Er hat den 403 nur verzögert sichtbar gemacht.

**Drei Punkte bleiben zur Prüfung durch den Betreiber** (Handy, `/create` → Quest → ⋮ → „Station bearbeiten"): dass der Ankunftsradius ohne Scrollen sichtbar ist, dass „Aktuelle Position verwenden" vollständig im Bild steht, und ob die unten angeschnittene Karte (lokal 51px von 220px auf 320×568) zum Platzieren eines Pins ausreicht. Der dritte Punkt ist zugleich die offene Frage aus der QA.

## Offenes Refinement: Safe Area — Statusleiste verdeckt die Kopfzeile (2026-09-20)
**PROJ-12** geht von Deployed zurück auf In Progress. Betreiber-Befund vom echten Gerät: *„ich habe die app mobile installiert auf ios. Bei full screen verdeckt meine Uhrzeit, Batterie, WLAN Anzeige auf dem Handy das burger menu, den zurück button"* — im Browser tritt das nicht auf.

**Ursache im Code bestätigt, und sie stammt aus diesem Feature selbst.** `statusBarStyle: "black-translucent"` (`layout.tsx:81`) und `viewportFit: "cover"` (`layout.tsx:88`) sagen iOS zusammen: *Die Seite beginnt bei y=0, zeichne die Statusleiste durchsichtig darüber.* Das ist der randlose Look, den die Entscheidung vom 2026-09-18 ausdrücklich wollte. Was fehlt, ist die Gegenleistung — **wer bei y=0 anfängt, muss die Systemleisten selbst freihalten.** Gemessen: `grep -rn "safe-area" src/` findet vier Vorkommen, **alle vier `inset-bottom`**. `env(safe-area-inset-top)` kommt im gesamten Projekt nicht vor. Fehlende Höhe: 47px mit Notch, 59px bei Dynamic Island.

Warum nur installiert: Im Browser hält Safari mit seiner Adressleiste den Platz von selbst frei. Installiert fällt sie weg.

**Entschieden: Safe Area respektieren, `statusBarStyle` unangetastet lassen.** Der Alternativweg wäre ein Einzeiler gewesen (`statusBarStyle: "default"` — iOS reserviert den Streifen selbst), hätte aber einen massiven schwarzen Balken über die App gelegt und damit die Gestaltungsentscheidung zurückgenommen, die dieses Feature getroffen hat.

**Die Sorge des Betreibers („im Browser sieht alles gut aus, das will ich nicht verlieren") ist durch die Wahl der Mechanismen bereits beantwortet:** `env(safe-area-inset-top)` ist im Browser `0px`, weil Safari den Platz dort freihält, und `statusBarStyle` wird außerhalb des Standalone-Modus gar nicht gelesen. Beide sind von sich aus modus-abhängig — es braucht keine Standalone-Abfrage im Code, und es darf auch keine geben (das wäre eine zweite Wahrheit über denselben Sachverhalt, die Fehlerklasse von BUG-6).

**Geprüftes Risiko:** Die naheliegende Sorge bei `black-translucent` ist weiße Statusleisten-Schrift auf hellem Grund. Im Code nachgesehen statt angenommen — die Karte lebt ausschließlich im Stations-Sheet des Creators und erreicht die oberste Kante nie; jeder Screen, der y=0 berührt, ist dunkel. Kein Konflikt.

**Scope, auf Betreiber-Entscheidung zweimal erweitert:** Die Info-Seiten kommen mit (`info-page-shell.tsx`, sticky Kopfzeile — installiert übers Burger-Menu erreichbar, gleiche Fehlerklasse, gleicher Prüf-Durchlauf). Und der untere Rand kommt mit (gleiche Ursache `viewportFit: "cover"`, gleiches Gerät zum Prüfen).

**Das Nachsehen am unteren Rand hat mehr gefunden als vermutet — und eine meiner Annahmen widerlegt.** Bestätigt betroffen sind **drei Creator-FABs** (`create/page.tsx:263`, `create/[id]/page.tsx:236`, `create/[id]/station/[stationId]/page.tsx:184`), alle auf `fixed bottom-6` ohne Inset. Der Player-Navigations-Screen dagegen, den ich zuerst verdächtigt hatte, zentriert seinen Inhalt per `justify-center` und dürfte den Home-Indikator gar nicht erreichen — das steht als zu prüfende Annahme in Edge Case 26, nicht als Fehler.

**Drei Stellen decken oben neun Screens ab:** `app-header.tsx` allein sieben, dazu der schwebende Burger auf `/` (eigene Stelle, weil bewusst keine Kopfzeile — BUG-10) und `info-page-shell.tsx` für die vier Info-Seiten. Die Backdrops bleiben ausdrücklich unangetastet: Sie sind `fixed inset-0` und liefern genau die Fläche, auf der die durchscheinende Statusleiste steht.

**Der Fallstrick für `/frontend`, vorab benannt:** Der Inset gehört **innerhalb** das Kopfzeilen-Element, nicht davor. Beide Kopfzeilen haben einen halbtransparenten Blur-Hintergrund; ein Margin oder Spacer davor ließe die Blur-Fläche erst unterhalb der Statusleiste beginnen, und darüber stünde ein durchsichtiger Spalt mit blankem Inhalt — schlechter lesbar als der Fehler, den wir beheben. Und: keine feste Ersatzhöhe, keine Plattform-Abfrage. `env()` liefert 0/47/59px für die drei Geräteklassen; jede Konstante ist auf mindestens einer falsch.

**Abnahme:** Playwright emuliert `env(safe-area-inset-*)` nicht — dieselbe Grenze wie beim unteren Overlay. Per Test prüfbar ist, dass der **Browser-Zustand unverändert** bleibt, die 56px-Zeilenhöhe erhalten bleibt und Kopfzeilen-Fläche und Inhalt dasselbe Element sind. Das Erscheinungsbild am iPhone prüft der Betreiber.

Spec ist aktualisiert (1 User Story, 9 Acceptance Criteria in einem eigenen Block, Edge Cases 22–26, 6 Technical Requirements, 4 Produkt- und 4 technische Entscheidungen, 3 neue Open Questions, 1 geschlossene, 3 Ergänzungen in Out of Scope, dazu ein eigener Abschnitt „Refinement 3" mit beiden Messtabellen).

**Eine Vorhersage des vorigen Refinements hat sich bestätigt — und war zu eng.** Der Overlay-Eintrag vom selben Tag schloss mit „Nicht abgedeckt: die Safe Area auf einem echten iPhone … am Gerät zu bestätigen". Richtig vorhergesagt, aber nur für unten, wo sie behandelt war — nicht für oben, wo sie es nie war. Der Befund kam aus genau dem Gerätetest, den der Satz angekündigt hatte.

## Next Available ID: PROJ-15

## Offenes Refinement: BUG-6 — falsche iOS-Erkennung beim Kompass (2026-09-07)
**PROJ-3** geht von Deployed zurück auf In Progress. BUG-6 stand als vermutliches Testumgebungs-Artefakt in den Notizen ("Playwright liefert unter Chrome keinen Fix, `position` bleibt null"). Auf echtem Chrome 152 reproduziert und instrumentiert — **diese Diagnose ist widerlegt**: Die Position liegt vor, die Distanz rendert mit `12514m`, der Nachbartest im selben Block besteht.

Die wahre Ursache ist `isIOS()` in `src/hooks/use-device-orientation.ts:22-27`. Die Funktion schließt allein daraus auf iOS, dass `DeviceOrientationEvent.requestPermission` eine Funktion ist — Desktop-Chrome erfüllt das ebenfalls (gemessen: beide `"function"`). Dadurch ist `canRequestPermission === true`, und `navigation-screen.tsx:168` zeigt den "Kompass aktivieren"-Button statt des Hinweises. Der Button ist eine Sackgasse: `requestPermission()` liefert `denied`, und **erst danach** erscheint der Rat, der tatsächlich hilft.

Nutzerauswirkung: Auf Chrome bekommt der Spieler einen Button angeboten, der garantiert fehlschlägt, bevor er die richtige Anweisung sieht — genau der stille Ausfallmodus, den das Refinement vom 2026-09-06 beseitigen wollte. Die Feature-Erkennung greift nur eine Ebene zu flach.

Beschlossene Lösung (zwei unabhängige Schutzebenen):
1. **Echte Plattformerkennung** — `requestPermission`-Duck-Typing allein genügt nicht, zusätzliches Plattform-Signal nötig
2. **`denied`-Rückfall** — ein abgelehntes oder fehlgeschlagenes `requestPermission()` mündet sofort im "Laufe ein paar Schritte"-Zustand, unabhängig davon, ob die Erkennung richtig lag

Ebene 2 macht das Verhalten auch auf **Android-Chrome** korrekt, das lokal nicht messbar ist (kein Gerät, kein lauffähiges Chromium-Binary) — als offene Frage in der Spec vermerkt, für die Korrektheit aber unkritisch.

Spec ist aktualisiert (2 neue Acceptance Criteria, Edge Cases 13–14, 2 Technical Requirements, 2 Decision-Log-Einträge, 1 Open Question).

**Frontend umgesetzt am 2026-09-07.** `isIOS()` in `use-device-orientation.ts` ist aufgeteilt in `hasRequestPermissionApi()` (notwendig) und eine echte Plattformprüfung (UA + `maxTouchPoints` für iPadOS). Die zweite Verteidigungslinie war bereits im Code vorhanden und ist jetzt durch Tests festgehalten. `navigation-screen.tsx` blieb unverändert — die Render-Logik war korrekt, sie bekam nur ein falsches `canRequestPermission`.

Für den Hook gab es bisher **keine Unit-Tests** — genau die Lücke, durch die der Fehler live gehen konnte. Jetzt 9 Tests in `use-device-orientation.test.ts`, per Gegenprobe abgesichert (mit alter Erkennung fallen 3 davon um). Der ursprünglich fehlschlagende E2E-Test besteht auf echtem Chrome 152; PROJ-3 19/19 auf Chrome, volle Suite **285 passed / 2 skipped / 0 failed** auf Mobile Safari, Unit-Suite 186/186, Build und Lint sauber.

Weiterhin gilt: Die reguläre `playwright.config.ts` ist **unverändert** (Chromium-Binary weiterhin kaputt), der Chrome-Lauf lief über eine temporäre Config. Ohne `channel: 'chrome'` kann die Standard-Suite diese Klasse von Fehlern nicht sehen.

**QA am 2026-09-07 abgeschlossen: keine Bugs im Produktcode, Production-Ready.** Beide Testebenen wurden per Gegenprobe geschärft (mit alter Erkennung fallen 3 Unit- und 1 E2E-Test um) — die Suite fängt den Regress also wirklich. Eine UA-Sonde hat sieben Plattform-Grenzfälle gegen die echte Implementierung gemessen, darunter Chrome/Firefox auf iOS, iPad mit „Desktop-Website" und echter Mac; alle korrekt. Ein Fehler im **neuen Test selbst** (engine-blind, schlug auf WebKit fehl) wurde dabei gefunden und behoben — das Produkt war auf beiden Engines richtig.

Suiten: Unit 186/186, Mobile Safari 288 passed / 2 skipped / 0 failed, **Desktop Chrome 152: 290 passed / 0 failed** — der erste grüne Gesamtlauf auf dieser Engine im Projekt. PROJ-3 jetzt 22 statt 19 Tests.

Offen bleiben: **Firefox** (Binary fehlt trotz gegenteiliger `--dry-run`-Meldung, kein Firefox in `/Applications`; Risiko gering, da Firefox `requestPermission` gar nicht bereitstellt) und ein **echtes Android-Gerät**. Unverändert gilt: `playwright.config.ts` zeigt weiter auf das kaputte Chromium-Binary — solange das so bleibt, sieht die Standard-Suite genau die Fehlerklasse nicht, aus der BUG-6 entstand.

**Am 2026-09-07 nach Production deployt** (Tag `v1.24.0-PROJ-3`) — live auf https://geoquesty.vercel.app und dort verifiziert. Der Fix ist im ausgelieferten Bundle nachgewiesen: `21a22d389651ae9d.js` enthält die neue Erkennung im Klartext (`/iPad|iPhone|iPod/.test(e)` und `maxTouchPoints>1`). Live-Smoke-Test auf beiden Engines bestanden, alle Nutzerrouten HTTP 200, Ladezeit 0,06–0,14s, Security-Header aktiv.

Zwei Beobachtungen ohne Regressionscharakter: `/play/<id>` liefert serverseitig 404, während der Client korrekt rendert (systembedingt — Quests liegen nur im localStorage; für den Nutzer unsichtbar, aber relevant, falls Sharing/SEO je ein Thema wird). Und Desktop-WebKit mit iPhone-Emulation hat gar kein `requestPermission` — die Erkennung fällt dort korrekt auf den Hinweis zurück.

**PROJ-3 ist abgeschlossen.** Offen im Projekt bleibt die kaputte `playwright.config.ts`: Sie zeigt weiter auf das 428-KB-Chromium-Fragment. Solange das so ist, sieht die Standard-Suite genau die Fehlerklasse nicht, aus der BUG-6 entstand — ein Einzeiler (`channel: 'chrome'`), der nicht in den Scope von QA oder Deploy fällt.


## Offenes Refinement: „Support me" — Ko-fi-Link in der Navigation (2026-09-09)
**PROJ-1** und **PROJ-13** — ein Refinement über zwei Specs, weil die App zwei Kopfzeilen hat. Vom Betreiber angefordert: ein Weg, das Projekt freiwillig zu unterstützen. Geo Quest ist laut PRD kostenlos und ohne Abo — Ko-fi ist damit die einzige Gegenleistung, die es überhaupt gibt.

Das Ziel ist in beiden Fällen dasselbe: https://ko-fi.com/technolomagie, neuer Tab, `rel="noopener noreferrer"`. Die URL liegt als Konstante in `src/lib/app-nav.ts`, damit beide Einbauorte nicht auseinanderlaufen.

**PROJ-1 — Burger-Menu (alle Screens):** neue vierte Gruppe **Unterstützen** mit dem Eintrag **Support me** und Kaffeetassen-Icon (`Coffee` aus lucide, bereits verfügbar). Letzte Position, keine Farbe, kein Badge, keine Animation — Adressat sind die erwachsenen Ersteller (Eltern, Lehrkräfte, Jugendleiter), nicht die Spieler, die eine fertige Quest laufen. `APP_NAV_GROUPS` bekommt dafür ein `external`-Flag am Link statt einer zweiten Datenstruktur; das Flag steuert `target`, `rel` und den unterdrückten `aria-current`-Zweig (ein externes Ziel ist nie „die aktuelle Seite").

Nicht in die App-Kopfzeile: Sie hat auf 360px genau zwei Plätze und dazwischen einen Titel, der bereits truncatet.

**PROJ-13 — Kopfzeile von `/about` und `/anleitung`:** ein Icon-Button **ohne Text**, links neben „Zur App", als Ghost (kein Rahmen, keine Füllung). Die ausgeschriebene Beschriftung trägt das Menu; hier wäre ein vierter beschrifteter Button entweder umgebrochen oder hätte ein Tap-Ziel unter 44px gedrückt. `/impressum` und `/datenschutz` bekommen ihn nicht.

Damit ist die seit dem 2026-09-05 offene Frage nach dem Ko-fi-Platzhalter geschlossen — **aber anders als vorgesehen**: Der reservierte Platz war als Tausch gegen „Zur App" gedacht. Das wäre falsch gewesen. „Zur App" ist der Conversion-Weg der Seite, und Refinement 4 hat die Hero-CTAs eigens auf `/create` gezogen, um genau diesen Weg zu verkürzen. Ko-fi bekommt einen eigenen Platz daneben, statt den fremden zu erben.

Beide Specs sind aktualisiert (PROJ-1: User Story 9, 8 Acceptance Criteria, Edge Cases 13–16, 5 Produkt- und 4 technische Entscheidungen; PROJ-13: 11 Acceptance Criteria, 3 Edge Cases, 3 Technical Requirements, 4 Produkt- und 4 technische Entscheidungen, 1 geschlossene Open Question).

**Frontend umgesetzt am 2026-09-09.** Fünf Dateien: `app-nav.ts` (Konstante `KOFI_URL`, `external`-Flag am Link, vierte Gruppe), `app-nav-menu.tsx` (externer Zweig in der bestehenden Render-Schleife — gleiche Typografie, kleines Pfeil-Icon, `sr-only`-Hinweis auf den neuen Tab), `info-page-shell.tsx` (Prop `showSupport`, Ghost-Icon 44×44) sowie `/about` und `/anleitung`, die die Prop setzen.

Auf 320×568 gemessen statt geschätzt: Icon x=99, „Zur App" x=147, Burger x=256 — alle 44px hoch, gleiche vertikale Mitte, kein Überlauf. BUG-7 bleibt behoben.

**Mitgenommen wie geplant:** Der JSON-LD-Nachzug auf `/about` (`suggestedMinAge`/`MaxAge` von 10/15 auf 8/16) deckt sich jetzt mit dem sichtbaren FAQ-Text.

20 neue E2E-Tests in `tests/proj-1-kofi-support.spec.ts` — **20/20 auf Desktop Chrome 152 und 20/20 auf Mobile Safari**, dazu Unit 186/186, Build und Lint sauber. Per Gegenprobe geschärft: ohne `external`-Flag fallen genau die zwei Tests des Externen-Link-Vertrags, ohne `showSupport` auf `/anleitung` genau der zuständige eine. Drei Fehler in den **Tests selbst** wurden dabei gefunden und behoben (deutsche Anführungszeichen in JS-Strings, `@graph`-Struktur des JSON-LD, und ein Ausrichtungstest, der den unter `sm` ausgeblendeten „Anleitung"-Link mitzählte und 28px Versatz meldete, wo keiner war) — das Produkt war in allen drei Fällen richtig.

**Beim Testen gelernt (für künftige Läufe relevant):** Zwei gleichzeitig gegen denselben Dev-Server laufende Playwright-Suiten erzeugen `page.goto`-Timeouts, die wie echte Produktfehler aussehen — ein Zwischenlauf meldete so 5 WebKit-Fehler bei 15,7 Minuten Laufzeit, dieselbe Datei allein läuft in 11 Sekunden grün durch. Immer nur eine Suite gleichzeitig starten.

**Nachtrag 2026-09-10 — Tooltip:** Das Kaffeetassen-Icon in der Kopfzeile zeigt bei Hover und Tastatur-Fokus „Unterstütze mich". Neue Client-Komponente `src/components/support-link.tsx`, damit `InfoPageShell` eine Server-Komponente bleibt — `/about` und `/anleitung` stehen im Build weiterhin als statisch (`○`). Das `aria-label` bleibt, weil der Tooltip auf Touch unsichtbar ist. Damit ist die entsprechende Open Question in beiden Specs geschlossen. Spec-Suite jetzt **24 Tests, 24/24 auf Chrome und 24/24 auf Mobile Safari**.

**Zwei vorbestehende Testfehler dabei gefunden und behoben** — beide in Nachbarsuiten, beide unabhängig vom Ko-fi-Refinement:
1. `proj-13-info-refinement.spec.ts` prüfte auf „10 bis 15 Jahren", den Wortlaut vor der Copy-Änderung des Betreibers vom 2026-09-09. Assertion auf „8 bis 16 Jahren" gezogen — dieselbe Drift, die auch im PRD und im JSON-LD steckte.
2. `proj-13-landing-qa.spec.ts` („keine fremden Hosts") schlägt **nur gegen `npm run dev`** fehl: Vercel Analytics lädt dort ein Debug-Skript. Gegen den Production-Build gemessen: **0 externe Requests**. Als Kommentar im Test festgehalten.

**QA am 2026-09-10 abgeschlossen: 22/22 Acceptance Criteria erfüllt (8 in PROJ-1, 14 in PROJ-13), keine Bugs, Production-Ready.**

Erstmals **gegen den Production-Build** getestet statt gegen den Dev-Server — das erledigt nebenbei die beiden Testfehler aus der Frontend-Phase: Beide Suiten sind gegen `next start` grün, weil das Vercel-Analytics-Debug-Skript dort nicht existiert. **Chrome 152: 368/368. Mobile Safari: 366 passed / 2 skipped / 0 failed** (beide Skips sind vorbestehende Plattform-Grenzen: kein Hover auf Touch, keine Clipboard-Berechtigung in WebKit). Der Lauf dauert gegen Production 43 Sekunden statt Stunden gegen den Dev-Server — für künftige QA-Läufe der bessere Weg.

Gemessen statt geschätzt: **Kontrast 19.40:1 (Dark) und 18.21:1 (Light)** bei 4.5:1 Vorgabe. Der Menu-Eintrag ist typografisch identisch zu „Play" (20px Anton, 48px Zeilenhöhe, 1px Trennlinie). Kopfzeile auf 375/768/1440px ohne Overflow, alle Tap-Ziele 44px.

**Security-Audit ohne Befund.** Kernpunkt: `window.opener === null` und leerer `document.referrer` im geöffneten Tab **tatsächlich gemessen** — `noopener noreferrer` wirkt, statt nur als Attribut dazustehen. 0 externe Requests im Production-Build.

Edge Case 14 (Ko-fi blockiert) ist in der Testumgebung real eingetreten — der Proxy liefert für ko-fi.com 403. Das Verhalten war exakt wie spezifiziert: Der neue Tab zeigt den Fehler, die App im Ursprungstab bleibt unversehrt. Genau dafür öffnet der Link in einem neuen Tab.

Zwei Auffälligkeiten im ersten Messdurchlauf waren **Fehler in meiner Messung**, nicht im Produkt: Der „Teal-Hintergrund" des Icons war der Hover-Zustand (die Sonde maß mit dem Mauszeiger darauf), und der „fehlende neue Tab" war die 403-Sperre.

**Am 2026-09-10 nach Production deployt** (Tag `v1.27.0-PROJ-13`) — live auf https://geoquesty.vercel.app und dort verifiziert. Vercel deployte automatisch von `main`, live nach ~60 Sekunden.

Alle sieben Routen HTTP 200 mit 0,08–0,46s Ladezeit. Die Ko-fi-Platzierung im ausgelieferten HTML gezählt: `/about` und `/anleitung` je 1×, `/impressum` und `/datenschutz` **0×**. Der JSON-LD-Nachzug ist im Markup nachgewiesen (`suggestedMinAge: 8`, `suggestedMaxAge: 16`), deckungsgleich mit dem sichtbaren FAQ-Text.

**Im Live-Browser bestätigt:** Tooltip „Unterstütze mich" bei Hover, Menu-Gruppen `["App","Info","Rechtliches","Unterstützen"]`, `aria-current` null, Tap-Ziele 44×44 auf 320px ohne Überlauf — und ein **echter Klick öffnet einen neuen Tab mit `window.opener === null`**, die Ursprungsseite bleibt stehen. 0 fehlgeschlagene Requests, keine 4xx/5xx. Security-Header aktiv.

BUG-7 bleibt behoben (CTA auf 1366×768 und 1440×900 über dem Falz). Die Nachbarseiten wurden wegen der Änderung an `InfoPageShell` mitgeprüft und sind unbeschädigt — die Prompt-Vorlage auf `/anleitung` ist mit 6956 Zeichen vollständig, identisch zum vorigen Deploy.

**PROJ-13 ist Deployed.** PROJ-1 bleibt auf In Progress — nicht wegen dieses Refinements (dessen Ko-fi-Teil ist live und verifiziert), sondern weil die QA des Navigations-Umbaus vom 2026-09-06 dort weiterhin aussteht.

**Mitzunehmen im selben `/frontend`-Lauf:** Das `WebApplication`-JSON-LD auf `/about` gibt Maschinen `suggestedMinAge: 10` / `suggestedMaxAge: 15`, während der sichtbare FAQ-Text seit der Copy-Änderung des Betreibers „etwa 8 bis 16 Jahren, aber niemand ist zu alt" sagt. Zwei Zahlen in `src/app/(info)/about/page.tsx`, auf 8 und 16 zu ziehen. Aufgefallen beim Angleichen des PRD, das dieselbe veraltete Spanne trug.

PROJ-13 geht dafür von Deployed zurück auf In Progress. PROJ-1 stand bereits auf In Progress (die QA des Navigations-Refinements vom 2026-09-06 steht weiterhin aus) und bleibt dort.


## Offenes Feature: PROJ-14 — KI-Anleitung wird zu „Coming soon“ (2026-09-17)
Der Betreiber hat entschieden, **die App ohne die KI-Anleitung zu launchen**, die Funktion aber anzukündigen. Die Seite `/anleitung` ist fertig gebaut und deployt (Tag `v1.27.0-PROJ-13`) — sie wird nicht gelöscht, sondern ausgeblendet.

Der Grund für ein eigenes Feature statt eines Refinements: Die Anleitung ist an **fünf Stellen** eingewoben, drei davon werblich — Burger-Menu (PROJ-1), Hero-CTA auf `/about` und Leeransicht von `/create` (PROJ-6), dazu der einzige Textlink im Desktop-Header aller Info-Seiten. Das reicht über drei bestehende Features und wird später als Ganzes zurückgenommen.

Entschieden: Route bleibt erreichbar und zeigt eine Ankündigung (HTTP 200 statt 404, damit geteilte Links und QR-Codes nicht ins Leere laufen); der Menu-Eintrag bleibt mit „Bald“-Kennzeichnung klickbar; die beiden werblichen CTAs entfallen ersatzlos; der Header-Textlink entfällt ohne Ersatz. Kein Datum, kein Zeitraum — ein verpasster Termin auf einer Live-Seite kostet mehr, als die Angabe einbringt. Die Ankündigung zeigt einen kurzen Ausblick inkl. der vorhandenen vier „Was dabei herauskommt“-Punkte, aber **weder Prompt noch Schritte**.

Mitgenommen: Die FAQ-Antwort „Wie lange dauert das Erstellen?“ auf `/about` beschreibt heute die KI-Anleitung als verfügbaren Weg und wird auf das manuelle Erstellen umgeschrieben. Da die FAQ-Konstante zugleich das `FAQPage`-JSON-LD speist, zieht die strukturierte Angabe automatisch mit.

**Architektur am 2026-09-17 entworfen.** Die Schaltstelle ist ein fester Wahrheitswert in `src/lib/app-nav.ts` — der Datei, die heute schon Burger-Menu und Info-Kopfzeile gemeinsam speist. Auf Wunsch des Betreibers steuert er **alle fünf** Stellen, nicht nur die von der Spec geforderten zwei: Freischalten kostet damit eine Zeile statt eines Wiedereinbaus aus der Git-History. Preis ist Code für die entfernten CTAs, der zum Launch nicht ausgeführt wird.

Bewusst keine Umgebungsvariable: Die betroffenen Seiten sind statisch (0,07–0,09 s) und blieben es nur mit einem festen Wert. Nebeneffekt, der ein Spec-Kriterium erfüllt — der Prompt landet gar nicht erst im ausgelieferten HTML, statt nur versteckt zu werden. Kein neues Paket; die vorhandene `badge.tsx` wird bewusst **nicht** genutzt (gefüllte Pille, zu kräftig neben der kursiven Menu-Schrift). Kein Backend, keine gespeicherten Daten.

Zu beachten in `/frontend`: Die bestehenden Suiten prüfen `/anleitung` an 41 Stellen über sechs Dateien — diese Tests werden absichtlich falsch und sind auf den neuen Zustand zu ziehen, nicht zu löschen.

**Frontend umgesetzt am 2026-09-17.** Sechs Dateien, kein neues Paket, keine neue Komponente, keine neue Route. `info-page-shell.tsx` musste entgegen der Architektur-Annahme **gar nicht** angefasst werden: Es rendert `HEADER_NAV_LINKS` in einer Schleife, eine leere Liste ergibt von selbst keine Ausgabe — die Kopfzeile bleibt damit auch Server-Komponente.

Der Kern ist gemessen statt behauptet: **Der Prompt ist nicht ausgeliefert, nicht bloß versteckt** — 0 Treffer im gebauten HTML von `/anleitung` und 0 im gesamten Client-Bundle. Die Kennzeichnung im Menu misst `rgb(160,168,171)`, 11px, rechtsbündig; das Tap-Ziel bleibt 231×48px. `/anleitung` bleibt statisch (`○`), alle sieben Routen HTTP 200. Das `FAQPage`-JSON-LD zog automatisch mit, weil die FAQ-Konstante beides speist.

**Der freigeschaltete Zustand ist geprüft** (Betreiber-Entscheidung): `npm run test:e2e:freigeschaltet` legt den Schalter um, baut, testet und stellt ihn zurück — auch bei Abbruch. **22/22 auf beiden Engines.** Damit ist die zentrale Behauptung belegt: Eine Zeile bringt Seite, Prompt, Schritte, Troubleshooting, beide CTAs und den Header-Link gleichzeitig zurück.

Per Gegenprobe geschärft: Mit entferntem Badge fallen genau die 2 zuständigen Tests; lässt man `HEADER_NAV_LINKS` den Schalter ignorieren — der „stille Fehler", den das Feature verhindern soll — fallen 4, darunter der Kopfzeilen-Test.

Die 41 bestehenden Assertions sind **gezogen, nicht gelöscht**: 11 Tests zu den Anleitungs-Inhalten hängen jetzt per `test.skip` am Schalter (sie müssen beim Freischalten wieder greifen), der Rest prüft den neuen Zustand. Zwei Stellen fielen erst im Lauf auf — `getByRole("link", { name: "Anleitung", exact: true })` trifft nicht mehr, weil der Eintrag „AnleitungBald" heißt.

**Drei Fehler in den Tests selbst gefunden und behoben** (das Produkt war jeweils richtig): ein mehrdeutiger Locator, eine Jahres-Regex, die auf dem Copyright-Jahr der Fußzeile ansprang, und `nav a`, das die Fußzeilen-Navigation mitzählte (11 statt 7). Dazu zwei Messfehler in der Browser-Sonde, die wie Produktfehler aussahen.

Suiten: **Chrome 152: 405 passed / 22 skipped / 0 failed. Mobile Safari: 404 passed / 23 skipped / 0 failed. Freigeschalteter Zustand: 22/22 auf beiden Engines. Unit 186/186.** Build und Lint sauber. Neu: 27 Tests in `proj-14-anleitung-coming-soon.spec.ts`, 11 in `proj-14-anleitung-freigeschaltet.spec.ts`.

Gelaufen über `playwright.prod.config.ts` (Chrome + Production-Build) — die reguläre Config zeigt weiterhin auf das kaputte Chromium-Binary.

**QA am 2026-09-18 abgeschlossen: 25/25 Acceptance Criteria erfüllt, keine Bugs, Production-Ready.**

Die beiden zentralen Behauptungen habe ich **nicht** aus der Frontend-Phase übernommen, sondern unabhängig nachgemessen. Erstens: Der Prompt ist nicht ausgeliefert, nicht bloß versteckt — live vom Server geprüft, dazu **alle 15 JS-Dateien einzeln abgerufen**, die die Seite lädt, und das gesamte `static`-Verzeichnis; kein Treffer. Zweitens: Ich habe den Schalter selbst umgelegt, gebaut und gemessen — die volle Anleitung kommt zurück, die Ankündigung verschwindet, alle drei Einstiegspunkte sind wieder da; danach zurückgesetzt und per `diff` als byte-identisch bestätigt.

Kontrast gemessen statt geschätzt: Die Kennzeichnung erreicht **8.02:1 (Dark)** und **5.30:1 (Light)**. Der Light-Wert ist der interessante — der naheliegende feste Hex-Wert `text-gq-grey` hätte dort **2.29:1** ergeben und WCAG AA verfehlt, exakt die als BUG-1 dokumentierte Falle. Die Token-Wahl hat einen latenten Wiederholungsfehler vermieden.

**BUG-7 bleibt behoben** — weil der Hero einen Button verliert, auf allen elf Referenz-Viewports nachgemessen (320×568 bis 1920×1080), überall vollständig über dem Falz. Edge Cases 3, 4, 5, 6, 7, 9 und 10 geprüft; zusätzlich die Tastaturbedienung, die in der Spec nicht stand.

**Security-Audit ohne Befund:** Header aktiv, keine Eingabefelder, keine Secrets in den Bundles, Markup in Route und Query-String wird nicht reflektiert, als externer Host nur Ko-fi mit `noopener noreferrer`.

Per Gegenprobe geschärft: Eine wieder eingebaute Zeitangabe in der FAQ lässt 2 Tests fallen; lässt man die Seite den Schalter ignorieren — die volle Anleitung ginge live, während die App sie ankündigt — fallen 6. Die 22 bzw. 23 Skips sind nachvollzogen und keine stillgelegten Tests.

Suiten gegen den Production-Build: **Chrome 152: 405 passed / 22 skipped / 0 failed. Mobile Safari: 404 passed / 23 skipped / 0 failed. Freigeschalteter Zustand: 22/22 auf beiden Engines. Unit 186/186.**

**Drei Beobachtungen ohne Bug-Status:** „Quest importieren" misst 42px statt der geforderten 44px — **vorbestehend aus PROJ-6**, in dieser Session unverändert, aber ein eigenes Refinement wert (zusammen mit BUG-2). 320×568 hat weiterhin nur 27px Luft unter dem CTA (unverändert). Und die lokalen Konsolenfehler stammen von Vercel Analytics, das nur in Production existiert — sie treten auf allen Routen auf, auch auf unveränderten. PROJ-13 und PROJ-1 bleiben auf Deployed — dieses Feature ändert sie, ohne ihren Stand zurückzusetzen.

**Am 2026-09-18 nach Production deployt** (Tag `v1.29.0-PROJ-14`, Commit `18007e0`) — live auf https://geoquesty.vercel.app/anleitung und dort verifiziert. Vercel deployte automatisch von `main`, live nach ~42 Sekunden.

**Der Kern ist in Production bestätigt:** Der Prompt steht in keinem der **15 ausgelieferten JS-Bundles** (alle einzeln abgerufen) und in keiner Zeile des HTML. Alle sieben Routen HTTP 200 mit 0,07–0,20 s. Die Einstiegspunkte sind weg (`/about`, `/create`, Header-Textlink auf allen vier Info-Seiten je 0×), das Menu zeigt „AnleitungBald" mit ARIA-Namen `link "Anleitung Bald"` und **8.02:1 Kontrast**, ein echter Klick führt auf die Ankündigung. Das `FAQPage`-JSON-LD trägt die neue Antwort ohne Zeitangabe.

**BUG-7 bleibt behoben** — acht Viewports nachgemessen, die Werte decken sich **exakt** mit den lokalen (320×568: +27px, 1366×768: +208px, 1440×900: +340px). Nachbarseiten unbeschädigt, WebKit strukturgleich, Security-Header aktiv inkl. HSTS. **0 fehlgeschlagene Requests, 0 Konsolenfehler** bei frischem Erstbesuch.

Zwei Fehlspuren sind in der Spec dokumentiert, damit sie niemand erneut verfolgt: ein vermeintlicher 404 auf `/anleitung` (kam aus dem vorherigen Navigationsschritt desselben Skripts, nicht aus dem Seitenaufruf) und eine scheinbar fehlende JSON-LD-Frage (`grep -c` zählt Zeilen, das Production-HTML ist minifiziert).

Mit ausgeliefert: `playwright.prod.config.ts` (löst das projektlange Chromium-Problem über das vorhandene Chrome 152) und `scripts/test-anleitung-freigeschaltet.mjs` — der einzige Weg, die zurückgehaltene Anleitung am Leben zu halten.

**Zum Freischalten:** `ANLEITUNG_VERFUEGBAR = true` in `src/lib/app-nav.ts`. Vorher `npm run test:e2e:freigeschaltet` laufen lassen.

**PROJ-14 ist abgeschlossen.**

## Offenes Feature: PROJ-12 — PWA-Installation (2026-09-19)
**PROJ-12** geht von Architected auf In Progress. Das PRD nennt Geo Quest im ersten Satz eine PWA und führt „PWA-Installation" als P0 — technisch war davon **nichts** vorhanden: kein Manifest, kein Service Worker, keine App-Icons.

**Frontend umgesetzt am 2026-09-19.** Elf Dateien, **kein neues Paket** (die 41 Abhängigkeiten bleiben). Manifest als `src/app/manifest.ts` (Next.js prüft die Feldnamen im Build), vier eingecheckte Icons, ein handgeschriebener Service Worker (91 Zeilen, überwiegend Begründung), eine eigenständige Offline-Seite und der Installations-Hinweis auf `/` und `/play`.

**Der Kern ist gemessen, nicht behauptet:** Der Cache enthält nach Navigation über drei Screens **genau `["/offline.html"]`**. Das PRD-Non-Goal „Kein Offline-Modus" ist damit strukturell unverletzbar — es liegt nichts im Cache, woraus sich die App zusammensetzen ließe. Zugleich ist der Worker die Bedingung dafür, dass Chrome auf Android überhaupt einen Installationsweg anbietet.

**Zwei Konflikte, die die Architektur nicht vorhergesehen hatte — beide gemessen aufgedeckt:**

1. **Der Hinweis auf `/` brach ein PROJ-1-Kriterium.** Die Architektur schrieb „hinter den Mode-Cards kostet er nichts". Gemessen ist die volle Karte 195px hoch und ließ die Seite auf **799px** wachsen; der bestehende Test prüft aber, dass der Startscreen auf 360×640 **gar nicht scrollt**. Zwei Tests fielen, zuerst nur auf WebKit. Nach Rückfrage beim Betreiber trägt `/` jetzt eine **kompakte einzeilige Fassung** von exakt 44px — die Seite endet bei **640 von 640**. `/play` behält die volle Karte, dort gibt es kein solches Kriterium.

2. **Der Service Worker legte 6 fremde Tests lahm.** Sobald er die Seite kontrolliert, greift Playwrights `page.route` nicht mehr — die Sonde zeigte **0 Treffer im Mock** und eine Antwort der echten Nominatim-API. Playwright empfiehlt dafür in der eigenen Typdefinition `serviceWorkers: 'block'`; beide Configs setzen das jetzt, die PROJ-12-Suite hebt es für sich auf. Das Produkt war in allen 6 Fällen richtig.

**Die Icons sind nachgemessen statt geschätzt:** Die Architektur schätzte das Pin-Motiv auf x 62..392, y 250..670 — per Pixel-Analyse liegt es bei **x 90..391, y 276..670**. Die von ihr gefundene motivfreie Spalte bei x 392..401 ist exakt bestätigt. Eine Abweichung war nötig: Der Icon-Grund bekommt **rgb(4,10,11)** statt des Tokens `#0B0F12`, weil das Quellbild dunkler ist und an der Zuschnittkante sonst ein sichtbares Rechteck stand. Das maskable-Icon hält das Motiv nachgemessen in den inneren 80% (x 139..372 von 512).

`sips` reichte dafür nicht (padded nur einseitig, kein zentriertes Compositing) — stattdessen ein eingechecktes Swift-Skript über CoreGraphics, ebenfalls ohne Abhängigkeit, dafür reproduzierbar statt einmalig von Hand.

**Ein Fehler, den erst die Tests fanden:** Bei blockiertem `localStorage` schreibt der Erststart-Dialog seinen Schlüssel nicht — der Installations-Hinweis wäre in dieser Sitzung **nie** erschienen, obwohl der Dialog längst weg war.

**33 Unit-Tests** für den Hook, den die Architektur ausdrücklich als testbedürftig markierte („die Lücke, durch die BUG-6 live gehen konnte, war ein ungetesteter Hook"). Die Plattform-Erkennung ist gegen sieben echte User-Agents geprüft, darunter die drei Fälle, die wie iOS-Safari aussehen und keines sind: Chrome auf iOS, Firefox auf iOS und ein echter Mac. Dazu **32 E2E-Tests**.

Suiten gegen den Production-Build: **Unit 219/219** (vorher 186), **Chrome 153: 436 passed / 23 skipped / 0 failed**, **Mobile Safari: 430 passed / 29 skipped / 0 failed** — beide Engines fahren dieselben 459 Tests, die Skip-Differenz von 6 ist erklärt (5 Offline-Navigationstests nur Chrome, 1 iOS-Test nur WebKit). Build und Lint sauber; `/`, `/play` und die Info-Seiten bleiben statisch (`○`).

**Drei Gegenproben, alle mit dem erwarteten Ergebnis:** das BUG-6-Muster (iOS an einem Merkmal) lässt 5 Unit-Tests fallen; App-Shell mitcachen lässt den zuständigen Cache-Test fallen; die volle Karte auf `/` lässt den Scroll-Wächter fallen.

**Nicht per Test abgedeckt und bewusst benannt:** das echte Homescreen-Icon (Augenschein), die Offline-*Navigation* auf WebKit (`setOffline` + `goto` wirft dort einen internen Playwright-Fehler — ersatzweise prüfen beide Engines den Cache-Inhalt), der echte `beforeinstallprompt` und Edge Case 7 (Standortfreigabe in der installierten iOS-PWA, nur am Gerät zu klären).
**QA am 2026-09-19 abgeschlossen: 30 von 31 Acceptance Criteria erfüllt (1 braucht ein echtes iPhone), keine Critical- oder High-Bugs, Production-Ready.**

Weil das Feature in derselben Sitzung gebaut wurde, habe ich die beiden zentralen Behauptungen **nicht übernommen, sondern mit eigenen Sonden neu gemessen.**

**Erstens der Cache.** Härter geprüft als in der Frontend-Phase: alle sieben Routen besucht, zwei doppelt, zweimal zurück, einmal vorwärts, dazu ein Reload — und anschließend noch ein kompletter Quest-Durchlauf mit Karte und Modulen. Ergebnis unverändert `{"geoquest-offline-v1":["/offline.html"]}`. **Ein Eintrag, ein Cache-Name.** Dokument-Antworten kamen durchgehend vom Netz.

**Zweitens die Icons**, per Pixel-Analyse statt per Augenmaß: Der hellste Randpixel aller vier Dateien misst **11 von 255** — kein weißer Rand, alle Ecken einfarbig dunkel, also auch keine doppelte Abrundung. **Kein einziger Motivpixel** liegt außerhalb einer Kreismaske. Das maskable-Icon hält sein Motiv bei x 139..372 von 512, vollständig in den inneren 80%. Auf 48px herunterskaliert und angesehen: der Pin ist klar erkennbar.

**Security-Audit ohne Befund.** Der Service Worker ist neue Angriffsfläche und wurde entsprechend behandelt: Cache-Poisoning über manipulierte URLs (`<script>` in Query und Hash) lässt den Cache bei exakt einem Eintrag; die Offline-Seite reflektiert nichts, hat **0 `<script>`-Tags** und genau einen Inline-Handler (`onclick="location.reload()"`); `sw.js` enthält **keine absolute URL** und kann damit keine fremde Origin ansprechen. Security-Header sind auf allen neuen Dateien aktiv, `sw.js` mit `max-age=0` — eine neue Version kann nicht von einem HTTP-Cache festgehalten werden.

Gemessen statt geschätzt: **schlechtester Kontrast 6.61:1**, alle Tap-Ziele **44px**, die 30-Tage-Grenze exakt getroffen (1/29/29,99 Tage kein Hinweis — 30,01/31 Tage wieder da). Auf echtem WebKit ohne künstliches Event zeigt iOS beide Schritte und **0 Installieren-Buttons** — die BUG-6-Lehre hält.

**BUG-11 (Low, neu):** Der Guard in `service-worker-registration.tsx:22` prüft, ob `navigator.serviceWorker` *existiert*, nicht ob es einen Wert hat. Setzt eine Härtungs-Erweiterung die Eigenschaft auf `undefined`, wirft `.register()` einen Konsolenfehler. **Die App bleibt dabei vollständig bedienbar** (`/`, `/play`, `/create` geprüft), und im Normalfall tritt es nicht auf: Ein echter Browser ohne Unterstützung lässt die Eigenschaft weg, dann greift der Guard einwandfrei. Ein Einzeiler (`if (!navigator.serviceWorker) return;`) deckt beide Formen ab. Nicht blockierend.

**BUG-11 noch am 2026-09-19 behoben.** Die Prüfung fragt jetzt den **Wert** ab statt die Existenz der Eigenschaft; damit sind beide Formen abgedeckt. Über den gemeldeten Fehler hinaus abgesichert: Die Registrierung läuft erst beim `load`-Ereignis, also später als die Prüfung im Effekt — in diesem Fenster kann eine Erweiterung die Eigenschaft noch ersetzen, deshalb prüft `register()` ein zweites Mal. **Die eigentliche Lücke war, dass die drei Wege ohne Service Worker gar keinen Test hatten** — genau so konnte der Fehler entstehen. Jetzt drei Tests, die nicht nur die Abwesenheit des Fehlers prüfen, sondern dass `/`, `/play` und `/create` bedienbar bleiben. Per Gegenprobe geschärft: Mit dem alten Guard fällt **genau der BUG-11-Test**, die beiden anderen bestehen.

**Dabei ein flakiger Test gefunden — und zwar einer, der schon vorher drin war.** Der Test „die Offline-Seite laedt nichts nach" fiel in **1 von 3 parallelen Läufen** um, in Einzelläufen nie. Kein Produktfehler und keine Folge des Fixes: Die Flakiness steckte bereits in der Suite, die in der QA als grün gemeldet wurde — dort war sie schlicht nicht aufgetreten. Ursache gemessen: Der Test horchte auf `page.on("request")` und fing Next.js-Prefetches (`/about?_rsc=…`) auf, die ein **anderer, parallel laufender Test** ausgelöst hatte. Er misst jetzt, was die Seite **selbst referenziert**, statt was während ihrer Anzeige zufällig durchs Netz geht — **5 von 5 parallelen Läufen grün**, und per Gegenprobe belegt, dass er nicht stillgelegt, sondern präzisiert wurde (externe Schrift auf der Offline-Seite → 2 Tests fallen).

**Drei Beobachtungen ohne Bug-Status:** 320×568 scrollt — aber **schon vor diesem Feature** (gegen `de882fb~1` gemessen: 581 bei 568px Höhe); der Hinweis vergrößert 13px Überlauf auf 65px, das Spec-Kriterium nennt 360×640 und dort ist es erfüllt. **Firefox bleibt ungetestet** (Binary fehlt trotz gegenteiliger `--dry-run`-Meldung, kein Firefox in `/Applications`) — Risiko gering, da Firefox `beforeinstallprompt` gar nicht bereitstellt. Und das **echte Homescreen-Icon** bleibt Augenschein; dazu wäre `apple-mobile-web-app-status-bar-style: black-translucent` vor dem Deploy einmal auf einem iPhone zu begutachten (offene Frage der Spec).

Suiten gegen den Production-Build, beide mit Exit-Code 0: **Unit 219/219**, **Chrome 153: 441 passed / 23 skipped / 0 failed**, **Mobile Safari: 435 passed / 29 skipped / 0 failed** — dieselben 464 Tests auf beiden Engines.

**Am 2026-09-19 nach Production deployt** (Tag `v1.30.0-PROJ-12`) — live auf https://geoquesty.vercel.app und dort verifiziert. **Alle 14 Endpunkte HTTP 200** mit korrektem Content-Type. Der Kern ist auch live bestätigt: Der Service Worker kontrolliert die Seite, und der Cache enthält nach dem Besuch aller sieben Routen **genau `["/offline.html"]`**. Die Offline-Seite erscheint mit der richtigen Aussage, „Erneut versuchen" bringt die App zurück. Alle vier Icons sind **byte-identisch** zum Repository ausgeliefert. Auf WebKit ist der Hinweis live sichtbar — `/` kompakt, `/play` voll, `/create` keiner. Nachbarseiten unbeschädigt: `/about` mit `FAQPage` und 1× Ko-fi, `/anleitung` weiterhin ohne Prompt. Security-Header inkl. HSTS auf allen neuen Dateien.

**Zwei Auffälligkeiten geprüft statt weggewunken:** Die ~25 fehlgeschlagenen `?_rsc=`-Requests traten in der Gegenmessung **ohne** Service Worker genauso auf (24) — abgebrochene Next.js-Prefetches der schnellen Testnavigation, nicht vom Feature. Ein ruhiger Erstbesuch zeigt **0 Konsolenfehler und 0 fehlgeschlagene Requests**. Und dass der Hinweis auf Desktop-Chrome ausbleibt, liegt nicht an einer Sperrbedingung (alle einzeln gemessen und offen), sondern daran, dass **Chrome `beforeinstallprompt` bei einem Erstbesuch nicht feuert** — mit simuliertem Event erscheint er sofort.

**Ein Fehler in meiner eigenen Messung, offen benannt:** Mein erster „Live"-Check suchte im Manifest nach „Geo Quest" — und fand den Text in der **404-Seite**, die denselben Titel trägt. Der Check konnte nicht fehlschlagen und war wertlos; ich hatte kurzzeitig „live" gemeldet, während alle neuen Dateien noch 404 lieferten. Korrigiert durch eine Prüfung auf den echten Statuscode von `manifest.webmanifest` **und** `sw.js`.

**PROJ-12 ist abgeschlossen. Damit sind alle P0-Features des PRD live.** Offen bleibt nur die Statusleistenfarbe (`black-translucent`) als Augenschein am echten iPhone — in der Spec als offene Frage geführt.

**Per Gegenprobe geschärft:** Entfernt man die Standalone-Prüfung, fällt genau der zuständige Test; ändert man die Frist auf 3 Tage, fällt „nach 29 Tagen"; lässt man die Offline-Seite „Deine Quests sind offline spielbar" versprechen, fallen **4 Tests**, darunter der eigens dafür geschriebene. Die drei `test.skip` sind nachvollzogen und keine stillgelegten Tests — zweimal eine unabhängig verifizierte Engine-Grenze, einmal eine bewusst engine-spezifische Prüfung.


## Abgeschlossen: QA des Navigations-Refinements (2026-09-10)
Die seit dem 2026-09-06 offene QA von **PROJ-1** ist nachgeholt — der Punkt, der in mehreren Einträgen oben als „QA steht aus" vermerkt war.

**14 von 15 Acceptance Criteria erfüllt, keine Critical- oder High-Bugs, Production-Ready.** Gegen den Production-Build geprüft, nicht gegen den Dev-Server. Gemessen statt geschätzt: Zurück-Pfeil-Ziele auf allen vier Ebenen, vier Menu-Gruppen in fester Reihenfolge, `aria-current` nur auf der aktiven Seite (auch aus Unteransichten heraus), Theme-Wechsel Dark `rgb(10,14,15)` / Light `rgb(246,248,249)`, App-Kopfzeile `position: static` (scrollt bei -600px mit), Info-Kopfzeilen `sticky` bei `top: 0`. Responsive auf 375/768/1440px je 44×44-Tap-Ziele ohne Überlauf.

**Security-Audit ohne Befund:** Ein Markup-Payload in der Route (`/create/<img src=x onerror=alert(1)>`) löst kein `alert()` aus und erzeugt kein Element — die App fängt ihn mit ihrer 404-Seite ab. Keine offenen Weiterleitungen im Menu, keine Secrets in 15 geprüften Client-Bundles, Clickjacking-Schutz aktiv.

**BUG-10 (Low, neu):** Das erste Acceptance Criterion nennt `/` ausdrücklich als Screen mit Burger-Menu, der Startscreen hat aber bewusst keine Kopfzeile — ein **Widerspruch zwischen Spec und Implementierung, kein Produktfehler**. Gemessene Auswirkung: Von `/` sind 3 der 7 Ziele direkt erreichbar; Impressum und Datenschutz fehlen dort, sind aber in 2 Taps über Logo → `/about` → Footer erreichbar. Kein rechtliches Problem. Zu entscheiden ist die längst offene Frage, ob `/` eine Kopfzeile bekommt — dann folgt das Kriterium, oder es wird um die Ausnahme präzisiert.

**BUG-2 (Medium, vorbestehend) bestätigt:** Das Schließen-X der Sheets misst weiterhin 16×16px statt der geforderten 44px.

**BUG-3 (Medium, vorbestehend) ließ sich nicht reproduzieren** — mein Kontrast-Scan meldete zwei Verstöße auf `/create`, beide waren Messfehler (die Sonde fand die dekorative Hintergrundebene nicht und fiel auf den dunklen `body` zurück). Der Screenshot zeigt dunkle Schrift auf hellem Grund, einwandfrei lesbar. Sollte mit einer pixelbasierten Messung neu bewertet werden.

**28 neue E2E-Tests** in `tests/proj-1-navigation-qa.spec.ts` schließen die Regressionslücken des Refinements (Gruppenstruktur, Schließverhalten per Escape und Klick daneben, Fokus und `aria-expanded`, Abwesenheit der Pin-Marke, Scroll-Verhalten beider Kopfzeilen-Varianten, XSS-Wächter). Per Gegenprobe geschärft: Eine umbenannte Menu-Gruppe und eine sticky gemachte App-Kopfzeile lassen jeweils die zuständigen Tests fallen.

Gesamtsuite jetzt **762 passed / 2 skipped / 0 failed** über beide Engines (vorher 734), Unit 186/186, Build und Lint sauber.


## Offenes Refinement: BUG-10 — Burger-Menu auch auf dem Startscreen (2026-09-10)
**PROJ-1** geht von Approved zurück auf In Progress. Die QA vom selben Tag hatte BUG-10 aufgedeckt: Das erste Acceptance Criterion nennt `/` ausdrücklich als Screen mit Burger-Menu, der Startscreen hat aber bewusst keine Kopfzeile. Der Betreiber hat entschieden — **`/` bekommt das Menu**, die frühere Ausnahme entfällt.

**Der Anlass, gemessen statt vermutet:** Von `/` waren nur 3 der 7 Ziele direkt erreichbar (`/about` über das Logo, `/play` und `/create` über die Mode-Cards). Impressum und Datenschutz fehlten dort ganz — erst in 2 Taps über Logo → `/about` → Footer erreichbar. Der Anspruch „eine Navigation für die ganze App" war ausgerechnet auf dem Screen nicht eingelöst, den jeder Nutzer zuerst sieht.

**Die Umsetzung ist bewusst nicht die naheliegende:** Eine volle 56px-Kopfzeile wie auf allen anderen Screens hätte ein bestehendes Acceptance Criterion gebrochen. Gemessen: Der Startscreen-Inhalt endet auf 360×640 bei 559px von 640 — mit einer Kopfzeile bei 615px, die Seite läuft über; auf 320×568 fehlten 45px. Das AC „Logo, Headline und beide Mode-Cards ohne Scrollen sichtbar" wäre gefallen.

Stattdessen: **nur das Burger-Icon, absolut positioniert oben rechts, 0px Layout-Höhe.** Die Zone oben rechts ist auf allen drei geprüften Breiten frei. `/` braucht ohnehin weder Zurück-Pfeil (oberste Ebene) noch Titel — also auch keine Zeile für beides. Alle sieben Ziele in 1 Tap, kein Pixel Layout-Kosten, kein gebrochenes Kriterium.

Spec ist aktualisiert: 7 neue Acceptance Criteria (eigener Block), 3 Produkt- und 2 technische Entscheidungen, Out of Scope um die volle Kopfzeile ergänzt, die seit dem 2026-09-06 offene Frage geschlossen, und die überholte Implementation Note von damals als solche markiert.

**Frontend umgesetzt am 2026-09-10.** Eine Datei: `src/app/page.tsx`. `AppNavMenu` direkt eingebunden, `absolute top-3 right-3` über dem bestehenden Layout, `<main>` bekommt `relative`.

Der Kern der Entscheidung — 0px Layout-Kosten — ist vorher/nachher gemessen: Das untere Ende des Inhalts liegt auf 320×568 bei 557, auf 360×640 bei 559, auf 390×844 bei 574 und auf 430×932 bei 588 — **identisch zu den Werten vor der Änderung**. Icon überall 44×44, keine Überlappung mit den Mode-Cards, `/` weiterhin scrollfrei auf 360×640. Im Menu: vier Gruppen, sieben Links, kein Eintrag aktiv markiert.

6 neue Tests. **Dabei ein Fehler in den Tests gefunden:** Die erste Gegenprobe (Icon in eine normale Zeile umgebaut) ließ alle Tests bestehen — kein Test prüfte die tatsächliche Layout-Position. Ergänzt um einen Wächter auf die y-Position des Logos; damit fällt bei der Gegenprobe genau der zuständige Test. Suite **776 passed / 2 skipped / 0 failed** (vorher 762), Unit 186/186, Build und Lint sauber.

**QA am 2026-09-10 abgeschlossen: 7/7 Acceptance Criteria, keine Bugs, Production-Ready.**

Die 0px-Behauptung habe ich **nicht** aus der Frontend-Phase übernommen, sondern unabhängig geprüft: alte `page.tsx` (Commit `4e6a081`) eingespielt, gebaut, gemessen — dann dasselbe mit der neuen Fassung. Sechs Viewports, drei Messpunkte je Viewport, **alle 24 Werte identisch**. Die Entscheidung, das Icon schweben zu lassen statt eine 56px-Zeile zu bauen, ist damit nachweislich eingelöst.

Tab-Reihenfolge folgt der visuellen Ordnung (Burger, Logo, beide Cards), Menu auf `/` vollständig bedienbar, Erststart-Dialog verträgt sich, WebKit gleichwertig, Security-Header aktiv.

**Ein Befund, im Test statt im Produkt:** Der Test „Tap neben das Menu" schlug reproduzierbar fehl. Ursache ist ein Zeitfenster von unter 100ms, in dem Radix' Sheet sichtbar ist, aber sein Dismiss-Handler noch nicht hängt (gemessen: 0ms Wartezeit → 0/3 erfolgreich, 100ms → 3/3). Für Menschen unerreichbar — nach dem Tap auf den Burger vergehen 200–300ms, bis wieder getippt wird. Test wartet jetzt explizit, dreimal seriell grün.

Zwei Fehlspuren sind dokumentiert, damit sie niemand erneut verfolgt: Playwrights Snapshot rendert **SVGs als `img`**, wodurch der Zurück-Pfeil wie eine zurückgekehrte Pin-Bildmarke aussah; und der Test schlug seriell fehl, aber parallel nicht — das sah nach Test-Interaktion aus, war aber reine Zeitabhängigkeit.

Suite **776 passed / 2 skipped / 0 failed**, Unit 186/186, Build und Lint sauber.

**Am 2026-09-10 nach Production deployt** (Tag `v1.28.0-PROJ-1`) — live auf https://geoquesty.vercel.app und dort verifiziert. Vercel deployte automatisch von `main`, live nach ~60 Sekunden.

**Die 0px-Behauptung ist auch in Production bestätigt:** Die vier Referenz-Viewports aus der QA gegen die Live-Seite nachgemessen, **alle 16 Werte identisch** (logoY, playY, createEnd, Scroll-Verhalten von 320×568 bis 430×932). Icon überall 44×44 und `absolute`, keine Überlappung.

**Der Zweck von BUG-10 ist eingelöst:** Von `/` aus sind jetzt **alle sieben Ziele in einem Tap** erreichbar. Impressum und Datenschutz waren dort vorher gar nicht verlinkt — erst in 2 Taps über Logo → `/about` → Footer. Live getestet: Ein Tap auf „Impressum" im Menu führt nach `/impressum`.

Alle sieben Routen HTTP 200 mit 0,07–0,21s. Menu auf `/` mit vier Gruppen, sieben Links, 0 aktiv markiert. **0 Konsolenfehler, 0 fehlgeschlagene Requests.** WebKit gleichwertig, Security-Header aktiv.

**PROJ-1 ist damit vollständig abgeschlossen** — Navigations-Refinement, Ko-fi-Eintrag und BUG-10 sind gebaut, QA-geprüft und live. Offen bleiben nur die beiden vorbestehenden, nicht blockierenden Befunde BUG-2 (16px-Schließen-X in allen Sheets) und BUG-9 (kein `:focus-visible` app-weit), beide unabhängig von diesem Feature.

## Offenes Refinement: Service Worker nur in Production (2026-09-20)
**PROJ-12** geht von Deployed zurück auf In Progress. Befund des Betreibers: Desktop-Safari zeigte beim Öffnen von `localhost` nur noch den Hinweis „Keine Verbindung".

**Reproduziert und als korrektes Verhalten am falschen Ort identifiziert** — kein Produktfehler, und Production ist nicht betroffen. In WebKit gemessen: Mit laufendem Server übernimmt der Worker die Seite (Cache `["/offline.html"]`); nach dem Stoppen des Servers liefert er auf jede Navigation die Offline-Seite (`Titel: "Geo Quest — keine Verbindung"`). Läuft wieder ein Server, lädt die App normal (`Titel: "Geo Quest"`) — der Worker hängt also **nicht** fest. Auslöser war schlicht, dass kein Dev-Server lief.

Zwei Dinge machen das lokal unangenehm: Lokal ist ein gestoppter Server der **Normalfall**, und die Offline-Seite verdeckt dann die wahre Ursache. Und der Worker-Scope ist die **Origin, nicht der Port** — ein auf `localhost` registrierter Worker gilt für **jedes** Projekt dieser Maschine, auch für fremde auf anderen Ports.

Entschieden: Der Worker registriert sich **nur noch in Production**; zusätzlich meldet die App einen lokal bereits registrierten Worker aktiv ab und löscht dessen Caches (sonst bliebe er auf allen Entwicklerrechnern liegen). Verworfen wurde ein Opt-in-Schalter — die Offline-Seite ist gegen den Production-Build prüfbar, wo die Suite ohnehin läuft.

**Der Fallstrick für `/frontend`, gemessen statt vermutet:** Die Unterscheidung muss über `process.env.NODE_ENV` laufen, **nicht** über den Hostnamen. `playwright.prod.config.ts` testet den echten Production-Build auf `localhost:3100`; eine Hostname-Prüfung auf `localhost` würde dort den Worker abschalten und die **37 Tests** in `proj-12-pwa-installation.spec.ts` entwerten, ohne dass der Produktcode kaputt aussieht — ein stiller Testverlust.

Spec ist aktualisiert (6 neue Acceptance Criteria, Edge Cases 15–17, 1 Technical Requirement, 1 Produkt- und 3 technische Entscheidungen, 1 neue Open Question).

**Sofortmaßnahme für den Betreiber** (unabhängig vom Fix): Safari → Entwickler → Caches leeren, oder Einstellungen → Datenschutz → Website-Daten verwalten → `localhost` entfernen. Danach `npm run dev` starten.

**Frontend umgesetzt am 2026-09-20.** Eine Datei (`service-worker-registration.tsx`), kein neues Paket, keine neue Komponente, keine neue Route. `sw.js`, Manifest, Icons und Offline-Seite sind unverändert — geändert hat sich nur, *wer* den Worker registriert.

Beide Richtungen am Browser gemessen, bei **gleichem Hostname** und nur unterschiedlichem `NODE_ENV`: Production-Build (Port 3100) registriert **1** Worker mit Cache `["geoquest-offline-v1"]`, Dev-Server (Port 3000) **0** Worker und **0** Caches. Damit ist belegt, dass die Unterscheidung nicht am Hostnamen hängt.

Das Aufräumen (Edge Case 17) ist ebenfalls gemessen: 1 Worker + 1 Cache vorher → 0/0 nach einem einzigen Seitenaufruf, beim zweiten auch `controller: false`. **Der erste Messversuch war wertlos und wurde verworfen** — er stellte den Altzustand auf `/` her, wo der Aufräum-Code sofort lief, und hätte auch bei kaputtem Code bestanden; korrigiert über die statische `offline.html`.

**Die zentrale Sorge ist eingelöst:** Die 37 PROJ-12-E2E-Tests laufen unverändert gegen den Production-Build auf `localhost:3100`. 7 neue Unit-Tests decken den Dev-Zweig ab, der in der E2E-Suite **strukturell nicht erreichbar** ist. Per Gegenprobe geschärft: Mit der alten Fassung fallen genau 4 der 7; die 3, die bestehen bleiben müssen, bestehen.

**Suiten:** Unit **226/226** (vorher 219). Voller E2E-Lauf **913 passed / 52 skipped / 1 failed** — der Fehlschlag liegt in PROJ-7 (Radius-Slider), besteht einzeln und ist unerreichbar für dieses Refinement (Datei unverändert, Suite läuft mit `serviceWorkers: 'block'`). PROJ-12 selbst 3× seriell 36/36 grün. Build und Lint sauber (0 Fehler, 7 vorbestehende Warnungen, keine in geänderten Dateien).

Offen bis zum Deploy: Dass sich der Worker **auf Vercel** weiterhin registriert, ist lokal gegen `next start` geprüft, aber noch nicht in Production bestätigt.

**QA am 2026-09-20 abgeschlossen: 6/6 Acceptance Criteria erfüllt, keine Bugs, Production-Ready.**

Die zentralen Behauptungen neu gemessen statt übernommen — und auf **beiden Engines**, während die Frontend-Phase nur WebKit geprüft hatte. Dev: `worker=0, caches=[]`. Production: `worker=1, caches=["geoquest-offline-v1"]`.

**Der gemeldete Fehler ist direkt gegengeprüft:** Mit der **alten** Fassung zeigen beide Engines bei gestopptem Dev-Server „KEINE VERBINDUNG" — exakt der Betreiber-Befund; mit der neuen meldet der Browser seinen eigenen Verbindungsfehler.

**Die `NODE_ENV`-Entscheidung ist empirisch belegt:** Eine eingespielte Hostname-Variante registriert auf `localhost:3100` keinen Worker, und die PROJ-12-Suite **hängt** dann statt sauber rot zu werden. Sie hätte die 37 Tests nicht nur entwertet, sondern unlesbar gemacht.

**Security-Audit ohne Befund** — geprüft wurde die heikelste Stelle: Das Aufräumen löscht Caches auf einer **geteilten Origin**. Von fünf gezielt ähnlichen Namen wird ausschließlich `geoquest-offline-v1` gelöscht; `xgeoquest-tarnung`, `GEOQUEST-gross`, `geoquest` und ein fremder Projekt-Cache bleiben erhalten.

**Regression:** Unit **226/226**, **Chrome 463 passed / 23 skipped / 0 failed**, **Mobile Safari 457 passed / 29 skipped / 0 failed**, Build und Lint sauber. Der PROJ-7-Fehlschlag der Frontend-Phase trat nicht auf — bestätigt als Last-Flakiness.

**Vier Fehler in meinen eigenen Tests/Messungen offen benannt** (Produkt jeweils richtig), darunter zwei mit Lehrwert für künftige Läufe: `navigator.serviceWorker.ready` hängt unendlich, wenn sich kein Worker registriert — eine Gegenprobe läuft damit ins Timeout statt klar fehlzuschlagen. Und der `line`-Reporter mit `tail -1` **verschluckt Fehlschläge**: Fünf Läufe sahen grün aus, während der JSON-Reporter 1–2 rote Tests auswies. Stabilitätsaussagen nur noch über den JSON-Reporter.

**Ein eigener Test wurde entfernt statt stillgelegt:** Die Cache-Inhalts-Prüfung blieb auf WebKit unzuverlässig (1 von 5 Läufen rot) bei nachweislich korrektem Produkt, und `proj-12-pwa-installation.spec.ts:183` deckt dieselbe Zusicherung stabil ab. Ein Test, der ohne Produktfehler rot wird, kostet mehr Vertrauen als er Deckung bringt. Verbleibende neue Suite: 6 Tests, **6 von 6 Läufen grün**.

**Offen bis zum Deploy:** Dass sich der Worker **auf Vercel** weiterhin registriert — geprüft wurde nur gegen `next start`.

**Am 2026-09-20 nach Production deployt** (Tag `v1.32.0-PROJ-12`, Commit `5f758b4`) — live auf https://geoquesty.vercel.app und dort verifiziert.

**Am live ausgelieferten Bundle bestätigt, und besser als erwartet:** Alle 12 JS-Chunks einzeln abgerufen — `register("/sw.js")` ist da, **`getRegistrations` in keinem einzigen**. Der Dev-Aufräum-Zweig wurde als toter Code entfernt; die `NODE_ENV`-Lösung wirkt zur Bauzeit und kostet in Production **null Bytes**. Eine Hostname-Prüfung hätte diesen Zweig dauerhaft mitgeliefert.

**Die zentrale Zusicherung ist eingelöst:** Der Worker registriert sich auf beiden Engines weiterhin (`worker=1`, `state=activated`, `controller=true` nach ~2 s, Cache exakt `["/offline.html"]`) — Android-Installationsweg und Offline-Seite bleiben erhalten. Die Fallback-Seite ist live geprüft: offline zeigt eine Navigation „Geo Quest — keine Verbindung", nicht Chromes Dinosaurier.

Alle 10 Endpunkte HTTP 200 (0,06–0,31 s), vier PWA-Icons als `image/png`, Security-Header inkl. HSTS, `sw.js` mit `max-age=0`. Smoke-Test auf beiden Engines bestanden, **WebKit mit 0 Konsolenfehlern und 0 fehlgeschlagenen Requests**. Nachbarfeatures unbeschädigt (`/about` mit FAQPage + 1× Ko-fi, `/anleitung` weiterhin 0 Treffer für den Prompt).

**Eine Auffälligkeit geprüft statt weggewunken:** Chrome meldete einen Konsolen-404, WebKit nicht — `/favicon.ico` liefert 404, weil nie eines referenziert wurde; Chrome fragt es von sich aus an. **Vorbestehend**, gegen den Vorgänger-Commit gegengeprüft, kein Regressionsbefund. Die vier echten Icons unter `/icons/` liefern 200.

**Drei Messfehler offen benannt, alle meine:** Zwei Sonden meldeten einen leeren Cache und damit eine ausbleibende Offline-Seite — ein `waitForFunction`, das `caches` im Sekundentakt abfragt, kommt dem `install`-Schritt in die Quere. Mit festem Warten reproduzierbar korrekt. Für künftige Läufe: Den Worker-Cache **nicht** pollen, sondern schlicht ~4 s warten.

**PROJ-12 ist abgeschlossen.**

## Offenes Refinement: Installations-Hinweis wird schwebendes Overlay (2026-09-20)
**PROJ-12** geht von Deployed zurück auf In Progress. Der Betreiber: Der Hinweis sitzt fest im Seitenfluss auf `/` und `/play` — gewünscht ist ein Overlay, hinter dem die Seite weiter scrollt, und deutlich kompakter.

**Der Befund stützt das.** Die Entscheidung von 2026-09-18 („Hinweis im Seitenfluss statt fixiert") stand auf der Begründung, das Design System verbiete Bottom-Navigation. Diese Auslegung ist zu weit: Die Regel zielt auf **dauerhaftes Navigations-Mobiliar**, und der Installations-Hinweis ist weder dauerhaft (ein Tap auf ✕ und er schweigt 30 Tage) noch navigiert er irgendwohin. Ihr zweites Argument — „verdeckt nichts und schiebt nichts weg" — traf zudem nur die halbe Wahrheit: Im Fluss **schob** er sehr wohl, auf `/` um 195px. Genau daran brach in der Frontend-Phase das PROJ-1-Nicht-Scrollen-Kriterium, und genau deshalb existiert heute eine zweite, abgespeckte `compact`-Fassung nur für den Startscreen.

Entschieden (fünf Punkte, alle vom Betreiber bestätigt):
- **Fixiert am unteren Rand**, Inhalt scrollt darunter weiter — die Bottom-Nav-Regel bekommt eine eng gefasste Ausnahme für temporäre, wegklickbare Hinweise
- **Eine Zeile auf beiden Plattformen**; die zweischrittige iOS-Anleitung mit zwei Icons entfällt zugunsten der Kurzform „Teilen → Home-Bildschirm", die auf `/` ohnehin schon live ist
- **Bleibt stehen, bis weggeklickt** — kein Ausblenden beim Scrollen (wäre die Ambient-Bewegung, die das Design System ausschließt), kein Selbstschließen nach Sekunden (wäre kein Wegklicken und käme beim nächsten Besuch wieder)
- **Unverändert nur `/` und `/play`** — die Overlay-Form ändert nichts daran, wo der Hinweis angebracht ist
- **Der Import-FAB auf `/play` rückt hoch**, statt einander zu verdecken

**Der Nebengewinn:** Was nicht in die Höhe zählt, kann kein Höhen-Kriterium brechen — die `compact`-Prop und mit ihr die Zwei-Fassungen-Logik verschwinden ersatzlos. Dieselbe Mechanik hat bei BUG-10 das schwebende Burger-Icon auf `/` getragen.

**Drei Fallstricke für `/frontend`, im Code nachgesehen statt vermutet:** `quest-import-button.tsx:71` ist bereits `fixed bottom-6 right-5 z-40` und braucht dieselbe Information wie der Hinweis (Quelle: `useInstallPrompt().shouldShow`, kein zweiter Zustand). Die `compact`-Prop ist ersatzlos zu entfernen, nicht auf `true` festzunageln. Und `tests/proj-12-pwa-installation.spec.ts` prüft den Hinweis heute im Seitenfluss — diese Assertions sind zu **ziehen, nicht zu löschen**. Neu dazu gehört der Wächter auf `scrollHeight` mit und ohne sichtbaren Hinweis; das ist die Behauptung, die dieses Refinement belegen muss.

**Der Hook wird nicht angefasst.** Die vier Anzeige-Bedingungen, die 30-Tage-Frist, der Vorrang des Erststart-Dialogs und die iOS-Erkennung an mehreren Signalen (BUG-6-Lehre) bleiben unverändert — dieses Refinement ändert, wie der Hinweis aussieht und wo er sitzt, nicht wann er erscheint.

Spec ist aktualisiert (10 neue Acceptance Criteria in einem eigenen Block, Edge Cases 18–21, 5 Technical Requirements, 5 Produkt- und 3 technische Entscheidungen, 2 überholte Entscheidungen als solche markiert statt gelöscht, 1 neue Open Question).

**Offen geblieben:** Ob die Bottom-Nav-Ausnahme in `docs/design-system.md` festgeschrieben wird. Die Entscheidung ist in der Spec begründet, aber das Design System kennt sie nicht — wer als Nächstes einen schwebenden Hinweis baut, liest dort weiterhin ein pauschales Verbot.

**Frontend umgesetzt am 2026-09-20.** Fünf Dateien, kein neues Paket, keine neue Komponente, keine neue Route. Die `compact`-Prop ist ersatzlos entfallen — es gibt nur noch eine Fassung, und die ist die kompakte.

**Der Kern ist gemessen, und die naheliegende Messung wäre falsch gewesen.** „Seitenhöhe mit Hinweis == ohne Hinweis" schlägt auf `/play` fehl (922 → 994px), weil die Liste absichtlich Freiraum bekommt, solange der Hinweis steht. Der Vergleich hätte einen gewollten Unterschied als Layout-Kosten des Overlays gemeldet. Isoliert man stattdessen den Beitrag **des Overlays selbst** — aus dem DOM nehmen, neu messen, zurücksetzen —, ergibt sich auf beiden Seiten und beiden Engines **0px**. Das PROJ-1-Kriterium hält mit 640 von 640.

**Einen Fehler habe ich selbst eingebaut und durch Messen gefunden:** Der FAB blieb nach dem Wegklicken oben stehen (552 statt 616). `useInstallPrompt()` läuft jetzt an drei Stellen zugleich, jede mit eigenem React-State — `dismiss()` schaltete nur die Instanz des Hinweises um. Ich hatte in denselben Code den Kommentar geschrieben, ein zweiter Zustand könne auseinanderlaufen, und genau das dann produziert. Gelöst mit dem Fensterereignis-Muster, das `FirstVisitDialog` schon nutzt.

Gemessen: Höhe **72px, auf Android und iOS identisch** (alte volle Karte: 195px), Kontrast **9.64:1**, Tap-Ziele 44px, kein abgeschnittener Text auf 320–430px, FAB und Hinweis ohne Überlappung, letzte Quest-Karte beim Scrollen ans Ende nicht verdeckt, iOS-Zweig auf echtem WebKit mit **0 Installieren-Buttons**. **Am Bildschirm abgenommen**, nicht nur gemessen — bei einer Design-Änderung reichen Zahlen nicht.

**Ein Fehler im Test selbst** (das Produkt war richtig): Der Menu-Wächter fiel auf Desktop-Chrome um, weil dort Menu-Panel (x=1000..1280) und Hinweis (x=425..855) sich gar nicht berühren — er prüfte Geometrie, die nur auf schmalen Bildschirmen gilt.

12 neue Tests, PROJ-12 jetzt **49 statt 37** je Engine. Per Gegenprobe geschärft: Hinweis zurück in den Seitenfluss → **6** Tests fallen; Ereignis für den FAB entfernt → **genau 1**. Die bestehenden Assertions sind gezogen, nicht gelöscht.

Suiten gegen den Production-Build: **Unit 226/226**, E2E über beide Engines **978 passed / 52 skipped / 0 failed**. Build und Lint sauber, `/` und `/play` bleiben statisch.

**Nicht abgedeckt und benannt:** die Safe Area auf einem echten iPhone mit Home-Indikator (Playwright emuliert `env(safe-area-inset-bottom)` nicht), das Verhalten bei eingeblendeter Bildschirmtastatur, und Firefox.

**QA am 2026-09-20 abgeschlossen: 10/10 Acceptance Criteria erfüllt, keine Bugs jeglicher Schwere, Production-Ready.**

Weil das Refinement in derselben Sitzung gebaut wurde, habe ich die zentralen Behauptungen neu gemessen — und **an zwei Stellen schärfer geprüft als die Frontend-Phase**.

Erstens die Layout-Höhe: Die Frontend-Phase isolierte den Beitrag des Overlays nur über die Höhe. Ein `fixed` Element kann die Seite aber auch über die **Breite** beeinflussen. Nachgeholt — der Beitrag ist **0px in beiden Achsen**, beide Seiten, beide Engines.

Zweitens das eigentliche Anliegen des Betreibers („hinter dem man die Seite noch scrollen kann"), das bisher nur indirekt über `position: fixed` belegt war: Über drei Scroll-Schritte bewegt sich der Inhalt (erste Karte 198 → −102 → −396), der Hinweis steht konstant bei 568, und unter dem Overlay liegt nachweislich eine **Quest-Karte**.

Gemessen: Kontrast schlechtester Wert **6.61:1** (Vorgabe 4.5:1), Tap-Ziele 44px auf **acht Viewports** (320×568 bis 1440×900), kein Überlauf und kein abgeschnittener Text, Höhe **72px auf Android und iOS gleich**, FAB rückt beim Wegklicken exakt 64px zurück, letzte Quest-Karte mit 16px Luft erreichbar — **am Bildschirm abgenommen**, nicht nur gemessen. Edge Case 18 (Querformat) und die Tastaturbedienung zusätzlich geprüft, letztere in der Spec nicht gefordert.

**Security ohne Befund:** XSS über den Quest-Namen erzeugt 0 Dialoge und 0 injizierte Elemente; ein manipulierter `localStorage`-Schlüssel in sechs Varianten ergibt **0 `pageerror`** und eine durchgehend bedienbare App; 0 externe Requests.

**Gegenproben bewusst an anderen Stellen als in der Frontend-Phase:** Listen-Freiraum entfernt → **genau 2** Tests fallen (einer je Engine); iOS-Kurzform durch die alte zweischrittige Liste ersetzt → **genau 1**. Produktcode danach per Prüfsumme als unverändert bestätigt. Die 7 Skips sind nachvollzogen und keine stillgelegten Tests.

**Unit 226/226, E2E beide Engines 978 passed / 52 skipped / 0 failed**, Build sauber, Lint 0 Fehler.

**Zwei Beobachtungen ohne Bug-Status:** Der Import-FAB überlappt die letzte Quest-Karte samt Titel — gegengeprüft mit weggeklicktem Hinweis: **identisch**, also vorbestehend aus PROJ-6. Und die lokalen Konsolenfehler stammen von Vercel Analytics, das nur in Production existiert.

**Nicht abgedeckt:** die echte Safe Area am iPhone (Playwright meldet `env(safe-area-inset-bottom)` als 0 — gemessen wurde der 14px-Grundwert), Bildschirmtastatur, Firefox, und der echte `beforeinstallprompt`.

**Am 2026-09-20 nach Production deployt** (Tag `v1.34.0-PROJ-12`, Commit `7ee010b`) — live auf https://geoquesty.vercel.app und dort verifiziert.

**Alle Messwerte decken sich exakt mit den lokalen:** `fixed`/`z-50`, **72px**, **Layout-Beitrag 0px**, beide Plattform-Zweige mit 0 `<li>`, FAB ohne Überlappung und beim Wegklicken **+64px** zurück, 16px Luft zur letzten Quest-Karte, `padding-bottom: 14px`. Das neue Ereignis `gq:install-hint-changed` ist im ausgelieferten Bundle nachgewiesen. **WebKit mit 0 Konsolenfehlern.**

Alle 10 Endpunkte HTTP 200 mit 0,06–0,08 s, Security-Header inkl. HSTS. Nachbarfeatures unbeschädigt: `/about` mit `FAQPage` und 1× Ko-fi, `/anleitung` weiterhin 0 Treffer für den Prompt, alle vier PWA-Icons byte-identisch zum Repo, Service Worker cacht weiterhin nur `/offline.html`.

**Zwei Auffälligkeiten geprüft statt weggewunken:** Die `?_rsc=`-Fehlschläge stammen aus der schnellen Testnavigation — ein ruhiger Erstbesuch ergibt **0 Antworten ≥400**. Der verbleibende Konsolen-404 ist `/favicon.ico`, vorbestehend und bereits im Deploy vom 2026-09-19 dokumentiert.

**Zwei Fehler in meiner eigenen Messung, offen benannt:** Mein erster „Ist es live?"-Check suchte den Overlay-Marker im **Server-HTML**, wo er nie erscheinen kann (der Hinweis rendert clientseitig) — er lief zehnmal ins Leere und hätte „nicht deployt" gemeldet, obwohl der Deploy live war. Und mein Icon-Check fragte zwei **erfundene** Dateinamen ab und meldete dafür 404; die vier echten Icons liefern 200 und sind byte-identisch.

**PROJ-12 ist abgeschlossen.**

## Offenes Refinement: Ruhige Kompassnadel (2026-09-20)
**PROJ-3** geht von Deployed zurück auf In Progress. Betreiber-Befund aus einem Handy-Test im Gelände: *"die Kompassnadel springt ab und zu wild hin und her, dreht sich um sich selbst"* — Navigation war über die Entfernungsanzeige möglich, aber der Pfeil ist das Kern-Element dieses Features und war unbrauchbar.

**Vier Ursachen, alle im Code bestätigt:**

1. **Der 359°→0°-Sprung wird als volle Gegendrehung animiert.** `arrowRotation` ist in `navigation-screen.tsx:80` auf `0..360` normalisiert und speist eine CSS-Transition. Geht der Wert von 359° auf 1°, animiert CSS den langen Weg — fast eine ganze Umdrehung für 2° reale Änderung. Das ist das gemeldete "dreht sich um sich selbst", und es tritt systematisch auf, wenn das Ziel ungefähr hinter dem Spieler liegt.
2. **Der Sensorwert wird ungefiltert durchgereicht.** `use-device-orientation.ts` schreibt jeden `deviceorientation`-Event (auf iOS ~60 Hz) direkt in den State — kein Tiefpass, keine Mindestschwelle. Jedes Zittern der Hand landet im Pfeil und löst zusätzlich ein Re-Render des ganzen Screens aus.
3. **Die Heading-Quelle kippt zwischen zwei Bezugssystemen.** Fällt `orientation.heading` auf `null`, springt die Logik auf die GPS-Bewegungsrichtung. Kompass (wohin das Gerät zeigt) und Bewegungsrichtung (wohin der Spieler läuft) liegen beim Blick aufs Handy leicht 90° auseinander. Da `headingFromPositions` unter 2 m Strecke `null` liefert, kann der Wechsel im Stand mehrfach pro Minute eintreten.
4. **Die Zielpeilung rauscht mit der GPS-Position.** Bei 15 m Ungenauigkeit auf 30 m Distanz sind das bis zu ±30° Peilungsänderung im Stillstand — die Nadel wird ausgerechnet auf den letzten Metern am unruhigsten.

Warum die Entfernungsanzeige funktionierte: Sie ist ein gerundeter Skalar ohne Wrap-around — dasselbe Rauschen fällt dort schlicht nicht auf.

**Entschieden (alle vier Punkte vom Betreiber bestätigt):** Rotation als fortlaufender, unbeschränkter Winkel mit kürzester Delta-Formel statt normalisiert; Glättung plus Mindestschwelle im Hook, Zielverhalten "ruhig und gedämpft" (~0,2–0,3 s Nachlauf, Nadel steht still wenn der Spieler still steht); Kompass hat Vorrang mit Karenzzeit vor dem Quellenwechsel, echte Wechsel werden weich überblendet; und die Zielpeilung wird mitbehandelt statt vertagt — der Befund wäre sonst auf den letzten Metern bestehen geblieben und als "behoben" durchgegangen.

**Mitgenommen auf Betreiber-Entscheidung:** Der Kalibrierungs-Hinweis "Bewege dein Handy in einer 8". Er steht seit 2026-08-23 als Acceptance Criterion in der Spec und wird auch gerendert — aber mit **9px**, also weit unter der 16px-Mindestgröße des PRD und praktisch unlesbar. Ein unkalibriertes Magnetometer ist zugleich eine der Ursachen für genau die unruhige Nadel. Gleiche Datei, gleiche Fehlerklasse, gleicher Prüf-Durchlauf.

*(Korrektur: In der ersten Fassung dieses Eintrags stand, der Hinweis werde „nie gerendert". Das war falsch — er ist da, nur zu klein. Der Befund bleibt, die Ursache ist eine andere.)*

**Der Fallstrick für `/frontend`, vorab benannt:** Winkel-Glättung darf **nie** über einen arithmetischen Mittelwert laufen — das Mittel aus 359° und 1° ist 180°, also die exakte Gegenrichtung. Das wäre ein zweiter Fehler derselben Klasse, den nur ein Test mit einer Sequenz über die 0°-Grenze findet. Erforderlich sind Sinus/Kosinus oder dieselbe Delta-Formel wie bei der Rotation.

**Abnahme:** Playwright kann den Magnetometer nicht emulieren — diese Fehlerklasse ist per E2E nicht prüfbar. Die Glättungs- und Wrap-around-Mathematik wird per Unit-Test abgesichert (synthetische Sensorfolgen, ausdrücklich inklusive 359°→1° und 1°→359°); das tatsächliche Gefühl auf der Straße prüft der Betreiber am Gerät.

Spec ist aktualisiert (9 neue Acceptance Criteria im Block „Ruhige Richtungsanzeige", Edge Cases 18–22, 9 Technical Requirements, 5 Produkt- und 6 technische Entscheidungen, 4 neue Open Questions).

**Frontend umgesetzt am 2026-09-20.** Vier Dateien geändert, zwei neu (`src/hooks/use-arrow-rotation.ts`, `tests/proj-3-ruhige-kompassnadel.spec.ts`). Kein neues Paket, keine neue Route. Die Winkelmathematik liegt als vier reine Funktionen in `geo-utils.ts`, die Glättung im Sensor-Hook, die fortlaufende Rotation in einem eigenen Hook.

**Zwei echte Fehler in der eigenen Implementierung, beide von Tests gefunden.** Die Delta-Formel `((to - from + 540) % 360) - 180` ist bei **negativen** Eingaben falsch — JavaScripts `%` liefert dort ein negatives Ergebnis, gemessen `-184` statt eines Werts im zugesicherten Bereich. Kein akademischer Fall: Die fortlaufende Rotation läuft ins Negative, sobald der Spieler sich gegen den Uhrzeigersinn über Nord dreht. Und der erste Entwurf mutierte Refs **während des Renders**; `npm run lint` meldete zu Recht `react-hooks/purity` und `Cannot access refs during render`. Unter konkurrierendem Rendering darf React einen Render verwerfen und wiederholen — jeder Durchlauf hätte den Winkel erneut weitergedreht. Beides behoben, letzteres durch den eigenen Hook mit Akkumulation im Effekt.

**Der lehrreichste Befund betrifft die Testqualität, nicht das Produkt: Der Test für den Hauptbefund prüfte den falschen Nulldurchgang.** Er ließ den Spieler sein *Heading* durch den Nordpunkt drehen — und bestand deshalb auch mit der fehlerhaften Fassung. Die Rotation ist `Peilung − Heading` und wandert dabei nur von 30° auf 50°, kommt der 0°-Grenze also nie nahe. Der Nulldurchgang der *Rotation* liegt dort, wo das Heading die *Peilung* kreuzt. Nach der Korrektur fallen bei der Gegenprobe **8 von 16** statt 6. Dasselbe Muster auf Unit-Ebene: Zwei Glättungstests prüften nur den Endwert einer Rauschsequenz, die zufällig nah an der Mitte endete — auch ohne Glättung grün. **Beide Male ist es ausschließlich durch die Gegenprobe aufgefallen, nie durch einen roten Lauf.**

Ein weiterer Fehler lag ebenfalls im Test: Der Locator auf die Entfernung suchte eine reine Zahl, die Anzeige rendert aber `"1234m"` in einem Element. Das Produkt war richtig.

**Korrektur zur Analyse:** Der Kalibrierungs-Hinweis wird entgegen der Annahme des Refinements **immer gerendert** — aber mit 9px in der Tech-Schrift, also weit unter der 16px-Vorgabe des PRD und praktisch unlesbar. Der Befund bleibt, die Ursache ist eine andere. Er steht jetzt mit 16px in der Body-Schrift.

**Parameter, am Bildschirm gewählt:** Glättungsfaktor 0,15 pro Event (bei ~60 Hz rund 90 % einer Drehung in ~0,2 s), Mindestschwelle 0,75°, Karenzzeit 3 s, Peilungsdämpfung 0,25 unterhalb von 200 m. Die CSS-Transition sinkt von 320 ms auf 220 ms — bei 320 ms addierte sie sich sichtbar zur Glättung.

**Suiten gegen den Production-Build:** Unit **258/258** (vorher 226). E2E über beide Engines **994 passed / 52 skipped / 0 failed / 0 flaky**. Neue Suite 16/16. Build und Lint sauber.

**18 Fehlschläge in einem Zwischenlauf waren Last-Artefakte, nicht Regressionen** — alle auf Mobile Safari, alle in Dateien, die dieses Refinement nicht anfasst. Gegengeprüft: dieselben Dateien isoliert 31/31 grün, mit und ohne die Änderung. Das in INDEX.md dokumentierte Muster; mit weniger Workern verschwanden sie vollständig.

**Nicht abgedeckt und benannt:** das **Rauschverhalten echter Hardware** (Playwright emuliert keinen Magnetometer — synthetische Events prüfen den ganzen Pfad, aber nicht, wie stark ein reales iPhone schwankt), ob 3 s Karenzzeit die richtige Größe ist, und Firefox. Ob sich die Dämpfung richtig *anfühlt*, entscheidet der Handy-Test des Betreibers.

**QA am 2026-09-20 abgeschlossen: 8 von 9 Acceptance Criteria erfüllt, 1 Medium-Bug (BUG-12), keine Critical- oder High-Bugs.**

**Der wichtigste Einzelbefund betrifft die Testabdeckung, nicht das Produkt:** Mit dem echten Vorgängerstand aus `HEAD~1` bestehen die **82 bestehenden PROJ-3-Tests vollständig** — sie hätten den gemeldeten Fehler nie gefangen, weil sie prüften, dass ein Pfeil *existiert* und eine Rotation *hat*, nie dass die Rotation sich sinnvoll verhält. Gegen denselben Stand fallen **10 von 16** neuen Tests, darunter der Kalibrierungs-Hinweis, den die Gegenprobe der Frontend-Phase nicht erfasst hatte (sie verstellte nur Parameter der neuen Fassung, statt die echte alte Komponente einzuspielen).

Im Browser gemessen statt aus Testnamen abgeleitet, auf beiden Engines identisch: Die Rotationsfolge läuft durch null hindurch (`-0.1 → 1.5`), größter Einzelsprung **2.3°**; ±6° Sensorrauschen kommen als **0.99°** an; eine echte 90°-Drehung wird zu **88.6°** nachgeführt; der Kalibrierungs-Hinweis misst **16px** bei Kontrast **16.22:1**.

**BUG-12 (Medium, offen): Die Nadel friert nach einem ungültigen Sensorwert dauerhaft ein.** Ein `deviceorientation`-Event mit `NaN` oder `Infinity` vergiftet `smoothedRef` — `NaN` ist in der Glättung absorbierend, und weil jeder neue Wert gegen die Ref geglättet wird, erholt sich der Pfeil bis zum Neuladen nicht mehr. **Echter Regress, gegengeprüft:** Der Vorgängerstand erholt sich (`rotate(210.679deg)`), weil er jeden Wert unverändert durchreicht. Medium, weil `NaN` kein spezifizierter Wert ist und der Pfad nur über einen fehlerhaften Sensor erreichbar ist, nicht über die importierte Quest-Datei — für den Spieler wäre die Wirkung aber ein stiller Totalausfall der Nadel. Ein Einzeiler (`Number.isFinite`) deckt es ab.

**Security ohne Befund:** Markup im Stationsnamen wird als escapter Text gerendert (0 Dialoge, 0 injizierte Elemente). Bösartige Sensorwerte erzeugen kein `NaN` im CSS-`transform`. **Responsive** auf 320/390/430px und WebKit: 0px Überlauf. Edge Case 11 (richtungsloser Pfeil) auf allen Kombinationen erhalten.

Die Chrome-Konsolenfehler sind **vorbestehend** — gegengeprüft auf `/about`, das dieses Refinement nicht anfasst; es ist das Vercel-Analytics-Skript, das nur in Production existiert.

**Regression:** Unit **258/258**, E2E über beide Engines **994 passed / 52 skipped / 0 failed / 0 flaky**, Build und Lint sauber. **0 Skips in den PROJ-3-Dateien** — alle 98 Tests laufen wirklich.

**BUG-12 noch am 2026-09-20 behoben.** `applyHeading` verwirft nicht-endliche Werte als Erstes — **vor** `setRawHeading` und **vor** `setCompassFresh`. Die zweite Reihenfolge-Entscheidung ist die weniger offensichtliche: Ein unbrauchbarer Wert ist kein Lebenszeichen des Kompasses; liefe er in die Karenzzeit, hielte er den toten Zustand drei Sekunden am Leben und verdrängte die GPS-Bewegungsrichtung, die noch funktioniert.

Im Browser auf **beiden Engines am Reproduktionspunkt** verifiziert: Wo vorher `rotate(-59.3213deg)` nach `NaN` unverändert stehen blieb, steht jetzt nach einem gültigen Heading von 200° `rotate(-168.715deg)`. Kein `NaN` und kein `Infinity` im CSS-`transform`.

5 neue Unit-Tests, 1 neuer E2E-Test. Per Gegenprobe geschärft: Ohne den Guard fallen **alle 5** Unit-Tests und die 2 zuständigen E2E-Tests. **Ein erster Entwurf ließ nur 4 von 5 fallen** — der Test „hält das Heading unverändert" bestand auch ohne Guard, weil die kaputte Fassung den sichtbaren Wert ebenfalls stehen ließ und nur die interne Ref vergiftete; er prüft jetzt zusätzlich, dass der nächste gültige Wert wieder greift.

**Nebenbefund:** `npx tsc --noEmit` meldete einen Typfehler in `use-arrow-rotation.test.ts` aus der Frontend-Phase. `npm run lint` typisiert Testdateien nicht und hatte ihn nicht gezeigt — behoben.

**QA der Behebung am 2026-09-20 abgeschlossen: BUG-12 bestätigt behoben, keine Bugs jeglicher Schwere, Production-Ready. Status Approved.**

Unabhängig nachgemessen statt übernommen — und dabei ein Pfad geprüft, den die Frontend-Phase nicht betrachtet hatte: `handleOrientation` hat **zwei** Eingänge, und nur der `webkitCompassHeading`-Pfad war verifiziert. Der `alpha`-Pfad reicht einen berechneten Wert `(360 - alpha) % 360` weiter, der mit NaN ebenfalls NaN ergibt, und `setNeedsCalibration` läuft dort außerhalb des Guards. Beides in Ordnung — **3 zusätzliche Unit-Tests**, die es ohne diese QA nicht gäbe.

Im Browser auf beiden Engines und beiden Pfaden: Kompass-Pfad `-59.32 → -168.72` (Chrome) und `-59.32 → -168.71` (WebKit), alpha-Pfad `120.679 → 230.072`. Kein `NaN` im CSS-`transform`, Pfeil durchgehend sichtbar.

**Wieder ein Test, der die falsche Eigenschaft prüfte:** Meine ersten drei alpha-Tests bestanden die Gegenprobe auch ohne Guard — sie prüften `Number.isFinite`, und der eingefrorene Wert ist ebenfalls endlich. Nachgemessen friert das Heading ohne Guard bei 270 ein statt 160 zu erreichen. Nach der Korrektur auf den Zielwert fällt der Test. **Das vierte Mal in dieser Sitzung, dass ein grüner Test nichts belegte.**

Gegenprobe: ohne Guard fallen **6 von 8** Unit-Tests und **2 von 18** E2E-Tests. Die zwei verbleibenden sind absichtlich guard-unabhängig (`needsCalibration` bei unbrauchbarem alpha, und Heading **0** darf nicht verworfen werden — ein Falsy-Check hätte ausgerechnet Nord mitverworfen).

**Regression:** Unit **266/266** (vorher 258), E2E **996 passed / 52 skipped / 0 failed / 0 flaky**, Build/Lint/`tsc` sauber.

**Ein eigener Messfehler, offen benannt:** Meine erste Sonde meldete den alpha-Pfad als „nicht erholt" — Ursache war ein `p.reload()` in der Sonde, nach dem der Navigations-Screen nicht wieder erreicht wurde. Gemessen wurde ein leerer Screen. Das Produkt war richtig.

**Am 2026-09-20 nach Production deployt** (Tag `v1.35.0-PROJ-3`, Commits `39d75ee`/`74d5ad7`/`7c2d855`) — live auf https://geoquesty.vercel.app und dort verifiziert.

**Ein statischer Bundle-Check reichte diesmal nicht:** Der Navigations-Screen wird lazy geladen, sein Chunk steht nicht im ausgelieferten HTML von `/play`. Ein erster `grep`-Nachweis über die referenzierten Chunks konnte deshalb gar nicht anschlagen — und `isFinite` allein wäre kein Beweis gewesen, weil der Bezeichner in fünf fremden Chunks vorkommt. Verifiziert wurde im echten Browser auf **beiden Engines**: Rotation verlässt 0..360 (gemessen `-779.11` und `-888.72` — von der alten normalisierten Fassung prinzipiell nicht erzeugbar), Ruhe bei ±6° Rauschen **1.56°** (Chrome) und **1.30°** (WebKit), BUG-12 erholt sich, Kalibrierungs-Hinweis **16px** im neuen Wortlaut.

Alle sieben Routen HTTP 200 mit 0,07–0,40 s, Security-Header inkl. HSTS. Nachbarfeatures unbeschädigt (`/about` mit FAQPage + 1× Ko-fi, `/anleitung` weiterhin 0 Treffer für den Prompt, `sw.js` und Manifest 200). **WebKit mit 0 Konsolenfehlern und 0 fehlgeschlagenen Requests.**

**Eine Auffälligkeit geprüft statt weggewunken:** Chrome meldete 2 Konsolen-404. Ein ruhiger Besuch von `/`, `/about` und `/play` erzeugt **0** davon — sie stammen aus `/play/<id>`, das serverseitig 404 liefert, weil Quests nur im localStorage liegen. Vorbestehend, seit dem Deploy vom 2026-09-07 dokumentiert.

**PROJ-3 ist abgeschlossen.** Offen bleibt allein die inhaltliche Abnahme, die keine Testumgebung leisten kann: ob sich die Dämpfung am echten Gerät richtig anfühlt. Die Parameter sind zwei Konstanten im Hook.

## Offenes Refinement: Touch-Sortierung im Player (2026-09-20)
**PROJ-4** geht von Deployed zurück auf In Progress. Betreiber-Befund: *"der Aufgabentyp sortieren auf dem handy fühlt sich mit touch merkwürdig an. Ich habe erwartet, dass das was ich anfasse sich ein wenig hebt und dann kann ich es per drag und drop verschieben."* Dazu die Frage, ob Pfeile auf kleinen Bildschirmen der bessere Weg wären.

**Die Antwort ist nein — und die Spec war von Anfang an auf der Seite des Befunds.** Edge Case 5 fordert seit dem 2026-08-24 wörtlich *"Touch-Hold aktiviert Drag. Visuelles Feedback (Item hebt sich ab, Schatten)"*. Gebaut wurde das nie. Der Befund ist also kein falsch gewähltes Interaktionsmuster, sondern ein nicht umgesetztes.

**Gemessen im Production-Build auf einem Pixel-7-Viewport mit echten Touch-Events:** `transform: none`, `box-shadow: none` und `opacity: 1` in **jeder** Phase der Berührung — beim Antippen, nach 250 ms Halten und während der Bewegung. Das Element unter dem Finger bewegt sich nicht; stattdessen teilt eine eigene `onTouchMove`-Rechnung die gewanderte Strecke durch die hartkodierte Konstante `itemHeight = 58` und tauscht Listeneinträge, sobald eine ganze Zahl herauskommt. Genau das erzeugt das beschriebene Gefühl: keine Rückmeldung auf das Anfassen, dann ein unangekündigter Sprung.

**Zweitbefund, nicht gemeldet und schwerwiegender:** `handleTouchMove` ruft nie `preventDefault()`, dem Drag-Handle fehlt `touch-action: none`. Jede vertikale Wischbewegung über einem Item verändert die Reihenfolge. Gemessen auf einer bis zum Anschlag gescrollten Station (`scrollTop 2689` von 2689, also ohne jede Scroll-Reserve): Der Wisch ließ die Seite stehen — **und tauschte trotzdem zwei Items**. Ein Spieler kann eine bereits richtig sortierte Liste zerstören, während er nur weiterliest, und merkt es erst bei "Prüfen".

**Die Ursache hinter beidem:** `sorting-task.tsx` pflegt **zwei** Implementierungen derselben Geste — HTML5 `draggable` für die Maus und die eigene Pixel-Rechnung für den Finger. `draggable` feuert auf Touch gar nicht. Auf dem Handy lief also nie der Code, der am Desktop geprüft wurde.

Entschiedene Lösung: beide Pfade entfallen zugunsten **eines** `@dnd-kit`-Pfads — dieselbe Bibliothek, die im Creator bereits drei sortierbare Listen trägt und seit PROJ-8 ohnehin Abhängigkeit ist. **Kein neues Paket.** Long-Press (150 ms), sichtbares Anheben, Ausweichanimation und `touch-action: none` kommen damit aus einer Quelle statt aus Handarbeit. Sensoren-Werte identisch zum Creator, damit es eine Zahl zum Nachjustieren gibt statt zwei.

Erwogen und verworfen: **Pfeil-Buttons** (hätten zwei dokumentierte Entscheidungen umgekehrt — 2026-08-24 "gamiger, Zielgruppe ist Touch-affin" und 2026-09-02, als Pfeile aus einem Mockup ausdrücklich nicht übernommen wurden — um einen Fehler zu umgehen statt ihn zu beheben) und **die eigene Mechanik reparieren** (hätte nachgebaut, was `@dnd-kit` fertig mitbringt und was hier schon einmal misslang: BUG-3 korrigierte `itemHeight` von 56 auf 58, und der Wert bricht bei jeder Styling-Änderung erneut still).

Spec ist aktualisiert (8 neue Acceptance Criteria in einem eigenen Block, Edge Case 5 als "spezifiziert, nie gebaut" markiert statt gelöscht, Edge Cases 12–15, 7 Technical Requirements, 4 Produkt- und 4 technische Entscheidungen, 1 überholte Entscheidung von 2026-08-24 als solche gekennzeichnet, 3 geschlossene und 3 neue Open Questions, dazu ein Abschnitt "Refinement 2026-09-20" mit der vollständigen Messtabelle).

**Für `/frontend` zu beachten:** Der gelöste/read-only-Zustand (Edge Case 11) darf sich nicht ändern — die bestehenden Tests dazu müssen grün bleiben, **ohne angefasst zu werden**, sie sind der Wächter gegen Kollateralschaden. Bestehende Assertions auf `div[draggable="true"]` werden durch den Umbau falsch und sind zu **ziehen, nicht zu löschen**. Und der eigentliche Regressionswächter fehlt bisher ganz: Kein Test hält fest, dass ein Wisch *ohne* Long-Press die Reihenfolge unverändert lässt — genau diese Lücke hat den Zweitbefund durchgelassen, während die Suite grün war.

**Nicht abgedeckt:** das Gefühl am echten Gerät (ob 150 ms richtig sind, entscheidet ein Daumen, kein Emulator) und die Gegenprobe auf iOS Safari (Playwright kann auf WebKit keine vergleichbaren Touch-Sequenzen senden; der fehlende `transform` steckt aber im Produktcode, nicht in der Engine).

**Frontend umgesetzt am 2026-09-20.** Eine Produktivdatei (`sorting-task.tsx`), kein neues Paket, keine neue Komponente, keine neue Route. Die handgeschriebene Touch-Rechnung und die HTML5-`draggable`-Handler sind ersatzlos entfallen — ein `@dnd-kit`-Pfad bedient jetzt Maus und Finger zugleich.

**Der gemeldete Befund ist behoben, gemessen an denselben Punkten, an denen vorher überall `none` stand:** Das gegriffene Item misst `matrix(1.03, …)`, trägt Schatten und `z-index: 10`, und der Translate-Anteil ändert sich bei **6 von 6** Messungen — es folgt dem Finger, statt in 58-px-Stufen zu springen. Nach dem Loslassen legt es sich ab (`transform: none`, kein Schatten).

**Der Zweitbefund ebenfalls, nach Fläche getrennt:** Ein 41 ms schneller Wisch über dem Zeilentext scrollt jetzt die Seite (2077 → 4099) und lässt die Reihenfolge **unverändert**; derselbe Wisch auf dem Greif-Handle zieht. `touch-action` misst `auto` auf der Zeile, `none` auf dem Handle.

**Ein echter Implementierungsfehler von mir, durch Messen gefunden:** Der erste Entwurf legte Drag-Listener und `touch-action: none` auf die **ganze Zeile** statt nur auf das Handle — damit war die Zeile nirgends mehr Scroll-Fläche und der Zweitbefund blieb bestehen (39 ms Wisch sortierte weiter um, bei 2022 px Scroll-Reserve). Korrigiert auf das Muster des Creators.

**Ein Messfehler mit Lehrwert für künftige Läufe:** Meine erste Sonde meldete, eine schnelle Wischbewegung sortiere um. Die Geste dauerte real **420 ms** — ein `await page.waitForTimeout(10)` plus `evaluate`-Roundtrip je Schritt kosten ~35 ms, und die 150-ms-Schwelle misst echte Zeit. Meine "schnelle Wischbewegung" war ein langsames Halten. Aussagekräftig wurde der Test erst ohne `await` zwischen den Schritten (39–48 ms).

**Ein bestehender Test war zu Recht falsch geworden, aber nicht aus dem naheliegenden Grund:** *"shows solved feedback once the items are dragged…"* fiel auf beiden Engines. Ursache ist nicht das Produkt — Playwrights `dragTo` bewegt mit `@dnd-kit` **gar nichts**, weil es zu wenige Zwischenschritte sendet; mit HTML5-`draggable` genügte das Drop-Ereignis. Neuer Helfer zieht in 10 Schritten am Handle, der Test besteht auf Chrome **und** WebKit — womit belegt ist, dass das Ziehen auf beiden Engines funktioniert.

**Eine Erwartung bleibt bewusst unerfüllt, nach Rückfrage entschieden:** Reines Halten ohne Bewegung hebt das Item nicht an (400 ms gehalten, 0 px bewegt → `transform: none`); es hebt sich beim ersten Bewegen. Die Alternative hätte ~20 Zeilen eigenen Zustand neben `@dnd-kit` gekostet — genau die Handarbeit, die dieses Refinement abbaut.

5 neue Tests, aufgeteilt in zwei Gruppen: Zwei Zusicherungen brauchen keine CDP-Touch-Events und laufen auf **beiden** Engines, drei Gesten-Tests sind Chromium-gebunden. Per Gegenprobe geschärft: Mit der echten Vorgängerfassung fallen **4 von 5**; der fünfte (gelöster Zustand) besteht in beiden Fassungen — richtig so, er ist der Wächter gegen Kollateralschaden. Offen benannt: Die 4 fallen per Timeout statt mit sauberer Assertion, weil das Greif-Handle in der alten Fassung nicht existiert.

**Suiten gegen den Production-Build:** Unit **266/266**, E2E über beide Engines **1003 passed / 0 failed / 0 flaky / 55 skipped** (vorher 57). Build und Lint sauber. **Am Bildschirm abgenommen:** Teal-Rahmen, Schatten und Vergrößerung beim Greifen, das Item schwebt während der Bewegung sichtbar über der Liste, die übrigen Zeilen geben die Lücke frei, nach dem Loslassen gleichmäßiger Rhythmus ohne Restschatten.

**Nicht abgedeckt:** das Gefühl am echten Gerät, echte Touch-Gesten auf iOS Safari (dort ist die Struktur geprüft, das Ziehen über den Maus-Pfad), Firefox, und ob der Creator dieselbe Anhebe-Rückmeldung bekommen soll (dort weiterhin nur `opacity: 0.5`).

**QA am 2026-09-20 abgeschlossen: 7 von 8 Acceptance Criteria erfüllt, 1 Kriterium als Spec-Fehler identifiziert, 2 neue Low-Bugs, keine Critical/High. Production-Ready.**

Weil das Feature in derselben Sitzung gebaut wurde, habe ich die zentralen Behauptungen **neu gemessen statt übernommen** — auf drei Viewports statt einem (Pixel 7, iPhone 13, 320×568), zusätzlich auf WebKit, und um die drei Kriterien erweitert, die die Frontend-Phase nicht isoliert geprüft hatte (Lückenbildung, Parallel-Scroll, Ziehen über den Listenrand).

**Der wichtigste Einzelbefund ist ein Fehler in der Spec, nicht im Produkt.** AC-6 ("die Seite scrollt während des Ziehens nicht mit") schien zunächst verletzt (2130 → 2088). Statt das zu melden, habe ich instrumentiert: Die Seite steht bei **8 von 10** Bewegungsschritten still und scrollt erst, wenn der Finger den Bildschirmrand erreicht. Gegenprobe mit zwei Zuggrößen: bildschirmmittiger Zug → **0 px Scroll**, Zug bis 120 px an den Rand → −9 px. Das ist `@dnd-kit`s Auto-Scroll — die Funktion, ohne die sich ein Item gar nicht an eine Position außerhalb des sichtbaren Bereichs ziehen ließe. Wörtlich genommen würde AC-6 lange Listen unbedienbar machen; das Kriterium ist zu absolut formuliert und in der Spec entsprechend korrigiert.

**Gegenprobe schärfer geführt als in der Frontend-Phase:** Mit der echten Vorgängerfassung aus `HEAD` fallen **9 Tests** statt 4 — weil ich die nachgezogenen Bestandstests einbezogen habe. Darunter beide gemeldeten Befunde und der `touch-action`-Wächter **auf beiden Engines**. Produktcode danach per `diff` als byte-identisch bestätigt.

**Security ohne Befund:** Markup in Frage und Items wird als escapter Text gerendert — 0 injizierte Elemente, 0 Dialoge, kein `window.__pwned`. Die Roh-Texte landen zusätzlich im `aria-label` der Greif-Buttons, dort als Attributwert statt als Markup. Ein 200-Zeichen-Item erzeugt keinen horizontalen Scrollbalken.

**Kontrast gemessen:** Item-Text **19,24:1**, Greif-Icon **7,90:1**, Tap-Ziele 44×44 auf allen drei Viewports.

**Zusätzlich geprüft und nicht in der Spec gefordert:** doppelte Item-Texte (die stabilen IDs verhindern React-Key-Kollisionen — 4 von 4 Items überleben das Ziehen), 2 und 8 Items, der volle Durchlauf bis "Station abschließen", und die Tastaturbedienung.

**Zwei neue Low-Bugs, beide nicht blockierend:**
- **BUG-13:** `@dnd-kit` setzt `role="button"` und `tabindex="0"` auf die Greif-Handles — sie sind in 3 Tabs erreichbar und geben sich als bedienbar aus, aber ohne registrierten `KeyboardSensor` passiert bei Space/Pfeiltasten nichts. Folge der bewussten Entscheidung "nur Ziehen", ein eigener Refinement-Anlass.
- **BUG-14:** Das Anheben löst bei der ersten Bewegung aus, nicht beim reinen Halten (400 ms gehalten, 0 px bewegt → `transform: none`). Vom Betreiber während der Frontend-Phase abgenommen; als Bug geführt, weil Spec-Wortlaut und Implementierung auseinandergehen.

**Regression:** Unit **266/266**, E2E beide Engines **1003 passed / 0 failed / 0 flaky / 55 skipped**, neue Suite **3× seriell identisch grün** (keine Flakiness). Die 55 Skips sind nachvollzogen: 52 vorbestehend, 3 die Chromium-gebundenen CDP-Gesten-Tests. **WebKit mit 0 Konsolenfehlern**, Struktur und Anheben dort identisch gemessen und am Bildschirm abgenommen.

**Eine Auffälligkeit geprüft statt weggewunken:** Konsolen-404s für `/_vercel/insights/script.js` treten auf `/about` — einer von diesem Feature unberührten Route — genauso auf. Vercel Analytics existiert nur in Production; vorbestehend, kein Regressionsbefund.

**Am 2026-09-20 nach Production deployt** (Tag `v1.36.0-PROJ-4`, Commit `592b743`) — live auf https://geoquesty.vercel.app und dort verifiziert. Vercel deployte automatisch von `main`.

**Ein statischer Bundle-Scan hätte hier nichts belegt — und das ist selbst ein Ergebnis.** Der Sortier-Code liegt in einem Chunk, den `/play` gar nicht referenziert (lokal gegengeprüft: 1 von 44 Chunks trägt das Label, `/play` lädt 16, keiner davon dieser); die Komponente lädt erst beim Öffnen einer Station. Mein erster Live-Check suchte im Bundle und fand nichts — das war ein Messfehler, kein fehlgeschlagener Deploy. Verifiziert wurde deshalb über eine echte Browser-Sitzung gegen die Live-Seite, auf **beiden Engines**.

**Der entscheidende Wert ist `draggable="true"` = 0:** Das Attribut der alten HTML5-Implementierung ist verschwunden — damit ist belegt, dass die neue Fassung ausgeliefert wird und nicht die vorherige. Dazu live gemessen, auf Chrome und WebKit identisch: Anheben `matrix(1.03, 0, 0, 1.03, 0, 82)` mit Schatten und `z-index: 10`, `touch-action` `auto` auf der Zeile und `none` auf dem Handle, Handles 44×44, Umsortieren funktioniert, sauberes Ablegen. **WebKit mit 0 Konsolenfehlern.** Am Bildschirm abgenommen: Das gezogene Item schwebt mit Teal-Rahmen über der Liste, die übrigen geben die Lücke frei.

Alle sieben Routen HTTP 200 mit 0,06–0,15 s, Security-Header aktiv inkl. HSTS. Nachbarfeatures unbeschädigt: `/about` mit `FAQPage` und 1× Ko-fi, `/anleitung` weiterhin 0 Treffer für den zurückgehaltenen Prompt, `sw.js` 200.

**Eine Auffälligkeit geprüft statt weggewunken:** Der Durchlauf meldete `404 /play/prod` — systembedingt und vorbestehend, weil Quests nur im localStorage liegen und der Server die ID nicht kennen kann; der Client rendert korrekt, für den Nutzer unsichtbar. Gegenprobe mit `/play/irgendwas` liefert denselben 404. Bereits im Deploy vom 2026-09-07 dokumentiert.

**PROJ-4 ist abgeschlossen.** Offen bleiben die beiden Low-Bugs BUG-13 (Greif-Handles fokussierbar, aber per Tastatur ohne Funktion) und BUG-14 (Anheben beim ersten Bewegen statt beim Halten, abgenommen) — beide nicht blockierend und ein eigenes Refinement wert, zusammen mit der Frage, ob der Creator dieselbe Anhebe-Rückmeldung bekommt.

**Offen geblieben:** ob der Creator dieselbe Anhebe-Rückmeldung bekommt. Dort greift `@dnd-kit` bereits, aber das gezogene Element wird nur auf `opacity: 0.5` gesetzt — es hebt sich ebenfalls nicht sichtbar ab. Nicht gemeldet, nicht gemessen, daher nur notiert.

