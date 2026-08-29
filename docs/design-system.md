# Geo Quest — Design System

> Quelle: `design-preparation/Geo Quest Design SystemV2/` (Claude Design Export)
> Hier zusammengefasst für die Implementierung. Bei Detailfragen die Quelldateien konsultieren.

## Brand Identity

- **Logo:** Pin-Mark + Brush-Lettering "GEO QUEST" auf Deep Black (`design-preparation/Geo Quest Design SystemV2/assets/logo-lockup.png`)
- **Pin-Mark:** Standalone App-Icon (`design-preparation/Geo Quest Design SystemV2/assets/mark-pin.jpg`)
- **Brush-Stroke-Button SVG:** `design-preparation/Geo Quest Design SystemV2/assets/brushstroke-button.svg`
- **Sprache:** Deutsch, informell, Du-Form. Ton: aufgeregter Game-Host, nicht Lehrer. Kurz, punchy, imperativ.
- **Keine Emojis.** Nie. Energie kommt aus Type, Neon und Brush Marks.

## Farbpalette

| Token | Hex | Verwendung |
|-------|-----|------------|
| Deep Black | `#0B0F12` | App-Hintergrund |
| Dark Teal | `#0E1F24` | Panels, Cards |
| Teal | `#00E0D1` | Primary Accent — Navigation, Aktionen, Icons, Focus |
| Lime | `#C6FF00` | Secondary Accent — Hints, Rewards, Fortschritt, Route |
| White | `#FFFFFF` | Text auf Dark |
| Grey | `#A0A7AD` | Metadata, Muted Text |

**Regel:** Ein Lime-Element pro Screen; Teal darf wiederholt werden. Grau nur für Metadata.

**Dark/Light Mode:**
- Player Mode = Dark Theme (Standard)
- Creator Mode = Light Theme (`[data-theme="light"]`)
- Akzentfarben (Teal, Lime) ändern sich NICHT zwischen Themes

## Typografie

| Rolle | Font | Verwendung | Regeln |
|-------|------|------------|--------|
| Display | **Anton** (Fallback: Bebas Neue) | Headlines, Card-Titel | ALL CAPS, synthetic oblique, 24–64px |
| Tech/UI | **Orbitron** | Buttons, Labels, Badges, Zahlen | ALL CAPS, tracking 0.04–0.14em, 700 weight, 9–20px |
| Body | **Rubik** | Fließtext, Instruktionen | Sentence case, 11–17px, leading 1.4–1.55 |

**Nie:** Body in Anton, langer Text in Orbitron.

## Layout

- Mobile-First: 390px Design-Breite, Single Column
- Content-Container: `max-w-[430px] mx-auto w-full` auf jeder Seite (begrenzt Desktop-Breite auf Handy-Maß)
- Screen-Gutters: 20px (`px-5`)
- Card-Abstand: 12px
- Section-Abstand: 28px
- Feste Elemente: Header oben, Primary Action unten (12px Gutter, 14px Safe-Area)
- Mitte scrollt
- Min. Touch-Target: 44px
- **Keine Bottom-Navigation / Tab-Bar**
- Mode-Switch: Quest Game ↔ Quest Creator (oben)

## Komponenten

| Komponente | Beschreibung |
|------------|-------------|
| **Button (Primary)** | Brush-Stroke SVG-Background, Teal-Gradient, Pill-Shape |
| **Button (Secondary)** | Teal Outline, Pill |
| **Button (Hint)** | Lime Outline, Pill |
| **Button (Ghost)** | Grey Outline, Pill |
| **IconButton** | Kreisförmig, für Map-Controls, Header-Actions |
| **QuestCard** | Foto + Scrim + Display-Titel + Meta-Line |
| **Badge** | Uppercase Status-Chip (progress / reward / outline / locked / danger) |
| **BrushMark** | Brand-Textur: Pinselstrich, Headline-Swash, gestrichelte Route |
| **ProgressTrack** | Quest-Stationen als Route — Lime (erledigt), Teal (aktuell) |
| **ModeTabs** | Quest Game ↔ Quest Creator Switch |
| **Input** | Labelled Text/Multiline Field |

## Ambient / Backdrop

Screen-weite Atmosphäre-Layer, kein Component im engeren Sinn — vor dem Bauen eines neuen Screens hier zuerst prüfen, ob sich ein bestehender Layer wiederverwenden lässt.

| Element | Beschreibung | Implementierung |
|---------|-------------|------------------|
| **Partikel-Backdrop** | Faines Teal-Grid + weicher Teal-Glow oben rechts + schwebende Teal/Lime-Punkte (`gq-float`-Keyframe, randomisierte Positionen/Timing) | `src/components/quest-list-backdrop.tsx` — genutzt auf jeder Listen-Screen: Quest-Liste (`/play`), Stationsliste (`station-list.tsx`), Modul-Ansicht Player (`station-modules.tsx`). Per `dynamic(..., { ssr: false })` einbinden, da Positionen randomisiert sind (SSR/Hydration-Diff sonst) |
| **Animierte Routenlinie** | Gestrichelte Lime-Linie (`gq-dash`-Keyframe), verbindet zwei Punkte als geschwungener S-Kurven-Pfad statt gerader/glatter Bezier — Motiv aus `Station_Screen.html` | Aktuell nur in `station-list.tsx` (`wavyPath`-Funktion + `RouteLine`), verbindet erste und letzte Stations-Badge. Endpunkte immer per `getBoundingClientRect` messen, nie hartkodieren — Kartenpositionen sind dynamisch |

