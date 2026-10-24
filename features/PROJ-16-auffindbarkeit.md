# PROJ-16: Auffindbarkeit — Landingpage auf `/`, App auf `/app`, KI-Seite umbenannt

## Status: Architected
**Created:** 2026-10-24
**Last Updated:** 2026-10-24

## Dependencies
- Berührt: PROJ-1 (App Shell & Mode Switch): Der Startscreen zieht von `/` nach `/app`, Burger-Menü und Zurück-Pfeile zeigen auf neue Ziele
- Berührt: PROJ-12 (PWA-Installation): `start_url` im Manifest, Installations-Hinweis und Service Worker
- Berührt: PROJ-13 (Landing Page): Der Inhalt von `/about` wird zur Startseite `/`
- Berührt: PROJ-14 (KI-Anleitung): `/anleitung` wird zu `/mit-ki-erstellen`, mit neuem Namen und neuem Platz im Menü
- Berührt: PROJ-6 (Creator — Quest-Verwaltung): Das Aktionsmenü auf `/create` bekommt einen dritten Eintrag, die Leeransicht ein neues Linkziel

_Keine Datenabhängigkeit: Quest-Modell, Import, Speicherung und Player bleiben unberührt. Das Feature ordnet Adressen, Menüs und Metadaten neu._

## Kontext

**Ziel des Betreibers (2026-10-24):** Die Nutzung soll organisch wachsen. Wer im Internet oder bei einer KI nach GPS-Schnitzeljagden sucht, soll Geo Quest finden.

**Befund, live gemessen am 2026-10-24:**

| Prüfung | Ergebnis |
|---|---|
| `/` (stärkste Adresse der Domain) | Titel „Geo Quest“, eine Zeile Beschreibung, zwei Karten, kaum Text |
| `/about` (die eigentliche Landingpage) | eine Ebene tiefer, Canonical korrekt auf `geoquest.technolomagie.de/about` |
| `robots.txt` | 404 |
| `sitemap.xml` | 404 |
| `llms.txt` | 404 |
| Alte Adresse `geoquesty.vercel.app/about` | Canonical zeigt korrekt auf die eigene Domain |

Die Startadresse einer Domain bekommt die meisten Links und wird bei Markensuchen zuerst gezeigt. KI-Crawler lesen sie ebenfalls zuerst. Bei Geo Quest steht dort die App-Weiche mit fast keinem Text, die Landingpage liegt darunter.

**Zweiter Befund:** Auf `/anleitung` steht keine Anleitung. Dort ist ein Werkzeug: Formular ausfüllen, Prompt erzeugen, an eine KI geben, Datei importieren. Wie man eine Quest erstellt, erklären Video, Kapitel und FAQ auf `/about`. Der hero-CTA dorthin heißt schon „Mit KI erstellen“, die Seite selbst „Anleitung“.

**Neue Adressordnung:**

| Heute | Künftig |
|---|---|
| `/` Startscreen (Mode Switch) | `/app` |
| `/about` Landingpage | `/` |
| `/anleitung` | `/mit-ki-erstellen` |
| `/about/simulation` | `/simulation` |
| `/play`, `/create`, `/impressum`, `/datenschutz` | unverändert |

## User Stories
- Als Elternteil oder Lehrkraft, die nach „Schnitzeljagd App“ oder „GPS-Rallye selbst erstellen“ sucht, möchte ich direkt auf einer Seite landen, die erklärt, was Geo Quest ist, damit ich nicht erst über einen App-Startscreen stolpere.
- Als Person, die eine KI nach Werkzeugen für Schnitzeljagden fragt, möchte ich, dass die KI Geo Quest kennt und richtig beschreibt, damit ich einen Tipp bekomme, der stimmt.
- Als Nutzerin, die Geo Quest auf dem Homescreen installiert hat, möchte ich beim Antippen des Icons direkt in der App landen und nicht auf der Werbeseite.
- Als Ersteller möchte ich den KI-Weg unter einem Namen finden, der sagt, was ich dort tue, und auch dann, wenn ich im Creator schon Quests habe.

