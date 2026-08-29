# PROJ-10: Creator — Vorschau / Testmodus

## Status: Verworfen
**Created:** 2026-08-29
**Last Updated:** 2026-08-29
**Verworfen am:** 2026-08-29

> **Dieses Feature wurde nach vollständiger Frontend-Implementierung (inkl. zweier Bugfix-Runden) bewusst wieder aus dem MVP-Scope entfernt.** Der gesamte zugehörige Code wurde per `git reset` rückgängig gemacht — es existiert kein PROJ-10-Code mehr im Repository. Diese Spec-Datei bleibt ausschließlich als Dokumentation erhalten (Anforderungen, Architektur-Entscheidungen, aufgetretene Probleme), falls das Feature später erneut aufgegriffen wird. Siehe **Decision Log → Product Decisions** (Eintrag 2026-08-29, "Verworfen") für die Begründung. `features/INDEX.md` und `docs/PRD.md` führen PROJ-10 nicht mehr im aktiven Workflow.

## Dependencies
- Requires: PROJ-4 (Player — Modul-Rendering) — der Testlauf rendert dieselben Stations-Module wie der echte Player
- Requires: PROJ-5 (Player — Fortschritt & Abschluss) — der Testlauf nutzt denselben Outro-Screen und dieselbe Fortschritts-Logik (Status-Ableitung), nur auf einem getrennten Speicher-Key
- Requires: PROJ-8 (Creator — Modul-Editor) — der Testlauf testet exakt die dort angelegten Module
- Beeinflusst: keine bestehenden Features werden verändert — reine Ergänzung um einen neuen, gekapselten Testmodus-Pfad

## Summary
Der Testmodus erlaubt es dem Ersteller, die eigene Quest direkt aus der Stationsliste (`/create/[id]`) heraus zu spielen — mit dem echten Player-Erlebnis (Kompass, Module, Aufgaben, Outro), aber ohne tatsächlich zu den Stationen laufen zu müssen. Ein deutlich sichtbarer "Ankunft simulieren"-Button auf dem Navigation-Screen ersetzt den Zwang zur echten GPS-Ankunft. Der Testlauf läuft auf einer eigenen Route (`/create/[id]/test`) mit komplett getrenntem Fortschritts-Speicher, sodass er weder den echten Spieler-Fortschritt überschreibt noch Testdurchläufe sich ansammeln — jedes Verlassen des Testmodus (ob durch vollständiges Durchspielen oder Abbruch) setzt den Test-Fortschritt automatisch zurück.

## User Stories
1. Als Ersteller möchte ich meine Quest direkt aus der Stationsliste heraus testen können, damit ich Inhalte und Rätsel prüfen kann, ohne zu exportieren oder das Tool zu verlassen.
2. Als Ersteller möchte ich eine Station als "erreicht" simulieren können, damit ich nicht physisch zu jeder Station laufen/fahren muss, um sie zu testen.
3. Als Ersteller möchte ich trotzdem den echten Navigation-Screen (Kompass, Distanz) sehen, damit ich auch diesen Teil des Spielerlebnisses optisch prüfen kann, falls GPS verfügbar ist.
4. Als Ersteller möchte ich jederzeit sichtbar erkennen, dass ich mich im Testmodus befinde, damit ich nicht versehentlich denke, echten Spielfortschritt zu erzeugen.
5. Als Ersteller möchte ich den Testmodus jederzeit sofort verlassen können, damit ich schnell zurück zur Bearbeitung springen kann.
6. Als Ersteller möchte ich auch eine unvollständige Quest testen können, damit ich frühzeitig sehen kann, wie sich fertige Teile bereits im Player anfühlen.

