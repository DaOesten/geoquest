# PROJ-5: Player — Fortschritt & Abschluss

## Status: In Progress
**Created:** 2026-08-26
**Last Updated:** 2026-08-27

## Dependencies
- Requires: PROJ-3 (Player — GPS-Navigation) — für State Machine, `useQuestProgress` und die Quest-Liste
- Requires: PROJ-4 (Player — Modul-Rendering) — für Task-Completion-Logik und `completeStation`

## Summary
Rundet das Spielerlebnis ab: Nach der letzten Station sieht der Spieler einen Outro-Screen mit Konfetti-Effekt statt zurück in die Stationsliste zu springen. Auf der Quest-Liste (`/play`) erkennt der Spieler auf einen Blick, welche Quests neu, aktiv oder abgeschlossen sind (Badges, Fortschrittsbalken, Filter-Tabs), und kann eine abgeschlossene Quest per Icon-Button zurücksetzen, um sie erneut zu spielen.

## User Stories
1. Als Spieler möchte ich nach Abschluss der letzten Station einen Outro-Screen mit Erfolgsgefühl sehen, damit ich weiß, dass ich die Quest gemeistert habe.
2. Als Spieler möchte ich auf der Quest-Liste sofort erkennen, welche Quests neu, aktiv oder abgeschlossen sind, damit ich weiß, wo ich weitermachen kann.
3. Als Spieler möchte ich bei einer aktiven Quest auf einen Blick sehen, wie weit ich schon gekommen bin, damit ich meinen Fortschritt einschätzen kann.
4. Als Spieler möchte ich eine abgeschlossene Quest per Tastendruck zurücksetzen können, damit ich sie erneut (z.B. mit Freunden) spielen kann.
5. Als Spieler möchte ich die Quest-Liste nach Status filtern können, damit ich bei vielen importierten Quests schnell die richtige finde.

## Out of Scope
- Bestätigungsdialog vor dem Reset — bewusst weggelassen (siehe Decision Log), Reset passiert sofort mit Toast-Feedback
- Undo-Funktion nach dem Reset
- Live-GPS-Distanzanzeige zur nächsten Station auf der Quest-Liste (nur Stationsname, keine Live-Distanz — siehe Decision Log)
- Eigener Filter-Tab "Abgeschlossen" (nur Alle/Live/Neu)
- Punkte-/Zeit-Tracking oder Bestenliste nach Abschluss (PRD Non-Goal)
- Teilen-Funktion / Screenshot des Abschluss-Screens
- Distanz (km) und tatsächliche Spielzeit in der Meta-Zeile der Karten (nicht im Datenmodell vorhanden)
- Löschen der Quest selbst aus der Liste (Quest-Verwaltung — PROJ-6)
- Bereinigung verwaister Fortschritts-Einträge, wenn eine Quest gelöscht wird (PROJ-6)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Outro-Screen:**
- [ ] Angenommen der Spieler hat bei der letzten Station alle Aufgaben gelöst, wenn er "Station abschließen" tippt, dann wird direkt der Outro-Screen angezeigt (kein Zwischenstopp bei der Stationsliste)
- [ ] Angenommen der Outro-Screen ist sichtbar, wenn er gerendert wird, dann werden der Outro-Text der Quest sowie ein optionales Outro-Medium (Bild/Audio/Video) angezeigt
- [ ] Angenommen der Outro-Screen erscheint, wenn er gerendert wird, dann läuft ein Konfetti-Effekt (analog zum Ankunfts-Overlay aus PROJ-3) und es wird "X von X Stationen abgeschlossen" angezeigt
- [ ] Angenommen der Outro-Screen ist sichtbar, wenn der Spieler auf "Fertig" tippt, dann kehrt er zur Quest-Liste (`/play`) zurück
- [ ] Angenommen die Outro-Medien-URL ist nicht erreichbar, wenn der Screen gerendert wird, dann erscheint ein Placeholder analog zu den Stations-Modulen (blockiert den Abschluss nicht)
- [ ] Angenommen der Spieler hat eine Quest bereits abgeschlossen und öffnet sie erneut, wenn der gespeicherte Fortschritt geladen wird, dann wird direkt die Stationsliste angezeigt (der Outro-Screen erscheint nur einmalig im Moment des tatsächlichen Abschlusses, nicht bei jedem Wiedereinstieg)

