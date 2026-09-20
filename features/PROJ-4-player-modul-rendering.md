# PROJ-4: Player — Modul-Rendering

## Status: In Progress
**Created:** 2026-08-24
**Last Updated:** 2026-09-20

## Dependencies
- Requires: PROJ-2 (Quest Data Model & JSON Import) — für Modul-Datenstruktur
- Requires: PROJ-3 (Player — GPS-Navigation) — für Ankunftserkennung und State Machine

## Summary
Nach der Ankunft an einer Station werden dem Spieler die Stations-Inhalte (Module) angezeigt: Texte, Bilder, Audio, Video und interaktive Aufgaben. Die Module erscheinen als scrollbare Liste. Aufgaben müssen gelöst werden, bevor die Station abgeschlossen werden kann. Bereits gelöste Aufgaben bleiben gespeichert.

> **Hinweis:** Der Kern dieses Features ist bereits deployed (siehe QA/Deployment-Abschnitte unten). Status wurde am 2026-08-30 auf "Planned" zurückgesetzt, da ein neuer Scope (Ansichtsmodus für abgeschlossene Stationen, siehe User Story 7 und AC "Ansichtsmodus für abgeschlossene Stationen") hinzugekommen ist. Für `/frontend` ist nur dieses Delta zu bauen, nicht das gesamte Feature neu.

## User Stories
1. Als Spieler möchte ich nach der Ankunft an einer Station die Inhalte (Text, Bilder, Audio, Video) sehen, damit ich die Geschichte der Quest erlebe.
2. Als Spieler möchte ich Aufgaben (Code-Eingabe, Multiple Choice, Sortierung) lösen können, damit das Spiel herausfordernd und interaktiv ist.
3. Als Spieler möchte ich sofortiges Feedback bei Aufgaben erhalten (richtig/falsch), damit ich weiß ob meine Antwort stimmt.
4. Als Spieler möchte ich unbegrenzte Versuche bei Aufgaben haben, damit ich nicht steckenbleibe und frustriert aufgebe.
5. Als Spieler möchte ich eine Station erst abschließen können wenn alle Aufgaben gelöst sind, damit ich nichts verpasse.
6. Als Spieler möchte ich eine bereits erreichte Station jederzeit wieder öffnen können (ohne erneut hinlaufen zu müssen), damit ich unterbrochene Aufgaben fortsetzen kann.
7. Als Spieler möchte ich eine bereits abgeschlossene Station erneut öffnen und mir ihre Inhalte ansehen können, ohne sie nochmal abschließen zu müssen, damit ich Texte/Medien in Ruhe nachlesen kann.

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
- Erneutes Lösen von Tasks im Ansichtsmodus einer abgeschlossenen Station (rein read-only, siehe Decision Log)
- Separate visuelle Kennzeichnung "Ansichtsmodus" im Header (z.B. Badge) — der deaktivierte "Bereits abgeschlossen"-Button am Ende der Liste genügt als Signal

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
- [ ] Angenommen der Task ist als gelöst markiert, wenn der Spieler den Screen sieht, dann bleibt das Eingabefeld sichtbar mit der korrekten Antwort befüllt, ist aber deaktiviert (nicht editierbar), und das Häkchen ist zusätzlich sichtbar (aktualisiert am 2026-09-02, siehe Implementation Notes)

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

**Task: Sortierung — Touch-Verhalten (Refinement 2026-09-20):**
- [~] Angenommen der Spieler berührt ein Sortier-Item und hält, wenn die Long-Press-Schwelle (150 ms) erreicht ist, dann hebt sich das Item sichtbar ab — Skalierung > 1, Schatten und erhöhtes `z-index` — und ist damit als "gegriffen" erkennbar, bevor es bewegt wird — **teilweise erfüllt: das Anheben löst bei der ersten Bewegung aus, nicht beim reinen Halten (BUG-14, vom Betreiber abgenommen)**
- [x] Angenommen ein Item ist gegriffen, wenn der Spieler den Finger bewegt, dann folgt das Item dem Finger kontinuierlich (`transform` ändert sich mit jeder Bewegung), statt erst nach einer festen Pixelschwelle zu springen
- [x] Angenommen ein Item wird über eine andere Position gezogen, wenn es diese erreicht, dann weichen die übrigen Items animiert aus und geben die Lücke frei, sodass das Ziel vor dem Loslassen erkennbar ist
- [x] Angenommen der Spieler lässt ein gezogenes Item los, wenn es an der neuen Position landet, dann legt es sich ab (Skalierung und Schatten zurück auf den Ruhezustand) und die neue Reihenfolge bleibt bestehen
- [x] Angenommen der Spieler wischt über ein Sortier-Item, **ohne** vorher die Long-Press-Schwelle zu erreichen, wenn die Seite scrollbar ist, dann scrollt die Seite und die Reihenfolge bleibt **unverändert**
- [~] ~~Angenommen der Spieler zieht ein Item aktiv, wenn er den Finger bewegt, dann scrollt die Seite **nicht** gleichzeitig mit~~ — **als Spec-Fehler identifiziert (QA 2026-09-20):** Zu absolut formuliert. Gemessen scrollt die Seite bei einem bildschirmmittigen Zug **0 px** und erst, wenn der Finger den Bildschirmrand erreicht — das ist `@dnd-kit`s Auto-Scroll, ohne das sich ein Item nicht an eine Position außerhalb des sichtbaren Bereichs ziehen ließe. Gemeint war "der Wisch löst kein konkurrierendes Scrollen aus", und das deckt das Kriterium darüber ab
- [x] Angenommen der Spieler zieht ein Item über den oberen oder unteren Rand der Liste hinaus, wenn er dort verharrt, dann bricht die Interaktion nicht ab — das Item bleibt gegriffen und die Reihenfolge bleibt konsistent
- [x] Angenommen ein Sortier-Task ist gelöst oder wird im Ansichtsmodus gezeigt, wenn der Spieler ein Item berührt und hält, dann passiert nichts (kein Anheben, keine Umsortierung) — der read-only-Zustand aus Edge Case 11 bleibt unberührt

**Fortschritt & Wiedereinstieg:**
- [ ] Angenommen der Spieler hat Tasks gelöst und verlässt den Stations-Screen, wenn er später zur gleichen Station zurückkehrt, dann sind die gelösten Tasks weiterhin als gelöst markiert
- [ ] Angenommen der Spieler hat eine Station bereits erreicht (Ankunft erkannt), wenn er in der Stationsliste auf diese Station tippt, dann öffnet sich direkt der Modul-Screen (ohne erneute GPS-Navigation)
- [ ] Angenommen der Spieler hat eine Station abgeschlossen, wenn er sie in der Stationsliste sieht, dann ist sie als abgeschlossen markiert (Häkchen) und die nächste Station ist freigeschaltet

**Ansichtsmodus für abgeschlossene Stationen:**
- [ ] Angenommen eine Station ist bereits abgeschlossen, wenn der Spieler in der Stationsliste darauf tippt, dann öffnet sich der Modul-Screen dieser Station (statt bisher: kein Effekt)
- [ ] Angenommen der Modul-Screen einer abgeschlossenen Station ist geöffnet, wenn er gerendert wird, dann werden alle Module (Text/Bild/Audio/Video/Tasks) unverändert wie im normalen Modul-Screen angezeigt
- [ ] Angenommen der Modul-Screen einer abgeschlossenen Station ist geöffnet, wenn der Spieler die Task-Module sieht, dann sind sie im read-only-Zustand (Eingabefelder/Radio/Checkbox/Drag-Handles deaktiviert, Häkchen sichtbar) — identisch zum Zustand "bereits gelöst" im normalen Modul-Screen
- [ ] Angenommen der Modul-Screen einer abgeschlossenen Station ist geöffnet, wenn der Spieler ans Ende scrollt, dann sieht er statt "Station abschließen" einen deaktivierten Button mit Häkchen und Text "Bereits abgeschlossen" (kein Tap-Effekt, kein erneutes `onComplete`)
- [ ] Angenommen der Spieler ist im Ansichtsmodus einer abgeschlossenen Station, wenn er den Zurück-Button tippt, dann kehrt er zur Stationsliste zurück (identisch zum normalen Modul-Screen)

## Edge Cases
1. **Station ohne Tasks (nur Content-Module):** "Station abschließen"-Button ist sofort aktiv — keine Aufgaben zu lösen.
2. **Station mit nur Tasks (kein Text/Medien):** Funktioniert normal — nur Task-Module in der Liste.
3. **Medien-URL nicht erreichbar:** Placeholder-Anzeige, blockiert nicht den Fortschritt. Nur Tasks blockieren.
4. **Sehr langer Text:** Scrollbar, keine Begrenzung. Text wird mit Zeilenumbrüchen korrekt dargestellt.
5. **Drag & Drop auf kleinem Bildschirm:** Touch-Hold (150 ms) aktiviert Drag. Visuelles Feedback (Item hebt sich ab, Schatten). Drop-Zone klar erkennbar. — *Diese Vorgabe stand seit 2026-08-24 in der Spec, war bis zum Refinement am 2026-09-20 aber nie umgesetzt: Gemessen war `transform: none`, `box-shadow: none` und `opacity: 1` in jeder Phase der Berührung. Siehe Refinement "Touch-Sortierung" unten.*
6. **Spieler gibt leeren String als Code-Antwort ein:** "Prüfen"-Button ist deaktiviert bei leerem Eingabefeld.
7. **Sehr viele Module (>10):** Scrollbare Liste, kein Performance-Problem (Module werden linear gerendert, kein Lazy Loading nötig).
8. **App wird während Audio/Video-Wiedergabe geschlossen:** Wiedergabe stoppt automatisch (Browser-Verhalten). Beim Wiedereinstieg startet das Medium von vorne — kein Playback-Fortschritt gespeichert.
9. **Datenmodell-Migration (correctIndex → correctIndices):** Altes Feld `correctIndex` wird beim Laden zu `[correctIndex]` konvertiert. Neue Quests nutzen `correctIndices`.
10. **Station ohne Tasks (nur Content-Module) ist abgeschlossen:** Ansichtsmodus funktioniert identisch — es gibt einfach keine Task-Module, die read-only dargestellt werden müssten.
11. **Sortierungs-Task im Ansichtsmodus:** Verhält sich wie der bestehende "gelöst"-Zustand (`solved === true`) — zeigt die korrekte Reihenfolge weiterhin als Liste (Drag deaktiviert) plus "Richtig" mit Häkchen (aktualisiert am 2026-09-02, siehe Implementation Notes — ursprünglich verschwand die Item-Liste im gelösten Zustand vollständig, das wurde auf Nutzerwunsch geändert).
12. **Wischen über einem Sortier-Item zum Scrollen:** Die Berührung gilt erst nach 150 ms Halten als Drag. Wer schneller wischt, scrollt die Seite — die Reihenfolge bleibt unverändert. *(Vor dem Refinement am 2026-09-20 reorderte jede vertikale Wischbewegung über einem Item die Liste, auch wenn der Spieler nur scrollen wollte — gemessen an einer bis zum Anschlag gescrollten Station: Die Seite konnte nicht weiter scrollen, die Items tauschten trotzdem die Plätze.)*
13. **Finger rutscht beim Long-Press:** Bewegt sich der Finger während der 150 ms um mehr als 8 px, gilt die Geste als Scrollen, nicht als Drag. Kein Anheben, keine Umsortierung.
14. **Zweiter Finger während des Ziehens:** Die Sortierung reagiert nur auf den ersten Kontaktpunkt. Ein zweiter Finger (z.B. beim Zoom-Versuch) bricht das Ziehen nicht in einen inkonsistenten Zustand ab — entweder es läuft weiter oder es endet sauber an der aktuellen Position.
15. **Sortier-Task auf einer Station mit vielen Modulen:** Die Liste liegt ggf. weit unten und wird nur teilweise sichtbar erreicht. Das Ziehen funktioniert unabhängig von der Scroll-Position; während des Ziehens scrollt die Seite nicht konkurrierend mit.

