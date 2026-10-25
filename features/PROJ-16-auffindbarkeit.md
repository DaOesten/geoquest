# PROJ-16: Auffindbarkeit — Landingpage auf `/`, App auf `/app`, KI-Seite umbenannt

## Status: Deployed
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
- ~~Angenommen der Schalter `ANLEITUNG_VERFUEGBAR` steht auf `false`, dann greifen alle Einstiegspunkte weiterhin, nur unter der neuen Adresse.~~ _Entfallen: Der Schalter wurde mit dem PROJ-14-Deploy vom 2026-10-24 (`ad239cd`) samt Ankündigung entfernt, bevor PROJ-16 gebaut wurde._

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

~~Der Schalter `ANLEITUNG_VERFUEGBAR` steuert weiter alle Einstiegspunkte.~~ _Überholt: Der Schalter existiert seit dem PROJ-14-Deploy vom 2026-10-24 nicht mehr._

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

## Implementation Notes (Frontend, 2026-10-24)

**Gebaut wie entworfen, kein neues Paket.** Die Seiten sind per `git mv` verschoben, nicht neu geschrieben: `src/app/page.tsx` → `src/app/app/page.tsx`, `(info)/about/page.tsx` → `(info)/page.tsx`, `(info)/anleitung` → `(info)/mit-ki-erstellen`, `(info)/about/simulation` → `(info)/simulation`. Im Build sind `/`, `/app`, `/mit-ki-erstellen`, `/simulation`, `/robots.txt` und `/sitemap.xml` statisch (`○`).

**Neu:**
- `ROUTES` in `src/lib/app-nav.ts`: alle Seitenadressen an einer Stelle. Menü, Kopfzeile, Zurück-Pfeile, Logo, Leeransicht, Aktionsmenü und Sitemap lesen daraus. `HEADER_NAV_LINKS` erkennt den KI-Link jetzt über `ROUTES.mitKiErstellen` statt über den Text `"/anleitung"`.
- `src/components/app-start-redirect.tsx`: die Startweiche auf `/`. Sie prüft `isStandalone()` aus `useInstallPrompt` und ob der Navigation-Timing-Eintrag des Dokuments auf `/` lautet; nur dann `router.replace("/app")`. Eine Client-Navigation zu „Über“ ändert diesen Eintrag nicht, die Landingpage bleibt stehen.
- `src/lib/site-url.ts`: eine Basisadresse für `metadataBase`, Sitemap und `robots.txt`.
- `src/app/robots.ts`, `src/app/sitemap.ts`, `public/llms.txt`.
- Dritter Eintrag „Mit KI erstellen“ im Aktionsmenü auf `/create` (oberhalb von „Quest importieren“, damit „Neue Quest“ als Hauptaktion dem FAB am nächsten bleibt). Die Leeransicht heißt jetzt ebenfalls „Mit KI erstellen“ statt „Quest mit KI bauen“.

**Geändert:** Manifest `start_url: "/app"` (`id`, `scope` bleiben `/`); `/app` hat Titel „Geo Quest — App“ und Canonical `/app`; `/mit-ki-erstellen` Titel „Schnitzeljagd mit KI erstellen“, Eyebrow „Mit KI erstellen“, Canonical; `SAMEORIGIN`-Ausnahme, Analytics-Filter, iframe und `.claude/rules/security.md` auf `/simulation`.

**Abweichung:** Das Kriterium zum Schalter `ANLEITUNG_VERFUEGBAR` entfällt, der Schalter wurde mit dem PROJ-14-Deploy vom selben Tag entfernt.

**`llms.txt` — zur Abnahme durch den Betreiber.** Jede Aussage stammt aus Landingpage, FAQ oder KI-Seite und ist dort im Code gedeckt (geprüft u. a.: Der Prompt verbietet erfundene Koordinaten, Stationen werden danach in der App gesetzt). Keine Nutzerzahlen, keine Versprechen über Offline oder Teilen per Link.

**Tests:** Neue Suite `tests/proj-16-auffindbarkeit.spec.ts` (27 je Engine): neue Adressen und 404 der alten, Navigation, Menü-Reihenfolge, Aktionsmenü mit vorhandener Quest, Erststart-Dialog nur auf `/app`, Durchlauf über alle internen Links ohne 404, Startweiche (greift in der App, nicht im Browser, ersetzt den Verlaufseintrag, lässt „Über“ in der App stehen), Manifest, Einbettung, `robots.txt`, `sitemap.xml`, `llms.txt`. Bestehende Suiten in 17 Dateien gezogen, nicht gelöscht: erst Startscreen `/` → `/app`, dann `/about` → `/`, `/anleitung` → `/mit-ki-erstellen`; Namen „Anleitung“/„Quest mit KI bauen“ → „Mit KI erstellen“; Hero-Zählungen auf `main` eingegrenzt, weil der KI-Link jetzt auch in der Kopfzeile so heißt. Der 404-Test „Zurück zum Start“ erwartet jetzt `/` (Landingpage).