**Status-Anzeige in der Quest-Liste:**
- [ ] Angenommen eine Quest wurde noch nie gestartet (keine besuchte Station), wenn die Quest-Liste angezeigt wird, dann erscheint die Karte mit dem Badge "Neu"
- [ ] Angenommen eine Quest wurde begonnen, aber noch nicht vollständig abgeschlossen (mind. 1 Station besucht, nicht alle abgeschlossen), wenn die Quest-Liste angezeigt wird, dann erscheint die Karte optisch hervorgehoben (Teal-Rahmen/Glow) mit Badge "Live" und einem Fortschrittsbalken (X von Y Stationen)
- [ ] Angenommen eine Quest ist vollständig abgeschlossen (alle Stationen), wenn die Quest-Liste angezeigt wird, dann erscheint der Kartentitel gedimmt und ein Reset-Icon-Button ("Quest zurücksetzen") am Kartenrand — ohne zusätzliches Status-Badge
- [ ] Angenommen mehrere Quests mit unterschiedlichem Status existieren, wenn der Filter "Alle" aktiv ist, dann werden aktive Quests zuerst angezeigt, danach neue, danach abgeschlossene

**Filter-Tabs:**
- [ ] Angenommen die Quest-Liste ist geöffnet, wenn sie zum ersten Mal angezeigt wird, dann ist der Filter "Alle" aktiv
- [ ] Angenommen die Quest-Liste ist geöffnet, wenn der Spieler auf den Filter-Tab "Live" tippt, dann werden nur aktive (begonnene, nicht abgeschlossene) Quests angezeigt
- [ ] Angenommen die Quest-Liste ist geöffnet, wenn der Spieler auf den Filter-Tab "Neu" tippt, dann werden nur nie gestartete Quests angezeigt
- [ ] Angenommen ein Filter außer "Alle" ist aktiv und keine Quest passt, wenn die Liste gerendert wird, dann erscheint ein passender Empty-State-Hinweis (z.B. "Keine aktiven Quests")

**Reset:**
- [ ] Angenommen eine Quest ist vollständig abgeschlossen, wenn der Spieler auf das Reset-Icon tippt, dann wird der gesamte gespeicherte Fortschritt dieser Quest (besuchte/abgeschlossene Stationen, gelöste Aufgaben) sofort gelöscht — ohne Bestätigungsdialog
- [ ] Angenommen der Fortschritt wurde zurückgesetzt, wenn die Liste neu rendert, dann zeigt die Karte sofort das Badge "Neu" und ein Toast "Fortschritt zurückgesetzt" erscheint kurz
- [ ] Angenommen der Fortschritt wurde zurückgesetzt, wenn der Spieler die Quest erneut öffnet, dann startet sie wie beim allerersten Mal (Permission- bzw. Intro-Screen, je nach Browser-Permission-Status)
- [ ] Angenommen der Spieler tippt auf das Reset-Icon einer abgeschlossenen Quest-Karte, wenn dies geschieht, dann öffnet sich nicht gleichzeitig die Quest selbst (Tap auf das Icon löst nicht den Card-Link aus)

## Edge Cases
1. **Quest mit nur 1 Station:** Abschluss der einzigen Station führt direkt zum Outro-Screen, kein Zwischenschritt über die Stationsliste.
2. **Reset einer Quest, die parallel in einem anderen Tab geöffnet ist:** Kein Live-Sync nötig (PRD schließt Multiplayer/Realtime aus) — beim nächsten Öffnen des Players in diesem Tab wird der zurückgesetzte Zustand geladen.
3. **Alle Quests haben Status "Neu":** Der "Live"-Filter zeigt den Empty State, "Alle" und "Neu" zeigen die volle Liste.
4. **Sehr viele Quests (z.B. 20):** Filter bleibt performant (rein clientseitiges Array-Filtern, keine Server-Anfrage).
5. **Sehr langer Outro-Text:** Verhält sich wie der Intro-Text — scrollbar, keine Kürzung.
6. **localStorage-Fortschritt korrupt oder gelöscht, während der Spieler auf dem Outro-Screen ist:** Gleiches Fallback-Verhalten wie in PROJ-3 (Fortschritt geht verloren, kein Crash).
7. **Quest hat 0 Stationen (sollte durch PROJ-2-Validierung nicht vorkommen):** Wird nicht separat behandelt — Datenmodell erzwingt mindestens 1 Station.

## Technical Requirements
- Status-Ableitung ausschließlich aus vorhandenen `gq_progress_{questId}`-Daten (`visitedStations`, `completedStations`) — keine neuen Felder im Quest-Datenmodell nötig
- Reset löscht den kompletten `gq_progress_{questId}`-Eintrag aus localStorage
- Filterung und Sortierung der Quest-Liste rein clientseitig (kein Server, keine Persistenz des Filter-Zustands nötig)
- Konfetti-Effekt: bestehende Implementierung aus dem Ankunfts-Overlay (PROJ-3, `navigation-screen.tsx`) wiederverwenden
- Min. 44px Touch-Targets für den Reset-Icon-Button (PRD-Anforderung)