## Technical Requirements
- Datenmodell-Erweiterung: `correctIndex: number` → `correctIndices: number[]` (abwärtskompatibel)
- Erkennung Single vs. Multi Choice: `correctIndices.length === 1` → Radio-Buttons, `> 1` → Checkboxen
- Code-Eingabe-Vergleich: `answer.trim().toLowerCase() === input.trim().toLowerCase()`
- Sortierung: Items starten in zufälliger Reihenfolge (deterministic shuffle bei Render, nicht bei jedem Re-Render)
- Drag & Drop: Touch-kompatibel, min. 44px Touch-Targets
- **Sortierung — Drag & Drop über `@dnd-kit` (Refinement 2026-09-20):** `DndContext` + `SortableContext` mit `verticalListSortingStrategy`, wie bereits im Creator (`module-editor-sheets.tsx`). Kein neues Paket — `@dnd-kit/core`, `/sortable` und `/utilities` sind seit PROJ-8 Abhängigkeiten
- **Sensoren:** `PointerSensor` mit `activationConstraint: { distance: 8 }` (Maus/Stift) und `TouchSensor` mit `activationConstraint: { delay: 150, tolerance: 8 }` (Finger) — identische Werte wie im Creator, damit beide Hälften der App gleich reagieren und es nur eine Zahl zum Nachjustieren gibt
- **Anheben sichtbar machen:** Das gegriffene Item bekommt Skalierung (> 1), Schatten und erhöhtes `z-index`; `transform` kommt aus `CSS.Transform.toString(transform)`, damit es dem Finger folgt. Der bisherige `opacity: 0.5`-Zustand allein genügt nicht — er zeigt nicht, *wo* das Item gerade ist
- **`touch-action: none` auf dem Drag-Handle** — verhindert, dass der Browser dieselbe Geste zusätzlich als Scrollen auswertet (im Creator bereits gesetzt, im Player bisher nicht)
- **Die handgeschriebene Touch-Mechanik entfällt ersatzlos:** `handleTouchStart`/`handleTouchMove`/`handleTouchEnd`, die Refs `touchStartY`/`touchItem` und die hartkodierte Konstante `itemHeight = 58` in `sorting-task.tsx`. Ebenso die HTML5-`draggable`-Handler — `@dnd-kit` bedient Maus und Touch über **einen** Pfad, statt zwei getrennte Implementierungen zu pflegen, von denen auf dem Handy nur eine je läuft
- **Der gelöste/read-only-Zustand bleibt unverändert:** Im Zustand `solved` wird kein `useSortable` aktiviert (keine Listener, keine Handles aktiv) — Edge Case 11 gilt weiter
- Task-Fortschritt: localStorage unter `gq_progress_{questId}` erweitern um `solvedTasks: string[]` (Modul-Indices pro Station)
- Medien-Fehlerbehandlung: `onError`-Handler auf `<img>`, `<audio>`, `<video>` für Placeholder
- Kein Autoplay bei Video/Audio
- Min. 16px Body-Text (PRD-Anforderung)
- Responsive innerhalb max-w-[430px] Container
- Ansichtsmodus für abgeschlossene Stationen: `StationModules` erhält einen `readOnly`-Flag (abgeleitet aus `completedStations.includes(station.id)`), der den "Station abschließen"-Button durch einen deaktivierten "Bereits abgeschlossen"-Button ersetzt; alle Task-Module werden mit `solved={true}` gerendert (unabhängig vom tatsächlichen `solvedTasks`-Eintrag), da bei einer abgeschlossenen Station laut Datenmodell ohnehin alle Tasks gelöst sind

## Open Questions
### Refinement 2026-09-20: Touch-Sortierung
- [x] Pfeile statt Drag & Drop auf kleinen Bildschirmen? → Nein. Der Befund ist ein nicht gebautes Drag & Drop, kein falsch gewähltes Interaktionsmuster; Pfeile hätten zwei dokumentierte Entscheidungen umgekehrt, um einen Fehler zu umgehen (2026-09-20)
- [x] Womit wird das Ziehen gebaut? → `@dnd-kit`, seit PROJ-8 ohnehin im Projekt, treibt bereits den Creator (2026-09-20)
- [x] Zusätzlicher Bedienweg ohne Ziehen (sichtbare Pfeile oder Tastatur)? → Nein, vorerst nur Ziehen. Nachrüstbar, sobald es einen Anlass gibt (2026-09-20)
- [ ] Fühlen sich 150 ms Long-Press am echten Gerät richtig an? Am Emulator ist die Schwelle messbar, aber nicht beurteilbar — der Wert steht bewusst als eine Zahl an einer Stelle, damit er sich nach einem Handy-Test in einem Zug nachjustieren lässt
- [ ] Braucht das Anheben eine Vibration (Haptik), wie iOS sie beim Greifen einer Listenzeile gibt? PROJ-3 nutzt `navigator.vibrate` bereits bei der Stationsankunft, die Hürde wäre also klein. Bewusst nicht Teil dieses Refinements, um den Befund nicht mit einer Zusatzidee zu vermischen
- [ ] Soll der Creator dieselbe Anhebe-Rückmeldung bekommen? Dort greift `@dnd-kit` bereits, aber das gezogene Element wird nur auf `opacity: 0.5` gesetzt — es hebt sich ebenfalls nicht sichtbar ab. Nicht gemeldet und nicht gemessen, daher hier nur notiert


### Refine 2026-08-30: Ansichtsmodus für abgeschlossene Stationen
- [x] Was passiert beim Tippen auf eine bereits abgeschlossene Station in der Stationsliste? → Modul-Screen öffnet sich (statt bisher: kein Effekt), read-only (2026-08-30)
- [x] Soll der "Station abschließen"-Button im Ansichtsmodus verschwinden oder als deaktivierter Hinweis bleiben? → Bleibt sichtbar als deaktivierter Button "Bereits abgeschlossen" mit Häkchen (2026-08-30)
- [x] Sollen Tasks im Ansichtsmodus erneut lösbar sein? → Nein, read-only, identisch zum bestehenden "gelöst"-Zustand der Task-Module (2026-08-30)

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
| Abgeschlossene Stationen sind in der Stationsliste antippbar und öffnen den Modul-Screen im Ansichtsmodus | Spieler wollen Inhalte (Texte, Medien) nachträglich nachlesen können, ohne den Fortschritt erneut zu bestätigen — bisher passierte beim Tippen auf eine abgeschlossene Station gar nichts | 2026-08-30 |
| "Station abschließen"-Button bleibt im Ansichtsmodus sichtbar, aber deaktiviert mit Text "Bereits abgeschlossen" + Häkchen | Gibt dem Spieler eine klare visuelle Bestätigung, dass er im Rückblick-Modus ist, statt den Button ersatzlos verschwinden zu lassen | 2026-08-30 |
| Tasks im Ansichtsmodus sind read-only (kein erneutes Lösen möglich) | Konsistent mit dem bereits bestehenden "gelöst"-Zustand der Task-Module, kein neuer Interaktionszustand nötig, verhindert Verwirrung durch nochmaliges Beantworten bereits gelöster Rätsel | 2026-08-30 |
| Drag & Drop bleibt der einzige Weg zum Umsortieren — keine Hoch/Runter-Pfeile | Der Befund ist nicht "Ziehen ist der falsche Weg", sondern "Ziehen ist nicht gebaut". Pfeile hätten zwei dokumentierte Entscheidungen umgekehrt (2026-08-24 "gamiger, Zielgruppe ist Touch-affin" und 2026-09-02, als ein Mockup mit Auf/Ab-Pfeilen ausdrücklich verworfen wurde), um einen Fehler zu umgehen statt ihn zu beheben. Bei 3–6 Items ist Ziehen zudem schneller als mehrfaches Tippen | 2026-09-20 |
| Das Item muss sich sichtbar anheben, bevor es bewegt wird | Der Betreiber-Befund im Wortlaut: "Ich habe erwartet, dass das was ich anfasse sich ein wenig hebt." Genau das fehlt — gemessen `transform: none` und `box-shadow: none` in jeder Phase. Das Anheben ist die Rückmeldung "ich habe dich verstanden"; ohne sie wirkt jede folgende Bewegung wie ein Fehler der App | 2026-09-20 |
| Versehentliches Umsortieren beim Scrollen wird als Teil dieses Refinements behoben | Nicht vom Betreiber gemeldet, aber beim Nachmessen aufgedeckt und schwerwiegender als der gemeldete Befund: Ein Wisch über einem Item verändert die Reihenfolge, ohne dass der Spieler sie anfassen wollte — er kann eine bereits richtige Lösung zerstören, während er nur weiterlesen will. Gleiche Datei, gleiche Ursache, gleicher Prüf-Durchlauf | 2026-09-20 |
| Long-Press-Schwelle 150 ms, Toleranz 8 px — identisch zum Creator | Ein Wert für die ganze App statt zwei, die auseinanderdriften. 150 ms liegt im üblichen Korridor (iOS-Listen ~200 ms, Material ~180 ms); darunter stiehlt die Sortierung Scroll-Gesten, darüber wirkt sie träge | 2026-09-20 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neuer Screen "modules" in bestehender State Machine | Erweitert PROJ-3 Flow natürlich: Arrival → Module → Stationsliste. Kein neues Routing nötig | 2026-08-24 |
| `completedStations` + `solvedTasks` in localStorage | Trennung: "besucht" (GPS-Ankunft) vs. "abgeschlossen" (Tasks gelöst). Granularer Task-Fortschritt ermöglicht Wiedereinstieg | 2026-08-24 |
| correctIndices als Array mit Abwärtskompatibilität | Altes correctIndex wird beim Import konvertiert. Kein Breaking Change für bestehende Quest-Dateien | 2026-08-24 |
| ~~HTML5 DnD + Touch zuerst, @dnd-kit als Fallback~~ **(überholt am 2026-09-20)** | Kein externes Package wenn nativ funktioniert. dnd-kit nur nachrüsten falls iOS Safari Probleme macht — **die Fallback-Bedingung ist eingetreten**: Die handgeschriebene Touch-Variante hebt nichts an, springt in 58px-Stufen und reordert beim Scrollen. `@dnd-kit` ist seit PROJ-8 ohnehin Abhängigkeit, der Sparzweck damit gegenstandslos | 2026-08-24 |
| Kein Lazy-Loading für Module | Max. 20 Module pro Station (Schema-Limit), alle gleichzeitig rendern ist performant genug | 2026-08-24 |
| Separate Komponente pro Modul-Typ | Single Responsibility, isoliert testbar, einfach erweiterbar für zukünftige Modul-Typen | 2026-08-24 |
| Feedback-Animationen rein CSS | Keine Animation-Library nötig. Shake = CSS keyframe, Grün-Highlight = Transition | 2026-08-24 |
| Audio-Player custom (kein natives `controls`) | Native Audio-Controls sind nicht themebar. Eigener Player mit Play/Pause + Fortschrittsleiste passt zum Design-System | 2026-08-24 |
| Video-Player mit nativen Controls | Video-Controls sind komplex (Fullscreen, Scrubbing). Native Controls sind funktional und von Nutzern erwartet | 2026-08-24 |
| Player-Sortierung auf `@dnd-kit` umstellen (kein neues Paket) | `@dnd-kit/core`, `/sortable`, `/utilities` sind seit PROJ-8 Abhängigkeiten und treiben bereits drei Listen im Creator. Die Bibliothek löst Long-Press, Anheben, Ausweichanimation und `touch-action` von selbst — alles Mechanik, die hier von Hand gebaut und dabei falsch gebaut wurde | 2026-09-20 |
| Maus- und Touch-Pfad zusammenlegen (ein Pfad statt zwei) | Heute bedient HTML5 `draggable` die Maus und eine eigene `onTouchMove`-Rechnung den Finger. `draggable` feuert auf Touch gar nicht — also lief auf dem Handy nie der Code, der am Desktop getestet wurde. Zwei Implementierungen für eine Geste sind die eigentliche Fehlerquelle | 2026-09-20 |
| `touch-action: none` auf dem Drag-Handle | Ohne diese Angabe wertet der Browser dieselbe Geste zusätzlich als Scrollen. Im Creator ist sie gesetzt, im Player fehlte sie — das ist der technische Kern des Scroll-Konflikts | 2026-09-20 |
| Die hartkodierte `itemHeight = 58` entfällt ersatzlos | Die Konstante muss der tatsächlichen Zeilenhöhe plus Abstand entsprechen und bricht still, sobald sich das Styling ändert. Sie war bereits einmal falsch (BUG-3, von 56 auf 58 korrigiert) — ein Wert, der nur durch Nachmessen richtig bleibt, ist ein Fehler, der auf seine Wiederholung wartet | 2026-09-20 |

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

