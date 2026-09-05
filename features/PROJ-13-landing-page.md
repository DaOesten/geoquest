# PROJ-13: Landing Page mit App-Link & KI-Anleitung

## Status: Deployed
**Created:** 2026-09-04
**Last Updated:** 2026-09-05 (Refinement umgesetzt — Frontend)

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
- **Ko-fi-Anbindung** — der Aktions-Button im Header bleibt vorerst „Zur App"; der Wechsel auf einen Unterstützungslink ist bewusst vertagt (siehe Open Questions)
- **Rechtsberatung / juristische Prüfung der Texte** — Impressum und Datenschutzerklärung entstehen als sachlich korrekte Beschreibung der tatsächlichen Verarbeitung, ersetzen aber keine anwaltliche Prüfung
- **Cookie-Banner / Consent-Management** — die App setzt keine einwilligungspflichtigen Cookies; falls sich das durch ein späteres Tool ändert, ist das ein eigenes Feature
- **Burger-Menu in den App-Screens** — das Menu gehört zu den Info-Seiten; `/`, `/play` und `/create` bleiben unverändert

## Seitenaufbau

Das Feature besteht aus **zwei zusammengehörenden statischen Seiten**, die gemeinsam gebaut und deployed werden. Grund für die Trennung: Sie bedienen zwei verschiedene Momente — „Was ist das?" und „Ich will jetzt eine Quest bauen". In einer Seite vereint müsste der Nutzer erst an Marketing vorbeiscrollen, bevor er zur Prompt-Vorlage kommt.