## Out of Scope
- **Weiterleitungen von alten Adressen** (`/about`, `/anleitung`, `/about/simulation`): Die App wird noch nicht live genutzt, es gibt keine geteilten Links oder QR-Codes, die erhalten werden müssten (Betreiber, 2026-10-24). Alte Adressen liefern künftig die 404-Seite.
- Neue Inhalte für die Landingpage: Der Inhalt von `/about` zieht unverändert um. Texte, Sektionen und FAQ bleiben, wie sie sind.
- Englische Fassung oder weitere Sprachen
- Einträge in Suchmaschinen-Konsolen (Google Search Console, Bing Webmaster Tools): Aufgabe des Betreibers, nicht der App. Die Sitemap wird dort nach dem Deploy eingereicht.
- Backlinks, Social-Media-Präsenz, Einträge in Verzeichnissen
- Eigene Unterseiten pro Zielgruppe (Schule, Familie, Jugendarbeit)
- Weiterleitung der alten Domain `geoquesty.vercel.app` auf die eigene Domain: Der Canonical zeigt bereits korrekt auf `geoquest.technolomagie.de`.
- Änderungen an Player, Creator-Editoren und Datenmodell

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Landingpage auf `/`
- [ ] Angenommen ein Besucher ruft `/` auf, dann sieht er die bisherige Landingpage (Hero, Vorteile, Video mit Kapiteln, Zielgruppen, Simulation, FAQ, Abschluss) mit unverändertem Inhalt.
- [ ] Angenommen `/` wird ausgeliefert, dann trägt die Seite den bisherigen Titel, die Beschreibung, Open-Graph-Angaben und das JSON-LD (`WebApplication`, `FAQPage`) der Landingpage, und der Canonical zeigt auf `/`.
- [ ] Angenommen `/` wird gebaut, dann bleibt die Seite statisch vorgerendert.
- [ ] Angenommen ein Besucher ruft `/about` auf, dann erscheint die 404-Seite.
- [ ] Angenommen ein Besucher ist auf `/`, wenn er „Zur App“ in der Kopfzeile antippt, dann landet er auf `/app`.
- [ ] Angenommen ein Besucher ist auf `/impressum` oder `/datenschutz`, wenn er den Zurück-Pfeil antippt, dann landet er auf `/`.

### App-Start auf `/app`
- [ ] Angenommen ein Besucher ruft `/app` auf, dann sieht er den bisherigen Startscreen (Logo, Headline, zwei Mode-Cards, schwebendes Burger-Menü) unverändert, inklusive Safe-Area-Verhalten aus PROJ-12.
- [ ] Angenommen ein Besucher ist auf `/app`, wenn er das Logo antippt, dann landet er auf `/`.
- [ ] Angenommen ein Besucher ist auf `/play` oder `/create`, wenn er den Zurück-Pfeil antippt, dann landet er auf `/app`.
- [ ] Angenommen `/app` wird auf 360×640 angezeigt, dann scrollt die Seite nicht (bestehendes PROJ-1-Kriterium, jetzt für `/app`).
- [ ] Angenommen ein Erstbesucher ruft `/app` auf, dann erscheinen Erststart-Dialog und Installations-Hinweis wie bisher auf `/`.
- [ ] Angenommen ein Erstbesucher ruft `/` (Landingpage) auf, dann erscheinen weder Erststart-Dialog noch Installations-Hinweis.
- [ ] Angenommen `/app` wird ausgeliefert, dann hat die Seite einen eigenen Titel und einen Canonical auf `/app`.