## Implementation Notes

### Refine 2026-08-30: Ansichtsmodus für abgeschlossene Stationen

Umsetzung des in `/refine` festgelegten Deltas — nur die drei betroffenen Dateien geändert, kein Neubau:

| Datei | Änderung |
|-------|----------|
| `station-list.tsx` | `StationRow.handleClick`: `isCompleted` löst jetzt ebenfalls `onOpenModules()` aus (vorher: nur `isVisited`). `aria-label` für abgeschlossene Stationen ergänzt um "zum Ansehen tippen". Kein neuer `disabled`-Zustand — abgeschlossene Stationen waren bereits nicht `disabled`, nur ihr Klick-Handler tat nichts |
| `station-modules.tsx` | Neuer optionaler Prop `readOnly` (Default `false`). Bei `readOnly`: alle Module erhalten `solved={true}` erzwungen (statt `solvedTasks.includes(i)`) — die Task-Komponenten (`CodeTask`/`MultipleChoiceTask`/`SortingTask`) haben bereits einen reinen `solved`-Anzeigezustand ohne Eingabeelemente, keine Änderung an den Task-Komponenten nötig. Der "Station abschließen"-Button wird durch einen nicht-klickbaren `<div>` mit Lime-Häkchen-Icon und Text "Bereits abgeschlossen" ersetzt (kein `<button onClick>`, daher strukturell kein erneutes `onComplete` möglich) |
| `quest-player.tsx` | Übergibt `readOnly={progress.completedStations.includes(station.id)}` an `StationModules` im `"modules"`-Case |

### Architektur-Entscheidung
- `readOnly` wird aus `completedStations` abgeleitet, nicht als separater State geführt — konsistent mit dem bestehenden Pattern in PROJ-5 ("Status wird aus vorhandenen Fortschrittsdaten berechnet, nicht separat gespeichert")

### Tests
- `npm test` (Vitest): 151/151 bestehen, keine neuen Testfälle nötig — die Änderung nutzt ausschließlich bereits getestete Bausteine (bestehender `solved`-Anzeigezustand der Task-Module, bestehende `completedStations`-Logik aus `use-quest-progress.ts`)
- `npx tsc --noEmit`: keine neuen Fehler (2 vorbestehende, unveränderte Fehler in `quest-storage.test.ts`, nicht durch diese Änderung verursacht — verifiziert per `git stash`-Vergleich)
- `npm run lint`: 0 Fehler, nur vorbestehende `<img>`-Optimierungs-Warnungen
- Manuell per Playwright/WebKit verifiziert (Screenshots): Klick auf abgeschlossene Station in der Stationsliste öffnet den Modul-Screen; Code-Task zeigt "Richtig" mit Häkchen (read-only); Button zeigt "Bereits abgeschlossen" statt "Station abschließen"; Klick auf den deaktivierten Button hat keinen Effekt (Screen bleibt unverändert); Zurück-Button führt zur Stationsliste zurück

### Bekannte Einschränkung
- Kein automatisierter E2E-Test (`tests/`) für dieses Delta ergänzt — die manuelle Playwright-Verifikation deckt den Kern-Flow ab, ein dauerhafter Regressionstest sollte bei `/qa` nachgezogen werden

---


### Frontend-Umsetzung (2026-09-20)

**Eine Produktivdatei** (`src/components/modules/sorting-task.tsx`), kein neues Paket, keine neue Komponente, keine neue Route. Die handgeschriebene Touch-Mechanik (`handleTouchStart`/`Move`/`End`, die Refs `touchStartY`/`touchItem`, die Konstante `itemHeight = 58`) und die HTML5-`draggable`-Handler sind ersatzlos entfallen; an ihrer Stelle steht ein `@dnd-kit`-Pfad für Maus und Finger zugleich.

**Der gemeldete Befund ist am Bildschirm und in Zahlen behoben.** Gemessen auf dem Pixel-7-Viewport gegen den Production-Build, an denselben Punkten, an denen vorher überall `none` stand:

| Phase | Vorher | Nachher |
|---|---|---|
| Ruhezustand | `transform: none`, `box-shadow: none` | unverändert (richtig so) |
| Gegriffen und bewegt | `transform: none`, `box-shadow: none`, `z-index: auto` | **`matrix(1.03, 0, 0, 1.03, …)`, Schatten, `z-index: 10`** |
| Während der Bewegung | `transform: none` (Item blieb stehen) | **6 von 6 Messungen verschieden** — folgt dem Finger |
| Nach dem Loslassen | — | `transform: none`, kein Schatten (legt sich ab) |

**Der Zweitbefund ebenfalls, und zwar nach Fläche getrennt:** Ein 41 ms schneller Wisch über dem Zeilentext scrollt jetzt die Seite (2077 → 4099) und lässt die Reihenfolge **unverändert**; derselbe Wisch auf dem Greif-Handle zieht. `touch-action` misst `auto` auf der Zeile und `none` auf dem Handle.

**Zwei Fehler in meiner eigenen Arbeit, beide durch Messen gefunden:**

1. **Ein echter Implementierungsfehler.** Der erste Entwurf legte Drag-Listener **und** `touch-action: none` auf die **ganze Zeile** statt nur auf das Handle. Damit war die Zeile nirgends mehr Scroll-Fläche, und der Zweitbefund blieb bestehen — ein 39 ms schneller Wisch sortierte weiter um, obwohl 2022 px Scroll-Reserve vorhanden waren. Korrigiert auf das Muster des Creators: Listener und `touch-action` gehören auf das Handle.
2. **Ein widersprüchlicher Code-Kommentar.** Der erste Entwurf schrieb `scaleX/scaleY: 1` fest in den Inline-`transform` und setzte gleichzeitig `scale-[1.03]` als Klasse — die Klasse hätte nie gewirkt, weil der Inline-Stil dieselbe Eigenschaft setzt. Der Kommentar daneben behauptete bereits das Richtige. Jetzt steht die Skalierung tatsächlich im Inline-`transform`.

**Ein Messfehler, der wie ein Produktfehler aussah:** Meine erste Sonde meldete, eine schnelle Wischbewegung sortiere um. Die Gegenprobe zeigte, dass die Geste **420 ms** dauerte — ein `await page.waitForTimeout(10)` plus ein `evaluate`-Roundtrip je Schritt kosten real ~35 ms, und die 150-ms-Schwelle misst echte Zeit. Meine "schnelle Wischbewegung" war ein langsames Halten. Erst ohne `await` zwischen den Schritten (39–48 ms Gesamtdauer) war der Test aussagekräftig. Zweiter Messfehler derselben Art: Die Sonde maß die Zeile über `nth(0)`, das nach einer Umsortierung auf ein **anderes** Element zeigt — die neuen Tests binden sich deshalb an einen Knoten mit festem Text.

**Eine Erwartung ist bewusst nicht erfüllt, nach Rückfrage beim Betreiber:** Reines Halten ohne Bewegung hebt das Item **nicht** an (400 ms gehalten, 0 px bewegt → `transform: none`). Der `TouchSensor` braucht nach der Wartezeit noch eine Bewegung über die 8-px-Toleranz. Das Item hebt sich also beim ersten Bewegen, nicht beim Anfassen. Die Alternative hätte ~20 Zeilen eigenen Zustand neben `@dnd-kit` gekostet — genau die Handarbeit, die dieses Refinement abbaut. Entscheidung des Betreibers: so lassen.

