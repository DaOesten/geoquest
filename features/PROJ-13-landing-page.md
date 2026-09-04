# PROJ-13: Landing Page mit App-Link & KI-Anleitung

## Status: Planned
**Created:** 2026-09-04
**Last Updated:** 2026-09-04

## Dependencies
- Requires: PROJ-1 (App Shell) — für den Einstieg aus der App heraus und das bestehende Design-System
- Bezieht sich inhaltlich auf: PROJ-2 (Quest Data Model & JSON Import) — die Prompt-Vorlage bildet dieses Schema ab, der beschriebene Import-Weg nutzt den bestehenden Datei-Import
- Bezieht sich inhaltlich auf: PROJ-7 (Stationen-Editor) — Koordinaten und Medien-URLs werden dort nachgetragen

_Keine Code-Abhängigkeit in Gegenrichtung: PROJ-13 verändert weder Import noch Editor._

## Kontext

Die Root-Route `/` ist bereits der App Shell / Mode-Switch-Screen (PROJ-1). Diese Landing Page ist eine **zusätzliche, eigenständige Seite** unter einer eigenen Route (Vorschlag: `/about`), die extern teilbar ist (Link, QR-Code, Social Media) und die App erklärt.

Kern der Seite ist eine **Copy-Paste-Prompt-Vorlage**: Nutzer kopieren einen fertigen Prompt, fügen ihn in ein KI-Tool ihrer Wahl (ChatGPT, Claude o.ä.) ein und erhalten eine vollständige Quest als JSON, die sie über den bestehenden Import in Geo Quest laden.

**Wichtig:** Geo Quest selbst enthält keine KI-Integration. Die Seite ist reiner Inhalt — kein Backend, kein API-Key, keine Änderung an bestehenden Features.

## User Stories
- Als **Ersteller (Elternteil/Lehrkraft/Jugendleiter)**, der zum ersten Mal von Geo Quest hört, möchte ich auf einen Blick verstehen, was die App kann und für wen sie gedacht ist, damit ich einschätzen kann, ob sie für meinen Zweck (Kindergeburtstag, Schulausflug, Ferienprogramm) taugt.
- Als **Ersteller ohne Zeit**, möchte ich eine fertige Prompt-Vorlage kopieren und in ein KI-Tool einfügen, damit ich in wenigen Minuten eine komplette Quest-Struktur bekomme, statt jede Station und jedes Rätsel von Hand zu schreiben.
- Als **Ersteller mit KI-Ergebnis**, möchte ich Schritt für Schritt erklärt bekommen, wie ich das JSON aus dem Chat in eine Datei bekomme und in Geo Quest importiere, damit ich nicht an der Technik scheitere.
- Als **Ersteller nach dem Import**, möchte ich wissen, was ich noch selbst anpassen muss (GPS-Koordinaten, Medien-URLs), damit meine Quest draußen tatsächlich funktioniert und ich nicht von einer kaputten Quest überrascht werde.
- Als **Ersteller, bei dem der Import fehlschlägt**, möchte ich eine verständliche Hilfestellung finden, damit ich das Problem selbst lösen kann, statt aufzugeben.
- Als **Ersteller, der die App weiterempfiehlt**, möchte ich einen Link teilen können, der in WhatsApp/Social Media mit Titel und Vorschaubild ordentlich aussieht.

