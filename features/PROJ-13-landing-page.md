# PROJ-13: Landing Page mit App-Link & KI-Anleitung

## Status: In Progress
_Refinement 4 (`/about` als Marketing-Landingpage) ist am 2026-09-08 gebaut, im Browser verifiziert und testabgedeckt — QA steht aus. Refinement 3 (gemeinsames Burger-Menu) ist deployed und verifiziert._
**Created:** 2026-09-04
**Last Updated:** 2026-09-08 (Refinement 4 — Frontend umgesetzt)

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
- **Spieler-orientiertes Marketing** — die Seite adressiert primär Ersteller; Spieler kommen über direkte Quest-Links in die App. **Bestätigt in Refinement 4 (2026-09-07):** Die neue Copy duzt durchgehend, meint damit aber den Ersteller. Kinder und Jugendliche bleiben eine von vier Zielgruppen, nicht der Hauptadressat
- **Mehrsprachigkeit** — Seite ist ausschließlich deutsch, wie die gesamte App
- **Quest-Bibliothek / Beispiel-Quests zum Download** — laut PRD Non-Goal (keine zentrale Quest-Bibliothek)
- **Änderung der Root-Route `/`** — der bestehende Mode-Switch bleibt unangetastet
- **Ko-fi-Anbindung** — der Aktions-Button im Header bleibt vorerst „Zur App"; der Wechsel auf einen Unterstützungslink ist bewusst vertagt (siehe Open Questions)
- **Rechtsberatung / juristische Prüfung der Texte** — Impressum und Datenschutzerklärung entstehen als sachlich korrekte Beschreibung der tatsächlichen Verarbeitung, ersetzen aber keine anwaltliche Prüfung
- **Cookie-Banner / Consent-Management** — die App setzt keine einwilligungspflichtigen Cookies; falls sich das durch ein späteres Tool ändert, ist das ein eigenes Feature
- ~~**Burger-Menu in den App-Screens** — das Menu gehört zu den Info-Seiten; `/`, `/play` und `/create` bleiben unverändert~~ → **Aufgehoben am 2026-09-06:** Das Menu wird zur app-weiten Navigation und zieht nach PROJ-1 um. Die Info-Seiten binden künftig dieselbe Komponente ein, statt eine eigene zu besitzen

## Seitenaufbau

Das Feature besteht aus **zwei zusammengehörenden statischen Seiten**, die gemeinsam gebaut und deployed werden. Grund für die Trennung: Sie bedienen zwei verschiedene Momente — „Was ist das?" und „Ich will jetzt eine Quest bauen". In einer Seite vereint müsste der Nutzer erst an Marketing vorbeiscrollen, bevor er zur Prompt-Vorlage kommt.

### Seite 1: `/about` — Marketing-Landingpage

_Neu gefasst in Refinement 4 (2026-09-07). Die vollständige Copy steht im Abschnitt „Refinement 4" am Ende dieser Spec._

1. **Hero** — „Die reale Welt wird zum Spielfeld.", Subline mit „GPS-Rallye", „Kostenlos. Ohne Abo. Ohne Account.", zwei CTAs (`Quest erstellen` → `/create`, `Mit KI bauen` → `/anleitung`)
2. **Draußen spielen. Wie ein Game.** — der emotionale Hook
3. **Jeder Ort kann ein Level sein.** — fünf Orte als visuelle Reihe, Erklärung wie eine Quest entsteht, Merkzeile „Die Welt ist deine Spielkarte."
4. **Nicht nur spielen. Selber machen.** — Game-Designer-Gedanke, kein Vorwissen nötig
5. **Eine Quest erstellen? Ganz einfach.** — drei nummerierte Schritte
6. **Für wen ist Geo Quest?** — vier Zielgruppen-Karten (Familien, Schule & Pädagogik, Kinder & Jugendliche, Gruppen & Events)
7. **Häufige Fragen** — eingeklapptes Accordion, gespiegelt im JSON-LD; vier bestehende Fragen plus neu „Was kann ich in eine Quest einbauen?"
8. **Abschluss-CTA** — „Deine Umgebung. Dein Abenteuer." mit Button nach `/create`

**Vokabular:** „GPS-Rallye" steht ausschließlich im Hero und holt den Besucher in seiner Suchsprache ab; ab Sektion 2 heißt es durchgehend „Quest" — dieselbe Sprache, die ihn in der App erwartet. „Schnitzeljagd" bleibt in Meta-Title, Keywords und JSON-LD.

_Vorherige Fassung (bis 2026-09-07): Hero „Draußen ist das Spielfeld." → Features → Für wen/vier Anlässe → Abgrenzung → FAQ → Abschluss-CTA nach `/anleitung`. Die Sektionen „Was drin steckt" und „Der Unterschied" entfallen mit diesem Refinement ersatzlos; der Inhalt der Feature-Karten lebt in der fünften FAQ-Frage weiter._

### Seite 3: `/impressum` und Seite 4: `/datenschutz` — Rechtstexte
Zwei schlanke Textseiten im gleichen Rahmen wie `/about` und `/anleitung`. Sie existieren, weil das Burger-Menu sie verlinkt und weil eine öffentlich geteilte Seite in Deutschland eine Anbieterkennzeichnung braucht.

- **`/impressum`** — Anbieterkennzeichnung nach § 5 DDG: Name, Anschrift, Kontakt, Verantwortlicher für den Inhalt
- **`/datenschutz`** — Datenschutzerklärung passend zur tatsächlichen Verarbeitung: keine Accounts, keine Server-Speicherung von Quests (alles im Browser), Standortdaten verlassen das Gerät nicht, Hosting bei Vercel, Reichweitenmessung via Vercel Analytics, externe Medien-URLs in Quests

Beide Seiten werden von Suchmaschinen nicht indexiert (`robots: noindex`) und tauchen nicht in der Desktop-Hauptnavigation auf — nur im Burger-Menu und optional im Footer.

### Navigation (alle Info-Seiten)
Der Header trägt keine Trennlinie zum Seiteninhalt und keine Bildmarke links. Rechts stehen:

- **Desktop (ab `sm`)** — Textlinks „Anleitung", „Impressum", „Datenschutz" plus der Aktions-Button rechts außen
- **Mobile (unter `sm`)** — der Aktions-Button plus ein **Burger-Menu** mit den Links App, Anleitung, Impressum, Datenschutz

**Refinement 3 (2026-09-06) — gemeinsames Menu mit der App:** Das Burger-Menu der Info-Seiten war bis hierhin ein Sonderfall — nur diese vier Seiten hatten überhaupt eine Navigation, die App-Screens dagegen nur eine Pin-Marke zum Startscreen. Mit PROJ-1 wird daraus **eine** Navigation für die gesamte App: dieselbe `AppNavMenu`-Komponente, dieselben drei Gruppen **App** (Play, Create) / **Info** (Über, Anleitung) / **Rechtliches** (Impressum, Datenschutz), jeder Link mit Icon.

Für die Info-Seiten ändert sich dadurch:
- Die eigene `InfoNavMenu` entfällt und wird durch `AppNavMenu` ersetzt — mit sechs statt vier Zielen und mit Gruppen-Überschriften
- Die Desktop-Zeile bleibt unverändert bestehen: Textlink „Anleitung" plus Aktions-Button „Zur App". Das Burger steht am Desktop daneben, statt wie bisher ab `sm` ausgeblendet zu werden — nur so sind Play und Create auch vom Laptop aus mit einem Tap erreichbar
- Der Sticky-Header der Info-Seiten **bleibt** sticky. Die App-Screens verlieren ihren (PROJ-1), diese hier nicht: es sind lange Fließtext-Seiten, auf denen der Weg zurück nach oben weit ist
- Der Zurückpfeil bleibt links, das Menu rechts — die Aufteilung, die die Info-Seiten schon haben, wird zum app-weiten Standard

Der Aktions-Button rechts außen zeigt vorerst weiterhin „Zur App" und führt auf `/`. Er ist als Platzhalter für einen späteren Ko-fi-Unterstützungslink vorgesehen (siehe Open Questions) — die Position bleibt, das Ziel ändert sich später.

**Zurückpfeil:** Jede Unterseite trägt links im Header einen Zurückpfeil nach `/about`. Bisher hatte nur `/anleitung` einen; `/impressum` und `/datenschutz` gingen leer aus, obwohl der Rahmen das bereits konnte.

### Footer (Nachtrag Refinement 2)

Alle Info-Seiten bekommen einen gemeinsamen Footer mit:
- **Kontakt** — Name des Anbieters und die E-Mail-Adresse als `mailto:`-Link
- **Rechtslinks** — Impressum und Datenschutz

Die vollständige Anschrift bleibt bewusst dem Impressum vorbehalten und wird nicht auf jeder Seite wiederholt.