**Ein bestehender Test war zu Recht falsch geworden — und die Diagnose wäre ohne Gegenprobe falsch gewesen.** *"shows solved feedback once the items are dragged into the correct order"* schlug auf **beiden** Engines fehl. Gemessen liegt es nicht am Produkt: Playwrights `dragTo` bewegt mit `@dnd-kit` **gar nichts** (Reihenfolge nach `dragTo(0→2)` unverändert), weil es zu wenige Zwischenschritte sendet, als dass der Sensor die Bewegung verfolgen könnte. Mit HTML5-`draggable` genügte das Drop-Ereignis allein. Neuer Helfer `dragSortingItem()` fährt die Bewegung in 10 Schritten am Handle; der Test besteht danach auf Chrome **und** WebKit — womit nebenbei belegt ist, dass das Ziehen auf beiden Engines funktioniert.

**Tests:** 5 neue in `tests/proj-4-sorting-touch.spec.ts`, aufgeteilt in zwei Gruppen. Zwei Zusicherungen brauchen keine CDP-Touch-Events (`touch-action`-Aufteilung, Abwesenheit der Greif-Buttons im gelösten Zustand) und laufen auf **beiden** Engines; die drei Gesten-Tests sind Chromium-gebunden, weil Playwright auf WebKit keine vergleichbaren Touch-Sequenzen senden kann. Dadurch sinken die WebKit-Skips dieser Datei von 5 auf 3.

**Per Gegenprobe geschärft:** Mit der echten Vorgängerfassung aus `HEAD` fallen **4 der 5** neuen Tests; der fünfte (gelöster Zustand) besteht in beiden Fassungen — richtig so, denn er ist der Wächter dafür, dass der Umbau den read-only-Zustand nicht mitreißt. Einschränkung offen benannt: Die 4 fallen per 30-s-Timeout statt mit sauberer Assertion, weil der Locator auf das Greif-Handle zielt, das es in der alten Fassung nicht gibt. Produktcode danach per `diff` als byte-identisch bestätigt.

**Suiten gegen den Production-Build:** Unit **266/266**. E2E über beide Engines **1003 passed / 0 failed / 0 flaky / 55 skipped** (vorher 57 — die Differenz sind die zwei auf WebKit nachgezogenen Tests). Build und Lint sauber (0 Fehler, 7 vorbestehende Warnungen, keine in der geänderten Datei).

**Am Bildschirm abgenommen, nicht nur gemessen** — bei einer Gefühls-Änderung reichen Zahlen nicht: Das gegriffene Item trägt Teal-Rahmen, Schatten und sichtbare Vergrößerung, schwebt während der Bewegung erkennbar **über** der Liste und überlappt seinen Nachbarn, während die übrigen Zeilen die Lücke freigeben; nach dem Loslassen sitzt es bündig im gleichmäßigen Rhythmus, ohne Restschatten.

**Nicht abgedeckt und benannt:** das Gefühl am echten Gerät (ob 150 ms richtig sind, entscheidet ein Daumen); echte Touch-Gesten auf iOS Safari (nur die Struktur ist dort geprüft, das Ziehen selbst über den Maus-Pfad); Firefox (Binary fehlt); und die Frage, ob der Creator dieselbe Anhebe-Rückmeldung bekommen soll — dort ist es weiterhin nur `opacity: 0.5`.


## QA Test Results — Touch-Sortierung im Player (2026-09-20)

**Ergebnis: 7 von 8 Acceptance Criteria erfüllt, 1 Kriterium als Spec-Fehler identifiziert, 2 neue Low-Bugs. Keine Critical- oder High-Bugs. Production-Ready.**

Das Feature wurde in derselben Sitzung gebaut, deshalb habe ich die zentralen Behauptungen **nicht übernommen, sondern mit eigenen Sonden neu gemessen** — auf drei Viewports statt einem (Pixel 7, iPhone 13, 320×568), zusätzlich auf WebKit, und um die Kriterien erweitert, die die Frontend-Phase nicht isoliert geprüft hatte (AC-3 Lückenbildung, AC-6 kein Parallel-Scroll, AC-7 Ziehen über den Listenrand).

### Acceptance Criteria

| # | Kriterium | Status | Messung |
|---|---|---|---|
| 1 | Item hebt sich ab, **bevor es bewegt wird** | ⚠️ **teilweise** | Halten allein (400 ms, 0 px) → `transform: none`. Nach der ersten Bewegung → `matrix(1.03, …)`, Schatten, `z-index: 10`. Siehe BUG-14 |
| 2 | Folgt dem Finger kontinuierlich | ✅ | **8 von 8** Messungen verschieden, auf allen drei Viewports |
| 3 | Übrige Items weichen aus und geben die Lücke frei | ✅ | 3 von 5 Zeilen verschieben sich messbar während des Ziehens, 5 tragen einen Transform |
| 4 | Legt sich nach dem Loslassen ab | ✅ | `transform: none`, `box-shadow: none`, `z-index: auto` |
| 5 | Wisch ohne Long-Press scrollt, Reihenfolge unverändert | ✅ | 47-ms-Wisch bei 2022 px Scroll-Reserve: `reordered: false`, `scrolled: true` |
| 6 | Kein gleichzeitiges Scrollen während des Ziehens | ❌ **Spec-Fehler** | Siehe unten — das Kriterium ist so nicht haltbar |
| 7 | Ziehen über den Listenrand bricht nicht ab | ✅ | 900 px über die Unterkante hinaus: Item bleibt gegriffen, 5 von 5 Items erhalten, Reihenfolge konsistent |
| 8 | Gelöster Zustand unberührt (kein Anheben, kein Umsortieren) | ✅ | 0 Greif-Buttons; erzwungener Drag-Versuch ändert nichts |

### AC-6 ist ein Fehler in der Spec, nicht im Produkt

Die Messung zeigte zunächst einen Verstoß (Scroll 2130 → 2088 während eines aktiven Drags). Statt das als Bug zu melden, habe ich instrumentiert: Die Seite steht bei **8 von 10** Bewegungsschritten still und scrollt erst ab Schritt 9 — genau dann, wenn der Finger den oberen Bildschirmrand erreicht.

Gegenprobe mit zwei Zuggrößen:

| Zug | Endposition des Fingers | Scroll |
|---|---|---|
| Kurz (bleibt bildschirmmittig) | 300 px vom oberen Rand | **0 px** |
| Lang (bis an den Rand) | 120 px vom oberen Rand | −9 px |

Das ist `@dnd-kit`s **Auto-Scroll**: die Funktion, die es überhaupt erst erlaubt, ein Item an eine Position außerhalb des sichtbaren Bereichs zu ziehen. AC-6 wörtlich genommen würde genau diese Funktion verbieten und lange Listen unbedienbar machen. Das Kriterium ist beim Schreiben der Spec zu absolut formuliert worden — gemeint war "der Wisch löst kein konkurrierendes Scrollen aus", und das ist durch AC-5 bereits abgedeckt. **Kein Produktfehler; das Kriterium gehört präzisiert.**

### Gegenprobe: Fangen die Tests den gemeldeten Fehler wirklich?

Mit der **echten Vorgängerfassung aus `HEAD`** fallen **9 Tests** — mehr als die 4, die die Frontend-Phase gemessen hatte, weil ich die nachgezogenen Bestandstests in die Gegenprobe einbezogen habe:

- `das gegriffene Item hebt sich sichtbar ab und folgt dem Finger` (Chrome) — **der gemeldete Befund**
- `ein Wisch ueber dem Zeilentext … laesst die Reihenfolge in Ruhe` (Chrome) — **der Zweitbefund**
- `das Handle ist Drag-Flaeche, der Zeilenkoerper Scroll-Flaeche` (**Chrome und WebKit**)
- `ein Zug am Handle sortiert um` (Chrome)
- `renders items with drag handles…` und `shows solved feedback once…` (je Chrome und WebKit)

Produktcode danach per `diff` als byte-identisch bestätigt.

### Zusätzlich geprüft (in der Spec nicht gefordert)

- **Doppelte Item-Texte:** `["Gleich","Gleich","Anders","Extra"]` — Ziehen funktioniert, 4 von 4 Items erhalten, keine React-Key-Kollision. Die stabilen IDs (statt Index oder Text als Key) sind hier die Absicherung.
- **2 Items** (Minimum) und **8 Items** (über der Creator-Grenze von 6): beide rendern und funktionieren.
- **Voller Spieldurchlauf:** Sortieren → "Prüfen" → "Richtig" → 0 Greif-Buttons → "Station abschließen" aktiv.
- **Tastatur:** Die Handles sind in 3 Tabs erreichbar und in sinnvoller Reihenfolge, mit sprechenden Labels ("Zwei verschieben"). Umsortieren per Tastatur funktioniert **nicht** — siehe BUG-13.
- **WebKit:** Struktur identisch (`touch-action` auto/none, Handle 44×44), Ziehen funktioniert, Anheben sichtbar (`matrix(1.03, …)`, Schatten, `z-index: 10`), **0 Konsolenfehler**.

### Security-Audit — ohne Befund

Die Item-Texte und die Frage sind die einzigen angreiferkontrollierten Felder.

- `<img src=x onerror=…>` und `<script>` in Frage **und** Items: **0 injizierte Elemente, 0 Dialoge, kein `window.__pwned`** — als escapter Text gerendert
- Die Roh-Texte landen zusätzlich in `aria-label` der Greif-Buttons — als **Attributwert**, nicht als Markup
- Umlaute, ß und Emoji rendern korrekt
- Ein 200-Zeichen-Item erzeugt **keinen horizontalen Scrollbalken** (`scrollWidth == innerWidth`)

### Kontrast & Touch-Targets

| Element | Gemessen | Vorgabe |
|---|---|---|
| Item-Text | **19,24:1** | 4,5:1 |
| Greif-Icon | **7,90:1** | 4,5:1 |
| Greif-Button | **44×44 px** auf allen drei Viewports | 44 px |

### Bugs

#### BUG-13 (Low, neu): Greif-Handles sind fokussierbar, aber per Tastatur ohne Funktion
- **Beschreibung:** `@dnd-kit` setzt über `{...attributes}` ein `role="button"` und `tabindex="0"` auf die Handles. Sie sind damit in der Tab-Reihenfolge und geben sich als bedienbar aus — es ist aber kein `KeyboardSensor` registriert, also passiert bei Space/Enter/Pfeiltasten nichts.
- **Auswirkung:** Ein Screenreader kündigt eine Schaltfläche an, die auf Aktivierung nicht reagiert. Tastaturnutzer können die Aufgabe nicht lösen.
- **Schwere: Low** — die Zielgruppe spielt auf dem Handy per Touch, und die Entscheidung "nur Ziehen, kein zweiter Bedienweg" ist im Refinement bewusst getroffen worden. Der Befund ist die *Folge* dieser Entscheidung, nicht ihr Widerspruch.
- **Reproduktion:** Sortier-Aufgabe öffnen → 3× Tab → Space/Pfeiltasten → keine Änderung.
- **Anmerkung:** Mit `@dnd-kit` wäre das ein `useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })` — ein eigener Refinement-Anlass, nicht Teil dieses Scopes.