## List-Header-Pattern

Standard-Header für jeden Listen-Screen (Quests, Stationen, Module) — sowohl Player (Dark) als auch Creator (Light). Immer in dieser Reihenfolge, direkt unter dem `AppHeader`:

1. **Eyebrow** — kleine Kategorie-Bezeichnung, `text-tech text-[10px] text-gq-teal` (z.B. „Stationen", „Stationsinhalte")
2. **Titel** — großer Display-Titel, `font-display italic text-[clamp(1.8rem,8vw,2.4rem)] leading-[0.96] uppercase text-foreground mt-1` (Quest-Name oder Stations-Name)
3. **Meta-Zeile** — Kennzahlen mit `·` getrennt, `text-tech text-[10px]` in `text-gq-grey` (Dark) bzw. `text-gq-grey-dark` (Light) — z.B. „5 Ziele · 2,4 km", „3 Module", „Ziel 2 von 5"
4. **Divider** — `h-px bg-border mt-4`

Container: `px-5 pt-3`. `AppHeader` selbst bleibt `transparent` und ohne `title`-Prop — der Screen-Titel lebt im Eyebrow/Titel-Block, nicht in der Header-Bar.

Referenzimplementierung: `station-list.tsx` (Player, Dark), `create/[id]/page.tsx` und `create/[id]/station/[stationId]/page.tsx` (Creator, Light), `station-modules.tsx` (Player, Dark).

**Navigation im Header:** `AppHeader` unterstützt `backHref` (Link, für URL-Routen) oder `onBack` (Callback, wenn "zurück" nur In-Memory-Screen-State ändert, z.B. im Quest-Player). Nie beides gleichzeitig übergeben.

## Corner Radii

- Buttons & Chips: Pill (`999px`)
- Cards: `16px`
- Fields & Tabs: `12px`
- Badges: `6px`

## Effekte

- **Glow statt Gloss:** Neon-Glow (`0 0 0 1px` accent 35% + `0 0 18px` accent 35%)
- **Schatten:** Pure black, hohe Alpha. Keine farbigen Schatten.
- **Glass:** Nur über Karte: `rgba(14,31,36,.62)` + `blur(14px)`
- **Cards:** `1px` Hairline Border `rgba(160,167,173,.22)`, `16px` Radius, Drop Shadow `0 10px 24px rgba(0,0,0,.45)`

## States

| State | Verhalten |
|-------|-----------|
| Hover | Accent-BG 10–12% Alpha, Glow erscheint, Card hebt 2px |
| Press | `scale(.96)` + `brightness(.92)`, Glow verschwindet |
| Focus | `0 0 0 3px rgba(0,224,209,.45)` Ring + Border Teal |
| Disabled | Grey `#2B3438` Fill, `#5B646A` Text, kein Glow |

## Motion

- Press: `120ms`
- Hover/State: `180ms`
- Screen/Reveal: `320ms`
- Easing UI: `cubic-bezier(.16,.84,.44,1)`
- Easing Rewards/Celebrations: `cubic-bezier(.34,1.56,.64,1)` (Overshoot)
- Keine Parallax, keine langen Fades, keine Ambient-Loops

## Icons

- **Lucide** Icon-Set (outline, ~2px Stroke, rounded caps)
- Teal: Navigation, Aktionen, Metadata
- Lime: Hints, Rewards, Achievements
- Grey: Inaktive Elemente
- Größen: 13px (Meta), 16–18px (Buttons), 22px (Tab-Bar), 26–30px (Features), 54px (Reward-Hero)

## Content & Copy

- **Vocabulary (fest):** Quest, Ziel (Station), Aufgabe (Task), Hinweis, Route, Abzeichen, Entwurf, Live
- **Casing:** Headlines = ALL CAPS mit Punkten als Beats. Buttons/Labels = ALL CAPS. Body = Sentence Case.
- **Zahlen:** Deutsch-formatiert: `5 Ziele · 2,4 km`, `25 m`, `ca. 45 Min`
- **Englisch erlaubt** wo es Gaming-Slang ist: `IN PROGRESS`, `DARK MODE`

### Beispiele (on-brand)
- `Quest starten` · `Weiter zum nächsten Ziel` · `Hinweis anzeigen`
- `Ziel 3 von 5` · `Du bist fast da.`
- Creator: `Setz Ziele auf die Karte, schreib Aufgaben dazu, teile sie mit deinen Freunden.`

### Off-brand
- "Bitte geben Sie Ihre Antwort ein." (formal)
- "Herzlichen Glückwunsch! Du hast erfolgreich..." (corporate, lang)
- "Optimiere dein Quest-Erlebnis" (Marketing-Abstraktion)

## Quell-Assets

Alle Design-Dateien in: `design-preparation/Geo Quest Design SystemV2/`
- `assets/` — Logo, Pin-Mark, Brush-Stroke SVG, Source Sheets
- `tokens/` — CSS Custom Properties (colors, typography, spacing, effects)
- `components/` — React-Komponenten (Referenz-Implementierung)
- `guidelines/` — Visuelle Specimen-Karten
- `ui_kits/` — Klickbare Screen-Prototypen (Quest Game + Quest Creator)
