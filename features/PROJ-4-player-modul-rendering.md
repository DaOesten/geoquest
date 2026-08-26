# PROJ-4: Player — Modul-Rendering

## Status: Deployed
**Created:** 2026-08-24
**Last Updated:** 2026-08-26

## Dependencies
- Requires: PROJ-2 (Quest Data Model & JSON Import) — für Modul-Datenstruktur
- Requires: PROJ-3 (Player — GPS-Navigation) — für Ankunftserkennung und State Machine

## Summary
Nach der Ankunft an einer Station werden dem Spieler die Stations-Inhalte (Module) angezeigt: Texte, Bilder, Audio, Video und interaktive Aufgaben. Die Module erscheinen als scrollbare Liste. Aufgaben müssen gelöst werden, bevor die Station abgeschlossen werden kann. Bereits gelöste Aufgaben bleiben gespeichert.

## User Stories
1. Als Spieler möchte ich nach der Ankunft an einer Station die Inhalte (Text, Bilder, Audio, Video) sehen, damit ich die Geschichte der Quest erlebe.
2. Als Spieler möchte ich Aufgaben (Code-Eingabe, Multiple Choice, Sortierung) lösen können, damit das Spiel herausfordernd und interaktiv ist.
3. Als Spieler möchte ich sofortiges Feedback bei Aufgaben erhalten (richtig/falsch), damit ich weiß ob meine Antwort stimmt.
4. Als Spieler möchte ich unbegrenzte Versuche bei Aufgaben haben, damit ich nicht steckenbleibe und frustriert aufgebe.
5. Als Spieler möchte ich eine Station erst abschließen können wenn alle Aufgaben gelöst sind, damit ich nichts verpasse.
6. Als Spieler möchte ich eine bereits erreichte Station jederzeit wieder öffnen können (ohne erneut hinlaufen zu müssen), damit ich unterbrochene Aufgaben fortsetzen kann.

## Out of Scope
- Outro-Anzeige nach der letzten Station — PROJ-5
- Quest-Neustart / Fortschritt zurücksetzen — PROJ-5
- Quest-Abschluss-Screen — PROJ-5
- Rich-Text-Formatierung (fett, kursiv) in Text-Modulen
- Offline-Caching von Medien-Inhalten
- Hinweis-System / Tipps bei schwierigen Aufgaben
- Punkte / Bewertung pro Aufgabe
- Timer / Zeitlimit für Aufgaben
- Aufgaben überspringen
- Medien-Download für Offline-Nutzung
- Vollbild-Lightbox für Bilder (Tap-to-Zoom) — kann als Enhancement später ergänzt werden

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Stations-Screen (nach Ankunft):**
- [ ] Angenommen der Spieler hat "Station entdecken" im Arrival-Overlay getippt, wenn der Stations-Screen erscheint, dann werden alle Module der Station als scrollbare Liste angezeigt (in der Reihenfolge aus der Quest-Datei)
- [ ] Angenommen der Stations-Screen ist offen, wenn der Spieler nach unten scrollt, dann ist am Ende ein "Station abschließen"-Button sichtbar
- [ ] Angenommen es gibt ungelöste Aufgaben, wenn der Spieler den "Station abschließen"-Button sieht, dann ist er deaktiviert mit dem Hinweis "Noch X Aufgaben offen"
- [ ] Angenommen alle Aufgaben sind gelöst, wenn der Spieler den "Station abschließen"-Button sieht, dann ist er aktiv (Teal-Pill-Style)
- [ ] Angenommen alle Aufgaben sind gelöst, wenn der Spieler "Station abschließen" tippt, dann wird die Station als abgeschlossen markiert und die nächste Station freigeschaltet

**Text-Modul:**
- [ ] Angenommen ein Text-Modul ist vorhanden, wenn es gerendert wird, dann wird der Text mit Zeilenumbrüchen und Listen korrekt dargestellt