### Seite 1: `/about` — Produktvorstellung
1. **Hero** — Logo-Lockup, Headline, Ein-Satz-Erklärung, primärer App-Button („Zur App")
2. **Feature-Sektionen** — was Geo Quest kann: GPS-Navigation zu echten Orten, 5 Modultypen (Text, Bild, Audio, Video, Aufgaben), 3 Aufgabentypen (Code, Multiple-Choice, Sortieren), komplett kostenlos, kein Account nötig
3. **Für wen / Anlässe** — ein Satz zur Zielgruppe plus vier Anlässe mit je einer Kurzzeile
4. **Abgrenzung** — kostenlos und offen, kein Abo, kein Account-Zwang, Gaming-Look statt Bildungs-Tool
5. **Häufige Fragen** — aufklappbares Accordion, standardmäßig zu
6. **Verweis auf die Anleitung** — prominenter Einstieg zu `/anleitung`
7. **Abschluss-CTA** — App-Button

### Seite 3: `/impressum` und Seite 4: `/datenschutz` — Rechtstexte
Zwei schlanke Textseiten im gleichen Rahmen wie `/about` und `/anleitung`. Sie existieren, weil das Burger-Menu sie verlinkt und weil eine öffentlich geteilte Seite in Deutschland eine Anbieterkennzeichnung braucht.

- **`/impressum`** — Anbieterkennzeichnung nach § 5 DDG: Name, Anschrift, Kontakt, Verantwortlicher für den Inhalt
- **`/datenschutz`** — Datenschutzerklärung passend zur tatsächlichen Verarbeitung: keine Accounts, keine Server-Speicherung von Quests (alles im Browser), Standortdaten verlassen das Gerät nicht, Hosting bei Vercel, Reichweitenmessung via Vercel Analytics, externe Medien-URLs in Quests

Beide Seiten werden von Suchmaschinen nicht indexiert (`robots: noindex`) und tauchen nicht in der Desktop-Hauptnavigation auf — nur im Burger-Menu und optional im Footer.

### Navigation (alle Info-Seiten)
Der Header trägt keine Trennlinie zum Seiteninhalt und keine Bildmarke links. Rechts stehen:

- **Desktop (ab `sm`)** — Textlinks „Anleitung", „Impressum", „Datenschutz" plus der Aktions-Button rechts außen
- **Mobile (unter `sm`)** — der Aktions-Button plus ein **Burger-Menu** mit den Links App, Anleitung, Impressum, Datenschutz

Der Aktions-Button rechts außen zeigt vorerst weiterhin „Zur App" und führt auf `/`. Er ist als Platzhalter für einen späteren Ko-fi-Unterstützungslink vorgesehen (siehe Open Questions) — die Position bleibt, das Ziel ändert sich später.

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

### Navigation & Erscheinungsbild (Refinement 2026-09-05)
- [x] Angenommen ein Nutzer öffnet `/about`, wenn er die Seite mit dem Start-Screen `/` vergleicht, dann hat sie denselben ruhigen Hintergrund — keine Rasterlinien, kein Glow, keine animierten Partikel
- [x] Angenommen ein Nutzer betrachtet den Header einer Info-Seite, wenn er zum Inhalt darunter schaut, dann gibt es keine sichtbare Trennlinie zwischen Header und Seiteninhalt
- [x] Angenommen ein Nutzer betrachtet den Header einer Info-Seite, wenn er nach links schaut, dann steht dort keine Pin-Bildmarke mehr
- [x] Angenommen ein Nutzer öffnet eine Info-Seite auf einem Mobilgerät (unter 640px), wenn er das Burger-Menu antippt, dann öffnet sich eine Navigation mit den vier Einträgen App, Anleitung, Impressum und Datenschutz
- [x] Angenommen das Burger-Menu ist offen, wenn der Nutzer einen Eintrag antippt, dann schließt sich das Menu und er landet auf der gewählten Seite
- [x] Angenommen das Burger-Menu ist offen, wenn der Nutzer die Escape-Taste drückt oder neben das Menu tippt, dann schließt es sich, ohne zu navigieren
- [x] Angenommen ein Nutzer bedient die Seite mit der Tastatur, wenn er das Burger-Menu öffnet, dann liegt der Fokus im Menu und der Auslöser meldet seinen Zustand (`aria-expanded`) an Screenreader
- [x] Angenommen ein Nutzer öffnet `/impressum`, wenn die Seite lädt, dann sieht er die Anbieterkennzeichnung nach § 5 DDG im gleichen Rahmen wie die übrigen Info-Seiten
- [x] Angenommen ein Nutzer öffnet `/datenschutz`, wenn die Seite lädt, dann findet er beschrieben, dass Quests und Standortdaten das Gerät nicht verlassen, sowie Angaben zu Hosting und Reichweitenmessung
- [x] Angenommen ein Nutzer ist auf `/about`, wenn er den Bereich „Für wen" liest, dann besteht dieser aus einem einzelnen Satz zur Zielgruppe und vier Anlässen mit je einer Kurzzeile — nicht aus mehreren Fließtext-Absätzen
- [x] Angenommen ein Nutzer betrachtet den Titelblock von `/about`, wenn er unter die Überschrift schaut, dann steht dort kein Hinweis auf Zielgruppe oder Lesezeit
- [x] Angenommen ein Nutzer erreicht die Häufigen Fragen auf `/about`, wenn die Seite geladen ist, dann sind alle Antworten eingeklappt; erst ein Klick auf eine Frage öffnet die zugehörige Antwort
- [x] Angenommen ein KI-System oder Crawler wertet `/about` aus, wenn die Fragen eingeklappt sind, dann sind alle vier Frage-Antwort-Paare weiterhin sowohl im HTML als auch im `FAQPage`-JSON-LD vollständig enthalten

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
- [x] ~~Warum sind die Häufigen Fragen ausgeklappt statt als Accordion?~~ → Ursprünglich für bessere Auffindbarkeit durch KI-Systeme ausgeklappt. Annahme war falsch: Accordion-Inhalte stehen vollständig im HTML (Radix blendet sie nur per `hidden` aus) und das `FAQPage`-JSON-LD trägt die Antworten ohnehin. Zurück zum eingeklappten Accordion (2026-09-05)
- [ ] Wann und wohin genau zeigt der Ko-fi-Link? Der Header-Button bleibt bis dahin „Zur App"; offen sind Ziel-URL, Beschriftung und ob „Zur App" dann in die Navigation rutscht
- [ ] Braucht `/about` zusätzlich einen Footer mit Impressum/Datenschutz für Desktop-Besucher? Aktuell erreichen Desktop-Nutzer die Rechtstexte nur über die Header-Navigation
- [x] ~~Welche konkreten Angaben kommen ins Impressum?~~ → Vom Betreiber geliefert und eingetragen (2026-09-05)

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
| Info-Seiten bekommen denselben ruhigen Hintergrund wie der Start-Screen `/` | Der animierte Backdrop (Raster, Glow, Partikel) konkurriert auf einer Textseite mit dem Inhalt. `/` ist die Referenz für den Marken-Erstkontakt, und die Info-Seiten sind derselbe Erstkontakt für Besucher von außen | 2026-09-05 |
| Keine Trennlinie zwischen Header und Inhalt, keine Bildmarke im Header | Die Linie zerschneidet die Seite optisch in zwei Blöcke; die Pin-Marke doppelt auf `/about` das Logo-Lockup im Hero und ist auf den Unterseiten kein nötiger Wiedererkennungsanker | 2026-09-05 |
| Burger-Menu auf Mobile statt versteckter Navigation | Mit Impressum und Datenschutz sind es vier Ziele — zu viele für eine Header-Zeile auf 360px. Bisher waren „Über" und „Anleitung" auf Mobile schlicht ausgeblendet, die Seiten also vom Handy aus nicht erreichbar | 2026-09-05 |
| Impressum und Datenschutz werden jetzt mitgebaut, nicht vertagt | Ein Menüpunkt, der ins 404 läuft, ist schlechter als gar keiner; dazu braucht eine öffentlich geteilte Seite in Deutschland ohnehin eine Anbieterkennzeichnung | 2026-09-05 |
| Header-Button bleibt „Zur App", Ko-fi wird vertagt | Der Platz ist reserviert, aber ein Unterstützungslink ohne fertiges Ko-fi-Profil wäre ein toter Link. Position bleibt, Ziel wechselt später | 2026-09-05 |
| „Für wen" wird auf einen Satz plus vier Kurzzeilen eingedampft | Die drei Fließtext-Absätze waren für die Zitierbarkeit durch KI-Systeme geschrieben, nicht für Leser. Auf einer Seite, die in Sekunden überzeugen muss, ist das die falsche Priorität — der GEO-Nutzen war spekulativ, die Lesehürde war real | 2026-09-05 |
| Meta-Zeile „Für Ersteller · ca. 2 Min Lesezeit" entfällt | Lesezeit-Angaben gehören zu Artikeln, nicht zu einer Produktseite; die Zielgruppe steht bereits im ersten Satz darunter | 2026-09-05 |
| Häufige Fragen kehren zum eingeklappten Accordion zurück | Ausgeklappt wurden sie für vermuteten GEO-Vorteil — der existiert nicht: Accordion-Inhalte stehen vollständig im HTML und im `FAQPage`-JSON-LD. Eingeklappt bleibt die Seite überschaubar und der Abschluss-CTA in Reichweite | 2026-09-05 |

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
| `QuestListBackdrop` entfällt auf den Info-Seiten | Damit fällt zugleich die einzige Client-Komponente im Seitenrahmen weg (die Partikel brauchten `ssr: false` wegen Hydration); der Rahmen wird bis auf das Menu wieder serverseitig gerendert | 2026-09-05 |
| Burger-Menu als kleine, eigene Client-Komponente im Header | Nur der Menü-Zustand braucht JavaScript. Der Rest des Headers und alle Links bleiben statisches HTML, damit die Navigation auch ohne JS erreichbar ist | 2026-09-05 |
| Menu nutzt die bereits installierte shadcn/ui-Komponente (Sheet oder DropdownMenu) statt Eigenbau | Fokus-Falle, Escape-Handling und `aria-expanded` sind dort gelöst; ein Eigenbau würde genau diese Details verlieren. Kein neues Paket | 2026-09-05 |
| Häufige Fragen nutzen das bereits installierte Accordion | Gleiche Komponente wie das Troubleshooting auf `/anleitung`; die Antworten bleiben im DOM, das JSON-LD wird weiterhin aus derselben `FAQ`-Konstante erzeugt | 2026-09-05 |
| `/impressum` und `/datenschutz` liegen in derselben `(info)`-Route-Gruppe | Sie teilen Rahmen, Hintergrund und Navigation mit `/about` und `/anleitung`; nur `robots: noindex` unterscheidet ihre Metadaten | 2026-09-05 |

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

**Production URLs:**
- https://geoquesty.vercel.app/about
- https://geoquesty.vercel.app/anleitung

**Deployed:** 2026-09-05
**Platform:** Vercel (auto-deploy on push to main)
**Git Tag:** v1.17.0-PROJ-13
**Commit:** 926bbf7

### Mitdeployed: Security-Header

Beim Pre-Deployment-Check fiel auf, dass `next.config.ts` leer war, obwohl `.claude/rules/security.md` Security-Header vorschreibt. Produktion lieferte bis dahin nur HSTS (von Vercel gesetzt). Ergänzt und mitdeployed:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

Bewusst **keine CSP**: Quests binden beliebige HTTPS-Medien-URLs ein und die Karte lädt OSM-Kacheln — eine sinnvolle CSP müsste `https:` ohnehin freigeben. Vor dem Push mit der vollen E2E-Suite geprüft: 202 bestanden, unverändert gegenüber vorher; Karten-Editor (PROJ-7) explizit getestet.

Das war ein vorbestehender Zustand aller bisherigen Deployments, nicht PROJ-13-spezifisch.

### Post-Deployment-Verifikation (live auf Production)

| Prüfung | Ergebnis |
|---------|----------|
| Routen `/`, `/about`, `/anleitung`, `/play`, `/create` | alle HTTP 200 |
| Security-Header | alle vier live verifiziert (inkl. HSTS) |
| `metadataBase` | löst korrekt auf `https://geoquesty.vercel.app` auf — geteilte Links zeigen jetzt das echte Vorschaubild statt `localhost` |
| Open-Graph je Seite | eigene Titel, Beschreibungen, Bild abrufbar (HTTP 200, `image/png`) |
| JSON-LD | `WebApplication` + `FAQPage` mit 4 Einträgen, Preis 0 EUR |
| Konsolenfehler | keine (WebKit, Desktop + Mobile) |
| Horizontales Scrollen | keines bei 1440px und 390px |
| Navigation `/about` → `/anleitung` | funktioniert |
| Prompt-Auslieferung | vollständig (6956 Zeichen im DOM) |
| Troubleshooting-Accordion | aufklappbar |
| Creator-Einstieg | sichtbar und verlinkt |

### Offen nach dem Deploy

- **Chromium-Test weiterhin ausstehend.** Die lokale Playwright-Chromium-Installation ist defekt; eine Neuinstallation wurde nicht durchgeführt. Verifiziert ist WebKit (Mobile Safari + Desktop-Viewports). Nachzuholen, sobald die Installation repariert ist.
- **Reale Sharing-Vorschau** in WhatsApp/Social ist damit technisch korrekt vorbereitet (absolute Bild-URL erreichbar), aber nicht in einem echten Messenger gegengeprüft.
- **QA-Bugs 1–4** (1 Medium, 3 Low) bleiben offen — siehe QA-Abschnitt. Keiner war deploy-blockierend.
_To be added by /deploy_

---

## Refinement 2026-09-05 — Was sich ändert

Die Seiten sind live, dieses Refinement korrigiert Erscheinungsbild und Navigation. Auslöser waren zwei Rückmeldungen: der Rahmen wirkte gegenüber dem Start-Screen fremd, und mehrere Textabschnitte waren für Maschinen optimiert statt für Leser.

### Zu bauen (`/frontend`)

**Rahmen (`InfoPageShell`) — betrifft alle Info-Seiten**
1. `QuestListBackdrop` entfernen — die Seiten liegen auf demselben ruhigen `bg-gq-black` wie `/`
2. Trennlinie unter dem Header entfernen
3. Pin-Bildmarke links im Header entfernen
4. Burger-Menu unter `sm` mit App, Anleitung, Impressum, Datenschutz; ab `sm` dieselben Links als Textlinks
5. Aktions-Button rechts bleibt „Zur App" → `/`

**`/about`**
6. Meta-Zeile „Für Ersteller · ca. 2 Min Lesezeit" streichen
7. „Für wen" kürzen: ein Satz zur Zielgruppe, vier Anlässe mit je einer Kurzzeile — die drei Fließtext-Absätze entfallen
8. Häufige Fragen wieder als eingeklapptes Accordion; `FAQ`-Konstante und JSON-LD bleiben unverändert die eine Quelle

**Neue Seiten**
9. `/impressum` — Anbieterkennzeichnung nach § 5 DDG
10. `/datenschutz` — lokale Datenhaltung, Standortdaten, Hosting, Reichweitenmessung
11. Beide mit `robots: noindex`, im gleichen Rahmen, nur über Menu/Footer erreichbar

### Bleibt unangetastet
Prompt-Vorlage, Guard-Tests, `/anleitung`-Inhalte, Desktop-Layout bis 1100px, Open-Graph-Metadaten, der Creator-Empty-State-Link und die Root-Route `/`.

### Vor dem Deploy zu klären
Das Impressum braucht echte Angaben vom Betreiber. Platzhalter dürfen nicht live gehen — siehe Open Questions.

### Offene QA-Punkte aus der letzten Runde
Bug 2 (Modelle setzen einen Markdown-Codeblock um die Ausgabe), Bug 3 (`/anleitung` ohne Canonical/Keywords) und Bug 4 (JSON-LD ohne `</script>`-Escaping) sind weiterhin offen und sollten in derselben Runde mitlaufen, da Bug 4 dieselbe Datei betrifft wie Punkt 8.

## Implementation Notes (Frontend — Refinement 2026-09-05)

Alle elf Punkte des Refinements sind umgesetzt.

### Neue Dateien
| Datei | Zweck |
|-------|-------|
| `src/components/info-nav-menu.tsx` | Burger-Menu (einzige Client-Komponente im Rahmen) |
| `src/lib/info-nav.ts` | Die vier Navigationsziele als gemeinsame Konstante |
| `src/app/(info)/impressum/page.tsx` | Anbieterkennzeichnung nach § 5 DDG |
| `src/app/(info)/datenschutz/page.tsx` | Datenschutzerklärung |

### Geänderte Dateien
- `src/components/info-page-shell.tsx` — Backdrop, Trennlinie und Pin-Marke entfernt; Burger-Menu und geteilte Navigations-Konstante eingebunden
- `src/app/(info)/about/page.tsx` — Meta-Zeile entfernt, „Für wen" gekürzt, FAQ als eingeklapptes Accordion, JSON-LD-Escaping

### Abweichungen und Funde

**`InfoPageShell` ist keine Client-Komponente mehr.** Der Backdrop war mit `ssr: false` eingebunden und damit der einzige Grund für `"use client"`. Ohne ihn rendert der gesamte Rahmen serverseitig; nur das Menu ist noch Client-Code.

**Navigations-Konstante liegt in `src/lib/`, nicht in der Menu-Datei.** Erster Versuch war ein Export aus `info-nav-menu.tsx`. Der Build brach beim Prerendering von `/about` ab (`INFO_NAV_LINKS.filter is not a function`): Ein Wert, den eine Server-Komponente aus einem `"use client"`-Modul importiert, kommt als Referenz-Proxy an, nicht als Array. Die Konstante liegt deshalb in einem eigenen, neutralen Modul, das beide Seiten importieren.

**`mix-blend-screen` beim Logo-Lockup entfernt.** Der Trick war gegen den animierten Backdrop abgestimmt; auf dem flachen `bg-gq-black` verschwand die Platte nicht mehr, sondern wurde als sichtbarer Kasten deutlich. Das PNG hat nachweislich keinen Alpha-Kanal (`sips`: `samplesPerPixel: 3, hasAlpha: no`), die Platte ist also nicht wegzurechnen. Das Lockup wird jetzt schlicht gerendert — exakt wie auf `/`, was dem Ziel „gleicher Hintergrund wie die Homepage" entspricht.

**Anlass-Karten unter 400px einspaltig.** Zweispaltig ab `min-[400px]`; bei 360px stößt „Kindergeburtstag" sonst an den Kartenrand, und weiteres Verkleinern der Tech-Schrift ginge auf Kosten der Lesbarkeit.

**Bug 4 aus der QA-Runde miterledigt:** Das JSON-LD wird jetzt mit `.replace(/</g, "\u003c")` serialisiert, bevor es in `dangerouslySetInnerHTML` geht.

### Inhaltliche Grundlage der Rechtstexte
Die Datenschutzerklärung beschreibt nur, was der Code tatsächlich tut — vorher im Code geprüft:
- `localStorage` für Quests und Fortschritt (`src/lib/quest-storage.ts`, `quest-progress.ts`)
- Geolocation ausschließlich clientseitig (`src/hooks/use-geolocation.ts`), keine Übertragung
- Kartenkacheln von `tile.openstreetmap.org` (`src/components/station-map.tsx`) — namentlich genannt
- **Reichweitenmessung:** Zum Zeitpunkt des Refinements war kein Analyse-Werkzeug installiert, der Text nannte daher nur die Server-Protokolle. Direkt im Anschluss wurde Vercel Web Analytics ergänzt — siehe Nachtrag unten.

### Verifikation
- `npm run build` — erfolgreich; alle vier Info-Seiten (`/about`, `/anleitung`, `/impressum`, `/datenschutz`) statisch prerendered
- `npm test` — 167 Tests grün
- `npm run lint` — 0 Fehler (6 vorbestehende Warnungen in unbeteiligten Dateien)
- Playwright (WebKit, iPhone 13), 6 Prüfungen grün: Burger-Menu mit allen vier Links inkl. Schließen bei Navigation, Escape schließt ohne zu navigieren, FAQ eingeklappt bei vollständigem Inhalt in HTML und JSON-LD, kein Backdrop/Trennlinie/Pin-Marke, Rechtstexte mit `noindex`, kein horizontales Scrollen auf allen vier Seiten
- Visuell geprüft bei 360px, 390px und 430px

### Bekannte offene Punkte
- ~~Das Impressum enthält Platzhalter~~ → **Erledigt am 2026-09-05:** Angaben des Betreibers eingetragen (Daniela Oesten, Hamburg); E-Mail zusätzlich als `mailto:`-Link. Bewusst keine Spam-Verschleierung: die üblichen Tricks sind gegen heutige Crawler wirkungslos und § 5 DDG verlangt eine unmittelbar erreichbare Kontaktmöglichkeit.
- Bug 2 (KI umschließt die Ausgabe mit einem Markdown-Codeblock) und Bug 3 (`/anleitung` ohne Canonical/Keywords) aus der QA-Runde sind weiterhin offen; beide betreffen `/anleitung` und waren nicht Teil dieses Refinements.
- Die Rechtstexte sind fachlich nach dem tatsächlichen Verhalten der App verfasst, aber nicht juristisch geprüft.

### Nachtrag: Vercel Web Analytics (2026-09-05)

Auf Nutzerwunsch ergänzt; schließt die Lücke zu den Success Metrics der PRD („Nutzungszahlen sichtbar via Vercel Analytics"), die bis dahin unerfüllt waren.

- `@vercel/analytics` (2.0.1) installiert, `<Analytics />` aus `@vercel/analytics/next` in `src/app/layout.tsx` eingebunden
- Datenschutzerklärung um den Abschnitt **Reichweitenmessung** erweitert: erhobene Angaben, keine Cookies, keine Kennungen, kein geräteübergreifendes Profil, Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO
- Überschrift „Keine Konten, keine Werbung, kein Tracking" zu „… keine Profile" korrigiert und der Absatz nachgezogen — die absolute Aussage stimmte mit aktiver Messung nicht mehr
- Meta-Description der Seite („kurz gefasst: gar nicht") entsprechend korrigiert

**Verifiziert:** Build erfolgreich, alle Seiten weiterhin statisch; 167 Tests grün; Lint fehlerfrei. Im Dev-Server wird erwartungsgemäß kein Insights-Skript ausgeliefert, im Produktions-Bundle ist der `/_vercel/insights`-Endpunkt enthalten. Nach dem Laden der Seite sind **keine Cookies** gesetzt (per Playwright geprüft) — die Aussage im Text ist damit belegt.

**Offen:** Das Skript injiziert nur bei gesetztem `VERCEL_ENV`, also erst auf Vercel selbst. Dass tatsächlich Daten im Dashboard ankommen, lässt sich lokal nicht prüfen und muss nach dem Deploy verifiziert werden. Web Analytics muss dafür im Vercel-Projekt zusätzlich aktiviert sein.

## QA Test Results — Refinement (2026-09-05, zweite Runde)

**Getestet am:** 2026-09-05
**Testumgebung:** WebKit / Mobile Safari (iPhone 13) via Playwright; Viewports 360 / 390 / 430 / 768 / 1440 px; Produktions-Build (`npm run start`); Vitest
**Ergebnis:** 13 von 13 neuen Acceptance Criteria bestanden · 4 Bugs gefunden (0 Critical, 0 High, 3 Medium, 1 Low) — 2 behoben, 2 bewusst offen gelassen
**Produktionsreif:** **JA** — keine Critical- oder High-Bugs

### Acceptance Criteria (Refinement)

| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Gleicher ruhiger Hintergrund wie `/` | bestanden (Body-Hintergrund identisch geprüft) |
| 2 | Keine Trennlinie zum Header | bestanden (`border-bottom-width: 0px`) |
| 3 | Keine Pin-Bildmarke im Header | bestanden (alle vier Seiten) |
| 4 | Burger-Menu mit vier Zielen | bestanden |
| 5 | Menu schließt bei Navigation | bestanden |
| 6 | Escape schließt ohne zu navigieren | bestanden |
| 7 | Fokus im Menu, `aria-expanded` am Auslöser | bestanden |
| 8 | `/impressum` nach § 5 DDG | bestanden |
| 9 | `/datenschutz` mit lokalen Daten, Standort, Hosting | bestanden |
| 10 | „Für wen" gekürzt | bestanden |
| 11 | Keine Zielgruppen-/Lesezeit-Zeile | bestanden |
| 12 | FAQ eingeklappt | bestanden |
| 13 | FAQ-Inhalte vollständig in HTML und JSON-LD | bestanden |

### Automatisierte Tests
- **Neu:** `tests/proj-13-info-refinement.spec.ts` — 22 Tests, alle grün
- **Unit:** 167 Tests grün
- **Gesamt-E2E (WebKit):** 213 bestanden, 18 fehlgeschlagen, 2 übersprungen

### Security-Audit (Red Team)

| Prüfung | Ergebnis |
|---------|----------|
| Security-Header in Produktion | X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy gesetzt |
| JSON-LD-Escaping (Bug 4 der Vorrunde) | **geschlossen** — ausgeliefertes JSON-LD enthält kein rohes `<` |
| XSS über URL-Parameter | nicht reflektiert, keine Injektion möglich |
| Secrets/Keys im HTML | keine gefunden |
| Cookies nach Seitenaufruf | **keine** — Zusage der Datenschutzerklärung belegt |
| localStorage auf Info-Seiten | leer |
| `noindex` auf Rechtstexten | gesetzt (`noindex, follow`) |
| Externe Requests | Google Fonts (siehe Bug 1), Vercel Insights |

### Bugs

**Bug 1 — Google Fonts fehlen in der Datenschutzerklärung (Medium) — BEHOBEN am 2026-09-05**
Reproduktion: `/about` laden, Netzwerk-Requests beobachten → Anfragen an `fonts.googleapis.com` und `fonts.gstatic.com`.
Ursache: `src/app/globals.css:1` importiert die Schriften direkt von Google; es liegen keine lokalen Font-Dateien unter `public/`.
Auswirkung: Die IP-Adresse jedes Besuchers wird an Google übertragen. Die neue Datenschutzerklärung erwähnt das nicht — sie ist damit unvollständig, obwohl sie externe Einbindungen (Karten, Medien) sonst sauber auflistet. In Deutschland ist genau diese Konstellation abgemahnt worden (LG München I, 3 O 17493/20).
Hinweis: Betrifft die gesamte App, nicht nur dieses Refinement.
**Behebung (Ursache, nicht Symptom):** Schriften auf `next/font/google` umgestellt — sie werden zur Build-Zeit heruntergeladen und von der eigenen Domain ausgeliefert. Der `@import` von `fonts.googleapis.com` in `globals.css` ist entfallen, Tailwind und CSS greifen auf die von `next/font` gesetzten Variablen zu. Gewichte dabei auf die tatsächlich genutzten (400–700) begrenzt; 300 und 900 waren ungenutzt.
**Verifiziert:** 10 `.woff2`-Dateien liegen im Build unter `.next/static/media/`, keine Google-Referenz im Build-Output, und beim Laden von `/`, `/about`, `/impressum` und `/datenschutz` gehen **0 externe Requests** hinaus (vorher 4). Schriftbild unverändert (visuell geprüft). Die Datenschutzerklärung hat einen Abschnitt „Schriftarten", der die Selbst-Auslieferung ausdrücklich zusichert.

**Bug 2 — Schließen-Button im Burger-Menu ist 16×16px (Medium)**
Reproduktion: Menu auf Mobilgerät öffnen, Schließen-Kreuz oben rechts messen → 16×16px statt der geforderten 44px.
Ursache: stammt aus der unveränderten shadcn/ui-`Sheet`-Komponente.
Auswirkung: verstößt gegen die PRD-Vorgabe „min. 44px Touch-Targets". Entschärft dadurch, dass Escape, Tippen daneben und jeder Menüeintrag das Menu ebenfalls schließen — der Nutzer sitzt nicht fest.
**Entscheidung (2026-09-05):** Bleibt bewusst unverändert und wird als bekannt dokumentiert. Der Vorschlag, `sheet.tsx` global auf 44px zu heben (was auch den Modul-Editor aus PROJ-8 mit erfasst hätte), wurde abgelehnt. Bei einer künftigen app-weiten Touch-Target-Runde mit zu berücksichtigen.

**Bug 3 — Bestehender PROJ-13-Test veraltet nach dem Refinement (Medium) — BEHOBEN am 2026-09-05**
Reproduktion: `npm run test:e2e` → `tests/proj-13-landing-page.spec.ts:9` schlägt fehl, erwartet die Überschrift „Typische Anlässe".
Ursache: Die Überschrift entfiel beim Kürzen des „Für wen"-Abschnitts; der bestehende Regressionstest wurde nicht mitgezogen.
Auswirkung: Kein Produktfehler — die Seite verhält sich korrekt. Aber die Suite ist rot, was künftige echte Regressionen verdeckt.
**Behebung:** Assertion auf den tatsächlichen Inhalt der gekürzten Fassung umgestellt (Zielgruppen-Satz plus Anlass-Definitionsliste), mit Kommentar auf das Refinement-Datum.

**Bug 4 — Rechtstexte sprechen von „wir" bei einer Einzelperson (Low)**
Impressum und Datenschutz formulieren durchgehend „wir"/„uns", obwohl als Anbieter eine natürliche Person eingetragen ist. Rechtlich unbedenklich, wirkt bei einem erkennbaren Privatprojekt aber unstimmig. Rein kosmetisch.
**Entscheidung (2026-09-05):** Bleibt bei „wir" — bewusst so gewählt, kein Handlungsbedarf.

### Bekannte Vorbelastungen (nicht durch dieses Refinement verursacht)
- 17 der 18 E2E-Fehlschläge betreffen PROJ-1, PROJ-3 und PROJ-11 auf Mobile Safari und bestanden bereits vorher (siehe separates Follow-up).
- Bug 2 und Bug 3 der ersten QA-Runde (`/anleitung`: Markdown-Codeblock im KI-Output, fehlende Canonical/Keywords) sind weiterhin offen, beide Low.

### Nicht abgedeckt
- **Cross-Browser auf Chromium und Firefox.** Die Binaries fehlen auf diesem Rechner, die Installation wurde nicht durchgeführt. Getestet wurde ausschließlich WebKit (Safari-Engine). Chrome- und Firefox-spezifische Abweichungen — insbesondere beim Sheet-Fokusverhalten — sind damit ungeprüft.
- **Realer Datenfluss zu Vercel Analytics.** Lokal wird ein Insights-Request abgesetzt; ob im Dashboard Zahlen ankommen, ist erst nach dem Deploy verifizierbar.

### Nachtrag: Bug-Behebung und Nachtest (2026-09-05)

| Bug | Schwere | Status |
|-----|---------|--------|
| 1 — Google Fonts nicht ausgewiesen | Medium | **Behoben** — Schriften selbst-gehostet, 0 externe Requests |
| 2 — Schließen-Button 16px | Medium | Bewusst offen (Nutzerentscheidung), entschärft durch Escape/Tippen daneben/Menüeinträge |
| 3 — Veralteter PROJ-13-Test | Medium | **Behoben** — Assertion nachgezogen |
| 4 — „wir" bei Einzelperson | Low | Bewusst offen (Nutzerentscheidung) |

**Nachtest nach den Änderungen:**
- E2E (WebKit): **236 bestanden**, 17 fehlgeschlagen, 2 übersprungen — die 17 sind ausschließlich die bekannten Vorbelastungen aus PROJ-1/3/11; der PROJ-13-Fehlschlag ist weg (vorher 213/18)
- Unit: 167 Tests grün · Lint: 0 Fehler · Build erfolgreich
- Netzwerk: 0 externe Requests über alle vier Info-Seiten und `/` hinweg (vorher 4 an Google)
- Schriftbild visuell unverändert

**Produktionsreif: JA.** Keine Critical- oder High-Bugs; die beiden verbleibenden Medium/Low-Punkte sind bewusst getroffene Entscheidungen, keine ungelösten Fehler.

## Deployment — Refinement (2026-09-05)

**Production URL:** https://geoquesty.vercel.app
**Deployed:** 2026-09-05
**Commit:** `b6d3bc4`
**Neue Routen:** `/impressum`, `/datenschutz`

### Pre-Deployment
| Prüfung | Ergebnis |
|---------|----------|
| `npm run build` | erfolgreich, alle Info-Seiten statisch prerendered |
| `npm run lint` | 0 Fehler (6 vorbestehende Warnungen) |
| `npm test` | 167 Tests grün |
| QA-Freigabe | Approved, keine Critical/High-Bugs |
| Secrets im Repo | keine — nur `.env.local.example` getrackt |

### Post-Deployment-Verifikation (live geprüft)
| Prüfung | Ergebnis |
|---------|----------|
| `/impressum`, `/datenschutz` | HTTP 200, korrekte Inhalte |
| Impressum-Angaben | echte Daten, **keine Platzhalter** live |
| `noindex` auf Rechtstexten | `noindex, follow` gesetzt |
| Security-Header | X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS (preload) |
| **Externe Requests** | **0** über `/`, `/about`, `/anleitung`, `/impressum`, `/datenschutz` |
| Google Fonts | 0 Referenzen — Selbst-Auslieferung greift in Produktion |
| Cookies | **keine** — Zusage der Datenschutzerklärung live belegt |
| Konsolenfehler | keine |
| Burger-Menu | alle vier Links vorhanden und funktionsfähig |
| FAQ | eingeklappt wie spezifiziert |

### Offener Punkt: Vercel Analytics
Web Analytics ist im Vercel-Projekt aktiviert — der Endpunkt `/_vercel/insights/script.js` liefert ein gültiges Skript (HTTP 200, 1,5 KB gzip), und im Browser existieren `window.va` und `window.vaq`. Die Komponente läuft also.

**Es ließ sich jedoch kein abgesetztes Analytics-Beacon beobachten.** Getestet wurde mit headless WebKit ohne echte Nutzerinteraktion; plausibel ist, dass der Pageview unter diesen Bedingungen nicht ausgelöst oder verzögert gesendet wird. Ob tatsächlich Daten ankommen, ist **im Vercel-Dashboard zu prüfen**, idealerweise nach einem Besuch mit einem echten Gerät. Sollten nach ein bis zwei Tagen keine Zahlen erscheinen, ist die Ursache dort zu suchen — im ausgelieferten Code ist die Einbindung nachweislich vorhanden.
