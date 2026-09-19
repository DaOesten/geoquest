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
| PROJ-12 | PWA-Installation | P0 | PROJ-1 | Deployed | [Spec](PROJ-12-pwa-installation.md) | 2026-08-23 |
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

Offen für `/frontend`: ob die Kanone aus einem oder zwei Punkten feuert und wie lange der Schuss dauert — beides am besten am Gerät zu entscheiden.

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
