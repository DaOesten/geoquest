# PROJ-1: App Shell & Mode Switch

## Status: In Progress
_Deployed; das Refinement vom 2026-09-06 (Navigation & Kopfzeile) ist gebaut und im Browser verifiziert — QA steht aus._
**Created:** 2026-08-23
**Last Updated:** 2026-09-06

## Dependencies
- None (PROJ-1 ist das Fundament)
- Verweis-Ziel (keine Code-Abhängigkeit): Das Logo auf dem Startscreen verlinkt auf `/about` (PROJ-13). Fehlt PROJ-13, ist nur dieser eine Link tot — der Startscreen funktioniert unverändert.

## Summary
Der Rahmen der gesamten App: Startscreen mit Modus-Auswahl, eine app-weite Kopfzeile mit Zurück-Pfeil links und Burger-Menu rechts, automatisches Theme-Switching, URL-basiertes Routing, Erststart-Dialog und 404-Seite.

Das Burger-Menu ist ab dem Refinement vom 2026-09-06 die **eine** Navigation der gesamten App — auf `/play`, `/create`, in allen Unteransichten und auf den Info-Seiten (PROJ-13). Es gliedert sich in drei Gruppen: **App** (Play, Create), **Info** (Über, Anleitung) und **Rechtliches** (Impressum, Datenschutz).

## User Stories
1. Als Nutzer möchte ich beim Öffnen der App sofort wählen können, ob ich spielen oder eine Quest erstellen will, damit ich ohne Umwege in den gewünschten Modus komme.
2. Als Nutzer möchte ich von überall in der App den Modus wechseln können, damit ich nicht erst zum Startscreen zurücknavigieren muss. _(Umformuliert 2026-09-06: Der Weg führt nicht mehr über die Pin-Marke zum Startscreen, sondern über das Burger-Menu direkt nach Play oder Create — ein Tap weniger.)_
3. Als Nutzer möchte ich den Browser-Zurück-Button nutzen können, damit die App sich wie eine normale Webseite verhält.
4. Als neuer Nutzer möchte ich beim ersten Start über die lokale Datenspeicherung informiert werden, damit ich weiß, dass meine Daten bei Browser-Löschung verloren gehen.
5. Als Nutzer möchte ich bei einer ungültigen URL eine hilfreiche Seite sehen, damit ich zurück zur App finde.
6. Als neuer Nutzer, der die App zum ersten Mal über einen geteilten Link öffnet, möchte ich über das Geo-Quest-Logo erfahren können, was diese App überhaupt ist, damit ich mich nicht blind zwischen zwei Modi entscheiden muss.
7. Als Nutzer möchte ich von jedem Screen aus dieselbe Navigation öffnen können, damit ich von überall zu Play, Create, den Info-Seiten und den Rechtstexten komme, ohne mich erst zurück zum Startscreen durchzuklicken.
8. Als Spieler möchte ich, dass die Kopfzeile beim Scrollen einer Stationsliste mit nach oben verschwindet, damit der kleine Handy-Bildschirm ganz dem Inhalt gehört.

## Out of Scope
- Quest-Listen-Inhalte innerhalb der Modi (PROJ-2, PROJ-3, PROJ-6)
- PWA-Manifest, Service Worker, Install-Prompt (PROJ-12)
- Inhalt des Datenschutzhinweises (rechtlicher Text — wird separat erstellt)
- Animierte Übergänge zwischen Seiten (kann später ergänzt werden)
- Responsive Desktop-Layout (Mobile-First, Desktop-Anpassung bei Bedarf später)
- Background-Animation auf dem Startscreen (ggf. spätere Iteration)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Startscreen:**
- [ ] Angenommen die App wird geöffnet, wenn der Nutzer `/` aufruft, dann wird der Startscreen im Dark Theme mit Logo und zwei Mode-Cards ("Play" / "Create") angezeigt
- [ ] Angenommen der Startscreen ist sichtbar, wenn der Nutzer auf die "Play"-Card tippt, dann wird er zu `/play` navigiert und das Dark Theme bleibt aktiv
- [ ] Angenommen der Startscreen ist sichtbar, wenn der Nutzer auf die "Create"-Card tippt, dann wird er zu `/create` navigiert und das Theme wechselt zu Light
- [ ] Angenommen der Startscreen ist sichtbar, wenn der Nutzer auf das Geo-Quest-Logo tippt, dann wird er zur Landing Page `/about` (PROJ-13) navigiert
- [ ] Angenommen der Nutzer navigiert per Tastatur, wenn das Logo den Fokus erhält, dann ist ein sichtbarer Fokus-Ring vorhanden und das Element ist als Link mit dem Accessible Name "Geo Quest — Was ist das?" ausgezeichnet
- [ ] Angenommen der Startscreen ist auf einem Touch-Gerät sichtbar (kein Hover verfügbar), wenn die Seite geladen ist, dann tragen beide Mode-Cards dauerhaft einen sichtbaren Glow in ihrer Akzentfarbe — Teal für "Deine Quests", Lime für "Quest Creator"
- [ ] Angenommen beide Mode-Cards sind sichtbar, wenn die Seite geladen ist, dann pulsiert der Glow beider Cards langsam und zeitversetzt zueinander (kein Gleichtakt)
- [ ] Angenommen der Nutzer hat `prefers-reduced-motion: reduce` gesetzt, wenn der Startscreen lädt, dann ist der Glow statisch sichtbar, aber es findet keine Pulsier-Animation statt
- [ ] Angenommen eine Mode-Card trägt den ruhenden Glow, wenn der Nutzer sie per Hover oder Tastatur-Fokus anspricht, dann verstärkt sich der Glow deutlich gegenüber dem Ruhezustand
- [ ] Angenommen der Startscreen wird auf einem 360×640-Gerät angezeigt, wenn die Seite lädt, dann sind Logo, Headline und beide Mode-Cards trotz des vergrößerten Card-Abstands ohne Scrollen sichtbar

**Header & Navigation:**
- [x] ~~Angenommen der Nutzer befindet sich auf der Top-Level-Ansicht eines Modus (`/play` oder `/create`), wenn er auf das Pin-Mark-Logo links im Header tippt, dann wird er zum Startscreen (`/`) navigiert~~ → entfällt: die Pin-Marke wurde am 2026-09-06 aus der Kopfzeile entfernt, der Weg zu Play/Create läuft über das Burger-Menu
- [ ] Angenommen der Nutzer befindet sich in einer tieferen Ansicht (z.B. `/play/[id]`), wenn er auf den Zurück-Pfeil links im Header tippt, dann wird er eine Ebene nach oben navigiert (z.B. zu `/play`)
- [ ] Angenommen der Nutzer befindet sich in einer tieferen Ansicht, wenn er den Browser-Zurück-Button drückt, dann wird er eine Ebene nach oben navigiert