## Out of Scope
- Testen einer bereits exportierten JSON-Datei (Re-Import zum Testen) — der Testmodus nutzt immer den aktuellen Entwurfsstand aus `gq_quests`, kein separater Datei-Upload-Flow
- Zweiter Einstiegspunkt für den Testmodus nach dem JSON-Export (PROJ-9) — nur ein Einstiegspunkt: Button auf `/create/[id]`
- Persistenter/wiederaufnehmbarer Test-Fortschritt über mehrere Testläufe hinweg — jeder Testlauf startet garantiert bei 0, kein "Testlauf fortsetzen"
- Eigener "Testlauf zurücksetzen"-Button — entfällt, da jedes Verlassen automatisch zurücksetzt (siehe Decision Log)
- Bearbeiten von Inhalten direkt aus dem Testmodus heraus (z.B. Inline-Fix eines Tippfehlers während des Testens) — Ersteller muss dafür den Testmodus verlassen und in den Editor zurückkehren
- Automatisches Ausblenden/Deaktivieren des "Testen"-Buttons bei unvollständiger Quest (bewusst immer aktiv, siehe Decision Log)
- Simulation unterschiedlicher Endgeräte/Bildschirmgrößen (Testmodus läuft im selben Browser-Viewport wie der Creator selbst)
- Analytics/Tracking von Testläufen

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Einstieg in den Testmodus:**
- [ ] Angenommen der Ersteller ist auf `/create/[id]` (Stationsliste), wenn die Seite lädt, dann ist ein "Testen"-Button sichtbar und aktiv — unabhängig vom Vollständigkeitsstatus der Quest
- [ ] Angenommen der Ersteller tippt auf "Testen", wenn die Quest mindestens 1 Station hat, dann navigiert er zu `/create/[id]/test` und der Testlauf startet beim Permission-Screen (analog zum echten Player)
- [ ] Angenommen die Quest hat 0 Stationen, wenn der Ersteller auf "Testen" tippt, dann erscheint ein Hinweis ("Füge zuerst eine Station hinzu") statt den Testmodus zu starten

**Test-Banner:**
- [ ] Angenommen der Testmodus ist aktiv, wenn irgendein Screen des Testlaufs angezeigt wird (Intro, Stationsliste, Navigation, Module, Outro), dann ist ein permanentes "TESTMODUS"-Banner mit "Beenden"-Button sichtbar
- [ ] Angenommen das Test-Banner ist sichtbar, wenn der Ersteller auf "Beenden" tippt, dann wird der Test-Fortschritt sofort gelöscht und er kehrt zu `/create/[id]` zurück

**Navigation & simulierte Ankunft:**
- [ ] Angenommen der Testlauf zeigt den Navigation-Screen einer Station, wenn dieser gerendert wird, dann ist zusätzlich zum normalen Kompass/Distanz-Inhalt ein deutlich sichtbarer "Ankunft simulieren"-Button vorhanden
- [ ] Angenommen der Ersteller tippt auf "Ankunft simulieren", wenn dies geschieht, dann wird exakt der gleiche Ankunfts-Flow ausgelöst wie bei echter GPS-Ankunft (Ankunfts-Overlay mit Konfetti, danach Modul-Screen) — unabhängig vom aktuellen GPS-Signal/-Abstand
- [ ] Angenommen eine Station hat keine gültige Position (lat/lng fehlt), wenn der Ersteller sie im Testlauf antippt, dann wird sie direkt als angekommen behandelt (Navigation-Screen wird übersprungen, da keine Distanz berechenbar ist)
- [ ] Angenommen echtes GPS ist verfügbar und der Ersteller ist tatsächlich in der Nähe der Station, wenn dies erkannt wird, dann funktioniert die echte GPS-Ankunftserkennung weiterhin normal (paralleler Pfad zum Simulieren-Button, kein Widerspruch)

**Module & Aufgaben im Testlauf:**
- [ ] Angenommen der Testlauf zeigt den Modul-Screen einer Station, wenn dies geschieht, dann werden exakt dieselben Modul-Komponenten wie im echten Player gerendert (Text/Bild/Audio/Video/Tasks), inklusive Task-Lösen-Logik
- [ ] Angenommen ein Modul ist unvollständig (z.B. Bild ohne URL), wenn es im Testlauf gerendert wird, dann verhält es sich identisch zum echten Player (z.B. Bild-Placeholder), kein Sonderverhalten für den Testmodus