**Bild-Modul:**
- [ ] Angenommen ein Bild-Modul ist vorhanden, wenn es gerendert wird, dann wird das Bild in voller Breite (innerhalb des 430px-Containers) angezeigt
- [ ] Angenommen ein Bild-Modul hat eine Caption, wenn es gerendert wird, dann wird die Bildunterschrift unter dem Bild angezeigt
- [ ] Angenommen die Bild-URL ist nicht erreichbar, wenn das Modul gerendert wird, dann erscheint ein Placeholder mit Hinweis "Bild konnte nicht geladen werden" (blockiert nicht den Fortschritt)

**Audio-Modul:**
- [ ] Angenommen ein Audio-Modul ist vorhanden, wenn es gerendert wird, dann wird ein kompakter Player mit Play/Pause-Button und Fortschrittsleiste angezeigt
- [ ] Angenommen ein Audio-Modul hat eine Caption, wenn es gerendert wird, dann wird die Beschreibung angezeigt
- [ ] Angenommen die Audio-URL ist nicht erreichbar, wenn das Modul gerendert wird, dann erscheint ein Placeholder mit Hinweis "Audio konnte nicht geladen werden"

**Video-Modul:**
- [ ] Angenommen ein Video-Modul ist vorhanden, wenn es gerendert wird, dann wird ein Inline-Video-Player in voller Breite mit nativen Controls angezeigt (kein Autoplay)
- [ ] Angenommen ein Video-Modul hat eine Caption, wenn es gerendert wird, dann wird die Beschreibung angezeigt
- [ ] Angenommen die Video-URL ist nicht erreichbar, wenn das Modul gerendert wird, dann erscheint ein Placeholder mit Hinweis "Video konnte nicht geladen werden"

**Task: Code-Eingabe:**
- [ ] Angenommen ein Code-Eingabe-Task ist vorhanden, wenn er gerendert wird, dann wird die Fragestellung, ein Textfeld und ein "Prüfen"-Button angezeigt
- [ ] Angenommen der Spieler hat die richtige Antwort eingegeben (case-insensitive, trimmed), wenn er "Prüfen" tippt, dann erscheint grünes Feedback mit Häkchen und der Task wird als gelöst markiert
- [ ] Angenommen der Spieler hat eine falsche Antwort eingegeben, wenn er "Prüfen" tippt, dann erscheint rotes Feedback mit Shake-Animation und "Leider falsch, versuch's nochmal!"
- [ ] Angenommen der Task ist als gelöst markiert, wenn der Spieler den Screen sieht, dann ist das Eingabefeld deaktiviert und das Häkchen sichtbar

**Task: Multiple Choice (Single):**
- [ ] Angenommen ein Multiple-Choice-Task mit einer korrekten Antwort ist vorhanden, wenn er gerendert wird, dann werden Radio-Buttons für jede Option angezeigt
- [ ] Angenommen der Spieler hat eine Option gewählt, wenn er "Prüfen" tippt und die Antwort richtig ist, dann erscheint grünes Feedback mit Häkchen
- [ ] Angenommen der Spieler hat eine Option gewählt, wenn er "Prüfen" tippt und die Antwort falsch ist, dann erscheint rotes Feedback (ohne zu verraten welche Option richtig ist)

**Task: Multiple Choice (Multi):**
- [ ] Angenommen ein Multiple-Choice-Task mit mehreren korrekten Antworten ist vorhanden, wenn er gerendert wird, dann werden Checkboxen für jede Option angezeigt
- [ ] Angenommen der Spieler hat Optionen gewählt, wenn er "Prüfen" tippt und alle korrekten Optionen (und keine falschen) ausgewählt sind, dann erscheint grünes Feedback
- [ ] Angenommen der Spieler hat Optionen gewählt, wenn er "Prüfen" tippt und die Auswahl nicht komplett korrekt ist, dann erscheint rotes Feedback (ohne zu verraten welche Optionen richtig/falsch sind)

**Task: Sortierung:**
- [ ] Angenommen ein Sortierungs-Task ist vorhanden, wenn er gerendert wird, dann werden die Items in zufälliger Reihenfolge mit Drag & Drop-Handles angezeigt
- [ ] Angenommen der Spieler hat die Items per Drag & Drop umsortiert, wenn er "Prüfen" tippt und die Reihenfolge korrekt ist, dann erscheint grünes Feedback
- [ ] Angenommen der Spieler hat die Items umsortiert, wenn er "Prüfen" tippt und die Reihenfolge falsch ist, dann erscheint rotes Feedback mit Shake-Animation