### Homescreen-Installation
- [ ] Angenommen das Manifest wird ausgeliefert, dann ist `start_url` gleich `/app`, `scope` gleich `/` und `id` unverändert `/`.
- [ ] Angenommen Geo Quest ist auf dem Homescreen installiert, wenn das Icon angetippt wird, dann öffnet sich `/app`.
- [ ] Angenommen `/` wird als installierte App geöffnet (Anzeige-Modus `standalone`), dann wechselt die Seite ohne Zutun auf `/app`.
- [ ] Angenommen `/` wird im normalen Browser geöffnet, dann bleibt die Landingpage stehen und es findet keine Weiterleitung statt.
- [ ] Angenommen eine installierte App öffnet `/impressum`, `/datenschutz` oder `/mit-ki-erstellen` über das Burger-Menü, dann bleibt sie in der App (kein Wechsel in den Browser), weil `scope` weiter `/` ist.

### KI-Seite `/mit-ki-erstellen`
- [ ] Angenommen ein Besucher ruft `/mit-ki-erstellen` auf, dann sieht er die bisherige Seite mit Prompt-Formular, Schritten und Hilfe.
- [ ] Angenommen die Seite wird angezeigt, dann lautet ihr Name in Menü, Eyebrow bzw. Überschrift „Mit KI erstellen“, und der Seitentitel enthält „Schnitzeljagd mit KI erstellen“ oder eine vom Betreiber bestätigte Formulierung.
- [ ] Angenommen ein Besucher ruft `/anleitung` auf, dann erscheint die 404-Seite.
- [ ] Angenommen das Burger-Menü ist offen, dann steht „Mit KI erstellen“ in der Gruppe „App“ direkt unter „Create“, nicht mehr in der Gruppe „Info“.
- [ ] Angenommen ein Besucher tippt auf `/` den Hero-Button „Mit KI erstellen“, dann landet er auf `/mit-ki-erstellen`.
- [ ] Angenommen die Leeransicht von `/create` wird angezeigt, dann führt ihr KI-Link auf `/mit-ki-erstellen`.
- [ ] Angenommen der Ersteller hat bereits Quests, wenn er das Aktionsmenü auf `/create` öffnet, dann sieht er neben „Neue Quest“ und „Quest importieren“ einen dritten Eintrag „Mit KI erstellen“, der auf `/mit-ki-erstellen` führt.
- [ ] Angenommen der Desktop-Header einer Info-Seite zeigt Textlinks, dann zeigt der KI-Link auf `/mit-ki-erstellen` und heißt „Mit KI erstellen“.
- [ ] Angenommen der Schalter `ANLEITUNG_VERFUEGBAR` steht auf `false`, dann greifen alle Einstiegspunkte (Menü mit „Bald“, entfallene CTAs, Ankündigungsseite) weiterhin, nur unter der neuen Adresse.

### Für Suchmaschinen und KI
- [ ] Angenommen `/robots.txt` wird abgerufen, dann antwortet die App mit HTTP 200, erlaubt allen Crawlern den Zugriff und nennt die Adresse der Sitemap.
- [ ] Angenommen `/sitemap.xml` wird abgerufen, dann antwortet die App mit HTTP 200 und listet `/`, `/mit-ki-erstellen`, `/impressum` und `/datenschutz` mit absoluten Adressen auf `https://geoquest.technolomagie.de`.
- [ ] Angenommen die Sitemap wird gelesen, dann enthält sie weder `/simulation` noch `/app`, `/play` oder `/create`.
- [ ] Angenommen `/llms.txt` wird abgerufen, dann antwortet die App mit HTTP 200 und liefert eine kurze Beschreibung in Markdown: was Geo Quest ist, für wen, was es kostet, dass kein Konto nötig ist, wie man eine Quest erstellt (von Hand und mit KI) und Links auf die wichtigsten Seiten.
- [ ] Angenommen `llms.txt` beschreibt Funktionen, dann ist jede Aussage durch die App gedeckt (dieselbe Regel wie in PROJ-13 Refinement 12: nichts Erfundenes, keine Nutzerzahlen, keine Versprechen, die die App nicht hält).
- [ ] Angenommen die Simulations-Route wird ausgeliefert, dann trägt sie weiterhin `noindex`.