#### BUG-14 (Low, neu): Das Anheben löst erst bei der ersten Bewegung aus, nicht beim Halten
- **Beschreibung:** AC-1 verlangt das Anheben, "bevor es bewegt wird". Gemessen: 400 ms gehalten, 0 px bewegt → `transform: none`, kein Schatten. Der `TouchSensor` braucht nach der Wartezeit zusätzlich eine Bewegung über die 8-px-Toleranz.
- **Auswirkung:** Die vom Betreiber beschriebene Erwartung ("das was ich anfasse hebt sich") ist um einen Sekundenbruchteil versetzt erfüllt — das Item hebt sich beim ersten Bewegen statt beim Anfassen.
- **Schwere: Low** — **bekannt und vom Betreiber während der Frontend-Phase abgenommen**; die Alternative hätte ~20 Zeilen eigenen Zustand neben `@dnd-kit` gekostet, also genau die Handarbeit, die dieses Refinement abbaut. Als Bug geführt, weil die Spec-Formulierung und die Implementierung auseinandergehen; zu beheben wäre entweder das AC oder der Code.

### Regression

| Suite | Ergebnis |
|---|---|
| Unit | **266/266** |
| E2E beide Engines (Production-Build) | **1003 passed / 0 failed / 0 flaky / 55 skipped** |
| Neue Suite, 3× seriell | **3/3 Läufe identisch grün** (7 passed, 3 skipped) — keine Flakiness |
| Build / Lint | sauber (0 Fehler, 7 vorbestehende Warnungen, keine in geänderter Datei) |

Die 55 Skips sind nachvollzogen: 52 vorbestehend, 3 aus der neuen Datei (die CDP-Gesten-Tests laufen nur unter Chromium — eine echte, dokumentierte Engine-Grenze). **Die beiden strukturellen Zusicherungen laufen auf beiden Engines**, damit ist die WebKit-Abdeckung nicht blind.

**Konsolenfehler geprüft statt weggewunken:** Der Durchlauf meldete 404s für `/_vercel/insights/script.js`. Gegenprobe auf `/about` — einer von diesem Feature unberührten Route — zeigt denselben 404. Vercel Analytics existiert nur in Production; **vorbestehend, kein Regressionsbefund.**

### Nicht abgedeckt

- **Das Gefühl am echten Gerät.** Ob 150 ms Long-Press richtig sind, entscheidet ein Daumen, kein Emulator.
- **Echte Touch-Gesten auf iOS Safari.** Playwright kann auf WebKit keine vergleichbaren Touch-Sequenzen senden; dort sind Struktur, Anheben und Ziehen über den Maus-Pfad geprüft.
- **Firefox** (Binary fehlt). Risiko gering: genutzt werden CSS-Transforms und Pointer Events, beide Engines messen identisch.

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

## QA Test Results — Ansichtsmodus für abgeschlossene Stationen (2026-08-30)

**Tested:** 2026-08-30
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

**Scope:** Nur das in `/refine` (2026-08-30) hinzugefügte Delta — AC-Block "Ansichtsmodus für abgeschlossene Stationen" sowie die drei geänderten Dateien (`station-list.tsx`, `station-modules.tsx`, `quest-player.tsx`). Alle anderen PROJ-4-Acceptance-Criteria wurden bereits in der QA-Runde vom 2026-08-26 geprüft (siehe oben) und sind durch dieses Delta unverändert.

**Methodik-Hinweis:** Diesmal war sowohl Playwright-Chromium (normales Chromium-Binary, nicht die Headless-Shell-Variante) als auch WebKit im lokalen Cache installiert und lauffähig — anders als in früheren PROJ-3/4-QA-Runden. Die volle E2E-Suite (`tests/proj-4-player-modul-rendering.spec.ts`) wurde live mit `--project="Mobile Safari"` ausgeführt (Chromium-Headless-Shell fehlte; Nachinstallation auf ausdrücklichen Wunsch des Nutzers übersprungen — WebKit genügt für dieses Delta). Zusätzlich mehrere gezielte Ad-hoc-Playwright/WebKit-Skripte für Edge Cases und den Security-Check, alle wieder aus dem Repo entfernt (waren nur temporäre Scratch-Skripte).

### Acceptance Criteria Status

#### Ansichtsmodus für abgeschlossene Stationen
- [x] Klick auf eine abgeschlossene Station in der Stationsliste öffnet jetzt den Modul-Screen (vorher: kein Effekt) — E2E-Test `tapping a completed station in the list opens its module screen`
- [x] Alle Module (Text/Bild/Audio/Video/Tasks) werden unverändert wie im normalen Modul-Screen angezeigt — verifiziert per Code-Review (`readOnly` beeinflusst nur `solved`-Prop der Task-Module und den Abschluss-Button, keine anderen Modul-Typen) und Screenshot
- [x] Task-Module sind read-only (Häkchen sichtbar, keine Eingabeelemente) — E2E-Test `shows the task in its read-only solved state instead of the input field`; zusätzlich per Ad-hoc-Skript für alle drei Task-Typen (Code, Multiple-Choice, Sortierung) gemeinsam auf einer Station verifiziert: 0 interaktive `<input>`-Elemente, 0 draggable Sortier-Items
- [x] Button zeigt "Bereits abgeschlossen" (deaktiviert, kein Tap-Effekt) statt "Station abschließen" — E2E-Tests `shows a disabled 'Bereits abgeschlossen' indicator...` und `tapping the disabled indicator does not re-trigger completion or change screen`
- [x] Zurück-Button führt zur Stationsliste zurück — E2E-Test `the back button returns to the station list`

**5/5 Acceptance Criteria bestanden.**

### Edge Cases Status

- [x] EC-10 (Station ohne Tasks, abgeschlossen): Ad-hoc-Skript bestätigt — zeigt "Bereits abgeschlossen", kein "Station abschließen"-Text im DOM
- [x] EC-11 (Sortierungs-Task im Ansichtsmodus): Zeigt "Richtig" ohne Item-Liste, wie spezifiziert (kein Code in `sorting-task.tsx` geändert, Verhalten kommt aus dem bereits bestehenden `solved`-Zustand)
- [x] Zusätzlicher, nicht dokumentierter Fall (selbst identifiziert): Station mit 3 gemischten Task-Typen, bei der `solvedTasks` in localStorage nur 1 von 3 Tasks als gelöst listet (inkonsistente/veraltete Progress-Daten) — alle 3 Tasks werden trotzdem korrekt read-only mit "Richtig" gerendert, da `readOnly` das `solved`-Flag hart auf `true` erzwingt statt sich auf `solvedTasks` zu verlassen. Bestätigt, dass die Implementierung robust gegen diesen Datenzustand ist

### Regression Testing

Volle E2E-Suite (`npx playwright test --project="Mobile Safari" tests/proj-4-player-modul-rendering.spec.ts`) gegen den Stand **vor** diesem Delta (`git stash`) und **danach** verglichen:

| Lauf | Ergebnis |
|------|----------|
| Vor dem Delta (git stash) | 25 passed, 2 failed (`completing a station marks it completed and unlocks the next station`, `a completed station shows a checkmark and unlocks the next one in the list`) |
| Nach dem Delta | 30 passed, 2 failed (identische 2 Fehlschläge) |

Die 2 Fehlschläge waren bereits vor diesem Delta vorhanden (per `git stash`-Vergleich verifiziert) und keine PROJ-4-Delta-Regression, sondern ein Fixture-Fehler in den Tests selbst: Beide seedeten `visitedStations: [ALL_STATION_IDS[1]]` (nur "Code Station" besucht, "Content Station" davor nie), wodurch "Content Station" laut `getStationStatus`-Logik dauerhaft "current" blieb (erste nicht-abgeschlossene Station) und "MC Single Station" entsprechend "locked" blieb statt freigeschaltet zu werden.

**BUG-5 (behoben, 2026-08-30): Testfixture seedet Station 1 nicht mit, blockiert dadurch fälschlich die Freischaltung von Station 3**
- **Severity:** Low (reiner Testcode-Fehler, keine Produktivcode-Auswirkung)
- **Fix:** Beide Tests (`completing a station marks it completed and unlocks the next station`, `a completed station shows a checkmark and unlocks the next one in the list`) seeden jetzt zusätzlich `ALL_STATION_IDS[0]` in `visitedStations` und `completedStations`, sodass "Content Station" korrekt als abgeschlossen gilt und "Code Station" wie beabsichtigt "current"/wird-abgeschlossen ist
- **Verifiziert:** Volle Suite danach 32/32 bestanden (`npx playwright test --project="Mobile Safari" tests/proj-4-player-modul-rendering.spec.ts`), keine neuen Fehlschläge

`npm test` (Vitest): 151/151 bestehen (keine neuen Unit-Tests nötig, siehe Implementation Notes — die Änderung nutzt ausschließlich bereits getestete Bausteine).

### Security Audit Results
- [x] XSS über injizierten Stationsnamen (`<img src=x onerror=alert(1)>...`) im neuen Ansichtsmodus-Renderpfad: kein Alert ausgelöst, Name erscheint als reiner Text im DOM (React-Escaping greift identisch zum bestehenden Verhalten)
- [x] XSS über injizierten Task-Fragetext (`<script>...</script>`) im read-only-Zustand: Skript wird nicht ausgeführt (verifiziert per `window`-Flag-Check nach dem Rendern)
- [x] Kein neuer `dangerouslySetInnerHTML`, `eval()` oder `new Function()` in den 3 geänderten Dateien (Grep bestätigt)
- [x] `readOnly`-Ableitung (`completedStations.includes(station.id)`) liest ausschließlich bereits vorhandene, geräteeigene localStorage-Daten — keine neue Angriffsfläche, kein neuer Netzwerk-Request, keine neue Cross-Origin- oder Cross-User-Auswirkung

### Bugs Found

Keine neuen Bugs im getesteten Delta gefunden. 1 vorbestehender Testcode-Bug (BUG-5, siehe Regression Testing) identifiziert und behoben.

### Summary
- **Acceptance Criteria (Delta):** 5/5 bestanden
- **Bugs Found:** 1 total (0 Critical, 0 High, 0 Medium, 1 Low) — BUG-5 (Testfixture, kein Produktivcode-Bug), behoben
- **Security:** Pass, keine offenen Befunde
- **Regression:** Pass — nach Fix der Testfixture (BUG-5) besteht die volle E2E-Suite 32/32, keine PROJ-4-Delta-Regression
- **Production Ready:** YES
- **Recommendation:** Kann deployed werden. Keine offenen Punkte mehr.