## Open Questions
_Keine offenen Fragen._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Outro erscheint automatisch direkt nach der letzten Station (kein Umweg über Stationsliste) | Fühlt sich wie ein großes Finale an, konsistent mit der automatischen Ankunftserkennung aus PROJ-3 | 2026-08-26 |
| Konfetti-Effekt auf dem Outro-Screen | Größeres Erfolgserlebnis beim Quest-Abschluss, Wiederverwendung der bestehenden Ankunfts-Animation | 2026-08-26 |
| Outro erscheint nur einmalig im Abschluss-Moment, nicht bei jedem Wiedereinstieg | Wiedereinstieg in eine bereits abgeschlossene Quest soll direkt zur Stationsliste führen, nicht die Feier wiederholen | 2026-08-26 |
| "Neu starten" nur als Icon-Button auf der Quest-Karte in der Liste, nicht zusätzlich auf dem Outro-Screen | Ein zentraler Ort für die Reset-Funktion hält die UI einfach; der Outro-Screen bleibt reine Erfolgs-Anzeige | 2026-08-26 |
| Drei Status sichtbar: Neu, Aktiv (Live), Abgeschlossen — je mit eigener Kartendarstellung | Spieler soll auf einen Blick erkennen, wo er weitermachen kann, besonders bei mehreren importierten Quests | 2026-08-26 |
| Reset ohne vorherigen Bestätigungsdialog, stattdessen sofortige Ausführung + Toast-Feedback | Bewusste Abweichung von der generellen PRD-Regel "Bestätigungsdialog bei kritischen Aktionen" für diesen speziellen Fall — Reset betrifft nur den eigenen Spielfortschritt (nicht die Quest-Datei selbst), ist jederzeit durch erneutes Spielen wiederherstellbar und soll reibungslos funktionieren | 2026-08-26 |
| Nach Reset erhält die Karte das normale "Neu"-Badge (kein eigener "Zurückgesetzt/Bereit"-Zwischenzustand) | Einfacher: eine zurückgesetzte Quest verhält sich exakt wie eine nie gespielte Quest, keine zusätzliche UI-Variante nötig | 2026-08-26 |
| Keine Live-GPS-Distanz zur nächsten Station auf der Quest-Liste, nur Stationsname optional | Würde aktives GPS-Tracking bereits auf der Listen-Seite erfordern — deutlich mehr Aufwand für wenig Mehrwert, nicht Kern des Features | 2026-08-26 |
| Filter-Tabs Alle / Live / Neu (kein eigener "Abgeschlossen"-Tab) | Deckt den Haupt-Anwendungsfall (aktive Quest finden, neue Quest starten) ab, hält die Filter-Leiste schlank; abgeschlossene Quests bleiben über "Alle" erreichbar | 2026-08-26 |
| Sortierung in "Alle": Aktive zuerst, dann Neue, dann Abgeschlossene | Spieler soll sofort sehen, wo er weitermachen kann, statt in der Import-Reihenfolge suchen zu müssen | 2026-08-26 |
| Abgeschlossene Karte zeigt kein eigenes Status-Badge, nur gedimmten Titel + Reset-Icon | Übernommen aus der vom Nutzer bereitgestellten Design-Vorlage (`design-preparation/Quest_List.html`) | 2026-08-26 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Weiterhin kein Backend, alles über localStorage | Konsistent mit dem Rest der App (PRD-Vorgabe "Kein Backend"), keine neue Infrastruktur für ein rein lokales Fortschritts-Feature nötig | 2026-08-26 |
| Konfetti-Effekt aus dem Ankunfts-Overlay (PROJ-3) in eine eigene, wiederverwendbare Komponente ausgelagert | Wird jetzt an zwei Stellen gebraucht (Ankunft an Station + Outro-Screen) — eine Komponente statt Code-Duplizierung, ein Ort für künftige Anpassungen | 2026-08-26 |
| Status (Neu/Live/Abgeschlossen) wird bei jedem Laden der Quest-Liste live aus den vorhandenen Fortschrittsdaten berechnet, nicht separat gespeichert | Keine neuen Datenfelder nötig, Status kann nie mit dem echten Fortschritt aus dem Ruder laufen (keine Sync-Probleme zwischen zwei Werten) | 2026-08-26 |
| Reset löscht den gesamten Fortschritts-Eintrag der Quest (eine neue Funktion in der bestehenden Fortschritts-Bibliothek) statt einzelne Felder zurückzusetzen | Einfacher und robuster — die Quest landet exakt im Zustand einer nie gespielten Quest, kein Risiko vergessener Teilfelder | 2026-08-26 |
| "outro" als neuer Screen-Zustand in der bestehenden State Machine, aber nicht dauerhaft als solcher gespeichert (Persistenz wie beim "modules"-Screen als "stations") | Erweitert den PROJ-3/4-Flow ohne neues Routing; verhindert, dass der Outro-Screen bei jedem Wiedereinstieg erneut gezeigt wird | 2026-08-26 |
| Quest-Karten-Status nutzt die bereits installierte shadcn "Badge"- und "Progress"-Komponente | Kein neues Package nötig, konsistent mit dem restlichen UI-Baukasten | 2026-08-26 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
QuestPlayer (bestehende State Machine aus PROJ-3/4)
│
├── [bestehende Screens: Permission, Intro, Stationsliste, Navigation, Module]
│
└── [NEUER Screen: Outro]
    ├── ConfettiEffect (wiederverwendet, aus dem Ankunfts-Overlay ausgelagert)
    ├── Erfolgs-Icon (Pin + Haken-Badge, gleicher Stil wie Ankunfts-Overlay)
    ├── Outro-Text + optionales Medium (Bild/Audio/Video) aus der Quest-Datei
    ├── "X von X Stationen abgeschlossen"
    └── "Fertig"-Button → zurück zur Quest-Liste (/play)