### Nichts geht verloren
- [ ] Angenommen ein Link in der App zeigte bisher auf `/about`, `/anleitung` oder `/`, dann zeigt er nach dem Umbau auf das richtige neue Ziel. Kein interner Link führt auf eine 404-Seite.
- [ ] Angenommen die Quest-Simulation wird auf `/` angezeigt, dann lädt sie im iframe wie bisher, und fremde Seiten können sie weiterhin nicht einbetten.
- [ ] Angenommen Vercel Analytics zählt Seitenaufrufe, dann wird die Simulations-Route unter ihrer neuen Adresse weiterhin nicht mitgezählt.

## Edge Cases
1. **iPhone legt die gerade angezeigte Adresse auf den Homescreen statt `start_url`:** Wer von der Landingpage `/` aus installiert, bekäme sonst bei jedem Start die Werbeseite. Die Weiterleitung im Anzeige-Modus `standalone` fängt das ab, egal wie iOS sich verhält.
2. **Bestehende Installationen beim Betreiber und den Testern:** Sie haben `/` als Start gespeichert. Die Standalone-Weiterleitung führt sie auf `/app`, eine Neuinstallation ist nicht nötig.
3. **Standalone-Weiterleitung und Zurück-Taste (Android):** Die Weiterleitung ersetzt den Verlaufseintrag statt einen neuen anzulegen, sonst landet „Zurück“ auf `/` und leitet sofort wieder weiter.
4. **Installierte App, Nutzer tippt im Burger-Menü „Über“:** Die Landingpage `/` soll angezeigt werden und nicht sofort auf `/app` springen. Die Weiterleitung darf nur beim Start greifen, nicht bei einer Navigation innerhalb der App. Die genaue Unterscheidung klärt `/architecture`.
5. **Service Worker mit altem Stand:** Er cacht nur `/offline.html` und kennt keine Routen. Der Adresswechsel braucht keinen neuen Cache-Namen.
6. **Gespeicherte Daten:** `localStorage` hängt an der Origin, nicht am Pfad. Quests, Fortschritt und die Merker für Erststart-Dialog und Installations-Hinweis bleiben erhalten.
7. **404-Seite „Zurück zum Start“:** zeigt auf `/` (Landingpage). Wer aus der App kommt, erreicht `/app` von dort über „Zur App“.
8. **`metadataBase` auf einer Vorschau-Bereitstellung:** Sitemap und Canonical dürfen nicht auf eine Vercel-Vorschauadresse zeigen. Die Sitemap nutzt dieselbe Basis wie die übrigen Metadaten.

## Technical Requirements
- Kein neues Paket.
- `robots.txt` und `sitemap.xml` als Next.js-Metadaten-Routen (`app/robots.ts`, `app/sitemap.ts`), analog zu `app/manifest.ts`. `llms.txt` als statische Datei oder Route, entschieden in `/architecture`.
- Die Seiten bleiben statisch (`○` im Build), das gilt für `/`, `/app` und `/mit-ki-erstellen`.
- Die Standalone-Erkennung nutzt `matchMedia("(display-mode: standalone)")` und `navigator.standalone` (iOS), dieselbe Quelle wie `useInstallPrompt`. Keine zweite Erkennungslogik.
- Die `SAMEORIGIN`-Ausnahme in `next.config.ts`, der Analytics-Filter in `page-analytics.tsx` und die Ausnahme in `.claude/rules/security.md` ziehen mit der Simulations-Route um. Es bleibt eine einzige Ausnahme.
- Tests: rund 14 Dateien mit 176 Treffern auf `/about`, 10 Dateien mit `/anleitung` und 7 mit `goto("/")` werden absichtlich falsch. Sie sind auf die neuen Adressen zu ziehen, nicht zu löschen. Neu dazu: Wächter für die Standalone-Weiterleitung (greift nur im Standalone-Modus), für `robots.txt`, `sitemap.xml`, `llms.txt` und dafür, dass kein interner Link auf eine 404-Seite zeigt.