**Fortschritts-Isolation:**
- [ ] Angenommen der Ersteller spielt eine Quest im Testmodus, wenn er dabei Stationen besucht/abschließt, dann wird dieser Fortschritt unter einem eigenen Schlüssel (getrennt von `gq_progress_{questId}`) gespeichert
- [ ] Angenommen ein echter Spieler hat bereits Fortschritt für dieselbe Quest gespeichert, wenn der Ersteller einen Testlauf startet und durchspielt, dann bleibt der echte Spieler-Fortschritt danach unverändert
- [ ] Angenommen ein Testlauf wurde begonnen, wenn der Ersteller die Seite während des Testlaufs neu lädt, dann bleibt der Testfortschritt für diese Sitzung erhalten (kein Datenverlust bei Reload, wie beim echten Player)

**Test-Ende (Outro):**
- [ ] Angenommen der Ersteller hat im Testlauf die letzte Station abgeschlossen, wenn dies geschieht, dann erscheint der gleiche Outro-Screen wie im echten Player (Konfetti, "X von X Stationen abgeschlossen")
- [ ] Angenommen der Outro-Screen im Testlauf ist sichtbar, wenn der Ersteller auf "Fertig" tippt, dann wird der Test-Fortschritt gelöscht und er kehrt zu `/create/[id]` zurück (nicht zu `/play`)

## Edge Cases
1. **Quest ohne Stationen:** "Testen"-Button zeigt einen Hinweis statt zu navigieren (kein leerer/kaputter Testlauf).
2. **Station ohne gültige Position (lat/lng fehlt):** Wird im Testlauf direkt als angekommen behandelt, kein Navigation-Screen möglich ohne Koordinaten (Navigation-Screen kann ohne Zielposition keine Distanz/Richtung berechnen).
3. **Unvollständige Module (fehlender Inhalt, keine korrekte Antwort markiert):** Verhalten identisch zum echten Player aus PROJ-4 — kein Sonderfall für den Testmodus, Ersteller sieht direkt wie es sich für einen echten Spieler anfühlen würde.
4. **Ersteller bricht Testlauf mitten in der Navigation oder auf dem Modul-Screen ab (Banner "Beenden"):** Test-Fortschritt wird sofort gelöscht, unabhängig davon wie weit der Testlauf fortgeschritten war.
5. **Ersteller startet direkt danach einen zweiten Testlauf:** Beginnt garantiert wieder bei 0 (Permission-Screen), da der vorherige Test-Fortschritt beim Verlassen bereits gelöscht wurde.
6. **Echtes GPS ist während des Testlaufs verfügbar und der Ersteller befindet sich zufällig tatsächlich in der Nähe einer Station:** Echte Ankunftserkennung greift normal (kein Konflikt mit dem Simulieren-Button — beide Pfade führen zum selben `onArrived`-Handler).
7. **Browser-Tab wird während eines Testlaufs geschlossen (kein expliziter "Beenden"-Klick):** Test-Fortschritt bleibt unter seinem eigenen Schlüssel bestehen (kein Cleanup-Mechanismus beim Schließen möglich) — wird beim nächsten Start eines neuen Testlaufs für dieselbe Quest automatisch überschrieben, da jeder neue Testlauf-Start den alten Schlüssel zurücksetzt.
8. **Testmodus auf Desktop ohne GPS/Kompass-Hardware:** Funktioniert vollständig — genau das ist der Kernzweck des Simulieren-Buttons; Kompass-Pfeil zeigt ggf. keine Richtung (bestehender Fallback-Hinweistext aus PROJ-3), blockiert aber nicht das Simulieren.

## Technical Requirements
- Neue Route `/create/[id]/test/page.tsx`, rendert den bestehenden `QuestPlayer` mit einer neuen `testMode`-Prop
- Getrennter localStorage-Schlüssel für Test-Fortschritt, z.B. `gq_test_progress_{questId}` — nutzt dieselbe Datenstruktur wie `gq_progress_{questId}` (`visitedStations`, `completedStations`, `solvedTasks`, `currentScreen`)
- Beim Start eines neuen Testlaufs: bestehender Eintrag unter dem Test-Schlüssel wird zunächst gelöscht (garantiert Neustart bei 0)
- Beim Verlassen des Testmodus (Banner "Beenden" ODER Outro "Fertig"): Test-Schlüssel wird gelöscht
- `NavigationScreen` erhält einen optionalen `onSimulateArrival`-Callback bzw. eine `testMode`-Prop, um den "Ankunft simulieren"-Button bedingt zu rendern, ohne den bestehenden Player-Pfad zu verändern
- Test-Banner als schmale, fixierte Leiste (analog zu bestehenden Overlay-Mustern), rendert oberhalb des jeweiligen Screens, min. 44px Touch-Target für den "Beenden"-Button
- Stationen ohne `lat`/`lng` werden im Testmodus wie eine sofortige Ankunft behandelt — Prüfung vor dem Rendern des `NavigationScreen`
- Min. 16px Body-Text, WCAG AA Kontrast (PRD-Anforderung), auch für das neue Banner