```

```
/play (Quest-Liste, erweitert)
│
├── AppHeader "Meine Quests"
├── Filter-Tabs: Alle · Live · Neu
├── Quest-Karten (sortiert: Live zuerst, dann Neu, dann Abgeschlossen)
│   ├── Karte "Neu"          → Badge "Neu"
│   ├── Karte "Live"         → Teal-Rahmen/Glow, Badge "Live", Fortschrittsbalken (X von Y Stationen)
│   └── Karte "Abgeschlossen" → gedimmter Titel, Reset-Icon-Button ("Quest zurücksetzen")
├── Empty-State (keine Quests importiert ODER aktiver Filter ohne Treffer)
└── Import-Button (bestehend, unverändert)
```

### Integration in die bestehende State Machine

```
Bestehend (PROJ-4):
  Stationsliste → alle Aufgaben gelöst → "Station abschließen" → Stationsliste

Neu (PROJ-5):
  Stationsliste → letzte Station, alle Aufgaben gelöst → "Station abschließen"
                                                                │
                                                                ▼
                                                        [Outro-Screen]
                                                                │
                                                                ▼ "Fertig"
                                                        Quest-Liste (/play)

Wiedereinstieg in eine bereits abgeschlossene Quest:
  Quest-Liste → Karte tippen → direkt Stationsliste (kein erneuter Outro-Screen)
```

### Daten-Architektur

```
localStorage "gq_progress_{questId}" — keine neuen Felder, nur neue Nutzung:

Status-Ableitung (zur Laufzeit, nicht gespeichert):
  visitedStations.length === 0                              → "Neu"
  completedStations.length === stations.length               → "Abgeschlossen"
  sonst (mind. 1 besucht, nicht alle abgeschlossen)           → "Live"

Reset:
  gesamter "gq_progress_{questId}"-Eintrag wird gelöscht
  → Quest verhält sich danach wie eine nie gespielte Quest ("Neu")
```

### Neue Dateien

```
src/
└── components/
    ├── outro-screen.tsx        ← Outro-Screen (Text, Medium, Konfetti, Fertig-Button)
    ├── confetti-effect.tsx     ← ausgelagerte, wiederverwendbare Konfetti-Animation
    ├── quest-card.tsx          ← einzelne Quest-Karte inkl. Status-Darstellung
    └── quest-filter-tabs.tsx   ← Filter-Leiste (Alle / Live / Neu)