---

## Deployment

**Deployed:** 2026-08-26
**Production URL:** https://geoquesty.vercel.app
**Commit:** 0527a96
**Tag:** v1.4.0-PROJ-4
**Verifiziert:** Nutzer hat den vollständigen Flow (Quest starten → Stationsliste → Station öffnen → Aufgabe lösen) live in Produktion durchgeklickt und bestätigt, dass es funktioniert.

### Redeploy: Ansichtsmodus für abgeschlossene Stationen (2026-08-30)

**Deployed:** 2026-08-30
**Production URL:** https://geoquesty.vercel.app
**Commit:** eb21a7a
**Tag:** v1.10.0-PROJ-4
**Pre-Deployment-Checks:** `npm run build` erfolgreich, `npm run lint` 0 Fehler (nur vorbestehende `<img>`-Warnungen), `npx tsc --noEmit` keine neuen Fehler, `npm test` 151/151, volle E2E-Suite (`tests/proj-4-player-modul-rendering.spec.ts`) 32/32 bestanden
**Verifiziert:** Push nach `origin/main` löste den Vercel-GitHub-Auto-Deploy aus. Direkt danach per Playwright/WebKit **live gegen die Produktions-URL** verifiziert (nicht nur lokal): Test-Quest mit einer abgeschlossenen Station in `localStorage` geseedet, Klick auf die Station in der Stationsliste öffnet den Modul-Screen (`aria-label` "... — abgeschlossen, zum Ansehen tippen" gefunden), Modul-Inhalt wird angezeigt, "Bereits abgeschlossen"-Button sichtbar. Kein Backend/keine ENV-Variablen betroffen (reines localStorage-Feature).

---

## Implementation Notes — Aufgaben-Screen visuelles Redesign (2026-09-02)

Nutzergetriebenes visuelles Redesign der Task- und Media-Module im Player, basierend auf einem vom Nutzer bereitgestellten Mockup (`design-preparation/Aufgaben-Screen.html`, ein Claude-Design-Canvas-Export mit 3 Screen-Varianten: Code+Bild, Multiple-Choice+Video, Sortierung+Audio). Kein neuer Feature-Spec-Eintrag, da bestehende Acceptance Criteria unverändert gelten — reines Styling-Delta, keine neue Funktionalität, keine Datenmodell-Änderung.

**Bewusst NICHT übernommen (Nutzerentscheidung, siehe Rückfragen vor der Umsetzung):**
- Kein Umbau zu einem Ein-Screen-pro-Aufgabe-Flow — die bestehende Liste aller Module untereinander bleibt (Mockup zeigt einen fokussierten Single-Task-Screen, das hätte `station-modules.tsx` zu einem Multi-Step-Flow gemacht)
- Kein neues Hint/Hinweis-Feature (Mockup hat einen Hinweis-Button-State, der ein neues Schema-Feld gebraucht hätte)
- Multiple-Choice: bestehende Radio-/Checkbox-Circles beibehalten (nicht die Buchstaben-Badges A/B/C/D aus dem Mockup)
- Sortierung: bestehendes Drag & Drop (Maus + Touch) beibehalten (nicht die Auf/Ab-Pfeil-Buttons aus dem Mockup)
- Code-Aufgabe: bestehendes einzeiliges Input-Feld beibehalten (nicht die PIN-Zellen-Eingabe aus dem Mockup)

**Übernommen (reines Styling):**
- Neue "Aufgabe"-Eyebrow-Label (`text-tech text-[10px] text-gq-grey`) über der Frage in allen 3 Task-Karten (`code-task.tsx`, `multiple-choice-task.tsx`, `sorting-task.tsx`)
- Kartenrahmen wechselt von 1px auf 2px bei "richtig"/"falsch" (`border-2 border-gq-lime/60` bzw. `border-2 border-destructive/60`), 1px im neutralen Zustand — matcht die Mockup-Kartenoptik
- Neue geboxte Fehler-Banner (`border-2 border-destructive/60 bg-destructive/10`, abgerundet, mit Padding) ersetzen die bisherige einzeilige rote Textzeile bei falscher Antwort, in allen 3 Task-Typen
- Media-Module (`image-module.tsx`, `video-module.tsx`, `audio-module.tsx`) bekommen `shadow-card` + Rahmen für den erhöhten "Hero-Block"-Look aus dem Mockup
- Audio-Modul: linearer Fortschrittsbalken durch eine Waveform-Balken-Visualisierung ersetzt (deterministisch pseudo-zufällige Balkenhöhen, Lime für abgespielten Anteil, Grau für den Rest), Seek-Klick-Verhalten unverändert übernommen

**Wiederverwendete Bausteine:** `shadow-card`/`shadow-glow-lime`/`border-destructive` aus dem bestehenden `tailwind.config.ts` — keine neuen Design-Tokens nötig, die Mockup-Werte (Box-Shadow, Border-Farben) waren bereits 1:1 als Utility vorhanden.

**Verifikation:** `npm run lint` ✓ (0 Fehler, 6 vorbestehende `<img>`-Warnungen) · `npm run build` ✓ · `npm test` ✓ (159/159). Manuell im Browser geprüft (Playwright/WebKit, 390×844 Mobile-Viewport, Test-Quest mit allen 7 Modultypen in `localStorage` geseedet): Text-, Bild-, Video-, Audio-Modul sowie Code-, Multiple-Choice- und Sortierungs-Aufgabe visuell verifiziert; Code-Aufgabe gezielt mit falscher Antwort (rotes 2px-Banner + roter Kartenrahmen) und danach richtiger Antwort (limefarbener 2px-Kartenrahmen + Richtig-Checkmark) getestet. Keine Konsolenfehler während des gesamten Durchlaufs.

---

## Implementation Notes — Idle-Belebung & persistente Lösungsanzeige (2026-09-02)

Zweite nutzergetriebene Iteration auf dem visuellen Redesign oben: der unbearbeitete Zustand der Task-Karten wirkte zu flach, und eine gelöste Aufgabe kollabierte bisher zu einer reinen "Richtig"-Checkmark-Zeile — die abgegebene Lösung selbst war danach nicht mehr sichtbar. Zwei Änderungen, weiterhin ohne neuen Feature-Spec-Eintrag (reines Styling-Delta, bestehende Acceptance Criteria unverändert erfüllt):

**1. Idle-Belebung:** Der neutrale 1px-Graurahmen im unbearbeiteten Zustand wird durch einen Teal-Akzent ersetzt (`border-2 border-gq-teal/30 shadow-glow`, gleiche `shadow-glow`-Utility wie an anderer Stelle im Design-System) — kennzeichnet die Karte visuell als "aktiv/wartend", analog zum Lime-Rahmen im gelösten und Rot-Rahmen im falsch-Zustand. Betrifft alle 3 Task-Karten (`code-task.tsx`, `multiple-choice-task.tsx`, `sorting-task.tsx`).

**2. Persistente, read-only Lösungsanzeige — ohne neue Persistenz:** Bisher zeigte der gelöste Zustand nur eine Checkmark-Zeile, die abgegebene Eingabe/Auswahl/Reihenfolge verschwand. Jetzt bleibt die Lösung sichtbar, aber gesperrt:
- Code-Aufgabe: Input-Feld zeigt `answer` (die im Modul hinterlegte korrekte Antwort), `disabled` + `readOnly`, Checkmark-Zeile erscheint zusätzlich darunter
- Multiple-Choice: Radio-/Checkbox-Optionen zeigen `correctIndices` als Auswahl, alle Optionen `disabled`, Checkmark-Zeile zusätzlich darunter
- Sortierung: Items zeigen `items` (die im Modul hinterlegte korrekte Reihenfolge), Drag-Handles inaktiv (kein `draggable`, keine Drag-Handler mehr angehängt, Grip-Icon abgedunkelt), Checkmark-Zeile zusätzlich darunter

**Kein neues `solvedAnswers`-Feld nötig (Design-Entscheidung nach Nutzer-Rückfrage):** Der erste Entwurf dieser Iteration fügte `QuestProgress` ein neues `solvedAnswers`-Feld hinzu, um die tatsächlich vom Spieler eingegebene/ausgewählte Antwort zu persistieren. Der Nutzer wies zurecht darauf hin, dass `handleCheck()` in allen 3 Task-Komponenten ohnehin nur dann `onSolved()` auslöst, wenn die Eingabe exakt der kanonischen Lösung entspricht (`selected` === `correctIndices`-Menge bei Multiple-Choice, `items`-Reihenfolge === `correctOrder` bei Sortierung, String-Gleichheit bei Code) — die tatsächliche Nutzereingabe ist im gelösten Zustand also immer identisch mit den bereits vorhandenen Modul-Daten (`answer`/`correctIndices`/`items`, alle schon als Props vorhanden). Eine separate Persistenz-Schicht war daher unnötige Komplexität: Die drei Task-Komponenten leiten die Anzeige jetzt rein lokal her (`solved ? <kanonischer Wert> : <lokaler State>`), kein Zugriff auf `quest-progress.ts` nötig, keine Schema-Änderung, kein Reload-Persistenz-Risiko. Der ursprüngliche Entwurf (`solvedAnswers`-Feld, `markTaskSolved()` mit viertem Parameter, `getSolvedAnswer()`) wurde vollständig zurückgebaut, bevor er committet wurde.

**Reset-Verhalten (weiterhin gültig):** Die einzige Möglichkeit, eine gesperrte Lösung wieder editierbar zu machen, ist ein vollständiger Quest-Reset (bestehende `deleteProgress()`-Funktion, unverändert) — es gibt bewusst keinen "nochmal versuchen"-Button für bereits gelöste Aufgaben.

**Verifikation:** `npx tsc --noEmit` ✓ (0 neue Fehler, gleiche 2 vorbestehende `@ts-expect-error`-Warnungen in `quest-storage.test.ts` wie vor dieser Änderung) · `npm run lint` ✓ (0 Fehler, 6 vorbestehende `<img>`-Warnungen) · `npm run build` ✓ · `npm test` ✓ (159/159, keine neuen Tests nötig — reine Anzeige-Ableitung aus bereits getesteten Props, kein neuer Codepfad in `quest-progress.ts`/`use-quest-progress.ts`). Manuell im Browser verifiziert (Playwright/WebKit, 390×844): Idle-Zustand aller 3 Task-Typen zeigt den neuen Teal-Glow-Rahmen; Code-Aufgabe und Multiple-Choice-Aufgabe gelöst, dann **vollständiger Seiten-Reload** durchgeführt — die kanonische Antwort ("4" bzw. "1610") erschien weiterhin korrekt, Input programmatisch als `disabled` bestätigt. Keine Konsolenfehler während des gesamten Durchlaufs.