## Out of Scope
- **KI-Integration in Geo Quest selbst** (z.B. „Rätsel generieren"-Button im Creator) — bewusst ausgeschlossen; widerspricht dem „kein Backend"-Constraint und wäre ein eigenes, deutlich größeres Feature
- **Änderungen am JSON-Import** — insbesondere ein „JSON-Text einfügen"-Feld statt Datei-Upload. Wurde diskutiert und verworfen; falls später gewünscht, eigenes Feature (PROJ-14+). Die Anleitung beschreibt stattdessen den Datei-Weg.
- **Automatische Koordinaten-Ermittlung** — die KI setzt Platzhalter, der Nutzer positioniert die Stationen im Stationen-Editor (PROJ-7)
- **Medien-Hosting / Upload-Funktion** — Nutzer verwenden eigene externe HTTPS-URLs; Geo Quest speichert keine Mediendateien
- **Websuche-Anweisung im Prompt für echte Medien-URLs** — verworfen: liefert überwiegend Seiten-Links statt direkter Datei-URLs, dazu Urheberrechts- und Link-Rot-Risiko
- **Spieler-orientiertes Marketing** — die Seite adressiert primär Ersteller; Spieler kommen über direkte Quest-Links in die App
- **Mehrsprachigkeit** — Seite ist ausschließlich deutsch, wie die gesamte App
- **Quest-Bibliothek / Beispiel-Quests zum Download** — laut PRD Non-Goal (keine zentrale Quest-Bibliothek)
- **Änderung der Root-Route `/`** — der bestehende Mode-Switch bleibt unangetastet

## Seitenaufbau

Die Seite ist eine ausführliche Marketing-Seite mit anschließender Anleitung, in dieser Reihenfolge:

1. **Hero** — Logo, Headline, Ein-Satz-Erklärung, primärer App-Button („Zur App")
2. **Feature-Sektionen** — was Geo Quest kann: GPS-Navigation zu echten Orten, 5 Modultypen (Text, Bild, Audio, Video, Aufgaben), 3 Aufgabentypen (Code, Multiple-Choice, Sortieren), komplett kostenlos, kein Account nötig
3. **Für wen / Anlässe** — Kindergeburtstag, Schulausflug, Ferienprogramm; Zielgruppe 10–15 Jahre
4. **Abgrenzung** — kostenlos und offen, kein Abo, kein Account-Zwang, Gaming-Look statt Bildungs-Tool
5. **KI-Anleitung** (Kernstück) — Schritt-für-Schritt mit Prompt-Vorlage und Copy-Button
6. **Nach dem Import** — was noch angepasst werden muss (Koordinaten, Medien-URLs)
7. **Freie Medienquellen** — kurzer Hinweis auf legal nutzbare Quellen und direkte Datei-URLs
8. **Troubleshooting** — „Wenn der Import fehlschlägt"
9. **Abschluss-CTA** — App-Button

## Die Prompt-Vorlage

Die Vorlage bildet das **vollständige Quest-Schema** ab (alle 5 Modultypen, alle 3 Aufgabentypen) und enthält mindestens:

- Erklärung, was Geo Quest ist und was die KI produzieren soll
- Platzhalter, die der Nutzer ausfüllt: Thema/Story, Ort/Umgebung, Altersgruppe, Anzahl Stationen, ungefähre Dauer
- Vollständige Schema-Beschreibung inkl. Pflichtfeldern, erlaubten Werten und Limits (max. 20 Stationen, 1–20 Module pro Station, Multiple-Choice 2–5 Optionen, Sortieren 3–6 Elemente, `radiusMeters` 10–100)
- Anweisung, gültige UUIDs für Quest und jede Station zu erzeugen
- Anweisung, für `lat`/`lng` **erkennbare Platzhalter** zu setzen, da der Nutzer die Stationen danach auf der Karte positioniert
- Anweisung, Medien-Module inhaltlich vorzuschlagen (was für ein Bild/Audio/Video wäre hier sinnvoll) und dafür eine **klar erkennbare Platzhalter-URL** zu setzen, damit der Import nicht scheitert
- Anweisung, ausschließlich valides JSON ohne erklärenden Fließtext auszugeben

Der Prompt ist auf der Seite **immer als lesbarer, selektierbarer Text sichtbar**. Der Copy-Button ist Komfort, keine Voraussetzung.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Seite & Navigation
- [ ] Angenommen ein Nutzer öffnet die Landing-Page-URL direkt, wenn die Seite lädt, dann sieht er Hero, Feature-Sektionen, KI-Anleitung und Prompt-Vorlage, ohne dass die App-Daten (Quests im Browser-Speicher) benötigt werden
- [ ] Angenommen ein Nutzer ist auf der Landing Page, wenn er den App-Button klickt, dann gelangt er zum Start-Screen der App
- [ ] Angenommen ein Nutzer ist im Creator-Bereich der App, wenn er den Einstieg „Wie erstelle ich eine Quest?" (o.ä.) anklickt, dann gelangt er zur Landing Page
- [ ] Angenommen ein Nutzer öffnet die Root-Route `/`, wenn die Seite lädt, dann sieht er unverändert den bestehenden Mode-Switch-Screen aus PROJ-1
- [ ] Angenommen ein Nutzer öffnet die Seite auf einem Mobilgerät (360–430px), wenn er scrollt, dann sind alle Inhalte lesbar, ohne horizontales Scrollen, und alle Touch-Targets sind mindestens 44px groß

### Prompt-Vorlage
- [ ] Angenommen ein Nutzer ist bei der Anleitungs-Sektion, wenn er die Seite betrachtet, dann ist die vollständige Prompt-Vorlage als lesbarer Text sichtbar und manuell markierbar
- [ ] Angenommen ein Nutzer klickt den Kopieren-Button, wenn das Kopieren erfolgreich ist, dann erhält er eine sichtbare Bestätigung (z.B. „Kopiert!")
- [ ] Angenommen die Clipboard-API ist blockiert oder nicht verfügbar, wenn der Nutzer den Kopieren-Button klickt, dann erscheint ein Hinweis, den Text manuell zu markieren und zu kopieren, und der Prompt bleibt vollständig sichtbar
- [ ] Angenommen ein Nutzer hat den Prompt kopiert, wenn er ihn liest, dann erkennt er eindeutig, welche Stellen er selbst ausfüllen muss (Thema, Ort, Altersgruppe, Stationsanzahl)
- [ ] Angenommen ein Nutzer fügt den unveränderten Prompt in ein gängiges KI-Tool ein und füllt die Platzhalter aus, wenn die KI antwortet, dann ist die Ausgabe valides JSON, das dem Quest-Schema aus PROJ-2 entspricht

### Anleitung & Erwartungsmanagement
- [ ] Angenommen ein Nutzer liest die Anleitung, wenn er beim Import-Schritt ankommt, dann ist beschrieben, wie er den JSON-Text aus dem Chat als `.json`-Datei speichert und über „Quest importieren" einspielt
- [ ] Angenommen ein Nutzer hat eine Quest importiert, wenn er die Anleitung weiterliest, dann ist klar beschrieben, dass er die GPS-Koordinaten aller Stationen im Stationen-Editor auf der Karte setzen muss
- [ ] Angenommen die importierte Quest enthält Medien-Module, wenn der Nutzer die Anleitung liest, dann ist klar beschrieben, dass die Platzhalter-URLs durch echte HTTPS-URLs ersetzt werden müssen
- [ ] Angenommen ein Nutzer sucht Medien für seine Quest, wenn er die entsprechende Sektion liest, dann findet er einen Hinweis auf legal nutzbare Quellen und die Erklärung, dass eine direkte Datei-URL benötigt wird (nicht der Link zur Webseite)

### Fehlerfälle & Troubleshooting
- [ ] Angenommen der Import einer KI-generierten Quest schlägt fehl, wenn der Nutzer den Troubleshooting-Abschnitt liest, dann findet er die häufigsten Ursachen (ungültige UUID, fehlende Pflichtfelder, ungültige URL) und je einen konkreten Lösungsweg
- [ ] Angenommen ein Nutzer hat eine Fehlermeldung beim Import erhalten, wenn er dem Troubleshooting folgt, dann ist beschrieben, dass er die Fehlermeldung der KI zurückgeben und um Korrektur bitten kann

### Teilen & Auffindbarkeit
- [ ] Angenommen ein Nutzer teilt die Landing-Page-URL in einem Messenger, wenn die Vorschau generiert wird, dann erscheinen ein spezifischer Titel, eine Beschreibung und ein Vorschaubild für diese Seite (nicht die globalen App-Metadaten)

## Edge Cases
- **Clipboard-API blockiert oder Seite nicht über HTTPS ausgeliefert** → Copy-Button schlägt fehl; Prompt bleibt sichtbar und markierbar, Hinweis auf manuelles Kopieren erscheint
- **KI liefert JSON mit erklärendem Fließtext davor/danach** → Anleitung weist darauf hin, nur den JSON-Block (zwischen `{` und `}`) zu übernehmen
- **KI liefert ungültige UUIDs** → Import scheitert mit Zod-Fehlermeldung; Troubleshooting erklärt, die Fehlermeldung an die KI zurückzugeben
- **KI erfindet echt aussehende Medien-URLs statt der vorgegebenen Platzhalter** → Anleitung weist an, alle Medien-URLs nach dem Import zu prüfen und zu ersetzen
- **KI überschreitet Schema-Limits** (>20 Stationen, >5 Multiple-Choice-Optionen, `radiusMeters` außerhalb 10–100) → Import scheitert; Troubleshooting deckt das ab
- **Nutzer importiert eine Quest, deren `id` bereits lokal existiert** → bestehender Überschreiben-Dialog aus PROJ-2 greift; Anleitung erwähnt diesen Fall
- **Nutzer spielt die Quest ohne Koordinaten anzupassen** → Quest führt an Platzhalter-Orte; Anleitung stellt diesen Schritt deshalb prominent als Pflichtschritt dar
- **Nutzer öffnet die Seite auf dem Desktop** → Layout bleibt lesbar (kein reines Mobile-Layout mit überdehnter Zeilenlänge); Creator-Nutzung am Desktop ist laut PRD ausdrücklich vorgesehen
- **JavaScript deaktiviert** → Seiteninhalt und Prompt bleiben lesbar; nur der Copy-Button funktioniert nicht
- **Prompt-Vorlage veraltet nach einer Schema-Änderung** → siehe Open Questions; die Vorlage muss bei Änderungen an `quest-schema.ts` mitgepflegt werden

## Technical Requirements (optional)
- **Performance:** Ladezeit < 2s (PRD-Constraint); die Seite ist statischer Inhalt ohne Datenabhängigkeit
- **Responsive:** Mobile-First 360–430px, Desktop nutzbar
- **Accessibility:** WCAG AA Kontrast (4.5:1), Touch-Targets ≥ 44px, Body-Text ≥ 16px (PRD-Constraints)
- **SEO/Sharing:** Eigener Seitentitel, Meta-Description und Open-Graph-Tags inkl. Vorschaubild
- **Kein Backend:** rein statische Seite, keine API-Calls, keine Datenspeicherung
- **Design System:** folgt `docs/design-system.md`
- **Browser Support:** letzte 2 Versionen Chrome, Safari, Firefox, Edge

## Open Questions
- [ ] Wie wird die Prompt-Vorlage synchron zu `src/lib/quest-schema.ts` gehalten, wenn sich das Schema ändert? (Manuelle Pflege mit Hinweis im Code vs. Generierung aus dem Schema — Entscheidung in `/architecture`)
- [ ] Welcher konkrete Routen-Pfad? Vorschlag `/about`; Alternativen `/start`, `/anleitung`, `/quest-erstellen`
- [ ] Wo genau sitzt der Einstieg aus der App heraus (Creator-Bereich, App-Header, oder Empty-State der Quest-Liste)?
- [ ] Welches Vorschaubild wird für Open Graph verwendet — bestehendes `logo-lockup.png` oder ein eigenes Sharing-Asset?
- [ ] Soll die Prompt-Vorlage in mehreren Varianten angeboten werden (z.B. kürzere Version für schwächere Modelle)? Aktuell: nein, eine vollständige Vorlage.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Landing Page bekommt eigene Route statt `/` zu ersetzen | `/` ist bereits der App Shell (PROJ-1); ein Umzug würde bestehende Links und Bookmarks brechen — unnötiges Risiko für ein P1-Feature | 2026-09-04 |
| Primäre Zielgruppe sind Ersteller, nicht Spieler | Die KI-Anleitung richtet sich naturgemäß an Ersteller; Spieler kommen über direkte Quest-Links in die App und sehen die Landing Page in der Regel nie | 2026-09-04 |
| KI-Anleitung ist eine statische Copy-Paste-Vorlage, keine Integration | PRD-Constraint „kein Backend"; eine Vorlage funktioniert mit jedem KI-Tool, kostet nichts und braucht keinen API-Key | 2026-09-04 |
| Die KI erzeugt fertiges Quest-JSON statt nur Ideen | Größter Zeitgewinn für den Nutzer und nutzt den bestehenden JSON-Import (PROJ-2), statt Abtippen zu erfordern | 2026-09-04 |
| Koordinaten werden nach dem Import im Creator gesetzt | Ein Sprachmodell kennt keine echten GPS-Koordinaten und erfindet sie; erfundene Koordinaten ergeben eine Quest, die draußen ins Leere führt | 2026-09-04 |
| Prompt bildet das volle Schema ab (alle Modul- und Aufgabentypen) | Nutzer sollen die gesamte Bandbreite der App ausschöpfen können; eine reduzierte Vorlage würde Medien-Module künstlich ausblenden | 2026-09-04 |
| Medien-Module bekommen erkennbare Platzhalter-URLs statt echter Links | Pflichtfeld `url` würde den Import bei leerem Wert blockieren; erfundene echte URLs würden still ins Leere laufen und erst draußen auffallen | 2026-09-04 |
| Keine Websuche-Anweisung für echte Medien-URLs im Prompt | Modelle liefern meist Seiten-Links statt direkter Datei-URLs; dazu Urheberrechtsrisiko (Schulkontext) und Link-Rot | 2026-09-04 |
| Hinweis auf freie Medienquellen wird aufgenommen | Nutzer brauchen einen realistischen Weg zu legalen Medien; ohne diesen Hinweis bleiben Medien-Module in der Praxis ungenutzt | 2026-09-04 |
| Kein „JSON einfügen"-Feld im Import; Anleitung beschreibt den Datei-Weg | Hält PROJ-13 als reine Inhaltsseite ohne Eingriff in PROJ-2; ein Einfüge-Feld wäre ein eigenes Feature | 2026-09-04 |
| UUID-Problem wird per Troubleshooting statt vorgenerierter UUIDs gelöst | Vorgenerierte UUIDs würden den Prompt stark aufblähen und unübersichtlich machen; ein Troubleshooting-Abschnitt fängt auch andere Importfehler mit ab | 2026-09-04 |
| Ausführliche Marketing-Seite mit Feature-Sektionen statt Kurz-Hero | Die Seite ist der externe Einstiegspunkt (QR-Code, Social Media) und muss das Produkt eigenständig verkaufen können | 2026-09-04 |
| Prompt ist immer sichtbar, Copy-Button ist optionaler Komfort | Clipboard-API kann blockiert sein; der Nutzer darf nie vom Prompt ausgesperrt werden | 2026-09-04 |
| Einstieg zur Seite aus der App heraus, nicht prominent auf `/` | Der reduzierte Start-Screen aus PROJ-1 bleibt unangetastet; im Creator-Kontext ist die Anleitung relevanter | 2026-09-04 |
| Open Graph / SEO-Metadaten sind Teil des Scopes | Die Seite ist zum Teilen gedacht; ohne eigene Metadaten sieht der geteilte Link unbrauchbar aus | 2026-09-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