```

### Bestehende Dateien (Änderungen)

| Datei | Änderung |
|-------|----------|
| `quest-player.tsx` | Neuer Screen "outro", Übergang nach Abschluss der letzten Station |
| `navigation-screen.tsx` | Ankunfts-Overlay nutzt künftig `ConfettiEffect` statt eigener Partikel-Logik |
| `quest-progress.ts` | Neue Funktion zum vollständigen Löschen eines Fortschritts-Eintrags; Hilfsfunktion zur Status-Ableitung (Neu/Live/Abgeschlossen) |
| `play/page.tsx` | Filter-Tabs, Sortierung nach Status, `QuestCard`-Komponente statt Inline-Markup, Reset-Handling inkl. Toast |

### Shared Components (bereits installiert)

| shadcn | Verwendung |
|--------|------------|
| `Badge` | Status-Anzeige "Neu" / "Live" auf den Quest-Karten |
| `Progress` | Fortschrittsbalken auf der "Live"-Karte |
| `Button` | "Fertig" auf dem Outro-Screen |
| `Sonner` (Toast) | Rückmeldung "Fortschritt zurückgesetzt" |

### Dependencies

Keine neuen Packages erforderlich — alles baut auf bereits vorhandenen Bibliotheken auf (shadcn Badge/Progress/Button/Sonner, bestehende Konfetti-Logik, bestehende Fortschritts-Bibliothek).

## Implementation Notes

### Komponenten (gebaut)

| Komponente | Beschreibung |
|------------|-------------|
| `outro-screen.tsx` | Outro-Screen: Konfetti, Brand-Pin mit Haken-Badge, Quest-Name, "X von X Stationen abgeschlossen", Outro-Text/Medium, "Fertig"-Button (Teal-Pill-Style, gleiche Optik wie Intro-CTA) |
| `confetti-effect.tsx` | Aus dem Ankunfts-Overlay (PROJ-3) ausgelagerte Partikel-Animation, jetzt von `navigation-screen.tsx` UND `outro-screen.tsx` genutzt |
| `quest-card.tsx` | Einzelne Quest-Karte mit drei Varianten (`new` / `live` / `done`) je nach `QuestListStatus`. Einheitliches Layout: Status-Element (Badge bzw. Reset-Button) immer rechtsbündig in einer eigenen Zeile über dem Titel, Titel bricht über bis zu 2 Zeilen um (`line-clamp-2`) statt mit Ellipsis abgeschnitten zu werden |
| `quest-filter-tabs.tsx` | Filter-Leiste Alle/Live/Neu, reiner Präsentations-Komponente (kontrollierter State im Parent) |
| `quest-list-backdrop.tsx` | Dekorativer Hintergrund für `/play` (feines Teal-Raster + 46 langsam treibende Partikel + Teal-Glow), nachgebaut aus `design-preparation/Quest_List.html`s `gqBackdrop("partikel")`. Als `fixed inset-0`-Layer relativ zum Viewport (nicht zum scrollenden Content), damit der Effekt den ganzen Screen abdeckt statt sich über eine wachsende Karten-Liste zu verdünnen. Wird per `next/dynamic(..., { ssr: false })` geladen, da die Partikelpositionen `Math.random()`-basiert sind und sonst einen Hydration-Mismatch verursachen |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `quest-player.tsx` | Neuer Screen-Typ `"outro"`; `handleCompleteStation` erkennt die letzte Station (`viewingModulesIndex === stations.length - 1`) und wechselt zu `"outro"` statt `"stations"`; `setScreen` persistiert `"outro"` als `"stations"` (analog zu `"modules"`); `handleOutroDone` navigiert per `useRouter().push("/play")` |
| `navigation-screen.tsx` | Nutzt jetzt `<ConfettiEffect />` statt eigener Partikel-Logik (Duplizierung entfernt) |
| `quest-progress.ts` | Neue Funktionen `deleteProgress(questId)` und `getQuestListStatus(progress, totalStations)` |
| `play/page.tsx` | Komplett überarbeitet: `AppHeader` ohne Titel (nur Logo), große "MEINE QUESTS"-Headline + Zusammenfassung, Filter-Tabs, nach Status sortierte `QuestCard`-Liste, Reset-Handler mit Toast, `QuestListBackdrop` als fixierter Hintergrund-Layer |
| `use-quests.ts` | Bugfix (vorbestehend, nicht durch PROJ-5 verursacht): `getServerSnapshot()` gab bei jedem Aufruf ein neues `[]`-Array zurück statt einer stabilen Referenz — React warnte deshalb mit "The result of getServerSnapshot should be cached". Jetzt über eine Modul-Level-Konstante `EMPTY_QUESTS` behoben |

### Architektur-Abweichungen

- "Fertig"-Button auf dem Outro-Screen ist ein roh gestylter `<button>` (Teal-Pill, `shadow-glow-strong`) statt der shadcn-`Button`-Komponente — konsistent mit dem bestehenden Intro-Screen-CTA (`intro-screen.tsx`), der aus demselben Grund (Brand-Pill-Optik) ebenfalls kein shadcn-`Button` verwendet.
- Die große "Meine Quests"-Headline und die Zusammenfassungszeile sind Seiteninhalt unterhalb des `AppHeader` (nicht Teil der `AppHeader`-Komponente selbst) — der Nutzer wollte das Logo weiterhin im `AppHeader` behalten, während die Design-Vorlage (`design-preparation/Quest_List.html`) diese Headline als eigenständigen Block über der Liste zeigt.
- `QuestFilterTabs` speichert den aktiven Filter nur im lokalen State der Seite (kein localStorage) — beim Neuladen der Seite ist immer "Alle" aktiv, das war so nicht explizit spezifiziert und ist eine naheliegende Vereinfachung.

### Tests

- `quest-progress.test.ts` um 6 Tests für `deleteProgress` und `getQuestListStatus` ergänzt (alle 3 Status-Fälle + Löschverhalten).
- `npm run build`, `npm run lint` und `npm test` laufen fehlerfrei durch (68/68 Unit-Tests).

### Bekannte Einschränkung (Browser-Verifikation)

Playwright-Chromium ist auf dieser Maschine weiterhin defekt (`dlopen`-Fehler, Reinstall hängt sich fest — dasselbe Problem wie in der PROJ-4-QA dokumentiert). Als Workaround wurde stattdessen das bereits vorhandene, funktionierende Playwright-WebKit genutzt (`executablePath` manuell auf den WebKit-Cache gesetzt), um mehrere Szenarien der Quest-Liste per Screenshot zu verifizieren. Für `/qa` empfiehlt sich derselbe WebKit-Workaround, falls Chromium bis dahin nicht repariert ist.

### Manuelle Review-Runde (Nutzer-Feedback nach erster Implementierung)

Nach der ersten Implementierung hat der Nutzer die Seite live getestet und mehrere Korrekturen angestoßen, die direkt eingearbeitet wurden:
1. Partikel-Hintergrund aus dem Mockup war zunächst vergessen worden → `quest-list-backdrop.tsx` ergänzt.
2. Zwei React-Fehler nach Einführung des Hintergrunds (`getServerSnapshot`-Caching, Hydration-Mismatch durch `Math.random()` in SSR-Content) → siehe Fixes oben.
3. Partikel sollten den ganzen Screen abdecken statt nur den Bereich hinter der ersten Karte → `fixed` statt `absolute`-Positionierung.
4. Quest-Titel wurden bei langen Namen durch das Badge in derselben Zeile abgeschnitten → Badge in eigene Zeile über dem Titel verschoben (bei allen drei Kartenvarianten einheitlich).
5. Danach: Wunsch nach Zeilenumbruch statt Ellipsis bei langen Titeln → `line-clamp-2` statt `truncate`.
6. Badge-Position sollte bei allen drei Kartenvarianten identisch sein (auch beim Reset-Button der "done"-Karte, der vorher vertikal mittig statt oben rechts saß) → einheitliches Zeilen-Layout eingeführt.
7. Ein gemeldetes "Badge sitzt noch links oben" stellte sich nach Vergleich mit einem frischen WebKit-Screenshot als veralteter Browser-/Dev-Server-Cache heraus, kein Code-Fehler — nach Neustart des Dev-Servers und Hard-Refresh bestätigt der Nutzer, dass es passt.

Zusätzlich als Nebeneffekt entstanden: 4 Test-Quest-JSON-Dateien im Projekt-Root (`test-quest-2.json` bis `test-quest-4.json`, neben der bereits vorhandenen `test-quest.json`) für manuelles Testen unterschiedlicher Quest-Größen und Namenslängen — diese sind Test-Fixtures, keine Produktionsdaten.

## QA Test Results

**Tested:** 2026-08-26
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

**Methodik-Hinweis (Playwright-Environment):** Chromium ist auf dieser Maschine weiterhin defekt (`dlopen`-Fehler nach Reinstall-Versuch, hängt sich fest — dasselbe Problem wie in der PROJ-4-QA). Diesmal war jedoch ein funktionierendes Playwright-WebKit im Cache vorhanden (Version 2336, während das installierte `@playwright/test` Version 2248 erwartet). Per Symlink (`webkit-2248 → webkit-2336`) im lokalen Playwright-Cache ließ sich das vorhandene WebKit für die Standard-Testrunner-Pipeline (`npx playwright test --project="Mobile Safari"`) nutzbar machen. Dadurch konnte diese QA-Runde — anders als bei PROJ-3/4 — die komplette E2E-Suite (bestehend + neu) tatsächlich **live ausführen**, nicht nur schreiben. Der Symlink ist eine rein lokale Maschinen-Anpassung im `~/Library/Caches`-Verzeichnis, nicht Teil des Repos.

### Acceptance Criteria Status

#### Outro-Screen
- [x] Abschluss der letzten Station führt direkt zum Outro-Screen, kein Zwischenstopp bei der Stationsliste
- [x] Outro-Text und optionales Outro-Medium werden angezeigt
- [x] Konfetti-Effekt läuft, "X von X Stationen abgeschlossen" wird angezeigt
- [x] "Fertig" führt zurück zu `/play`
- [ ] BUG-1: Nicht erreichbare Outro-Medien-URL zeigt keinen Placeholder (siehe Bugs Found)
- [x] Wiedereinstieg in eine bereits abgeschlossene Quest zeigt die Stationsliste, nicht erneut den Outro-Screen

#### Status-Anzeige in der Quest-Liste
- [x] Nie gestartete Quest zeigt Badge "Neu"
- [x] Begonnene, nicht abgeschlossene Quest zeigt Teal-Glow, Badge "Live" und Fortschrittsbalken (X von Y)
- [x] Vollständig abgeschlossene Quest zeigt gedimmten Titel + Reset-Icon, kein Badge
- [x] Filter "Alle" sortiert Live vor Neu vor Abgeschlossen

#### Filter-Tabs
- [x] "Alle" ist beim ersten Öffnen aktiv
- [x] Filter "Live" zeigt nur aktive Quests
- [x] Filter "Neu" zeigt nur nie gestartete Quests
- [x] Passender Empty-State-Hinweis bei leerem Filter-Ergebnis

#### Reset
- [x] Reset löscht den gesamten Fortschritt sofort, ohne Bestätigungsdialog
- [x] Karte zeigt sofort Badge "Neu", Toast "Fortschritt zurückgesetzt" erscheint
- [x] Zurückgesetzte Quest startet beim erneuten Öffnen wie eine neue Quest (kein `gq_progress`-Eintrag mehr vorhanden)
- [x] Tap auf das Reset-Icon löst nicht die Navigation in die Quest aus

**17/18 Acceptance Criteria bestanden.**

### Edge Cases Status

- [x] EC-1: Quest mit nur 1 Station — Abschluss führt direkt zum Outro (per E2E-Test verifiziert)
- [x] EC-2: Reset in parallel geöffnetem Tab — kein Live-Sync nötig, per Code-Review bestätigt (Design-Entscheidung)
- [x] EC-3: Alle Quests "Neu" — "Live"-Filter zeigt Empty State (per E2E-Test verifiziert)
- [x] EC-4: Viele Quests (Performance) — rein clientseitiges Array-Filtern/Sortieren, bei den vom Datenmodell erlaubten Größenordnungen unkritisch (Code-Review)
- [x] EC-5: Sehr langer Outro-Text — nutzt dasselbe bewährte `whitespace-pre-line`-Pattern wie der Intro-Screen aus PROJ-3 (Code-Review)
- [x] EC-6: Korrupte/gelöschte localStorage-Daten während des Outro-Screens — `getProgress()` hat bestehenden try/catch-Fallback (Code-Review, bereits durch PROJ-2/3-Tests abgedeckt)
- [x] EC-7: Quest mit 0 Stationen — durch PROJ-2-Schema ausgeschlossen (min. 1 Station), nicht separat behandelt

### Security Audit Results
- [x] Authentifizierung/Autorisierung: N/A — kein Backend, kein Account-System (PRD Non-Goal)
- [x] XSS über Quest-Namen und Outro-Text: Gezielter Test mit `<img src=x onerror=alert(1)>` im Quest-Namen und `<script>alert(2)</script>` im Outro-Text (direkt in `localStorage` injiziert, an der Import-Sanitization vorbei) — auf `/play` (Quest-Karte) und dem Outro-Screen wird beides als reiner Text gerendert, kein Alert ausgelöst, kein unescaped HTML im DOM. React-Escaping greift unabhängig von `sanitizeQuest()` als zweite Verteidigungslinie
- [x] Kein `dangerouslySetInnerHTML`, `eval()` oder `new Function()` in den neuen PROJ-5-Dateien (Grep bestätigt)
- [x] Reset-Aktion betrifft ausschließlich den lokalen Fortschritt des eigenen Geräts, keine Cross-User- oder Cross-Origin-Auswirkung
- [x] Outro-Medien-URLs unterliegen derselben `https://`-only-Validierung wie Intro-Medien (PROJ-2-Schema, wiederverwendet)
- [x] Kein Autoplay bei Outro-Audio/Video (`preload="none"`, kein `autoplay`-Attribut)