---

## QA Test Results — Visuelles Redesign & persistente Lösungsanzeige (2026-09-02)

**Tested:** 2026-09-02
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** `npx tsc --noEmit` ✓ (0 neue Fehler, 2 vorbestehende `@ts-expect-error`-Warnungen in `quest-storage.test.ts`, unverändert seit vor diesem Delta) · `npm run lint` ✓ (0 Fehler, 6 vorbestehende `<img>`-Warnungen) · `npm run build` ✓ · `npm test` ✓ (159/159)
**Browser-Hinweis:** Auf Nutzerwunsch ("ohne chromium") ausschließlich gegen `Mobile Safari` (WebKit) getestet — der lokal gecachte Chromium-Build war zu Sessionbeginn bereits als korrupt festgestellt worden (`dlopen`-Fehler beim Framework-Laden, unvollständiger `playwright install`). Dies ist dasselbe bereits in PROJ-3/4/6/7/8 dokumentierte, wiederkehrende Sandbox-Verhalten, kein neuer Befund.

Scope dieser QA-Runde: das visuelle Redesign der Task-/Media-Karten (Mockup-Angleichung) und die anschließende Iteration (Idle-Glow + persistente, gesperrte Lösungsanzeige) aus den beiden Implementation-Notes-Abschnitten oben — kein neuer Feature-Spec-Eintrag, da beide Änderungen als reines Styling-/Anzeige-Delta auf dem bereits deployten PROJ-4 dokumentiert sind. Die zugehörigen Acceptance Criteria (Zeile 73, Edge Case 11) wurden vor diesem QA-Lauf aktualisiert, um das neue, korrekte Verhalten zu beschreiben (siehe Diff).

### Acceptance Criteria Status

#### Task: Code-Eingabe
- [x] Fragestellung, Textfeld und "Prüfen"-Button werden angezeigt
- [x] Richtige Antwort (case-insensitive, trimmed) → grünes Feedback mit Häkchen, Task als gelöst markiert
- [x] Falsche Antwort → rotes Feedback mit Shake-Animation und Fehlertext
- [x] **Aktualisiert:** Task gelöst → Eingabefeld bleibt sichtbar, zeigt die korrekte Antwort, ist deaktiviert; Häkchen zusätzlich sichtbar (nicht mehr: Feld verschwindet)

#### Task: Multiple Choice (Single & Multi)
- [x] Radio- bzw. Checkbox-Optionen werden korrekt je nach `correctIndices.length` gerendert
- [x] Richtige Auswahl → grünes Feedback; falsche/unvollständige Auswahl → rotes Feedback ohne Preisgabe der richtigen Optionen
- [x] **Neu geprüft:** Nach dem Lösen bleiben die (korrekten) Optionen sichtbar und ausgewählt/angehakt, alle Optionen (auch nicht gewählte) sind deaktiviert

#### Task: Sortierung
- [x] Items werden in garantiert nicht-korrekter, zufälliger Reihenfolge mit Drag-Handles gerendert
- [x] Falsche Reihenfolge → rotes Feedback mit Shake; korrekte Reihenfolge → grünes Feedback
- [x] **Aktualisiert:** Nach dem Lösen bleibt die korrekte Reihenfolge als Liste sichtbar, Drag-Handles sind inaktiv (kein `draggable`, keine Drag-Listener) — nicht mehr: Liste verschwindet vollständig

#### Idle-Zustand (neu)
- [x] Alle 3 Task-Karten zeigen im unbearbeiteten Zustand einen Teal-Akzentrahmen (`border-2 border-gq-teal/30 shadow-glow`) statt des vorherigen neutralen 1px-Graurahmens

#### Media-Module (Bild/Video/Audio)
- [x] Bestehende Platzhalter-/Caption-/Fehlerverhalten unverändert funktionsfähig
- [x] Visuelle Angleichung (Card-Shadow, Rahmen, Audio-Waveform) beeinträchtigt keine bestehende Funktionalität

### Edge Cases Status

- [x] Sortierungs-Task im Ansichtsmodus (abgeschlossene Station): zeigt jetzt die Item-Liste weiterhin (nicht mehr nur "Richtig") — Edge Case 11 in der Spec entsprechend aktualisiert
- [x] Leerer Code-Eingabe-String: "Prüfen"-Button bleibt deaktiviert (unverändert, Regressionscheck bestanden)
- [x] Reload/Wiedereinstieg nach dem Lösen: kanonische Antwort/Auswahl/Reihenfolge erscheint weiterhin korrekt und gesperrt (keine neue `solvedAnswers`-Persistenz nötig, siehe Implementation Notes — rein aus vorhandenen Modul-Props abgeleitet)
- [x] Ansichtsmodus einer bereits abgeschlossenen Station: Task-Karten identisch zum "gelöst"-Zustand im normalen Modul-Screen, inkl. sichtbarer, gesperrter Lösung

### Security Audit Results
- [x] XSS via manipuliertem `answer`-Wert (`"><img src=x onerror=alert(1)>`), gerendert im gelösten, disabled `<input value>`: kein Alert ausgelöst, kein unescaptes `<img onerror>` im DOM — React rendert den String ausschließlich als attribut-escapten Wert, nie als Markup
- [x] Kein neues `dangerouslySetInnerHTML` in den 6 geänderten Modul-Dateien (per Grep bestätigt) — alle neuen Anzeige-Werte (`answer`, `correctIndices`-Optionen, `items`) laufen durch dieselben, bereits vor diesem Delta sanitisierten JSX-Textknoten wie zuvor
- [x] Keine neuen Netzwerk-Calls, keine neuen localStorage-Schreibzugriffe (die finale, vereinfachte Lösung verzichtet bewusst auf eine neue Persistenzschicht, siehe Implementation Notes)
- [x] Radix-`disabled`-Propagation (RadioGroup/Checkbox) verhindert auch Keyboard-Interaktion im gelösten Zustand, nicht nur visuelle Deaktivierung (Standard-Radix-Garantie, stichprobenartig im DOM verifiziert)

### Bugs Found

Keine Bugs mit funktionaler oder sicherheitsrelevanter Auswirkung gefunden. Die 3 fehlgeschlagenen E2E-Tests waren veraltete Assertions aus einer vor diesem Delta gültigen Spec-Version (erwarteten das Verschwinden des Eingabefelds im gelösten Zustand) — kein Produktivcode-Bug, sondern eine erwartete Konsequenz der bewusst geänderten Spec. Alle 3 korrigiert, 3 weitere Tests für die neu abgedeckten MC-/Sortierungs-Verhalten ergänzt (siehe E2E Tests unten).

### Regressionstests
- **PROJ-4 volle E2E-Suite:** 35/35 grün auf Mobile Safari nach Korrektur der 3 veralteten Assertions
- **Volle Projekt-E2E-Suite (alle Specs, Mobile Safari):** 182 grün, 17 vorbestehende Fehlschläge in PROJ-1/PROJ-3/PROJ-11 — per `git stash`-Vergleichslauf gegen den unveränderten `main`-Stand bestätigt: exakt dieselben 17 Tests schlagen bereits ohne jede Änderung dieser Session fehl. Keine neuen Regressionen. Deckt sich mit der bereits in `[[project-stale-e2e-tests]]` dokumentierten, wiederkehrenden Beobachtung.
- **`npm test` (Vitest):** 159/159 grün, keine neuen Unit-Tests nötig (reine Anzeige-Ableitung ohne neuen Codepfad in Storage/Hooks)

### Unit Tests
Keine neuen Unit-Tests nötig — die Änderung fügt keine isolierte, testbare Logik außerhalb bereits gerenderter Komponenten hinzu (`solved ? kanonischerWert : lokalerState` ist eine reine Anzeige-Ableitung innerhalb der bestehenden, bereits über E2E abgedeckten Komponenten).

### E2E Tests
`tests/proj-4-player-modul-rendering.spec.ts` aktualisiert:
- 3 veraltete Assertions korrigiert (Code-Task: Eingabefeld bleibt sichtbar/disabled/mit korrektem Wert statt zu verschwinden) — betrifft die Tests "marks the task solved…", "solved tasks remain solved…", "shows the task in its read-only solved state…" (letzterer umbenannt zur genauen Beschreibung des neuen Verhaltens)
- 3 neue Tests ergänzt: MC-Single- und MC-Multi-"keeps the chosen option(s) visible and checked but disables all options once solved", Sortierung-"keeps the correct order visible but disables dragging once solved"
- Volle Datei: 35/35 grün auf Mobile Safari

### Production-Ready Decision

**READY** — Keine Bugs mit funktionaler oder sicherheitsrelevanter Auswirkung gefunden. Alle betroffenen Acceptance Criteria (aktualisiert, wo nötig) bestanden, alle relevanten Edge Cases verifiziert, Security-Audit ohne Befund. Die 3 anfänglich fehlschlagenden Tests dokumentierten eine bewusst überholte Spec-Version und wurden korrigiert, kein Blocker.

### Summary
- **Acceptance Criteria:** Alle betroffenen Kriterien bestanden (3 davon mit aktualisiertem, vom Nutzer bestätigtem Verhalten)
- **Bugs Found:** 0 (0 critical, 0 high, 0 medium, 0 low)
- **Security:** Pass — keine ausnutzbaren Schwachstellen gefunden, insbesondere kein neues XSS-Risiko durch die neu sichtbaren `answer`/`correctIndices`/`items`-Werte im gelösten Zustand
- **Production Ready:** YES
- **Recommendation:** Deploy freigegeben. Keine offenen Punkte.

---

## Deployment — Visuelles Redesign & persistente Lösungsanzeige (2026-09-02)

**Production URL:** https://geoquesty.vercel.app
**Deployed:** 2026-09-02
**Platform:** Vercel (auto-deploy on push to main)
**Commit:** 7a6f859
**Git Tag:** v1.16.0-PROJ-4

### Pre-Deployment Checks
- [x] `npm run build` erfolgreich
- [x] `npm run lint` erfolgreich (0 Fehler, 6 vorbestehende `<img>`-Warnungen)
- [x] QA-Freigabe: "Production Ready: YES" (siehe QA Test Results oben)
- [x] Keine Critical/High-Bugs offen (0 Bugs gefunden)
- [x] Keine neuen Umgebungsvariablen nötig
- [x] Keine Secrets im Diff (`git diff HEAD -- src/ tests/` auf Geheimnis-Muster geprüft, keine Treffer)
- [x] Kein Datenbank-Layer betroffen (reines localStorage, kein Supabase-Bezug)
- [x] Alle Commits gepusht nach `main`

### Deploy-Vorgang
`git push origin main` (Commit `7a6f859`) löst den bestehenden Vercel-GitHub-Auto-Deploy aus — kein manueller `vercel --prod`-Schritt nötig.