Mit dem Footer verlassen die Rechtslinks die Textlink-Reihe im Desktop-Header — dort stehen dann nur noch „Anleitung" und der Aktions-Button. Im mobilen Burger-Menü bleiben alle vier Ziele erhalten, damit auf dem Handy niemand erst bis zum Seitenende scrollen muss.

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

### Zurückpfeil & Footer (Refinement 2, 2026-09-05)
- [x] Angenommen ein Nutzer ist auf `/impressum` oder `/datenschutz`, wenn er den Header betrachtet, dann sieht er links einen Zurückpfeil wie auf `/anleitung`
- [x] Angenommen ein Nutzer klickt den Zurückpfeil auf einer der beiden Rechtsseiten, dann gelangt er nach `/about`
- [x] Angenommen ein Nutzer scrollt auf einer beliebigen Info-Seite ans Ende, dann findet er einen Footer mit Anbietername, E-Mail-Adresse sowie Links zu Impressum und Datenschutz
- [x] Angenommen ein Nutzer klickt die E-Mail-Adresse im Footer, dann öffnet sich sein Mail-Programm mit der Adresse als Empfänger
- [x] Angenommen ein Nutzer betrachtet den Footer, dann steht dort **keine** Postanschrift — diese bleibt dem Impressum vorbehalten
- [x] Angenommen ein Nutzer öffnet eine Info-Seite am Desktop, wenn er die Header-Zeile betrachtet, dann stehen dort keine Links mehr zu Impressum und Datenschutz
- [x] Angenommen ein Nutzer öffnet das Burger-Menü auf dem Handy, dann sind weiterhin alle vier Ziele (App, Anleitung, Impressum, Datenschutz) enthalten

### Gemeinsames Menu mit der App (Refinement 3, 2026-09-06)
- [ ] Angenommen ein Nutzer öffnet das Burger-Menu auf einer Info-Seite, wenn es erscheint, dann ist es dasselbe Menu wie in der App: drei Gruppen (App, Info, Rechtliches) mit insgesamt sechs Links, jeder mit Icon
- [ ] Angenommen ein Nutzer ist auf `/about` oder `/anleitung` am Laptop (ab `sm`), wenn er die Header-Zeile betrachtet, dann sieht er weiterhin den Textlink „Anleitung" und den Button „Zur App" — und zusätzlich das Burger-Menu
- [ ] Angenommen ein Nutzer öffnet das Menu von einer Info-Seite aus, wenn er „Play" oder „Create" antippt, dann landet er direkt im jeweiligen App-Modus, ohne den Umweg über den Startscreen
- [ ] Angenommen ein Nutzer ist auf `/impressum`, wenn er das Menu öffnet, dann ist der Eintrag „Impressum" als aktuelle Seite erkennbar
- [ ] Angenommen ein Nutzer scrollt eine Info-Seite nach unten, wenn er scrollt, dann bleibt die Kopfzeile weiterhin am oberen Rand stehen — anders als auf den Play- und Create-Screens
- [ ] Angenommen die `InfoNavMenu` wurde durch `AppNavMenu` ersetzt, wenn die Info-Seiten gerendert werden, dann verhalten sich Escape, Klick daneben, Fokus-Falle und `aria-expanded` unverändert wie zuvor
- [x] Angenommen ein Nutzer betrachtet den Footer auf einem Mobilgerät (360–430px), dann sind alle Links mindestens 44px hoch antippbar und nichts läuft über den Rand