**Ergebnisse (Production-Build im eigenen Worktree, Port 3200):** Unit **455/455**, Lint 0 Fehler, `tsc` ohne neue Fehler. Chrome: alle 17 gezogenen Dateien plus neue Suite grün (u. a. PROJ-16 27/27, PROJ-1 App-Shell 29/29, PROJ-13-Suiten 21–43 je Datei). Mobile Safari: alle betroffenen Dateien grün, jeweils gegen frisch gestarteten Server (PROJ-16 27/27, Elternseite 40/0 + 3 vorbestehende Skips, Video 27/27, Landing-QA 34/34).

**Gegenprobe:** Ohne die Bedingung „Dokument wurde als `/` geladen“ fällt genau der Test „„Über“ in der installierten App bleibt auf der Landingpage“, die übrigen drei Startweiche-Tests bleiben grün. Produktcode danach wiederhergestellt.

**Für künftige Läufe — Bild-Optimierer hängt unter Dauerlast:** Ein längerer Safari-Lauf meldete 33 Timeouts, alle ab 640 px Breite. Ursache war der Server, nicht der Code: Nach vielen Läufen beantwortete `next start` die Anfrage `logo-lockup-cutout.png` in 1080 px **als WebP** gar nicht mehr (per `curl` auch nach 240 s keine Antwort), andere Formate und kleinere Stufen sofort. Derselbe Request auf einem frischen Server: 0,09 s. Gegenprobe mit dem Stand vor PROJ-16 auf eigenem Port: dieselbe Datei besteht dort wie hier 34/34. **Bei Safari-Timeouts ab 640 px zuerst den Server neu starten**, dann Dateien einzeln laufen lassen.

## QA Test Results

**Geprüft am 2026-10-25** im eigenen Worktree auf `fd22b09` (Production-Build, Port 3200), getrennt vom Arbeitsverzeichnis des Betreibers. Chrome 152 (Desktop) und WebKit (iPhone-13-Profil). **Firefox nicht geprüft** (Binary fehlt auf dieser Maschine, wie in allen bisherigen QA-Läufen).

### Ergebnis: 35 von 35 Acceptance Criteria erfüllt, keine Bugs im Produkt — Approved
(36 Kriterien in der Spec, eines davon entfällt: der Schalter `ANLEITUNG_VERFUEGBAR` existiert seit dem PROJ-14-Deploy nicht mehr.)

| Block | Ergebnis | Belegt durch |
|---|---|---|
| Landingpage auf `/` (6) | erfüllt | Canonical `/`, statisch, `/about` 404, „Zur App“ → `/app`, Zurück-Pfeile der Rechtsseiten → `/` |
| App-Start auf `/app` (7) | erfüllt | Startscreen unverändert, Logo → `/`, Zurück-Pfeile `/play`/`/create` → `/app`, Erststart-Dialog **und** Installations-Hinweis nur auf `/app` |
| Homescreen-Installation (5) | erfüllt (bis auf Gerät) | Manifest `start_url /app`, `id`/`scope` `/`; Startweiche über `matchMedia` **und** über `navigator.standalone` (iOS-Weg); keine Weiterleitung im Browser; Deep-Link `/impressum` in der App bleibt |
| KI-Seite (8) | erfüllt | Titel „Schnitzeljagd mit KI erstellen“, Eyebrow, Menü unter „App“ nach „Create“, Hero-CTA, Leeransicht, Aktionsmenü mit vorhandener Quest, Desktop-Textlink |
| Suchmaschinen und KI (6) | erfüllt | `robots.txt` (text/plain), `sitemap.xml` (XML, genau vier absolute Adressen), `llms.txt` (UTF-8, Umlaute intakt), `/simulation` `noindex` |
| Nichts geht verloren (3) | erfüllt | Durchlauf über alle internen Links aus 7 Seiten plus Menü: keine 404; Simulation im iframe; Analytics-Filter auf `/simulation` |

### Über die Frontend-Phase hinaus geprüft
- **iOS-Weg der Startweiche:** Nur `navigator.standalone = true`, ohne `matchMedia`, leitet auf beiden Engines nach `/app`.
- **Neuladen der Landingpage in der installierten App** führt nach `/app`. So entworfen („App-Start oder Neuladen“) und als Preis der Startweiche dokumentiert, kein Bug. Eine Menü-Navigation zu „Über“ bleibt auf der Landingpage.
- **Aktive Menü-Einträge:** `/` → „Über“, `/mit-ki-erstellen` → „Mit KI erstellen“, `/impressum` → „Impressum“, `/app` → keiner.
- **Creator-Aktionsmenü auf 320×568:** drei Einträge im Bild, je 44 px, ohne Überlappung; geschlossen ist der KI-Eintrag nicht per Tab erreichbar (`tabindex -1`).
- **Konsole:** WebKit 0 Fehler auf `/`, `/app`, `/mit-ki-erstellen`, `/simulation`. Chrome nur der 404 des Vercel-Analytics-Skripts, das lokal nicht existiert.