### Bugs Found

#### BUG-1: Outro-Screen zeigt keinen Placeholder bei nicht erreichbarer Medien-URL
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Quest mit `outro.mediaUrl` auf eine nicht erreichbare Bild-URL importieren
  2. Letzte Station abschließen, Outro-Screen erreichen
  3. Erwartet (laut AC): Placeholder-Hinweis "Bild konnte nicht geladen werden" analog zu den Stations-Modulen (PROJ-4)
  4. Tatsächlich: Das Bild-Element wird bei `onerror` komplett ausgeblendet (`parentElement.style.display = "none"`), es erscheint gar kein Hinweis — identisches Verhalten zum bestehenden Intro-Screen (PROJ-3), aber abweichend von der PROJ-5-Spec
- **Blockiert nicht:** Der Outro-Screen bleibt voll nutzbar, "Fertig" funktioniert einwandfrei (per E2E-Test verifiziert)
- **Priority:** Fix in next sprint (kein Blocker für Deployment, da rein kosmetisch und das optionale Feld in der Praxis selten kaputt sein dürfte)

#### BUG-2: Filter-Tabs ohne Tastatur-Pfeilnavigation (ARIA-Tabs-Pattern unvollständig)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Filter-Tabs (`role="tablist"`/`role="tab"`) per Tastatur fokussieren
  2. Erwartet (ARIA Authoring Practices für Tabs): Pfeiltasten wechseln zwischen Tabs, `aria-controls` verweist auf den zugehörigen Listenbereich
  3. Tatsächlich: Jeder Tab ist einzeln per Tab-Taste fokussierbar und mit Enter/Space aktivierbar (funktional korrekt), aber es gibt keine Pfeiltasten-Navigation und kein `aria-controls`