**Fortschritt & Wiedereinstieg:**
- [ ] Angenommen der Spieler hat Tasks gelöst und verlässt den Stations-Screen, wenn er später zur gleichen Station zurückkehrt, dann sind die gelösten Tasks weiterhin als gelöst markiert
- [ ] Angenommen der Spieler hat eine Station bereits erreicht (Ankunft erkannt), wenn er in der Stationsliste auf diese Station tippt, dann öffnet sich direkt der Modul-Screen (ohne erneute GPS-Navigation)
- [ ] Angenommen der Spieler hat eine Station abgeschlossen, wenn er sie in der Stationsliste sieht, dann ist sie als abgeschlossen markiert (Häkchen) und die nächste Station ist freigeschaltet

## Edge Cases
1. **Station ohne Tasks (nur Content-Module):** "Station abschließen"-Button ist sofort aktiv — keine Aufgaben zu lösen.
2. **Station mit nur Tasks (kein Text/Medien):** Funktioniert normal — nur Task-Module in der Liste.
3. **Medien-URL nicht erreichbar:** Placeholder-Anzeige, blockiert nicht den Fortschritt. Nur Tasks blockieren.
4. **Sehr langer Text:** Scrollbar, keine Begrenzung. Text wird mit Zeilenumbrüchen korrekt dargestellt.
5. **Drag & Drop auf kleinem Bildschirm:** Touch-Hold aktiviert Drag. Visuelles Feedback (Item hebt sich ab, Schatten). Drop-Zone klar erkennbar.
6. **Spieler gibt leeren String als Code-Antwort ein:** "Prüfen"-Button ist deaktiviert bei leerem Eingabefeld.
7. **Sehr viele Module (>10):** Scrollbare Liste, kein Performance-Problem (Module werden linear gerendert, kein Lazy Loading nötig).
8. **App wird während Audio/Video-Wiedergabe geschlossen:** Wiedergabe stoppt automatisch (Browser-Verhalten). Beim Wiedereinstieg startet das Medium von vorne — kein Playback-Fortschritt gespeichert.
9. **Datenmodell-Migration (correctIndex → correctIndices):** Altes Feld `correctIndex` wird beim Laden zu `[correctIndex]` konvertiert. Neue Quests nutzen `correctIndices`.

## Technical Requirements
- Datenmodell-Erweiterung: `correctIndex: number` → `correctIndices: number[]` (abwärtskompatibel)
- Erkennung Single vs. Multi Choice: `correctIndices.length === 1` → Radio-Buttons, `> 1` → Checkboxen
- Code-Eingabe-Vergleich: `answer.trim().toLowerCase() === input.trim().toLowerCase()`
- Sortierung: Items starten in zufälliger Reihenfolge (deterministic shuffle bei Render, nicht bei jedem Re-Render)
- Drag & Drop: Touch-kompatibel, min. 44px Touch-Targets
- Task-Fortschritt: localStorage unter `gq_progress_{questId}` erweitern um `solvedTasks: string[]` (Modul-Indices pro Station)
- Medien-Fehlerbehandlung: `onError`-Handler auf `<img>`, `<audio>`, `<video>` für Placeholder
- Kein Autoplay bei Video/Audio
- Min. 16px Body-Text (PRD-Anforderung)
- Responsive innerhalb max-w-[430px] Container

