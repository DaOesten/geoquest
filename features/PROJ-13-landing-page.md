# PROJ-13: Landing Page mit App-Link & KI-Anleitung

## Status: Approved
**Created:** 2026-09-04
**Last Updated:** 2026-09-05

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

Das Feature besteht aus **zwei zusammengehörenden statischen Seiten**, die gemeinsam gebaut und deployed werden. Grund für die Trennung: Sie bedienen zwei verschiedene Momente — „Was ist das?" und „Ich will jetzt eine Quest bauen". In einer Seite vereint müsste der Nutzer erst an Marketing vorbeiscrollen, bevor er zur Prompt-Vorlage kommt.

### Seite 1: `/about` — Produktvorstellung
1. **Hero** — Logo, Headline, Ein-Satz-Erklärung, primärer App-Button („Zur App")
2. **Feature-Sektionen** — was Geo Quest kann: GPS-Navigation zu echten Orten, 5 Modultypen (Text, Bild, Audio, Video, Aufgaben), 3 Aufgabentypen (Code, Multiple-Choice, Sortieren), komplett kostenlos, kein Account nötig
3. **Für wen / Anlässe** — Kindergeburtstag, Schulausflug, Ferienprogramm; Zielgruppe 10–15 Jahre
4. **Abgrenzung** — kostenlos und offen, kein Abo, kein Account-Zwang, Gaming-Look statt Bildungs-Tool
5. **Verweis auf die Anleitung** — prominenter Einstieg zu `/anleitung`
6. **Abschluss-CTA** — App-Button

### Seite 2: `/anleitung` — Quest mit KI erstellen
1. **Kurzer Einstieg** — was hier passiert, in zwei Sätzen
2. **Schritt-für-Schritt-Ablauf** — Prompt kopieren → in KI einfügen → JSON speichern → importieren
3. **Prompt-Vorlage** (Kernstück) — sichtbarer, markierbarer Text mit Copy-Button
4. **Nach dem Import** — was noch angepasst werden muss (Koordinaten, Medien-URLs)
5. **Freie Medienquellen** — kurzer Hinweis auf legal nutzbare Quellen und direkte Datei-URLs
6. **Troubleshooting** — „Wenn der Import fehlschlägt"
7. **Abschluss-CTA** — zur App / zum Creator

Beide Seiten verlinken wechselseitig aufeinander. Der Einstieg aus der App (Creator-Empty-State) führt direkt auf `/anleitung`, weil dort der konkrete Bedarf besteht.

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
- [x] Angenommen ein Nutzer öffnet `/about` direkt, wenn die Seite lädt, dann sieht er Hero, Feature-Sektionen und Anlässe, ohne dass App-Daten (Quests im Browser-Speicher) benötigt werden
- [x] Angenommen ein Nutzer öffnet `/anleitung` direkt, wenn die Seite lädt, dann sieht er den Schritt-für-Schritt-Ablauf und die vollständige Prompt-Vorlage, ohne vorher `/about` besucht zu haben
- [x] Angenommen ein Nutzer ist auf `/about`, wenn er den Verweis auf die Anleitung klickt, dann gelangt er zu `/anleitung`
- [x] Angenommen ein Nutzer ist auf einer der beiden Seiten, wenn er den App-Button klickt, dann gelangt er zum Start-Screen der App
- [x] Angenommen ein Nutzer ist im Creator-Bereich und hat noch keine Quests, wenn er den Einstieg „Wie erstelle ich eine Quest?" (o.ä.) anklickt, dann gelangt er direkt zu `/anleitung`
- [x] Angenommen ein Nutzer öffnet die Root-Route `/`, wenn die Seite lädt, dann sieht er unverändert den bestehenden Mode-Switch-Screen aus PROJ-1
- [x] Angenommen ein Nutzer öffnet eine der Seiten auf einem Mobilgerät (360–430px), wenn er scrollt, dann sind alle Inhalte lesbar, ohne horizontales Scrollen, und alle Touch-Targets sind mindestens 44px groß
- [x] Angenommen ein Nutzer öffnet eine der Seiten am Laptop oder Desktop (ab 1024px), wenn die Seite lädt, dann nutzt das Layout die verfügbare Breite mehrspaltig, ohne dass Textzeilen überdehnen oder Inhalte in einer schmalen Handy-Spalte kleben

### Prompt-Vorlage
- [x] Angenommen ein Nutzer ist bei der Anleitungs-Sektion, wenn er die Seite betrachtet, dann ist die vollständige Prompt-Vorlage als lesbarer Text sichtbar und manuell markierbar
- [x] Angenommen ein Nutzer klickt den Kopieren-Button, wenn das Kopieren erfolgreich ist, dann erhält er eine sichtbare Bestätigung (z.B. „Kopiert!")
- [x] Angenommen die Clipboard-API ist blockiert oder nicht verfügbar, wenn der Nutzer den Kopieren-Button klickt, dann erscheint ein Hinweis, den Text manuell zu markieren und zu kopieren, und der Prompt bleibt vollständig sichtbar
- [x] Angenommen ein Nutzer hat den Prompt kopiert, wenn er ihn liest, dann erkennt er eindeutig, welche Stellen er selbst ausfüllen muss (Thema, Ort, Altersgruppe, Stationsanzahl)
- [x] Angenommen ein Nutzer fügt den unveränderten Prompt in ein gängiges KI-Tool ein und füllt die Platzhalter aus, wenn die KI antwortet, dann ist die Ausgabe valides JSON, das dem Quest-Schema aus PROJ-2 entspricht

### Anleitung & Erwartungsmanagement
- [x] Angenommen ein Nutzer liest die Anleitung, wenn er beim Import-Schritt ankommt, dann ist beschrieben, wie er den JSON-Text aus dem Chat als `.json`-Datei speichert und über „Quest importieren" einspielt
- [x] Angenommen ein Nutzer hat eine Quest importiert, wenn er die Anleitung weiterliest, dann ist klar beschrieben, dass er die GPS-Koordinaten aller Stationen im Stationen-Editor auf der Karte setzen muss
- [x] Angenommen die importierte Quest enthält Medien-Module, wenn der Nutzer die Anleitung liest, dann ist klar beschrieben, dass die Platzhalter-URLs durch echte HTTPS-URLs ersetzt werden müssen
- [x] Angenommen ein Nutzer sucht Medien für seine Quest, wenn er die entsprechende Sektion liest, dann findet er einen Hinweis auf legal nutzbare Quellen und die Erklärung, dass eine direkte Datei-URL benötigt wird (nicht der Link zur Webseite)

### Fehlerfälle & Troubleshooting
- [x] Angenommen der Import einer KI-generierten Quest schlägt fehl, wenn der Nutzer den Troubleshooting-Abschnitt liest, dann findet er die häufigsten Ursachen (ungültige UUID, fehlende Pflichtfelder, ungültige URL) und je einen konkreten Lösungsweg
- [x] Angenommen ein Nutzer hat eine Fehlermeldung beim Import erhalten, wenn er dem Troubleshooting folgt, dann ist beschrieben, dass er die Fehlermeldung der KI zurückgeben und um Korrektur bitten kann

### Teilen & Auffindbarkeit
- [x] Angenommen ein Nutzer teilt die URL von `/about` oder `/anleitung` in einem Messenger, wenn die Vorschau generiert wird, dann erscheinen ein für die jeweilige Seite spezifischer Titel, eine Beschreibung und ein Vorschaubild (nicht die globalen App-Metadaten)

## Edge Cases
- **Clipboard-API blockiert oder Seite nicht über HTTPS ausgeliefert** → Copy-Button schlägt fehl; Prompt bleibt sichtbar und markierbar, Hinweis auf manuelles Kopieren erscheint
- **KI liefert JSON mit erklärendem Fließtext davor/danach** → Anleitung weist darauf hin, nur den JSON-Block (zwischen `{` und `}`) zu übernehmen
- **KI liefert ungültige UUIDs** → Import scheitert mit Zod-Fehlermeldung; Troubleshooting erklärt, die Fehlermeldung an die KI zurückzugeben
- **KI erfindet echt aussehende Medien-URLs statt der vorgegebenen Platzhalter** → Anleitung weist an, alle Medien-URLs nach dem Import zu prüfen und zu ersetzen
- **KI überschreitet Schema-Limits** (>20 Stationen, >5 Multiple-Choice-Optionen, `radiusMeters` außerhalb 10–100) → Import scheitert; Troubleshooting deckt das ab
- **Nutzer importiert eine Quest, deren `id` bereits lokal existiert** → bestehender Überschreiben-Dialog aus PROJ-2 greift; Anleitung erwähnt diesen Fall
- **Nutzer spielt die Quest ohne Koordinaten anzupassen** → Quest führt an Platzhalter-Orte; Anleitung stellt diesen Schritt deshalb prominent als Pflichtschritt dar
- **Nutzer öffnet die Seite auf dem Desktop** → eigenes mehrspaltiges Layout bis 1100px Container-Breite, Textspalten auf ~52 Zeichen begrenzt; die Seiten sind bewusst NICHT auf die 430px der App-Screens beschränkt, weil Besucher typischerweise über einen geteilten Link am Laptop ankommen
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
- [x] ~~Wie wird die Prompt-Vorlage synchron zu `src/lib/quest-schema.ts` gehalten?~~ → Geklärt in `/architecture`: Handgepflegter Text plus Guard-Test, der ein Beispiel-JSON gegen das echte Schema validiert
- [x] ~~Welcher konkrete Routen-Pfad?~~ → Geklärt: zwei Seiten, `/about` (Produktvorstellung) und `/anleitung` (KI-Anleitung)
- [x] ~~Wo genau sitzt der Einstieg aus der App heraus?~~ → Geklärt: im Creator-Empty-State, verlinkt direkt auf `/anleitung`
- [x] ~~Welches Vorschaubild wird für Open Graph verwendet?~~ → Geklärt im Frontend: `public/assets/urbanquest.png` (1536×1024, markengetreu), zugleich Hero-Bild auf `/about`
- [ ] Soll die Prompt-Vorlage in mehreren Varianten angeboten werden (z.B. kürzere Version für schwächere Modelle)? Aktuell: nein, eine vollständige Vorlage.
- [ ] Sollen die beiden Seiten zusätzlich einen Einstieg außerhalb des Creator-Empty-States bekommen (z.B. dauerhaft im Creator-Header), sobald ein Nutzer bereits Quests hat?

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
| Zwei statische Seiten (`/about`, `/anleitung`) statt einer langen Seite | Bedienen zwei verschiedene Nutzer-Momente; getrennt kommt der Ersteller ohne Marketing-Scroll direkt zur Prompt-Vorlage. Bleiben trotzdem eine Spec, weil sie zusammen gebaut und deployed werden | 2026-09-04 |
| Serverseitig gerenderte Seiten ohne Client-State | Beide Seiten sind reiner Inhalt ohne Zugriff auf Browser-Speicher; das erlaubt echte Meta-Tags für das Teilen und die schnellste Ladezeit | 2026-09-04 |
| Nur der Kopieren-Button ist eine Client-Komponente | Kleinstmöglicher interaktiver Teil; der Prompt-Text selbst bleibt serverseitig gerendert und damit auch ohne JavaScript lesbar | 2026-09-04 |
| Prompt-Vorlage liegt als eigenes Text-Modul unter `src/lib/` | Trennt langen Inhalt von der Darstellung, macht ihn testbar und an einer Stelle pflegbar | 2026-09-04 |
| Guard-Test validiert ein Beispiel-JSON gegen `questSchema` | Ändert sich das Schema, schlägt der Test fehl und erinnert daran, die Vorlage nachzuziehen — verhindert, dass die Vorlage still veraltet und Nutzer Importfehler bekommen | 2026-09-04 |
| Dunkles Theme wie Start-Screen und Play-Bereich | Die Seiten sind die Visitenkarte nach außen; der Gaming-Look transportiert die Differenzierung gegenüber nüchternen Bildungs-Tools | 2026-09-04 |
| Prompt in Box fester Höhe mit eigenem Scrollbereich | Prompt bleibt vollständig sichtbar und markierbar (Spec-Vorgabe), drängt aber Troubleshooting und Folgeschritte nicht ans Seitenende | 2026-09-04 |
| Keine neuen Pakete; bestehende shadcn/ui-Komponenten (u.a. Accordion) wiederverwenden | Accordion und Button sind bereits installiert; Troubleshooting als Accordion hält die Seite kompakt | 2026-09-04 |
| Kopieren nutzt die Browser-Zwischenablage mit Fehlerbehandlung | Die Zwischenablage kann blockiert sein; bei Fehlschlag erscheint ein Hinweis zum manuellen Markieren, der Prompt bleibt erreichbar | 2026-09-04 |
| Einstieg zunächst nur im Creator-Empty-State | Kleinster Eingriff in bestehende Screens (PROJ-6) und genau der Moment, in dem ein Nutzer ratlos vor einer leeren Liste steht | 2026-09-04 |
| Info-Seiten nicht auf 430px begrenzt wie die App-Screens, sondern eigenes Desktop-Layout bis 1100px | Diese Seiten sind der Einstieg von außen (geteilter Link, QR-Code) und werden typischerweise am Laptop geöffnet; eine schmale Handy-Spalte auf einem 1440px-Bildschirm wirkt unfertig. Die App-Screens selbst bleiben unverändert bei 430px | 2026-09-05 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick

Zwei statische Inhaltsseiten, die zur bestehenden App hinzukommen. Kein Backend, keine Datenbank, keine API-Aufrufe, kein Zugriff auf den Browser-Speicher. Die Seiten funktionieren unabhängig davon, ob der Nutzer schon Quests angelegt hat.

Der einzige Eingriff in bestehenden Code ist ein zusätzlicher Link im Creator-Bereich.

### Seitenstruktur

```
/about  (Produktvorstellung)
+-- Ambient-Hintergrund (wiederverwendet)
+-- Header mit Logo + "Zur App"
+-- Hero: Logo, Headline, Ein-Satz-Erklärung, App-Button
+-- Feature-Sektionen (GPS, Module, Aufgabentypen, kostenlos)
+-- "Für wen / Anlässe"
+-- Abgrenzung (kein Abo, kein Account, Gaming-Look)
+-- Verweis auf die Anleitung  --------> /anleitung
+-- Abschluss-CTA (App-Button)

/anleitung  (Quest mit KI erstellen)
+-- Ambient-Hintergrund (wiederverwendet)
+-- Header mit Logo + "Zur App"
+-- Kurzer Einstieg (zwei Sätze)
+-- Schritt-für-Schritt-Ablauf (4 Schritte)
+-- Prompt-Vorlage
|   +-- Box fester Höhe, innen scrollbar, Text markierbar
|   +-- Kopieren-Button (einzige interaktive Stelle)
+-- "Nach dem Import" (Koordinaten, Medien-URLs)
+-- Freie Medienquellen
+-- Troubleshooting (aufklappbare Einträge)
+-- Abschluss-CTA (zum Creator)
```

**Eingriff in bestehende Screens:** Im Creator-Empty-State („Noch keine Quests erstellt") kommt ein dezenter Link zu `/anleitung` hinzu — an genau der Stelle, wo ein Nutzer ohne Quest steht und nicht weiß, wie er anfangen soll.

### Neue Bausteine

| Baustein | Zweck |
|----------|-------|
| Seite `/about` | Produktvorstellung, serverseitig gerendert |
| Seite `/anleitung` | Anleitung mit Prompt-Vorlage, serverseitig gerendert |
| Gemeinsames Layout für beide Seiten | Dunkles Theme, Hintergrund, Breitenbegrenzung |
| Prompt-Vorlage (Textmodul) | Der vollständige Prompt als pflegbarer Text an einer Stelle |
| Kopieren-Baustein | Kleiner interaktiver Teil: kopiert den Prompt, zeigt Bestätigung oder Fallback-Hinweis |
| Guard-Test | Prüft, ob ein Beispiel-JSON aus der Vorlage noch zum echten Quest-Schema passt |

Wiederverwendet werden: der bestehende App-Header, die Ambient-Hintergründe aus dem Play-Bereich, Button und Accordion aus shadcn/ui sowie das bestehende Benachrichtigungs-System für die Kopier-Bestätigung.

### Datenhaltung

**Keine.** Beide Seiten speichern nichts und lesen nichts aus dem Browser-Speicher. Der einzige „Datensatz" ist der Prompt-Text, der fest zur Anwendung gehört und mit jedem Deployment ausgeliefert wird.

Das ist bewusst so: Die Seiten müssen auch dann vollständig funktionieren, wenn jemand den Link auf einem fremden Gerät öffnet, auf dem Geo Quest nie benutzt wurde.

### Wie die Prompt-Vorlage aktuell bleibt

Das größte Risiko dieses Features ist unsichtbar: Ändert jemand später das Quest-Format, beschreibt die Prompt-Vorlage plötzlich ein Format, das die App nicht mehr akzeptiert. Nutzer bekommen dann Importfehler, ohne dass jemand die Ursache bemerkt.

Absicherung in zwei Schritten:

1. Die Vorlage enthält ein vollständiges Beispiel einer Mini-Quest.
2. Ein automatischer Test prüft bei jedem Testlauf, ob dieses Beispiel noch dem echten Quest-Format entspricht.

Ändert sich das Format, schlägt der Test fehl — mit dem klaren Hinweis, dass die Vorlage nachgezogen werden muss. Das kostet wenig und verhindert genau den Fehler, den sonst niemand bemerkt.

### Umgang mit den bekannten Stolpersteinen

| Stolperstein | Lösung |
|--------------|--------|
| KI kennt keine echten GPS-Koordinaten | Vorlage weist erkennbare Platzhalter an; Anleitung macht das Nachtragen auf der Karte zum Pflichtschritt |
| Medien brauchen eine Pflicht-Internetadresse | Vorlage setzt erkennbare Platzhalter-Adressen, damit der Import durchläuft; Anleitung weist auf das Ersetzen hin |
| KI erzeugt oft ungültige Kennnummern | Troubleshooting erklärt, die Fehlermeldung an die KI zurückzugeben |
| Import akzeptiert nur Dateien, kein eingefügter Text | Anleitung beschreibt das Speichern als Datei; Import selbst bleibt unverändert |
| Zwischenablage kann blockiert sein | Prompt ist immer sichtbar und markierbar; bei Fehlschlag erscheint ein Hinweis |

### Auffindbarkeit und Teilen

Beide Seiten bekommen eigene Titel, Beschreibungen und ein Vorschaubild, damit ein geteilter Link in Messengern und sozialen Netzwerken ordentlich aussieht. Da die Seiten serverseitig gerendert werden, funktioniert das ohne Zusatzaufwand — die Vorschau-Informationen stehen direkt in der Seite.

### Abhängigkeiten (neue Pakete)

**Keine.** Alles Nötige ist vorhanden: die Oberflächen-Bausteine (shadcn/ui) inklusive Accordion, das Benachrichtigungs-System und die Ambient-Hintergründe. Die Zwischenablage-Funktion ist eine Standard-Browserfunktion.

### Was dieses Feature *nicht* anfasst

- Der Quest-Import bleibt unverändert (nur Dateien, kein Textfeld)
- Der Stationen-Editor bleibt unverändert
- Die Startseite `/` bleibt unverändert
- Es entstehen keine Server-Endpunkte und keine gespeicherten Daten

### Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
|--------|------------|---------------|
| Vorlage veraltet nach Format-Änderung | Nutzer bekommen Importfehler | Guard-Test (siehe oben) |
| KI-Modelle liefern trotz klarer Anweisung fehlerhaftes JSON | Import scheitert | Troubleshooting-Abschnitt mit konkreten Lösungswegen |
| Nutzer überspringt das Nachtragen der Koordinaten | Quest führt draußen ins Leere | Pflichtschritt prominent nach der Vorlage platziert |
| Sehr langer Prompt schreckt ab | Nutzer bricht ab | Box fester Höhe; der Ablauf davor erklärt, dass der Text nur kopiert und nicht gelesen werden muss |

## Implementation Notes (Frontend)

**Umgesetzt am 2026-09-04.**

### Neue Dateien
| Datei | Zweck |
|-------|-------|
| `src/app/(info)/layout.tsx` | Gemeinsames Layout beider Seiten (dunkel, `max-w-[430px]`) |
| `src/app/(info)/about/page.tsx` | Produktvorstellung, statisch prerendered |
| `src/app/(info)/anleitung/page.tsx` | Anleitung mit Prompt-Vorlage, statisch prerendered |
| `src/components/info-page-shell.tsx` | Gemeinsamer Rahmen: Backdrop, Header, List-Header-Pattern |
| `src/components/prompt-copy-box.tsx` | Einzige Client-Komponente: Kopieren mit Fallback |
| `src/lib/quest-ai-prompt.ts` | Prompt-Vorlage + Beispiel-Quest als Konstanten |
| `src/lib/quest-ai-prompt.test.ts` | Guard-Tests (8 Stück) |

### Geänderte Dateien
- `src/app/create/page.tsx` — Link „Quest mit KI bauen" im Empty-State (einziger Eingriff in bestehende Screens)
- `src/app/layout.tsx` — `metadataBase` ergänzt, damit Open-Graph-Bilder beim Teilen zu absoluten URLs auflösen statt zu `localhost`

### Abweichungen vom Tech Design
- **Guard-Test prüft zusätzlich die echte Import-Pipeline**, nicht nur `questSchema`. Schema-Validität allein hätte Sanitizing, Versions-Gate und Modul-Filterung übersprungen — also genau die Schritte, an denen ein Nutzer real scheitert.
- **`urbanquest.png` als Hero- und Sharing-Bild** gewählt (1536×1024, markengetreu mit Teal/Lime und „Explore. Solve. Discover."). Damit ist die entsprechende Open Question geschlossen.
- **Kein `AppHeader` wiederverwendet:** Die Info-Seiten brauchen dauerhaft einen „Zur App"-Button rechts; `InfoPageShell` bringt einen eigenen, schlanken Header mit gleicher Optik mit.

### Nachtrag: Desktop-Layout (2026-09-05)

Auf Nutzerwunsch wurden beide Seiten von der 430px-Begrenzung der App-Screens gelöst — die Zielgruppe findet diese Seiten typischerweise am Laptop oder Desktop.

- **Container:** `max-w-[1100px]` mit `px-5 sm:px-8` statt `max-w-[430px]`; das `(info)`-Layout begrenzt die Breite nicht mehr selbst
- **Header:** volle Breite mit zentriertem Inhalt, dazu Navigationslinks „Über" und „Anleitung" ab `sm` (auf Mobile ausgeblendet, damit der Header nicht überläuft)
- **Zweispaltiger Hero:** neue `lead`- und `aside`-Props im `InfoPageShell`; ab `lg` steht der Titelblock links, rechts das Hero-Bild (`/about`) bzw. eine „Was dabei herauskommt"-Karte (`/anleitung`, sonst wäre die rechte Hälfte leer geblieben)
- **Grids:** Feature-Cards 1→2→3 Spalten, Schritte 1→2→4 Spalten, Pflichtschritte und Medien/Troubleshooting je zweispaltig ab `lg`
- **Typografie:** Titel skaliert bis 4rem, Fließtext bis `text-lg`; Textspalten auf `max-w-[52ch]` begrenzt, damit die Zeilen am Desktop nicht überdehnen
- **Prompt-Box:** höher (`lg:max-h-[560px]`) und größere Schrift ab `lg`
- **`scroll-mt-20`** auf allen Sections, damit Überschriften nicht unter dem sticky Header verschwinden

Geprüft bei 390px, 1024px, 1440px und 1920px: kein horizontales Scrollen, keine Touch-Targets unter 44px (der zuvor gemeldete 32px-Logo-Link hat jetzt eine 44px-Klickfläche).

### Nachtrag: Logo, „Für wen"-Abschnitt und SEO/GEO (2026-09-05)

- **Logo-Lockup auf `/about`:** neue `showLogo`-Prop im `InfoPageShell` (nur die Startseite nutzt sie, Unterseiten behalten die Pin-Marke im Header). Das PNG hat keinen Alpha-Kanal, sondern eine deckende Fast-Schwarz-Fläche — per `mix-blend-screen` verschwindet die Platte gegen den Seitenhintergrund, ohne dass ein Kasten sichtbar bleibt. Kein Glow oder Shimmer dahinter (Markenvorgabe).
- **„Für wen" neu gefasst:** Die losen Pills sind ersetzt durch einen dreiabsätzigen Fließtext, der die Anlässe in echten Situationen beschreibt, plus eine Definitionsliste „Typische Anlässe" mit je einer Zeile Kontext. Das liest sich besser und liefert Suchmaschinen wie KI-Systemen verwertbaren Zusammenhang statt Schlagworten.
- **SEO:** Title und Description auf die tatsächlichen Suchbegriffe umgestellt („digitale Schnitzeljagd selbst erstellen", „kostenlos & ohne Anmeldung") statt des inhaltsarmen „Was ist Geo Quest?"; `keywords` und `alternates.canonical` ergänzt.
- **GEO (Zitierbarkeit durch KI-Systeme):** JSON-LD mit `WebApplication` (inkl. Preis 0 EUR, Zielgruppe 10–15, Feature-Liste) und `FAQPage`. Die vier FAQ-Einträge stehen als `FAQ`-Konstante an einer Stelle und werden sowohl sichtbar gerendert als auch ins JSON-LD gemappt — strukturierte Daten können so nicht vom Seiteninhalt abweichen.

### Verifikation
- `npm run build` — erfolgreich, beide Seiten als **statisch** prerendered
- `npm test` — 167 Tests grün (8 neue)
- `npm run lint` — keine Fehler
- Browser (WebKit, 390×844): kein horizontales Scrollen auf beiden Seiten
- Alle Navigationspfade geprüft: `/about` ↔ `/anleitung`, „Zur App" → `/`, Creator-Empty-State → `/anleitung`
- Startscreen `/` unverändert
- Clipboard-Fehlerfall simuliert: Hinweis erscheint, Prompt bleibt vollständig sichtbar
- Open-Graph-Tags beider Seiten enthalten eigenen Titel, Beschreibung und absolutes Bild

### Offen für QA
- Der Prompt wurde **nicht** mit einem echten KI-Tool durchgespielt. Das entsprechende Acceptance Criterion („KI liefert valides Quest-JSON") braucht einen manuellen Test mit ChatGPT/Claude.
- Touch-Target-Prüfung meldet den Logo-Link im Header mit 32px. Das entspricht dem bestehenden `AppHeader` der gesamten App — bewusst konsistent belassen, ggf. app-weit separat zu klären.

## QA Test Results

**Getestet am:** 2026-09-05
**Testumgebung:** Mobile Safari (WebKit, iPhone 13) via Playwright; manuelle Browser-Prüfung bei 390 / 1024 / 1440 / 1920 px; Unit-Tests via Vitest
**Ergebnis:** 18 von 18 Acceptance Criteria bestanden · 4 Bugs (0 Critical, 0 High, 1 Medium, 3 Low)

### Acceptance Criteria

| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | `/about` lädt eigenständig ohne App-Daten | bestanden |
| 2 | `/anleitung` lädt direkt mit Ablauf und Prompt | bestanden |
| 3 | Verweis `/about` → `/anleitung` | bestanden |
| 4 | „Zur App" führt zum Start-Screen | bestanden |
| 5 | Creator-Empty-State → `/anleitung` | bestanden |
| 6 | Root-Route `/` unverändert | bestanden |
| 7 | Mobil kein H-Scroll, Touch-Targets ≥ 44px | bestanden |
| 8 | Desktop mehrspaltig, keine überdehnten Zeilen | bestanden (manuell, 1024–1920px) |
| 9 | Prompt sichtbar und markierbar | bestanden |
| 10 | Kopieren zeigt Bestätigung | bestanden (manuell; E2E in WebKit übersprungen, s. Bug 4) |
| 11 | Blockierte Zwischenablage sperrt nicht aus | bestanden |
| 12 | Auszufüllende Stellen eindeutig markiert | bestanden |
| 13 | **KI liefert schema-konformes Quest-JSON** | **bestanden mit Einschränkung** (s. Bug 1) |
| 14 | Import-Schritt erklärt den `.json`-Weg | bestanden |
| 15 | Koordinaten als Pflichtschritt beschrieben | bestanden |
| 16 | Medien-Platzhalter müssen ersetzt werden | bestanden |
| 17 | Medienquellen + direkte Datei-Adresse erklärt | bestanden |
| 18 | Troubleshooting nennt Ursachen und Lösungswege | bestanden |
| 19 | Eigene Open-Graph-Daten je Seite | bestanden |

### Der offene Punkt aus der Frontend-Phase: echter KI-Durchlauf

Das bislang ungetestete Kriterium wurde **real durchgespielt** — Prompt befüllt (Detektivfall, Stadtpark Bonn, 10–12 Jahre, 4 Stationen), durch zwei Modelle geschickt, Ergebnis durch die echte Import-Pipeline geprüft.

**Durchlauf 1 (Sonnet-Klasse):** Vollständig regelkonform — gültige eindeutige UUIDs, `lat`/`lng` auf 0, `radiusMeters` 15–20, alle fünf Modultypen, alle drei Aufgabentypen, ausschließlich `BITTE-ERSETZEN`-URLs. **Import erfolgreich, 0 übersprungene Module.**

**Durchlauf 2 (Haiku-Klasse):** Inhaltlich korrekt, aber zwei Stations-UUIDs mit ungültigem Varianten-Nibble (`…-0d9a-…`, `…-1e0b-…`). **Import abgelehnt** mit „Station 3: Stations-ID muss eine gültige UUID sein."

**Beide Modelle** umschlossen die Ausgabe mit einem ```json-Codeblock, obwohl der Prompt das ausdrücklich untersagt.

### Bugs

**Bug 1 — Schwächere Modelle erzeugen ungültige UUIDs (Medium)**
Reproduktion: Prompt in ein kleineres Modell (Haiku-Klasse) einfügen → zwei von fünf UUIDs verletzen das Varianten-Nibble → Import scheitert.
Auswirkung: Der Nutzer muss einen zusätzlichen Korrekturzyklus mit der KI drehen. Kein Datenverlust, kein Blocker — die Anleitung deckt genau diesen Fall im Troubleshooting ab und die Fehlermeldung benennt die betroffene Station.
Vorschlag: Vorgenerierte UUID-Liste im Prompt (war als Alternative bereits im Tech Design erwogen und zugunsten des Troubleshootings verworfen) oder eine explizitere Warnung im Prompt.

**Bug 2 — Modelle ignorieren „kein Markdown-Codeblock" (Low)**
Reproduktion: Prompt unverändert einfügen → Ausgabe beginnt mit ```json.
Auswirkung: Rohe Ausgabe als `.json` gespeichert schlägt fehl („Die Datei ist kein gültiges JSON-Format."). Die Anleitung beschreibt das im Troubleshooting („nur den Teil von `{` bis `}`"), aber der Schritt-für-Schritt-Ablauf erwähnt es nicht — dort würde der Hinweis früher greifen.

**Bug 3 — `/anleitung` fehlt Canonical und Keywords (Low)**
`/about` setzt `alternates.canonical` und `keywords`, `/anleitung` nicht. Inkonsistent; für eine teilbare Seite mit eigenem Suchpotenzial sinnvoll nachzuziehen.

**Bug 4 — JSON-LD ohne `</script>`-Escaping (Low, latent)**
`JSON.stringify` escaped `</script>` nicht, und das Ergebnis geht in `dangerouslySetInnerHTML`.
Aktuell **keine aktive Lücke**: alle Werte sind hartkodierte Literale, das ausgelieferte JSON-LD enthält verifiziert kein `<`. Sobald jemand einen FAQ-Eintrag mit `</script>` ergänzt oder dynamische Daten einspeist, entsteht XSS. Fix: `.replace(/</g, "\\u003c")` beim Serialisieren.

### Security-Audit (Red Team)

| Prüfung | Ergebnis |
|---------|----------|
| XSS über Nutzereingaben | Keine Angriffsfläche — beide Seiten nehmen keinerlei Eingaben entgegen |
| URL-Parameter / Injection | Keine `searchParams`, keine dynamischen Routen |
| `dangerouslySetInnerHTML` | Nur JSON-LD aus statischen Literalen; latentes Risiko dokumentiert (Bug 4) |
| Netzwerk-Requests | Keine — keine `fetch`/XHR/WebSocket-Aufrufe |
| Datenzugriff | Kein `localStorage`, kein Zugriff auf Quests oder Fortschritt |
| Geheimnisse im Client | Keine Environment-Variablen im Client-Bundle; `metadataBase` nutzt nur die öffentliche Vercel-Domain |
| Externe Ressourcen | Nur eigene Assets; keine Drittanbieter-Skripte oder -Tracker |

Die Angriffsfläche ist minimal: zwei statische, serverseitig gerenderte Seiten ohne Backend, ohne Eingaben, ohne Speicherzugriff. Einziger Client-State ist ein Enum für den Copy-Button.

### Regressionstest

Volle E2E-Suite auf Mobile Safari: **202 bestanden, 17 fehlgeschlagen.**

Die 17 Fehlschläge (PROJ-1, PROJ-3, PROJ-11) wurden gegen Commit `5c6db64` — also **vor** dem PROJ-13-Frontend — gegengeprüft und schlagen dort identisch fehl. Sie sind **vorbestehend und nicht von PROJ-13 verursacht** (siehe auch bekanntes Follow-up zu veralteten E2E-Tests). Unit-Tests: 167 von 167 grün.

### Nicht getestet

- **Chromium:** Die Playwright-Chromium-Installation auf dieser Maschine ist defekt (`Google Chrome for Testing Framework` fehlt im App-Bundle, Headless-Shell nicht installiert). Betrifft alle Feature-Suiten gleichermaßen, nicht nur PROJ-13. Eine Neuinstallation wurde begonnen, aber nicht abgeschlossen. **Vor dem Deploy einmal `npx playwright install chromium` ausführen und die Suite gegen Chromium laufen lassen.**
- **Firefox:** Kein Playwright-Projekt konfiguriert.
- **Reale Sharing-Vorschau** (WhatsApp/Social): Die Meta-Tags sind verifiziert, das tatsächliche Rendern der Vorschaukarte lässt sich erst nach dem Deploy mit der Produktions-URL prüfen — `metadataBase` löst lokal auf `localhost` auf.

### Neue Tests

`tests/proj-13-landing-page.spec.ts` — 21 E2E-Tests (20 bestanden, 1 in WebKit übersprungen), je einer pro Acceptance Criterion. Enthält auch eine Prüfung, dass jeder JSON-LD-FAQ-Eintrag tatsächlich sichtbar auf der Seite steht — strukturierte Daten dürfen nichts behaupten, was der Nutzer nicht sieht.

### Produktionsreife: **JA**

Keine Critical- oder High-Bugs. Bug 1 und 2 sind reale Reibungspunkte im KI-Workflow, aber beide sind in der Anleitung dokumentiert, führen zu klaren Fehlermeldungen und kosten den Nutzer nur einen Korrekturzyklus. Bug 3 und 4 sind kosmetisch bzw. präventiv.

## Deployment
_To be added by /deploy_