- **Priority:** Nice to have

### Regression Testing

Vollständige E2E-Suite (`npx playwright test --project="Mobile Safari"`, via WebKit-Workaround) gegen den Stand **vor** PROJ-5 (per `git stash`) und **nach** PROJ-5 verglichen, um echte Regressionen von vorbestehenden Testproblemen zu unterscheiden:

| Suite | Ergebnis vorher (Baseline) | Ergebnis nachher (PROJ-5) |
|-------|----------------------------|---------------------------|
| PROJ-1 (App Shell) | 7 von 7 Tests schlagen fehl | identisch: 7 von 7 schlagen fehl |
| PROJ-3 (GPS-Navigation) | 7 von 14 Tests schlagen fehl | identisch: 7 von 14 schlagen fehl |
| PROJ-4 (Modul-Rendering) | 2 von 27 Tests schlagen fehl | identisch: 2 von 27 schlagen fehl |
| PROJ-5 (neu) | — | 16 von 16 bestehen |

**Ergebnis: Keine Regression durch PROJ-5.** Alle 16 vorbestehenden Fehlschläge treten identisch auf dem Stand vor PROJ-5 auf — es handelt sich um vorbestehende Test-/Environment-Probleme (u.a. eine mehrdeutige `getByText`-Selektor-Kollision in PROJ-1 und vermutlich Geolocation-Mocking-Inkompatibilitäten der abweichenden WebKit-Version 2336 vs. der vom Test-Runner erwarteten 2248 in PROJ-3/4), nicht durch PROJ-5-Code verursacht. Empfehlung: separat beheben, sobald die Playwright-Chromium-Installation wieder funktioniert und mit der offiziell erwarteten Browser-Version gegengeprüft werden kann.