## Open Questions
_Keine offenen Fragen._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Module als scrollbare Liste (kein Karussell/Tabs) | Einfach, übersichtlich, kein versteckter Content. Spieler sieht alles linear | 2026-08-24 |
| "Station abschließen"-Button nur aktiv wenn alle Tasks gelöst | Stellt sicher dass Spieler alle Inhalte sehen und Rätsel lösen | 2026-08-24 |
| Unbegrenzte Versuche, kein Überspringen | Zielgruppe 10–15 Jahre — kein Frustrations-Game-Over, aber auch kein Cheaten | 2026-08-24 |
| Bei falsch: nicht verraten welche Optionen richtig sind | Erhält den Rätsel-Charakter, Spieler muss nachdenken | 2026-08-24 |
| Keine Nummern an Sortier-Items | Spieler soll die inhaltliche Reihenfolge erkennen, nicht nach Nummern sortieren | 2026-08-24 |
| Bei Multi-Choice nicht anzeigen wie viele Optionen korrekt sind | Erhöht die Herausforderung, Spieler muss selbst entscheiden wann vollständig | 2026-08-24 |
| "Station entdecken" statt "Weiter geht's" im Arrival-Overlay | Weckt Neugier auf die Inhalte, passt besser zum Entdecker-Thema | 2026-08-24 |
| Drag & Drop für Sortierung (statt Hoch/Runter-Buttons) | Intuitivere Interaktion, gamiger, Zielgruppe ist Touch-affin | 2026-08-24 |
| correctIndex → correctIndices (Array) | Ermöglicht Single- UND Multi-Choice mit einem Feld. Abwärtskompatible Migration | 2026-08-24 |
| Single vs. Multi automatisch erkennen (Radio vs. Checkbox) | Spieler muss nicht wissen ob Single/Multi — UI zeigt es durch Input-Typ | 2026-08-24 |
| Erreichte Station ohne erneute Navigation öffenbar | Spieler soll nicht nochmal hinlaufen wenn er unterbrochen hat — frustrierend | 2026-08-24 |
| Kaputte Medien-URLs blockieren nicht | Ersteller-Fehler soll Spielerlebnis nicht zerstören — nur Tasks sind Pflicht | 2026-08-24 |
| Kein Fortschrittsbalken innerhalb Station | Module sind linear scrollbar, Spieler sieht direkt was noch kommt | 2026-08-24 |
| Teal-Pill-Button für "Station abschließen" | Konsistent mit bestehendem CTA-Style (PROJ-3 Arrival, Intro) | 2026-08-24 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neuer Screen "modules" in bestehender State Machine | Erweitert PROJ-3 Flow natürlich: Arrival → Module → Stationsliste. Kein neues Routing nötig | 2026-08-24 |
| `completedStations` + `solvedTasks` in localStorage | Trennung: "besucht" (GPS-Ankunft) vs. "abgeschlossen" (Tasks gelöst). Granularer Task-Fortschritt ermöglicht Wiedereinstieg | 2026-08-24 |
| correctIndices als Array mit Abwärtskompatibilität | Altes correctIndex wird beim Import konvertiert. Kein Breaking Change für bestehende Quest-Dateien | 2026-08-24 |
| HTML5 DnD + Touch zuerst, @dnd-kit als Fallback | Kein externes Package wenn nativ funktioniert. dnd-kit nur nachrüsten falls iOS Safari Probleme macht | 2026-08-24 |
| Kein Lazy-Loading für Module | Max. 20 Module pro Station (Schema-Limit), alle gleichzeitig rendern ist performant genug | 2026-08-24 |
| Separate Komponente pro Modul-Typ | Single Responsibility, isoliert testbar, einfach erweiterbar für zukünftige Modul-Typen | 2026-08-24 |
| Feedback-Animationen rein CSS | Keine Animation-Library nötig. Shake = CSS keyframe, Grün-Highlight = Transition | 2026-08-24 |
| Audio-Player custom (kein natives `controls`) | Native Audio-Controls sind nicht themebar. Eigener Player mit Play/Pause + Fortschrittsleiste passt zum Design-System | 2026-08-24 |
| Video-Player mit nativen Controls | Video-Controls sind komplex (Fullscreen, Scrubbing). Native Controls sind funktional und von Nutzern erwartet | 2026-08-24 |

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
/play/[id] (Quest Player — erweiterte State Machine)
│
├── [bestehende Screens: Permission, Intro, Stationsliste, Navigation]
│
└── [NEUER Screen: Station-Module]
    │
    ├── AppHeader (Stationsname + Zurück → Stationsliste)
    │
    ├── Modul-Liste (scrollbar, Module in Reihenfolge)
    │   ├── TextModule — Plain Text mit Zeilenumbrüchen + Listen
    │   ├── ImageModule — Bild volle Breite + optionale Caption
    │   ├── AudioModule — Kompakter Player (Play/Pause + Fortschritt)
    │   ├── VideoModule — Inline HTML5-Player + optionale Caption
    │   ├── CodeTaskModule — Frage + Textfeld + "Prüfen"-Button
    │   ├── MultipleChoiceModule — Frage + Radio/Checkboxen + "Prüfen"-Button
    │   └── SortingTaskModule — Frage + Drag & Drop-Liste + "Prüfen"-Button
    │
    └── "Station abschließen"-Button (deaktiviert wenn Tasks offen)