## Open Questions
- [x] Simulations-Route: `/simulation` statt `/about/simulation`? → Ja, vom Betreiber freigegeben. Die `SAMEORIGIN`-Ausnahme zieht mit um, es bleibt eine einzige Ausnahme; `.claude/rules/security.md` wird in `/frontend` auf den neuen Pfad gezogen (2026-10-24)
- [ ] Verhält sich iOS beim „Zum Home-Bildschirm“ nach `start_url` oder nach der gerade angezeigten Adresse? Nur am echten iPhone zu klären. Die Standalone-Weiterleitung deckt beide Fälle ab.
- [ ] Genauer Seitentitel und Beschreibung für `/mit-ki-erstellen` (Vorschlag: „Schnitzeljagd mit KI erstellen | Geo Quest“) und für `/app`.
- [ ] Wortlaut von `llms.txt`: Entwurf in `/frontend` aus den bestehenden Texten der Landingpage, Abnahme durch den Betreiber.
- [ ] Soll der Menü-Eintrag „Über“ künftig anders heißen (z. B. „Startseite“), weil er auf `/` zeigt?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Landingpage zieht auf `/`, Startscreen auf `/app` | Die Startadresse bekommt die meisten Links, wird bei Markensuchen gezeigt und von KI-Crawlern zuerst gelesen. Dort stand bisher fast kein Text. | 2026-10-24 |
| Homescreen-Icon öffnet `/app` | Installierte Nutzer wollen spielen oder erstellen, nicht die Werbeseite lesen. | 2026-10-24 |
| Manifest-`id` bleibt `/` | Eine geänderte `id` macht aus einer bestehenden Installation unter Android eine fremde App. | 2026-10-24 |
| Standalone-Weiterleitung von `/` auf `/app` | Sicherheitsnetz für ältere Installationen und für den Fall, dass iOS die angezeigte Adresse statt `start_url` speichert. Im Browser greift sie nicht. | 2026-10-24 |
| `/anleitung` wird `/mit-ki-erstellen`, Name „Mit KI erstellen“ | Auf der Seite steht ein Werkzeug, keine Anleitung. Der Name entspricht dem bestehenden Hero-CTA, Klick und Ziel heißen gleich. | 2026-10-24 |
| „Mit KI erstellen“ im Menü in Gruppe „App“ unter „Create“ | Es ist ein Weg, eine Quest zu bauen, keine Information über die App. | 2026-10-24 |
| Dritter Eintrag „Mit KI erstellen“ im Aktionsmenü auf `/create` | Bisher sah man den KI-Weg im Creator nur in der Leeransicht, also nur ohne eigene Quests. | 2026-10-24 |
| Keine Weiterleitungen von alten Adressen | Die App wird noch nicht live genutzt, es gibt nichts zu erhalten (Betreiber). Gilt für `/about`, `/anleitung` und die Simulations-Route gleichermaßen. | 2026-10-24 |
| `robots.txt`, `sitemap.xml` und `llms.txt` neu | Alle drei fehlten (404). Ohne Sitemap muss Google die Seiten selbst finden, `llms.txt` gibt KI-Systemen eine knappe, korrekte Beschreibung. | 2026-10-24 |
| App-Seiten (`/app`, `/play`, `/create`) nicht in die Sitemap, aber auch kein `noindex` | Sie haben ohne gespeicherte Quests keinen Inhalt für Suchende. Die Landingpage soll das Suchergebnis sein. | 2026-10-24 |
| Ein Feature statt Refinements in PROJ-1/12/13/14 | Die Änderung reicht über vier Features und gehört zusammen, analog zu PROJ-14. | 2026-10-24 |
| Simulations-Route zieht nach `/simulation`, die `SAMEORIGIN`-Ausnahme mit ihr | `/about` entfällt. Freigabe des Betreibers nach `security.md` liegt vor; es bleibt bei einer einzigen Ausnahme, fremde Seiten können weiterhin nicht einbetten. | 2026-10-24 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Seiten werden verschoben, nicht neu gebaut | Inhalt und Komponenten sind fertig und QA-geprüft. Ein Umzug hält die Änderung klein und die bestehenden Tests aussagekräftig. | 2026-10-24 |
| Seitenadressen zentral neben der Menü-Liste in `app-nav.ts` | Heute erkennt die Header-Regel den KI-Link am Text `"/anleitung"`. Verstreute Zeichenketten lassen bei einer Umbenennung Links still verschwinden. | 2026-10-24 |
| Startweiche im Browser statt Weiterleitung auf dem Server | Nur der Browser weiß, ob die Seite als installierte App läuft. Preis: kurzes Aufblitzen der Landingpage beim App-Start. | 2026-10-24 |
| Startweiche greift nur, wenn die Seite selbst als `/` geladen wurde | Eine Navigation innerhalb der App zu „Über“ lädt die Seite nicht neu und soll die Landingpage zeigen, nicht zurück in die App springen. | 2026-10-24 |
| Standalone-Erkennung aus `useInstallPrompt` wiederverwenden | Eine zweite Erkennung könnte von der ersten abweichen, dieselbe Fehlerklasse wie BUG-6. | 2026-10-24 |
| `robots.txt` und `sitemap.xml` als Next.js-Metadatendateien | Wie beim Manifest prüft Next.js das Format beim Bauen. | 2026-10-24 |
| `/simulation` in `robots.txt` nicht sperren | Ein gesperrter Crawler sieht das `noindex` nie und kann die Adresse trotzdem listen. | 2026-10-24 |
| Eine Basisadresse für Canonical, Sitemap und `robots.txt` | Laufen sie auseinander, verweist die Sitemap auf eine andere Domain als die Canonicals. | 2026-10-24 |
| `llms.txt` als statische, von Hand geschriebene Datei | Es ist Inhalt, keine Logik. Jeder Satz soll abgenommen werden. | 2026-10-24 |
| Manifest: nur `start_url` ändert sich, `scope` und `id` bleiben `/` | Bestehende Installationen bleiben dieselbe App, Menü-Ziele außerhalb von `/app` öffnen weiter in der App. | 2026-10-24 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

