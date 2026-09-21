# PROJ-5: Player — Fortschritt & Abschluss

## Status: In Progress
**Created:** 2026-08-26
**Last Updated:** 2026-09-21

> **Mitbetroffen vom Refinement in PROJ-3 (2026-09-19) — umgesetzt:** Der Outro-Screen teilt sich `ConfettiEffect` mit dem Ankunfts-Screen. Diese Komponente wird von „Rieseln von oben, endlos" auf eine **einmalig feuernde Konfetti-Kanone** (von unten mittig nach oben) umgebaut, dazu kommt eine Behandlung von `prefers-reduced-motion`. Bewusste Entscheidung: **beide** Screens bekommen die Kanone — der Outro ist der größere Anlass und würde mit dem schwächeren Effekt zurückbleiben. Der Outro-Screen selbst wird dabei nicht angefasst; er erbt das neue Verhalten. Sein Acceptance Criterion „Konfetti-Effekt läuft (analog zum Ankunfts-Overlay aus PROJ-3)" bleibt damit wörtlich gültig. Das freigestellte Pin-PNG aus demselben Refinement zieht der Outro ebenfalls, da er `mark-pin.jpg` mit demselben sichtbaren Rechteck rendert. Siehe PROJ-3, Abschnitt „Ankunft — Gratulationsscreen".
>
> **Umgesetzt am 2026-09-19.** `outro-screen.tsx` wurde nur an einer Stelle angefasst — dem Pin-Bild (JPEG → freigestelltes PNG, `rounded-2xl` entfernt). Das neue Konfetti-Verhalten erbt der Screen ohne jede Änderung an seiner Datei. Gegengeprüft am laufenden Outro: Pin `/assets/mark-pin.png`, Border-Radius `0px`, Animation `gq-cannon`, `iteration-count: 1`. Sein Acceptance Criterion „Konfetti-Effekt läuft (analog zum Ankunfts-Overlay aus PROJ-3)" ist damit weiterhin erfüllt.

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
6. Als Spieler möchte ich eine Quest direkt aus der Play-Liste löschen können, damit ich gespielte oder nicht mehr gebrauchte Quests loswerde, ohne dafür in den Creator wechseln zu müssen.