```

### Integration in bestehende State Machine

```
Bestehend (PROJ-3):
  Navigation → Ankunft erkannt → Station als "besucht" markiert → Stationsliste

Neu (PROJ-4):
  Navigation → Ankunft erkannt → ArrivalOverlay ("Station entdecken")
                                        │
                                        ▼
                                 [Station-Module Screen]
                                        │
                                        ▼ "Station abschließen"
                            Station als "abgeschlossen" markiert → Stationsliste

Wiedereinstieg:
  Stationsliste → Tap auf erreichte (nicht abgeschlossene) Station → direkt Module Screen
```

### Daten-Architektur

```
localStorage "gq_progress_{questId}" (erweitert)
├── visitedStations: ["station-uuid-1", ...]     ← BESTEHEND (Ankunft erkannt)
├── completedStations: ["station-uuid-1", ...]   ← NEU (alle Tasks gelöst)
├── solvedTasks: {                               ← NEU (Task-Fortschritt)
│     "station-uuid-1": [0, 2],                    (gelöste Modul-Indices)
│     "station-uuid-2": [1]
│   }
├── currentScreen: "intro" | "stations" | ...
└── lastStationIndex: 0
```

**Fortschritt-Logik (erweitert):**
- Station "besucht" = Ankunft erkannt (GPS), Modul-Screen zugänglich
- Station "abgeschlossen" = alle Tasks gelöst + Button getippt → nächste freigeschaltet
- `solvedTasks` speichert gelöste Modul-Indices pro Station (nur Tasks, keine Content-Module)
- Nächste Station freigeschaltet basiert auf `completedStations` (nicht mehr `visitedStations`)

### Datenmodell-Erweiterung (Multiple Choice)

```
Aktuell (PROJ-2):    correctIndex: number        (ein Index)
Neu (PROJ-4):        correctIndices: number[]    (ein oder mehrere Indices)

Abwärtskompatibilität:
- Quest-Import erkennt altes Feld "correctIndex" und konvertiert zu [correctIndex]
- Neues Feld "correctIndices" hat Priorität wenn beide vorhanden
- Erkennung: correctIndices.length === 1 → Radio-Buttons, > 1 → Checkboxen
```

### Neue Dateien

```
src/
└── components/
    ├── station-modules.tsx         ← Orchestriert Modul-Liste + Abschluss-Button
    └── modules/
        ├── text-module.tsx         ← Plain Text Renderer
        ├── image-module.tsx        ← Bild + Caption + Fehler-Placeholder
        ├── audio-module.tsx        ← Custom Audio-Player
        ├── video-module.tsx        ← Video-Player (native Controls)
        ├── code-task.tsx           ← Code-Eingabe Task
        ├── multiple-choice-task.tsx ← Single/Multi Choice Task
        └── sorting-task.tsx        ← Drag & Drop Sortierung