### Unit Tests (Vitest)
- 68/68 bestehen, davon 6 neu für `deleteProgress` und `getQuestListStatus` (`quest-progress.test.ts`)

### E2E Tests (Playwright)
- Neue Datei `tests/proj-5-player-fortschritt-abschluss.spec.ts`: 16 Tests, alle bestehen (live ausgeführt, nicht nur geschrieben)
- `npm run build` und `npm run lint` laufen fehlerfrei durch (nur vorbestehende `<img>`-Optimierungs-Warnungen)

### Summary
- **Acceptance Criteria:** 17/18 bestanden (1 Medium-Bug bei Outro-Medien-Placeholder)
- **Bugs Found:** 2 total (0 Critical, 0 High, 1 Medium, 1 Low)
- **Security:** Pass, keine offenen Befunde (inkl. gezieltem XSS-Test für die neuen Oberflächen)
- **Regression:** Pass — keine durch PROJ-5 verursachten Regressionen (16 vorbestehende Fehlschläge identisch auf Baseline reproduziert)
- **Production Ready:** YES (keine Critical/High-Bugs; die 2 gefundenen Bugs sind nicht blockierend)
- **Recommendation:** Kann deployed werden. BUG-1 (Outro-Medien-Placeholder) sollte zeitnah nachgezogen werden, um die Spec vollständig zu erfüllen — dafür zurück an `/frontend`, falls gewünscht.

## Deployment
_To be added by /deploy_
