# PROJ-14: KI-Anleitung — „Coming soon" zum Launch

## Status: Deployed
**Created:** 2026-09-17
**Last Updated:** 2026-09-18 (deployt, Tag `v1.29.0-PROJ-14`)

## Dependencies
- Requires: PROJ-13 (Landing Page) — die Seite `/anleitung`, ihre Einstiegspunkte und der geteilte Seitenrahmen `InfoPageShell` stammen von dort
- Requires: PROJ-1 (App Shell & Mode Switch) — der Menu-Eintrag „Anleitung" und die Datenstruktur `APP_NAV_GROUPS` gehören dorthin
- Berührt: PROJ-6 (Creator — Quest-Verwaltung) — die Leeransicht von `/create` trägt einen der drei Einstiegspunkte

_Keine Datenabhängigkeit: Dieses Feature ändert ausschließlich Sichtbarkeit und Copy. Quest-Modell, Import und Editor bleiben unberührt._

## Kontext

Die Seite `/anleitung` ist **fertig gebaut und deployt** (Tag `v1.27.0-PROJ-13`): Prompt-Vorlage zum Kopieren, vier Schritte, vier Troubleshooting-Einträge, ein Ausblick-Kasten „Was dabei herauskommt". Der Betreiber hat entschieden, **die App ohne diese Funktion zu launchen** — aber anzukündigen, dass sie kommt.

Der Grund, warum das ein eigenes Feature ist und kein reines Zurückrollen: Die KI-Anleitung ist an **fünf Stellen** in die App eingewoben, drei davon werblich. Sie einfach abzuschalten würde einen Menu-Eintrag ins Leere zeigen lassen, zwei Call-to-Actions auf eine Ankündigung führen und eine FAQ-Antwort auf `/about` stehen lassen, die eine Funktion beschreibt, die es nicht gibt. Der Launch soll nichts versprechen, was er nicht hält — und zugleich das Interesse für später halten.

**Die fünf Berührungspunkte (vollständig erhoben, Stand 2026-09-17):**

| # | Ort | Heute | Datei |
|---|-----|-------|-------|
| 1 | Die Seite selbst | Prompt, Schritte, Troubleshooting | `src/app/(info)/anleitung/page.tsx` |
| 2 | Burger-Menu, Gruppe „Info" | Eintrag „Anleitung" → `/anleitung` | `src/lib/app-nav.ts` |
| 3 | `/about`, sekundärer Hero-CTA | Button „Mit KI erstellen" | `src/app/(info)/about/page.tsx` |
| 4 | `/create`, Leeransicht | Textlink „Quest mit KI bauen" | `src/app/create/page.tsx` |
| 5 | Desktop-Header aller Info-Seiten | einziger Textlink: „Anleitung" | `src/lib/app-nav.ts` (`HEADER_NAV_LINKS`) |

Dazu die FAQ-Antwort „Wie lange dauert das Erstellen?" auf `/about`, die die KI-Anleitung als gegebenen Weg beschreibt.

**Leitgedanke:** Der fertige Inhalt wird **nicht gelöscht**, sondern nur nicht gerendert. Das spätere Freischalten soll eine kleine, risikoarme Änderung sein — kein Wiederaufbau.

## User Stories

- Als **Besucher**, der einem geteilten Link oder QR-Code auf `/anleitung` folgt, möchte ich eine verständliche Seite vorfinden statt einer Fehlermeldung, damit ich weiß, dass das Angebot existiert und nur noch nicht verfügbar ist.
- Als **Ersteller** (Elternteil, Lehrkraft, Jugendleiter) möchte ich beim Launch nur Wege angeboten bekommen, die auch funktionieren, damit ich nicht auf einen Button klicke, der mir nichts liefert.
- Als **interessierter Ersteller** möchte ich erfahren, dass die KI-Unterstützung geplant ist und was sie können wird, damit ich später wiederkomme.
- Als **Betreiber** möchte ich die fertige Anleitung im Code behalten, damit ich sie nach dem Launch mit minimalem Aufwand freischalten kann.
- Als **Betreiber** möchte ich, dass keine Stelle der App eine Funktion verspricht, die es zum Launch nicht gibt, damit der erste Eindruck der App ehrlich ist.

## Out of Scope

- **Das Freischalten der Anleitung selbst** — die Gegenrichtung (Ankündigung entfernen, Inhalt wieder sichtbar) ist ein eigener, späterer Vorgang. Dieses Feature bereitet ihn nur vor.
- **Inhaltliche Änderungen an der Anleitung** — Prompt, Schritte und Troubleshooting werden nicht überarbeitet, nur ausgeblendet. Was zum Launch nicht gezeigt wird, bleibt inhaltlich unverändert liegen.
- **Eine E-Mail-Benachrichtigung / „Sag mir Bescheid"-Anmeldung** — bewusst verworfen: erfordert Backend und Datenverarbeitung, beides laut PRD ausgeschlossen (kein Backend, kein Account).
- **Ein Datum oder Zeitraum für die Verfügbarkeit** — siehe Product Decisions.
- **Ein allgemeines Feature-Flag-System** — dieses Feature schaltet genau eine Seite. Eine generische Infrastruktur dafür wäre Overhead ohne zweiten Anwendungsfall.
- **Änderungen an `/impressum` und `/datenschutz`** — sie verweisen nicht auf die Anleitung und bleiben unangetastet.
- **Die Prompt-Vorlage aus dem Auslieferungs-Bundle entfernen** — nicht das Ziel. Der Prompt ist kein Geheimnis, er soll nur nicht als fertiges Angebot präsentiert werden.
- **BUG-2 (16px-Schließen-X) und BUG-9 (kein `:focus-visible`)** — vorbestehend und app-weit, unabhängig von diesem Feature.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Die Ankündigungsseite