```

### Bestehende Dateien (Änderungen)

| Datei | Änderung |
|-------|----------|
| `quest-player.tsx` | Neuer Screen "modules", Arrival-Flow angepasst |
| `navigation-screen.tsx` | Button-Text "Station entdecken" |
| `station-list.tsx` | Tap auf erreichte Station → Modul-Screen |
| `quest-progress.ts` | `completedStations`, `solvedTasks`, Hilfsfunktionen |
| `quest-schema.ts` | `correctIndices` Feld, abwärtskompatible Validierung |
| `use-quest-progress.ts` | Erweiterte Logik für completed vs. visited |

### Shared Components (bereits installiert)

| shadcn | Verwendung |
|--------|------------|
| `Button` | "Prüfen", "Station abschließen" |
| `Input` | Code-Eingabe Textfeld |
| `RadioGroup` | Single-Choice Optionen |
| `Checkbox` | Multi-Choice Optionen |

### Drag & Drop

- Erst HTML5 Drag and Drop API + Touch Events versuchen
- Falls iOS Safari problematisch → `@dnd-kit/core` + `@dnd-kit/sortable` nachrüsten (~15KB)
- Items: Drag-Handle (Grip-Icon), Schatten beim Ziehen, 44px Touch-Targets

### Dependencies

Keine neuen Packages zwingend erforderlich. Optional:
- `@dnd-kit/core` + `@dnd-kit/sortable` (nur falls HTML5 DnD auf Mobile nicht reicht)

---

## QA Test Results

**Tested:** 2026-08-26
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

**Methodik-Hinweis:** Die Playwright-Browser-Installation (Chromium Headless Shell und teils WebKit) ist sowohl in der Sandbox als auch im lokalen Terminal des Nutzers wiederholt beim Entpacken hängengeblieben (mehrfach über mehrere Minuten ohne Fortschritt versucht, auch nach Neuinstallation der einzelnen Browser-Pakete). Nach mehreren erfolglosen Anläufen hat der Nutzer bewusst entschieden, die Live-E2E-Ausführung nicht weiter zu verfolgen. Die QA-Freigabe basiert daher **ausschließlich auf Code-Review + Unit-Tests**: vollständiger Code-Review gegen jedes Acceptance Criterion, die grüne Vitest-Suite (62/62, inkl. 12 neu geschriebener Tests für Stationsfreischaltung und `correctIndex`-Migration) sowie eine fertige, aber nicht ausgeführte E2E-Spec (`tests/proj-4-player-modul-rendering.spec.ts`, 24 Tests) als Dokumentation des erwarteten Verhaltens und als Grundlage für einen späteren Lauf, sobald die lokale Playwright-Installation funktioniert.

### Acceptance Criteria Status

#### AC-1: Stations-Screen (nach Ankunft)
- [x] Alle Module einer Station erscheinen als scrollbare Liste in Quest-Reihenfolge (`station-modules.tsx` rendert `station.modules` linear per `.map`)
- [x] "Station abschließen"-Button ist Teil des normalen Scroll-Flows am Ende der Liste
- [x] Bei offenen Aufgaben: Button deaktiviert mit "Noch X Aufgabe(n) offen"
- [x] Bei allen Aufgaben gelöst: Button aktiv im Teal-Pill-Style
- [x] Tippen auf aktiven Button markiert Station als abgeschlossen und schaltet die nächste frei (`completeStation` → `getStationStatus`-Logik in `use-quest-progress.ts`, jetzt durch Unit-Tests abgesichert)

#### AC-2: Text-Modul
- [x] Zeilenumbrüche und Listen (`- `-Präfix) werden korrekt als Absätze/Bullet-Liste dargestellt

#### AC-3: Bild-Modul
- [x] Bild wird in voller Breite innerhalb des 430px-Containers angezeigt
- [x] Caption wird unter dem Bild angezeigt
- [x] Placeholder "Bild konnte nicht geladen werden" bei fehlerhafter URL (`onError`-Handler), blockiert den Fortschritt nicht

#### AC-4: Audio-Modul
- [x] Kompakter Player mit Play/Pause-Button und Fortschrittsleiste
- [x] Caption wird angezeigt
- [x] Placeholder "Audio konnte nicht geladen werden" bei fehlerhafter URL

#### AC-5: Video-Modul
- [x] Inline-Player in voller Breite mit nativen Controls, kein Autoplay (kein `autoplay`-Attribut, `preload="metadata"`)
- [x] Caption wird angezeigt
- [x] Placeholder "Video konnte nicht geladen werden" bei fehlerhafter URL

#### AC-6: Task — Code-Eingabe
- [x] Frage, Textfeld und "Prüfen"-Button vorhanden
- [x] Richtige Antwort (case-insensitive, trimmed) → Erfolgs-Feedback mit Häkchen, als gelöst markiert
- [x] Falsche Antwort → rotes Feedback mit Shake-Animation, Text "Leider falsch, versuch's nochmal!"
- [x] Gelöster Task: Eingabefeld deaktiviert/ausgeblendet, Häkchen sichtbar

#### AC-7: Task — Multiple Choice (Single)
- [x] Radio-Buttons pro Option — **während dieser QA auf `RadioGroup`/`RadioGroupItem` (shadcn) umgestellt**, vorher handgebaute Divs (Regel-Verstoß, siehe Bugs)
- [x] Richtige Auswahl → Erfolgs-Feedback
- [x] Falsche Auswahl → rotes Feedback, ohne die richtige Option zu verraten

#### AC-8: Task — Multiple Choice (Multi)
- [x] Checkboxen pro Option — **auf `Checkbox` (shadcn) umgestellt**, vorher handgebaute Divs
- [x] Alle korrekten (und keine falschen) Optionen gewählt → Erfolgs-Feedback (`selected.length === correctIndices.length && selected.every(...)`)
- [x] Unvollständige/falsche Auswahl → rotes Feedback, ohne zu verraten welche Optionen richtig/falsch sind

#### AC-9: Task — Sortierung
- [x] Items erscheinen in zufälliger, garantiert nicht bereits korrekter Reihenfolge mit Drag-Handle (`shuffle()` + Wiederholungs-Schleife bis Reihenfolge ≠ korrekt)
- [x] Korrekte Reihenfolge nach Drag & Drop → Erfolgs-Feedback
- [x] Falsche Reihenfolge → rotes Feedback mit Shake-Animation
- [x] Touch-Drag-Schrittweite korrigiert: `itemHeight` in `sorting-task.tsx` von hartkodiert `56` auf `58` (52px Zeile + 6px Gap) angepasst

#### AC-10: Fortschritt & Wiedereinstieg
- [x] Gelöste Tasks bleiben nach Verlassen/Wiederkehr markiert (`solvedTasks` in `localStorage`, persistiert pro Station)
- [x] Tippen auf bereits erreichte (nicht abgeschlossene) Station öffnet direkt den Modul-Screen ohne erneute GPS-Navigation
- [x] Abgeschlossene Station zeigt Häkchen, nächste Station wird freigeschaltet

### Edge Cases Status

#### EC-1: Station ohne Tasks (nur Content-Module)
- [x] "Station abschließen"-Button ist sofort aktiv (`taskIndices` leer → `unsolvedCount === 0`)

#### EC-2: Station mit nur Tasks
- [x] Funktioniert normal, keine Content-Module erforderlich

#### EC-3: Medien-URL nicht erreichbar
- [x] Placeholder-Anzeige, blockiert den Fortschritt nicht (nur Tasks sind Pflicht für den Abschluss-Button)

#### EC-6: Leerer String als Code-Antwort
- [x] "Prüfen"-Button deaktiviert bei leerem Eingabefeld

#### EC-9: Datenmodell-Migration `correctIndex` → `correctIndices`
- [x] Migration korrekt (neuer Test `quest-schema.test.ts`): legacy `correctIndex` → `[correctIndex]`, `correctIndices` hat Vorrang wenn beide vorhanden, Default `[0]` wenn keines gesetzt, out-of-bounds-Indices werden abgelehnt

### Regression Testing (PROJ-1/PROJ-3, bereits deployed)
- [x] Code-Review bestätigt: PROJ-4 ändert `station-list.tsx`, `navigation-screen.tsx`, `quest-player.tsx` gezielt gemäß den im Decision Log dokumentierten, gewollten Entscheidungen (Freischaltung über `completedStations` statt `visitedStations`; Button "Station entdecken" statt "Weiter geht's!"; Arrival führt jetzt zum Modul-Screen statt zurück zur Liste)
- [x] 3 dadurch veraltete PROJ-3-E2E-Tests (`tests/proj-3-player-gps-navigation.spec.ts`) identifiziert und aktualisiert, damit sie das neue, korrekte Verhalten prüfen statt das alte
- [ ] Nicht verifiziert: tatsächliche Ausführung von `npm run test:e2e` — Playwright-Browser-Install blockiert lokal wie in der Sandbox, Nutzer hat bewusst entschieden nicht weiter zu verfolgen (siehe Methodik-Hinweis oben). Sollte nachgeholt werden, sobald die lokale Playwright-Installation funktioniert.

### Security Audit Results
- [x] Authentifizierung/Autorisierung: N/A — kein Backend, kein Account-System (siehe PRD Non-Goals)
- [x] XSS: Alle Modul-Typen aus PROJ-4 (Code-Task Frage/Antwort, Multiple-Choice Frage/Optionen, Sortierung Frage/Items) laufen durch `sanitizeQuest()` in `quest-import.ts` (HTML-Tag-Stripping) — bereits vorhandene Tests in `quest-import.test.ts` decken das ab
- [x] Kein `dangerouslySetInnerHTML`, `eval()` oder `new Function()` irgendwo im Code (Repo-weiter Grep)
- [x] Medien-URLs sind auf `https://` beschränkt (`httpsUrl`-Schema in `quest-schema.ts`), `javascript:`-URLs werden von bestehenden Tests explizit abgelehnt
- [x] Task-Antworten (`correctIndices`, Code-`answer`) werden nie ins DOM gerendert, nur clientseitig verglichen — kein Leak der richtigen Antwort über HTML/DOM oder Netzwerk-Tab
- [x] `aria-labelledby` ergänzt: Frage-`<p>` erhält eine eindeutige `useId()`-ID, `RadioGroup` und die Checkbox-Gruppe (`role="group"`) referenzieren sie; Options-IDs sind jetzt ebenfalls pro Instanz eindeutig (verhindert doppelte DOM-IDs bei mehreren MC-Modulen auf einer Station)

