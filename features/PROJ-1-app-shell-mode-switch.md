# PROJ-1: App Shell & Mode Switch

## Status: Architected
**Created:** 2026-08-23
**Last Updated:** 2026-08-23

## Dependencies
- None (PROJ-1 ist das Fundament)

## Summary
Der Rahmen der gesamten App: Startscreen mit Modus-Auswahl, Header mit kontextabhängiger Navigation, automatisches Theme-Switching, URL-basiertes Routing, Erststart-Dialog und 404-Seite.

## User Stories
1. Als Nutzer möchte ich beim Öffnen der App sofort wählen können, ob ich spielen oder eine Quest erstellen will, damit ich ohne Umwege in den gewünschten Modus komme.
2. Als Nutzer möchte ich von überall in der App mit einem Tap zurück zum Startscreen gelangen, damit ich jederzeit den Modus wechseln kann.
3. Als Nutzer möchte ich den Browser-Zurück-Button nutzen können, damit die App sich wie eine normale Webseite verhält.
4. Als neuer Nutzer möchte ich beim ersten Start über die lokale Datenspeicherung informiert werden, damit ich weiß, dass meine Daten bei Browser-Löschung verloren gehen.
5. Als Nutzer möchte ich bei einer ungültigen URL eine hilfreiche Seite sehen, damit ich zurück zur App finde.

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

**Header & Navigation:**
- [ ] Angenommen der Nutzer befindet sich auf der Top-Level-Ansicht eines Modus (`/play` oder `/create`), wenn er auf das Pin-Mark-Logo links im Header tippt, dann wird er zum Startscreen (`/`) navigiert
- [ ] Angenommen der Nutzer befindet sich in einer tieferen Ansicht (z.B. `/play/[id]`), wenn er auf den Zurück-Pfeil links im Header tippt, dann wird er eine Ebene nach oben navigiert (z.B. zu `/play`)
- [ ] Angenommen der Nutzer befindet sich in einer tieferen Ansicht, wenn er den Browser-Zurück-Button drückt, dann wird er eine Ebene nach oben navigiert

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
- [ ] Soll der Startscreen später eine dezente Background-Animation erhalten? (wurde im Interview erwähnt, aber nicht spezifiziert)

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
| `AppHeader` | Kontextabhängiger Header: Logo/Zurück links, Titel mitte, Actions rechts |
| `ModeCard` | Große Karte auf Startscreen mit Brush-Stroke-Button |
| `FirstVisitDialog` | Einmaliger Erststart-Dialog (nutzt shadcn Dialog) |
| `BrushStrokeButton` | Button mit SVG-Brush-Stroke-Hintergrund (Brand-Element) |

### Dependencies (zu installieren)

| Package | Zweck |
|---------|-------|
| `lucide-react` | Icon-Set (Zurück-Pfeil, Home etc.) |
| `next/font` (built-in) | Google Fonts optimiert laden |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