### Neue `/about`-Landingpage (Refinement 4, 2026-09-07)
- [ ] Angenommen ein Besucher öffnet `/about`, wenn die Seite lädt, dann lautet die Hauptüberschrift „Die reale Welt wird zum Spielfeld." und darunter steht die Zeile „Kostenlos. Ohne Abo. Ohne Account." als eigenständige, hervorgehobene Zeile
- [ ] Angenommen ein Besucher ist im Hero-Bereich, wenn er den primären Button „Rallye erstellen" klickt, dann gelangt er direkt nach `/create` — ohne Zwischenstopp auf dem Mode-Switch `/`
- [ ] Angenommen ein Besucher ist im Hero-Bereich, wenn er den sekundären Button „Mit KI bauen" klickt, dann gelangt er nach `/anleitung`
- [ ] Angenommen ein Besucher scrollt `/about` von oben nach unten, wenn er die Sektionen zählt, dann sind es genau acht, in dieser Reihenfolge: Hero → Draußen spielen. Wie ein Game. → Jeder Ort kann ein Level sein. → Nicht nur spielen. Selber machen. → Eine Quest erstellen? Ganz einfach. → Für wen ist Geo Quest? → Häufige Fragen → Abschluss-CTA
- [ ] Angenommen ein Besucher liest die Sektion „Jeder Ort kann ein Level sein", wenn er die Orte betrachtet, dann sind die fünf Orte (Park, Stadt, Schulhof, Wanderweg, Viertel) als eigenständige visuelle Elemente gesetzt und nicht als Aufzählung im Fließtext
- [ ] Angenommen ein Besucher liest dieselbe Sektion zu Ende, wenn er die letzte Zeile liest, dann steht dort „Die Welt ist deine Spielkarte." als abschließende Merkzeile
- [ ] Angenommen ein Besucher liest die Sektion „Eine Quest erstellen? Ganz einfach.", wenn er Schritt 03 liest, dann ist vom Weitergeben als Datei die Rede — nicht von einem Teilen-Link, den die App nicht anbietet
- [ ] Angenommen ein Besucher liest „Für wen ist Geo Quest?", wenn die Sektion lädt, dann sieht er genau vier Zielgruppen-Karten (Familien, Schule & Pädagogik, Kinder & Jugendliche, Gruppen & Events), jede mit Emoji und Kurztext
- [ ] Angenommen ein Besucher liest die Karte „Für Schule & Pädagogik", dann findet er dort den Lernpfad-Gedanken inklusive Fachbeispielen — ohne dass dafür eine eigene Sektion existiert
- [ ] Angenommen ein Besucher erreicht das Seitenende, wenn er den Abschluss-CTA liest, dann lautet die Überschrift „Deine Umgebung. Dein Abenteuer." und der Button führt nach `/create`
- [ ] Angenommen ein Besucher liest den Hero, wenn er die Subline betrachtet, dann steht dort „GPS-Rallye" — der einzige Ort der Seite, an dem das Wort „Rallye" vorkommt
- [ ] Angenommen ein Besucher liest die Seite ab Sektion 2 vollständig durch, wenn er auf Begriffe achtet, dann heißt es überall „Quest" und an keiner Stelle mehr „Rallye" — auch die Buttons heißen „Quest erstellen"
- [ ] Angenommen ein Besucher liest den Hero, wenn er den Wechsel von „GPS-Rallye" zu „Quest" bemerkt, dann gibt es dazu **keinen** erklärenden Satz — die Verknüpfung bleibt implizit
- [ ] Angenommen ein Besucher sucht auf `/about` nach den Sektionen „Was drin steckt" oder „Der Unterschied", dann existieren beide nicht mehr
- [ ] Angenommen ein Besucher öffnet die Häufigen Fragen, wenn er sie zählt, dann sind es fünf — die vier bisherigen wörtlich unverändert plus „Was kann ich in eine Quest einbauen?"
- [ ] Angenommen ein Crawler oder KI-System wertet `/about` aus, wenn es die fünfte FAQ-Antwort liest, dann findet es dort die fünf Modultypen, die drei Aufgabentypen und die GPS-Navigation — also den vollständigen Inhalt der gestrichenen Feature-Karten, auch im `FAQPage`-JSON-LD
- [ ] Angenommen ein Besucher sucht auf der Seite nach einer Zeitangabe zum Erstellen, dann findet er sie ausschließlich in der eingeklappten FAQ-Antwort, nicht im sichtbaren Marketing-Text
- [ ] Angenommen ein Suchmaschinen-Crawler wertet `/about` aus, wenn er die Metadaten liest, dann enthält der Title weiterhin „Schnitzeljagd" und die Keyword-Liste zusätzlich „GPS-Rallye", „Rallye erstellen" und „Lernpfad draußen"
- [ ] Angenommen ein Besucher öffnet `/about` auf einem Mobilgerät (360–430px), wenn er die gesamte Seite durchscrollt, dann ist alles lesbar ohne horizontales Scrollen, alle Touch-Targets sind ≥ 44px und die Emoji der Zielgruppen-Karten brechen das Layout nicht
- [ ] Angenommen ein Besucher öffnet `/about` am Desktop (ab 1024px), wenn die Seite lädt, dann nutzen die mehrteiligen Sektionen (Orte, Schritte, Zielgruppen) die Breite mehrspaltig, ohne dass Textzeilen überdehnen
- [ ] Angenommen ein Besucher scrollt die ganze Seite durch, wenn er auf die Darstellungsformen achtet, dann wechseln sie durchgehend ab (Text → Text → Chips → Text → Schritte → Karten → Accordion → Box) — nie zweimal dieselbe Form hintereinander
- [ ] Angenommen ein Nutzer öffnet `/anleitung`, `/impressum` oder `/datenschutz`, wenn die Seiten laden, dann sind sie durch dieses Refinement unverändert
- [ ] Angenommen ein Nutzer betrachtet den Header von `/about`, wenn er nach rechts schaut, dann steht dort weiterhin der Button „Zur App" sowie das Burger-Menu — beides unverändert aus Refinement 3

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
- [x] ~~Sollen die beiden Seiten zusätzlich einen Einstieg außerhalb des Creator-Empty-States bekommen (z.B. dauerhaft im Creator-Header), sobald ein Nutzer bereits Quests hat?~~ → Ja, gelöst am 2026-09-06: Das app-weite Burger-Menu (PROJ-1) enthält unter „Info" die Links Über und Anleitung und ist auf jedem Screen erreichbar — auch im Creator mit bestehenden Quests
- [x] ~~Warum sind die Häufigen Fragen ausgeklappt statt als Accordion?~~ → Ursprünglich für bessere Auffindbarkeit durch KI-Systeme ausgeklappt. Annahme war falsch: Accordion-Inhalte stehen vollständig im HTML (Radix blendet sie nur per `hidden` aus) und das `FAQPage`-JSON-LD trägt die Antworten ohnehin. Zurück zum eingeklappten Accordion (2026-09-05)
- [ ] Wann und wohin genau zeigt der Ko-fi-Link? Der Header-Button bleibt bis dahin „Zur App"; offen sind Ziel-URL, Beschriftung und ob „Zur App" dann in die Navigation rutscht. **Ergänzung 2026-09-06:** Mit Play und Create im Burger-Menu wäre „Zur App" als Button entbehrlich — der Platz könnte früher als gedacht an Ko-fi gehen
- [x] ~~Braucht `/about` zusätzlich einen Footer mit Impressum/Datenschutz für Desktop-Besucher?~~ → Ja, entschieden am 2026-09-05: Footer auf allen Info-Seiten mit Kontakt und Rechtslinks; die Links verlassen dafür den Desktop-Header
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
| Footer mit Kontakt und Rechtslinks auf allen Info-Seiten | Rechtstexte gehören konventionell in den Fuß, nicht in die Kopfzeile; dort konkurrierten sie mit den inhaltlichen Zielen. Besucher suchen Impressum und Datenschutz zuerst unten | 2026-09-05 |
| Footer zeigt Name und E-Mail, aber keine Anschrift | Die Postanschrift auf jeder Seite zu wiederholen, streut die Privatadresse des Betreibers unnötig breit; für die Impressumspflicht genügt die verlinkte Seite | 2026-09-05 |
| Zurückpfeil führt fest nach `/about`, nicht über die Browser-History | Vorhersagbares Ziel und konsistent mit `/anleitung`; ein History-basierter Pfeil verhält sich je nach Herkunft anders und läuft bei direktem Aufruf ins Leere | 2026-09-05 |
| Rechtslinks bleiben trotz Footer im Burger-Menü | Auf dem Handy müsste man sonst durch die ganze Seite scrollen, um ans Impressum zu kommen. Die Doppelung kostet nichts und erspart die Suche | 2026-09-05 |
| Das Burger-Menu wird von den Info-Seiten zur app-weiten Navigation befördert (Umzug nach PROJ-1) | Es war der einzige Ort in der ganzen App mit einer echten Navigation — und ausgerechnet auf den Seiten, die man am seltensten besucht. Wer in `/play/[id]` oder `/create/[id]` steckte, hatte gar keine. Zwei getrennte Menüs zu pflegen hätte sie garantiert auseinanderlaufen lassen | 2026-09-06 |
| Desktop-Textlinks und „Zur App"-Button bleiben trotz Burger stehen | Am Laptop ist Platz vorhanden, und die Zeile ist die etablierte Erwartung an eine Webseite. Der Aktions-Button bleibt zudem der reservierte Ko-fi-Platz — er darf nicht in einem Menu verschwinden | 2026-09-06 |
| Burger auf den Info-Seiten künftig auch ab `sm` sichtbar (nicht mehr `sm:hidden`) | Mit Play und Create im Menu enthält es jetzt Ziele, die die Desktop-Zeile nicht abbildet. Wäre es am Desktop ausgeblendet, käme ein Laptop-Besucher von `/impressum` nicht direkt in den Creator | 2026-09-06 |
| Info-Seiten behalten ihren Sticky-Header, App-Screens verlieren ihn | Unterschiedliche Inhalte: Info-Seiten sind lange Fließtexte, bei denen der Weg nach oben weit ist. Play und Create sind kurze Listen auf 430px, wo ein klebender Header nur Inhalt verdeckt | 2026-09-06 |
| Impressum und Datenschutz laufen im Light-Theme, `/about` und `/anleitung` bleiben dunkel | Die beiden Rechtstexte werden gelesen, nicht inszeniert — heller Grund ist für längere Fließtexte die ruhigere Lesefläche. Sie tragen ohnehin `robots: noindex` und sind damit auch nicht als Marketing-Fläche gedacht. `/about` und `/anleitung` bleiben die öffentliche Eingangstür und behalten den Gaming-Look aus dem PRD | 2026-09-06 |
| `/about` wird zur Marketing-Landingpage umgetextet, statt eine zweite Seite anzulegen | Zwei Marketing-Seiten müssten beide gepflegt werden und würden im Suchergebnis gegeneinander antreten. `/about` ist bereits die Route, die geteilt und verlinkt wird — sie muss die Arbeit leisten, nicht eine neue daneben | 2026-09-07 |
| Zielgruppe bleibt der Ersteller (Erwachsene), trotz jugendlicher Tonalität | Der Ton der neuen Copy ist jung, der Adressat bleibt aber, wer die Rallye baut und wer nach so einer App sucht: Eltern, Lehrkräfte, Jugendleiter. Kinder kommen über den geteilten Quest-Link in die App, nicht über eine Landingpage. „Spieler-orientiertes Marketing" bleibt daher Out of Scope | 2026-09-07 |
| ~~„Rallye" in der Seiten-Copy, „Quest" in der App, „Schnitzeljagd" in den Metadaten~~ → **revidiert am selben Tag** | Ursprünglich sollte die gesamte Landingpage „Rallye" sagen. Das hätte einen Bruch erzeugt: Wer nach einer Seite voller *Rallyes* auf `/create` klickt, liest dort überall *Quest* und muss selbst übersetzen — ausgerechnet im Moment des Übergangs, den die Seite vorbereiten soll | 2026-09-07 |
| Der Hero sagt einmal „GPS-Rallye", ab Sektion 2 heißt es durchgehend „Quest" | Die Übersetzung findet auf der Seite statt statt an der Schwelle zur App. „GPS-Rallye" holt den Besucher in seiner Suchsprache ab; wer unten ankommt, denkt bereits in Quests und findet in der App genau das wieder. Buttons heißen entsprechend „Quest erstellen" | 2026-09-07 |
| Die Verknüpfung Rallye/Quest bleibt implizit, ohne Erklärsatz | Der Leser stellt sie selbst her, wie er es bei „Schnitzeljagd" auch tut. Ein Satz wie „in Geo Quest heißt das Quest" würde an der wichtigsten Stelle der Seite Tempo kosten und den Leser für etwas belehren, das er ohnehin versteht | 2026-09-07 |
| Drei Textdopplungen der Vorlage werden zusammengeführt statt einzeln umgesetzt | „Aus einem Ort wird ein Abenteuer" und „Jeder Ort kann ein Level sein" sagen dasselbe; ebenso „Jeder kann eine Rallye erstellen" und „Nicht nur spielen. Selber machen.". Dreimal an derselben Aussage vorbeizuscrollen schwächt sie, statt sie zu verstärken | 2026-09-07 |
| „Lernen, ohne dass es sich nach Lernen anfühlt" geht in der Schul-Zielgruppenkarte auf | Eine eigene Sektion für einen von vier Anlässen kippt die Balance der Seite zugunsten des Schulkontexts. Die Aussage steht ohnehin in der Karte; sie bekommt dort mehr Text als die drei anderen und damit das Gewicht, das ihr zusteht | 2026-09-07 |
| ~~Die drei bestehenden Feature-Karten bleiben~~ → **revidiert am selben Tag: Sektion „Was drin steckt" entfällt** | Die Argumentation für das Behalten (der Leser müsse die Funktionen sehen) unterschätzt, was eine Landingpage leisten soll: überzeugen, nicht spezifizieren. Der Inhalt geht nicht verloren, sondern wandert in die neue fünfte FAQ-Frage — dort steht er weiterhin im HTML und im JSON-LD, unterbricht aber den Lesefluss nicht | 2026-09-07 |
| Sektion „Der Unterschied" (kostenlos, kein Account) entfällt ersatzlos | Dritte Wiederholung derselben Aussage auf einer Seite: Sie steht im Hero als hervorgehobene Zeile, im Abschluss-CTA und in zwei FAQ-Antworten. Ein Alleinstellungsmerkmal wird nicht stärker, wenn man es viermal sagt | 2026-09-07 |
| Der Inhalt der Feature-Karten wird zur fünften FAQ-Frage, statt ersatzlos zu verschwinden | Die Frage „Was kann ich in eine Quest einbauen?" ist genau die, die ein Interessent tatsächlich stellt. Eingeklappt kostet sie keinen Lesefluss, bleibt aber für Suchmaschinen und für den, der Details sucht, vollständig vorhanden | 2026-09-07 |
| Sektion 3 heißt „Jeder Ort kann ein Level sein", nicht „Die Welt ist deine Spielkarte" | Die Level-Metapher trifft den Gaming-Ton des PRD genauer und macht aus einer Feststellung ein Versprechen. „Die Welt ist deine Spielkarte" bleibt als abschließende Merkzeile derselben Sektion erhalten — beide gelieferten Formulierungen bleiben damit in Gebrauch | 2026-09-07 |
| Die halbe Stunde („in einer halben Stunde eine fertige Schnitzeljagd") verschwindet von der Seite | Bewusste Entscheidung des Betreibers: Die Zahl bleibt der FAQ-Antwort „Wie lange dauert das Erstellen?" vorbehalten und wird nicht zum Verkaufsargument erhoben. Ein Zeitversprechen im Marketing-Text erzeugt eine Messlatte, an der die erste eigene Quest gemessen wird | 2026-09-07 |
| Die vier Anlass-Karten (Kindergeburtstag, Schulausflug, …) weichen den vier Zielgruppen-Karten | Inhaltlich vollständig deckungsgleich — beide Blöcke nebeneinander wäre reine Wiederholung. Die Zielgruppen-Fassung ist die bessere: sie adressiert den Leser („Für Familien") statt einen Anlass zu benennen | 2026-09-07 |
| Schritt 03 sagt „Quest als Datei weitergeben", nicht „teilen" | Ein Teilen-Link existiert nicht; Weitergabe läuft über den JSON-Export (PROJ-9). Eine Landingpage, die eine Funktion suggeriert, die es nicht gibt, erzeugt genau die Enttäuschung, die sie vermeiden soll | 2026-09-07 |
| Hero-CTAs führen nach `/create` und `/anleitung` statt nach `/anleitung` und `/` | Wer über eine Landingpage kommt, hat sich für „erstellen" entschieden. Der Mode-Switch `/` als Zwischenstopp verlangt eine Entscheidung, die schon gefallen ist. Die KI-Anleitung bleibt als sekundärer Weg sichtbar — sie ist die Abkürzung, nicht der Hauptweg | 2026-09-07 |

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
| `InfoNavMenu` wird durch `AppNavMenu` ersetzt, nicht daneben gestellt | Zwei Menü-Komponenten mit überlappenden Links wären genau die Doppelpflege, die dieses Refinement beseitigt. `InfoNavMenu` und `INFO_NAV_LINKS` entfallen; `HEADER_NAV_LINKS` (die Desktop-Textlink-Teilmenge) bleibt als eigene Ableitung erhalten | 2026-09-06 |
| Menü-Struktur zieht von `src/lib/info-nav.ts` nach `src/lib/app-nav.ts` | Der Name beschreibt dann, was es ist: die Navigation der App, nicht die der Info-Seiten. Das Muster bleibt dasselbe (Plain-Modul außerhalb der Client-Komponente, damit der Wert nicht als Referenz-Proxy über die Client-Grenze kommt) | 2026-09-06 |
| Menu nutzt die bereits installierte shadcn/ui-Komponente (Sheet oder DropdownMenu) statt Eigenbau | Fokus-Falle, Escape-Handling und `aria-expanded` sind dort gelöst; ein Eigenbau würde genau diese Details verlieren. Kein neues Paket | 2026-09-05 |
| Häufige Fragen nutzen das bereits installierte Accordion | Gleiche Komponente wie das Troubleshooting auf `/anleitung`; die Antworten bleiben im DOM, das JSON-LD wird weiterhin aus derselben `FAQ`-Konstante erzeugt | 2026-09-05 |
| `/impressum` und `/datenschutz` liegen in derselben `(info)`-Route-Gruppe | Sie teilen Rahmen, Hintergrund und Navigation mit `/about` und `/anleitung`; nur `robots: noindex` unterscheidet ihre Metadaten | 2026-09-05 |
| Footer wird Teil von `InfoPageShell`, keine eigene Einbindung je Seite | Der Rahmen liefert bereits Header und Container; ein Footer pro Seite einzeln einzuhängen wäre vier Mal derselbe Code und würde beim nächsten Seitenzuwachs vergessen | 2026-09-05 |
| Anbieterdaten wandern in ein gemeinsames Modul unter `src/lib/` | Name und E-Mail stehen dann sowohl im Impressum als auch im Footer aus einer Quelle; heute liegen sie als `PROVIDER`-Konstante nur in der Impressum-Seite und würden beim Ändern auseinanderlaufen | 2026-09-05 |

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

---

## Refinement 2 (2026-09-05) — Zurückpfeile & Footer

Nach dem Deploy aufgefallen. Zwei Punkte, beide klein, aber beide echte Lücken.

### Zu bauen (`/frontend`)

**Zurückpfeile**
1. `/impressum` und `/datenschutz` setzen `backHref="/about"` — die Prop existiert in `InfoPageShell` bereits und wird von `/anleitung` genutzt, die beiden neuen Seiten hatten sie schlicht nicht gesetzt

**Footer**
2. Gemeinsamer Footer in `InfoPageShell`, damit er auf allen vier Seiten erscheint
3. Inhalt: Anbietername, E-Mail als `mailto:`-Link, Links zu Impressum und Datenschutz
4. **Keine** Postanschrift im Footer
5. Anbieterdaten (Name, E-Mail) aus der Impressum-Seite in ein gemeinsames Modul ziehen, damit Footer und Impressum dieselbe Quelle nutzen
6. Impressum und Datenschutz aus der Desktop-Textlinkreihe im Header entfernen; „Anleitung" bleibt
7. Burger-Menü behält alle vier Ziele

### Bleibt unangetastet
Burger-Menü-Mechanik, FAQ-Accordion, die gekürzten Inhalte, selbst-gehostete Schriften, Analytics und die Rechtstexte selbst.

### Hinweis
Der 16px-Schließen-Button im Sheet (Bug 2 der letzten QA-Runde) bleibt weiterhin bewusst offen. Kommt beim Footer-Bau eine app-weite Touch-Target-Runde in Frage, wäre das der Moment.

## Implementation Notes (Frontend — Refinement 2, 2026-09-05)

Alle sieben Punkte umgesetzt.

### Neue Dateien
| Datei | Zweck |
|-------|-------|
| `src/lib/provider.ts` | Anbieterangaben als gemeinsame Quelle für Impressum und Footer |
| `src/components/info-footer.tsx` | Footer mit Kontakt und Rechtslinks |

### Geänderte Dateien
- `src/components/info-page-shell.tsx` — Footer eingebunden, Desktop-Textlinkreihe auf `HEADER_NAV_LINKS` umgestellt
- `src/lib/info-nav.ts` — `HEADER_NAV_LINKS` ergänzt (Teilmenge für den Header); `INFO_NAV_LINKS` bleibt unverändert die Quelle des Burger-Menüs
- `src/app/(info)/impressum/page.tsx` — `backHref="/about"`, `PROVIDER` aus dem gemeinsamen Modul statt lokaler Konstante
- `src/app/(info)/datenschutz/page.tsx` — `backHref="/about"`
- `tests/proj-13-info-refinement.spec.ts` — 7 neue Tests

### Befunde und Abweichungen

**Die Zurückpfeile waren kein neues Feature.** `InfoPageShell` unterstützt `backHref` seit dem ersten Bau, `/anleitung` nutzt es. Bei den beiden Rechtsseiten war die Prop schlicht nicht gesetzt — zwei Zeilen, kein neuer Code.

**Footer optisch abgesetzt.** Erste Fassung lag auf demselben `bg-gq-black` wie der Inhalt und wirkte dadurch wie ein weiterer Absatz statt wie ein Seitenfuß. Jetzt mit `bg-gq-dark-teal/25` und Oberkante — eigener Bereich, ohne vom Inhalt abzulenken.

**Bestehender Test wurde durch den Footer mehrdeutig.** Die Prüfung „Impressum hat einen `mailto:`-Link" fand nach dem Einbau zwei Treffer (Impressum-Text und Footer) und schlug mit einer Strict-Mode-Verletzung fehl. Auf `main` eingegrenzt, da die Prüfung dem Kontakt-Abschnitt der Seite gilt, nicht dem Footer. Kein Produktfehler.

### Verifikation
- `npm run build` — erfolgreich, alle vier Info-Seiten weiterhin statisch prerendered
- `npm run lint` — 0 Fehler · `npm test` — 167 Tests grün
- E2E (WebKit): **243 bestanden** (vorher 236), 17 fehlgeschlagen — ausschließlich die bekannten Vorbelastungen aus PROJ-1/3/11, keine neue Regression
- Zurückpfeile auf `/impressum`, `/datenschutz` und `/anleitung` führen jeweils nach `/about` (geprüft)
- Desktop-Header trägt nur noch „Anleitung" und „Zur App"; Burger-Menü behält alle vier Ziele (geprüft)
- Footer-Links messen 44px Höhe (E-Mail, Impressum, Datenschutz)
- Footer enthält weder „Kerbelweg" noch „22337" — Anschrift bleibt dem Impressum vorbehalten

## QA Test Results — Refinement 2 (2026-09-05, dritte Runde)

**Getestet am:** 2026-09-05
**Testumgebung:** WebKit / Mobile Safari (iPhone 13) via Playwright; Viewports 360 / 390 / 430 / 1440 px; Produktions-Build (`npm run start`)
**Ergebnis:** 8 von 8 neuen Acceptance Criteria bestanden · 1 Bug (0 Critical, 0 High, 0 Medium, 1 Low)
**Produktionsreif:** **JA**

### Acceptance Criteria (Refinement 2)

| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Zurückpfeil auf `/impressum` und `/datenschutz` | bestanden — sichtbar, 44×44px |
| 2 | Pfeil führt nach `/about` | bestanden (beide Seiten) |
| 3 | Footer mit Name, E-Mail und Rechtslinks | bestanden (alle vier Info-Seiten) |
| 4 | E-Mail als `mailto:`-Link | bestanden — `mailto:d.oesten@googlemail.com` |
| 5 | Keine Postanschrift im Footer | bestanden — weder „Kerbelweg" noch „22337" auf einer der Seiten |
| 6 | Desktop-Header ohne Impressum/Datenschutz | bestanden — nur noch „Anleitung" und „Zur App" |
| 7 | Burger-Menü behält alle vier Ziele | bestanden |
| 8 | Footer-Links ≥ 44px, kein H-Scroll | bestanden bei 360, 390 und 430px (alle Links exakt 44px, Overflow 0px) |

### Weitere Prüfungen

| Prüfung | Ergebnis |
|---------|----------|
| Footer auf den App-Screens (`/`, `/play`, `/create`) | **nicht vorhanden** — korrekt, der Footer gehört nur zu den Info-Seiten |
| Semantik | `<footer>`-Element mit `<nav>` darin, genau ein `<h1>` je Seite |
| Kontrast im Footer (WCAG AA) | 7,30:1 bis 10,65:1 — deutlich über 4,5:1 |
| Externe Requests | **0** über alle vier Seiten |
| Cookies | **keine** |
| Konsolenfehler | keine |
| `mailto:`-Ziel | sauber, keine Header-Injection möglich |
| E2E-Suite | 29 Tests in `proj-13-info-refinement.spec.ts` grün; gesamt 243 bestanden |

### Bugs

**Bug 1 — Navigationslinks verweisen auf die aktuelle Seite (Low)**
Reproduktion: `/impressum` öffnen → der Footer enthält einen Link auf `/impressum`. Ebenso auf `/datenschutz`, und im Header verlinkt „Anleitung" auf `/anleitung`, wenn man bereits dort ist.
Auswirkung: Kosmetisch. Ein Klick lädt dieselbe Seite neu; Screenreader kündigen einen Link an, der nirgendwohin führt. Üblich ist, den aktuellen Eintrag zu markieren (`aria-current="page"`) und optisch hervorzuheben statt zu verlinken.
**Vorbestehend, keine Regression:** Der Selbstverweis bei „Anleitung" existierte nachweislich schon vor diesem Refinement (per `git stash` gegengeprüft); der Footer dehnt das Muster lediglich auf die Rechtsseiten aus.

### Anmerkung zur Testmethodik
Eine erste Prüfung meldete den `mailto:`-Link als potenziell unsicher. Ursache war ein fehlerhafter Regex in der Prüfroutine (Zeichenklasse `[\r\n%0a%0d]` matcht u.a. das Zeichen „a", das in „googlemail" vorkommt), nicht der Link. Nachkontrolle mit korrektem Muster: unauffällig.

### Nicht abgedeckt
- **Chromium und Firefox** — die Browser-Binaries fehlen auf diesem Rechner; getestet wurde ausschließlich WebKit.
- Die 17 bekannten E2E-Fehlschläge in PROJ-1/3/11 bestehen unverändert fort. Sie sind analysiert (unspezifische Selektoren, fehlende Geolocation-Berechtigung im Test-Setup, Groß-/Kleinschreibung) und **keine Produktfehler**, verdecken aber künftige echte Regressionen. Eigenes Aufräum-Ticket empfohlen.

## Deployment — Refinement 2 (2026-09-05)

**Production URL:** https://geoquesty.vercel.app
**Deployed:** 2026-09-05
**Commit:** `a75fc41`

### Pre-Deployment
Build erfolgreich (alle Info-Seiten statisch), Lint 0 Fehler, 167 Unit-Tests grün, QA-Freigabe erteilt, keine Secrets im Repo.

### Post-Deployment-Verifikation (live geprüft)
| Prüfung | Ergebnis |
|---------|----------|
| Alle fünf Routen | HTTP 200 |
| Zurückpfeile `/impressum`, `/datenschutz`, `/anleitung` | vorhanden, führen nach `/about` |
| Footer | auf allen Info-Seiten, mit Name, E-Mail und Rechtslinks |
| Postanschrift | nur auf `/impressum`, nicht im Footer |
| Desktop-Header | nur „Anleitung" und „Zur App" sichtbar |
| Burger-Menü | alle vier Ziele |
| Footer-Touch-Targets | 44px |
| Security-Header | X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS preload |
| `noindex` auf Rechtstexten | gesetzt |
| Externe Requests / Cookies / Konsolenfehler | keine |

### Anmerkung zur Deploy-Prüfung
Eine erste Live-Kontrolle meldete den Deploy nach 10 Sekunden als fertig — das war ein Fehlalarm: Der Suchbegriff „Zurück" kommt auch im alten Build vor. Die Gegenprobe zeigte, dass noch die Vorversion ausgeliefert wurde (kein Footer, Rechtslinks im Header). Mit einem Marker, den nur der neue Build enthält, war der Deploy nach rund 40 Sekunden tatsächlich live. Lehre für künftige Deploys: Auf ein Merkmal prüfen, das ausschließlich in der neuen Fassung existiert.

### Weiterhin offen
- 17 E2E-Fehlschläge in PROJ-1/3/11 — analysiert, keine Produktfehler, eigenes Aufräum-Ticket empfohlen
- Bug: Navigationslinks verweisen auf die aktuelle Seite (Low, vorbestehend)
- Bug: 16px-Schließen-Button im Sheet (Medium, bewusst offen gelassen)
- Vercel Analytics: Datenfluss im Dashboard zu prüfen

---

## Implementation Notes (Frontend) — Refinement 3: gemeinsames Menu (2026-09-06)

| Datei | Änderung |
|-------|----------|
| `src/components/info-page-shell.tsx` | `InfoNavMenu` → `AppNavMenu`; Import von `HEADER_NAV_LINKS` zieht von `@/lib/info-nav` nach `@/lib/app-nav` |
| `src/components/info-nav-menu.tsx` | **Gelöscht** — ersetzt durch `src/components/app-nav-menu.tsx` (PROJ-1) |
| `src/lib/info-nav.ts` | **Gelöscht** — ersetzt durch `src/lib/app-nav.ts` (PROJ-1) |

Wie spezifiziert umgesetzt:
- Das Menu ist auf den Info-Seiten jetzt **auch ab `sm` sichtbar** (das frühere `sm:hidden` am Trigger ist entfallen), weil es mit Play und Create Ziele führt, die die Desktop-Zeile nicht abbildet
- Die Desktop-Zeile bleibt unangetastet: Textlink „Anleitung" plus Aktions-Button „Zur App" (weiterhin der reservierte Ko-fi-Platz)
- Der **Sticky-Header der Info-Seiten bleibt sticky** — im Browser gegengeprüft: `/about` und `/anleitung` halten bei `y: 0`, während `/play` und `/create/[id]` bei `scrollY=300` auf `y: -300` wegscrollen
- `HEADER_NAV_LINKS` filtert weiterhin auf `/anleitung`, jetzt aus den flachgeklopften `APP_NAV_GROUPS`

Drei E2E-Tests in `tests/proj-13-info-refinement.spec.ts` prüften das alte Verhalten (vier Ziele inkl. Link „App"; Burger am Desktop versteckt) und wurden auf sechs Ziele, die drei Gruppen-Überschriften und den am Desktop sichtbaren Burger umgestellt.

### Nachbesserung: Light-Theme für die Rechtstexte (2026-09-06)

`/impressum` und `/datenschutz` laufen jetzt im hellen Theme, `/about` und `/anleitung` bleiben dunkel.

| Datei | Änderung |
|-------|----------|
| `src/components/info-page-shell.tsx` | Neue Prop `theme?: "dark" \| "light"` (Default `"dark"`). Der Rahmen stempelt `data-theme` auf einen Wrapper-`div`, der zugleich die Fläche (`bg-background`) trägt |
| `src/app/(info)/impressum/page.tsx`, `…/datenschutz/page.tsx` | `theme="light"`; alle fest verdrahteten Dunkelfarben (`text-[#E7EAEC]`, `text-gq-grey`, `text-gq-white`) durch Tokens ersetzt |
| `src/components/info-footer.tsx` | `bg-gq-dark-teal/25` → `bg-foreground/[0.04]`, `text-gq-grey` → `text-muted-foreground` — der Footer folgt damit dem Theme der Seite, statt immer dunkel zu sein |
| `src/app/(info)/layout.tsx` | `bg-gq-black` entfernt: die Fläche malt jetzt der Shell, sonst schiene Schwarz unter den hellen Seiten durch |

Die Akzentfarben (Teal für Eyebrows und Links) bleiben laut Design-System in beiden Themes identisch — nur Grund und Textfarbe wechseln.

Im Browser gemessen: `/impressum` und `/datenschutz` → `bg rgb(246,248,249)`, `/about` und `/anleitung` → `bg rgb(10,14,15)`. Footer: `rgba(10,14,15,0.04)` auf hell, `rgba(255,255,255,0.04)` auf dunkel; Links in beiden Fällen Teal. Ein E2E-Test in `proj-13-info-refinement.spec.ts` hält die Aufteilung fest.

---

## QA Test Results — Refinement 3 & Light-Theme (2026-09-06)

Geprüft im Rahmen des app-weiten Navigations-QA; die vollständigen Ergebnisse stehen in [PROJ-1](PROJ-1-app-shell-mode-switch.md#qa-test-results--app-weite-navigation-2026-09-06).

| Acceptance Criterion | Ergebnis |
|----------------------|----------|
| Gemeinsames Menü mit sechs Zielen in drei Gruppen | ✅ Pass |
| Desktop-Zeile („Anleitung" + „Zur App") bleibt neben dem Burger | ✅ Pass (1440px) |
| Burger auch ab `sm` sichtbar | ✅ Pass |
| Direktsprung Info-Seite → Play/Create | ✅ Pass |
| Aktiver Eintrag auf `/impressum` markiert | ✅ Pass |
| Sticky-Header der Info-Seiten bleibt sticky | ✅ Pass (`y: 0 → 0` bei `scrollY=300`) |
| Escape / Klick daneben / Fokus-Falle / `aria-expanded` | ✅ Pass |
| `/impressum` + `/datenschutz` im Light-Theme | ✅ Pass (`rgb(246,248,249)`) |
| `/about` + `/anleitung` bleiben dark | ✅ Pass (`rgb(10,14,15)`) |
| Footer folgt dem Theme der Seite | ✅ Pass (`rgba(10,14,15,.04)` hell / `rgba(255,255,255,.04)` dunkel) |
| Kein horizontales Scrollen | ✅ Pass (375/768/1440px, Chrome + WebKit) |

### Befund

**BUG-1 (High)** aus PROJ-1 trifft auch die beiden neuen hellen Seiten: Öffnet man dort das Burger-Menü, liegen Gruppen-Labels bei 2.29:1 und die Aktiv-Markierung bei 1.57:1 — beide unter der PRD-Vorgabe von 4.5:1. Der Seiteninhalt selbst ist einwandfrei (dunkler Text auf hellem Grund); betroffen ist nur das Menü-Overlay.

**`/about` ohne Zurück-Pfeil** ist kein Bug: Die Seite ist die Wurzel des Info-Bereichs, ihre drei Unterseiten zeigen mit `backHref="/about"` auf sie zurück, und ihr Ausgang ist der „Zur App"-Button.

**Status: Approved** — BUG-1 wurde am 2026-09-06 behoben (Token-Tausch, siehe Bugfix-Pass in PROJ-1). Die Rechtstexte bekamen dabei zusätzlich ihre 22 fest verdrahteten `gq-teal`-Vorkommen auf `text-primary` umgestellt; Überschriften und Inline-Links liegen jetzt bei 4.54:1 statt 1.55:1.

---

## Deployment — Refinement 3 & Light-Theme (2026-09-06)

**Production URL:** https://geoquesty.vercel.app
**Git Tag:** v1.21.0-PROJ-1 (gemeinsames Deployment mit PROJ-1 und PROJ-7)
**Deployt:** 2026-09-06

Live verifiziert:

| Prüfung | Ergebnis |
|---------|----------|
| Alle vier Info-Seiten laden | ✅ HTTP 200 |
| Gemeinsames Burger-Menu mit sechs Zielen | ✅ |
| `/impressum` und `/datenschutz` im Light-Theme | ✅ `rgb(246,248,249)` |
| `/about` und `/anleitung` weiterhin dunkel | ✅ |
| Menü-Kontrast auf den hellen Seiten | ✅ 5.30:1 / 4.54:1 |

Vollständige Deployment-Details in [PROJ-1](PROJ-1-app-shell-mode-switch.md#deployment--app-weite-navigation-2026-09-06).

---

## Refinement 4 (2026-09-07) — `/about` wird zur Marketing-Landingpage

### Warum

Die bisherige `/about` erklärt das Produkt sachlich und korrekt — sie **verkauft** es aber nicht. Der Hero („Draußen ist das Spielfeld.") beschreibt einen Zustand statt ein Versprechen, und die Seite beantwortet „Was ist das?" ausführlicher als „Warum sollte ich das wollen?". Für die einzige Seite, die per QR-Code, Social-Media-Link oder Suchergebnis den Erstkontakt trägt, ist das die falsche Gewichtung.

Der Betreiber hat neue Marketing-Copy geliefert (elf Textblöcke). Dieses Refinement arbeitet sie zu **einer neuen `/about`-Seite** zusammen. `/anleitung`, `/impressum` und `/datenschutz` bleiben vollständig unangetastet.

### Die drei Rahmenentscheidungen

1. **`/about` wird ersetzt, nicht ergänzt.** Keine zweite Marketing-Route. Von der alten Seite bleibt nur die FAQ erhalten — sie trägt das SEO-Fundament. Feature-Karten, „Der Unterschied" und die Anlass-Karten entfallen (siehe „Was von der alten Seite wegfällt").
2. **Primäre Zielgruppe bleiben die Ersteller** — Eltern, Lehrkräfte, Jugendleiter. Das durchgängige „du" der neuen Copy adressiert **den Ersteller**, nicht das Kind. Kinder und Jugendliche bleiben eine von vier Zielgruppen im „Für wen"-Block, nicht der Hauptadressat. Der Out-of-Scope-Eintrag „Spieler-orientiertes Marketing" bleibt damit bestehen.
3. **Der Hero übersetzt „GPS-Rallye" in „Quest" — danach gilt die App-Sprache.** *(Revidiert am 2026-09-07, siehe unten)*

   Die erste Fassung dieses Refinements sah „Rallye" auf der ganzen Landingpage vor und „Quest" nur in der App. Das hätte einen Bruch genau dort erzeugt, wo die Seite ihre Arbeit getan hat: Wer nach einer Seite voller *Rallyes* auf `/create` klickt, liest dort überall *Quest* und muss selbst übersetzen.

   Stattdessen findet die Übersetzung **auf der Seite selbst** statt, im Hero:
   - **Sektion 1 (Hero)** sagt einmal **„GPS-Rallye"** — der Begriff, in dem Eltern und Lehrkräfte suchen und denken. Er holt den Besucher ab.
   - **Ab Sektion 2** heißt es durchgehend **„Quest"** — dieselbe Sprache, die ihn in der App erwartet.
   - **Die Buttons** heißen „Quest erstellen", nicht „Rallye erstellen".
   - **„Schnitzeljagd"** bleibt in Meta-Title, Keywords, JSON-LD und FAQ: der Suchbegriff mit dem größten Volumen, er darf aus dem SEO-Fundament nicht verschwinden.

   Die Verknüpfung bleibt **implizit** — kein Erklärsatz à la „in Geo Quest heißt das Quest". Der Leser stellt sie selbst her, wie er es bei „Schnitzeljagd" auch tut; ein Erklärsatz würde an der wichtigsten Stelle der Seite Tempo kosten.

   Kein Eingriff in die App-UI (PROJ-1 bis PROJ-11).

### Die Copy: elf Blöcke werden acht Sektionen

Die gelieferten Texte enthalten drei inhaltliche Dopplungen. Alles einzubauen hieße, den Leser dreimal an derselben Aussage vorbeizuscrollen. Zusammengeführt wird:

| Gelieferte Blöcke | Werden zu |
|---|---|
| „Aus einem Ort wird ein Abenteuer" + „Jeder Ort kann ein Level sein" | **eine** Orte-Sektion — die Ortsliste als visuelle Reihe, der Erklärtext daneben |
| „Jeder kann eine Rallye erstellen" + „Nicht nur spielen. Selber machen." | **eine** Game-Designer-Sektion — „Du bist der Game-Designer" als Aussage, „kein Programmierwissen nötig" als Beleg |
| Die drei Personenzeilen (Eltern / Lehrpersonen / Kinder) aus „Jeder kann eine Rallye erstellen" | gehen im **„Für wen"**-Block auf, wo dieselben Gruppen ohnehin ausführlicher stehen |
| „Lernen, ohne dass es sich nach Lernen anfühlt" | geht in der **„Für Schule & Pädagogik"**-Karte auf (siehe Decision Log) |

### Neuer Aufbau von `/about`

Reihenfolge und vollständige Copy. Kursive Klammern sind Umsetzungshinweise, kein Seitentext.

**1 — Hero** *(ersetzt „Draußen ist das Spielfeld.")*

> # Die reale Welt wird zum Spielfeld.
>
> **Erstelle deine eigene GPS-Rallye und mach aus jedem Ort ein Abenteuer.**
>
> Ob mit Freunden, der Familie, in der Schule oder im Verein: Mit Geo Quest kannst du eigene Rallyes erstellen, draußen spielen und Orte auf eine ganz neue Art entdecken.
>
> **Kostenlos. Ohne Abo. Ohne Account.**
>
> `[Quest erstellen]` → `/create`  `[Mit KI bauen]` → `/anleitung`

*Hero-Bild `urbanquest.png` und Logo-Lockup bleiben wie bisher. Die „Kostenlos"-Zeile steht als eigenständige, hervorgehobene Zeile über den Buttons — sie ist das stärkste Einzelargument der Seite und darf nicht als Fließtext untergehen.*

*Dies ist die **einzige** Stelle der Seite, an der „GPS-Rallye" und „Rallyes" stehen. Ab Sektion 2 heißt es „Quest" — die Übersetzung passiert hier, im Hero, und zwar implizit (siehe Rahmenentscheidung 3).*

**2 — Draußen spielen. Wie ein Game.** *(neu)*

> Warum nur drinnen am Bildschirm spielen, wenn das Abenteuer direkt vor der Tür liegt?
>
> Geo Quest verbindet die Freiheit der echten Welt mit dem Spielgefühl eines Games. Laufe zu verschiedenen Orten, löse Aufgaben, entdecke Neues und folge deiner Quest mit GPS.
>
> **Dein Spiel. Dein Ort. Deine Regeln.**

**3 — Jeder Ort kann ein Level sein.** *(neu, zwei Blöcke zusammengeführt)*

> Ein Park. Eine Stadt. Der Schulhof. Ein Wanderweg. Dein Viertel.
>
> Lege Stationen fest, füge Aufgaben hinzu und verbinde sie zu einer eigenen Quest. Die Teilnehmenden bewegen sich durch die echte Welt und entdecken dabei die nächste Herausforderung.
>
> **Die Welt ist deine Spielkarte.**

*Die fünf Orte werden als visuelle Reihe gesetzt (Chips oder Kacheln), nicht als Fließtext-Aufzählung — sie sind der Beleg für „überall", und als Aufzählung im Satz geht das unter.*

*Überschrift und Merkzeile stammen aus zwei verschiedenen gelieferten Blöcken: „Jeder Ort kann ein Level sein" trägt die Sektion, „Die Welt ist deine Spielkarte" schließt sie ab. Beide Formulierungen bleiben erhalten, ohne die Sektion zu doppeln.*

**4 — Nicht nur spielen. Selber machen.** *(neu, zwei Blöcke zusammengeführt)*

> Mit Geo Quest bist du nicht nur Spieler. Du bist der Game-Designer.
>
> Du brauchst kein Programmierwissen und keine besonderen Vorkenntnisse. Erstelle eine Quest für deinen nächsten Ausflug, eine Geburtstagsfeier, eine Schulstunde oder einfach für deine Freunde.
>
> **Erstelle deine eigene Welt, deine eigenen Regeln und deine eigenen Herausforderungen.**

**5 — Eine Quest erstellen? Ganz einfach.** *(neu)*

> **01 — Ort auswählen**
> Entscheide, wo dein Abenteuer stattfinden soll.
>
> **02 — Quest gestalten**
> Füge Stationen und Aufgaben hinzu und verbinde alles zu einem Abenteuer.
>
> **03 — Losspielen**
> Gib deine Quest als Datei weiter — oder spielt sie direkt auf deinem Gerät. GPS führt euch von Station zu Station.

*Schritt 03 ist gegenüber der Vorlage („Teile deine Rallye und los geht's") umformuliert: Teilen läuft heute über den JSON-Datei-Export (PROJ-9), es gibt keinen Teilen-Link. Die Originalformulierung weckt eine Erwartung, die die App nicht einlöst.*

**6 — Für wen ist Geo Quest?** *(ersetzt die vier Anlass-Karten)*

> **👨‍👩‍👧 Für Familien**
> Mach aus einem Spaziergang, Ausflug oder Urlaub ein gemeinsames Abenteuer.
>
> **🧑‍🏫 Für Schule & Pädagogik**
> Gestalte interaktive Lernpfade und bringe Unterricht nach draußen. Statt Arbeitsblättern am Schreibtisch erkunden Kinder Themen draußen und lösen Aufgaben an realen Orten — ob Geschichte, Natur oder Geografie.
>
> **🧭 Für Kinder & Jugendliche**
> Erstelle deine eigene Quest, überrasche deine Freunde und werde selbst zum Game-Designer.
>
> **🎉 Für Gruppen & Events**
> Geburtstag, Ferienprogramm, Jugendgruppe oder einfach ein Nachmittag mit Freunden — erstelle eine Quest, die zu deinem Anlass passt.

*Die Schul-Karte trägt bewusst mehr Text als die anderen drei: hier ist der Lernpfad-Block aufgegangen. Die vier bisherigen Anlässe (Kindergeburtstag, Schulausflug, Ferienprogramm, Jugendgruppe) sind inhaltlich vollständig in diesen vier Karten enthalten und entfallen als eigener Block.*

**7 — Häufige Fragen** *(bleibt, wächst um eine fünfte Frage)*

Eingeklapptes Accordion, gespiegelt im `FAQPage`-JSON-LD. Trägt „Schnitzeljagd" als Suchbegriff und beantwortet Preis, Account, Alter, Aufwand. Die vier bestehenden Fragen bleiben wörtlich unverändert.

**Neu als fünfte Frage** — sie fängt auf, was mit den Feature-Karten wegfällt:

> **Was kann ich in eine Quest einbauen?**
> Jede Station kann fünf Bausteine kombinieren: Text, Bild, Audio, Video und Aufgaben. Als Aufgaben gibt es drei Typen — einen Code eintippen, Multiple Choice oder Elemente in die richtige Reihenfolge bringen. Weiter geht es erst, wenn die Aufgabe gelöst ist. Die Navigation zwischen den Stationen läuft über GPS: Ein Pfeil zeigt die Richtung, die Entfernung zählt herunter.

*Der Inhalt der drei gestrichenen Feature-Karten steht damit weiterhin im HTML und im JSON-LD — er unterbricht den Lesefluss aber nicht mehr. Wer die Frage nicht hat, scrollt vorbei; wer sie hat, klappt auf.*

**8 — Abschluss-CTA** *(ersetzt „Bereit für deine Quest?")*

> ## Deine Umgebung. Dein Abenteuer.
>
> **Erstelle jetzt kostenlos deine erste Quest.**
>
> Kein Abo. Kein Account. Einfach draußen spielen.
>
> `[Quest erstellen]` → `/create`

### Was von der alten Seite wegfällt

| Weg | Warum |
|---|---|
| Hero „Draußen ist das Spielfeld." | Ersetzt durch „Die reale Welt wird zum Spielfeld." |
| Sektion **„Was drin steckt"** (drei Feature-Karten) | Entschieden am 2026-09-07: Die Seite soll Stimmung tragen, nicht Funktionen aufzählen. Der Inhalt wandert vollständig in die neue fünfte FAQ-Frage — er bleibt damit im HTML und im JSON-LD, unterbricht aber den Lesefluss nicht mehr |
| Sektion **„Der Unterschied"** (Kostenlos kein Abo / Kein Account) | Entschieden am 2026-09-07: dritte Wiederholung derselben Aussage. Sie steht bereits im Hero („Kostenlos. Ohne Abo. Ohne Account."), im Abschluss-CTA und in zwei FAQ-Antworten |
| Vier Anlass-Karten (Kindergeburtstag, Schulausflug, Ferienprogramm, Jugendgruppe & Verein) | Gehen in den vier Zielgruppen-Karten auf |
| „Kein technisches Vorwissen nötig — wer eine Runde durch den Park kennt, hat in einer halben Stunde eine fertige Schnitzeljagd." | Entschieden am 2026-09-07: bleibt ersatzlos draußen. Der Vorwissen-Teil steht sinngemäß in Sektion 4; die Zeitangabe bleibt allein der FAQ-Antwort „Wie lange dauert das Erstellen?" vorbehalten und wird nicht zum Verkaufsargument erhoben |
| Abschluss-CTA „Bereit für deine Quest?" | Ersetzt durch „Deine Umgebung. Dein Abenteuer." |

**Formaler Rhythmus der neuen Seite:** Text → Text → Chips → Text → Schritte → Karten → Accordion → Box. Nie zweimal dieselbe Darstellungsform hintereinander.

### Was sich außerhalb der Seiten-Copy ändert

- **Hero-CTAs führen neu direkt in den Creator.** Bisher: „Quest mit KI bauen" → `/anleitung` und „Zur App" → `/`. Neu: **„Rallye erstellen" → `/create`** (primär) und **„Mit KI bauen" → `/anleitung`** (sekundär). Der Umweg über den Mode-Switch `/` entfällt — wer von einer Landingpage kommt, hat sich für „erstellen" bereits entschieden.
- **Meta-Description und Open-Graph-Texte** ziehen die neue Positionierung nach („GPS-Rallye", „die reale Welt wird zum Spielfeld"), behalten aber „Schnitzeljagd" als führenden Suchbegriff im Title.
- **Keyword-Liste** wird um `GPS-Rallye`, `Rallye erstellen` und `Lernpfad draußen` ergänzt; nichts wird entfernt.
- **`featureList` im JSON-LD** bleibt unverändert — sie beschreibt technische Fähigkeiten, keine Positionierung.
- **Der Header-Button „Zur App"** bleibt unverändert (weiterhin Ko-fi-Platzhalter, siehe Open Questions).

### Zu bauen (`/frontend`)

- `src/app/(info)/about/page.tsx` — neue Sektionsfolge und Copy nach obiger Vorlage
- Metadaten derselben Datei: `title`, `description`, `keywords`, `openGraph`
- Hero-CTA-Ziele auf `/create` und `/anleitung`
- Neue Sektionstypen: Orte-Reihe (Sektion 3), nummerierte Schritte (Sektion 5), Zielgruppen-Karten mit Emoji (Sektion 6)
- Konstanten: `FAQ` wächst um die fünfte Frage und speist wie bisher Accordion **und** JSON-LD aus einer Quelle; `OCCASIONS` wird durch `AUDIENCES` ersetzt; **`FEATURES` und `DIFFERENCES` entfallen ersatzlos** samt der zugehörigen Sektionen
- Nicht mehr benötigte lucide-Icons (`Compass`, `Layers`, `Puzzle`, `Wallet`, `UserX`) aus den Imports entfernen
- Vokabular-Prüfung vor Abschluss: „Rallye" darf **nur** im Hero vorkommen, sonst nirgends im sichtbaren Seitentext

### Bleibt unangetastet

`/anleitung`, `/impressum`, `/datenschutz`, `InfoPageShell`, Header, Burger-Menu (`AppNavMenu`), Footer, Hintergrund, Prompt-Vorlage, Import, Creator, Player. Kein neues Paket, kein Backend, keine Route.

---

## Implementation Notes (Frontend — Refinement 4, 2026-09-08)

### Geänderte Dateien
- `src/app/(info)/about/page.tsx` — vollständig neu getextet und umstrukturiert; acht Sektionen statt der bisherigen sechs Blöcke
- `tests/proj-13-landing-page.spec.ts` — drei Assertions auf die neue Fassung gezogen (Hero-Text, CTA-Beschriftung, OG-Titel)
- `tests/proj-13-info-refinement.spec.ts` — der Block „Für wen — gekürzte Fassung" prüft jetzt die vier Zielgruppen-Karten statt der entfallenen Anlass-Karten
- `tests/proj-13-landing-refinement.spec.ts` — **neu**, 23 Tests entlang der Acceptance Criteria dieses Refinements

Nicht angefasst: `/anleitung`, `/impressum`, `/datenschutz`, `InfoPageShell`, `AppNavMenu`, `InfoFooter`. Kein neues Paket, keine neue Route, keine neue Komponente — die Seite kommt mit dem bestehenden Rahmen und Tailwind aus.

### Umsetzung wie gespect
Die acht Sektionen, die Copy, das Vokabular (`GPS-Rallye` nur im Hero, ab Sektion 2 durchgehend `Quest`), die CTA-Ziele (`/create` primär, `/anleitung` sekundär) und die fünfte FAQ-Frage sind wie beschrieben umgesetzt. `FEATURES`, `DIFFERENCES` und `OCCASIONS` sind entfallen, `AUDIENCES`, `PLACES` und `STEPS` neu; die nicht mehr benötigten Icons (`Layers`, `Puzzle`, `Wallet`, `UserX`) sind aus den Imports raus.

### Abweichungen von der Spec (bewusst, mit Begründung)

**1. Lucide-Icons statt der Emoji in den Zielgruppen-Karten.**
Die Spec-Vorlage sah 👨‍👩‍👧 / 🧑‍🏫 / 🧭 / 🎉 vor. Das Design System schließt Emojis ausdrücklich aus („Keine Emojis. Nie. Energie kommt aus Type, Neon und Brush Marks"), und die gesamte App zeichnet mit Lucide-Outlines. Gesetzt sind jetzt `Users`, `GraduationCap`, `Compass` und `PartyPopper` in Teal — dieselbe Behandlung wie die Icons auf `/anleitung`. Nach Rückfrage entschieden.

**2. Sektion 4 („Nicht nur spielen. Selber machen.") steht in einer Karte mit Lime-Rahmen.**
Mit dem Wegfall von „Was drin steckt" folgen die Sektionen 2, 3 und 4 als drei Textblöcke aufeinander — derselbe Aufbau dreimal hintereinander liest sich flach. Die Karte bricht die Reihe auf, ohne Inhalt zu erfinden. Lime, weil das Design System ein Lime-Element pro Screen vorsieht und dies der stärkste Satz der Seite ist. Nach Rückfrage entschieden.

### Befunde aus der Browser-Verifikation
Drei Dinge fielen erst im gerenderten Bild auf und wurden nachgezogen:

- **Die „Kostenlos"-Zeile im Hero war ebenfalls Lime** — damit zwei Lime-Elemente auf einem Screen, gegen die Design-System-Regel. Sie ist jetzt Teal; das eine Lime-Element bleibt die Game-Designer-Karte
- **Die FAQ-Accordion lief auf `max-w-[70ch]`**, während alle anderen Sektionen die volle Containerbreite nutzen — auf 1440px wirkte die halbe Spalte unfertig. Die Trigger-Zeilen laufen jetzt voll, die Antworten bleiben auf 70ch Lesebreite begrenzt
- **Der Zeilenumbruch der Headline** trennte „Die reale Welt wird" / „zum Spielfeld." und ließ „WIRD" allein auf einer Zeile stehen. Jetzt „Die reale Welt" / „wird zum Spielfeld."

### Verifikation
- **Build und Lint sauber** (6 vorbestehende `<img>`-Warnungen in anderen Dateien, 0 Fehler)
- **Browser geprüft** auf 390×844 und 1440×900, jeweils als Vollseiten-Screenshot; keine Konsolenfehler außer dem lokal erwarteten 404 auf `/_vercel/insights/script.js` (Vercel Analytics existiert nur in Production)
- **PROJ-13: 73/73** auf Desktop Chrome 152
- **Gesamtsuite Chrome: 312 passed / 0 failed**
- **Gesamtsuite Mobile Safari (Standard-Config): 310 passed / 2 skipped / 0 failed**
- **Unit-Tests: 186/186**

Der Chrome-Lauf lief wie in den Vorgänger-Refinements über eine temporäre Config (`channel: 'chrome'`) — die reguläre `playwright.config.ts` bleibt unverändert und zeigt weiterhin auf das kaputte Chromium-Fragment.

### Offen für QA
- **Echte Geräte:** verifiziert wurde in Desktop-Chrome mit gesetztem Viewport, nicht auf einem physischen Handy
- **Kontrast der neuen Elemente:** Die Orts-Chips (`text-gq-white` auf `bg-gq-dark-teal/70`) und die Lime-Merkzeile in der Karte sind rechnerisch unkritisch, aber nicht mit einem Messwerkzeug geprüft
- **Die Seite ist deutlich länger geworden** (8 Sektionen, ~3900px auf Desktop). Ob der Abschluss-CTA damit noch in Reichweite ist oder ob die Seite gekürzt gehört, ist eine Produktfrage für die Abnahme