### Security
Ohne Befund. Die Startweiche hat ein festes Ziel; `?redirect=` und `?next=//…` bleiben wirkungslos. Markup in der Adresse wird nicht ausgegeben. `//evil.example` bleibt auf der eigenen Domain (Next.js, vorbestehend). `X-Frame-Options: DENY` auf `/`, `/app`, `/mit-ki-erstellen`, `/impressum`; `SAMEORIGIN` nur auf `/simulation` (freigegebene Ausnahme). `nosniff` auch auf `robots.txt` und `sitemap.xml`. Keine neuen Eingaben, keine gespeicherten Daten.

### Tests
- **Unit:** neu `src/components/app-start-redirect.test.tsx` (9 Tests). Gegenprobe ohne die Bedingung „Dokument als `/` geladen“: genau der zuständige Test fällt. Gesamt **464/464**.
- **E2E neu:** `tests/proj-16-qa.spec.ts` (15 je Engine). Zusammen mit `proj-16-auffindbarkeit.spec.ts` **42/42 je Engine**. Gegenprobe gegen den Stand vor PROJ-16 (Chrome): **38 von 42 fallen**. Grün bleiben vier Wächter, die in beiden Ständen gelten müssen (Deep-Link `/impressum`, aktiver Menü-Eintrag auf `/impressum`, kein Markup aus der Adresse, `noindex` auf der Simulations-Adresse).
- **Ein Testfehler aus der Frontend-Phase gefunden und gezogen:** `proj-13-landing-page.spec.ts` „Zur App führt zum Start-Screen“ erwartete noch `/\/$/`. Auf Chrome bestand er, weil die Prüfung lief, solange die Seite noch auf `/` stand — er hätte jedes Ziel durchgelassen. Jetzt `/\/app$/`. Das Produkt war richtig.
- **Gesamtregression:** Chrome **828 passed / 0 failed**. Mobile Safari **778 passed / 34 failed**: 33 Timeouts auf Breiten ab 640 px plus der genannte Testfehler. Alle betroffenen Dateien mit frischem Server und leerem Bild-Cache nachgeprüft: grün, bis auf den BUG-7-Test in `proj-1-kofi-support` (siehe unten).
- **Gegenprobe der Timeouts gegen den Stand vor PROJ-16** (`1f9d5b7`, eigener Build auf Port 3300, identische Bedingungen, je zwei Runden): `proj-13-about-eltern` fällt dort in Runde 1 mit **denselben 6 Tests**, Runde 2 grün; `proj-1-kofi-support` fällt dort in Runde 2 mit **demselben BUG-7-Test**. Die Timeouts sind damit ein zufälliges Umgebungsproblem und nicht von PROJ-16 verursacht.

### Beobachtungen ohne Bug-Status
- **Lokaler Bild-Optimierer hängt zufällig (Testumgebung):** `next start` beantwortet einzelne große WebP-Stufen (Safari, Pixeldichte 3, ab 640 px) mitunter nicht mehr, in einer Messung `logo-lockup-cutout.png` in 1080 px nach 240 s ohne Antwort, im Standardformat in 0,08 s. Ein Neustart hilft oft, aber nicht immer; Cache leeren und Abbrüche simulieren lösten es nicht reproduzierbar aus. Live auf Vercel nie beobachtet. Für künftige Läufe: Safari-Timeouts ab 640 px gegen den Vorgängerstand gegenprüfen, bevor sie als Regression gelten.
- **Echtes iPhone:** ob iOS beim „Zum Home-Bildschirm“ `start_url` oder die offene Seite speichert, bleibt am Gerät zu prüfen. Die Startweiche deckt beide Fälle ab.
- **`llms.txt`:** inhaltlich gegen den Code geprüft, die Abnahme des Wortlauts liegt beim Betreiber.

**Production-Ready: JA.**

## Nachtrag nach der QA: Abgrenzung zu Actionbound und Faktenangaben (2026-10-25)
Auf Wunsch des Betreibers, nach der QA ergänzt (Commits `c755918`, `7d23237`, Testkorrektur danach). Reiner Text, kein neuer Code-Pfad.