_Entworfen am 2026-10-24. Reines Frontend, kein Backend, kein neues Paket, keine Datenänderung._

### Überblick in einem Satz
Drei Seiten ziehen um, eine kleine Weiche sorgt dafür, dass die installierte App nie auf der Werbeseite startet, und drei kleine Dateien sagen Suchmaschinen und KI-Systemen, was es auf der Seite gibt.

### A) Neue Seitenstruktur

```
geoquest.technolomagie.de
+-- /                    Landingpage (bisher /about), im Info-Rahmen
|   +-- Startweiche      unsichtbar, nur in der installierten App aktiv
|   +-- Simulations-Handy  bettet /simulation als iframe ein
+-- /app                 Startscreen mit Mode-Cards (bisher /)
|   +-- Erststart-Dialog, Installations-Hinweis (ziehen mit um)
+-- /mit-ki-erstellen    Prompt-Formular (bisher /anleitung), im Info-Rahmen
+-- /simulation          Quest-Simulation (bisher /about/simulation), noindex
+-- /play, /create       unverändert, Zurück-Pfeil zeigt auf /app
+-- /impressum, /datenschutz   unverändert, Zurück-Pfeil zeigt auf /
+-- /robots.txt          neu
+-- /sitemap.xml         neu
+-- /llms.txt            neu
```