## Out of Scope
- Bestätigungsdialog vor dem Reset — bewusst weggelassen (siehe Decision Log), Reset passiert sofort mit Toast-Feedback
- Undo-Funktion nach dem Reset
- Live-GPS-Distanzanzeige zur nächsten Station auf der Quest-Liste (nur Stationsname, keine Live-Distanz — siehe Decision Log)
- Eigener Filter-Tab "Abgeschlossen" (nur Alle/Live/Neu)
- Punkte-/Zeit-Tracking oder Bestenliste nach Abschluss (PRD Non-Goal)
- Teilen-Funktion / Screenshot des Abschluss-Screens
- Distanz (km) und tatsächliche Spielzeit in der Meta-Zeile der Karten (nicht im Datenmodell vorhanden)
- ~~Löschen der Quest selbst aus der Liste (Quest-Verwaltung — PROJ-6)~~ → **aufgehoben am 2026-09-21** (Refinement „Quests im Play-Modus löschen"): Das Löschen ist jetzt Teil dieser Spec, siehe Acceptance-Criteria-Block „Quest löschen (Play-Modus)". Der Grund für den ursprünglichen Ausschluss — „Löschen gehört in die Quest-Verwaltung" — unterstellte, dass jeder Nutzer von `/play` auch den Creator benutzt. Das trifft auf den Spieler, der eine fertige Quest-Datei bekommen hat, nicht zu: Für ihn ist `/play` die ganze App.
- ~~Bereinigung verwaister Fortschritts-Einträge, wenn eine Quest gelöscht wird (PROJ-6)~~ → **ebenfalls aufgehoben (2026-09-21):** Wer hier löscht, löscht auch den zugehörigen Fortschritt mit. Das ist keine Erweiterung, sondern dieselbe Regel, die `/create` schon anwendet (`deleteQuest` + `deleteProgress`)
- Mehrfachauswahl / Löschen mehrerer Quests auf einmal (kein MVP-Bedarf bei 10–20 Quests)
- Undo / Papierkorb nach dem Löschen — die Bestätigung ist die einzige Sicherung, konsistent mit `/create`
- Unterscheidung zwischen importierten und selbst erstellten Quests beim Löschen (bewusst verworfen, siehe Decision Log)

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

**Reset (überarbeitet 2026-09-21 — der Einstieg wandert ins Aktionsmenü, das Verhalten bleibt):**
- [x] ~~Reset-Icon-Button direkt am Kartenrand der abgeschlossenen Karte~~ → Ersetzt durch den Eintrag „Zurücksetzen" im `⋮`-Aktionsmenü. Grund: Das Menü muss für „Löschen" ohnehin auf alle drei Kartenzustände (siehe Decision Log 2026-09-21); ein zusätzlicher loser Icon-Button daneben hätte zwei unbeschriftete Bedienelemente auf einer Karte ergeben, eines davon destruktiv
- [ ] Angenommen eine Quest ist vollständig abgeschlossen, wenn der Spieler im Aktionsmenü „Zurücksetzen" wählt, dann wird der gesamte gespeicherte Fortschritt dieser Quest (besuchte/abgeschlossene Stationen, gelöste Aufgaben) sofort gelöscht — ohne Bestätigungsdialog
- [ ] Angenommen eine Quest ist NICHT abgeschlossen (Status „Neu" oder „Live"), wenn der Spieler ihr Aktionsmenü öffnet, dann enthält es keinen „Zurücksetzen"-Eintrag — es gibt dort nichts zurückzusetzen bzw. der Fortschritt ist die laufende Partie
- [ ] Angenommen der Fortschritt wurde zurückgesetzt, wenn die Liste neu rendert, dann zeigt die Karte sofort das Badge "Neu" und ein Toast "Fortschritt zurückgesetzt" erscheint kurz
- [ ] Angenommen der Fortschritt wurde zurückgesetzt, wenn der Spieler die Quest erneut öffnet, dann startet sie wie beim allerersten Mal (Permission- bzw. Intro-Screen, je nach Browser-Permission-Status)
- [ ] Angenommen der Spieler tippt auf das Aktionsmenü einer Quest-Karte, wenn dies geschieht, dann öffnet sich nicht gleichzeitig die Quest selbst (Tap auf den Menü-Trigger löst nicht den Card-Link aus)

**Aktionsmenü auf der Quest-Karte (neu 2026-09-21):**
- [ ] Angenommen die Quest-Liste ist geöffnet, wenn eine Quest-Karte gerendert wird, dann trägt sie in jedem der drei Zustände („Neu", „Live", „Abgeschlossen") einen `⋮`-Menü-Trigger oben rechts mit dem zugänglichen Namen „Quest-Aktionen"
- [ ] Angenommen eine Quest-Karte wird gerendert, wenn der Spieler auf Titel oder Meta-Zeile tippt, dann öffnet sich weiterhin die Quest (`/play/[id]`) — der Menü-Trigger liegt außerhalb dieses Link-Bereichs
- [ ] Angenommen der Spieler öffnet das Aktionsmenü, wenn es erscheint, dann sind alle Einträge beschriftet (Text, nicht nur Icon) und der Menü-Trigger misst mindestens 44×44px
- [ ] Angenommen der Spieler öffnet das Aktionsmenü einer abgeschlossenen Quest, wenn es erscheint, dann enthält es „Zurücksetzen" und „Löschen"; bei „Neu"/„Live" nur „Löschen"

**Quest löschen (Play-Modus) — neu 2026-09-21:**
- [ ] Angenommen eine Quest-Karte ist sichtbar, wenn der Spieler im Aktionsmenü „Löschen" wählt, dann erscheint ein Bestätigungsdialog, der den Quest-Namen nennt und darauf hinweist, dass die Aktion endgültig ist
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Spieler bestätigt, dann wird die Quest aus `gq_quests` entfernt, ihr Fortschritt (`gq_progress_{questId}`) ebenfalls gelöscht, die Liste aktualisiert sich sofort und ein Toast „Quest gelöscht" erscheint
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Spieler abbricht oder ihn schließt, dann bleibt die Quest unverändert erhalten und es wird nichts gelöscht
- [ ] Angenommen eine Quest wird im Play-Modus gelöscht, wenn der Nutzer anschließend `/create` öffnet, dann ist sie auch dort verschwunden — es ist dieselbe Quest, nicht eine Play-Kopie davon
- [ ] Angenommen der Spieler löscht seine letzte verbliebene Quest, wenn die Liste neu rendert, dann erscheint der bestehende Empty State („Keine Quests geladen") inklusive Import-Button
- [ ] Angenommen ein Filter außer „Alle" ist aktiv und der Spieler löscht die letzte Quest dieses Filters, wenn die Liste neu rendert, dann bleibt der Filter aktiv und es erscheint der passende Filter-Empty-State (nicht der Gesamt-Empty-State)
- [ ] Der Bestätigungsdialog gilt unabhängig davon, ob die Quest importiert oder selbst erstellt wurde — es gibt keine Sonderbehandlung und keine zweite Warnstufe (siehe Decision Log)

## Edge Cases
1. **Quest mit nur 1 Station:** Abschluss der einzigen Station führt direkt zum Outro-Screen, kein Zwischenschritt über die Stationsliste.
2. **Reset einer Quest, die parallel in einem anderen Tab geöffnet ist:** Kein Live-Sync nötig (PRD schließt Multiplayer/Realtime aus) — beim nächsten Öffnen des Players in diesem Tab wird der zurückgesetzte Zustand geladen.
3. **Alle Quests haben Status "Neu":** Der "Live"-Filter zeigt den Empty State, "Alle" und "Neu" zeigen die volle Liste.
4. **Sehr viele Quests (z.B. 20):** Filter bleibt performant (rein clientseitiges Array-Filtern, keine Server-Anfrage).
5. **Sehr langer Outro-Text:** Verhält sich wie der Intro-Text — scrollbar, keine Kürzung.
6. **localStorage-Fortschritt korrupt oder gelöscht, während der Spieler auf dem Outro-Screen ist:** Gleiches Fallback-Verhalten wie in PROJ-3 (Fortschritt geht verloren, kein Crash).
7. **Quest hat 0 Stationen (sollte durch PROJ-2-Validierung nicht vorkommen):** Wird nicht separat behandelt — Datenmodell erzwingt mindestens 1 Station.
8. **Löschen einer selbst erstellten Quest aus dem Play-Modus (2026-09-21):** Die Quest ist danach auch im Creator weg — `/play` und `/create` lesen denselben `gq_quests`-Speicher, es gibt keine getrennte Play-Kopie. Bewusst so: siehe Decision Log. Der Bestätigungsdialog ist die Schutzmaßnahme, nicht eine Sonderregel für diesen Fall.
9. **Löschen einer Quest, die gerade läuft (Status „Live"):** Erlaubt, keine Sonderbehandlung — Quest und Fortschritt verschwinden gemeinsam. Der Spieler hat sie sichtbar vor sich und bestätigt den Dialog; es gibt keinen Zustand, in dem er „mitten drin" überrascht würde.
10. **Löschen einer Quest, die parallel in einem anderen Tab im Player geöffnet ist:** Wie Edge Case 2 — kein Cross-Tab-Sync (PRD schließt Realtime aus). Der andere Tab zeigt beim nächsten Laden/Speicherversuch verwaiste Daten bzw. eine nicht gefundene Quest. Identisch zum bestehenden Verhalten beim Löschen aus `/create` (PROJ-6, Edge Case 3).
11. **Löschen der letzten Quest bei aktivem Filter (2026-09-21):** Der Filter bleibt stehen. Ist danach die Gesamtliste leer, greift der bestehende Gesamt-Empty-State; sind nur die Treffer dieses Filters leer, der Filter-Empty-State. Beide existieren bereits, es kommt keine neue Leeransicht dazu.
12. **Sehr langer Quest-Name im Bestätigungsdialog:** Wie in `/create` — der Name steht im Dialogtext und bricht dort um; keine künstliche Kürzung nötig, der Dialog ist kein Platzproblem.
13. **HTML/Script im Quest-Namen im Bestätigungsdialog:** Wird wie überall sonst als Text gerendert (React-Escaping), unabhängig von der Import-Sanitization — dieselbe zweite Verteidigungslinie, die der PROJ-5-Security-Audit für die Quest-Karte bereits bestätigt hat.

## Technical Requirements
- Status-Ableitung ausschließlich aus vorhandenen `gq_progress_{questId}`-Daten (`visitedStations`, `completedStations`) — keine neuen Felder im Quest-Datenmodell nötig
- Reset löscht den kompletten `gq_progress_{questId}`-Eintrag aus localStorage
- Filterung und Sortierung der Quest-Liste rein clientseitig (kein Server, keine Persistenz des Filter-Zustands nötig)
- Konfetti-Effekt: bestehende Implementierung aus dem Ankunfts-Overlay (PROJ-3, `navigation-screen.tsx`) wiederverwenden
- Min. 44px Touch-Targets für den Menü-Trigger und jeden Menü-Eintrag (PRD-Anforderung)
- Löschen nutzt die bestehenden Funktionen `deleteQuest()` (quest-storage.ts) und `deleteProgress()` (quest-progress.ts) — beide sind gebaut, unit-getestet und werden von `/create` bereits genau so kombiniert aufgerufen. Keine neue Storage-Funktion
- Bestätigungsdialog über die bereits installierte shadcn-`AlertDialog`-Komponente, nach dem Muster von `src/app/create/page.tsx` — kein neues Package
- Aktionsmenü über die bereits installierte shadcn-`DropdownMenu`-Komponente, nach dem Muster von `quest-management-card.tsx` — kein neues Package
- **Strukturelle Voraussetzung:** Die Kartenzustände „Neu" und „Live" sind heute ein einziger, die ganze Karte umschließender `<Link>`. Ein Menü-Trigger kann dort nicht hinein (verschachtelte interaktive Elemente sind ungültiges HTML und der Tap kollidiert mit der Navigation). Beide Zustände werden deshalb auf dasselbe Muster umgebaut, das die „Abgeschlossen"-Karte bereits nutzt und das `quest-management-card.tsx` im Creator vorgibt: ein `<div>` als Karte, der Trigger absolut positioniert oben rechts, Titel und Meta-Zeile als `<Link>` darunter
- Der Play-Bereich läuft unter `data-theme="dark"` (`play/layout.tsx`). Radix portaliert `DropdownMenuContent` und `AlertDialogContent` nach `<body>` — beide brauchen das Theme explizit erneut gesetzt, sonst lösen die CSS-Variablen gegen den falschen Modus auf. Im Creator ist dafür `data-theme="light"` gesetzt; hier ist es der umgekehrte Fall, und das Detail ist bereits zweimal als Fehlerquelle dokumentiert (BUG-1-Falle `text-gq-grey`)

## Open Questions
- [ ] Soll der Creator (`/create`) den „Zurücksetzen"-Eintrag ebenfalls bekommen? Dort fehlt er heute — ein Ersteller, der seine Quest testet, muss zum Zurücksetzen nach `/play` wechseln. Nicht gemeldet, nicht Teil dieses Refinements, aber beim Umbau aufgefallen
- [ ] Bleibt „Zurücksetzen" dauerhaft nur auf abgeschlossenen Quests, oder wäre er auch bei „Live" sinnvoll (laufende Partie abbrechen und neu starten)? Heute ist das nicht möglich, war aber auch nie gefordert — das Kriterium hält bewusst den Ist-Zustand fest, statt still zu erweitern

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
| **Überholt (2026-09-21):** „Reset nur als Icon-Button auf der Quest-Karte" und „Abgeschlossene Karte zeigt Reset-Icon" — der Einstieg wandert ins `⋮`-Aktionsmenü | Das Menü kommt für „Löschen" ohnehin auf jede Karte. Ein loser Icon-Button daneben hätte zwei unbeschriftete Bedienelemente ergeben, eines davon destruktiv, auf einem Screen der draußen einhändig bedient wird. Das Reset-*Verhalten* (sofort, ohne Bestätigung, mit Toast) bleibt unverändert — nur der Weg dorthin kostet einen Tap mehr | 2026-09-21 |
| Quests sind ab sofort auch aus dem Play-Modus löschbar | Der ursprüngliche Ausschluss („Löschen gehört in die Quest-Verwaltung, PROJ-6") unterstellte, dass jeder `/play`-Nutzer auch den Creator benutzt. Für den Spieler, der eine fertige Quest-Datei bekommen hat, ist `/play` aber die ganze App — er hatte bisher keine Möglichkeit, eine gespielte Quest wieder loszuwerden | 2026-09-21 |
| Löschen wirkt uniform — keine Unterscheidung zwischen importierten und selbst erstellten Quests | Erwogen und verworfen: eine schärfere Warnung oder ein Ausblenden der Aktion bei selbst gebauten Quests. Beides bräuchte ein verlässliches Herkunfts-Merkmal, das das Datenmodell heute nicht hat (`published: true` wird beim Import gesetzt, ist aber ein für PROJ-9 reserviertes Feld, kein Herkunfts-Flag — es dafür zu überladen wäre eine zweite Wahrheit über denselben Sachverhalt). Dazu: eine Liste, in der manche Karten die Aktion haben und andere nicht, ist schwerer zu erklären als eine Regel, die immer gilt. Der Bestätigungsdialog trägt die Sicherung, wie die PRD es für destruktive Aktionen vorsieht | 2026-09-21 |
| Bestätigungsdialog beim Löschen (anders als beim Reset, der ohne auskommt) | Kein Widerspruch zur Entscheidung vom 2026-08-26, sondern ihre Begründung angewandt: Reset betrifft nur den eigenen Spielfortschritt und ist durch erneutes Spielen wiederherstellbar. Löschen entfernt die Quest-Daten selbst — bei einer selbst erstellten Quest ohne Sicherungsdatei unwiederbringlich | 2026-09-21 |
| Löschen entfernt Quest **und** Fortschritt gemeinsam | Identisch zu `/create`, wo `deleteQuest` und `deleteProgress` schon zusammen aufgerufen werden. Ein zurückbleibender Fortschritts-Eintrag wäre verwaister Speicher ohne Besitzer — und würde eine später erneut importierte Quest gleicher ID fälschlich als „schon gespielt" zeigen | 2026-09-21 |
| Kein Undo, kein Papierkorb, keine Mehrfachauswahl | Bei erwarteten 10–20 Quests ohne Nutzen; die Bestätigung ist die Sicherung. Konsistent mit `/create`, das seit PROJ-6 genau so funktioniert | 2026-09-21 |

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
| Alle drei Kartenzustände werden auf `<div>` + absolut positionierten Menü-Trigger + inneren `<Link>` umgebaut | „Neu" und „Live" sind heute ein die ganze Karte umschließender `<Link>`; ein Button darin ist ungültiges HTML und der Tap kollidiert mit der Navigation. Der Umbau folgt dem Muster, das die „Abgeschlossen"-Karte bereits nutzt und das `quest-management-card.tsx` im Creator vorgibt — statt zwei Kartenbauweisen im selben Screen | 2026-09-21 |
| Wiederverwendung von `DropdownMenu` und `AlertDialog` (shadcn, bereits installiert) statt eigener Umsetzung | Kein neues Package, und die `/create`-Seite liefert ein erprobtes Muster inklusive Tastaturbedienung und Fokus-Verhalten. Verworfen: Wischen zum Löschen — eine versteckte Geste ohne Hinweis auf dem Bildschirm, nirgends sonst in der App, und PROJ-4 (2026-09-20) hat gerade gezeigt, was handgebaute Touch-Gesten hier kosten | 2026-09-21 |
| Kein neuer State und keine neue Storage-Funktion — `deleteQuest()` + `deleteProgress()` + das bestehende `refreshQuests()` | Beide Funktionen sind gebaut und unit-getestet, `useQuests` hält die Liste bereits synchron. Eine eigene Lösch-Logik für Play wäre eine zweite Wahrheit über denselben Vorgang | 2026-09-21 |
| Portalierte Radix-Inhalte bekommen `data-theme="dark"` explizit gesetzt | `play/layout.tsx` setzt das Theme auf einem Container, Radix portaliert aber nach `<body>`. Ohne erneutes Setzen lösen die CSS-Variablen gegen den falschen Modus auf — im Creator ist derselbe Griff mit `light` bereits nötig und im Code kommentiert | 2026-09-21 |

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

**Deployed:** 2026-08-27
**Production URL:** https://geoquesty.vercel.app
**Commit:** 49e58c8
**Tag:** v1.5.0-PROJ-5
**Verifiziert:** Alle Kern-Routen (`/`, `/play`, `/create`) antworten mit HTTP 200. Der `/play`-HTML-Response enthält die neue PROJ-5-Headline (`clamp(1.8rem,8vw,2.4rem)`), bestätigt dass der neue Build live ist. Bekannte, dokumentierte Bugs (BUG-1 Outro-Medien-Placeholder, BUG-2 Filter-Tab-Tastaturnavigation) werden bewusst mit deployed und später nachgezogen — auf ausdrücklichen Wunsch des Nutzers.

---

## Refinement 2026-09-21: Quests im Play-Modus löschen

### Anlass
Betreiber-Wunsch: *„der user soll die Möglichkeit bekommen im play mode quests zu löschen"*. Bisher war Löschen ausschließlich im Creator möglich (`/create`, PROJ-6) — diese Spec schloss es in ihrem Out-of-Scope-Abschnitt ausdrücklich aus.

**Warum der ursprüngliche Ausschluss nicht mehr trägt:** Er lautete „Löschen der Quest selbst aus der Liste (Quest-Verwaltung — PROJ-6)" und setzte voraus, dass jeder, der `/play` benutzt, auch den Creator kennt. Für die Hälfte der Zielgruppe stimmt das nicht: Wer eine fertige Quest-Datei bekommen und importiert hat, sieht `/play` als die gesamte App. Er konnte eine gespielte Quest bisher nicht wieder loswerden.

### Gemessener Ausgangszustand
| | heute |
|---|---|
| Löschen auf `/play` | nicht vorhanden |
| Löschen auf `/create` | vorhanden, mit `AlertDialog`, ruft `deleteQuest` + `deleteProgress` |
| Karte „Neu" | ein einziger `<Link>` um die ganze Karte |
| Karte „Live" | ein einziger `<Link>` um die ganze Karte |
| Karte „Abgeschlossen" | `<div>`, Reset-Button außerhalb des `<Link>` |
| Bedienelemente auf einer Play-Karte | max. 1 (Reset, nur bei „Abgeschlossen") |

### Die strukturelle Hürde
Zwei der drei Kartenzustände sind ein die ganze Karte umschließender `<Link>`. Ein Menü-Trigger oder Button lässt sich dort nicht hineinlegen: verschachtelte interaktive Elemente sind ungültiges HTML, und der Tap würde mit der Navigation kollidieren. Löschen einzubauen heißt deshalb zwangsläufig, die Kartenbauweise zu vereinheitlichen — das ist kein Zusatzaufwand, den dieses Refinement sich nimmt, sondern die Bedingung dafür, dass es überhaupt geht.

Die „Abgeschlossen"-Karte zeigt bereits, wie es aussieht, und `quest-management-card.tsx` im Creator zeigt es mit Menü. Beide Vorlagen existieren.

### Entschieden
- **`⋮`-Aktionsmenü auf allen drei Kartenzuständen**, oben rechts, außerhalb des Link-Bereichs — dasselbe Muster wie im Creator
- **„Zurücksetzen" wandert in dieses Menü** (nur bei abgeschlossenen Quests sichtbar); sein Verhalten bleibt unverändert: sofort, ohne Bestätigung, mit Toast
- **„Löschen" mit Bestätigungsdialog**, uniform für importierte und selbst erstellte Quests
- **Quest und Fortschritt werden gemeinsam gelöscht**, wie auf `/create`

### Erwogen und verworfen
| Alternative | Warum nicht |
|---|---|
| Nacktes Löschen-Icon neben dem Reset-Button | „Neu" und „Live" bräuchten trotzdem je eine neue Kopfzeile — der Umbau fällt also ohnehin an. Ergebnis wären zwei unbeschriftete Icons auf einer Karte, eines davon endgültig löschend, auf einem Screen der draußen einhändig bedient wird |
| Wischen zum Löschen | Versteckte Geste ohne jeden Hinweis auf dem Bildschirm, nirgends sonst in der App vorhanden. PROJ-4 (2026-09-20) hat gerade gezeigt, was handgebaute Touch-Gesten hier kosten |
| Nur importierte Quests löschbar | Bräuchte ein Herkunfts-Merkmal, das das Datenmodell nicht hat. Dazu: eine Liste, in der manche Karten die Aktion tragen und andere nicht, ist schwerer zu erklären als eine Regel, die immer gilt |
| Zweite Warnstufe für selbst erstellte Quests | Gleiche fehlende Datengrundlage. `published: true` wird beim Import gesetzt, ist aber für PROJ-9 reserviert — es als Herkunfts-Flag zu überladen wäre eine zweite Wahrheit über denselben Sachverhalt |
| Reset bleibt als Icon auf der Karte, Menü enthält nur „Löschen" | Vom Betreiber verworfen (Variante A1 gewählt). Hätte ein live getestetes Verhalten unangetastet gelassen, dafür aber dauerhaft zwei Bedienmuster auf derselben Karte |

### Für `/frontend` zu beachten

**Fünf bestehende Tests werden absichtlich falsch** — sie sind zu **ziehen, nicht zu löschen**. Alle in `tests/proj-5-player-fortschritt-abschluss.spec.ts`, alle auf `getByRole("button", { name: "Quest zurücksetzen" })`:

| Zeile | Was der Test prüft | Was daraus wird |
|---|---|---|
| 230 | Reset-Button ist sichtbar | Menü-Trigger sichtbar, Eintrag „Zurücksetzen" im geöffneten Menü |
| 306 | Klick setzt zurück | Menü öffnen, dann „Zurücksetzen" wählen |
| 311 | Button verschwindet nach Reset | Eintrag ist nach dem Reset nicht mehr im Menü (Karte ist „Neu") |
| 322 | Toast erscheint | wie 306, Assertion unverändert |
| 333 | Klick löst nicht den Card-Link aus | gilt jetzt für den Menü-Trigger |

**Der eigentliche Regressionswächter fehlt bisher ganz:** Kein Test hält fest, dass ein Tap auf ein Bedienelement der Karte nicht gleichzeitig in die Quest navigiert — Kriterium existiert (Zeile 333), aber nur für den Reset-Button auf der „Abgeschlossen"-Karte. Für „Neu" und „Live" gab es dort nie ein Bedienelement, also auch nie einen Test. Genau diese beiden Zustände werden jetzt umgebaut.

**Weiter zu beachten:**
- Der Theme-Griff: `play/layout.tsx` setzt `data-theme="dark"` auf einem Container, Radix portaliert nach `<body>`. `DropdownMenuContent` und `AlertDialogContent` brauchen das Theme explizit — im Creator steht der umgekehrte Fall (`light`) bereits kommentiert im Code
- Die Bestätigungsdialog-Formulierung aus `/create` übernehmen statt neu zu erfinden — derselbe Vorgang, dieselbe Sprache
- Kein neues Package: `DropdownMenu`, `AlertDialog`, `deleteQuest`, `deleteProgress` sind alle vorhanden und getestet

### Frontend umgesetzt am 2026-09-21

**Zwei Produktivdateien**, kein neues Paket, keine neue Komponente, keine neue Route: `src/components/quest-card.tsx` (alle drei Kartenzustände auf `<div>` + Menü-Trigger + inneren `<Link>` umgebaut, neue interne `QuestCardMenu`) und `src/app/play/page.tsx` (Lösch-Handler, Bestätigungsdialog).

**Der Umbau war größer als die Spec ihn beziffert hat — und zwar in den Tests.** Die Spec nannte fünf bestehende Tests (alle auf den Reset-Button). Es sind **neun**: Vier weitere adressieren die Karte über `getByRole("link", { name: ... })`, was seit dem Umbau nicht mehr greift, weil die Karte selbst kein Link mehr ist. Aufgefallen ist das nur, weil ich vor dem Umbau alle `link`-Selektoren der Datei durchgesehen habe, nicht nur die aus der Spec. Andere Testdateien sind nicht betroffen (geprüft).

Die gezogenen Selektoren zielen jetzt auf das `listitem` statt auf den Link — das ist der stabile Anker, unabhängig davon, wie die Karte innen gebaut ist. Zwei neue Helfer (`questCard`, `openQuestMenu`) halten das an einer Stelle.

**Eine sichtbare Folge, die keine Messung gezeigt hätte:** Das Badge („Neu", „Live") stand bisher rechtsbündig — dort sitzt jetzt der Menü-Trigger. Es rückt nach links. Die Nutzerentscheidung aus der PROJ-5-Review vom 2026-08-26 lautete „Badge in eigener Zeile über dem Titel, bei allen drei Varianten identisch"; die eigene Zeile und die Einheitlichkeit bleiben erhalten, nur die Ausrichtung wechselt. Die Titel behalten `pr-11`, damit sie nicht unter den Trigger laufen.

**Gemessen statt behauptet (beide Engines, 390×844):**

| | Ergebnis |
|---|---|
| Menü-Trigger auf allen drei Zuständen | vorhanden, 44×44px |
| „Zurücksetzen" im Menü | nur bei „Abgeschlossen" |
| Tap auf Trigger navigiert | nein, URL bleibt `/play` |
| Kartentitel führt in die Quest | ja |
| Dialog nennt Quest-Name + Endgültigkeit | ja |
| Quest + Fortschritt nach Bestätigen | beide entfernt, Nachbar-Quests unberührt |
| Abbrechen | Quest und Fortschritt unverändert |
| Gelöscht im Play → im Creator | ebenfalls weg |

**Am Bildschirm abgenommen, nicht nur gemessen** — bei einer sichtbaren Änderung reichen Zahlen nicht. Beide Engines, Liste + geöffnetes Menü + Dialog: Menü und Dialog rendern im Dark Theme, der `data-theme="dark"`-Griff auf den portalierten Radix-Inhalten greift also wirklich. Ohne ihn wären beide hell auf hell.

**Testabdeckung:** 14 neue Tests in `tests/proj-5-quest-loeschen-play.spec.ts` (je Engine, also 28 Läufe), darunter der Wächter, der bisher ganz fehlte: dass ein Tap auf den Menü-Trigger nicht gleichzeitig in die Quest navigiert — geprüft für **alle drei** Zustände, nicht nur für „Abgeschlossen", wie es das alte Kriterium tat.

**Per Gegenprobe geschärft.** Mit dem echten Vorgängerstand aus `HEAD` (nicht mit verstellten Parametern der neuen Fassung) fallen **11 von 13** neuen Tests plus die gezogenen Bestandstests. Der Playwright-Snapshot belegt die Ursache direkt: Die Live-Karte ist dort ein einziger `link` mit dem gesamten Karteninhalt und trägt keinen `button "Quest-Aktionen"`. Die **2 neuen Tests, die auch beim Vorgängerstand bestehen, sind die richtigen** — Kartentitel-Link und Markup-Escaping funktionierten schon vorher; sie sind Wächter gegen Kollateralschaden, keine Belege für das Feature. Produktcode danach per `diff` als byte-identisch bestätigt.

**Beobachtung ohne Bug-Status:** Der Bestätigen-Button im Dialog ist **Teal** (`AlertDialogAction` nutzt die Default-Variante `bg-primary`), also dieselbe Farbe wie jeder harmlose CTA der App — obwohl er endgültig löscht. Das ist **vorbestehend aus PROJ-6**: `/create` sieht identisch aus, beide Dialoge teilen sich die Komponente. Bewusst nicht mitgeändert — es wäre eine Abweichung von einem live getesteten Bestandsmuster, die niemand angefordert hat, und der Menü-Eintrag trägt die Warnfarbe bereits. Wäre ein eigenes Refinement über beide Screens wert.

**Über die Spec hinaus geprüft: die Tastaturbedienung** — bei einem neuen Menü plus destruktivem Dialog die naheliegende Frage, in der Spec aber nicht gefordert. Sie funktioniert vollständig, und der wichtigste Teil ist erfreulicher als erwartet: **Der Dialog startet mit dem Fokus auf „Abbrechen“, nicht auf „Löschen“** — ein versehentliches Enter löscht also nichts. Als 14. Test festgehalten, damit es so bleibt.

**Suiten gegen den Production-Build:** Unit **271/271**. E2E über beide Engines **1083 passed / 55 skipped / 0 failed / 0 flaky**. Die beiden PROJ-5-Dateien einzeln **60/60** (inkl. des nachgezogenen Tastatur-Tests). Build und Lint sauber (0 Fehler, 7 vorbestehende Warnungen, keine in geänderten Dateien). `npx tsc --noEmit` meldet nur die 2 vorbestehenden Fehler in `quest-storage.test.ts` (PROJ-6, hier nicht angefasst).

**Nicht abgedeckt:** ob sich der Extra-Tap für „Zurücksetzen" am echten Gerät schlechter anfühlt als der bisherige Direkt-Button (Geschmacksfrage, nur am Handy zu beantworten), und Firefox (Binary fehlt, projektweit dokumentiert).

### Nicht abgedeckt
- Ob sich das Extra-Tap für den Reset am echten Gerät schlechter anfühlt als der bisherige Direkt-Button — eine Geschmacksfrage, die nur der Betreiber am Handy beantworten kann
- Der Creator bekommt weiterhin keinen „Zurücksetzen"-Eintrag (als Open Question vermerkt, bewusst nicht in den Scope gezogen)


---

## QA Test Results — Refinement „Quests im Play-Modus löschen"

**Tested:** 2026-09-21
**App:** Production-Build auf http://localhost:3100
**Engines:** Desktop Chrome 152 + Mobile Safari (WebKit)

Weil das Feature in derselben Sitzung gebaut wurde, habe ich die zentralen Behauptungen **nicht übernommen, sondern mit eigenen Sonden neu gemessen** — auf **6 Viewports statt einem** (320×568 bis 1440×900), auf beiden Engines, und um Prüfungen erweitert, die die Frontend-Phase nicht anstellte: einen **Hit-Test** (ist der Trigger wirklich das oberste Element an seiner Position?), Kontrastmessung, korrupte Storage-Daten und Doppelklick.

**Genau dieser Hit-Test hat den Befund gebracht, den die Frontend-Phase nicht hatte.**

### Acceptance Criteria

**Aktionsmenü (4/4 erfüllt)** — Trigger auf allen drei Kartenzuständen vorhanden und überall **44×44px**; Kartentitel führt weiterhin in die Quest; alle Menü-Einträge beschriftet; „Zurücksetzen" erscheint nur bei abgeschlossenen Quests, bei „Neu"/„Live" **0 Treffer**.

**Reset (5/5 erfüllt)** — Verhalten unverändert: sofort, ohne Bestätigung, mit Toast; nach dem Reset verschwindet der Eintrag aus dem Menü, weil die Karte „Neu" wird.

**Quest löschen (7/7 erfüllt)**, auf beiden Engines identisch gemessen:

| Kriterium | Ergebnis |
|---|---|
| Dialog nennt Quest-Name + Endgültigkeit | beides vorhanden |
| Bestätigen entfernt Quest **und** Fortschritt | `gq_quests` 3→2, `gq_progress` der Quest `null` |
| Nachbar-Quests unberührt | Fortschritt der anderen Quest erhalten |
| Abbrechen | Dialog zu, Karte da, Speicher unverändert (3) |
| Im Play gelöscht → im Creator weg | bestätigt, andere Quest dort noch sichtbar |
| Letzte Quest → Gesamt-Empty-State | „Keine Quests geladen" + Import-Button sichtbar |
| Aktiver Filter → Filter-Empty-State | „Keine aktiven Quests", Gesamt-Empty **nicht** gezeigt, Tab bleibt `aria-selected=true` |

**Gesamt: 16 von 17 Acceptance Criteria erfüllt.** Das 17. (Trigger auf allen drei Zuständen) ist funktional erfüllt, aber durch BUG-15 in einer häufigen Konstellation nicht bedienbar.

### BUG-15 (Medium, neu): Der Import-FAB verdeckt den Menü-Trigger der untersten Karte

**Der FAB liegt fast deckungsgleich über dem neuen Trigger.** Gemessen auf 360×640 mit 4 Quests:

| Element | x | y |
|---|---|---|
| Menü-Trigger „Quest 4" | 287–331 | 567–611 |
| Import-FAB | 292–340 | 568–616 |

Ein Hit-Test auf die Trigger-Mitte liefert **„Quest importieren"** statt „Quest-Aktionen"; ein Klickversuch scheitert mit Playwrights „subtree intercepts pointer events". **Am Bildschirm bestätigt:** Bei der untersten Karte steht der `+`-FAB genau dort, wo die anderen Karten ihren `⋮` zeigen.

**Reichweite gemessen — 72 Kombinationen** (2 Engines × 6 Viewports × 1–6 Quests): Betroffen sind **320×568 und 360×640 ab 4 Quests**, auf **beiden Engines**. Ab 390px Breite tritt es nicht auf.

**Es ist ein Regress dieses Refinements, nicht vorbestehend** — gegen `0b55b8f~1` gegengeprüft: Dort lag der Reset-Button bei 4 Quests auf **y 644**, also **außerhalb des 640px-Bildschirms**, und konnte gar nicht verdeckt werden. Erst 3 Quests brachten ihn ins Bild, und dort gab es keine Kollision. Die neue Karte ist höher (Badge-Zeile plus Titel), wodurch der Trigger der vierten Karte genau in die FAB-Zone rückt.

**Nicht blockierend, aber echt:** Scrollen löst es — nach 42px ist der Trigger frei und der Klick geht durch (gemessen). Der Nutzer sieht jedoch keinen Hinweis darauf; für ihn ist die unterste Quest schlicht nicht löschbar. Betroffen sind die zwei kleinsten Referenz-Viewports, und 360×640 ist der Viewport, den das Projekt an mehreren Stellen als Maßstab nennt.

**Naheliegende Lösungen** (nicht Teil der QA): der Liste unteren Freiraum geben, solange der FAB steht — dasselbe Muster, das `play/page.tsx` für den Installations-Hinweis bereits anwendet (`installHintVisible ? pb-... : pb-4`).

### Security-Audit — ohne Befund

- **XSS über den Quest-Namen:** `<img src=x onerror=...>` und `<script>` im Namen landen als **escapter Text** im Dialog — 0 injizierte `img`-Elemente, 0 `script`-Tags im Dialog, `window.__pwn` bleibt `null`, 0 Browser-Dialoge.
- **Überlanger Name (300 Zeichen):** kein horizontaler Overflow (0px), Dialog bleibt 390px breit, **beide Buttons sichtbar und im Bild**.
- **Korrupte `gq_quests`-Daten** in sechs Varianten (`null`, Objekt statt Array, Quest ohne Felder, kein JSON, `stations: null`): **0 `pageerror`**, Seite durchgehend bedienbar.
- **Doppelklick auf „Löschen":** entfernt genau **eine** Quest, nicht zwei.

### Kontrast (gemessen, nicht geschätzt)

Dialog-Titel **19.40:1**, Dialog-Text **8.02:1** — beide weit über der 4.5:1-Vorgabe des PRD. Der Menü-Inhalt trägt `data-theme="dark"` explizit; ohne diesen Griff wäre er hell auf hell (die BUG-1-Falle des Projekts).

### Über die Spec hinaus geprüft

Tastaturbedienung (Menü per Enter, Pfeiltasten, Dialog per Escape) — funktioniert; **der Dialog startet mit Fokus auf „Abbrechen"**, ein versehentliches Enter löscht also nichts. Dazu Hit-Tests statt bloßer `toBeVisible()`-Prüfungen, sechs Viewports und der horizontale Overflow (0px auf allen).

### Neue Tests

4 zusätzliche Tests in `tests/proj-5-quest-loeschen-play.spec.ts` (PROJ-5-Löschen-Suite jetzt **18 je Engine**): der **BUG-15-Wächter** als `test.fail` (er wird grün, sobald der Fehler behoben ist, und schlägt an, falls er unbemerkt wiederkehrt), der Scroll-Umweg als Beleg, dass es ein Verdeckungs- und kein Funktionsproblem ist, sowie korrupte Storage-Daten und Doppelklick.

**Regression:** Unit **271/271**. E2E über beide Engines **1092 passed / 55 skipped / 1 unexpected / 0 flaky**. Der Fehlschlag liegt in `proj-12-sw-nur-production.spec.ts`, das dieses Refinement nicht anfässt, und läuft **3× seriell grün** — die in diesem Projekt dokumentierte Service-Worker-Flakiness, kein Regress. Build und Lint sauber. Produktcode nach allen Gegenproben per `git diff` als **byte-identisch** zum Commit bestätigt.

### Produktionsreife

**Keine Critical- oder High-Bugs.** BUG-15 ist Medium: kein Datenverlust, kein Sicherheitsproblem, mit Scrollen umgehbar — aber auf dem Referenz-Viewport reproduzierbar und ein Regress dieses Refinements. Die Entscheidung, ob er vor dem Deploy behoben wird, liegt beim Betreiber.