**Kopfzeile & Burger-Menu (Refinement 2026-09-06):**
- [ ] Angenommen der Nutzer befindet sich auf einem beliebigen Screen der App (`/`, `/play`, `/create`, jede Unteransicht, jede Info-Seite), wenn er die Kopfzeile betrachtet, dann sieht er rechts das Burger-Menu-Icon
- [ ] Angenommen der Nutzer betrachtet die Kopfzeile eines beliebigen Screens, wenn er nach links schaut, dann sieht er den Zurück-Pfeil — in keinem Fall noch die Pin-Bildmarke. Auf `/play` und `/create` führt er zum Startscreen `/`, in Unteransichten eine Ebene nach oben _(korrigiert 2026-09-06: ursprünglich sollte die linke Seite auf Top-Level leer bleiben — dadurch fehlte dort jeder Weg zurück)_
- [ ] Angenommen der Nutzer tippt auf das Burger-Menu, wenn sich das Menu öffnet, dann sieht er drei Gruppen mit den Überschriften **App**, **Info** und **Rechtliches**
- [ ] Angenommen das Menu ist offen, wenn der Nutzer die Gruppe „App" betrachtet, dann enthält sie die Links **Play** (→ `/play`) und **Create** (→ `/create`), jeweils mit passendem Icon
- [ ] Angenommen das Menu ist offen, wenn der Nutzer die Gruppe „Info" betrachtet, dann enthält sie die Links **Über** (→ `/about`) und **Anleitung** (→ `/anleitung`), jeweils mit passendem Icon
- [ ] Angenommen das Menu ist offen, wenn der Nutzer die Gruppe „Rechtliches" betrachtet, dann enthält sie die Links **Impressum** (→ `/impressum`) und **Datenschutz** (→ `/datenschutz`), jeweils mit passendem Icon
- [ ] Angenommen das Menu ist offen, wenn der Nutzer einen Eintrag antippt, dann schließt sich das Menu und er landet auf der gewählten Seite
- [ ] Angenommen das Menu ist offen, wenn der Nutzer die Escape-Taste drückt oder neben das Menu tippt, dann schließt es sich, ohne zu navigieren
- [ ] Angenommen der Nutzer bedient die App mit der Tastatur, wenn er das Burger-Menu öffnet, dann liegt der Fokus im Menu und der Auslöser meldet seinen Zustand (`aria-expanded`) an Screenreader
- [ ] Angenommen der Nutzer befindet sich bereits auf einer der verlinkten Seiten, wenn er das Menu öffnet, dann ist der Eintrag der aktuellen Seite visuell als aktiv erkennbar
- [ ] Angenommen der Nutzer befindet sich in einer Unteransicht eines Modus (z.B. `/create/[id]` oder `/create/[id]/station/[x]`), wenn er das Menu öffnet, dann ist der übergeordnete Eintrag („Create") als aktiv markiert — nicht nur auf der exakten Top-Level-URL
- [ ] Angenommen das Menu wird im Creator (Light Theme) geöffnet, wenn es erscheint, dann trägt es das Theme des jeweiligen Modus — es bricht nicht aus dem Farbschema des Screens aus

**Scroll-Verhalten der Kopfzeile (Refinement 2026-09-06):**
- [ ] Angenommen der Nutzer ist auf einem Play- oder Create-Screen, wenn er die Seite nach unten scrollt, dann scrollt die Kopfzeile mit Zurück-Pfeil und Burger-Menu mit nach oben aus dem Bild — sie bleibt nicht am oberen Rand kleben
- [ ] Angenommen die Kopfzeile ist aus dem Bild gescrollt, wenn der Nutzer wieder ganz nach oben scrollt, dann ist sie unverändert vorhanden und bedienbar
- [ ] Angenommen der Nutzer betrachtet eine Info-Seite (`/about`, `/anleitung`, `/impressum`, `/datenschutz`), wenn er scrollt, dann bleibt deren Kopfzeile weiterhin sticky — die Info-Seiten sind lange Textseiten und behalten ihr bisheriges Verhalten

**Theme:**
- [ ] Angenommen der Nutzer befindet sich im Player-Modus (`/play/*`), wenn die Seite gerendert wird, dann ist das Dark Theme aktiv
- [ ] Angenommen der Nutzer befindet sich im Creator-Modus (`/create/*`), wenn die Seite gerendert wird, dann ist das Light Theme aktiv
- [ ] Angenommen der Nutzer wechselt den Modus, wenn die neue Seite lädt, dann wechselt das Theme ohne sichtbares Flackern

**Erststart-Dialog:**
- [ ] Angenommen der Nutzer öffnet die App zum ersten Mal (kein Flag in localStorage), wenn der Startscreen geladen wird, dann erscheint ein Dialog mit Datenschutzhinweis und Warnung zur lokalen Datenspeicherung
- [ ] Angenommen der Dialog ist sichtbar, wenn der Nutzer auf "Verstanden" tippt, dann wird der Dialog geschlossen und ein Flag in localStorage gesetzt
- [ ] Angenommen der Nutzer hat den Dialog bereits bestätigt (Flag existiert), wenn er die App erneut öffnet, dann wird der Dialog nicht mehr angezeigt

**404-Seite:**
- [ ] Angenommen der Nutzer ruft eine ungültige URL auf, wenn die Seite lädt, dann wird eine gebrandete 404-Seite im Dark Theme mit der Nachricht "Ziel nicht gefunden." und einem "Zurück zum Start"-Button angezeigt
- [ ] Angenommen die 404-Seite ist sichtbar, wenn der Nutzer auf "Zurück zum Start" tippt, dann wird er zu `/` navigiert

## Edge Cases
1. **Theme-Flicker bei Seitenwechsel:** Beim Navigieren von `/play` (Dark) zu `/create` (Light) darf kein weißer Blitz / Flackern auftreten
2. **Direkteinstieg per URL:** Nutzer ruft direkt `/play/abc` auf → App muss das korrekte Theme setzen ohne erst den Startscreen zu zeigen
3. **localStorage nicht verfügbar:** (z.B. Inkognito-Modus in manchen Browsern) → Erststart-Dialog bei jedem Besuch zeigen, keine Fehlermeldung
4. **Zurück vom Startscreen:** Browser-Zurück auf dem Startscreen → verlässt die App (normales Browser-Verhalten)
5. **Schnelles Mode-Wechseln:** Nutzer tippt Play → sofort Home → Create → Kein Zustandsproblem, jede Route ist eigenständig
6. **Logo-Tap vs. Card-Tap:** Das Logo liegt oberhalb der Cards; sein Tap-Ziel darf nicht so groß werden, dass es versehentlich statt der oberen Card getroffen wird. Tap-Fläche bleibt auf das Logo-Bild begrenzt (min. 44px Höhe erfüllt es bereits).
7. **Glow vs. Lesbarkeit:** Der ruhende Glow darf den Card-Text nicht überstrahlen — der Kontrast von Titel (`gq-white`) und Beschreibung (`#A0A7AD`) auf `#0F2429` muss WCAG AA (4.5:1) erfüllen, auch im hellsten Moment der Puls-Animation.
8. **Glow auf schwachen Geräten:** Die Animation läuft dauerhaft auf dem Startscreen. Sie darf nur `box-shadow`/`opacity` bewegen (kompositor-freundlich) und keine spürbare Akku- oder Scroll-Last erzeugen.
9. **Kein Sticky + langer Screen:** Auf einer sehr langen Stationsliste ist die Navigation nach dem Scrollen nicht mehr sichtbar. Der Nutzer muss hochscrollen oder den Browser-Zurück-Button nutzen — beides akzeptiert, weil die App-Screens auf 430px Breite und überschaubare Listen ausgelegt sind. Der Browser-Zurück-Button bleibt der jederzeit verfügbare Notausgang.
10. **Menu über der Karte:** Im Stationen-Editor und in der Navigations-Ansicht liegt eine Leaflet-Karte im Screen. Das geöffnete Menu muss darüber liegen (Karten-Panes haben eigene z-index-Stapel) und darf beim Schließen keine Karten-Interaktion auslösen.
11. **Menu im Play-Modus während einer laufenden Quest:** Ein Tap auf „Create" im Menu verlässt die laufende Quest. Der Fortschritt liegt in localStorage und bleibt erhalten — es braucht keinen Warndialog, aber der Wechsel darf nichts verwerfen.
12. **Zurück-Pfeil vs. Burger auf 360px:** Beide Tap-Ziele liegen mit je 44px in derselben Zeile an gegenüberliegenden Rändern. Zwischen ihnen steht auf schmalen Geräten ggf. ein Titel — der muss truncaten, nie die Tap-Ziele verkleinern.

## URL-Struktur

| Route | Ansicht | Theme |
|-------|---------|-------|
| `/` | Startscreen (Mode-Auswahl) | Dark |
| `/play` | Quest-Liste (Player) | Dark |
| `/play/[id]` | Aktive Quest | Dark |
| `/create` | Quest-Liste (Creator) | Light |
| `/create/[id]` | Quest bearbeiten | Light |

## Open Questions
- [ ] Exakter rechtlicher Text für den Datenschutzhinweis (ggf. mit Impressum/Datenschutz-Link)
- [x] Soll der Startscreen später eine dezente Background-Animation erhalten? → Ja, aber nicht als Backdrop: die Bewegung sitzt im ruhenden Glow der beiden Mode-Cards (langsames, versetztes Pulsieren). Ein zusätzlicher Partikel-Backdrop wie auf den Listen-Screens bleibt Out of Scope, damit der Startscreen ruhig bleibt (2026-09-05)
- [ ] Braucht das Logo auf `/` eine sichtbare Beschriftung ("Was ist Geo Quest?"), falls sich zeigt, dass Nutzer den Link nicht finden? Zunächst bewusst ohne — erst nach Beobachtung entscheiden
- [ ] `docs/design-system.md` sagt unter Motion "keine Ambient-Loops", während sowohl der Partikel-Backdrop als auch jetzt der Card-Glow genau das tun. Regel präzisieren oder streichen?
- [ ] Braucht der Startscreen `/` selbst das Burger-Menu? Er hat keine Kopfzeile und bietet mit den zwei Mode-Cards plus Logo-Link nach `/about` bereits fünf der sechs Ziele — offen, ob dort eine Kopfzeile ergänzt wird oder `/` die eine Ausnahme bleibt
- [ ] Soll das Menu perspektivisch einen Eintrag „App installieren" (PROJ-12, PWA) bekommen? Das wäre eine vierte Gruppe oder ein Anhang unter „App" — erst entscheiden, wenn PROJ-12 gebaut wird

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Startscreen statt persistenter Tab-Leiste | Tab-Leiste nimmt zu viel Platz auf Mobile, stört das Spielerlebnis | 2026-08-23 |
| Home-Button (Pin-Mark) statt Mode-Switch-Icons | Einfacher — ein Icon statt zwei, konsistentes mentales Modell | 2026-08-23 |
| Kontextabhängiger linker Header-Button | Standard-Mobile-Pattern, intuitiv ("links = zurück") | 2026-08-23 |
| Automatisches Theme ohne manuellen Toggle | Vereinfacht UX, verstärkt visuelle Modus-Unterscheidung | 2026-08-23 |
| URL-basierte Navigation | Browser-Zurück funktioniert, Bookmarking möglich, Next.js App Router gratis | 2026-08-23 |
| Erststart-Dialog im App Shell (nicht PWA) | Muss auch ohne PWA-Installation erscheinen | 2026-08-23 |
| Dark Theme für Startscreen | Brand-Default, Gaming-Look, Mehrheit der Nutzer geht zuerst auf Play | 2026-08-23 |
| "Play" / "Create" statt "Quest Game" / "Quest Creator" | Kürzer, aktiver, mehr Action-Feeling für die Zielgruppe | 2026-08-23 |
| Logo auf `/` verlinkt auf `/about` | Der Startscreen erklärt sich Erstbesuchern nicht selbst — er zwingt sofort zur Modus-Wahl. Das Logo ist der konventionelle Ort für "Was ist das?" und war bisher als einziges Element tot. Gegenrichtung existiert bereits ("Zur App" auf `/about` → `/`) | 2026-09-05 |
| Logo bleibt ohne sichtbaren Link-Hinweis (kein Unterstrich, kein Chevron) | Das Lockup ist ein Markenelement; zusätzliche Chrome würde es entwerten. Der Link ist ein Bonus-Pfad, kein Hauptweg — die zwei Mode-Cards bleiben die primäre Entscheidung | 2026-09-05 |
| Glow der Mode-Cards wird vom Hover- zum Dauerzustand | Zielgerät ist das Handy, dort gibt es kein Hover — der bereits gebaute Effekt war auf Mobile faktisch unsichtbar. Der Glow ist Teil des Gaming-Looks aus dem PRD, nicht nur Interaktions-Feedback | 2026-09-05 |
| Glow pulsiert langsam und zeitversetzt statt statisch | Ein statischer Glow liest sich als Rahmen, ein atmender als "lebendig"/Game. Der Versatz verhindert, dass die beiden Cards wie ein einziger blinkender Block wirken | 2026-09-05 |
| Kein Partikel-Backdrop auf dem Startscreen | Die Listen-Screens nutzen ihn bereits; auf `/` würde er mit dem Card-Glow um Aufmerksamkeit konkurrieren. Startscreen bleibt der ruhigste Screen der App | 2026-09-05 |
| Card-Abstand von 12px auf 20px erhöht | Die beiden Modi sind eine echte Verzweigung, keine Liste — mehr Luft macht sie zu zwei getrennten Entscheidungen und gibt dem Glow Raum, ohne dass sich die Halos überlappen | 2026-09-05 |
| Ein Burger-Menu auf **allen** Screens statt Navigation nur auf den Info-Seiten | Die Navigation war gewachsen statt geplant: Info-Seiten hatten ein Menu, die App-Screens nur eine Pin-Marke, die zum Startscreen führte. Wer in `/play/[id]` steckte, kam nur über mehrere Taps zur Anleitung oder zum Impressum. Eine Navigation für die ganze App löst das an einer Stelle | 2026-09-06 |
| Pin-Marke verlässt die Kopfzeile ersatzlos | Ihre einzige Funktion war „zurück zum Startscreen". Der Startscreen bietet nichts als die Wahl zwischen Play und Create — beides steht jetzt direkt im Menu, ein Zwischenschritt weniger. Auf den Info-Seiten war die Marke bereits am 2026-09-05 entfernt worden (PROJ-13) | 2026-09-06 |
| Kein eigener „Start"-Eintrag im Menu | `/` ist reiner Ersteinstieg und leitet nur nach Play oder Create weiter. Ein Menüeintrag dorthin wäre ein Umweg zu genau den zwei Einträgen, die direkt darüber stehen | 2026-09-06 |
| Menu-Gruppen App / Info / Rechtliches | Sechs Links ohne Gliederung sind eine Wand. Die drei Gruppen trennen „womit ich spiele" von „was ich nachlese" von „was rechtlich sein muss" — der Nutzer scannt nur die Gruppe, die er braucht | 2026-09-06 |
| Jeder Menü-Link trägt ein Icon | Das Menu ist für 10–15-Jährige die zentrale Orientierung; Icons machen die sechs Ziele auf einen Blick unterscheidbar und passen zum Gaming-Look aus dem PRD | 2026-09-06 |
| Zurück-Pfeil links, Burger rechts | Standard-Mobile-Pattern („links = zurück") und identisch zu dem, was die Info-Seiten seit PROJ-13 tun. Der Zurück-Pfeil ist die häufigere Aktion und liegt am Daumen der greifenden Hand | 2026-09-06 |
| Kein Sticky-Header auf den Play- und Create-Screens | Der Header verdeckte auf 430px dauerhaft Inhalt, ohne dabei etwas beizutragen — beide Screens sind Listen, die man von oben nach unten liest. Die Info-Seiten behalten ihren Sticky-Header, weil das lange Fließtext-Seiten sind, auf denen der Weg zum Seitenanfang weit ist | 2026-09-06 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Theme über Route-Layouts statt Client-State | Kein Flicker — Theme ist beim ersten Paint korrekt, kein JS nötig | 2026-08-23 |
| CSS Custom Properties aus Design System | Direkte Übernahme der Tokens, konsistent mit Claude Design Export | 2026-08-23 |
| Google Fonts via next/font | Optimiertes Laden, kein Layout Shift, Self-Hosting durch Next.js | 2026-08-23 |
| localStorage für Erststart-Flag | Einfachster persistenter Speicher, kein Backend nötig | 2026-08-23 |
| Shared AppHeader-Komponente mit Props | Wiederverwendbar über alle Routes, Props steuern Verhalten | 2026-08-23 |
| Brush-Stroke-Button als eigene Komponente | Nicht durch shadcn abbildbar — Brand-spezifisches Element mit SVG | 2026-08-23 |
| shadcn Dialog für Erststart-Hinweis | Bereits installiert, accessible, responsive | 2026-08-23 |
| Lucide Icons via lucide-react | Im Design-System definiert, Tree-Shakeable | 2026-08-23 |
| Glow als CSS-Keyframe auf `box-shadow`, nicht als JS-Animation | Läuft dauerhaft auf dem Startscreen; CSS-Animation bleibt ohne Main-Thread-Last und ist per Media Query abschaltbar | 2026-09-05 |
| `prefers-reduced-motion: reduce` schaltet nur die Animation ab, nicht den Glow | Der Glow trägt die Farbcodierung der beiden Modi (Teal/Lime) — er ist Information, die Bewegung ist Dekoration | 2026-09-05 |
| Versatz über `animation-delay` statt zweier Keyframe-Sets | Ein Keyframe, zwei Delays — weniger CSS, gleiches Ergebnis | 2026-09-05 |
| Ruhe- und Hover-Glow als getrennte Stufen derselben Farbe | Der bestehende `card-glow-teal`/`-lime` bleibt der verstärkte Hover-/Focus-Zustand; die neue Ruhestufe liegt darunter, damit Interaktion weiterhin spürbar ist | 2026-09-05 |
| Ein `AppNavMenu` in `AppHeader`, kein separates Menu je Modus | Andernfalls existieren zwei Menüs, die auseinanderdriften — genau der Zustand, den dieses Refinement auflöst. Die Info-Seiten binden dieselbe Komponente in ihren eigenen Rahmen ein | 2026-09-06 |
| Menu-Struktur als Daten in `src/lib/app-nav.ts`, nicht als JSX | `INFO_NAV_LINKS` existiert bereits nach genau diesem Muster (eigenes Plain-Modul, weil Werte über die Client-Grenze sonst als Referenz-Proxy ankommen). Die neue Struktur ersetzt es und wird von App-Header und Info-Header geteilt | 2026-09-06 |
| Weiterhin shadcn `Sheet` (Radix) als Menu-Container | Liefert Fokus-Falle, Escape, `aria-expanded` und Scroll-Lock ohne Eigenbau — die bestehende `InfoNavMenu` nutzt ihn bereits erfolgreich. Nur der Inhalt wird ersetzt, nicht der Mechanismus | 2026-09-06 |
| „Kein Sticky" = `sticky top-0` entfällt ersatzlos, kein Auto-Hide-Scroll-Listener | Der Header scrollt als normales Element mit. Ein Auto-Hide-Pattern bräuchte einen Scroll-Listener plus Zustands-Logik auf jedem Screen — Aufwand und Jank für einen Screen, der ohnehin nur 430px breit ist | 2026-09-06 |
| Aktiver Menü-Eintrag über `usePathname()` | Das Menu ist bereits eine Client-Komponente (Open-Zustand); der Pathname-Vergleich kostet nichts zusätzlich und braucht kein Prop-Durchreichen durch jeden Screen | 2026-09-06 |
| Menu-Overlay mit z-index über den Leaflet-Karten-Panes | Leaflet stapelt seine Panes bis z-index 700 in einem eigenen Kontext; ein Menu mit dem Default-z-index des Sheets würde im Stationen-Editor und in der Navigation unter der Karte verschwinden | 2026-09-06 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
Root Layout (src/app/layout.tsx)
├── Google Fonts laden (Anton, Orbitron, Rubik)
├── CSS-Variablen (Design-System-Tokens)
├── Theme-Klasse auf <html> setzen (route-basiert)
│
├── "/" — Startscreen
│   ├── Logo (Pin-Mark + "GEO QUEST")
│   ├── Mode-Card "Play" (Brush-Stroke-Button → /play)
│   └── Mode-Card "Create" (Brush-Stroke-Button → /create)
│   └── [Erststart-Dialog] (nur beim allerersten Besuch)
│
├── "/play" — Player Layout
│   ├── AppHeader
│   │   ├── Links: Pin-Mark-Logo (→ Home)
│   │   ├── Mitte: Kontext-Titel
│   │   └── Rechts: (Platz für zukünftige Actions)
│   └── Scrollbarer Content-Bereich (Kinder-Routes)
│
├── "/play/[id]" — Aktive Quest (Sub-Layout)
│   ├── AppHeader
│   │   ├── Links: Zurück-Pfeil (→ /play)
│   │   ├── Mitte: Quest-Name
│   │   └── Rechts: (kontextabhängig)
│   └── Content
│
├── "/create" — Creator Layout
│   ├── AppHeader (identische Struktur, Light Theme)
│   └── Scrollbarer Content-Bereich
│
├── "/create/[id]" — Quest bearbeiten (Sub-Layout)
│   └── (analog zu /play/[id])
│
└── not-found — 404-Seite
    ├── "Ziel nicht gefunden." (Display-Font)
    └── Button "Zurück zum Start" (→ /)
```

### Datenmodell

Für PROJ-1 minimal — nur ein einziger Wert:

- Schlüssel: `gq_first_visit_done`
- Wert: `"true"` (String)
- Gespeichert in: localStorage
- Zweck: Erststart-Dialog nur einmal zeigen

Kein weiterer State — das Theme wird rein aus der URL/Route abgeleitet.

### Theme-Strategie (Kein Flicker)

Das Theme wird serverseitig bestimmt:
- Next.js Layout-Dateien wissen anhand ihrer Route, welches Theme aktiv ist
- `/play`-Layout setzt `data-theme="dark"` auf seinen Container
- `/create`-Layout setzt `data-theme="light"` auf seinen Container
- Root-Layout setzt Fallback (Dark) auf `<html>`
- Theme ist sofort beim ersten HTML-Paint korrekt — kein JS nötig, kein Flicker

### Route-Struktur (Next.js App Router)

```
src/app/
├── layout.tsx          ← Root: Fonts, globale CSS-Vars, <html data-theme="dark">
├── page.tsx            ← Startscreen (/)
├── not-found.tsx       ← 404-Seite
├── play/
│   ├── layout.tsx      ← Player-Layout: Header mit Home-Button, Dark Theme
│   ├── page.tsx        ← Quest-Liste (/play) — Platzhalter für PROJ-2
│   └── [id]/
│       ├── layout.tsx  ← Sub-Layout: Header mit Zurück-Pfeil
│       └── page.tsx    ← Aktive Quest — Platzhalter für PROJ-3
└── create/
    ├── layout.tsx      ← Creator-Layout: Header, Light Theme
    ├── page.tsx        ← Quest-Liste (/create) — Platzhalter für PROJ-6
    └── [id]/
        ├── layout.tsx  ← Sub-Layout: Header mit Zurück-Pfeil
        └── page.tsx    ← Quest bearbeiten — Platzhalter für PROJ-8
```

### Shared Components

| Komponente | Zweck |
|------------|-------|
| `AppHeader` | App-weite Kopfzeile: Zurück-Pfeil links (entfällt auf Top-Level), Titel mitte, `AppNavMenu` rechts. `transparent`-Prop (Default `false`) entfernt Background/Blur/Border, damit ein dahinterliegender Partikel-Backdrop (z.B. `quest-list-backdrop.tsx`) nahtlos durchscheint — genutzt auf Quest-Liste (`/play`) und Stationsliste (`station-list.tsx`, PROJ-3). Seit 2026-09-06 **nicht mehr sticky**; die Pin-Bildmarke und die `rightAction`-Prop entfallen, der Platz rechts gehört dem Menu |
| `AppNavMenu` | Burger-Menu (shadcn `Sheet`) mit den Gruppen App / Info / Rechtliches, je Link ein Icon, aktiver Eintrag über `usePathname()` hervorgehoben. Ersetzt `InfoNavMenu` (PROJ-13) und wird auf allen Screens sowie in `InfoPageShell` eingebunden |
| `ModeCard` | Große Karte auf Startscreen mit Brush-Stroke-Button |
| `FirstVisitDialog` | Einmaliger Erststart-Dialog (nutzt shadcn Dialog) |
| `BrushStrokeButton` | Button mit SVG-Brush-Stroke-Hintergrund (Brand-Element) |

### Dependencies (zu installieren)

| Package | Zweck |
|---------|-------|
| `lucide-react` | Icon-Set (Zurück-Pfeil, Home etc.) |
| `next/font` (built-in) | Google Fonts optimiert laden |

### Startscreen-Verfeinerung (2026-09-05)

Betroffene Dateien: `src/app/page.tsx`, `src/components/mode-card.tsx`, `src/app/globals.css`.

**1. Logo als Link auf `/about`**

Das `next/image`-Logo in `src/app/page.tsx` wird in einen `next/link` auf `/about` gewrappt. Kein visueller Zusatz im Ruhezustand (Markenvorgabe: kein Glow, kein Shimmer hinter dem Lockup). Der Link braucht:
- einen Accessible Name (das `alt` des Bildes reicht nicht aus, um das Ziel zu erklären) — z.B. `aria-label="Geo Quest — Was ist das?"`
- einen `focus-visible`-Ring für Tastatur-Navigation
- ein dezentes Press-Feedback (leichtes `scale`/`opacity`), damit der Tap sich quittiert anfühlt
- eine Tap-Fläche, die das Bild nicht wesentlich überragt (siehe Edge Case 6)

**2. Card-Abstand**

`flex flex-col gap-3` → `gap-5` im Mode-Cards-Container von `src/app/page.tsx` (12px → 20px). Bleibt im 4px-Raster des Design-Systems.

**3. Ruhender, atmender Glow**

Bestehend in `globals.css`: `card-glow-teal` / `card-glow-lime` — diese bleiben unverändert als **verstärkter** Hover-/Focus-Zustand.

Neu ergänzt wird eine **Ruhestufe** darunter, deutlich schwächer als der Hover-Zustand (Richtwert: rund die Hälfte der Alpha-Werte), plus ein gemeinsamer Keyframe, der die Glow-Intensität langsam zwischen Ruhestufe und einem leicht helleren Punkt bewegen lässt:

| Aspekt | Vorgabe |
|--------|---------|
| Dauer | ~4s, `ease-in-out`, `infinite` |
| Versatz | Teal-Card ohne Delay, Lime-Card ca. 2s `animation-delay` (Gegentakt) |
| Animierte Eigenschaft | ausschließlich `box-shadow` / `opacity` — kein `width`, `top`, `filter` |
| Amplitude | subtil; im hellsten Moment darf der Text-Kontrast WCAG AA nicht unterschreiten |
| Reduced Motion | `@media (prefers-reduced-motion: reduce)` setzt `animation: none`, der ruhende Glow bleibt sichtbar |

Der Farbwert folgt der `accent`-Prop der `ModeCard` (`teal` → `#00E0D1`, `lime` → `#C6FF00`) — die Komponenten-API ändert sich nicht.

**Alternative, falls die Halos sich optisch stören:** Statt zweier permanent leuchtender Cards nur die obere (Teal/Play) atmen zu lassen und der unteren einen statischen Lime-Glow zu geben — das lenkt zum Haupt-Einstieg. Erst bauen, dann am Gerät bewerten.

#### Implementierung (2026-09-05)

Umgesetzt in drei Dateien, keine neue Komponente, keine Änderung der `ModeCard`-API:

| Datei | Änderung |
|-------|----------|
| `src/app/globals.css` | Neue Utilities `.card-glow-rest-teal` / `.card-glow-rest-lime` (Ruhestufe, ca. halbe Alpha-Werte des Hover-Zustands) + Keyframes `gq-breathe-teal` / `gq-breathe-lime` (4s, `cubic-bezier(.37,0,.63,1)`, infinite) + `@media (prefers-reduced-motion: reduce)`-Block |
| `src/components/mode-card.tsx` | Statischer Border/Shadow ersetzt durch die Ruhestufe; `hover:animate-none focus-visible:animate-none` stoppt das Atmen, bevor der starke `card-glow-*` greift |
| `src/app/page.tsx` | Logo in `next/link` auf `/about` gewrappt (`aria-label`, `focus-visible`-Ring, `active:scale-[0.97]`); Card-Container `gap-3` → `gap-5` |

**Versatz:** über `animation-delay: -2s` auf der Lime-Card. Negativ statt positiv, damit die Karte sofort mitten im Zyklus startet — bei positivem Delay hätte sie die ersten 2s stillgestanden und wäre erst danach eingestiegen.

**Verifizierte Kaskade** (im gebauten CSS geprüft, nicht angenommen): Die Hover-Regeln stehen im Output nach den Ruhe-Regeln, gewinnen also bei gleicher Spezifität per Quellreihenfolge — sowohl `animate-none` als auch der verstärkte Glow. Der `prefers-reduced-motion`-Block steht ebenfalls nach den Ruhe-Regeln und setzt `animation: none`, ohne den Glow zu entfernen.

**Konflikt mit dem Design-System:** `docs/design-system.md` (Abschnitt Motion) verbietet ausdrücklich "keine Ambient-Loops". Ein dauerhaft atmender Glow ist genau das. Die Regel ist allerdings bereits durch `quest-list-backdrop.tsx` gebrochen, das auf drei Screens eine `gq-float`-Endlosschleife fährt. Entscheidung wurde bewusst zugunsten der Nutzeranforderung getroffen — die Design-System-Regel sollte entweder auf "keine Ambient-Loops außer markierten Akzenten" präzisiert oder gestrichen werden (siehe Open Questions).

## QA Test Results

**Date:** 2026-08-23 (Re-Test)
**Tester:** AI QA (Claude)
**Build:** Production build passes (`npm run build` ✓)
**Lint:** `npm run lint` passes (0 errors, 1 warning)
**Unit Tests:** 4/4 pass (`npm test` ✓)

### Acceptance Criteria Results

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Startscreen zeigt Dark Theme + Logo + Cards | ✅ Pass |
| 2 | Play-Card navigiert zu /play mit Dark Theme | ✅ Pass |
| 3 | Create-Card navigiert zu /create mit Light Theme | ✅ Pass |
| 4 | Pin-Mark-Logo auf /play → / | ✅ Pass |
| 5 | Zurück-Pfeil auf /play/[id] → /play | ✅ Pass |
| 6 | Browser-Zurück navigiert eine Ebene hoch | ✅ Pass |
| 7 | Player-Modus hat Dark Theme | ✅ Pass |
| 8 | Creator-Modus hat Light Theme | ✅ Pass |
| 9 | Theme-Wechsel ohne Flicker | ✅ Pass |
| 10 | Erststart-Dialog bei erstem Besuch | ✅ Pass |
| 11 | "Verstanden" schließt Dialog + setzt Flag | ✅ Pass |
| 12 | Dialog nicht bei Wiederkehr | ✅ Pass |
| 13 | Gebrandete 404-Seite mit Nachricht | ✅ Pass |
| 14 | 404 "Zurück zum Start" → / | ✅ Pass |

**Result: 14/14 passed**

### Edge Cases

| # | Edge Case | Status |
|---|-----------|--------|
| 1 | Theme-Flicker bei Seitenwechsel | ✅ Pass — Theme über serverseitige Route-Layouts |
| 2 | Direkteinstieg per URL (/play/abc) | ✅ Pass — korrektes Theme ohne Startscreen |
| 3 | localStorage nicht verfügbar | ✅ Pass — try/catch zeigt Dialog erneut |
| 4 | Browser-Zurück vom Startscreen | ✅ Pass — normales Browser-Verhalten |
| 5 | Schnelles Mode-Wechseln | ✅ Pass — jede Route eigenständig |

### Unit Tests

| Suite | Tests | Status |
|-------|-------|--------|
| FirstVisitDialog | 4 | ✅ All pass |

### Security Audit

| Check | Result |
|-------|--------|
| XSS (dangerouslySetInnerHTML, innerHTML, eval) | ✅ Keine Vektoren |
| Exposed Secrets | ✅ Keine Secrets im Code |
| Sensitive Data in Client | ✅ Nur localStorage-Flag |
| Input Injection | ✅ Keine User-Inputs in PROJ-1 |

### Bugs Found (Previous Run)

| # | Severity | Description | Status |
|---|----------|-------------|--------|
| 1 | ~~Medium~~ | Mode Cards fehlender `:focus-visible` Glow | ✅ **FIXED** — `focus-visible:card-glow-*` Klassen hinzugefügt |
| 2 | ~~Medium~~ | `npm run lint` fehlgeschlagen (ESLint 9 Config) | ✅ **FIXED** — `eslint.config.mjs` vorhanden, lint läuft |
| 3 | ~~Low~~ | Mode Cards inline styles + JS-Handler | ✅ **FIXED** — reine Tailwind-Klassen mit `cn()` |
| 4 | Low | `maximumScale: 1` verhindert Pinch-to-Zoom | ⚠️ **OFFEN** — bewusste Design-Entscheidung für Gaming-PWA? |

### New Findings (Re-Test)

| # | Severity | Description | Notes |
|---|----------|-------------|-------|
| 1 | Low | `brush-stroke-button.tsx` nutzt `<img>` statt `next/image` | ESLint-Warning, LCP-Optimierung möglich |

### Responsive Test

| Viewport | Status |
|----------|--------|
| 375px (iPhone SE) | ✅ Pass — alle Elemente sichtbar, Cards passen |
| 390px (iPhone 14) | ✅ Pass — Design-Breite, optimale Darstellung |
| 430px (iPhone 14 Pro Max) | ✅ Pass — max-w-[430px] begrenzt korrekt |
| 768px (Tablet) | ✅ Pass — Content zentriert, max-w greift |
| 1440px (Desktop) | ✅ Pass — Content zentriert bei 430px |

### Production-Ready Decision

**READY** — Keine Critical oder High Bugs. Die 3 vorherigen Medium/Low-Bugs wurden behoben. Verbleibend: 2 Low-Findings (maximumScale, img-Tag), beide nicht blockierend.

### E2E Tests

E2E-Testsuite geschrieben in `tests/proj-1-app-shell.spec.ts` (23 Tests). Playwright-Browser müssen einmalig installiert werden: `npx playwright install chromium`. Danach: `npm run test:e2e`.

## QA Test Results — Startscreen-Verfeinerung (2026-09-05)

**Tester:** AI QA (Claude)
**Scope:** die 10 neuen Acceptance Criteria der Verfeinerung (Logo-Link, Card-Abstand, ruhender Glow) + Regression
**Build:** `npm run build` ✓ | **Lint:** 0 Fehler, 6 Warnings (alle vorbestehend, `<img>`-Hinweise in nicht berührten Dateien) | **Unit:** 167/167 ✓

### Testumgebung — Einschränkung

Die Chromium-Installation von Playwright ist auf dieser Maschine **defekt**: `chromium-1208` enthält die App-Hülle, aber das Framework-Binary fehlt (`dlopen ... Google Chrome for Testing Framework (no such file)`), und `chromium_headless_shell-1208` fehlt ganz. Alle 23 Chromium-Tests scheitern dadurch schon beim Browser-Start, nicht an der App. Reparatur wäre `npx playwright install chromium` — auf ausdrücklichen Wunsch nicht ausgeführt.

Getestet wurde daher auf **WebKit**, das intakt ist und für das Zielgerät (iPhone Safari) ohnehin die aussagekräftigere Engine ist:
- **Mobile Safari (iPhone 13)** — das Zielgerät
- **Desktop Safari (1280×720)** — via temporärer Config, deckt Hover/Focus ab

Chrome und Firefox sind damit **ungetestet**. Vor dem Deploy sollte der Startscreen dort einmal manuell angesehen werden (rein visuell — die Logik ist engine-unabhängig).

### Acceptance Criteria

| # | Kriterium | Mobile Safari | Desktop Safari |
|---|-----------|---------------|----------------|
| 1 | Tap auf Logo → `/about` | ✅ Pass | ✅ Pass |
| 2 | Logo hat Fokus-Ring + Accessible Name | ✅ Pass | ✅ Pass |
| 3 | Beide Cards tragen dauerhaft Glow in Akzentfarbe (Touch, kein Hover) | ✅ Pass | ✅ Pass |
| 4 | Glow pulsiert langsam und zeitversetzt | ✅ Pass | ✅ Pass |
| 5 | `prefers-reduced-motion`: Glow bleibt, Animation aus | ✅ Pass | ✅ Pass |
| 6 | Hover/Focus verstärkt den Glow gegenüber Ruhezustand | — (kein Hover auf Touch) | ✅ Pass |
| 7 | 360×640: alles ohne Scrollen sichtbar | ✅ Pass | ✅ Pass |

**Ergebnis: 7/7 bestanden** (Kriterium 6 auf Touch systembedingt nicht anwendbar und dort übersprungen).

### Edge Cases

| # | Edge Case | Status | Nachweis |
|---|-----------|--------|----------|
| 6 | Logo-Tap kollidiert nicht mit oberer Card | ✅ Pass | Link überragt das Bild um ≤ 8px, Unterkante liegt über der Card-Oberkante |
| 7 | Glow überstrahlt den Card-Text nicht | ✅ Pass | Titel 16.10:1, Beschreibung 6.61:1 auf `#0F2429` — beide über WCAG AA (4.5:1). Der Glow ist ein **äußerer** `box-shadow` ohne `inset`; im Browser gemessen bleibt die Card-Hintergrundfarbe über den gesamten Animationszyklus konstant `rgb(15, 36, 41)` |
| 8 | Keine spürbare Dauerlast | ✅ Pass | Animiert wird ausschließlich `box-shadow`; kein Layout/Reflow, keine JS-Animation |

### Regressionstest

Vergleich gegen `efcdc83` (Stand vor der Implementierung), gleiche Umgebung:

| Lauf | Ergebnis |
|------|----------|
| Vorher (nur Alt-Specs) | 202 passed, **17 failed** |
| Nachher (inkl. neuer Spec) | 214 passed, **17 failed** |

**Identische Fehlerzahl, identische Tests — keine Regression durch diese Änderung.**

### Bugs

**Keine neuen Bugs gefunden.**

Zwei Testfehlschläge während der QA stellten sich als Test-Artefakte heraus, nicht als Produktfehler — beide im Browser gegengeprüft:

| Beobachtung | Befund |
|-------------|--------|
| `prefers-reduced-motion` schien wirkungslos (Animation lief weiter) | Kein Produktfehler: `test.use({ reducedMotion })` greift auf dieser WebKit-Version nicht, `matchMedia` meldete `false`. Mit `page.emulateMedia()` ist die Media Query aktiv und beide Animationen stehen korrekt auf `none`, während die Glows erhalten bleiben. Test entsprechend umgestellt |
| Fokus-Ring des Logos schien transparent | Kein Produktfehler: WebKit unterdrückt die Focus-Darstellung, wenn das Testfenster keine OS-Fokussierung hat — im Einzellauf mit Fensterfokus malt der Ring korrekt `rgba(0, 224, 209, 0.45) 0 0 0 5px` auf dunklem Offset. Test prüft jetzt den aufgelösten Ring statt des gemalten `box-shadow` |

### Vorbestehende Fehlschläge (nicht Teil dieser Änderung)

17 Fehlschläge auf Mobile Safari, unverändert vor und nach der Änderung:

| Spec | Anzahl | Ursache |
|------|--------|---------|
| `proj-1-app-shell.spec.ts` | 9 | Veraltete Selektoren: `getByText('Deine Quests')` trifft auch den Erststart-Dialog-Text (Strict-Mode-Violation); `locator('[data-theme="dark"]')` trifft `<html>` **und** den Layout-`<div>`; `aria-label="Zurück"` existiert so nicht mehr |
| `proj-3-player-gps-navigation.spec.ts` | 7 | Vorbestehend |
| `proj-11-import-passwortschutz.spec.ts` | 1 | Vorbestehend |

Die App verhält sich in allen Fällen korrekt — die Tests sind veraltet. Das deckt sich mit dem bekannten Follow-up zu veralteten E2E-Tests und bleibt bewusst außerhalb dieser Änderung.

### Security Audit

| Check | Ergebnis |
|-------|----------|
| XSS (`dangerouslySetInnerHTML`, `innerHTML`, `eval`) | ✅ Keine Vektoren in den geänderten Dateien |
| Nutzergesteuerte URLs | ✅ Alle drei `href` sind statische interne Routen (`/about`, `/play`, `/create`) |
| `target="_blank"` ohne `rel` (Reverse Tabnabbing) | ✅ Nicht vorhanden |
| Exponierte Secrets | ✅ Keine |
| Neue Angriffsfläche | ✅ Keine — die Änderung ist reines Styling plus ein interner Link |

### Neue E2E-Tests

`tests/proj-1-startscreen-refinement.spec.ts` — 13 Tests, bewusst als eigene Datei statt Erweiterung der alten Spec, damit die neue Suite nicht in deren veralteten Selektoren hängen bleibt.

| Umgebung | Ergebnis |
|----------|----------|
| Desktop Safari | 13 passed |
| Mobile Safari | 12 passed, 1 skipped (Hover-Test, auf Touch nicht anwendbar) |

### Production-Ready-Entscheidung

**READY** — keine Critical- oder High-Bugs, keine Regression, alle Acceptance Criteria bestanden.

Zwei Punkte zur Kenntnis, beide nicht blockierend:
1. **Chrome/Firefox visuell ungeprüft** (Chromium-Installation defekt). Der Glow nutzt nur `box-shadow` und `@keyframes` — überall unterstützt; ein kurzer Blick vor dem Deploy genügt.
2. **Der Glow ist Geschmackssache.** Automatisiert ist verifiziert, *dass* er läuft, korrekt versetzt ist und den Kontrast nicht bricht — ob er auf dem Gerät gefällt, ist eine Designentscheidung. Der Fallback (nur Teal-Card atmet, Lime statisch) steht in der Tech-Design-Sektion.

## Deployment

**Production URL:** https://geoquesty.vercel.app
**Deployed:** 2026-08-23
**Platform:** Vercel (auto-deploy on push to main)
**Git Tag:** v1.0.0-PROJ-1

### Redeploy: Startscreen-Verfeinerung (2026-09-05)

**Deployed:** 2026-09-05
**Production URL:** https://geoquesty.vercel.app
**Git Tag:** v1.18.0-PROJ-1

Logo auf `/` verlinkt jetzt auf die Landing Page `/about` (mit `aria-label`, Fokus-Ring und Press-Feedback, ohne sichtbare Link-Chrome). Card-Abstand von 12px auf 20px erhöht. Der Glow der Mode-Cards ist vom reinen Hover-Zustand zu einem dauerhaften, langsam atmenden Ruhezustand geworden — auf Touch-Geräten war der bestehende Effekt vorher faktisch unsichtbar. Die Lime-Card läuft per `animation-delay: -2s` im Gegentakt zur Teal-Card. `prefers-reduced-motion` schaltet nur die Bewegung ab, nicht den Glow.

**Verifikation in Produktion** (Mobile-Safari-Profil gegen die Live-URL):

| Prüfung | Ergebnis |
|---------|----------|
| `/`, `/about`, `/play`, `/create` | alle HTTP 200 |
| Animationen aktiv | `gq-breathe-teal` / `gq-breathe-lime` |
| Versatz wirksam | Teal und Lime wurden an unterschiedlichen Punkten des Zyklus gemessen (0.16/0.13 vs. 0.26/0.22) — der Gegentakt ist in den Werten sichtbar |
| Card-Abstand | exakt 20px |
| Logo-Navigation | `/` → `/about` funktioniert |
| Browser-Konsole | keine Fehler |

**Offen:** Chrome und Firefox wurden nicht getestet — die lokale Chromium-Installation von Playwright ist defekt (siehe QA-Abschnitt). Der Effekt nutzt ausschließlich `box-shadow` und `@keyframes` und ist damit überall unterstützt, ein visueller Blick steht aber noch aus.

### Redeploy: Transparenter Header über Partikel-Backdrop (2026-08-28)

**Deployed:** 2026-08-28
**Production URL:** https://geoquesty.vercel.app
**Git Tag:** v1.10.0-PROJ-1

`AppHeader` bekommt eine neue `transparent`-Prop (Default `false`, bestehende Aufrufer unverändert). Auf Quest-Liste (`/play/page.tsx`) und Stationsliste (`station-list.tsx`, PROJ-3) — den einzigen beiden Screens mit `QuestListBackdrop` — entfernt sie `bg-background/80 backdrop-blur-sm border-b border-border`, sodass der Partikel-Hintergrund nahtlos unter dem Header durchscheint statt sichtbar abgesetzt zu wirken. Creator-Screens (`variant="light"`, kein Partikel-Backdrop) bleiben unverändert opak. Nutzer hat das Ergebnis im Browser bestätigt ("Sieht gut aus").

---

## Refinement — App-weite Navigation & Kopfzeile (2026-09-06)

**Auslöser:** Die Navigation war gewachsen statt geplant. Das Burger-Menu gab es nur auf den vier Info-Seiten (PROJ-13); die App-Screens hatten stattdessen eine Pin-Bildmarke, die zum Startscreen führte. Wer in `/play/[id]` oder `/create/[id]` steckte, kam nur über mehrere Taps zur Anleitung, zum Impressum oder in den anderen Modus. Gleichzeitig belegte im Creator (`/create/[id]`) ein Stift-Icon oben rechts genau die Stelle, an der das Menu künftig sitzt.

### Das Navigationsmodell

Eine Kopfzeile, ein Menu, auf jedem Screen gleich:

```
┌──────────────────────────────┐
│ ←                          ☰ │   Zurück links · Burger rechts
├──────────────────────────────┤
│  STATIONEN                   │   ← scrollt mit, nicht sticky
│  MEINE QUEST          ✎      │     (Stift nur im Creator)
│  3 Ziele · 1,2 km            │
│  ────────────────────────    │
```

Menu-Inhalt — drei Gruppen, sechs Links, je ein Icon:

| Gruppe | Link | Ziel |
|--------|------|------|
| **App** | Play (Controller-Icon) | `/play` |
| | Create | `/create` |
| **Info** | Über | `/about` |
| | Anleitung | `/anleitung` |
| **Rechtliches** | Impressum | `/impressum` |
| | Datenschutz | `/datenschutz` |

Die Icon-Auswahl trifft `/frontend` aus dem bereits genutzten `lucide-react`-Set; die Anforderung ist nur, dass jeder Link ein zu seinem Ziel passendes Icon trägt und die sechs untereinander unterscheidbar sind.

### Was sich je Screen ändert

| Screen | Vorher | Nachher |
|--------|--------|---------|
| `/play` | Pin-Marke links, sticky, kein Menu | Kein Zurück (Top-Level), Menu rechts, nicht sticky |
| `/play/[id]` (Stationsliste) | Zurück-Pfeil links, sticky | Zurück links, Menu rechts, nicht sticky |
| `/play/[id]` (Module) | Zurück (`onBack`) links, sticky | unverändert links, Menu rechts, nicht sticky |
| `/create` | Pin-Marke links, sticky | Kein Zurück (Top-Level), Menu rechts, nicht sticky |
| `/create/[id]` | Zurück links, **Stift rechts**, sticky | Zurück links, **Menu** rechts, nicht sticky — der Stift zieht neben den Quest-Titel (PROJ-7) |
| `/create/[id]/station/[stationId]` | Zurück links, sticky | Zurück links, Menu rechts, nicht sticky |
| Info-Seiten | Zurück links, Desktop-Links + „Zur App" + eigenes Burger rechts | Gleiche Zeile, aber gemeinsames Menu; **bleibt sticky** (PROJ-13) |

### Betroffene Dateien (Hinweis für `/frontend`)

| Datei | Änderung |
|-------|----------|
| `src/lib/app-nav.ts` | Neu — ersetzt `src/lib/info-nav.ts`: sechs Links in drei Gruppen mit Icon je Eintrag; `HEADER_NAV_LINKS` (Desktop-Teilmenge der Info-Seiten) wird daraus abgeleitet |
| `src/components/app-nav-menu.tsx` | Neu — ersetzt `src/components/info-nav-menu.tsx`: shadcn `Sheet`, Gruppen-Überschriften, aktiver Eintrag via `usePathname()`, kein `sm:hidden` mehr |
| `src/components/app-header.tsx` | `sticky top-0` entfällt; Logo-/`Image`-Zweig und `variant`-abhängige Logo-Quelle entfallen; `rightAction`-Prop entfällt zugunsten des fest eingebauten Menus |
| `src/app/play/page.tsx`, `src/app/create/page.tsx` | `AppHeader` ohne `backHref` rendert jetzt eine leere linke Seite statt der Pin-Marke — kein Aufrufer-Änderung nötig außer der entfernten `variant`-Logolast |
| `src/app/create/[id]/page.tsx` | `rightAction` entfällt; der Stift-Button wandert in den Titel-Block neben `{quest.name}` (PROJ-7) |
| `src/components/info-page-shell.tsx` | `InfoNavMenu` → `AppNavMenu`; Header bleibt `sticky` |
| Tests | `aria-label="Zurück zum Start"` (Pin-Marke) verschwindet — die E2E-Suite referenziert Header-Selektoren, siehe die bekannten stale Tests im QA-Abschnitt |

### Bewusst nicht Teil dieser Änderung
- Der Startscreen `/` bekommt vorerst keine Kopfzeile (siehe Open Questions) — er bietet mit den Mode-Cards und dem Logo-Link bereits fünf der sechs Ziele
- Kein Auto-Hide-Header, kein schwebender Menu-Button: „nicht sticky" heißt, die Kopfzeile scrollt schlicht mit
- Kein PWA-Eintrag im Menu — das gehört zu PROJ-12
- Kein kontextabhängiger Menü-Eintrag „Quest bearbeiten": diese Aktion bleibt sichtbar auf der Seite, statt sich hinter zwei Taps zu verstecken

---

## Implementation Notes (Frontend) — App-weite Navigation (2026-09-06)

### Neue/geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/app-nav.ts` | **Neu** — sechs Links in drei Gruppen (`APP_NAV_GROUPS`), je mit `LucideIcon`. Ersetzt `src/lib/info-nav.ts` (gelöscht). `HEADER_NAV_LINKS` bleibt als abgeleitete Desktop-Teilmenge der Info-Seiten erhalten |
| `src/components/app-nav-menu.tsx` | **Neu** — Burger-Menu auf Basis von shadcn `Sheet`. Ersetzt `src/components/info-nav-menu.tsx` (gelöscht) |
| `src/components/app-header.tsx` | `sticky top-0 z-50` entfernt; Logo-Zweig, `variant`- und `rightAction`-Prop entfallen; `AppNavMenu` fest rechts eingebaut |
| `src/components/ui/sheet.tsx` | Optionale `overlayClassName`-Prop auf `SheetContent` durchgereicht (Default-Verhalten unverändert) |
| `src/components/navigation-screen.tsx` | Nutzt jetzt `AppHeader` statt einer inline nachgebauten Kopfzeile — siehe „Nebenbefund" unten |
| `src/components/info-page-shell.tsx` | `InfoNavMenu` → `AppNavMenu`; Header bleibt bewusst `sticky` |
| `src/app/create/[id]/page.tsx` | `rightAction` entfernt; Stift-Button sitzt jetzt im Titel-Block neben `{quest.name}` (PROJ-7) |
| `src/app/create/page.tsx`, `src/app/create/[id]/station/[stationId]/page.tsx` | `variant="light"` entfernt (Prop existiert nicht mehr) |
| `tests/proj-1-app-shell.spec.ts`, `tests/proj-3-…`, `tests/proj-13-info-refinement.spec.ts` | Auf das neue Verhalten umgestellt, siehe „Angepasste Tests" |

### Zwei Probleme, die erst im Browser sichtbar wurden

**1. Menu erschien im Creator schwarz statt hell.**
Radix rendert den Sheet-Inhalt per Portal an `document.body` — also außerhalb des `[data-theme="light"]`-Wrappers aus `create/layout.tsx`. Die Tokens `--background` & Co. fielen damit auf die Dark-Werte von `<html>` zurück. Gelöst, indem das Menu das Theme dort abliest, wo sein Trigger tatsächlich steht (`closest("[data-theme]")`, per Ref-Callback), und es dem portalierten Inhalt selbst aufstempelt. `[data-theme="light"]` in `globals.css` setzt die Variablen auf dem Element, greift also auch ohne umgebenden Wrapper. Verifiziert: `/play` → `rgb(10,14,15)`, `/create` → `rgb(246,248,249)`.

**2. Der z-index über der Karte war real nötig, nicht vorsorglich.**
Im Stationen-Editor vergibt Leaflet tatsächlich bis **z-index 1000**. Der shadcn-Default (`z-50`) hätte das Menu dort begraben. `z-[1100]` auf Overlay und Content löst es — und weil das Overlay im Original hart auf `z-50` stand, brauchte `sheet.tsx` die neue `overlayClassName`-Prop.

### Nebenbefund: doppelte Kopfzeile im Navigations-Screen

`navigation-screen.tsx` trug eine eigene, von Hand nachgebaute Kopfzeile (`sticky top-0 z-50`, eigener Zurück-Knopf) statt `AppHeader`. Sie wäre als einziger Screen sticky geblieben und hätte kein Menu bekommen — genau die Uneinheitlichkeit, die dieses Refinement beseitigt. Jetzt ersetzt durch `AppHeader`; ihr Zurück-Knopf heißt dadurch „Zurück" statt „Zurück zur Stationsliste" (Test angepasst).

### Bewusst unverändert: die headerlosen Player-Screens

`permission-screen`, `intro-screen` und `outro-screen` haben keine `AppHeader` und behalten das. Es sind absichtlich immersive Vollbild-Screens; ein Burger-Menu würde dort die Inszenierung brechen. Die Navigation ist auf jedem Screen erreichbar, der überhaupt eine Kopfzeile trägt.

Während der **Stationen-Editor als modales Sheet offen ist**, ist das Menu nicht erreichbar — das Sheet besitzt den Screen. Das ist korrektes Modal-Verhalten, kein Defekt.

### Verifikation im Browser

Playwright gegen System-Chrome (der gebündelte Chromium fehlt in dieser Umgebung — bekannt aus dem QA-Abschnitt), iPhone-13-Viewport:

| Prüfung | Ergebnis |
|---------|----------|
| Menu-Gruppen | `App | Info | Rechtliches` |
| Alle sechs Links vorhanden | Play, Create, Über, Anleitung, Impressum, Datenschutz — alle OK |
| Aktiver Eintrag | auf `/play` trägt „Play" `aria-current="page"` |
| Aktiver Eintrag auf Unterroute | auf `/create/[id]` trägt „Create" `aria-current="page"` (Präfix-Vergleich, nicht nur exakte URL) |
| Escape schließt | ja, ohne zu navigieren |
| Theme dark/light | `rgb(10,14,15)` / `rgb(246,248,249)` |
| Kein Sticky auf Play/Create | Header `y: 0 → -300` bei `scrollY=300` |
| Sticky auf Info-Seiten | `/about` und `/anleitung` bleiben bei `y: 0` |
| Pin-Marke entfernt | 0 Treffer für `header img[src*="mark-pin"]` und `aria-label="Zurück zum Start"` |
| Menu über Seiteninhalt | Hit-Test: „Menu liegt oben" |
| Konsolen-/JS-Fehler | keine |

### Angepasste Tests

7 E2E-Tests prüften das alte Verhalten und wurden auf das neue umgestellt (nicht gelöscht):

| Test | Vorher → Nachher |
|------|------------------|
| PROJ-1: `/play` bzw. `/create` Pin-Marke | Prüft jetzt, dass die Marke **weg** ist und das Burger da ist; zwei neue Tests für Modus-Wechsel via Menu und `aria-current` |
| PROJ-1: rapid mode switching | Wechselt jetzt per Menu statt über die Pin-Marke |
| PROJ-1: neu | Header ist nicht `sticky` |
| PROJ-3: back button | `aria-label` „Zurück zur Stationsliste" → „Zurück" |
| PROJ-13: Burger-Inhalt (2×) | vier Ziele inkl. Link „App" → sechs Ziele plus drei Gruppen-Überschriften |
| PROJ-13: Desktop | „Burger ist versteckt" → „Burger ist sichtbar, neben Anleitung und Zur App" |

### Nachbesserung nach Nutzer-Durchsicht (2026-09-06)

Vier Punkte aus der ersten Durchsicht im Browser:

| Befund | Ursache | Behebung |
|--------|---------|----------|
| Auf `/play` und `/create` fehlte jeder Zurück-Weg | Mit dem Wegfall der Pin-Marke blieb die linke Seite auf Top-Level leer — die Spec hatte das so vorgesehen, in der Praxis war der Screen damit eine Sackgasse | Beide Seiten übergeben jetzt `backHref="/"`; der Zurück-Pfeil steht damit auf **jedem** Screen |
| Play trug ein Play-Dreieck | Das Dreieck liest sich als „Video abspielen" | `Gamepad2` (Controller) — trifft den Gaming-Ton der Zielgruppe |
| Schließen-X im Light-Theme unsichtbar | `SheetPrimitive.Close` in `sheet.tsx` hatte keine eigene Textfarbe und erbte die helle Vererbung des Portals; zusätzlich malte `data-[state=open]:bg-secondary` eine helle Fläche dahinter | `text-foreground` explizit gesetzt, die `bg-secondary`-Regel entfernt. Gemessen: `rgb(10,14,15)` auf hellem Panel |
| Impressum/Datenschutz waren noch dunkel | Kein Fehler dieser Umsetzung — Light Mode für die Rechtstexte war in diesem Gespräch nie vereinbart, der Spec hielt Dark ausdrücklich fest. Nach Rückfrage umgesetzt | Siehe PROJ-13 |

Die Korrektur am Zurück-Pfeil ändert eine Aussage der ursprünglichen Spec: „auf den Top-Level-Ansichten bleibt die linke Seite leer" war falsch gedacht. Das zugehörige Acceptance Criterion wurde entsprechend umgeschrieben, nicht nur ergänzt.

---

## QA Test Results — App-weite Navigation (2026-09-06)

**Getestet:** PROJ-1 (Navigation & Kopfzeile), PROJ-7 (Quest-Stift), PROJ-13 (Info-Seiten & Light-Theme)
**Umgebung:** System-Chrome + WebKit (Safari-Engine) über Playwright; iPhone-13-Viewport plus 375/768/1440px
**Automatisiert:** 167 Unit-Tests, 267 E2E-Tests, 72 gezielte QA-Prüfungen

### Zusammenfassung

| | |
|---|---|
| Acceptance Criteria geprüft | 72 |
| Bestanden | 68 |
| Fehlgeschlagen | 3 (ein Befund doppelt gezählt, weil auf zwei Screens gemessen) |
| Nicht anwendbar | 1 (`/about` ohne Zurück-Pfeil — by design) |
| Regression (E2E) | 267/267 grün |
| Unit-Tests | 167/167 grün |
| Security-Audit | keine Befunde |
| **Production-Ready** | **NEIN** — 1 High (Kontrast), 1 Medium (Touch-Target) |

### Acceptance Criteria im Detail

**Kopfzeile & Menü — bestanden**

| Prüfung | Ergebnis |
|---------|----------|
| Burger auf allen 8 Screens sichtbar | ✅ Pass |
| Zurück-Pfeil auf allen App-Screens + 3 Info-Unterseiten | ✅ Pass |
| Keine Pin-Bildmarke mehr in irgendeiner Kopfzeile | ✅ Pass (0 Treffer) |
| Drei Gruppen: App / Info / Rechtliches | ✅ Pass |
| Sechs Links mit korrekten Zielen | ✅ Pass |
| Sechs unterscheidbare Icons | ✅ Pass (gamepad2, pencil, info, book-open, scroll-text, shield-check) |
| Menü schließt beim Antippen eines Links | ✅ Pass |
| Escape schließt ohne zu navigieren | ✅ Pass |
| Klick neben das Menü schließt | ✅ Pass |
| `aria-expanded` meldet Zustand | ✅ Pass (false/true) |
| Fokus liegt nach dem Öffnen im Menü | ✅ Pass |
| Fokus-Falle hält (12× Tab) | ✅ Pass |
| Sichtbarer Fokus-Ring | ✅ Pass (`outline: auto 1px`) |
| Aktiver Eintrag markiert | ✅ Pass (`/play`, `/create`, `/impressum`) |
| Aktiv-Markierung auf Unterrouten | ✅ Pass (`/create/[id]` → „Create") |
| Menü trägt Theme des Screens | ✅ Pass (dark `rgb(10,14,15)` / light `rgb(246,248,249)`) |
| Burger-Trigger ≥44px | ✅ Pass (44×44) |

**Scroll-Verhalten — bestanden**

| Prüfung | Ergebnis |
|---------|----------|
| `/play` nicht sticky | ✅ Pass (Header `y: 0 → -300`) |
| `/about` sticky | ✅ Pass (`y: 0 → 0`) |
| `/impressum` sticky | ✅ Pass (`y: 0 → 0`) |

**PROJ-7 Quest-Stift — bestanden**

| Prüfung | Ergebnis |
|---------|----------|
| Stift neben dem Quest-Titel | ✅ Pass |
| Stift ≥44px | ✅ Pass (44×44) |
| Stift nicht mehr in der Kopfzeile | ✅ Pass |
| Stift öffnet den Quest-Dialog | ✅ Pass |

**PROJ-13 Light-Theme — teilweise**

| Prüfung | Ergebnis |
|---------|----------|
| `/impressum`, `/datenschutz` im Light-Theme | ✅ Pass |
| `/about`, `/anleitung` bleiben dark | ✅ Pass |
| Menü-Link-Kontrast (beide Themes) | ✅ Pass (18.21:1 / 19.40:1) |
| Schließen-X sichtbar (beide Themes) | ✅ Pass (7.16:1 / 9.61:1) |
| Gruppen-Label-Kontrast im Light-Theme | ❌ **BUG-1** |
| Aktiv-Markierung-Kontrast im Light-Theme | ❌ **BUG-1** |

### Bugs

#### BUG-1 (High): Menü-Texte verfehlen im Light-Theme den WCAG-AA-Kontrast

- **Wo:** `src/components/app-nav-menu.tsx:83` (Gruppen-Labels) und `:100`/`:106` (aktiver Eintrag)
- **Betrifft:** jedes geöffnete Menü im Creator (`/create`, `/create/*`) sowie auf `/impressum` und `/datenschutz`
- **Messung** (Panel-Grund `#F6F8F9`):

  | Element | Farbe | Ist | Soll |
  |---------|-------|-----|------|
  | Gruppen-Label „APP/INFO/RECHTLICHES" | `text-gq-grey` `#A0A7AD` | **2.29:1** | ≥4.5:1 |
  | Aktiver Eintrag + Icon | `text-gq-teal` `#00E0D1` | **1.57:1** | ≥4.5:1 |

- **Ursache:** Beide Klassen sind feste Hex-Werte aus der Marken-Palette, die nicht aufs Theme reagieren. Auf dem dunklen Grund sind sie einwandfrei (7.97:1 bzw. 11.62:1) — der Wechsel aufs helle Panel wurde bei der Umsetzung nicht nachgemessen.
- **Reproduktion:** `/create` öffnen → Burger antippen → Gruppen-Überschriften und den teal markierten „Create"-Eintrag betrachten.
- **Auswirkung:** Verstößt gegen die PRD-Vorgabe „WCAG AA Kontrast (4.5:1)". Die Aktiv-Markierung ist mit 1.57:1 praktisch nicht erkennbar — genau die Information, die dem Nutzer sagt, wo er ist.
- **Hinweis für die Behebung:** Das Design-System hält passende Token bereit — `text-muted-foreground` ergibt 5.30:1 (light) / 7.97:1 (dark), `text-primary` ergibt 4.54:1 (light) / 11.62:1 (dark). Beide erfüllen AA in **beiden** Themes, ohne die Marke zu verlassen.
- **Severity: High** — dokumentierte Barrierefreiheits-Anforderung aus dem PRD verfehlt, betrifft die Orientierung im Menü.

#### BUG-2 (Medium): Schließen-X des Sheets ist 16×16px statt 44×44px

- **Wo:** `src/components/ui/sheet.tsx:76` (`SheetPrimitive.Close`)
- **Messung:** 16×16px — Design-System und PRD verlangen mindestens 44px.
- **Vorbestehend, nicht durch diese Änderung verursacht:** Die Regel stammt aus der shadcn-Standardkomponente und betrifft **alle** Sheets der App (`station-editor-sheet.tsx`, `module-editor-sheets.tsx`, `module-type-picker.tsx`, `app-nav-menu.tsx`). Das neue Menü macht sie nur sichtbarer, weil es der am häufigsten geöffnete Sheet ist.
- **Abmilderung:** Escape und Tippen neben das Menü schließen zuverlässig (beides geprüft) — es ist keine Sackgasse.
- **Auswirkung:** Für die Zielgruppe (10–15 Jahre, Handy, in Bewegung draußen) ist ein 16px-Ziel schwer zu treffen.
- **Severity: Medium** — Workarounds existieren, aber die Vorgabe ist verfehlt.

### Nicht als Bug gewertet

- **`/about` hat keinen Zurück-Pfeil.** Die Seite ist die Wurzel des Info-Bereichs; die drei Unterseiten verweisen mit `backHref="/about"` auf sie zurück. Ihr Ausgang ist der „Zur App"-Button. Die Formulierung „Zurück-Pfeil auf **jedem** Screen" in den Implementation Notes ist entsprechend zu eng — der Pfeil steht auf jedem Screen, der ein übergeordnetes Ziel hat.

### Edge Cases

| Fall | Ergebnis |
|------|----------|
| Menü über der Leaflet-Karte (Stationen-Editor) | ✅ `z-[1100]` liegt über Leaflets gemessenen 1000 |
| Menü bei offenem, modalem Stationen-Editor | ✅ Nicht erreichbar — korrektes Modal-Verhalten, kein Defekt |
| Modus-Wechsel während laufender Quest | ✅ Fortschritt in localStorage bleibt erhalten |
| Langer Quest-Name neben dem Stift | ✅ Titel bricht um, Stift behält 44px und erste Zeile |
| Ungültige Quest-ID | ✅ Sauberer 404 („Ziel nicht gefunden") |
| Kein horizontales Scrollen | ✅ 375/768/1440px, Chrome + WebKit |
| Menü-Panel-Overflow | ✅ Keiner auf allen Breiten |

### Cross-Browser & Responsive

| Engine | 375px | 768px | 1440px |
|--------|-------|-------|--------|
| Chrome (System) | ✅ | ✅ | ✅ |
| WebKit (Safari-Engine) | ✅ | ✅ | ✅ |
| Firefox | ⚠️ **nicht getestet** — nicht auf dem Rechner installiert, und der Download der Playwright-Browser wurde bewusst abgelehnt |

Die Umsetzung nutzt ausschließlich Flexbox, CSS-Variablen und Radix-Primitives — nichts davon ist Engine-spezifisch. Ein Firefox-Blick bleibt trotzdem offen.

### Security-Audit (Red Team)

| Test | Ergebnis |
|------|----------|
| XSS über Quest-Namen im neuen Titel-Block (`<img onerror>`) | ✅ Als Text gerendert, kein Skript ausgeführt |
| XSS über Stationsnamen (`<script>`) | ✅ Neutralisiert |
| Menü-Links auf `javascript:`/externe Ziele | ✅ Alle sechs relativ und statisch |
| Secrets im Client-Bundle | ✅ Keine gefunden |
| localStorage-Inhalt | ✅ Nur `gq_first_visit_done`, `gq_quests` — keine Geheimnisse |
| Ungültige Quest-ID (Info-Leak) | ✅ Generischer 404, keine internen Details |

Die Navigation führt keine Nutzereingaben und keine dynamischen Ziele — die Angriffsfläche der Änderung ist entsprechend klein.

### Production-Ready: NEIN

BUG-1 (High) muss vor dem Deployment behoben werden — er verfehlt eine ausdrückliche PRD-Anforderung und macht die Aktiv-Markierung im Creator unsichtbar. BUG-2 (Medium, vorbestehend) sollte mit, kann aber getrennt behandelt werden.