Die Seiten selbst werden **verschoben, nicht neu gebaut**. Inhalt, Komponenten und Layout bleiben gleich. Die Landingpage und die KI-Seite bleiben im bestehenden Info-Rahmen (`InfoPageShell`), der Startscreen behält seinen eigenen Aufbau.

### B) Navigation: wer zeigt wohin

| Stelle | bisher | künftig |
|---|---|---|
| „Zur App“ in der Info-Kopfzeile | `/` | `/app` |
| Logo auf dem Startscreen | `/about` | `/` |
| Zurück-Pfeil auf `/play`, `/create` | `/` | `/app` |
| Zurück-Pfeil auf Impressum, Datenschutz, KI-Seite | `/about` | `/` |
| Menü „Über“ | `/about` | `/` |
| Menü „Anleitung“ (Gruppe Info) | `/anleitung` | „Mit KI erstellen“ (Gruppe App, unter Create) → `/mit-ki-erstellen` |
| Hero-Button „Mit KI erstellen“ | `/anleitung` | `/mit-ki-erstellen` |
| Leeransicht `/create` | `/anleitung` | `/mit-ki-erstellen` |
| Aktionsmenü `/create` | zwei Einträge | dritter Eintrag „Mit KI erstellen“ |
| Desktop-Textlink der Info-Kopfzeile | „Anleitung“ | „Mit KI erstellen“ |
| 404-Seite „Zurück zum Start“ | `/` | `/` (jetzt die Landingpage) |

**Die Seitenadressen stehen künftig an einer Stelle** (neben der Menü-Liste in `app-nav.ts`), statt als Zeichenketten in einem Dutzend Dateien. Heute findet die Header-Regel den KI-Link über den Text `"/anleitung"`. Wird die Adresse an einer Stelle geändert und an der anderen nicht, verschwindet der Link still. Genau so eine Lücke soll der Umzug nicht hinterlassen.

Der Schalter `ANLEITUNG_VERFUEGBAR` steuert weiter alle Einstiegspunkte, jetzt auch den neuen Eintrag im Aktionsmenü.

### C) Die Startweiche (installierte App)

**Problem:** Das Manifest sagt künftig „starte auf `/app`“. Ob iPhones sich daran halten oder die Seite speichern, die beim Hinzufügen offen war, ist nicht sicher. Außerdem haben Betreiber und Tester ihre App mit `/` installiert.

**Lösung:** Auf der Landingpage sitzt ein unsichtbarer Baustein. Er prüft beim Laden zwei Dinge:
1. Läuft die Seite als installierte App? Die Prüfung `isStandalone()` aus dem Installations-Hinweis gibt es schon, sie wird wiederverwendet.
2. Wurde **die Seite selbst** mit der Adresse `/` geöffnet, also als App-Start oder Neuladen?

Nur wenn beides zutrifft, ersetzt er die Adresse durch `/app`. Der Verlaufseintrag wird ersetzt, nicht ergänzt, damit „Zurück“ auf Android nicht in einer Schleife landet.

**Warum Bedingung 2:** Tippt jemand in der installierten App im Menü auf „Über“, wechselt die App nur die Ansicht und lädt die Seite nicht neu. Der Browser merkt sich weiter, dass die Seite ursprünglich als `/app` geladen wurde. Die Weiche greift dann nicht, und die Landingpage bleibt stehen (Edge Case 4). Im normalen Browser ist Bedingung 1 nie erfüllt, die Weiche tut dort nichts.

**Preis:** Die Landingpage blitzt beim App-Start einen Augenblick auf, bevor `/app` kommt. Sie wird statisch ausgeliefert, also schnell, und der Fall betrifft nur Installationen, die auf `/` starten. Eine Weiterleitung auf dem Server ginge ohne Aufblitzen, kann den Anzeigemodus aber nicht erkennen.

### D) Für Suchmaschinen und KI