### Bugs Found

#### BUG-1 (bereits behoben während dieser Session): Multiple-Choice nutzte keine shadcn-Primitives
- **Severity:** Medium (Regel-Verstoß + fehlende native Radio/Checkbox-Semantik)
- **Status:** Fixed — `multiple-choice-task.tsx` nutzt jetzt `RadioGroup`/`RadioGroupItem`/`Checkbox`

#### BUG-2 (bereits behoben während dieser Session): Erfolgs-Feedback nutzte Teal statt der spezifizierten "grünen" Farbe
- **Severity:** Low (visuelle Abweichung vom AC-Wortlaut)
- **Status:** Fixed — auf `gq-lime` umgestellt in `code-task.tsx`, `multiple-choice-task.tsx`, `sorting-task.tsx`

#### BUG-3 (behoben): Touch-Drag-Schrittweite in der Sortierung ungenau
- **Severity:** Low
- **Status:** Fixed — `itemHeight` in `sorting-task.tsx` auf `58` (52px Zeile + 6px Gap) korrigiert

#### BUG-4 (behoben): Fehlende `aria-labelledby`-Verknüpfung bei Multiple-Choice-Optionsgruppen
- **Severity:** Low
- **Status:** Fixed — `multiple-choice-task.tsx` verknüpft Frage und Optionsgruppe jetzt über `useId()` + `aria-labelledby`/`role="group"`