## Open Questions
_Keine offenen Fragen._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Simulierte Ankunft statt Skip der GPS-Navigation | Ersteller soll den Navigation-Screen (Kompass, Distanzoptik) trotzdem sehen und prüfen können — nur der Zwang zur echten Bewegung entfällt | 2026-08-29 |
| Einstiegspunkt nur auf der Stationsliste (`/create/[id]`), nicht zusätzlich nach dem Export | Ein einziger, klarer Einstiegspunkt hält den Flow einfach; Testen ist ein Werkzeug während der Bearbeitung, nicht Teil des Export-Vorgangs | 2026-08-29 |
| Komplett getrennter Test-Fortschritts-Speicher (`gq_test_progress_{questId}`) | Verhindert, dass der Ersteller versehentlich seinen eigenen echten Spielfortschritt (oder den eines Testers, der dieselbe Quest bereits spielt) überschreibt | 2026-08-29 |
| "Testen"-Button immer aktiv, auch bei unvollständiger Quest | Ersteller soll frühzeitig und iterativ testen können, nicht erst wenn alles fertig ist — passt zum bereits etablierten Entwurfsprinzip aus PROJ-6/7/8 (Speichern trotz Unvollständigkeit ist erlaubt) | 2026-08-29 |
| Jedes Verlassen des Testmodus (Abbruch über Banner ODER vollständiges Durchspielen) setzt den Test-Fortschritt automatisch zurück | Vermeidet Verwirrung durch sich ansammelnde alte Testdurchläufe; kein zusätzlicher "Zurücksetzen"-Button nötig, ein Testlauf ist immer eine frische, in sich abgeschlossene Sitzung | 2026-08-29 |
| Permanentes "TESTMODUS"-Banner mit Beenden-Button auf jedem Screen | Ersteller muss jederzeit erkennen können, dass er sich im Testmodus befindet (nicht im echten Play-Modus), und jederzeit sofort aussteigen können | 2026-08-29 |
| Testlauf startet beim Permission-Screen (nicht direkt beim Intro) | Realistischster Test des tatsächlichen Spieler-Erlebnisses von Anfang an; die Permission-Anfrage selbst ist Teil dessen, was ein echter Spieler sieht, auch wenn GPS im Testmodus nicht zwingend gebraucht wird | 2026-08-29 |
| Eigene Route `/create/[id]/test` statt Query-Parameter auf `/play/[id]` | Klare URL-Trennung zwischen Creator- und Play-Bereich, kein Risiko dass ein vergessenes Query-Flag echten Spieler-Fortschritt beeinflusst | 2026-08-29 |
| Station ohne Position wird im Testmodus automatisch als angekommen behandelt | Navigation-Screen kann ohne `lat`/`lng` keine Distanz/Richtung berechnen — sinnvoller Fallback statt Fehlerzustand, damit auch unvollständige Quests testbar bleiben | 2026-08-29 |
| **Verworfen: Feature komplett aus dem MVP-Scope entfernt, gesamter Code per `git reset` rückgängig gemacht** | Bewusste Produktentscheidung des Nutzers nach vollständiger Implementierung und zwei Bugfix-Runden (Theme-Leck zwischen Create/Play, Zurück-Button-Leak nach `/play`, Sackgasse am Permission-Screen). Der Testmodus gehört nach dieser Entscheidung nicht zum MVP — Begründung war ein reiner Scope-Cut, keine technische Unmöglichkeit oder ungelöste Bugs (alle gemeldeten Probleme waren zum Zeitpunkt des Rollbacks bereits behoben). Diese Spec bleibt als Referenz erhalten, falls das Feature später erneut priorisiert wird | 2026-08-29 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Denselben `QuestPlayer` (PROJ-3/4/5) im Testmodus wiederverwenden statt eines separaten Test-Players | Der Testlauf muss exakt das zeigen, was ein echter Spieler sieht — eine zweite Implementierung könnte mit der Zeit vom echten Player abweichen. Eine dünne "Testmodus-Hülle" um den bestehenden Player ist robuster als eine Kopie | 2026-08-29 |
| Isolation des Test-Fortschritts über eine umbenannte `questId` (z.B. Präfix `test-`) statt neuer Parameter in der Fortschritts-Bibliothek | `quest-progress.ts` leitet den Speicherort intern immer aus der `questId` ab. Ein Test-Präfix auf diese ID isoliert den Testlauf vollständig, ohne dass eine einzige bestehende Fortschritts-Funktion (`getProgress`, `saveProgress`, `visitStation` usw.) geändert werden muss | 2026-08-29 |
| "Ankunft simulieren" als zusätzlicher, bedingt gerenderter Button innerhalb des bestehenden `NavigationScreen` (nicht als eigener Screen) | Der Ersteller soll weiterhin den echten Kompass/Distanz-Screen sehen und nur einen zusätzlichen Ausgang aus der Wartesituation erhalten, statt eines komplett anderen UI-Zustands | 2026-08-29 |
| `TestModeBanner` als eigene Wrapper-Komponente um `QuestPlayer`, nicht als Änderung an jedem einzelnen Screen | Ein einziger Wrapper, der über allem liegt, hält die Banner-Logik an einer Stelle — die einzelnen Screens (Intro, Stationsliste, Module, Outro) müssen nichts vom Testmodus wissen, außer den beiden gezielten Ausnahmen (simulierte Ankunft, Outro-Ziel) | 2026-08-29 |
| Kein neues Backend/keine neue Datenbank | Konsistent mit der PRD-Vorgabe "Kein Backend" — der Testmodus ist eine reine Frontend-Ergänzung auf Basis von localStorage | 2026-08-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
/create/[id] (Stationsliste — bestehend, PROJ-7)
└── [NEU] "Testen"-Button in der Kopfzeile
        ├── Quest hat ≥ 1 Station → Navigation zu /create/[id]/test
        └── Quest hat 0 Stationen → Hinweis statt Navigation ("Füge zuerst eine Station hinzu")