- **`robots.txt`:** erlaubt allen alles und nennt die Sitemap. `/simulation` wird **nicht** gesperrt: Ein gesperrter Crawler sähe das `noindex` der Seite nie und könnte die Adresse trotzdem ohne Inhalt listen.
- **`sitemap.xml`:** vier Adressen (`/`, `/mit-ki-erstellen`, `/impressum`, `/datenschutz`). Beide Dateien werden wie das Manifest als Next.js-Metadatendateien erzeugt. Next.js prüft das Format beim Bauen, ein Tippfehler fällt dann dort auf statt erst bei Google.
- **Gemeinsame Basisadresse:** Sitemap, `robots.txt` und Canonicals nutzen dieselbe Quelle wie heute `metadataBase` im Wurzel-Layout. Live ist das die eigene Domain (geprüft: Canonical von `geoquesty.vercel.app/about` zeigt auf `geoquest.technolomagie.de`). Die Basisadresse wird an einer Stelle definiert und an allen vier Stellen genutzt.
- **`llms.txt`:** eine statische Textdatei im `public`-Ordner, von Hand geschrieben. Sie ist Inhalt, keine Logik. Eine generierte Fassung hätte keinen Vorteil, und ein Mensch soll jeden Satz abnehmen (dieselbe Regel wie in PROJ-13: nichts Erfundenes).
- **Metadaten:** Die Landingpage behält Titel, Beschreibung, Open Graph und JSON-LD, nur der Canonical wechselt auf `/`. `/app` bekommt einen eigenen, schlichten Titel und einen Canonical auf `/app`. `/mit-ki-erstellen` bekommt einen suchnahen Titel (Wortlaut noch offen).

### E) Was mitzieht, damit nichts bricht

- **Einbettungsschutz:** Die `SAMEORIGIN`-Ausnahme in `next.config.ts` zieht auf `/simulation` um, die Regel in `.claude/rules/security.md` ebenso (Freigabe liegt vor). Das iframe auf der Landingpage zeigt auf die neue Adresse.
- **Analytics-Filter:** `page-analytics.tsx` verwirft künftig `/simulation` statt `/about/simulation`.
- **Manifest:** `start_url` wird `/app`. `scope` und `id` bleiben `/`, damit Android eine bestehende Installation als dieselbe App erkennt und Menü-Ziele wie Impressum in der App bleiben.
- **Service Worker:** unverändert. Er cacht nur die Offline-Seite und kennt keine Routen.
- **Gespeicherte Daten:** unberührt. `localStorage` hängt an der Domain, nicht an der Adresse.

### F) Gespeicherte Daten
Keine neuen. Das Feature speichert nichts.

### G) Pakete
Keine neuen.

### Hinweise für `/frontend`
- **Reihenfolge beim Ziehen der Tests:** Erst alle Aufrufe des Startscreens (`goto("/")`) auf `/app` umstellen, **dann** `/about` auf `/`. Umgekehrt würden die Landingpage-Tests auf `/app` umgebogen.
- **Statische Auslieferung im Build-Protokoll prüfen:** `/`, `/app` und `/mit-ki-erstellen` müssen als statisch (`○`) erscheinen. Die Startweiche läuft nur im Browser und darf daran nichts ändern.
- **Neue Wächter:** Startweiche greift nur bei installierter App und nur, wenn die Seite als `/` geladen wurde (Menü-Navigation zu „Über“ in der App bleibt auf der Landingpage); `robots.txt`, `sitemap.xml` und `llms.txt` antworten mit 200 und dem erwarteten Inhalt; ein Durchlauf über alle internen Links findet keine 404. Den Standalone-Modus kann Playwright nicht direkt einschalten. Er wird wie in PROJ-12 über eine vorgetäuschte `matchMedia`-Antwort hergestellt.
- **Nicht prüfbar:** wie das echte iPhone beim Hinzufügen zum Homescreen entscheidet. Die Weiche deckt beide Fälle ab, der Augenschein bleibt dem Betreiber.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