- **Neunte FAQ-Frage auf `/`:** „Was unterscheidet Geo Quest von Actionbound?“. Sie speist wie alle FAQ-Einträge auch das `FAQPage`-JSON-LD. Nur nachprüfbare Aussagen (vergleichende Werbung), keine Preise, und sie nennt offen, was Actionbound mehr kann (Foto-/Videoaufgaben, Sammlung fertiger Schnitzeljagden).
- **`llms.txt`:** neuer Abschnitt „Vergleich mit ähnlichen Apps“ (Actionbound, Abgrenzung zu Geocaching), Betreiber-Satz wie im Impressum und „Stand: Oktober 2026“.
- **Einheitliche Begriffe:** FAQ „Wie erstelle ich eine Quest?“ sagt „Stationen“ statt „Ziele“.
- **Grounding Page bewusst nicht gebaut:** Eine eigene Faktenseite hätte dieselben Angaben ein drittes Mal neben `llms.txt` und FAQ/JSON-LD geführt, mit dem Risiko, auseinanderzulaufen. Übernommen wurden nur die Ratschläge Stand-Datum, Absender und einheitliche Begriffe.

**Tests:** Vier Assertions gezogen, nicht gelöscht: Fragenzahl 8 → 9 in drei Tests (`proj-13-about-eltern` zweimal, `proj-13-landing-refinement`) und der Wortlaut „Stationen auf der Karte“ (`proj-13-info-refinement`). Eine davon (`nur die Kosten-Antwort trägt einen Link`, feste Liste mit acht Einträgen) fiel erst im Chrome-Lauf auf, auf Safari wird sie übersprungen. Unit **464/464**, Lint 0 Fehler, Build sauber. PROJ-13-, PROJ-16- und Ko-fi-Suiten gegen den Production-Build: **Mobile Safari 213 passed / 4 skipped**, **Chrome 247 passed / 1 failed** (die genannte Liste), danach korrigiert, und der Ko-fi-FAQ-Block auf beiden Engines **12/12**. Zwei Safari-Timeouts beim Nachlauf waren wieder der hängende Bild-Optimierer (1080-px-WebP des Logos, 15 s ohne Antwort), nach Neustart des Servers grün.

**Vor dem Deploy beim Betreiber:** die beiden Aussagen über Actionbound auf actionbound.com bestätigen (Lizenz für Schulen und Organisationen, Spielen nur mit deren App).

## Deployment
**Am 2026-10-25 nach Production deployt** (Tag `v1.52.0-PROJ-16`, Push `5726957..e7c406e`) — live auf https://geoquest.technolomagie.de und https://geoquesty.vercel.app nach **56 s**, belegt an `/llms.txt` (vorher 404, jetzt 200).

**Vorab geprüft:** Die beiden Aussagen über Actionbound stehen in deren eigener FAQ: „Bounds can only be played using the Actionbound app“ und eine kostenpflichtige Lizenz ist nötig „at educational institutions“ sowie für Unternehmen, Vereine und Organisationen. Alle sieben ausstehenden Commits gehörten zu PROJ-16, keine Secrets im Repo.

**Live verifiziert, beide Domains:** 13 Endpunkte HTTP 200 (`/`, `/app`, `/play`, `/create`, `/mit-ki-erstellen`, `/simulation`, `/impressum`, `/datenschutz`, `robots.txt`, `sitemap.xml`, `llms.txt`, Manifest, `sw.js`); `/about` und `/anleitung` liefern wie entschieden 404, ohne Weiterleitung. `robots.txt` mit Sitemap-Verweis, `sitemap.xml` mit genau vier absoluten Adressen, Manifest `start_url /app` bei `id`/`scope` `/`, Canonical `/`, Actionbound-Frage im HTML und JSON-LD, `llms.txt` mit Vergleichsabschnitt. HSTS, `nosniff`, `X-Frame-Options: DENY` auf `/`, `SAMEORIGIN` nur auf `/simulation`.

**PROJ-16-Suiten direkt gegen Production:** Chrome und Mobile Safari je **41/42**. Der eine Fehlschlag je Engine war ein Testfehler: Der Wächter „Umlenk-Parameter auf `/` ohne Wirkung“ erwartete fest `localhost`, live landet die Startweiche korrekt auf `https://geoquest.technolomagie.de/app`. Er prüft jetzt gegen die Origin der `baseURL` und besteht gegen Production auf beiden Engines; eine Weiterleitung auf eine fremde Domain ließe ihn weiterhin fallen.

**Konsole:** WebKit 0 Fehler und 0 fehlgeschlagene Requests auf `/`, `/app`, `/mit-ki-erstellen`; Chrome nur der bekannte `/favicon.ico`-404. Ein vermeintlicher Redirect auf `/` in WebKit war ein `304 Not Modified` beim zweiten Aufruf (Playwright wertet 3xx als Redirect), keine Weiterleitung.

**Offen:** iOS-Verhalten beim „Zum Home-Bildschirm“ am echten Gerät, Firefox, und ob Suchmaschinen und KI-Systeme `llms.txt` tatsächlich nutzen (nicht messbar). Empfohlen: die Sitemap in der Google Search Console einreichen.