/create/[id]/test (NEUE Route)
└── TestModeBanner (neu) — umschließt den gesamten Testlauf
    ├── "TESTMODUS"-Leiste mit "Beenden"-Button, sichtbar auf jedem Screen
    └── QuestPlayer (bestehend aus PROJ-3/4/5 — WIEDERVERWENDET, Kernlogik unverändert)
        ├── Permission-Screen (bestehend, unverändert)
        ├── Intro-Screen (bestehend, unverändert)
        ├── Stationsliste (bestehend, unverändert)
        ├── Navigation-Screen (bestehend + NEU: "Ankunft simulieren"-Button, nur im Testmodus sichtbar)
        ├── Modul-Screen (bestehend, unverändert)
        └── Outro-Screen (bestehend + NEU: "Fertig" führt im Testmodus zu /create/[id] statt /play)
```

Kerngedanke: PROJ-10 baut **keinen zweiten Player**. Der bestehende `QuestPlayer` aus PROJ-3/4/5 wird 1:1 wiederverwendet und nur von einer dünnen "Testmodus-Hülle" umschlossen, die (a) den Fortschritt in ein eigenes Datenfach umleitet und (b) ein paar zusätzliche Bedienelemente einblendet.

### Daten-Architektur (plain language)

Kein neues Datenmodell. Der Testmodus speichert exakt dieselben Informationen wie ein echter Spieler-Durchlauf (besuchte Stationen, abgeschlossene Stationen, gelöste Aufgaben, aktueller Screen) — nur unter einem eigenen "Namensschild" in der Browser-Ablage:

```
Echter Spieler-Fortschritt:  eigenes Namensschild pro Quest
Test-Fortschritt:            eigenes, separates Namensschild pro Quest (gleiche Struktur, andere Schublade)
```

Dadurch überschneiden sich beide Fortschritts-Stände nie, obwohl derselbe Speicher-Mechanismus dahinter verwendet wird.

**Lebenszyklus des Test-Fortschritts:**
1. Ersteller tippt "Testen" → Testlauf-Schublade wird zunächst geleert (garantiert Start bei 0)
2. Während des Testlaufs wird in genau diese Schublade geschrieben (identisches Verhalten zum echten Player, nur anderes Ziel)
3. Ersteller verlässt den Testmodus (Banner "Beenden" ODER Outro "Fertig") → Schublade wird sofort wieder geleert
4. Nächster Testlauf beginnt wieder bei Schritt 1

### Verhalten der neuen/geänderten Bausteine

| Baustein | Verhalten |
|----------|-----------|
| "Testen"-Button (Stationsliste) | Immer sichtbar und aktiv, unabhängig vom Vollständigkeitsstatus der Quest. Nur bei 0 Stationen wird die Navigation durch einen Hinweis ersetzt |
| `TestModeBanner` | Liegt visuell über dem gesamten Testlauf, auf jedem Screen sichtbar. "Beenden" leert die Test-Schublade sofort und führt zurück zur Stationsliste |
| "Ankunft simulieren" (Navigation-Screen) | Nur im Testmodus sichtbar, löst denselben Ankunfts-Ablauf aus wie eine echte GPS-Ankunft (inkl. Konfetti-Overlay) — unabhängig von echter Distanz/Signal |
| Station ohne Position | Wird im Testmodus direkt als "angekommen" behandelt — der Navigation-Screen wird übersprungen, da ohne Koordinaten keine Distanz/Richtung berechenbar ist |
| Outro-Screen "Fertig" (im Testmodus) | Leert die Test-Schublade und führt zurück zur Stationsliste im Creator statt zur Spieler-Quest-Liste |

### Wiederverwendete vs. neue Bausteine

| Baustein | Status |
|----------|--------|
| `QuestPlayer` (State Machine) | ♻️ Wiederverwendet aus PROJ-3/4/5, unveränderte Kernlogik |
| Permission-, Intro-, Modul-, Stationslisten-Screens | ♻️ Wiederverwendet, unverändert |
| Fortschritts-Bibliothek (Lesen/Schreiben/Löschen) | ♻️ Wiederverwendet aus PROJ-3, keine neuen Funktionen — nur mit einer testmodus-spezifischen ID aufgerufen |
| Bestehendes Overlay-/Banner-Gestaltungsmuster | ♻️ Wiederverwendet für das neue `TestModeBanner` |
| `NavigationScreen` | 🔧 Geändert — zusätzlicher, bedingt sichtbarer "Ankunft simulieren"-Button |
| `OutroScreen`-Navigationsziel | 🔧 Geändert — testmodus-abhängiges Rücksprungziel |
| `/create/[id]`-Kopfzeile | 🔧 Geändert — neuer "Testen"-Button |
| `TestModeBanner` | 🆕 Neu |
| `/create/[id]/test`-Seite | 🆕 Neu |

### Dependencies

Keine neuen Packages. Der Testmodus baut ausschließlich auf bereits vorhandenen Bausteinen auf (bestehender `QuestPlayer`, bestehende UI-Komponenten, bestehende Fortschritts-Bibliothek).

## Implementation Notes (Frontend)

**Date:** 2026-08-29

### Neue/geänderte Dateien
| Datei | Zweck |
|-------|-------|
| `src/app/create/[id]/test/page.tsx` | Neu — rendert `QuestPlayer` mit `testMode` + `onExitTestMode`, lädt die Quest über das bestehende `getQuestById()` |
| `src/components/test-mode-banner.tsx` | Neu — `TestModeBanner`-Wrapper: sticky "TESTMODUS"-Leiste mit "Beenden"-Button, umschließt den kompletten Testlauf |
| `src/components/quest-player.tsx` | + `testMode`/`onExitTestMode`-Props; Fortschritt läuft bei `testMode` über eine `test-`-präfigierte `questId` (kein neuer Fortschritts-Code nötig); Testlauf-Fortschritt wird per `useState`-Lazy-Initializer einmalig pro Mount gelöscht; `handleNavigate` überspringt die Navigation direkt zu "angekommen", wenn `testMode` aktiv ist und der Station `lat`/`lng` fehlt; `handleOutroDone` verzweigt im Testmodus zu `handleExitTestMode` statt `router.push("/play")`; Render-Ausgabe wird bei `testMode` in `TestModeBanner` gewrappt |
| `src/components/navigation-screen.tsx` | + optionale `onSimulateArrival`-Prop; rendert bei Vorhandensein einen zusätzlichen "Ankunft simulieren"-Button unterhalb des Kompass-Bereichs, der denselben `onArrived`-Callback wie eine echte Ankunft auslöst |
| `src/app/create/[id]/page.tsx` | + "Testen"-Button (Flask-Icon) neben dem bestehenden Bearbeiten-Button in der Kopfzeile; bei 0 Stationen zeigt er einen Toast-Hinweis statt zu navigieren |

### Abweichungen von der Tech-Design-Skizze
- Keine. Die Umsetzung folgt exakt dem im `/architecture`-Schritt festgelegten Ansatz (Wiederverwendung von `QuestPlayer`, Isolation über eine umbenannte `questId`, `TestModeBanner` als Wrapper-Komponente).

### Verifikation
- `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, nur vorbestehende `<img>`-Warnungen) · `npm test` ✓ (140/140, keine neuen Tests für PROJ-10 selbst — die Fortschritts-Isolation läuft über bereits getestete `quest-progress.ts`-Funktionen, siehe Decision Log)
- Ein `react-hooks/refs`-ESLint-Fehler wurde während der Umsetzung gefunden und behoben: der ursprüngliche Ansatz (Reset-Flag in einem `useRef`, während des Renderns geprüft) verletzte die React-Regel "kein Ref-Zugriff während des Renderns". Ersetzt durch einen `useState`-Lazy-Initializer, der exakt einmal pro Mount läuft, bevor `useQuestProgress` den (jetzt geleerten) Test-Fortschritt zum ersten Mal liest.
- Manuell im Browser (Playwright-Treiber gegen WebKit, da der gebündelte Chromium-Headless-Shell-Download in dieser Sandbox fehlt — gleiches etabliertes Muster wie PROJ-3/4/5/7/8; 390×844 Mobile-Viewport, gemockte Geolocation Berlin) vollständig durchgespielt:
  - Testquest mit 2 Stationen gesät (eine ohne `lat`/`lng`, eine mit) → `/create/[id]` zeigt das neue Flask-Icon neben dem Bearbeiten-Button
  - "Testen" getippt → Navigation zu `/create/[id]/test`, TESTMODUS-Banner sofort sichtbar, Start beim Permission-Screen
  - Permission erteilt → Intro → Stationsliste
  - Station ohne Position angetippt → Navigation-Screen **übersprungen**, direkt zum Modul-Screen (Edge Case 2 verifiziert)
  - Station abgeschlossen → zweite Station (mit Position) entsperrt
  - Station mit Position angetippt → echter Navigation-Screen mit Kompass/Distanz UND "Ankunft simulieren"-Button sichtbar
  - "Ankunft simulieren" getippt → Ankunfts-Flow ausgelöst, Modul-Screen erreicht (unabhängig vom echten GPS-Abstand von 2249m)
  - Code-Aufgabe gelöst, Station abgeschlossen (letzte Station) → Outro-Screen mit Konfetti, "2 von 2 Stationen abgeschlossen", TESTMODUS-Banner weiterhin sichtbar
  - "Fertig" getippt → zurück zu `/create/[id]` (nicht `/play`), `localStorage`-Check bestätigt: Test-Fortschritts-Key vor dem Verlassen vorhanden, danach vollständig gelöscht
  - Separater Testlauf mit einer Quest ohne Stationen: "Testen" zeigt Toast "Füge zuerst eine Station hinzu", keine Navigation
  - Keine Konsolen-/Seitenfehler während des gesamten Durchlaufs