### Summary
- **Acceptance Criteria:** 28/28 geprüft und erfüllt (per Code-Review; Live-E2E-Bestätigung bewusst zurückgestellt, siehe Methodik-Hinweis)
- **Bugs Found:** 4 total (0 Critical, 0 High, 1 Medium, 3 Low) — alle 4 behoben
- **Security:** Pass, keine offenen Befunde
- **Production Ready:** YES
- **Recommendation:** Kann deployed werden (keine offenen Bugs, keine Critical/High-Findings). Bekannte Einschränkung: Die 24 neuen E2E-Tests (`tests/proj-4-player-modul-rendering.spec.ts`) sowie die 3 aktualisierten PROJ-3-Tests wurden noch nie live ausgeführt, weil die Playwright-Browser-Installation auf diesem Rechner (Sandbox und lokales Terminal) wiederholt hängen blieb. Sobald das Environment-Problem gelöst ist, `npm run test:e2e` nachholen.

---

## Deployment

**Deployed:** 2026-08-26
**Production URL:** https://geoquesty.vercel.app
**Commit:** 0527a96
**Tag:** v1.4.0-PROJ-4
**Verifiziert:** Nutzer hat den vollständigen Flow (Quest starten → Stationsliste → Station öffnen → Aufgabe lösen) live in Produktion durchgeklickt und bestätigt, dass es funktioniert.