### Post-Deployment-Verifikation
Per Playwright/WebKit direkt gegen die Produktions-URL verifiziert (nicht nur lokal): Test-Quest mit einem Code-Task via `localStorage` gesät → Station geöffnet → Frage sichtbar → Antwort "4" eingegeben und geprüft → "Richtig" erscheint → Eingabefeld bleibt sichtbar, zeigt weiterhin "4", ist deaktiviert (`disabled`) — bestätigt exakt das neue, gewünschte Verhalten (Antwort bleibt sichtbar statt zu verschwinden). Keine Konsolenfehler während des Durchlaufs. Screenshot der Produktionsseite bestätigt den neuen Lime-Rahmen, das "Aufgabe"-Eyebrow-Label und den aktivierten "Station abschließen"-Button.

### Bekannte offene Punkte
Keine.

## Refinement 2026-09-20: Touch-Sortierung im Player

### Anlass
Betreiber-Befund im Wortlaut: *"der Aufgabentyp sortieren auf dem handy fühlt sich mit touch merkwürdig an. Ich habe erwartet, dass das was ich anfasse sich ein wenig hebt und dann kann ich es per drag und drop verschieben."*

Die Erwartung deckt sich mit dem, was in dieser Spec seit dem 2026-08-24 als **Edge Case 5** steht — *"Touch-Hold aktiviert Drag. Visuelles Feedback (Item hebt sich ab, Schatten)"*. Gebaut wurde es nie.

### Was tatsächlich passiert
`sorting-task.tsx` hat **zwei getrennte Implementierungen** für dieselbe Geste:
- **Maus:** HTML5 `draggable` + `onDragStart`/`onDrop` — funktioniert, feuert aber auf Touch **gar nicht**
- **Finger:** eine eigene `onTouchMove`-Rechnung, die die zurückgelegte Strecke durch die hartkodierte Konstante `itemHeight = 58` teilt und die Liste umsortiert, sobald das Ergebnis eine ganze Zahl ergibt

Der Finger-Pfad zieht nichts. Er misst, wie weit der Finger gewandert ist, und tauscht Listeneinträge. Das Element unter dem Finger bleibt, wo es ist.

### Messung (Production-Build, Pixel-7-Viewport, echte Touch-Events via CDP)
| Geprüft | Erwartet laut Edge Case 5 | Gemessen |
|---|---|---|
| `transform` beim Halten (250 ms) | Item hebt sich ab | **`none`** |
| `box-shadow` beim Halten | Schatten | **`none`** |
| `opacity` beim Ziehen | Zustandswechsel sichtbar | **`1`** |
| Element folgt dem Finger | ja | **nein** — `transform` bleibt `none` über die gesamte Bewegung |
| Reihenfolgewechsel | fließend am Ziel | **Sprung bei exakt 58 px** |
| Zeilenhöhe / Rasterabstand | — | 52 px / **58 px** (bestätigt die Konstante) |

### Zweitbefund: Scrollen sortiert um
Nicht gemeldet, beim Nachmessen aufgedeckt, und in der Auswirkung schwerwiegender als der gemeldete Befund.

`handleTouchMove` ruft nie `preventDefault()`, und dem Drag-Handle fehlt `touch-action: none`. Jede vertikale Wischbewegung über einem Item verändert damit die Reihenfolge — auch wenn der Spieler nur weiterlesen will.

Gemessen auf einer Station mit mehreren Modulen über der Aufgabe, bis zum Anschlag gescrollt (`scrollTop 2689` von 2689, also **keine** Scroll-Reserve mehr): Ein Wisch nach oben über einem Item ließ die Seite erwartungsgemäß stehen — **und tauschte trotzdem zwei Items**. Ein Spieler kann so eine bereits korrekt sortierte Liste zerstören, ohne sie angefasst zu haben, und merkt es erst bei "Prüfen".

### Entschiedene Lösung
Die handgeschriebene Touch-Mechanik **und** die HTML5-`draggable`-Handler entfallen; beide werden durch **einen** `@dnd-kit`-Pfad ersetzt — dieselbe Bibliothek, die im Creator bereits drei sortierbare Listen trägt, und seit PROJ-8 ohnehin Abhängigkeit. Kein neues Paket.

Damit kommen Long-Press, das sichtbare Anheben, die Ausweichanimation der übrigen Items und `touch-action: none` aus einer Quelle, statt einzeln nachgebaut zu werden. Sensoren-Werte identisch zum Creator (150 ms / 8 px).

**Erwogen und verworfen:**
- **Hoch/Runter-Pfeile statt Ziehen** — hätte zwei dokumentierte Entscheidungen umgekehrt (2026-08-24 "gamiger, Zielgruppe ist Touch-affin"; 2026-09-02 wurden Pfeil-Buttons aus einem Mockup ausdrücklich nicht übernommen), um einen Fehler zu umgehen statt ihn zu beheben. Bei 3–6 Items ist Ziehen zudem schneller als mehrfaches Tippen.
- **Die eigene Touch-Mechanik reparieren** — hätte genau die Mechanik nachgebaut, die `@dnd-kit` fertig mitbringt und die hier bereits einmal misslungen ist (BUG-3 korrigierte `itemHeight` von 56 auf 58; der Wert bricht bei jeder Styling-Änderung erneut still).

### Für `/frontend` zu beachten
- **Der gelöste/read-only-Zustand darf sich nicht ändern.** Edge Case 11 und die Ansichtsmodus-Kriterien gelten unverändert: Im Zustand `solved` wird kein `useSortable` aktiviert. Die bestehenden Tests dazu (*"keeps the correct order visible but disables dragging once solved"*) müssen grün bleiben, ohne angefasst zu werden — sie sind der Wächter dafür, dass der Umbau nichts Bestehendes mitreißt.
- **Bestehende PROJ-4-Tests prüfen `div[draggable="true"]`** als Selektor für Sortier-Items. Mit `@dnd-kit` verschwindet dieses Attribut; diese Assertions sind zu **ziehen, nicht zu löschen**.
- **Der eigentliche Regressionswächter fehlt bisher ganz:** kein Test hält fest, dass ein Wisch *ohne* Long-Press die Reihenfolge unverändert lässt. Genau diese Lücke hat den Zweitbefund durchgelassen — die Suite war grün, während die Liste beim Scrollen durcheinanderging.
- Der Shuffle beim Start (garantiert nicht bereits korrekte Reihenfolge) bleibt unberührt.

### Nicht abgedeckt
- **Das Gefühl am echten Gerät.** Gemessen ist, *dass* sich etwas hebt und *wann* es greift; ob 150 ms sich richtig anfühlen, entscheidet ein Daumen, kein Emulator.
- **WebKit-Touch.** Die Messung lief über Chrome DevTools Protocol auf einem Pixel-7-Viewport; Playwright kann auf WebKit keine vergleichbaren Touch-Sequenzen senden. Der Befund ist engine-unabhängig (der fehlende `transform` steckt im Produktcode, nicht in der Engine), die Gegenprobe auf iOS Safari steht aber aus.

## Deployment — Touch-Sortierung im Player (2026-09-20)

**Live auf https://geoquesty.vercel.app** · Tag `v1.36.0-PROJ-4` · Commit `592b743`

Vercel deployte automatisch von `main`. Pre-Deployment-Checks alle grün: Build sauber, Lint 0 Fehler (7 vorbestehende Warnungen, keine in geänderter Datei), QA approved ohne Critical/High, keine Secrets im Diff, Unit 266/266 und E2E 1003/1003 vor dem Push.

### Der Kern ist in Production bestätigt — im echten Browser, nicht am Bundle

**Ein statischer Bundle-Scan hätte hier nichts belegt**, und das ist selbst ein Ergebnis: Der Sortier-Code liegt in einem Chunk, den `/play` gar nicht referenziert (lokal gegengeprüft: 1 von 44 Chunks trägt das Label, `/play` lädt 16 davon, keiner davon dieser). Die Komponente lädt erst beim Öffnen einer Station. Verifiziert wurde deshalb über eine echte Browser-Sitzung gegen die Live-Seite, auf **beiden Engines**:

| Geprüft | Chrome | WebKit |
|---|---|---|
| Greif-Handles vorhanden | 4 | 4 |
| **`draggable="true"` (alte Fassung)** | **0** | **0** |
| Anheben beim Ziehen | `matrix(1.03, 0, 0, 1.03, 0, 82)`, Schatten, `z-index: 10` | identisch |
| `touch-action` Zeile / Handle | `auto` / `none` | `auto` / `none` |
| Handle-Größe | 44×44 | 44×44 |
| Umsortieren | ✅ | ✅ |
| Ablegen | `transform: none`, kein Schatten | identisch |
| Konsolenfehler | 2× der bekannte `/play/<id>`-404 | **0** |

**`legacyDraggable: 0` ist der entscheidende Wert:** Das Attribut der alten HTML5-Implementierung ist verschwunden — damit ist belegt, dass die neue Fassung ausgeliefert wird und nicht die vorherige.

**Am Bildschirm abgenommen:** Das gezogene Item schwebt mit Teal-Rahmen und Schatten sichtbar über der Liste und überlappt seinen Nachbarn, während die übrigen Zeilen die Lücke freigeben.

### Infrastruktur

Alle sieben Routen HTTP 200 mit **0,06–0,15 s**. Security-Header aktiv inkl. HSTS (`max-age=63072000; includeSubDomains; preload`), `x-frame-options: DENY`, `x-content-type-options: nosniff`, `referrer-policy: origin-when-cross-origin`.

**Nachbarfeatures unbeschädigt:** `/about` mit `FAQPage`-JSON-LD und 1× Ko-fi, `/anleitung` weiterhin **0 Treffer** für den zurückgehaltenen Prompt, `sw.js` liefert 200.

### Eine Auffälligkeit geprüft statt weggewunken

Der Durchlauf meldete `404 /play/prod`. Das ist **systembedingt und vorbestehend**: Quests liegen nur im localStorage, der Server kann die ID nicht kennen — der Client rendert trotzdem korrekt, für den Nutzer unsichtbar. Bereits im Deploy vom 2026-09-07 dokumentiert. Gegenprobe: `/play/irgendwas` liefert denselben 404.

### Offen

Die beiden Low-Bugs aus der QA gehen bewusst mit live: **BUG-13** (Greif-Handles fokussierbar, aber per Tastatur ohne Funktion) und **BUG-14** (Anheben löst bei der ersten Bewegung aus statt beim reinen Halten, vom Betreiber abgenommen). Beide nicht blockierend, beide ein eigenes Refinement wert.

Weiterhin nur am echten Gerät zu beurteilen: ob sich 150 ms Long-Press richtig anfühlen.