### Nutzer-Feedback nach erster Implementierung (behoben)

Nach dem ersten Test im Browser hat der Nutzer zwei Probleme gemeldet, die direkt eingearbeitet wurden:

1. **Dunkle, unleserliche Felder auf den Testmodus-Screens.** Ursache: `/create/[id]/test` ist im `data-theme="light"`-Layout von `/create` verschachtelt (`create/layout.tsx`), aber alle Player-Screens (Intro, Stationsliste, Navigation, Module, Outro — aus PROJ-3/4/5) sind gegen das dunkle Farbschema von `/play` gebaut (`data-theme="dark"`) und nutzen CSS-Variablen wie `--background`/`--foreground`, die sich mit dem Theme umkehren. Unter dem hellen Layout kippten diese Variablen, während einzelne fest kodierte dunkle Farben (z.B. `bg-gq-black`, weißer Text) unverändert blieben — Ergebnis: dunkler Text auf dunklem Grund bzw. umgekehrt. **Fix:** `quest-player.tsx` erzwingt jetzt `data-theme="dark"` auf einem Wrapper-`div` um den gesamten Testlauf, unabhängig vom Theme des umschließenden Creator-Layouts — exakt das gleiche Muster, das der Code bereits für Sheets/Dialogs nutzt (`data-theme="light"`-Override), nur in die andere Richtung.
2. **Zurück-Pfeil auf der Stationsliste führte in den Play-Modus.** Ursache: `StationList` (von PROJ-3, gemeinsam genutzt von echtem Player und Testmodus) hatte `backHref="/play"` fest kodiert. **Fix:** `StationList` erhält jetzt eine optionale `backHref`-Prop (Default weiterhin `/play` für den echten Player) sowie eine optionale `onBackClick`-Prop. `QuestPlayer` übergibt im Testmodus `backHref={`/create/${quest.id}`}` und `onBackClick={handleExitTestMode}` (räumt den Test-Fortschritt auf, bevor der reine `<Link>`-Klick navigiert). `AppHeader` wurde dafür um eine optionale `onBackClick`-Prop erweitert (rückwärtskompatibel, alle bestehenden Aufrufer unverändert).
3. Erneut verifiziert nach beiden Fixes (Playwright/WebKit): alle Screens rendern jetzt durchgängig im dunklen Theme mit lesbarem Kontrast; Zurück-Klick auf der Testmodus-Stationsliste führt zu `/create/[id]` (nicht `/play`) und löscht den Test-Fortschritts-Key korrekt. `npm run build`/`lint`/`test` weiterhin grün (140/140).