- [ ] Angenommen ein Besucher ruft `/anleitung` auf, wenn die Seite lädt, dann erhält er HTTP 200 und eine Ankündigungsseite statt einer 404-Seite
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite betrachtet, dann erkennt er an einer deutlich sichtbaren Kennzeichnung („Bald verfügbar"), dass die Funktion noch nicht nutzbar ist
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite liest, dann erfährt er in wenigen Sätzen, was die KI-Anleitung können wird (Quest von ChatGPT oder Claude bauen lassen — mit Story, Zielen und Rätseln)
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite betrachtet, dann sieht er die vier Punkte aus „Was dabei herauskommt" als Ausblick, sprachlich in die Zukunft gesetzt
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite vollständig durchsucht, dann findet er **weder die Prompt-Vorlage noch den Kopieren-Button** — auch nicht ausgeblendet im sichtbaren Text
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite vollständig durchsucht, dann findet er **keine Schritt-für-Schritt-Anleitung und keine Troubleshooting-Einträge**
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite betrachtet, dann findet er **keine Datums- oder Zeitraumangabe** zur Verfügbarkeit
- [ ] Angenommen ein Besucher steht auf der Ankündigungsseite, wenn er weitermachen möchte, dann bietet ihm die Seite einen Weg zum manuellen Erstellen (`/create`) an
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er den Zurück-Pfeil benutzt, dann gelangt er nach `/about` — wie vor der Änderung

### Die Einstiegspunkte

- [ ] Angenommen ein Nutzer öffnet das Burger-Menu auf einem beliebigen Screen, wenn er die Gruppe „Info" betrachtet, dann sieht er den Eintrag „Anleitung" weiterhin, versehen mit einer Kennzeichnung „Bald"
- [ ] Angenommen ein Nutzer sieht den Menu-Eintrag „Anleitung" mit der „Bald"-Kennzeichnung, wenn er ihn antippt, dann gelangt er auf die Ankündigungsseite (der Eintrag bleibt bedienbar, nicht deaktiviert)
- [ ] Angenommen ein Besucher ist auf `/about`, wenn er den Hero betrachtet, dann sieht er **nur noch einen** Call-to-Action („Quest erstellen") — der sekundäre Button „Mit KI erstellen" ist entfallen
- [ ] Angenommen ein Ersteller öffnet `/create` ohne angelegte Quests, wenn er die Leeransicht betrachtet, dann sieht er „Neue Quest erstellen" und „Quest importieren", aber **keinen Link „Quest mit KI bauen"**
- [ ] Angenommen ein Besucher ist auf einer Info-Seite an einem Desktop-Viewport, wenn er die Kopfzeile betrachtet, dann sieht er **keinen Textlink „Anleitung"** mehr — die Kopfzeile trägt nur noch das Ko-fi-Icon und „Zur App"
- [ ] Angenommen der Textlink der Kopfzeile ist entfallen, wenn ein Besucher die Kopfzeile auf 375px, 768px und 1440px betrachtet, dann ist die Kopfzeile in allen drei Breiten frei von Überlauf und Lücken im Layout

### Ehrlichkeit der übrigen Copy

- [ ] Angenommen ein Besucher liest die FAQ auf `/about`, wenn er die Frage zum Erstellen einer Quest aufklappt, dann beschreibt die Antwort das **manuelle** Erstellen, ohne die KI-Anleitung als verfügbaren Weg darzustellen
- [ ] Angenommen die FAQ-Antwort wurde umgeschrieben, wenn ein Besucher sie liest, dann enthält sie **keine Zeitangabe** zur Dauer des Erstellens
- [ ] Angenommen die Zeitangabe entfällt, wenn die zugehörige FAQ-Frage gelesen wird, dann fragt sie nicht mehr nach der Dauer (sonst bliebe sie unbeantwortet)
- [ ] Angenommen die FAQ-Antwort wurde geändert, wenn das ausgelieferte `FAQPage`-JSON-LD auf `/about` geprüft wird, dann trägt es denselben neuen Text wie die sichtbare Seite
- [ ] Angenommen ein Besucher durchsucht `/about` und `/create`, wenn er nach Aussagen über KI-Unterstützung sucht, dann findet er **keine Formulierung, die sie als bereits verfügbar darstellt**

### Bewahrung des fertigen Inhalts

- [ ] Angenommen die Ankündigung ist live, wenn ein Entwickler den Quelltext prüft, dann sind Prompt-Vorlage, Schritte und Troubleshooting **weiterhin im Repository vorhanden** und nicht gelöscht
- [ ] Angenommen der Betreiber möchte die Anleitung später freischalten, wenn er den dafür vorgesehenen Schalter umlegt, dann erscheint die vollständige Seite wieder — ohne dass Inhalte neu geschrieben werden müssen

### Keine Regression

- [ ] Angenommen `/anleitung` wurde umgebaut, wenn `/about`, `/impressum` und `/datenschutz` aufgerufen werden, dann sind sie unverändert und vollständig (der geteilte Seitenrahmen `InfoPageShell` wird mitverändert)
- [ ] Angenommen der Menu-Eintrag trägt eine neue Kennzeichnung, wenn das Burger-Menu geöffnet wird, dann sind weiterhin **vier Gruppen mit sieben Zielen** vorhanden und der Ko-fi-Eintrag ist unberührt
- [ ] Angenommen der sekundäre CTA auf `/about` ist entfallen, wenn die Seite auf den elf bekannten Referenz-Viewports (320×568 bis 1920×1080) geprüft wird, dann steht der verbliebene primäre CTA weiterhin über dem Falz (BUG-7 bleibt behoben)

## Edge Cases

1. **Besucher kommt über einen alten geteilten Link / QR-Code direkt auf `/anleitung`** → Er landet auf der Ankündigungsseite mit HTTP 200, nicht auf einer 404. Genau dafür bleibt die Route bestehen.
2. **Suchmaschine hat die alte `/anleitung` mit Prompt und Schritten indexiert** → Das Snippet im Suchergebnis kann veraltet sein, bis neu gecrawlt wird. Der Besucher landet aber auf einer Seite, die den Zustand klar erklärt. Metadaten (Title/Description) der Seite werden auf die Ankündigung gezogen, damit die Diskrepanz so kurz wie möglich bleibt.
3. **Nutzer hat die Seite im Browser-Cache oder als PWA-Shell offline** → Er sieht kurzzeitig die alte Fassung. Unkritisch: Der Prompt funktioniert weiterhin, er ist ja kein Geheimnis. Beim nächsten Laden erscheint die Ankündigung.
4. **Nutzer öffnet das Burger-Menu, während er auf `/anleitung` steht** → Der Eintrag „Anleitung" wird wie bisher als aktive Seite markiert (`aria-current`), zusätzlich zur „Bald"-Kennzeichnung. Beides zugleich ist korrekt: Es ist die aktuelle Seite *und* eine angekündigte Funktion.
5. **Screenreader-Nutzer erreicht den Menu-Eintrag** → Die „Bald"-Kennzeichnung muss vorgelesen werden, nicht nur visuell erkennbar sein. Ein rein farbliches oder rein grafisches Signal genügt nicht.
6. **Besucher mit sehr schmalem Viewport (320px) öffnet das Menu** → Der Eintrag „Anleitung" plus Kennzeichnung darf nicht umbrechen oder das 44px-Tap-Ziel verkleinern.
7. **Die Leeransicht von `/create` verliert einen ihrer drei Wege** → Es bleiben „Neue Quest erstellen" und „Quest importieren". Die Ansicht darf dadurch nicht unausgewogen oder leer wirken; der Abstand zwischen den verbliebenen Elementen ist zu prüfen.
8. **Der Hero auf `/about` verliert seinen zweiten Button** → Der verbleibende primäre CTA darf nicht allein und verloren wirken. Zugleich gewinnt der Hero Höhe, was BUG-7 (CTA über dem Falz) entschärft statt gefährdet.
9. **Der Desktop-Header verliert seinen einzigen Textlink** → `HEADER_NAV_LINKS` wird zur leeren Liste. Die Kopfzeile muss auch ohne Eintrag korrekt umbrechen und darf keine leere Lücke oder verrutschte Ausrichtung zeigen.
10. **Jemand ruft `/anleitung` mit angehängten Parametern auf** (z. B. aus einer Kampagne) → Verhalten unverändert, die Ankündigungsseite wird normal gerendert.
11. **Freischaltung später: Der Betreiber legt den Schalter um, vergisst aber die „Bald"-Kennzeichnung im Menu** → Vermeidbar, wenn beide Stellen von **derselben** Quelle gesteuert werden. Als technische Anforderung festgehalten.

## Technical Requirements

- **Eine einzige Schaltstelle:** Sichtbarkeit der Anleitung und die „Bald"-Kennzeichnung im Menu müssen von derselben Konstante abhängen. Zwei unabhängige Schalter würden beim Freischalten auseinanderlaufen (Edge Case 11).
- **Inhalt bleibt erhalten:** Prompt (`src/lib/quest-ai-prompt.ts`), Schritte, Troubleshooting und die Komponente `prompt-copy-box.tsx` bleiben im Repository. Löschen ist ausdrücklich nicht gewünscht.
- **Der Prompt darf nicht im ausgelieferten HTML der Ankündigungsseite stehen** — nicht aus Geheimhaltung, sondern damit die Seite nicht versehentlich doch die Vorlage preisgibt und das Ausblenden dadurch wirkungslos wird.
- **Metadaten mitziehen:** `title` und `description` der Route beschreiben die Ankündigung, nicht die fertige Anleitung (Edge Case 2).
- **Statisch bleiben:** `/anleitung` steht im Build heute als statisch (`○`). Das muss so bleiben — die Ankündigung braucht keine Laufzeitlogik.
- **`InfoPageShell` bleibt Server-Komponente** — eine der bestehenden Design-Entscheidungen aus PROJ-13; Änderungen an der Kopfzeile dürfen sie nicht zur Client-Komponente machen.
- **Design System:** Die „Bald"-Kennzeichnung folgt `docs/design-system.md`. Zu beachten: maximal ein Lime-Element pro Screen (dokumentierte Regel aus PROJ-13), Kontrast ≥ 4.5:1, Tap-Ziele ≥ 44px.
- **Barrierefreiheit:** Die Kennzeichnung ist für Screenreader wahrnehmbar (Edge Case 5).
- **Tests:** Die bestehenden Suiten prüfen `/anleitung` an 41 Stellen über sechs Dateien (`proj-13-landing-page.spec.ts` allein 21×). Sie müssen auf den neuen Zustand gezogen werden — inklusive der Tests, die den Header-Textlink und den `/about`-CTA prüfen.
- **Browser:** Chrome und Mobile Safari (WebKit), wie im Projekt etabliert.

## Open Questions

- [x] **Geschlossen 2026-09-17:** Die FAQ-Antwort trägt **gar keine Zeitangabe** mehr (Betreiber-Entscheidung). Folge: Die Frage selbst wird mit umformuliert — eine Frage nach der Dauer ohne Antwort auf die Dauer wirkt ausweichend. Neu geht es darum, *was* zu tun ist, nicht *wie lange* es dauert.
- [ ] Soll die Ankündigungsseite den Hinweis tragen, dass Quests sich **auch heute schon** mit einer KI bauen lassen (der Prompt existiert ja, nur die Anleitung ist nicht veröffentlicht)? Aktuell nein — das würde die Ankündigung untergraben. Bei Nachfragen von Nutzern neu zu bewerten.
- [x] **Geschlossen 2026-09-17 (Frontend):** Die Meta-Zeile entfällt auf der Ankündigung — sie beschreibt einen Ablauf, der dort nicht gezeigt wird. Im freigeschalteten Zustand bleibt sie.
- [x] **Geschlossen 2026-09-17:** Ja — der freigeschaltete Zustand wird mitgeprüft (Betreiber-Entscheidung). Ohne diese Absicherung könnte die fertige Anleitung während der Ankündigungsphase unbemerkt kaputtgehen; auffallen würde es erst beim Freischalten, also im denkbar schlechtesten Moment.

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Route `/anleitung` bleibt bestehen und wird zur Ankündigungsseite, statt 404 zu liefern | Bereits geteilte Links, QR-Codes und Suchergebnisse laufen sonst ins Leere. Eine erklärende Seite ist in jedem Fall besser als eine Fehlermeldung — und die URL bleibt für die spätere Freischaltung erhalten | 2026-09-17 |
| Menu-Eintrag bleibt sichtbar, mit „Bald"-Kennzeichnung | Das **ist** die Ankündigung. Der Eintrag nimmt keinen Platz weg, der anderweitig gebraucht würde, und erreicht jeden Nutzer auf jedem Screen — anders als die Seite selbst, die man erst aufrufen muss | 2026-09-17 |
| Eintrag bleibt klickbar statt deaktiviert | Ein ausgegrauter, toter Eintrag frustriert; er kündigt an, ohne zu erklären. Der Klick führt auf die Seite, die die Ankündigung ausführt | 2026-09-17 |
| Die beiden werblichen CTAs (`/about` Hero, `/create` Leeransicht) entfallen ersatzlos | Ein Call-to-Action ist ein Versprechen auf eine Handlung. Führt er auf „gibt's noch nicht", beschädigt er den Conversion-Weg an genau der Stelle, an der er am teuersten ist. Refinement 4 von PROJ-13 hat die Hero-CTAs eigens auf `/create` gezogen, um diesen Weg zu verkürzen — ihn jetzt mit einer Sackgasse zu teilen, wäre ein Rückschritt | 2026-09-17 |
| Kein Datum und kein Zeitraum für die Verfügbarkeit | Solo-Entwickler ohne festen Termin (PRD, Constraints). Ein verpasstes Datum auf einer Live-Seite kostet mehr Glaubwürdigkeit, als die Angabe an Vorfreude einbringt. Die Seite sagt stattdessen klar, **was** kommt | 2026-09-17 |
| Ankündigungsseite zeigt einen kurzen Ausblick inkl. „Was dabei herauskommt", aber keinen Prompt und keine Schritte | Der Besucher soll verstehen, worauf er wartet — sonst nimmt er von der Seite nichts mit. Prompt und Schritte zu zeigen, würde die Funktion faktisch doch ausliefern und die Entscheidung gegen den Launch aushebeln | 2026-09-17 |
| Der Ausblick nutzt die bereits vorhandenen vier „Was dabei herauskommt"-Punkte, sprachlich in die Zukunft gesetzt | Der Text ist geschrieben, abgenommen und beschreibt exakt das Richtige. Neu zu formulieren, was schon passt, erzeugt nur eine zweite Fassung, die später auseinanderläuft | 2026-09-17 |
| Die Seite bietet einen Weg zum manuellen Erstellen an | Wer die Anleitung sucht, will eine Quest bauen. Ihn mit „geht noch nicht" allein zu lassen, verschenkt genau den Besucher, der am ehesten Ersteller wird — das manuelle Erstellen funktioniert ja vollständig | 2026-09-17 |
| Der einzige Textlink des Desktop-Headers („Anleitung") entfällt, ohne Ersatz | Konsequent zur Entscheidung, die werblichen Wege zu schließen. Ein anderes Ziel nachrücken zu lassen, würde die Navigation über die Ankündigung hinaus verändern — das ist nicht Zweck dieses Features | 2026-09-17 |
| Die FAQ-Antwort „Wie lange dauert das Erstellen?" wird auf das manuelle Erstellen umgeschrieben, statt entfernt | „Wie lange dauert das?" ist für Ersteller eine der relevantesten Fragen. Sie stehen zu lassen mit einer Antwort über eine nicht existierende Funktion wäre das Gegenteil dessen, was dieses Feature erreichen soll | 2026-09-17 |
| Keine „Benachrichtige mich"-Anmeldung | Erfordert Backend und Verarbeitung personenbezogener Daten — beides laut PRD ausgeschlossen (kein Backend, kein Account, kein Tracking) | 2026-09-17 |
| Der fertige Inhalt wird ausgeblendet, nicht gelöscht | Die Anleitung ist gebaut, QA-geprüft und deployt gewesen. Sie zu löschen und später neu zu schreiben, wäre Verschwendung und würde beim Wiederaufbau neue Fehler einführen | 2026-09-17 |
| Die FAQ-Antwort zum Erstellen trägt gar keine Zeitangabe mehr | Betreiber-Entscheidung. Jede Zahl wäre geraten: Die bisherige halbe Stunde galt mit KI-Hilfe, und wie lange manuelles Erstellen dauert, hängt stark vom Umfang ab. Eine falsche Zahl enttäuscht beim ersten Versuch — lieber keine als eine erfundene | 2026-09-17 |
| Die zugehörige FAQ-Frage wird mitumformuliert (weg von „wie lange") | Folge der Entscheidung darüber: Eine Frage nach der Dauer, die keine Dauer nennt, wirkt ausweichend. Die Frage zielt neu darauf, *was* zu tun ist | 2026-09-17 |
| Eigenes Feature (PROJ-14) statt Refinement von PROJ-13 | Die Änderung umfasst fünf Berührungspunkte über drei bestehende Features (PROJ-1 Navigation, PROJ-6 Creator-Leeransicht, PROJ-13 Info-Seiten), ist eigenständig testbar und deploybar — und wird später als Ganzes wieder zurückgenommen. Als Refinement in PROJ-13 wäre der Navigations- und Creator-Anteil dort fehl am Platz | 2026-09-17 |

### Technical Decisions
_To be added by /architecture_

| Decision | Rationale | Date |
|----------|-----------|------|
| Ein einziger Wahrheitswert steuert alle fünf Stellen | Die Spec verlangt es (Edge Case 11), und der Fehler ohne ihn wäre still: Eine vergessene Stelle beim Freischalten stürzt nicht ab und warnt nicht — etwa eine funktionierende Anleitung, deren Menu-Eintrag weiter „Bald" sagt | 2026-09-17 |
| Der Schalter steht in `src/lib/app-nav.ts` | Diese Datei ist bereits heute der gemeinsame Ursprung für Burger-Menu und Info-Kopfzeile — zwei der fünf betroffenen Stellen. Sie ist zudem ein reines Datenmodul ohne `"use client"`, wird also sowohl von der Client-Komponente `app-nav-menu.tsx` als auch von der Server-Komponente `info-page-shell.tsx` gelesen | 2026-09-17 |
| Fester Wert im Quelltext statt Umgebungsvariable | Eine Laufzeit-Einstellung würde die betroffenen Seiten von statisch auf dynamisch umstellen und ihre Ladezeit von 0,07–0,09 s verschlechtern. Für einen Schalter, der voraussichtlich genau einmal umgelegt wird, ein schlechter Tausch. Zusätzlicher Vorteil: Der Prompt landet gar nicht erst im ausgelieferten HTML | 2026-09-17 |
| Die entfernten CTAs bleiben als bedingter Code stehen, statt gelöscht zu werden | Vom Betreiber so entschieden: Freischalten soll eine Zeile kosten, nicht ein Wiedereinbauen aus der Git-History. Preis ist etwas mehr Code, der zum Launch nicht ausgeführt wird | 2026-09-17 |
| Kein neues Paket; `badge.tsx` aus shadcn/ui wird **nicht** verwendet | Die vorhandene Badge-Komponente ist eine gefüllte Pille mit Rahmen und damit kräftiger als gewünscht — neben der großen kursiven Menu-Schrift ein Fremdkörper. Die Kennzeichnung soll ankündigen, nicht um Aufmerksamkeit konkurrieren | 2026-09-17 |
| Kennzeichnung als echter Text, nicht als Farbe oder Icon | Sie muss für Screenreader wahrnehmbar sein (Edge Case 5). Ein rein visuelles Signal erfüllt das nicht | 2026-09-17 |
| Kennzeichnung in Grau statt in einer Signalfarbe | Das Design System erlaubt ein Lime-Element pro Screen; Teal ist im Menu bereits für den aktiven Eintrag belegt. Grau hält die Ankündigung zurückhaltend — sie soll informieren, nicht werben | 2026-09-17 |
| Kennzeichnung sitzt innerhalb der bestehenden 48px-Zeile, rechtsbündig | Verhindert, dass sie das 44px-Tap-Ziel verkleinert oder auf 320px umbricht (Edge Case 6). Die Position ist erprobt — der Ko-fi-Eintrag trägt dort sein Pfeil-Icon | 2026-09-17 |
| `prompt-copy-box.tsx` und `quest-ai-prompt.ts` bleiben unangetastet | Sie werden von der Ankündigungsseite nur nicht mehr aufgerufen. Sie zu ändern würde Risiko ohne Nutzen erzeugen — und beide tragen eigene Unit-Tests, die grün bleiben sollen | 2026-09-17 |
| Die Tests prüfen beide Zustände — auch den freigeschalteten | Betreiber-Entscheidung. Die fertige Anleitung bleibt im Code liegen, wird aber nicht ausgeliefert und damit von keinem normalen Test berührt. Ohne ausdrückliche Prüfung könnte sie still verrotten und erst beim Freischalten auffallen. Technisch möglich, weil beide Zustände im Code vorliegen | 2026-09-17 |
| Kein Backend, keine gespeicherten Daten | Das Feature ändert nur, was dargestellt wird. Es gibt keinen Zustand, der über einen Seitenaufruf hinaus bestehen müsste — im Einklang mit dem PRD (kein Backend, kein Account) | 2026-09-17 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

_Erstellt: 2026-09-17_

### Die Kernentscheidung: ein Schalter für fünf Stellen

Das gesamte Feature hängt an einer einzigen Frage: **Woher wissen fünf verschiedene Stellen der App, dass die Anleitung noch nicht verfügbar ist?**

Die Antwort ist ein einzelner Wahrheitswert (verfügbar: ja/nein), der an einem Ort steht und von allen fünf Stellen gelesen wird. Beim Freischalten wird dieser eine Wert umgestellt — und Seite, Menu-Kennzeichnung, Header-Link und beide Call-to-Actions kommen **gleichzeitig** zurück.

Warum das wichtig genug für eine eigene Entscheidung ist: Ohne diesen gemeinsamen Ursprung müsste der Betreiber beim Freischalten an fünf Stellen daran denken. Vergisst er eine, entsteht ein Zustand, den niemand bemerkt — etwa eine fertige, funktionierende Anleitung, auf deren Menu-Eintrag weiterhin „Bald" steht. Dieser Fehler ist still: Nichts stürzt ab, keine Warnung erscheint, und der Betreiber sieht es nur, wenn er zufällig das Menu öffnet.

Der Schalter kommt in die Datei, die die Navigation der App beschreibt (`src/lib/app-nav.ts`). Das ist bereits heute der gemeinsame Ursprung für Burger-Menu und Info-Kopfzeile — dieselbe Rolle, dieselbe Datei.

**Wichtige Eigenschaft:** Der Wert steht fest im Code, er ist keine Einstellung zur Laufzeit. Das heißt, beim Bauen der App ist bereits entschieden, was ausgeliefert wird — die Ankündigungsseite enthält den Prompt dann gar nicht erst, statt ihn nur zu verstecken. Das erfüllt die Anforderung aus der Spec, dass der Prompt nicht im ausgelieferten HTML stehen darf.

### Was an den fünf Stellen passiert

```
src/lib/app-nav.ts
  └── ANLEITUNG_VERFUEGBAR  (der eine Schalter)
        │
        ├──► 1. Die Seite /anleitung
        │       verfügbar:       volle Anleitung (Prompt, Schritte, Troubleshooting)
        │       nicht verfügbar: Ankündigung (Ausblick, kein Prompt)
        │
        ├──► 2. Burger-Menu, Gruppe Info
        │       verfügbar:       „Anleitung"
        │       nicht verfügbar: „Anleitung  [Bald]"
        │
        ├──► 3. Desktop-Header der Info-Seiten
        │       verfügbar:       Textlink „Anleitung"
        │       nicht verfügbar: kein Textlink
        │
        ├──► 4. /about, zweiter Hero-Button
        │       verfügbar:       „Mit KI erstellen"
        │       nicht verfügbar: Button fehlt
        │
        └──► 5. /create, Leeransicht
                verfügbar:       Link „Quest mit KI bauen"
                nicht verfügbar: Link fehlt
```

### Aufbau der Ankündigungsseite

Die Seite behält ihren Rahmen (Kopfzeile, Zurück-Pfeil, Fußzeile) — es wechselt nur, was in der Mitte steht:

```
/anleitung  (Zustand: nicht verfügbar)
+-- Seitenrahmen (unverändert, aus PROJ-13)
|   +-- Kopfzeile: Zurück-Pfeil, Ko-fi-Icon, „Zur App"
|   +-- Fußzeile
|
+-- Kennzeichnung „Bald verfügbar"
+-- Titel „Quest bauen mit KI."           (unverändert)
+-- Kurzer Ausblick (2-3 Sätze)           (neu formuliert)
+-- Kasten „Was dabei herauskommen wird"  (4 bestehende Punkte, Zukunft)
+-- Weg zum manuellen Erstellen -> /create
|
+-- NICHT enthalten: Prompt, Kopieren-Button, 4 Schritte, Troubleshooting
```

Die ausgeblendeten Teile bleiben als Textbausteine in der Datei stehen und werden nur nicht dargestellt. Die Prompt-Vorlage selbst (`src/lib/quest-ai-prompt.ts`) und der Kopier-Baustein (`prompt-copy-box.tsx`) werden **nicht angefasst** — sie werden lediglich von dieser Seite aus nicht mehr aufgerufen.

### Datenmodell

**Es wird nichts gespeichert.** Dieses Feature legt keine Daten an, liest keine und verändert keine. Es gibt keinen neuen Eintrag im Browser-Speicher, keine Datei, keine Nutzereinstellung.

Der einzige Zustand ist die eine Konstante im Quelltext:

```
Verfügbarkeit der KI-Anleitung
- ein Wahrheitswert: verfügbar oder nicht verfügbar
- steht fest im Quelltext (src/lib/app-nav.ts)
- zum Launch: nicht verfügbar
- Änderung erfordert ein neues Deployment
```

Bewusst **keine** Laufzeit-Einstellung (etwa über eine Umgebungsvariable in Vercel): Das würde erlauben, die Anleitung ohne Deployment umzuschalten — klingt praktisch, macht aber die Seite dynamisch statt statisch und nimmt ihr damit die heutige Ladezeit von 0,07–0,09 s. Für einen Schalter, der voraussichtlich genau einmal umgelegt wird, ist das ein schlechter Tausch.

### Kein Backend

Unverändert zum Rest des Projekts: kein Server, keine Datenbank, keine API-Route. Die Änderung betrifft ausschließlich, was beim Bauen der Seiten dargestellt wird. `/anleitung`, `/about` und die übrigen Info-Seiten bleiben statische Seiten.

### Die Kennzeichnung „Bald"

Drei Anforderungen aus der Spec bestimmen die Gestaltung:

1. **Für Screenreader wahrnehmbar** (Edge Case 5) — die Kennzeichnung ist echter Text, kein Farbpunkt und kein Icon. Wer die App vorlesen lässt, hört „Anleitung, Bald".
2. **Kein zweites Lime-Element** — das Design System erlaubt ein Lime-Element pro Screen. Das Burger-Menu nutzt Teal für den aktiven Eintrag; die Kennzeichnung wird deshalb zurückhaltend in Grau gehalten, nicht in einer Signalfarbe. Sie soll ankündigen, nicht um Aufmerksamkeit konkurrieren.
3. **Darf das Tap-Ziel nicht verkleinern** (Edge Case 6) — sie sitzt innerhalb der bestehenden 48px-Zeile des Menu-Eintrags, rechtsbündig an der Stelle, an der der Ko-fi-Eintrag sein Pfeil-Icon trägt. Diese Position ist also bereits erprobt.

Für den Eintrag gilt weiterhin die bestehende Markierung der aktiven Seite: Steht der Nutzer auf `/anleitung`, ist der Eintrag zugleich als aktuelle Seite markiert **und** trägt die Kennzeichnung (Edge Case 4).

### Der Sonderfall Desktop-Header

Die Kopfzeile aller Info-Seiten führt heute genau einen Textlink, und das ist „Anleitung". Fällt er weg, ist die Liste leer.

Das ist unkritisch, aber es lohnt der ausdrückliche Hinweis an die Umsetzung: Die Kopfzeile darf durch die leere Liste keine Lücke und keine verrutschte Ausrichtung bekommen (Edge Case 9). Die verbleibenden Elemente — Ko-fi-Icon und „Zur App" — sind rechtsbündig gesetzt und sollten unverändert stehen.

Ein zweiter Punkt: Die Datei `info-page-shell.tsx` ist eine **Server-Komponente** und muss es bleiben (Technical Requirement aus der Spec). Der Schalter ist ein einfacher Wert ohne Interaktivität und ändert daran nichts — anders als etwa der Ko-fi-Tooltip, der dafür seinerzeit in eine eigene Datei ausgelagert werden musste.

### Betroffene Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/lib/app-nav.ts` | Der Schalter kommt hinzu; Menu-Eintrag und Header-Liste lesen ihn |
| `src/components/app-nav-menu.tsx` | Zeigt die Kennzeichnung, wenn der Schalter es verlangt |
| `src/components/info-page-shell.tsx` | Kopfzeile ohne Textlink prüfen (Ausrichtung) |
| `src/app/(info)/anleitung/page.tsx` | Zwei Zustände: Ankündigung oder volle Anleitung |
| `src/app/(info)/about/page.tsx` | Zweiter Hero-Button bedingt; FAQ-Antwort umgeschrieben |
| `src/app/create/page.tsx` | KI-Link in der Leeransicht bedingt |

**Nicht angefasst:** `src/lib/quest-ai-prompt.ts`, `src/components/prompt-copy-box.tsx`, `/impressum`, `/datenschutz` sowie sämtliche Quest-, Import- und Editor-Logik.

### Auswirkung auf die Tests

Die bestehenden Suiten prüfen `/anleitung` an 41 Stellen über sechs Dateien — die meisten davon (21) in `proj-13-landing-page.spec.ts`. Diese Tests beschreiben den heutigen, funktionierenden Zustand und werden durch die Änderung **absichtlich** falsch.

Empfehlung für die Umsetzung: Diese Tests nicht einfach löschen, sondern auf den neuen Zustand ziehen. Sie sind die Absicherung dafür, dass beim späteren Freischalten wieder der richtige Zustand entsteht.

**Entschieden (2026-09-17):** Die Tests prüfen **beide** Zustände. Weil beide im Code vorliegen, lässt sich der freigeschaltete Zustand mitprüfen, ohne ihn auszuliefern — sonst könnte die fertige Anleitung während der Ankündigungsphase unbemerkt kaputtgehen und würde erst beim Freischalten auffallen.

Die Umsetzung braucht dafür einen Weg, die Seite im Test mit umgelegtem Schalter zu rendern. Das ist der einzige Punkt, an dem der Schalter mehr als ein fester Wert sein muss — und der Grund, ihn beim Bauen bewusst testbar anzulegen.

### Neue Pakete

**Keine.** Alles Nötige ist vorhanden: `lucide-react` liefert die Icons, das Design System die Gestaltung, und die Kennzeichnung ist schlichter Text.

Bewusst **nicht** verwendet wird die vorhandene `badge.tsx`-Komponente aus shadcn/ui: Ihr Erscheinungsbild (gefüllte Pille mit Rahmen) ist kräftiger als gewünscht und würde im Menu neben der großen kursiven Schrift der Einträge als Fremdkörper wirken. Die Kennzeichnung soll zurückhaltend sein — eine dezente Textmarkierung genügt, wie sie der Ko-fi-Eintrag mit seinem Pfeil-Icon an derselben Stelle bereits vorzeichnet.

### Risiken

| Risiko | Einschätzung |
|--------|--------------|
| Der geteilte Seitenrahmen `InfoPageShell` wird verändert und beschädigt Nachbarseiten | Bekanntes Muster im Projekt — bei jeder bisherigen Änderung daran wurden `/impressum` und `/datenschutz` mitgeprüft. Als Acceptance Criterion bereits festgehalten |
| Der Hero auf `/about` verliert seinen zweiten Button und wirkt unausgewogen | Gestalterisch zu prüfen. Nebeneffekt ist positiv: Der Hero wird kürzer, was BUG-7 (CTA über dem Falz) weiter entschärft |
| Beim Freischalten bleibt eine Stelle zurück | Durch den einen Schalter konstruktiv ausgeschlossen — das ist sein Zweck |
| Suchmaschinen zeigen noch die alte Beschreibung | Zeitlich begrenzt; Metadaten werden mitgezogen (Edge Case 2) |


## Implementation Notes (Frontend)

_Umgesetzt: 2026-09-17_

### Was gebaut wurde

Sechs Dateien, kein neues Paket, keine neue Komponente, keine neue Route.

| Datei | Änderung |
|-------|----------|
| `src/lib/app-nav.ts` | `ANLEITUNG_VERFUEGBAR` (der Schalter), Feld `badge` an `AppNavLink`, Menu-Eintrag mit „Bald", `HEADER_NAV_LINKS` leer solange angekündigt |
| `src/components/app-nav-menu.tsx` | Rendert die Kennzeichnung im bestehenden `content`-Block |
| `src/app/(info)/anleitung/page.tsx` | Aufgeteilt in `AnleitungAngekuendigt()` und `AnleitungVollstaendig()`; Metadaten folgen dem Schalter |
| `src/app/(info)/about/page.tsx` | Sekundärer Hero-CTA bedingt; FAQ-Frage und -Antwort umgeschrieben |
| `src/app/create/page.tsx` | KI-Link der Leeransicht bedingt |
| `scripts/test-anleitung-freigeschaltet.mjs` | **neu** — legt den Schalter um, baut, testet, stellt zurück |

`src/components/info-page-shell.tsx` musste **nicht** angefasst werden: Es rendert `HEADER_NAV_LINKS` in einer Schleife, und eine leere Liste ergibt von selbst keine Ausgabe. Die Kopfzeile bleibt damit auch eine Server-Komponente. `quest-ai-prompt.ts` und `prompt-copy-box.tsx` sind unverändert.

### Gemessen statt geschätzt

**Der Prompt ist nicht ausgeliefert, nicht bloß versteckt.** Im gebauten HTML von `/anleitung`: 0 Treffer für „BITTE-ERSETZEN", „Prompt kopieren", „Der Prompt", „So geht es", „Zwei Pflichtschritte", „Die Datei wird nicht angenommen". Auch **0 Treffer im gesamten Client-Bundle** (`.next/static/`). Der Wert ist zur Bauzeit bekannt, der Zweig wird nie gerendert.

**Die Kennzeichnung im Menu** (Chrome, 360×640): Text „AnleitungBald", Farbe `rgb(160, 168, 171)`, 11px, rechtsbündig bei x=313, Breite 23px. Tap-Ziel unverändert **231×48px** — die Kennzeichnung verkleinert es nicht. Vier Gruppen, sieben Ziele, Ko-fi unberührt.

**`/anleitung` bleibt statisch** (`○` im Build) — Ladezeit im Production-Server 0,0017 s. Alle sieben Routen HTTP 200.

**Der Header-Textlink ist auf allen vier Info-Seiten weg** (0 Treffer für `href="/anleitung"` in about, anleitung, impressum, datenschutz). Nachbarseiten unbeschädigt.

**Das JSON-LD zog automatisch mit:** Die FAQ-Konstante speist sichtbare Seite und strukturierte Daten — „Wie erstelle ich eine Quest?" erscheint zweimal im HTML, „halbe Stunde" keinmal.

### Der freigeschaltete Zustand ist geprüft

Auf Entscheidung des Betreibers prüfen die Tests **beide** Zustände. `npm run test:e2e:freigeschaltet` legt den Schalter um, baut, testet und stellt ihn zurück — auch bei Fehlschlag oder Abbruch (`finally` + Signal-Handler).

**Ergebnis: 22/22 auf Chrome und Mobile Safari.** Damit ist die zentrale Behauptung des Features belegt: Eine Zeile bringt Seite, Prompt, Schritte, Troubleshooting, beide CTAs und den Header-Link gleichzeitig zurück.

### Gegenprobe

Zwei absichtlich eingebaute Fehler, beide gefangen:

1. **Badge entfernt** → genau die 2 zuständigen Tests fallen
2. **`HEADER_NAV_LINKS` ignoriert den Schalter** (der „stille Fehler", den das Feature verhindern soll) → 4 Tests fallen, darunter der Kopfzeilen-Test

### Bestehende Tests: gezogen, nicht gelöscht

Die Suiten prüften `/anleitung` an 41 Stellen. Behandlung:

- **11 Tests zur Anleitungs-Inhalten** (Prompt-Vorlage, Erwartungsmanagement, Troubleshooting) sind per `test.skip` an den Schalter gehängt statt gelöscht — sie sind genau das, was beim Freischalten wieder greifen muss.
- **Der Rest ist auf den neuen Zustand gezogen:** CTA-Tests prüfen jetzt Abwesenheit, der Titel-Test die neuen Metadaten, der Eyebrow-Test „Bald verfügbar", die FAQ-Tests die neue Frage.
- **Zwei Stellen fielen erst im Lauf auf:** `getByRole("link", { name: "Anleitung", exact: true })` trifft nicht mehr, weil der Eintrag jetzt „AnleitungBald" heißt — in zwei Dateien auf `href` umgestellt.

### Drei Fehler in meinen eigenen Tests (Produkt war jeweils richtig)

1. **Mehrdeutiger Locator** — „Rätsel und Aufgaben" steht im Ausblick *und* im Abschluss-CTA; auf die Liste eingegrenzt.
2. **Jahres-Regex** `\b20\d\d\b` schlug auf dem Copyright-Jahr der Fußzeile an — auf `main` eingegrenzt.
3. **`nav a` zählte 11 statt 7** — die Fußzeilen-Navigation zählte mit; auf den Menu-Dialog eingegrenzt.

Dazu zwei **Messfehler in der Browser-Sonde**, die wie Produktfehler aussahen: `page.url()` vor dem Ende der Client-Navigation gelesen (die H1 war bereits die richtige), und „So geht es" auf `/about` gefunden — das ist dort eine eigene Sektionsüberschrift, nicht ein Rest der Anleitung.

### Testergebnis

| Suite | Ergebnis |
|-------|----------|
| Chrome 152 (Production-Build) | **405 passed / 22 skipped / 0 failed** |
| Mobile Safari (WebKit) | **404 passed / 23 skipped / 0 failed** |
| Freigeschalteter Zustand (beide Engines) | **22 passed / 0 failed** |
| Unit (Vitest) | **186 passed** |
| Build / Lint | sauber (6 vorbestehende Warnungen, 0 Fehler) |

Neu: `tests/proj-14-anleitung-coming-soon.spec.ts` (27 Tests) und `tests/proj-14-anleitung-freigeschaltet.spec.ts` (11 Tests, nur im Schalter-Lauf).

### Abweichungen von der Spec

Keine inhaltlichen. Zwei Präzisierungen:

- **`info-page-shell.tsx` blieb unverändert** — die Spec führte sie als „Kopfzeile ohne Textlink prüfen (Ausrichtung)". Geprüft wurde sie (375/768/1440px ohne Überlauf), zu ändern war nichts.
- **Die Meta-Zeile „4 Schritte · ca. 15 Min" entfällt auf der Ankündigung** (offene Frage aus der Spec). Sie beschreibt einen Ablauf, der dort nicht gezeigt wird.

### Offen

- **Edge Case 3** (Nutzer mit gecachter alter Fassung) ist konstruktiv abgedeckt, aber nicht messbar — beim nächsten Laden erscheint die Ankündigung.
- Die reguläre `playwright.config.ts` zeigt weiterhin auf das kaputte Chromium-Binary. Dieser Lauf nutzte `playwright.prod.config.ts` (Chrome + Production-Build).

## QA Test Results

_Getestet: 2026-09-18 — gegen den **Production-Build** (`next start`), nicht gegen den Dev-Server._

### Ergebnis

**25 von 25 Acceptance Criteria erfüllt. Keine Critical-, High-, Medium- oder Low-Bugs im Feature. Production-Ready.**

| Bereich | AC | Ergebnis |
|---------|----|----------|
| Die Ankündigungsseite | 9 | 9 bestanden |
| Die Einstiegspunkte | 6 | 6 bestanden |
| Ehrlichkeit der übrigen Copy | 5 | 5 bestanden |
| Bewahrung des fertigen Inhalts | 2 | 2 bestanden |
| Keine Regression | 3 | 3 bestanden |

### Unabhängig nachgemessen, nicht aus der Frontend-Phase übernommen

**Der Prompt ist nicht ausgeliefert, nicht bloß versteckt.** Live vom Server geprüft (nicht aus `.next/`): 0 Treffer für „BITTE-ERSETZEN", „Du hilfst mir", „Aufbau der JSON-Datei", „HIER EINTRAGEN", „Prompt", „Kopieren", „So geht es", „Zwei Pflichtschritte", „Wikimedia", „Die Datei wird nicht angenommen". Darüber hinaus **alle 15 JS-Dateien einzeln abgerufen**, die die Seite lädt — kein Treffer; ebenso wenig irgendwo in `.next/static/`. Das strengste Kriterium der Spec ist damit erfüllt.

**Der Schalter wurde selbst umgelegt.** Ich habe mich nicht auf den Testlauf der Frontend-Phase verlassen: Schalter auf `true`, gebaut, gemessen — die volle Anleitung kommt zurück (BITTE-ERSETZEN 8×, „Du hilfst mir" 2×, Troubleshooting, Pflichtschritte), die Ankündigung verschwindet (0×), und **alle drei Einstiegspunkte sind wieder da** (`/about`-CTA, Header-Link, `/create`-Link). Danach zurückgesetzt und per `diff` als **byte-identisch** bestätigt. Die zentrale Behauptung des Features ist damit unabhängig belegt.

**Kontrast gemessen statt geschätzt:**

| Element | Dark | Light | Vorgabe |
|---------|------|-------|---------|
| Eyebrow „Bald verfügbar" | 11.60:1 | — | 4.5:1 |
| Menu-Kennzeichnung „Bald" | 8.02:1 | **5.30:1** | 4.5:1 |
| Menu-Label | 19.40:1 | 18.21:1 | 4.5:1 |

Der Light-Wert ist der interessante: Die Kennzeichnung nutzt `text-muted-foreground` und ergibt dort `rgb(94,105,110)` auf `rgb(246,248,249)` = 5.30:1. Gegengerechnet: Der naheliegende feste Hex-Wert `text-gq-grey` (#A0A7AD) hätte **2.29:1** ergeben und WCAG AA verfehlt — genau die Falle, die als BUG-1 im QA vom 2026-09-06 dokumentiert ist. Die Token-Wahl hat einen latenten Wiederholungsfehler vermieden.

**BUG-7 bleibt behoben.** Der Hero verliert einen Button, deshalb auf allen **elf** Referenz-Viewports nachgemessen (320×568 bis 1920×1080): Der primäre CTA steht überall vollständig über dem Falz. Knappster Fall unverändert 320×568 mit +27px — dieselbe Zahl wie vor diesem Feature, also nicht verschlechtert.

**Kopfzeile ohne Textlink** (Edge Case 9): auf 320/375/768/1440/1920px je 3 Elemente, `header-overflow = 0`, `doc-overflow = 0`, kein Element unter 44px. Keine Lücke, keine verrutschte Ausrichtung.

### Edge Cases

| # | Fall | Ergebnis |
|---|------|----------|
| 3 | Gecachte alte Fassung | Nach Reload erscheint die Ankündigung |
| 4 | Menu auf `/anleitung` geöffnet | `aria-current="page"` **und** Kennzeichnung zugleich — wie spezifiziert |
| 5 | Screenreader | ARIA-Snapshot: `link "Anleitung Bald"` — die Kennzeichnung wird vorgelesen |
| 6 | 320px | Tap-Ziel 231×48px, kein Umbruch, `doc-overflow = 0` |
| 7 | `/create` verliert einen Weg | Zwei Aktionen mit 12px Abstand, keine Lücke, Leertext korrekt |
| 9 | Header-Liste leer | siehe oben — kein Layout-Schaden |
| 10 | Route mit Parametern | `?utm_source=qr&x=1` rendert die Ankündigung normal |

Zusätzlich geprüft (nicht in der Spec): **Tastaturbedienung.** Tab-Reihenfolge folgt der visuellen Ordnung (Zurück → Ko-fi → Zur App → Menü → CTA → Footer), der CTA ist per Enter auslösbar und führt nach `/create`.

### Security-Audit — ohne Befund

- **Security-Header aktiv:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`
- **Keine Angriffsfläche:** Die Seite hat kein `<form>`, kein `<input>`, kein `<textarea>` — sie ist statisch
- **Keine Secrets** in den 15 geladenen Bundles (gesucht nach `sk-*`, `service_role`, `SUPABASE_SERVICE`, `api_key`-Mustern)
- **Injection:** `/anleitung/<img src=x onerror=alert(1)>` → HTTP 404, 0 Reflexionen; `?x=<script>alert(1)</script>` → HTTP 200, 0 Reflexionen
- **Externe Hosts:** nur `ko-fi.com` (und die W3C-SVG-Namespace-URL). Der Ko-fi-Link trägt `target="_blank" rel="noopener noreferrer"`
- **Kein Informationsleck durch das Feature:** Der zurückgehaltene Prompt ist über keinen ausgelieferten Pfad erreichbar (oben belegt)

### Gegenprobe — fängt die Suite echte Fehler?

Zwei absichtlich eingebaute Fehler, beide gefangen:

1. **FAQ bekommt wieder eine Zeitangabe** („In etwa einer halbe Stunde") → **2 Tests fallen**
2. **Die Seite ignoriert den Schalter** (`if (false)`) — der teuerste denkbare Fehler, die volle Anleitung ginge live, während die App sie ankündigt → **6 Tests fallen**

Beide Male anschließend sauber wiederhergestellt.

### Skips geprüft

Die 22 bzw. 23 Skips sind **keine stillgelegten Tests**, sondern: 2 vorbestehende Plattformgrenzen (kein Hover auf Touch, Clipboard in WebKit nicht setzbar), 4 bewusste PROJ-14-Gates und die Datei für den freigeschalteten Zustand. Alle nachvollzogen.

### Regression

- **Alle sieben Routen HTTP 200** mit 0,0007–0,0017 s
- **Nachbarseiten intakt:** `/impressum` und `/datenschutz` behalten ihren Eyebrow „Rechtliches" — der kritische Punkt, weil `HEADER_NAV_LINKS` aus dem geteilten Seitenrahmen kommt
- **`/anleitung` bleibt statisch** (`○` im Build) — die Ladezeit-Anforderung ist gehalten
- **Creator-Flow unbeschädigt:** „Neue Quest erstellen" öffnet den Dialog
- **JSON-LD deckungsgleich** mit der sichtbaren Seite: fünf FAQ-Fragen, „Wie erstelle ich eine Quest?" enthalten, keine Zeitangabe in der Antwort
- **WebKit strukturgleich zu Chrome:** Titel, Eyebrow, CTA, Menu-Eintrag „AnleitungBald", Tap-Ziel 231×48, 7 Dialog-Links, `/about` ohne KI-CTA

### Testsuiten

| Suite | Ergebnis |
|-------|----------|
| Chrome 152 (Production-Build) | **405 passed / 22 skipped / 0 failed** |
| Mobile Safari (WebKit) | **404 passed / 23 skipped / 0 failed** |
| Freigeschalteter Zustand (beide Engines) | **22 passed / 0 failed** |
| Unit (Vitest) | **186 passed** |

### Befunde ohne Bug-Status

**Beobachtung 1 — „Quest importieren" misst 42px statt 44px.** Aufgefallen bei der Vermessung der `/create`-Leeransicht (Edge Case 7). **Vorbestehend aus PROJ-6** (`quest-import-button.tsx`, Commit `0c1c3c9`, in dieser Session unverändert) und damit **kein PROJ-14-Bug**. Verursacht durch `py-3` statt einer festen Höhe. Betrifft die PRD-Vorgabe von 44px Tap-Zielen — ein eigenes Refinement wert, zusammen mit BUG-2 (16px-Schließen-X).

**Beobachtung 2 — 320×568 hat weiterhin nur 27px Luft unter dem CTA.** Unverändert gegenüber dem Stand vor diesem Feature (bereits in Refinement 5 von PROJ-13 vermerkt). Kein Fehler, aber die Stelle, die zuerst kippt, falls der Hero künftig wächst.

**Beobachtung 3 — lokale Konsolenfehler durch Vercel Analytics.** `/_vercel/insights/script.js` liefert lokal 404 und erzeugt zwei Konsolenmeldungen. Tritt auf **allen** Routen auf, auch auf unveränderten wie `/impressum` — Umgebungsartefakt, in Production nicht vorhanden.

### Testumgebung

Gelaufen über `playwright.prod.config.ts` (Chrome 152 via `channel: 'chrome'`, Production-Build auf Port 3100). Die reguläre `playwright.config.ts` zeigt weiterhin auf das 428-KB-Chromium-Fragment; WebKit ist vorhanden und wurde genutzt. Firefox fehlt unverändert.


## Deployment

**Deployt: 2026-09-18** — Tag `v1.29.0-PROJ-14`, Commit `18007e0`
**Production-URL:** https://geoquesty.vercel.app/anleitung

Vercel deployte automatisch von `main`, live nach ~42 Sekunden.

### In Production verifiziert

**Der Prompt ist nicht ausgeliefert.** 0 Treffer im HTML für „BITTE-ERSETZEN", „Du hilfst mir", „Aufbau der JSON-Datei", „HIER EINTRAGEN", „Prompt", „Kopieren", „So geht es", „Zwei Pflichtschritte", „Die Datei wird nicht angenommen" — und **alle 15 ausgelieferten JS-Bundles einzeln abgerufen**, kein Treffer. Die Ankündigung steht (Eyebrow, Ausblick-Kasten, CTA, ChatGPT/Claude).

**Alle sieben Routen HTTP 200** mit 0,07–0,20 s.

**Die Einstiegspunkte:** `/about` ohne „Mit KI erstellen" (0), `/create` ohne „Quest mit KI bauen" (0), **kein Header-Textlink auf allen vier Info-Seiten** (je 0).

**Das Menu im Live-Browser:** 7 Links, Eintrag „AnleitungBald", ARIA-Name `link "Anleitung Bald"`, `aria-current="page"` auf der eigenen Seite, Tap-Ziel 231×48, **Badge-Kontrast 8.02:1**. Ein echter Klick führt auf die Ankündigung.

**Die FAQ:** „Wie lange dauert" (0), „halbe Stunde" (0), „Wie erstelle ich eine Quest?" sichtbar. Das `FAQPage`-JSON-LD trägt alle fünf Fragen mit der neuen Antwort und **ohne Zeitangabe** — deckungsgleich mit der sichtbaren Seite.

**BUG-7 bleibt behoben:** acht Viewports von 320×568 bis 1920×1080 nachgemessen, der primäre CTA steht überall vollständig über dem Falz. Die Werte decken sich **exakt** mit den lokalen Messungen (320×568: +27px, 1366×768: +208px, 1440×900: +340px).

**Nachbarseiten unbeschädigt** — wichtig, weil `HEADER_NAV_LINKS` aus dem geteilten Seitenrahmen kommt: `/impressum` und `/datenschutz` behalten Eyebrow „Rechtliches" und ihre H1.

**WebKit strukturgleich:** Eyebrow „Bald verfügbar", keine Prompt-Reste im Text.

**Security-Header aktiv:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS gibt es nur in Production). Der Ko-fi-Link trägt `rel="noopener noreferrer"`.

**0 fehlgeschlagene Requests, 0 Konsolenfehler** bei frischem Erstbesuch ohne Cache — die lokalen Vercel-Analytics-404 sind in Production wie erwartet verschwunden.

### Eine Fehlspur, damit sie niemand erneut verfolgt

Ein erster Messdurchlauf meldete **einen** Konsolenfehler (404) auf `/anleitung`, den die unveränderte `/impressum` nicht hatte — das sah nach einem Deploy-Schaden aus. Nachgestellt mit frischem Kontext ohne Cache: **0 Antworten ≥400 auf beiden Seiten.** Der Fehler stammte aus dem vorherigen Navigationsschritt desselben Skripts (dem Menu-Klick), nicht aus dem Laden der Seite. Kein Produktfehler.

Ebenso irreführend: `grep -c` meldete „Wie erstelle ich eine Quest?" in Production nur **1×** statt lokal 2×. Ursache ist das Zählen von *Zeilen* — das Production-HTML ist minifiziert. Tatsächlich sechs Vorkommen (sichtbare Seite + JSON-LD).

### Mit ausgeliefert

Auf Entscheidung des Betreibers sind zwei Werkzeugdateien mit eingecheckt:

- **`playwright.prod.config.ts`** — läuft auf dem vorhandenen Chrome 152 (`channel: 'chrome'`) gegen den Production-Build und umgeht damit das projektlange 428-KB-Chromium-Fragment
- **`scripts/test-anleitung-freigeschaltet.mjs`** (`npm run test:e2e:freigeschaltet`) — der einzige Weg, die zurückgehaltene Anleitung am Leben zu halten. Legt den Schalter um, baut, testet, stellt zurück — auch bei Fehlschlag oder Abbruch (`finally` + SIGINT/SIGTERM). Bricht ab, wenn der Schalter nicht auf `false` steht, statt etwas zu überschreiben.

### Zum Freischalten

`ANLEITUNG_VERFUEGBAR = true` in `src/lib/app-nav.ts`, committen, pushen. Seite, Menu-Kennzeichnung, Header-Link und beide CTAs kommen gleichzeitig zurück. Vorher `npm run test:e2e:freigeschaltet` laufen lassen — 22 Tests prüfen genau diesen Zustand.