### Zweites Nutzer-Feedback: Sackgasse auf dem Permission-Screen (behoben)

Der Nutzer meldete, im Testmodus nicht über den "Navigation aktivieren"-Screen hinauszukommen. Ursache: Dieser Screen (aus PROJ-3, unverändert wiederverwendet) kommt nur weiter, sobald `useGeolocation`s `onFirstPosition`-Callback feuert — das setzt eine tatsächlich erfolgreiche, echte GPS-Positionsbestimmung voraus. Auf einem Desktop-Browser ohne Standortdienste, bei verweigerter Berechtigung oder wenn der Browser die native Anfrage einfach nie auflöst, bleibt der Screen eine Sackgasse — genau der Fall, den PROJ-10 laut Spec und Decision Log ausdrücklich vermeiden sollte ("auch wenn GPS im Testmodus nicht zwingend gebraucht wird"), aber die ursprüngliche Umsetzung deckte nur den bereits erreichten Navigation-Screen ab (dort existierte schon "Ankunft simulieren"), nicht den vorgelagerten Permission-Screen.

**Fix:** `PermissionScreen` erhält eine neue optionale `onContinueWithoutGps`-Prop — bei Vorhandensein erscheint unterhalb des "Standort erlauben"-Buttons ein dezenter Text-Link "Ohne Standort fortfahren (Test)", der direkt zum Intro-Screen weiterspringt, ohne auf eine echte GPS-Position zu warten. `QuestPlayer` übergibt diesen Callback (`handleContinueWithoutGps` → `setScreen("intro")`) nur wenn `testMode` aktiv ist; im echten Player bleibt der Permission-Screen unverändert ohne diesen Ausweg.

Verifiziert (Playwright/WebKit, Geolocation-Berechtigung bewusst NICHT erteilt, um den gemeldeten Stuck-Zustand exakt nachzustellen): Permission-Screen zeigt den neuen Link, Klick führt direkt zu Intro → Stationsliste, restlicher Flow unverändert funktionsfähig. `npm run build`/`lint`/`test` weiterhin grün (140/140).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
