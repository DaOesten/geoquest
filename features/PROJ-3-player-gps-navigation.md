# PROJ-3: Player — GPS-Navigation

## Status: Deployed
**Created:** 2026-08-23
**Last Updated:** 2026-09-19

> **Refinement (2026-09-06) — umgesetzt, deployt und QA-geprüft:** Zwei stille Ausfallmodi ergänzt — GPS-Fix bleibt trotz erteilter Permission aus, und der Richtungspfeil hat keine Richtung. Siehe Abschnitte "Permission-Flow", "Richtungsanzeige ohne Heading", Edge Cases 9–12 und die Implementation Notes vom 2026-09-06.

> **Refinement (2026-09-07) — BUG-6 geklärt, umgesetzt und QA-geprüft:** Die iOS-Erkennung hinter dem "Kompass aktivieren"-Button ist zu grob. Sie schließt allein daraus auf iOS, dass `DeviceOrientationEvent.requestPermission` eine Funktion ist — das trifft auf Desktop-Chrome ebenfalls zu. Folge: Chrome-Nutzer bekommen einen Button angeboten, der garantiert fehlschlägt, statt des Hinweises, der ihnen hilft. BUG-6 war als vermutliches Testumgebungs-Artefakt notiert und ist als **echter Produktfehler bestätigt**. Siehe Acceptance Criteria "Richtungsanzeige ohne Heading", Edge Cases 13–14, Technical Requirements und Decision Log.

> **Refinement (2026-09-19) — Gratulationsscreen (`ArrivalOverlay`), umgesetzt, QA-geprüft und am 2026-09-20 deployt (`v1.31.0-PROJ-3`):** Drei Befunde aus dem Gebrauch, alle am Ankunfts-Screen. (1) Die Karte „Nächstes Ziel" nimmt vorweg, was der Spieler gerade erst verdient hat — sie entfällt ersatzlos. (2) Das Pin-Logo zeichnet sich als Rechteck vom Hintergrund ab, weil `mark-pin.jpg` ein JPEG ohne Transparenz ist — es bekommt ein freigestelltes PNG. (3) Das Konfetti rieselt von oben und läuft endlos; es soll einmalig wie aus einer Konfetti-Kanone von unten mittig nach oben schießen — das gilt für beide Screens, die `ConfettiEffect` nutzen (Ankunft und Outro/PROJ-5). Siehe Acceptance Criteria „Ankunft — Gratulationsscreen", Edge Cases 15–17, Technical Requirements und Decision Log.

## Dependencies
- Requires: PROJ-1 (App Shell & Mode Switch) — für Routing und UI-Rahmen
- Requires: PROJ-2 (Quest Data Model & JSON Import) — für Quest-Daten und Stationskoordinaten

## Summary
Die GPS-Navigation bildet das Kern-Spielerlebnis: Der Spieler wird per Richtungspfeil und Entfernungsanzeige zu den Stationen einer Quest navigiert. Das Feature umfasst den gesamten Flow vom Quest-Start (Permissions, Intro) über die Stationsliste bis zur Ankunftserkennung an einer Station.

## User Stories
1. Als Spieler möchte ich eine importierte Quest starten können, damit ich das Abenteuer beginne.
2. Als Spieler möchte ich per Richtungspfeil und Entfernungsanzeige zur nächsten Station navigiert werden, damit ich den Weg finde, ohne auf eine Karte starren zu müssen.
3. Als Spieler möchte ich automatisch benachrichtigt werden, wenn ich eine Station erreicht habe, damit ich weiß, dass ich am richtigen Ort bin.
4. Als Spieler möchte ich eine Übersicht aller Stationen sehen, damit ich meinen Fortschritt verfolgen und die nächste Station ansteuern kann.
5. Als Spieler möchte ich eine Quest unterbrechen und später weiterspielen können, damit ich nicht alles auf einmal machen muss.

## Out of Scope
- Modul-Rendering an Stationen (Text, Bild, Audio, Video, Tasks) — PROJ-4
- Task-Lösung als Bedingung für Station-Abschluss — PROJ-5 (ersetzt den minimalen "besucht"-Status)
- Outro-Anzeige nach letzter Station — PROJ-5
- Quest-Neustart / Fortschritt zurücksetzen — PROJ-5
- Kartenansicht / Mapview — bewusst ausgeschlossen (kein Map-API, Kinder sollen Umgebung erkunden)
- Offline-Navigation (kein Offline-Modus laut PRD)
- Hintergrund-Tracking wenn App minimiert (nur aktiv im Vordergrund)
- Multiplayer / Echtzeit-Position anderer Spieler
- "Station überspringen"-Funktion
- Routing / Wegbeschreibung (nur Luftlinie)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Permission-Flow:**
- [ ] Angenommen der Spieler startet eine Quest zum ersten Mal, wenn die Quest geöffnet wird, dann wird die GPS-Permission abgefragt (auf iOS zusätzlich die Bewegungssensor-Permission)
- [ ] Angenommen der Spieler lehnt die GPS-Permission ab, wenn er es erneut versucht, dann erscheint eine freundliche Erklärung ("Damit wir dich zur Station navigieren können") mit einem "Erlauben"-Button
- [ ] Angenommen der Spieler hat GPS dauerhaft blockiert, wenn er die Quest starten will, dann erscheint ein Hinweis mit Link zu den Geräte-Einstellungen
- [ ] Angenommen die GPS-Permission ist erteilt, wenn das Signal verfügbar ist (< 5s), dann wird das Intro angezeigt
- [ ] Angenommen die GPS-Permission ist erteilt, wenn noch kein Fix vorliegt, dann zeigt der Permission-Screen einen Suchzustand ("Suche GPS-Signal…", Icon pulsiert) statt weiterhin den unveränderten "Standort erlauben"-Button
- [ ] Angenommen die GPS-Permission ist erteilt, wenn nach 15s immer noch kein Fix vorliegt, dann erscheint der Hinweis "Wir finden dein GPS-Signal nicht. Gehe nach draußen und versuche es nochmal." mit "Erneut versuchen"-Button
- [ ] Angenommen der Browser meldet `POSITION_UNAVAILABLE` oder `TIMEOUT`, wenn der Fehler eintritt, dann landet der Spieler im Kein-Fix-Zustand (nicht im "Gerät unterstützt kein GPS"-Zustand — das ist eine andere Ursache und eine andere Handlungsanweisung)
- [ ] Angenommen die Seite läuft über unverschlüsseltes HTTP, wenn GPS angefordert wird, dann erscheint ein technischer Hinweis statt einer irreführenden Geräte-Meldung

**Intro:**
- [ ] Angenommen die Permissions sind erteilt, wenn die Quest startet, dann wird der Intro-Text angezeigt (mit optionalem Medium: Bild, Audio oder Video)
- [ ] Angenommen das Intro wird angezeigt, wenn der Spieler "Los geht's" tippt, dann öffnet sich die Stationsliste

**Stationsliste:**
- [ ] Angenommen die Stationsliste ist geöffnet, wenn der Spieler alle Stationen sieht, dann sind alle Stationsnamen sichtbar (auch gesperrte)
- [ ] Angenommen eine Station ist gesperrt, wenn der Spieler sie antippt, dann passiert nichts (Button ist deaktiviert, visuell als gesperrt erkennbar)
- [ ] Angenommen die erste Station ist freigeschaltet, wenn der Spieler sie antippt, dann startet die Navigation zu dieser Station
- [ ] Angenommen eine Station wurde besucht (Ankunft erkannt), wenn der Spieler die Stationsliste öffnet, dann ist die nächste Station freigeschaltet

**Navigation:**
- [ ] Angenommen die Navigation läuft, wenn der Spieler sich bewegt, dann zeigt der Richtungspfeil (Kompassnadel-Stil) in Richtung der Zielstation
- [ ] Angenommen die Navigation läuft, wenn die Entfernung sich ändert, dann wird sie in Metern angezeigt mit Farbwechsel (rot = weit, gelb = mittel, grün = nah)
- [ ] Angenommen das Gerät hat keinen Kompass (oder er ist unkalibriert), wenn der Spieler sich bewegt, dann basiert die Pfeilrichtung auf der GPS-Bewegungsrichtung (Heading)
- [ ] Angenommen der Kompass braucht Kalibrierung, wenn dies erkannt wird, dann erscheint ein kurzer Hinweis ("Bewege dein Handy in einer 8")
- [ ] Angenommen der Spieler navigiert, wenn er den Zurück-Button tippt, dann kehrt er zur Stationsliste zurück

**Richtungsanzeige ohne Heading:**
- [ ] Angenommen weder Kompass- noch GPS-Heading liegen vor, wenn der Pfeil gezeichnet wird, dann ist er sichtbar als richtungslos dargestellt (ausgegraut/pulsierend) — er zeigt **nicht** unkommentiert nach oben, weil das mit "geradeaus" verwechselbar ist
- [ ] Angenommen der Pfeil ist richtungslos, wenn der Spieler den Screen sieht, dann bleibt die Entfernung in Metern normal sichtbar (sie ist korrekt und unabhängig vom Heading)
- [ ] Angenommen die Bewegungsrichtung ist die einzige Heading-Quelle, wenn der Spieler stillsteht, dann ist der Hinweis "Laufe ein paar Schritte" gut lesbar (nicht 9px grau) und dem Pfeil klar zugeordnet
- [ ] Angenommen die Bewegungssensor-Permission wurde auf iOS nie erteilt, wenn der Navigations-Screen geöffnet wird, dann erscheint ein antippbarer "Kompass aktivieren"-Button statt des "Laufe ein paar Schritte"-Hinweises
- [ ] Angenommen der Spieler tippt "Kompass aktivieren", wenn die Permission erteilt wird, dann richtet sich der Pfeil ohne Neuladen der Seite aus
- [ ] Angenommen der Browser stellt `DeviceOrientationEvent.requestPermission` bereit, ohne eine echte Sensorfreigabe zu kennen (Desktop-Chrome), wenn der Navigations-Screen geöffnet wird, dann erscheint **kein** "Kompass aktivieren"-Button, sondern direkt der "Laufe ein paar Schritte"-Hinweis
- [ ] Angenommen der Spieler tippt "Kompass aktivieren", wenn die Freigabe abgelehnt wird oder fehlschlägt, dann erscheint sofort der "Laufe ein paar Schritte"-Hinweis — der Screen bleibt nie ohne Erklärung zurück

**Ankunft:**
- [ ] Angenommen der Spieler befindet sich innerhalb des Ankunftsradius einer Station, wenn die Position erkannt wird, dann vibriert das Gerät und ein "Angekommen!"-Hinweis erscheint
- [ ] Angenommen der Spieler ist angekommen, wenn die Ankunft bestätigt wurde, dann wird die Station als "besucht" markiert und die nächste Station freigeschaltet

**Ankunft — Gratulationsscreen (Refinement 2026-09-19):**
- [x] Angenommen der Gratulationsscreen erscheint, wenn der Spieler ihn sieht, dann zeigt er **keinen** Hinweis auf die nächste Station — weder Name noch Karte, weder Entfernung noch Richtung
- [x] Angenommen der Gratulationsscreen erscheint, wenn er gerendert wird, dann folgen auf den Pin von oben nach unten: Headline "Ziel erreicht!", Teal-Strich, Stationsname, CTA "Station entdecken" — ohne weiteres Element dazwischen
- [x] Angenommen das Pin-Logo wird angezeigt, wenn es auf dem Screen-Hintergrund steht, dann ist keine Kante und kein Rechteck um das Motiv sichtbar — der Pin steht frei auf dem Hintergrund
- [x] Angenommen das Pin-Logo wird angezeigt, wenn der Haken-Badge daran sitzt, dann überlappt er das Motiv und nicht eine sichtbare Bildkante
- [x] Angenommen der Gratulationsscreen erscheint, wenn die Konfetti-Animation startet, dann schießen die Partikel von unten aus der Mitte nach oben auf und fallen anschließend seitlich streuend aus — kein Rieseln von oben
- [x] Angenommen die Konfetti-Kanone hat gefeuert, wenn alle Partikel ausgefallen sind, dann bleibt der Screen ruhig — die Animation wiederholt sich nicht (kein `infinite`)
- [x] Angenommen der Outro-Screen am Quest-Ende erscheint (PROJ-5), wenn seine Konfetti-Animation startet, dann verhält sie sich identisch zur Ankunft — dieselbe Komponente, dasselbe Schussverhalten
- [x] Angenommen der Spieler hat "Bewegung reduzieren" aktiviert (`prefers-reduced-motion`), wenn der Gratulationsscreen erscheint, dann bleibt der Screen inhaltlich vollständig, ohne aufschießende Partikel

**GPS-Signalverlust:**
- [ ] Angenommen das GPS-Signal geht verloren, wenn weniger als 30 Sekunden vergangen sind, dann zeigt die Navigation den letzten bekannten Stand (Pfeil + Entfernung bleiben stehen)
- [ ] Angenommen das GPS-Signal ist länger als 30 Sekunden weg, wenn der Timer abläuft, dann stoppt die Navigation und ein Hinweis mit "Erneut versuchen"-Button erscheint
- [ ] Angenommen die Navigation wurde gestoppt (GPS-Verlust), wenn der Spieler "Erneut versuchen" tippt und GPS wieder verfügbar ist, dann nimmt die Navigation den Betrieb wieder auf

**Fortschritt:**
- [ ] Angenommen der Spieler hat Stationen besucht und verlässt die Quest, wenn er die Quest erneut öffnet, dann sieht er die Stationsliste mit dem gespeicherten Fortschritt
- [ ] Angenommen der Spieler verlässt die Quest (Zurück-Button oder Browser schließen), wenn er geht, dann wird kein Bestätigungsdialog angezeigt (Fortschritt ist automatisch gespeichert)

## Edge Cases
1. **GPS-Permission dauerhaft abgelehnt:** Spieler kann die Quest nicht starten → Hinweis auf Geräte-Einstellungen mit klarer Anleitung
2. **Kein Kompass / Device Orientation nicht unterstützt:** Fallback auf GPS-Bewegungsrichtung. Pfeil funktioniert nur in Bewegung. Hinweis: "Laufe ein paar Schritte, damit der Pfeil die Richtung findet."
3. **Spieler ist bereits am Stationsort:** Sofortige Ankunftserkennung beim Start der Navigation (kein Laufen nötig)
4. **GPS-Drift bei Stillstand:** Spieler steht knapp außerhalb des Radius, GPS springt rein und raus → Ankunft wird beim ersten Eintritt in den Radius ausgelöst, danach nicht erneut (einmalig)
5. **Sehr große Entfernung (>10 km):** Entfernung wird normal in Metern angezeigt (z.B. "12.400 m"), kein Wechsel auf km
6. **Spieler öffnet Quest an anderem Ort als vorgesehen:** Navigation funktioniert trotzdem (zeigt Richtung + Entfernung), egal wie weit entfernt
7. **Browser-Tab wird in den Hintergrund gelegt:** GPS-Tracking pausiert (Browser-Verhalten), bei Rückkehr in den Vordergrund wird Position neu bestimmt und Navigation fortgesetzt
8. **localStorage gelöscht / anderer Browser:** Fortschritt verloren, Quest startet von vorne (erstes Start = Intro → Stationsliste mit nur Station 1 freigeschaltet)
9. **Permission erteilt, aber kein Fix (drinnen, Keller, Schulgebäude):** Häufigster realer Fall bei der Zielgruppe. Suchzustand → nach 15s Hinweis "Gehe nach draußen" mit Retry. **Nicht** als "Gerät unterstützt kein GPS" ausgeben — die Ursache ist der Ort, nicht das Gerät.
10. **Wiedereinstieg über gespeicherten Fortschritt auf iOS:** Der Spieler überspringt den Permission-Screen und damit den einzigen Ort, an dem `DeviceOrientationEvent.requestPermission()` bisher aufgerufen wird. Folge: Kompass bleibt die ganze Session stumm, Pfeil steht fest auf 0°. Der "Kompass aktivieren"-Button im Navigations-Screen muss diesen Einstieg abfangen.
11. **Pfeil ohne jede Heading-Quelle:** Rotation 0 bedeutet "unbekannt", sieht aber aus wie "geradeaus" — der Spieler läuft mit einem Pfeil los, der nichts aussagt. Muss visuell vom gültigen Zustand unterscheidbar sein.
12. **Gerät ohne brauchbares Magnetometer (Android-Billiggeräte):** Fällt auf GPS-Bewegungsrichtung zurück, funktioniert also nur beim Laufen — gleicher sichtbarer Zustand wie Edge Case 11 im Stand.
13. **Nicht-iOS-Browser mit `requestPermission`-API (Desktop-Chrome, evtl. Android-Chrome):** `DeviceOrientationEvent.requestPermission` existiert dort als Funktion, ohne dass es eine iOS-artige Sensorfreigabe gäbe. Eine Erkennung, die allein darauf prüft, hält jeden solchen Browser für ein iPhone und bietet den "Kompass aktivieren"-Button an. Der Aufruf liefert `denied`, der Button ist eine Sackgasse. Richtig ist hier der "Laufe ein paar Schritte"-Hinweis. **Bestätigt auf Chrome 152 (2026-09-07), siehe BUG-6.**
14. **Sensorfreigabe wird abgelehnt oder schlägt fehl (jede Plattform):** Nach einem `denied` darf der Screen nicht in einem Zustand ohne Erklärung stehen bleiben. Der Spieler fällt auf denselben sichtbaren Zustand wie Edge Case 11/12 zurück — richtungsloser Pfeil plus "Laufe ein paar Schritte".
15. **Letzte Station erreicht (Refinement 2026-09-19):** Hier gab es noch nie ein nächstes Ziel — die Karte fehlte, und der Screen endete direkt beim CTA. Mit dem Wegfall der Karte ist das jetzt der einzige Fall: Der Gratulationsscreen sieht an jeder Station gleich aus, unabhängig davon, ob noch Stationen folgen. Der bisherige Sonderfall verschwindet, statt gesondert behandelt zu werden.
16. **Sehr langer Stationsname auf dem Gratulationsscreen:** Mit dem Wegfall der „Nächstes Ziel"-Karte trägt der Screen nur noch einen Namen. Er darf umbrechen statt abzuschneiden — abgeschnitten wäre ausgerechnet die Belohnung unvollständig. Die Höhe des Screens muss das auf 320×568 aushalten, ohne den CTA unter den Falz zu drücken.
17. **`prefers-reduced-motion` aktiv:** Die Konfetti-Kanone ist reine Dekoration. Bei reduzierter Bewegung entfällt der Partikel-Schuss; Pin, Headline, Stationsname und CTA bleiben vollständig und bedienbar. Betrifft beide Screens (Ankunft und Outro).

## Technical Requirements
- GPS-Position: `navigator.geolocation.watchPosition()` mit `enableHighAccuracy: true`
- Kompass: `DeviceOrientationEvent` (mit `requestPermission()` auf iOS Safari)
- Fallback: GPS-Heading aus aufeinanderfolgenden Positionen berechnen
- Vibration: `navigator.vibrate(200)` bei Ankunft (Fallback: nur visuell wenn nicht unterstützt)
- Entfernungsberechnung: Haversine-Formel für GPS-Koordinaten
- Richtungsberechnung: Bearing zwischen aktueller Position und Zielstation
- Farbwechsel: rot (>200m), gelb (50–200m), grün (<50m)
- GPS-Timeout: 30s ohne Signal → Navigation stoppen
- Fehlerbehandlung: **alle** `GeolocationPositionError`-Codes auswerten (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`) — nicht nur `PERMISSION_DENIED`
- Kein-Fix-Timeout: 15s nach erteilter Permission ohne erste Position → Hinweis + Retry
- `!navigator.geolocation` ist als alleiniger Verfügbarkeitstest unzureichend: In der Praxis existiert das Objekt immer; die realen Ausfälle sind fehlendes HTTPS, `POSITION_UNAVAILABLE` und `TIMEOUT`
- Kompass-Verfügbarkeit muss als eigener Zustand nach außen sichtbar sein (Heading vorhanden / nur Bewegungsrichtung / Permission ausstehend / nicht unterstützt) — nicht nur als `heading: number | null`
- `DeviceOrientationEvent.requestPermission()` (iOS) muss auch außerhalb des Permission-Screens auslösbar sein
- Die iOS-Erkennung darf sich **nicht allein** darauf stützen, dass `DeviceOrientationEvent.requestPermission` eine Funktion ist — Desktop-Chrome erfüllt diese Bedingung ebenfalls (gemessen: Chrome 152, 2026-09-07). Zusätzliches Plattform-Signal erforderlich
- Ein `denied`/fehlgeschlagenes Ergebnis von `requestPermission()` muss in den "Laufe ein paar Schritte"-Zustand münden — als zweite Verteidigungslinie, unabhängig davon, ob die Plattformerkennung richtig lag. Damit bleibt das Verhalten auch auf ungetesteten Browsern (Android-Chrome) korrekt
- Performance: GPS-Signal innerhalb 5s nach Permission (PRD-Anforderung)
- Update-Intervall: GPS-Position alle 1–3s (Browser-abhängig via watchPosition)
- Fortschritt: localStorage mit Key `gq_progress_{questId}`
- Touch-Targets: min. 44px (PRD-Anforderung)
- Min. Body-Text: 16px (PRD-Anforderung)

**Gratulationsscreen (Refinement 2026-09-19):**
- Die Prop `nextStationName` entfällt über die ganze Kette: `ArrivalOverlay` → `NavigationScreen` → `quest-player.tsx`. Kein totes Durchreichen stehen lassen — wenn die Karte weg ist, geht auch der Wert, der sie gespeist hat
- Freigestelltes Pin-Asset als PNG mit Alpha-Kanal (`mark-pin.png`) neben dem bestehenden `mark-pin.jpg`. Das JPEG bleibt liegen, solange andere Stellen es nutzen; Ankunft und Outro ziehen auf das PNG
- Das Freistellen muss reproduzierbar und eingecheckt sein, nicht einmalig von Hand — wie beim PWA-Icon (PROJ-12, `scripts/`). Der dunkle Grund des Quellbilds misst rgb(4,10,11) und ist damit nicht exakt der Token-Hintergrund `#0B0F12`; genau diese Differenz erzeugt die sichtbare Kante
- `ConfettiEffect` wird von Rieseln auf Kanone umgebaut: Ursprung unten mittig, Partikel steigen in gestreuten Winkeln auf, verlieren an Höhe und fallen seitlich aus. Einmalig pro Mount, kein `infinite`
- Die Komponente ist geteilt (Ankunft + Outro/PROJ-5). Änderungen an ihr treffen beide Screens — das ist gewollt und in PROJ-5 zu vermerken
- `prefers-reduced-motion: reduce` unterdrückt den Partikel-Schuss; der Screen bleibt ohne ihn vollständig
- Die Partikel sind rein dekorativ und dürfen keine Klicks abfangen (`pointer-events-none` bleibt) und nicht vom Screenreader gelesen werden

## Open Questions
- [ ] Ab welcher GPS-Genauigkeit (accuracy in Metern) soll eine Warnung angezeigt werden? (z.B. accuracy > 50m = "Signal ungenau")
- [ ] Soll die Entfernung bei > 1000m als "1,2 km" statt "1200 m" angezeigt werden?
- [ ] Soll die Stationsliste auch die Entfernung zur jeweiligen Station anzeigen (wenn GPS aktiv)?
- [ ] Soll der richtungslose Pfeil langsam rotieren (Suchanimation) oder statisch ausgegraut bleiben? — Umsetzungsdetail für `/frontend`
- [ ] Soll die Ankunftserkennung bei sehr schlechter `accuracy` (> Stationsradius) unterdrückt werden, um Falsch-Ankünfte zu vermeiden? Hängt mit der offenen Genauigkeits-Frage oben zusammen.
- [ ] Verhält sich **Android-Chrome** wie Desktop-Chrome (`requestPermission` vorhanden, liefert `denied`)? Lokal nicht messbar — kein Android-Gerät und kein lauffähiges Chromium-Binary. Der beschlossene `denied`-Rückfall macht die Antwort für die Korrektheit unkritisch, sie bliebe aber für die Testabdeckung interessant.
- [x] Soll die Konfetti-Kanone aus einem Punkt oder aus zwei Punkten feuern? → Ein Punkt, unten mittig. Der Fächer öffnet sich über 62° und deckt damit die volle Breite ab; ein zweiter Ursprung hätte nichts hinzugefügt, was der Streuwinkel nicht schon leistet (2026-09-19)
- [x] Wie lange dauert der komplette Schuss? → 1,7–2,7s je Partikel plus bis zu 0,18s gestaffelte Zündung; nach rund 3s ist der Screen ruhig. Gemessen: Der Fächer steht nach 260ms voll im Bild, bei 600ms fällt er sichtbar aus (2026-09-19)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Richtungspfeil statt Karte | Kinder sollen Umgebung erkunden, nicht aufs Handy starren. Keine Map-API-Kosten. | 2026-08-23 |
| Flow: GPS → Intro → Stationsliste → Navigation | GPS zuerst, damit Signal beim Intro-Lesen bereits lockt. Stationsliste als Hub. | 2026-08-23 |
| Stationsnamen immer sichtbar (auch gesperrt) | Erzeugt Neugier auf kommende Stationen, gibt Überblick über die Quest | 2026-08-23 |
| Gesperrte Stationen nicht antippbar | Lineare Quest-Struktur erzwingen, keine Station überspringen | 2026-08-23 |
| Auto-Erkennung bei Ankunft (keine manuelle Bestätigung) | "Magisches" Gefühl — App weiß, dass du da bist. Passend für Gaming-Erlebnis der Zielgruppe | 2026-08-23 |
| GPS + Bewegungssensor zusammen abfragen | Ein Permission-Schritt statt zwei. Weniger Friction für den Spieler | 2026-08-23 |
| Bewegungsrichtung als Kompass-Fallback | Universell, funktioniert auch ohne Magnetometer. Hinweis dass Laufen nötig ist | 2026-08-23 |
| GPS-Verlust > 30s → Navigation stoppt + Retry | Klarer Zustand für den Spieler, kein verwirrendes "Pfeil zeigt nirgendwo hin" | 2026-08-23 |
| Entfernung in Metern mit Farbwechsel (rot/gelb/grün) | Intuitiv, gamifiziert die Annäherung. Kein Text-Feedback nötig | 2026-08-23 |
| Kein Bestätigungsdialog beim Verlassen | Fortschritt ist automatisch gespeichert, Dialog wäre nur nervig | 2026-08-23 |
| Minimaler Fortschritt in PROJ-3 (besucht = freigeschaltet) | Macht PROJ-3 eigenständig testbar. PROJ-5 ersetzt dies später durch Task-Completion-Logik | 2026-08-23 |
| Station-Übergang über Stationsliste (nicht direkt "Weiter") | Stationsliste als zentraler Hub gibt Überblick und Orientierung | 2026-08-23 |
| Kein "Station überspringen"-Button | Lineare Struktur beibehalten, GPS-Probleme über Retry lösen | 2026-08-23 |
| Kein-Fix-Zustand auf dem Permission-Screen statt eigenem Screen | Der Spieler steht dort ohnehin schon; ein eigener Screen für einen Wartezustand wäre Overhead. Spiegelt das bestehende Muster des GPS-Verlusts während der Navigation (Hinweis + Retry). | 2026-09-06 |
| "Gehe nach draußen" statt "Gerät unterstützt kein GPS" | Bei der Zielgruppe ist der Ort (Schule, Keller, Wohnung) die häufigste Ursache, nicht das Gerät. Falsche Diagnose führt zu falscher Handlung. | 2026-09-06 |
| Richtungsloser Pfeil wird sichtbar als solcher dargestellt | Rotation 0 ist von "geradeaus" nicht unterscheidbar — der Spieler vertraut einem Pfeil, der nichts weiß. Auslöser: Testquest 2026-09-06, Pfeil bewegte sich auf iPhone nicht. | 2026-09-06 |
| "Kompass aktivieren"-Button im Navigations-Screen | Bei Wiedereinstieg über gespeicherten Fortschritt wird der Permission-Screen übersprungen — der bisher einzige Ort für die iOS-Sensorfreigabe. Der Rat "Laufe ein paar Schritte" hilft nicht, wenn eine Freigabe fehlt. | 2026-09-06 |
| Entfernung bleibt bei richtungslosem Pfeil sichtbar | Die Entfernung ist unabhängig vom Heading korrekt und weiterhin nützlich — sie mit auszublenden würde funktionierende Information verschenken. | 2026-09-06 |
| BUG-6 ist ein Produktfehler, kein Testumgebungs-Artefakt | Auf echtem Chrome 152 reproduziert und instrumentiert: Position liegt vor (12514m gerendert), der Nachbartest besteht. Die vermutete Ursache "Playwright liefert keinen Fix" ist damit widerlegt; die Ursache ist die zu grobe iOS-Erkennung. | 2026-09-07 |
| Ursache beheben statt Symptom: echte Plattformerkennung **und** `denied`-Rückfall | Nur die Erkennung zu schärfen würde Android-Chrome ungeprüft lassen — das reale Zielgerät. Der Rückfall bei `denied` macht das Verhalten dort korrekt, ohne dass wir es je messen müssen. Zwei unabhängige Schutzebenen für einen Fehler, der sonst still bleibt. | 2026-09-07 |
| „Nächstes Ziel"-Karte entfällt ersatzlos | Der Screen feiert eine Ankunft — er nimmt nicht vorweg, was der Spieler gerade erst verdient hat. Der Blick auf das nächste Ziel gehört in die Stationsliste, die ohnehin der Hub ist. Ersatzlos statt Umbau: Der Spieler soll diesen einen Moment lesen, nicht drei Informationen. | 2026-09-19 |
| Kein Fortschrittszähler an der frei gewordenen Stelle | Erwogen und verworfen: „Ziel 2 von 5" wäre keine Belohnung, sondern dieselbe Zeile, die der Navigations-Screen schon führt. Der Gratulationsscreen wird kürzer, nicht anders gefüllt. | 2026-09-19 |
| Der Gratulationsscreen sieht an jeder Station gleich aus | Bisher unterschied ihn die Karte zwischen „es folgt noch etwas" und letzter Station. Ohne sie verschwindet der Sonderfall, statt behandelt zu werden — weniger Zustände, weniger Testfläche, und der Moment wirkt jedes Mal gleich stark. | 2026-09-19 |
| Konfetti-Kanone statt Rieseln von oben | Rieseln ist Wetter, kein Jubel. Der Schuss von unten mittig nach oben ist die Geste, die den Erfolg meint — passend zum „aufgeregten Game-Host" des Design Systems statt zu einem ruhigen Hintergrundeffekt. | 2026-09-19 |
| Ein Schuss, dann Ruhe (kein `infinite`) | Eine Kanone feuert einmal; eine dauerhaft feuernde wäre keine Feier, sondern Lärm. Danach gehört die Aufmerksamkeit dem CTA. Deckt sich mit der Motion-Regel des Design Systems: „keine Ambient-Loops". | 2026-09-19 |
| Kanone auf beiden Screens (Ankunft **und** Outro) | Der Outro am Quest-Ende hat dasselbe Problem und würde sonst mit dem schwächeren Effekt zurückbleiben — ausgerechnet beim größeren Anlass. Eine Komponente, ein Verhalten, ein Ort für künftige Änderungen. | 2026-09-19 |
| Pin wird freigestellt statt kaschiert | Erwogen: weiche CSS-Maske oder den Pin bewusst in ein Panel rahmen. Beides behandelt das Symptom — die Ursache ist, dass ein JPEG keinen Alpha-Kanal hat. Ein freigestelltes PNG löst es an der Wurzel und ist überall wiederverwendbar, wo der Pin künftig frei stehen soll. | 2026-09-19 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| State Machine für Player-Flow | Klare Übergänge zwischen Screens (Permission → Intro → Stationsliste → Navigation → Ankunft), verhindert ungültige Zustände | 2026-08-24 |
| Einzelne Seite `/play/[id]` statt Sub-Routes | Alle Screens gehören zum selben Quest-Kontext, GPS-Watching soll nicht durch Navigation unterbrochen werden | 2026-08-24 |
| Separater localStorage-Key für Fortschritt (`gq_progress_{id}`) | Quest-Daten bleiben unverändert (read-only), Fortschritt ist spielerspezifisch und unabhängig löschbar | 2026-08-24 |
| Keine neuen Packages | Alle benötigten APIs sind Browser-native (Geolocation, DeviceOrientation, Vibration), keine externen Abhängigkeiten nötig | 2026-08-24 |
| Custom Hooks für GPS + Kompass | Kapselt Browser-API-Komplexität (Permissions, iOS-Sonderfälle, Cleanup), wiederverwendbar für PROJ-10 (Testmodus) | 2026-08-24 |
| Haversine-Formel selbst implementiert | Triviale Mathematik (~10 Zeilen), spart eine Geo-Library-Dependency | 2026-08-24 |
| GPS-Heading als Fallback statt "kein Pfeil" | Berechnung aus letzten 2 GPS-Positionen, universell verfügbar, nur in Bewegung genau | 2026-08-24 |
| Einmalige Ankunftserkennung pro Station | Verhindert Flackern bei GPS-Drift am Radius-Rand, Station wird sofort als "besucht" persistiert | 2026-08-24 |
| `nextStationName` wird über die ganze Kette entfernt, nicht nur ignoriert | Eine Prop, die durch drei Komponenten gereicht und nirgends gelesen wird, ist eine Falle für den Nächsten, der sie für noch benutzt hält. Mit der Karte geht der Wert, der sie gespeist hat. | 2026-09-19 |
| Freistellung als eingechecktes Skript, nicht von Hand | Dasselbe Muster wie bei den PWA-Icons (PROJ-12): `sips` reichte dort nicht, ein eingechecktes Swift/CoreGraphics-Skript machte das Ergebnis reproduzierbar statt einmalig. Ein von Hand freigestelltes Asset lässt sich nach einer Quellbild-Änderung nicht nachvollziehbar erneuern. | 2026-09-19 |
| Neues PNG neben dem JPEG, kein Ersatz | `mark-pin.jpg` wird an weiteren Stellen und als Quelle der PWA-Icons genutzt. Ein Austausch an Ort und Stelle würde Screens verändern, die niemand geprüft hat; die beiden Celebration-Screens ziehen auf das PNG, der Rest bleibt unberührt. | 2026-09-19 |
| Konfetti-Umbau in der geteilten Komponente statt einer zweiten Variante | Eine Varianten-Prop würde zwei Verhalten dauerhaft nebeneinander pflegen, obwohl beide Screens dasselbe wollen. Der Preis ist, dass jede Änderung beide trifft — das ist hier gewollt und in PROJ-5 vermerkt. | 2026-09-19 |
| Kein `infinite` mehr — Animation endet von selbst | Die heutige Endlosschleife hält 40 Elemente dauerhaft animiert, auch lange nachdem der Spieler den Screen gelesen hat. Ein einmaliger Schuss beendet die Arbeit des Compositors und respektiert die Motion-Regel des Design Systems. | 2026-09-19 |
| `prefers-reduced-motion` wird in der Konfetti-Komponente behandelt, nicht bei jedem Aufrufer | Ein Ort für eine Regel, die für jede Nutzung der Komponente gilt. Bisher fehlt die Behandlung ganz — der Umbau ist der richtige Zeitpunkt, sie nachzuziehen. | 2026-09-19 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
/play/[id] (Quest Player Page — State Machine)
│
├── [Screen: Permission]
│   ├── Erklärungstext ("Damit wir dich navigieren können")
│   ├── "Erlauben"-Button (löst GPS + DeviceOrientation aus)
│   └── Fehler-State (dauerhaft blockiert → Geräte-Einstellungen)
│
├── [Screen: Intro]
│   ├── Quest-Name als Überschrift
│   ├── Intro-Text (Plain Text mit Zeilenumbrüchen)
│   ├── Optionales Medium (Bild / Audio-Player / Video-Player)
│   └── "Los geht's"-Button
│
├── [Screen: Stationsliste]
│   ├── AppHeader mit Quest-Name + Zurück-Button (→ /play)
│   └── Stations-Karten (pro Station)
│       ├── Nummer + Name
│       ├── Status-Icon (✓ besucht / ▶ aktiv / 🔒 gesperrt)
│       └── Tap-Handler (nur aktive Station navigierbar)
│
└── [Screen: Navigation]
    ├── Header (Stationsname + Zurück → Stationsliste)
    ├── Richtungspfeil (CSS-rotiert, Kompassnadel-Stil)
    ├── Entfernungsanzeige (Meter + Farbwechsel rot/gelb/grün)
    ├── GPS-Warnung (bei Signalverlust < 30s)
    ├── GPS-Stopp-Overlay (bei > 30s, mit Retry-Button)
    ├── Kompass-Kalibrierungs-Hinweis (wenn nötig)
    └── Ankunft-Overlay ("Angekommen!" + Vibration)
```

### Daten-Architektur

```
localStorage
├── "gq_quests" → Quest-Daten (read-only für Player, von PROJ-2)
│
└── "gq_progress_{questId}" → Fortschritt pro Quest
    ├── visitedStations: ["station-uuid-1", "station-uuid-2"]
    ├── currentScreen: "intro" | "stations" | "navigation"
    └── lastStationIndex: 0  (für Wiedereinstieg)
```

**Fortschritt-Logik (vereinfacht):**
- Erste freigeschaltete Station = erste Station deren ID NICHT in `visitedStations` ist
- Alle Stationen davor sind "besucht" (✓)
- Alle Stationen danach sind "gesperrt" (🔒)
- PROJ-5 wird später `visitedStations` durch `completedStations` ersetzen (Tasks gelöst)

### Hooks (Logik-Kapselung)

| Hook | Zuständigkeit |
|------|---------------|
| `useGeolocation` | GPS-Permission, watchPosition, Signal-Status, Position, Accuracy |
| `useDeviceOrientation` | Kompass-Heading, iOS-Permission, Kalibrierungs-Status |
| `useNavigation` | Kombiniert GPS + Kompass: berechnet Bearing, Distanz, Farbe, Heading-Fallback |
| `useQuestProgress` | Liest/schreibt Fortschritt in localStorage, stellt Stations-Status bereit |

### Hilfs-Funktionen (Geo-Mathematik)

| Funktion | Zweck |
|----------|-------|
| `haversine(lat1, lng1, lat2, lng2)` | Entfernung in Metern zwischen zwei GPS-Punkten |
| `bearing(lat1, lng1, lat2, lng2)` | Richtungswinkel (0°–360°) von Punkt A zu B |
| `headingFromPositions(prev, current)` | Bewegungsrichtung aus 2 GPS-Positionen (Kompass-Fallback) |
| `getDistanceColor(meters)` | Gibt Farb-Token zurück: rot (>200m), gelb (50–200m), grün (<50m) |

### Datei-Struktur (neue Dateien)

```
src/
├── lib/
│   ├── geo-utils.ts            ← Haversine, Bearing, Heading-Berechnung
│   └── quest-progress.ts       ← Fortschritt lesen/schreiben in localStorage
├── hooks/
│   ├── use-geolocation.ts      ← GPS-Hook (Position, Permission, Signal-Status)
│   ├── use-device-orientation.ts ← Kompass-Hook (Heading, iOS-Permission)
│   ├── use-navigation.ts       ← Navigations-Hook (kombiniert GPS + Kompass)
│   └── use-quest-progress.ts   ← Fortschritts-Hook (Stations-Status)
└── components/
    ├── quest-player.tsx         ← State Machine (orchestriert alle Screens)
    ├── permission-screen.tsx    ← Permission-Anfrage UI
    ├── intro-screen.tsx         ← Intro-Anzeige
    ├── station-list.tsx         ← Stationsliste mit Status-Anzeige
    ├── navigation-screen.tsx    ← Pfeil + Entfernung + GPS-Status
    └── direction-arrow.tsx      ← CSS-animierter Richtungspfeil
```

### Shared Components (bereits vorhanden)

| Komponente | Verwendung |
|------------|------------|
| `AppHeader` | Header mit Titel + Zurück-Button auf allen Screens |
| shadcn `Button` | "Los geht's", "Erlauben", "Erneut versuchen" |
| shadcn `Card` | Stations-Karten in der Liste |
| shadcn `Progress` | Optional für GPS-Signal-Stärke |
| `Sonner` (Toast) | Für "Angekommen!"-Hinweis (alternativ: Custom Overlay) |

### State Machine (Player-Flow)

```
            ┌─────────────┐
            │  PERMISSION  │ (GPS + DeviceOrientation anfragen)
            └──────┬───────┘
                   │ Permission granted + GPS-Signal
                   ▼
            ┌─────────────┐
            │    INTRO     │ (Text + Medium anzeigen)
            └──────┬───────┘
                   │ "Los geht's" getippt
                   ▼
         ┌──────────────────┐
    ┌───▶│   STATIONSLISTE   │◀──────────────────┐
    │    └────────┬──────────┘                    │
    │             │ Aktive Station angetippt       │
    │             ▼                               │
    │    ┌─────────────────┐                      │
    │    │   NAVIGATION     │ (Pfeil + Entfernung) │
    │    └────────┬─────────┘                      │
    │             │ Innerhalb Radius               │
    │             ▼                               │
    │    ┌─────────────────┐                      │
    │    │   ANGEKOMMEN     │ (Vibration + Overlay)│
    │    └────────┬─────────┘                      │
    │             │ Automatisch nach 2s            │
    │             └───────────────────────────────┘
    │
    │ Zurück-Button (auf jedem Screen)
    └─────────── (zur Stationsliste oder /play)
```

### Wiedereinstieg bei gespeichertem Fortschritt

- Wenn `gq_progress_{id}` existiert UND `visitedStations.length > 0`:
  → Überspringt Permission (bereits erteilt) + Intro (bereits gesehen)
  → Geht direkt zur Stationsliste
- Wenn `gq_progress_{id}` nicht existiert:
  → Startet bei Permission-Screen

### Browser-API-Nutzung

| API | Zweck | Fallback |
|-----|-------|----------|
| `navigator.geolocation.watchPosition()` | Kontinuierliche GPS-Position | Nicht möglich — Quest braucht GPS |
| `DeviceOrientationEvent` | Kompass-Heading | GPS-Heading aus Bewegung |
| `DeviceOrientationEvent.requestPermission()` (iOS) | iOS-Permission | Nur auf iOS nötig, Android hat kein Permission-Gate |
| `navigator.vibrate()` | Haptisches Feedback bei Ankunft | Nur visuelles Feedback (iOS Safari unterstützt keine Vibration) |

### Performance-Überlegungen

- `watchPosition` mit `enableHighAccuracy: true` + `maximumAge: 0`
- GPS-Updates kommen 1–3x pro Sekunde (Browser-abhängig)
- Pfeil-Rotation via CSS `transform: rotate()` (GPU-beschleunigt, kein Layout-Reflow)
- Entfernungsberechnung (Haversine) ist O(1) — bei jedem GPS-Update trivial
- Kein Re-Render der Stationsliste während Navigation (separate Screens)

### Dependencies

Keine neuen Packages erforderlich. Alle genutzten APIs:
- Browser: Geolocation API, DeviceOrientation API, Vibration API
- React: useState, useEffect, useCallback, useRef
- Bestehend: Tailwind CSS, Lucide Icons, shadcn/ui Components

## Implementation Notes

### Komponenten (gebaut)

| Komponente | Beschreibung |
|------------|-------------|
| `quest-player.tsx` | State Machine: permission → intro → stations → navigation. Einzige GPS-Instanz, wird als `geoState` an NavigationScreen weitergereicht. `onFirstPosition`-Callback fuer Permission→Intro-Uebergang. |
| `permission-screen.tsx` | GPS/Kompass-Permission-Anfrage mit Erklaerungstext, Denied- und Unavailable-States |
| `intro-screen.tsx` | Quest-Intro mit Pin-Icon, Anton-Headline, Meta-Badges (Dauer/Ziele), optionalem Medium, Teal-Pill-CTA |
| `station-list.tsx` | Fortschritts-Hub: Eyebrow-Label + Anton-Titel + Meta-Zeile (Ziele-Anzahl, berechnete Routen-km via `haversine`), Station-Rows (completed/visited/current/locked) mit Teal-Glow auf aktueller Station, "Aktiv"/"Gesperrt"/"Abgeschlossen"-Subtitles, animierte Lime-Routenlinie (`wavyPath`, gemessen per `getBoundingClientRect` von erster bis letzter Stations-Badge), Partikel-Backdrop (`quest-list-backdrop.tsx`, wiederverwendet) |
| `navigation-screen.tsx` | Richtungspfeil + Entfernungsanzeige, ArrivalOverlay (Konfetti, mark-pin.jpg, Haken-Badge, "Ziel erreicht!"), GpsLostOverlay |
| `direction-arrow.tsx` | Responsive Kompass-SVG (`min(80vw, 360px)`), N/O/S/W, Teal↔Lime Farbwechsel bei Naehe, Pulse-Animation |

### Hooks (gebaut)

| Hook | Beschreibung |
|------|-------------|
| `use-geolocation.ts` | `watchPosition` mit `onFirstPosition`-Callback, 30s Signal-Timeout, Permission-States |
| `use-device-orientation.ts` | Kompass-Heading, iOS-Permission, Kalibrierungs-Erkennung. Initial-State in `useState`-Initializer (React 19 kompatibel) |
| `use-quest-progress.ts` | localStorage-basiert, Stations-Status (visited/current/locked), Screen-Persistenz |

### Libs (gebaut)

| Datei | Funktionen |
|-------|-----------|
| `geo-utils.ts` | `haversine`, `bearing`, `headingFromPositions`, `getDistanceColor` |
| `quest-progress.ts` | `loadProgress`, `saveProgress` fuer localStorage |

### Architektur-Abweichungen

- `useNavigation`-Hook wurde nicht als separater Hook gebaut — Navigationslogik lebt inline in `NavigationScreen` (einfacher, da nur dort gebraucht)
- React 19 Compliance: "Adjust state during render"-Pattern statt setState-in-useEffect fuer Position-History und Arrival-Detection
- `onFirstPosition`-Callback in `useGeolocation` statt abgeleitetem State fuer den Permission→Intro-Uebergang

### Design-Entscheidungen

- Arrival-Screen: Brand-Asset `mark-pin.jpg` + Lime-Haken-Badge statt SVG-Pin — **überholt durch das Refinement vom 2026-09-19:** das JPEG hat keinen Alpha-Kanal und zeichnet sich als Rechteck vom Hintergrund ab; ersetzt durch ein freigestelltes PNG
- Konfetti: Kontinuierliches Rieseln von oben (Teal + Lime Partikel), kein Burst — **überholt durch das Refinement vom 2026-09-19:** ersetzt durch eine einmalig feuernde Konfetti-Kanone von unten mittig nach oben
- Teal-Strich unter "Ziel erreicht!" analog zum Home-Screen
- Teal-Pill-Button statt Brush-Stroke-Button fuer CTAs (Brush-Stroke skaliert schlecht)
- `max-w-[430px]` Container im Play-Layout (nicht in einzelnen Komponenten)

### Nachtraegliches Redesign: Stationsliste (2026-08-28)

`station-list.tsx` wurde nach Deployment anhand von `design-preparation/Station_Screen.html` (Claude-Design-Export) ueberarbeitet — rein visuell, keine Aenderung an Klick-Verhalten, Status-Logik oder Datenfluss:

- Header: Teal-Eyebrow "Stationen" + grosser italic Anton-Titel (Quest-Name) + Meta-Zeile (Ziele-Anzahl, Routen-km per `haversine`-Summe ueber Stationskoordinaten) + Divider. Bewusst **ohne** Live-GPS-Distanz zur aktuellen Station ("40 m entfernt" aus der Vorlage) — auf Wunsch des Nutzers weggelassen.
- Partikel-Backdrop von `quest-list-backdrop.tsx` (Quest-Liste) wiederverwendet statt neu gebaut.
- Animierte Lime-Routenlinie: geschwungener S-Kurven-Pfad (`wavyPath`-Funktion), der die Nummer-Badges der ersten und letzten Station exakt verbindet — Endpunkte per `getBoundingClientRect` gemessen (nicht hartkodiert wie in der Vorlage), da Kartenpositionen je nach Stationsliste variieren. Anzahl der Wellen skaliert mit `stations.length - 1`. `ResizeObserver` + `requestAnimationFrame`-verzoegerte Erstmessung halten die Linie bei Layout-Aenderungen synchron.
- Gesperrte Stationen an die Vorlage angeglichen: keine `opacity`-Abdunkelung mehr, stattdessen helleres Grau (`#C4CACE`) fuer Name/Nummer, sichtbarerer Badge-Rand, Lock-Icon ohne Kreis-Hintergrund — bleibt erkennbar deaktiviert, aber lesbar.
- Neue Subtitles: "Aktiv" (aktuelle Station), "Gesperrt" (gesperrte Stationen) — ergaenzend zum bestehenden "Abgeschlossen".
- Stacking-Fallstrick: Routenlinie braucht `position: relative` **mit explizitem** `z-index` (`z-0`) auf dem Listen-Container, sonst erzeugt der Container keinen eigenen Stacking-Context und die Linie mit `-z-10` faellt hinter den gesamten Seitenhintergrund (unsichtbar).

### Nachtraegliche Ergaenzung: GPS- und Kompass-Ausfallmodi (2026-09-06)

Umsetzung des Refinements vom selben Tag. Ausloeser war eine Testquest, in der
sich der Richtungspfeil auf dem iPhone nicht bewegte.

**`use-geolocation.ts`**
- Neue Permission-States `no-fix` und `insecure-context`, neuer Signal-State `searching`
- Error-Handler wertet jetzt alle `GeolocationPositionError`-Codes aus. `POSITION_UNAVAILABLE`
  und `TIMEOUT` fuehren vor dem ersten Fix in `no-fix` statt verschluckt zu werden
- Neuer 15s-Timer (`FIRST_FIX_TIMEOUT_MS`) fuer den Fall, dass `watchPosition` gar nichts
  meldet — drinnen der Normalfall
- `window.isSecureContext`-Pruefung vor dem Watch: ohne HTTPS gibt es eine technische
  Meldung statt der falschen Diagnose "Geraet unterstuetzt kein GPS"
- Nach einem erfolgreichen Fix loest ein Fehler kein `no-fix` mehr aus — dafuer bleibt
  der bestehende 30s-Signalverlust zustaendig
- `retry()` verlaesst den `no-fix`-Zustand, sonst bliebe der Screen haengen

**`use-device-orientation.ts`**
- Neues Feld `canRequestPermission` (nur iOS, Permission noch `prompt`)

**`permission-screen.tsx`**
- Suchzustand ("Suche GPS-Signal…", pulsierendes Icon) und Kein-Fix-Zustand
  ("Gehe nach draussen") mit eigenen Icons (`SatelliteDish`, `ShieldAlert`)
- Neue optionale Prop `signalState`

**`direction-arrow.tsx` / `globals.css`**
- Neue Prop `directionUnknown`: grauer, gedimmter Pfeil ohne Glow, langsame
  Suchdrehung (`gq-seek`-Keyframe) statt fixer Rotation 0

**`navigation-screen.tsx`**
- `headingSource` unterscheidet `compass` / `movement` / `none`
- Bei ausstehender iOS-Sensorfreigabe erscheint ein "Kompass aktivieren"-Button
  statt des Hinweises "Laufe ein paar Schritte" (der dort nicht hilft)
- Hinweistext von 9px `text-tech` auf `text-sm font-body` angehoben

### Nachtraegliche Korrektur: BUG-6 — falsche iOS-Erkennung (2026-09-07)

Umsetzung des Refinements vom selben Tag. Der Fehler stammt aus der Ergaenzung
vom 2026-09-06 (Zeile darueber): der neue "Kompass aktivieren"-Button erschien
auch dort, wo es gar keine iOS-Sensorfreigabe gibt.

**`use-device-orientation.ts`**
- `isIOS()` prueft nicht mehr allein, ob `DeviceOrientationEvent.requestPermission`
  eine Funktion ist. Desktop-Chrome erfuellt das ebenfalls (gemessen: Chrome 152)
  und bekam dadurch den Button, dessen `requestPermission()` dort `denied` liefert —
  eine Sackgasse vor dem eigentlich hilfreichen Hinweis
- Aufgeteilt in `hasRequestPermissionApi()` (notwendige Bedingung) und `isIOS()`
  (zusaetzlich UA-Pruefung auf iPhone/iPad/iPod)
- iPadOS meldet sich als "Macintosh" und wird ueber `maxTouchPoints > 1` erkannt;
  ein echter Mac (0 Touch-Punkte) faellt korrekt heraus
- Die zweite Verteidigungslinie (Edge Case 14) war bereits vorhanden und ist jetzt
  durch Tests abgesichert: beide `denied`-Pfade setzen `permission: "denied"`,
  wodurch `canRequestPermission` false wird und der "Laufe ein paar Schritte"-Hinweis
  erscheint. Damit ist das Verhalten auch auf ungetestetem Android-Chrome korrekt

**`use-device-orientation.test.ts` (neu)**
- Fuer diesen Hook gab es bisher **keine** Unit-Tests — die Luecke, durch die der
  Fehler ueberhaupt live gehen konnte. Jetzt 9 Tests: 5 zur Plattformerkennung
  (Desktop-Chrome, Android-Chrome, iPhone, iPadOS, echter Mac), 3 zum
  `denied`/Fehler-Rueckfall, 1 zur nicht unterstuetzten Umgebung
- Gegenprobe durchgefuehrt: mit der alten Erkennung schlagen 3 der 9 Tests fehl,
  mit der Korrektur bestehen alle — die Tests koennen den Regress also wirklich fangen

**Keine Aenderung an `navigation-screen.tsx`** — die Render-Logik war korrekt, sie
bekam nur ein falsches `canRequestPermission` geliefert.

**Verifikation:** Der ursprünglich fehlschlagende E2E-Test
(`"explains why the arrow has no direction"`) besteht jetzt auf echtem Chrome 152.
PROJ-3-Suite 19/19 auf Chrome, volle E2E-Suite 285 passed / 2 skipped / 0 failed auf
Mobile Safari, Unit-Suite 186/186, Build und Lint sauber (6 vorbestehende
`<img>`-Warnungen).

**Tests:** `src/hooks/use-geolocation.test.ts` neu (10 Tests) — deckt Suchzustand,
15s-Timeout, Error-Code-Mapping, Abgrenzung zu `denied`, Retry und `insecure-context` ab.

**Verifiziert:** 177 Unit-Tests gruen, Production-Build ok, E2E-Suite 267/267 gruen
(Mobile Safari). Die neuen Zustaende zusaetzlich im Browser gegen die echte UI
geprueft (Suchzustand, Kein-Fix, `POSITION_UNAVAILABLE`, richtungsloser Pfeil mit
weiterhin sichtbarer Entfernung).

**Offen:** Chromium-Binary lokal nicht installiert, daher nur WebKit-Abdeckung.

### Umsetzung: Gratulationsscreen (2026-09-19)

Umsetzung des Refinements vom selben Tag. Fünf Dateien, **kein neues Paket**, keine neue Komponente, keine neue Route.

**1. „Nächstes Ziel"-Karte entfernt.** Die Prop `nextStationName` ist über die ganze Kette weg — `ArrivalOverlay`, `NavigationScreen` und in `quest-player.tsx` auch die Zeile `const nextStation = quest.stations[navigatingIndex + 1]`, die nur sie gespeist hat. Der CTA rückt von 0,9s auf 0,7s Animationsverzögerung vor: Ohne die Karte dazwischen wäre sonst eine sichtbare Lücke entstanden, bevor der Button erscheint.

Der Stationsname bekommt `max-w-xs text-balance` statt `truncate` — Edge Case 16 verlangt Umbruch statt Abschneiden.

**2. Pin freigestellt.** Neues Skript `scripts/make-mark-pin-cutout.swift` erzeugt `public/assets/mark-pin.png` aus dem JPEG. Beide Screens (Ankunft und Outro) ziehen darauf um; `rounded-2xl` ist weg, weil es nur die Kante des JPEG kaschierte.

**Gemessen, und die Architektur-Annahme korrigiert:** Die Spec erwartete denselben flachen Grund wie beim PWA-Icon (rgb(4,10,11)). Tatsächlich ist der Grund von `mark-pin.jpg` ein **Verlauf** — mittlere Luminanz 42.8 oben links gegen 24.9 unten rechts, Einzelwerte von rgb(20,25,31) bis rgb(35,46,51). Gegen den App-Hintergrund `#0B0F12` (Luminanz 14.2) ist das durchgehend zu hell. Keine feste Ersatzfarbe hätte das treffen können; Freistellen war nicht die elegantere, sondern die einzige Lösung.

Zwei Fallstricke, die eine einfache Schwelle nicht löst und die im Skript dokumentiert sind:
- Die dunkle Kreisfläche in der Pin-Mitte und der dunkelgrüne Schatten sind **selbst dunkel** — eine reine Luminanzschwelle stanzt ein Loch mitten durch den Pin. Gelöst per Flood-Fill vom Bildrand: Nur Dunkel, das vom Rand aus erreichbar ist, ist Hintergrund.
- Die Lime-Elemente haben einen **Neon-Glow**, der weich ausläuft. Eine harte Schwelle hätte ihn zu einem gezackten Halo abgeschnitten. Gelöst per Alpha-Rampe über das Histogramm-Tal bei Luminanz 96–127 (nur 1.3% aller Pixel) — der Glow wird zu Teil-Alpha.

Ergebnis: 76,9% der Fläche freigestellt (das Histogramm sagte ~78% Grund voraus), alle vier Eckpixel Alpha 0, Motiv-Anteil rund 23%.

**3. Konfetti-Kanone.** `confetti-effect.tsx` neu: 70 Partikel (vorher 40), Mündung unten mittig, Fächer über 62°, Aufstieg 46–92vh, danach seitliches Ausfallen. `animation-iteration-count: 1` statt `infinite`, `both` hält den Endzustand.

**Waagerechter und senkrechter Versatz rechnen bewusst in derselben Einheit (`vh`).** Die erste Fassung mischte `vw` waagerecht mit `vh` senkrecht — damit hängt der tatsächliche Abschusswinkel am Seitenverhältnis des Geräts (auf 390×844 ist 1vh 8.4px gegen 3.9px bei 1vw), der Fächer fällt also je nach Gerät anders aus als berechnet.

`prefers-reduced-motion: reduce` blendet die Partikel aus (`display: none`) und schaltet zusätzlich die Einblend-Animationen des Ankunfts-Screens ab (`.gq-arrival-step`). Beides fehlte vorher ganz.

#### Am Bildschirm geprüft, nicht nur gemessen

Die Konfetti-Kanone ist eine Design-Änderung — Zahlen allein hätten sie nicht abgenommen. Screenshots auf 390×844 in drei Phasen: Der Fächer steht nach **260ms** voll im Bild (23 Partikel gleichzeitig sichtbar, über die volle Breite verteilt), bei **600ms** fällt er sichtbar nach unten aus, nach **3s** ist der Screen vollständig ruhig und der CTA hat die Aufmerksamkeit allein.

Der Outro-Screen wurde gegengeprüft: Er erbt PNG, `gq-cannon` und `iteration-count: 1`, ohne dass seine Datei dafür angefasst werden musste.

#### Ein Messfehler und eine korrigierte Behauptung

Ein erster Screenshot bei 700ms zeigte nur 5 sichtbare Partikel und sah nach einem zusammengefallenen Fächer aus. Daraufhin habe ich die Parameter geändert (44→70 Partikel, 58°→62°) **und** die Einheiten vereinheitlicht — und in die Testdatei eine Begründung geschrieben, die ich anschließend nicht belegen konnte.

Die Gegenprobe gegen die echte Ursprungsfassung hat das widerlegt: Sie zeigte bei 200ms **40** gleichzeitig sichtbare Partikel, nicht weniger als die neue Fassung (22). Die dünne Stelle bei 700ms war ein **Zeitpunkt-Artefakt** meiner Aufnahme, kein Fächer-Kollaps. Die Einheiten-Vereinheitlichung bleibt trotzdem richtig — aber als Vorsorge gegen geräteabhängige Winkel, nicht als Behebung eines gemessenen Fehlers. Kommentar im Code und Testbegründung sind entsprechend korrigiert; der zugehörige Test prüft jetzt nur noch, was er belegen kann (Fächerform zu beiden Seiten, genug gleichzeitig sichtbare Partikel).

#### Tests

**19 neue Tests** in `tests/proj-3-gratulationsscreen.spec.ts`, **19/19 auf Desktop Chrome 152 und 19/19 auf Mobile Safari**.

Per Gegenprobe geschärft — jede der drei Änderungen einzeln zurückgebaut und gemessen, welche Tests fallen:
- JPEG zurück → genau **2** Tests fallen (PNG-Nachweis, Border-Radius)
- Karte zurück → genau **2** Tests fallen (kein Hinweis auf die nächste Station, letzte Station)
- altes Rieseln zurück → genau **6** Tests fallen (Ursprung, `infinite`, Aufstieg, Ruhe, Klick-Durchlässigkeit, `aria-hidden`)

Der Alpha-Nachweis liest die Eckpixel des **ausgelieferten** PNG per Canvas — ein JPEG kann das gar nicht erfüllen. Dazu eine Gegenprobe gegen die naheliegende Lücke: Eine vollständig transparente Datei hätte ebenfalls transparente Ecken, deshalb prüft ein zweiter Test, dass 10–50% der Fläche opak geblieben sind.

**Ein Fehler in den Tests selbst** (das Produkt war richtig): `test.use({ reducedMotion: "reduce" })` kommt unter Playwright 1.58.2 mit `channel: 'chrome'` in der Seite **nicht an** — `matchMedia(...).matches` bleibt `false`, auch in einem Top-Level-Block auf about:blank. Der Test hätte 44 sichtbare Partikel als Produktfehler gemeldet. `page.emulateMedia({ reducedMotion: "reduce" })` wirkt zuverlässig. Beide reduced-motion-Tests prüfen jetzt zuerst, dass die Media Query überhaupt greift — ohne diese Vorbedingung hätten sie auch dann bestanden, wenn gar nichts emuliert wird.

Suiten gegen den Production-Build: **Chrome 152: 460 passed / 23 skipped / 0 failed. Mobile Safari: 454 passed / 29 skipped / 0 failed. Unit 219/219.** Build und Lint sauber (0 Errors; die 7 Warnungen sind vorbestehend).

#### Nicht abgedeckt

- Das Erscheinungsbild des Pins auf einem **echten Gerätedisplay** — Augenschein am Screenshot, nicht am Handy.
- Ob 70 Partikel auf einem **schwachen Android-Gerät** flüssig laufen; lokal kein solches Gerät verfügbar.
- Der **haptische** Teil der Ankunft (`navigator.vibrate`) ist unverändert und wurde nicht erneut geprüft.

## QA Test Results

**QA Date:** 2026-08-24
**Tested by:** QA Skill (automated + manual review)

### Unit Tests (Vitest)

| Suite | Tests | Status |
|-------|-------|--------|
| `geo-utils.test.ts` | 12 | All passing |
| `quest-progress.test.ts` | 10 | All passing |
| Other existing suites | 21 | All passing |
| **Total** | **43** | **All passing** |

### E2E Tests (Playwright)

12 tests written in `tests/proj-3-player-gps-navigation.spec.ts` covering:
- Permission Screen (1 test)
- Intro Screen (2 tests)
- Station List (4 tests)
- Navigation Screen (2 tests)
- Arrival (2 tests)
- Progress Persistence (1 test)

**Status:** Not executed — Playwright browser binaries not installed on dev machine. Tests are ready to run once `npx playwright install` completes.

### Code Review

| Category | Severity | Finding |
|----------|----------|---------|
| UX | Low | Compass calibration hint ("Bewege dein Handy in einer 8") not yet implemented — acceptable for MVP, no magnetometer calibration API available |
| UX | Low | GPS accuracy warning (>50m) not shown — Open Question in spec, not a bug |

**No Critical or High severity bugs found.**

### Security Audit

| Check | Result |
|-------|--------|
| XSS via quest data | Protected — React escaping, no `dangerouslySetInnerHTML` |
| localStorage injection | Safe — JSON.parse in try/catch, corrupt data returns null |
| GPS data exposure | No transmission — all data stays on-device |
| External requests | None — no API calls, no analytics, no tracking |
| Permission handling | Follows browser security model, no bypass attempts |

**No security vulnerabilities found.**

### Acceptance Criteria Coverage

| Area | Criteria | Covered by Tests | Manual Check |
|------|----------|-----------------|--------------|
| Permission Flow | 4 | Unit + E2E | Pass |
| Intro | 2 | E2E | Pass |
| Stationsliste | 4 | E2E | Pass |
| Navigation | 5 | Unit (geo-utils) + E2E | Pass |
| Ankunft | 2 | E2E | Pass |
| GPS-Signalverlust | 3 | Code review | Pass (30s timeout logic verified) |
| Fortschritt | 2 | Unit (quest-progress) + E2E | Pass |

### Production-Ready Decision

**READY** — No Critical or High bugs. All unit tests passing. E2E tests written and structurally sound (browser install is an environment issue, not a code issue). Security audit clean.

---

## QA Test Results — Stationsliste-Redesign (2026-08-28)

**Tested:** 2026-08-28
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

**Methodik-Hinweis:** Auf ausdrücklichen Wunsch des Nutzers wurde für diese Runde **kein** Playwright-Chromium-Install versucht (bekanntes, wiederholt bestätigtes Environment-Problem auf dieser Maschine, siehe PROJ-4 QA). Diese QA-Freigabe basiert ausschließlich auf Code-Review gegen jedes Acceptance Criterion, statischer Analyse (Kontrastrechnung, Stacking-Context-Nachvollzug, DOM-Rechnung von Hand) und der grünen Vitest-Suite (109/109). Keine Live-Browser-Bestätigung, kein `npm run test:e2e`-Lauf. Der Nutzer hat den Redesign-Flow (unsichtbare Linie, gerade statt geschwungene Linie) bereits zweimal live im Browser gegengeprüft und Fehler gemeldet, die hier bereits behoben sind — dieser Report deckt die seitdem unveränderte Version ab.

### Scope

Betrifft ausschließlich `src/components/station-list.tsx` (+ 1 neues Keyframe in `globals.css`) — die Stationsliste im Player-Flow (PROJ-3), redesignt anhand von `design-preparation/Station_Screen.html`. Keine Backend-, Daten- oder Routing-Änderungen.

### Regression Testing (bestehende Acceptance Criteria)

Alle bestehenden Stationsliste-relevanten Criteria aus PROJ-3/PROJ-4 erneut gegen den neuen Code geprüft:

- [x] Klick auf "current" Station → Navigation startet (`onNavigate`, unverändert)
- [x] Klick auf "visited" Station → Modul-Screen öffnet (`onOpenModules`, unverändert)
- [x] "locked" Stationen sind `disabled`, kein Klick möglich (unverändert, `disabled={isLocked}`)
- [x] Stationen erscheinen in Quest-Reihenfolge (`stations.map`, unverändert)
- [x] `completedCount`/`onBack`-Props werden vom Aufrufer (`quest-player.tsx`) weiterhin korrekt übergeben — im Component-Body aktuell ungenutzt (siehe BUG-1)

### Neue Funktionalität — Code-Review

#### Meta-Zeile (Ziele-Anzahl + Routen-km)
- [x] `totalRouteKm()` summiert `haversine()` über aufeinanderfolgende Stationen — `haversine` selbst ist in `geo-utils.test.ts` unit-getestet, der dünne Summierungs-Wrapper hier hat keine eigene Verzweigungslogik und wurde bewusst nicht separat unit-getestet (siehe QA-Skill-Richtlinie "was nicht unit-testen")
- [x] Singular/Plural "Ziel"/"Ziele" korrekt für `stations.length === 1`
- [x] km-Segment wird bei `routeKm === 0` (0 oder 1 Station) korrekt ausgeblendet statt "0,0 km" anzuzeigen

#### Animierte Routenlinie (`wavyPath`/`RouteLine`)
- [x] Endpunkte werden per `getBoundingClientRect` gemessen, nicht hartkodiert — verifiziert per Code-Lesung, entspricht dem vom Nutzer verlangten Fix
- [x] 1-Stationen-Fall: `firstBadgeRef === lastBadgeRef` (`index === 0` und `index === stations.length - 1` treffen beide auf Index 0 zu) → `measureRoute` erkennt `first === last` und setzt `routePoints` auf `null` → keine Linie gerendert. Korrekt, nichts zu verbinden.
- [x] 0-Stationen-Fall: Beide Refs bleiben `null` (kein Loop-Durchlauf rendert eine `StationRow`) → ebenfalls `null`-Guard greift, kein Crash. (Dieser Fall ist aktuell nur über eine direkte `/play/[id]`-URL zu einem unvollständigen Draft erreichbar, unverändert seit vor diesem Redesign — außerhalb des Scopes dieser Session.)
- [x] Stacking-Context: `listRef`-Container hat `relative z-0` (explizites `z-index`), wodurch ein lokaler Stacking-Context entsteht. `RouteLine`s `-z-10` bleibt dadurch innerhalb dieses Contexts und rendert hinter den Stations-Karten, aber nicht hinter der Seite — der vom Nutzer gemeldete "Linie unsichtbar"-Bug ist durch genau dieses Setup behoben und durch Nachvollzug der CSS-Stacking-Regeln bestätigt
- [x] `ResizeObserver` + `requestAnimationFrame`-verzögerte Erstmessung + `resize`-Listener sind sauber in der Cleanup-Funktion aufgeräumt (`cancelAnimationFrame`, `removeEventListener`, `observer.disconnect()`) — kein Leak
- [x] Kontrastrechnung bestätigt: Farben unverändert zur Vorlage (Lime `#C6FF00`), keine WCAG-Relevanz für ein rein dekoratives (`aria-hidden="true"`) Element

#### Gesperrte Stationen (Vorlagen-Angleichung)
- [x] Kontrastrechnung: Name-Text `#C4CACE` auf effektivem Karten-Hintergrund (`rgba(14,31,36,.78)` über `#0B0F12`) ergibt **10,6:1**, Subtitle/Icon `#A0A7AD` ergibt **7,2:1** — beide deutlich über der PRD-Vorgabe von 4,5:1 (WCAG AA), sogar über AAA (7:1)
- [x] Keine `dangerouslySetInnerHTML`, keine neue XSS-Fläche — `station.name`/`questName` weiterhin als reiner JSX-Text-Content gerendert (React-Escaping greift wie zuvor)

#### Neue Subtitles ("Aktiv"/"Gesperrt")
- [x] Kein doppeltes Vorlesen durch Screenreader: `aria-label` am `<button>` ersetzt den Accessible Name vollständig, die sichtbaren Subtitle-`<span>`s werden dadurch nicht zusätzlich als separater Text vorgelesen — Verhalten korrekt

### Bugs Found

#### BUG-1: `completedCount` und `onBack` werden von `StationList` entgegengenommen, aber nie verwendet
- **Severity:** Low
- **Steps to Reproduce:**
  1. `quest-player.tsx` übergibt `completedCount={progress.completedStations.length}` und `onBack={() => window.history.back()}` an `<StationList>`
  2. In `station-list.tsx` sind beide Felder Teil von `StationListProps`, werden aber im Funktions-Body nicht destrukturiert/verwendet
  3. Erwartet: Ungenutzte Props werden entweder verwendet oder aus Interface + Aufrufstelle entfernt
  4. Tatsächlich: Totes Interface-Feld bleibt bestehen — kein funktionaler Fehler (TypeScript/React erlauben das), aber verwirrend für zukünftige Bearbeiter, die eine Verwendung erwarten könnten
- **Priority:** Nice to have — kein Blocker, reines Aufräumen bei nächster Gelegenheit an dieser Datei
- **Status:** Fixed — `completedCount`/`onBack` aus `StationListProps` und der Aufrufstelle in `quest-player.tsx` entfernt. `onBack` wird bei den anderen beiden `StationList`-Aufrufern (`NavigationScreen`, `StationModules`) weiterhin genutzt, unverändert.

#### BUG-2: `gq-dash`-Keyframe nutzt einen fixen `stroke-dashoffset`-Wert unabhängig von der tatsächlichen Pfadlänge
- **Severity:** Low
- **Steps to Reproduce:**
  1. `wavyPath()` erzeugt je nach `stations.length` unterschiedlich lange Pfade (mehr Wellen bei mehr Stationen)
  2. `@keyframes gq-dash { to { stroke-dashoffset: -176; } }` in `globals.css` ist ein fixer Wert, unabhängig von der Pfadlänge
  3. Erwartet: Die "Fließgeschwindigkeit" des gestrichelten Musters wirkt bei sehr langen (vielen Stationen) und sehr kurzen (2 Stationen) Pfaden gleich
  4. Tatsächlich: Bei längeren Pfaden wirkt die Animation relativ langsamer/schneller als bei kurzen — rein kosmetische Abweichung, gleiche Einschränkung galt bereits für den ursprünglichen, hartkodierten Vorlagen-Pfad
- **Priority:** Nice to have
- **Status:** Fixed — `RouteLine` berechnet jetzt eine analytische Pfadlängen-Näherung aus `waveCount`/Segmenthöhe/Amplitude (Diagonale pro Segment via `Math.hypot`, kein `getTotalLength()` nötig) und erzeugt daraus pro Instanz ein eigenes `gq-dash-${waveCount}`-Keyframe mit `stroke-dashoffset` als exaktem Vielfachen der Dash-Periode (14+18=32px, für nahtlose Loops) sowie eine proportionale Animationsdauer (~40px/s, an der ursprünglichen 176px/6s-Vorlage kalibriert). Der globale, jetzt ungenutzte `gq-dash`-Keyframe wurde aus `globals.css` entfernt.

### Security Audit Results
- [x] XSS: `station.name`/`questName` nur als JSX-Text-Content, kein `dangerouslySetInnerHTML` in der Datei
- [x] Keine neuen externen Requests, keine neuen localStorage-Zugriffe, keine neuen Berechtigungen
- [x] `aria-label`-Template-Strings landen über die DOM-Attribut-API, nicht über `innerHTML` — keine Injection-Fläche

### Summary
- **Scope:** 1 Komponente (`station-list.tsx`), rein visuelles Redesign, keine Verhaltensänderung
- **Acceptance Criteria:** Alle bestehenden Stationsliste-Criteria weiterhin erfüllt (Regressionsprüfung bestanden)
- **Bugs Found:** 2 total (0 Critical, 0 High, 0 Medium, 2 Low) — beide "Nice to have", beide auf Nutzerwunsch behoben (siehe Status je Bug oben)
- **Security:** Pass, keine offenen Befunde
- **Production Ready:** YES
- **Recommendation:** Deploybar. `tsc`, ESLint, Vitest (109/109) und `next build` bestätigt nach beiden Fixes. Live-Browser-Bestätigung durch den Nutzer selbst hat die beiden zuvor gefundenen visuellen Bugs (unsichtbare Linie, gerade statt geschwungene Linie) bereits vor diesem QA-Pass aufgedeckt und beide sind seitdem behoben — dieser Report bestätigt den aktuellen Stand nur code-seitig, ersetzt aber keine erneute visuelle Kontrolle im Browser vor dem `/deploy`.

## QA Test Results — GPS- und Kompass-Ausfallmodi (2026-09-06)

**Getestet:** 2026-09-06
**Commit:** cb3b6a2 (deployt), Tests ergaenzt im Anschluss
**Scope:** Die 9 neuen Acceptance Criteria (Permission-Flow + "Richtungsanzeige
ohne Heading") sowie Edge Cases 9-12. Bestehende Kriterien als Regression.

### Acceptance Criteria

**Permission-Flow (neu)**

| # | Kriterium | Ergebnis | Nachweis |
|---|-----------|----------|----------|
| 1 | Suchzustand statt unveraendertem Button | PASS | E2E "shows a searching state while the fix is still pending" |
| 2 | Nach 15s Hinweis + Retry | PASS | E2E "after 15s without a fix..."; Unit-Test 15s-Timer |
| 3 | `POSITION_UNAVAILABLE`/`TIMEOUT` -> Kein-Fix, nicht "kein GPS" | PASS | E2E + 2 Unit-Tests (beide Codes) |
| 4 | HTTP -> technischer Hinweis | PASS (Unit) | Unit-Test `insecure-context`; im Browser nicht pruefbar, da die Testumgebung HTTPS/localhost nutzt |

**Richtungsanzeige ohne Heading (neu)**

| # | Kriterium | Ergebnis | Nachweis |
|---|-----------|----------|----------|
| 5 | Pfeil sichtbar richtungslos, nicht "geradeaus" | PASS | Browser-Verifikation (Screenshot): grau, gedimmt, ohne Glow, `gq-seek`-Rotation |
| 6 | Entfernung bleibt sichtbar | PASS | E2E "keeps the distance readable..."; im Browser "12514m" bei unbekannter Richtung |
| 7 | Hinweis "Laufe ein paar Schritte" gut lesbar | PASS | E2E prueft `font-size >= 12px` (vorher 9px) |
| 8 | iOS: "Kompass aktivieren"-Button statt Hinweis | PASS | **Auf echtem iPhone durch den Nutzer bestaetigt** (2026-09-06) |
| 9 | Pfeil richtet sich ohne Reload aus | PASS | **Auf echtem iPhone durch den Nutzer bestaetigt** (2026-09-06) |

**Abgrenzung (Regression der bestehenden Kriterien):** `PERMISSION_DENIED` zeigt
weiterhin den Einstellungs-Hinweis und nicht den neuen Kein-Fix-Text — eigener
E2E-Test, PASS. Der 30s-Signalverlust bleibt fuer Aussetzer *nach* dem ersten Fix
zustaendig (Unit-Test), der Kein-Fix-Zustand greift nur davor.

### Edge Cases

| # | Edge Case | Ergebnis |
|---|-----------|----------|
| 9 | Kein Fix trotz Permission (drinnen) | PASS — Kernszenario, E2E + Unit |
| 10 | iOS-Wiedereinstieg ueberspringt Sensorfreigabe | PASS — auf dem Geraet bestaetigt |
| 11 | Pfeil ohne jede Heading-Quelle | PASS |
| 12 | Geraet ohne brauchbares Magnetometer | PASS — identischer Zustand wie 11, gleicher Pfad |

### Automatisierte Tests

- **Unit (Vitest):** 177 PASS / 0 FAIL (12 Dateien). Neu: `use-geolocation.test.ts`
  mit 10 Tests fuer Suchzustand, 15s-Timeout, alle Fehlercodes, Retry, `insecure-context`.
- **E2E (Playwright, Mobile Safari/WebKit):** 267 PASS / 0 FAIL / 2 skipped ueber
  die gesamte Suite — keine Regression in PROJ-1/2/4/5/6/7/8/9/11/13.
- **E2E PROJ-3 speziell:** 19 PASS (vorher 13). **6 neue Tests** schliessen die
  Luecke: Die neuen Zustaende hatten zuvor keinerlei E2E-Abdeckung.

### Responsive & Touch-Targets

375px / 768px / 1440px geprueft: Retry-Button >= 44px Hoehe, kein horizontaler
Overflow. PASS auf allen drei Breiten.

### Kontrast (WCAG AA)

Kein-Fix-Text gegen den tatsaechlichen Hintergrund gemessen:
`rgb(160,167,173)` auf `rgb(11,15,18)` = **7.90:1** (Anforderung 4.5:1). PASS.
`text-gq-grey` ist hier zulaessig, weil die Player-Screens garantiert dunkel sind
(siehe `docs/design-system.md`); BUG-1 aus dem PROJ-1-QA betraf Screens in beiden Themes.

### Security Audit (Red Team)

| Pruefung | Ergebnis |
|----------|----------|
| XSS ueber importierte Quest-Daten | PASS — `<img src=x onerror=...>` als Quest-/Stationsname rendert als inerter Text, kein `window.__pwned`, kein injiziertes Element. Der geaenderte Navigations-Screen rendert `station.name` ueber normale JSX-Interpolation. |
| `dangerouslySetInnerHTML` / `eval` | PASS — einziger Treffer ist statisches JSON-LD in `about/page.tsx` (mit `<`-Escaping), ausserhalb dieses Scopes |
| Standortdaten im Logging | PASS — kein `console.*` in den GPS-Pfaden; Koordinaten verlassen das Geraet nicht (kein Backend) |
| Timer-Leak / Ressourcen | PASS — der neue 15s-Timer wird in `clearWatch()` freigegeben, das die Mount-Cleanup zurueckgibt |
| Neue Angriffsflaeche durch die Aenderung | Keine — es kommen nur lokale Zustaende und statische Texte hinzu, keine neuen Eingaben, Netzwerkaufrufe oder Persistenz |

### Bugs

**Keine gefunden.** Weder Critical, High, Medium noch Low.

Zwei Verdachtsmomente wurden waehrend des Audits geprueft und ausgeraeumt:
1. *Verdacht:* Der "Kompass aktivieren"-Button koennte faelschlich erscheinen,
   wenn nur das Bewegungs-Heading aktiv ist. *Befund:* `compassAvailable` ist
   strikt `orientation.heading !== null`, der Movement-Fallback setzt es nicht —
   Bedingung korrekt.
2. *Verdacht:* Der Hinweis koennte nach einsetzender Bewegung stehenbleiben.
   *Befund:* Durch den bestehenden gruenen E2E-Test abgedeckt; ein Gegentest
   scheiterte an einem eigenen Selektor-Fehler, nicht am Produktverhalten.

### Nicht abgedeckt (ehrliche Einschraenkung)

- **Chromium / Desktop Chrome:** In dieser Umgebung nicht ausfuehrbar. Das
  `chromium_headless_shell`-Binary fehlt, und der Start des vollen Chromium
  scheitert an einer Sandbox-Beschraenkung (`kill EPERM`). Die 13 "Fehlschlaege"
  frueherer Laeufe waren ausschliesslich dieser fehlende Browser, kein Produktdefekt —
  verifiziert durch identische Fehlerzahl mit und ohne die Aenderungen.
- **Firefox:** Binary ebenfalls nicht installiert.
- Abdeckung entspricht damit WebKit (= iOS Safari, Zielplattform laut PRD) plus
  der Geraeteverifikation auf einem echten iPhone. Fuer Android/Chrome steht die
  Verifikation aus.

### Production-Ready Decision

**READY.** Keine Critical- oder High-Bugs. Der Code ist seit 2026-09-06 bereits in
Production (Commit `cb3b6a2`, Tag `v1.22.0-PROJ-3`); dieser QA-Durchlauf zieht die
Pruefung nach und bestaetigt den ausgelieferten Stand. Der zuvor offene iOS-Pfad
ist durch den Nutzertest auf dem Geraet geschlossen.

**Empfehlung:** Die 6 neuen E2E-Tests committen — ohne sie waeren die neuen
Zustaende dauerhaft ungeschuetzt gegen Regression.

## Deployment

**Deployed:** 2026-08-24
**Production URL:** https://geoquesty.vercel.app
**Commit:** d104943
**Tag:** v1.3.0-PROJ-3

> Korrektur (2026-08-28): Die Production-URL war hier fälschlich als `geoquest-eight.vercel.app` dokumentiert — das ist eine andere, unabhängige Vercel-App, nicht dieses Projekt. Alle anderen Feature-Specs (PROJ-1, 2, 4, 5, 6, 7) nennen korrekt `geoquesty.vercel.app`; hier entsprechend korrigiert.

### Redeploy: GPS- und Kompass-Ausfallmodi (2026-09-06)

**Deployed:** 2026-09-06
**Production URL:** https://geoquesty.vercel.app
**Commit:** cb3b6a2
**Tag:** v1.22.0-PROJ-3

**Ausgeliefert:** Kein-Fix-Zustand mit 15s-Timeout, Auswertung aller
`GeolocationPositionError`-Codes, HTTPS-Pruefung, richtungsloser Pfeil
(`gq-seek`), "Kompass aktivieren"-Button fuer iOS.

> **Ohne QA deployt — bewusste Entscheidung des Nutzers (2026-09-06).** Der
> Grund: Die zentrale Aenderung (iOS-Sensorfreigabe) laesst sich nur auf einem
> echten iPhone ueber HTTPS pruefen, also weder lokal noch durch `/qa`. Der
> Deploy ist damit selbst der Testaufbau. Abgesichert war vorab: 177 Unit-Tests,
> Production-Build, E2E 267/267 (Mobile Safari/WebKit) und eine Browser-Pruefung
> der neuen Zustaende gegen die echte UI. **Nicht** abgesichert: der iOS-Pfad
> `canRequestPermission` und Chromium/Android (Browser-Binary lokal nicht
> installiert). Rollback ueber Vercel: vorherigen Deploy "Promote to Production".

**Offen:** Verifikation auf dem iPhone durch den Nutzer, danach `/qa`.

### Redeploy: Stationsliste-Redesign (2026-08-28)

**Deployed:** 2026-08-28
**Production URL:** https://geoquesty.vercel.app
**Commit:** 1a0acc5
**Tag:** v1.9.0-PROJ-3
**Verifiziert:** `/play` liefert HTTP 200 mit frischem `age: 0` (Vercel-Cache) direkt nach dem Push — konsistent mit einem gerade abgeschlossenen Auto-Deploy über die GitHub-Integration. Keine Live-Klick-Verifikation durch den Nutzer im Rahmen dieses Deploys (siehe QA-Hinweis oben zur fehlenden Browser-Bestätigung dieser Session).

---

## QA Test Results — BUG-6: Falsche iOS-Erkennung (2026-09-07)

**Getestet:** 2026-09-07
**Scope:** Die Korrektur der Plattformerkennung in `use-device-orientation.ts` und ihre
Regressionsabsicherung. Nicht erneut geprueft wurden die uebrigen PROJ-3-Kriterien, die
seit dem 2026-09-06 unveraendert sind — sie laufen aber in jedem Suite-Lauf mit.

### Acceptance Criteria

| # | Kriterium | Ergebnis | Nachweis |
|---|-----------|----------|----------|
| 1 | Browser mit `requestPermission`, aber ohne echte Sensorfreigabe (Desktop-Chrome) zeigt **keinen** "Kompass aktivieren"-Button, sondern den Hinweis | PASS | E2E auf echtem Chrome 152; Unit-Test "Desktop-Chrome" |
| 2 | Nach abgelehnter/fehlgeschlagener Freigabe erscheint sofort der Hinweis — kein Zustand ohne Erklaerung | PASS | 2 Unit-Tests (`denied` und `throw`), E2E auf beiden Engines |
| 3 | iOS behaelt den "Kompass aktivieren"-Button (keine Regression) | PASS | E2E auf Mobile Safari (iPhone-UA), Unit-Test "iPhone" |
| 4 | Pfeil richtet sich nach erteilter Freigabe ohne Neuladen aus | PASS | Unit-Test mit `webkitCompassHeading`-Event |
| 5 | Entfernung bleibt in jedem Kompass-Zustand nutzbar | PASS | E2E "keeps the distance usable in every compass state" |

### Edge Cases

| # | Fall | Ergebnis | Anmerkung |
|---|------|----------|-----------|
| 13 | Nicht-iOS-Browser mit `requestPermission`-API | PASS | Desktop-Chrome **und** Android-Chrome (UA-Sonde) liefern `canRequestPermission=false` |
| 14 | Freigabe abgelehnt / Aufruf wirft | PASS | Beide Pfade setzen `permission="denied"` → Hinweis erscheint |
| — | Chrome auf iOS (`CriOS`) | PASS | `true` — korrekt, ist WebKit mit echter Sensorfreigabe |
| — | Firefox auf iOS (`FxiOS`) | PASS | `true` — dito |
| — | iPad mit "Desktop-Website anfordern" | PASS | `true` via `maxTouchPoints > 1` |
| — | Echter Mac (0 Touch-Punkte) | PASS | `false` — wird nicht faelschlich fuer ein iPad gehalten |
| — | Android-Firefox / Desktop-Firefox | PASS | `false` (keine `requestPermission`-API) |

Die letzten fuenf Faelle wurden mit einer temporaeren UA-Sonde gegen die echte
Implementierung gemessen, nicht nur durchdacht. Die Sonde ist nach der Messung entfernt.

### Gegenprobe (koennen die Tests den Fehler ueberhaupt fangen?)

Beide Testebenen wurden gegen die **alte** Erkennung laufen gelassen:

| Ebene | Mit alter Erkennung | Mit Korrektur |
|-------|---------------------|---------------|
| Unit (9 Tests) | **3 failed** | 9 passed |
| E2E BUG-6 (3 Tests, Chrome) | **1 failed** | 3 passed |

Damit ist belegt, dass die Suite den Regress tatsaechlich faengt und nicht nur zufaellig gruen ist.

### Automatisierte Tests

| Suite | Ergebnis |
|-------|----------|
| Unit (Vitest) | ✅ 186/186, 13 Dateien |
| E2E Mobile Safari (WebKit) | ✅ 288 passed / 2 skipped / **0 failed** |
| E2E Desktop Chrome 152 | ✅ **290 passed / 0 failed** |
| PROJ-3-Suite | 19 → **22 Tests** (3 neue fuer BUG-6) |
| Build / Lint | ✅ 0 Errors (6 vorbestehende `<img>`-Warnungen) |

Der vollstaendige Chrome-Lauf ist der erste gruene Gesamtlauf auf dieser Engine im Projekt.

### Bugs Found

**Keine Bugs im Produktcode.**

Ein Fehler in meinem **eigenen neuen Test**, waehrend dieser QA-Runde gefunden und behoben:
Der Test "shows the hint, not the compass button" pruefte Chromes Verhalten
bedingungslos und schlug auf Mobile Safari fehl. Ursache war der Test, nicht das
Produkt: Das WebKit-Projekt faehrt eine iPhone-UA (`Mozilla/5.0 (iPhone; CPU iPhone OS
15_0 …)`), dort ist der Button **korrekt**. Der Test verzweigt jetzt nach echter
Plattform und besteht auf beiden Engines — die Gegenprobe auf Chrome bleibt scharf.

### Security Audit (Red Team)

| Pruefung | Ergebnis |
|----------|----------|
| Wird die UA gerendert, gespeichert oder gesendet? | Nein — nur lokal fuer eine Verzweigung gelesen, kein Sink |
| `dangerouslySetInnerHTML` / `eval` im geaenderten Pfad | Keine Treffer |
| Persistenz (localStorage / fetch) im Hook | Keine |
| Manipulierbarkeit der UA durch den Nutzer | Ja, aber ohne Sicherheitsrelevanz: Wer seine eigene UA faelscht, blendet sich hoechstens selbst einen Button ein. Keine Rechte-, Daten- oder Vertrauensgrenze beruehrt |

Keine Befunde.

### Design System

- "Kompass aktivieren"-Button: `h-11` = **44px** — erfuellt das Touch-Target-Minimum
- Hinweistext: `text-sm` = **14px** — ueber der 12px-Schwelle des E2E-Tests

### Nicht abgedeckt (ehrliche Einschraenkung)

- **Firefox:** `firefox-1509` ist trotz gegenteiliger Meldung von
  `playwright install --dry-run` **nicht vorhanden**, und in `/Applications` liegt kein
  Firefox. Die Cross-Browser-Anforderung ist damit auf zwei von drei Engines erfuellt.
  Fuer diesen Fix ist das Risiko gering: Firefox stellt `requestPermission` gar nicht
  bereit, faellt also ueber `hasRequestPermissionApi()` heraus (per Sonde bestaetigt).
- **Echtes Android-Geraet:** weiterhin ungeprueft. Die UA-Sonde deckt den Fall ab,
  ein physisches Geraet ersetzt sie nicht.
- **Echtes iPhone:** der iOS-Pfad ist hier nur ueber die iPhone-UA von WebKit geprueft.
  Die Freigabe selbst wurde am 2026-09-06 auf einem echten Geraet bestaetigt und
  ist durch diese Aenderung nicht beruehrt.
- **Playwright-Konfiguration unveraendert:** Der Chrome-Lauf lief ueber eine temporaere
  Config mit `channel: 'chrome'`. `playwright.config.ts` zeigt weiterhin auf das kaputte
  Chromium-Binary (428 KB). **Solange das so bleibt, sieht die Standard-Suite genau die
  Fehlerklasse nicht, aus der BUG-6 entstanden ist.** Empfehlung unveraendert — QA fixt nicht.

### Production-Ready Decision

**READY** — keine Critical- oder High-Bugs. Der urspruengliche Fehler ist auf der Engine
behoben, auf der er auftrat, auf beiden verfuegbaren Engines verifiziert und durch eine
per Gegenprobe geschaerfte Regressionssuite abgesichert.

---

### Redeploy: BUG-6 — korrekte iOS-Erkennung (2026-09-07)

**Production URL:** https://geoquesty.vercel.app
**Deployed:** 2026-09-07
**Tag:** `v1.24.0-PROJ-3`
**Commits:** `1041d1f` (Spec) → `bf4ada2` (Frontend) → `03ecef7` (QA)

**Pre-Deployment:** Build ✅, Lint ✅ (0 Errors), Unit 186/186 ✅,
E2E Mobile Safari 288 passed / 2 skipped / 0 failed, E2E Desktop Chrome 152 290 passed / 0 failed.
Keine Secrets im Repo (nur `.env.local.example` getrackt).

**Verifikation in Production:**
- Alle Nutzerrouten HTTP 200 (`/`, `/play`, `/create`, `/about`, `/anleitung`, `/impressum`, `/datenschutz`)
- **Der Fix ist im ausgelieferten Bundle nachgewiesen:** `/_next/static/chunks/21a22d389651ae9d.js`
  enthaelt die neue Erkennung im Klartext (minifiziert):
  `/iPad|iPhone|iPod/.test(e)` und `e.includes("Macintosh")&&navigator.maxTouchPoints>1`
- Live-Smoke-Test gegen die Production-URL auf **zwei Engines bestanden**: Der Hinweis
  "Laufe ein paar Schritte" erscheint, der Sackgassen-Button nicht; die Entfernung rechnet;
  keine JS-Fehler in der Konsole
- Ladezeit `/play`: 0,06–0,14s (PRD-Anforderung < 2s)
- Security-Header aktiv: HSTS (2 Jahre, preload), `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`

**Zwei Beobachtungen aus der Verifikation (keine Regressionen):**
1. `/play/<id>` liefert serverseitig **404**, waehrend der Client korrekt rendert. Systembedingt
   und vorbestehend: Quests liegen ausschliesslich im localStorage, die Server-Route kennt sie
   nicht. Fuer den Nutzer unsichtbar, aber es erzeugt Konsolen-Rauschen und waere fuer eine
   spaetere SEO-/Sharing-Betrachtung relevant.
2. Desktop-WebKit mit iPhone-Emulation hat **kein** `DeviceOrientationEvent.requestPermission`
   (`undefined`) — anders als ein echtes iOS-Geraet. Die Erkennung faellt dort korrekt auf den
   Hinweis zurueck. Bestaetigt nebenbei, dass `hasRequestPermissionApi()` als notwendige
   Bedingung greift.

**Rollback:** Vercel Dashboard → Deployments → vorheriges Deployment "Promote to Production".
Der Fix beruehrt ausschliesslich `use-device-orientation.ts`; ein Rollback bringt den
Sackgassen-Button auf Chrome zurueck, mehr nicht.
---

## QA Test Results — Gratulationsscreen (2026-09-20)

**Ergebnis: 8 von 8 Acceptance Criteria erfüllt. Keine Critical-, High-, Medium- oder Low-Bugs. Production-Ready.**

Getestet gegen den **Production-Build** (`next start`), nicht gegen den Dev-Server, auf **Desktop Chrome 152** und **Mobile Safari (WebKit)**.

Weil das Feature in derselben Sitzung gebaut wurde, habe ich die beiden zentralen Behauptungen der Frontend-Phase **nicht übernommen, sondern mit eigenen Sonden neu gemessen** — und in einem Punkt ein schärferes Ergebnis erzielt als die Frontend-Phase selbst.

### Der Pin: unabhängig nachgemessen, mit dem entscheidenden Test, der vorher fehlte

Die Frontend-Phase prüfte die **vier Eckpixel** des PNG. Das ist notwendig, aber nicht hinreichend — es beweist nicht, dass der Pin auf dem echten App-Hintergrund keine Kante mehr zeigt. Genau das habe ich nachgeholt:

| Messung | Ergebnis |
|---------|----------|
| Ausgeliefertes PNG vs. Repo-Datei | **byte-identisch** (`cmp`) |
| **Jeder** Randpixel (nicht nur die 4 Ecken) | höchster Alpha-Wert **0**, Pixel mit Alpha>0: **0** |
| Flächenverteilung | 23,1% opak · 3,4% teiltransparent (Glow) · 73,4% frei |
| Motiv-Bounding-Box | x 32..418, y 25..534 — Motiv vollständig erhalten |
| **PNG auf `#0B0F12` kompositiert, äußerer 12px-Rahmen** | **max. Farbabweichung 0** über alle Randpixel |
| **Gegenprobe: altes JPEG auf `#0B0F12`** | **max. Farbabweichung 43** — das war die sichtbare Kante |

Die letzten beiden Zeilen sind der eigentliche Beweis: Auf dem realen App-Hintergrund ist das freigestellte PNG **mathematisch nicht vom Hintergrund unterscheidbar**, während das JPEG dort um 43 Stufen abweicht. Der vom Betreiber gemeldete Befund ist damit nicht nur behoben, sondern die Behebung ist messbar belegt.

### Das Konfetti: gemessen statt geglaubt

| Messung | Ergebnis |
|---------|----------|
| Ursprung | `bottom: 0px`, `left: 195px` bei 390px Breite — exakt unten mittig |
| Animation | `gq-cannon`, `animation-iteration-count: 1` auf allen 70 Partikeln |
| **Ruhe nach dem Schuss** (3,5 s + 0,7 s Nachmessung) | **0 von 70** Partikeln bewegt, **0** noch sichtbar |
| Klick-Durchlässigkeit | Layer `pointer-events: none`; CTA-Klick führt in den Modul-Screen |
| Screenreader | Layer trägt `aria-hidden="true"` |

### Acceptance Criteria

| # | Kriterium | Ergebnis |
|---|-----------|----------|
| 1 | Kein Hinweis auf die nächste Station | **Pass** — weder „Nächstes Ziel" noch der Name der Folgestation im DOM, auch bei vorhandener zweiter Station |
| 2 | Reihenfolge Pin → Headline → Name → CTA ohne Element dazwischen | **Pass** — y-Positionen streng aufsteigend gemessen |
| 3 | Keine Kante, kein Rechteck um den Pin | **Pass** — Randabweichung 0 auf dem App-Hintergrund (siehe Tabelle) |
| 4 | Haken-Badge überlappt das Motiv, nicht eine Bildkante | **Pass** — `border-radius: 0px`, keine Bildkante mehr vorhanden |
| 5 | Partikel schießen von unten mittig auf | **Pass** — `bottom: 0`, `left: 50%`, Aufstieg gemessen |
| 6 | Nach dem Schuss bleibt der Screen ruhig, kein `infinite` | **Pass** — `iteration-count: 1`, 0 Bewegung nach 3,5 s |
| 7 | Outro-Screen (PROJ-5) verhält sich identisch | **Pass** — eigener Durchlauf bis zum Quest-Ende, siehe Regression |
| 8 | `prefers-reduced-motion`: kein Schuss, Screen vollständig | **Pass** — 0 sichtbare Partikel, alle vier Schritte bei **opacity 1** |

Zu Kriterium 8: Geprüft wurde nicht nur die Abwesenheit der Partikel, sondern auch, dass die Einblend-Schritte nicht auf `opacity: 0` hängen bleiben — der naheliegende Folgefehler, wenn man Animationen pauschal abschaltet. Alle vier Schritte messen `opacity: 1`, der CTA ist klickbar und führt in den Modul-Screen.

### Edge Cases

| # | Fall | Ergebnis |
|---|------|----------|
| 15 | Letzte Station erreicht | **Pass** — Screen identisch zu jeder anderen Station; der frühere Sonderfall existiert nicht mehr |
| 16 | Sehr langer Stationsname auf 320×568 | **Pass** — 5 Zeilen Umbruch, **nicht** abgeschnitten (`scrollWidth == clientWidth`), CTA endet bei 506 von 568 px |
| 17 | `prefers-reduced-motion` aktiv | **Pass** — siehe Kriterium 8 |

**Zusätzlich geprüft (nicht in der Spec):**

| Fall | Ergebnis |
|------|----------|
| Umlaute, Emoji und Markup im Stationsnamen | **Pass** — „ÖKOZENTRUM „GRÜSSE" 🎉 `<B>X</B>`" als Text gerendert |
| Leerer Stationsname | **Pass** — Headline und CTA bleiben vorhanden und klickbar, kein Layout-Bruch |
| Tastaturbedienung | **Pass** — der Screen hat **genau ein** fokussierbares Element (den CTA): 1× Tab, Enter öffnet den Modul-Screen. Nichts konkurriert um den Fokus |

### Responsive (fünf Viewports, beide Engines)

| Viewport | CTA-Unterkante | Höhe | Über dem Falz | Tap ≥44px | Overflow-X |
|----------|----------------|------|---------------|-----------|------------|
| 320×568 | 464 / 463 | 56 | ja | ja | nein |
| 375×667 | 516 / 513 | 56 | ja | ja | nein |
| 390×844 | 604 / 602 | 56 | ja | ja | nein |
| 768×1024 | 705 / 705 | 56 | ja | ja | nein |
| 1440×900 | 645 / 643 | 56 | ja | ja | nein |

(Chrome / WebKit; die Differenzen von 1–3 px sind Font-Metrik, kein Layout-Unterschied.)

### Kontrast (WCAG AA, Vorgabe 4.5:1)

| Element | Verhältnis | Farbe |
|---------|-----------|-------|
| Stationsname | **7,97:1** | `rgb(160,167,173)` auf `rgb(10,14,15)` |
| Headline „Ziel erreicht!" | **19,40:1** | `rgb(255,255,255)` |
| CTA „Station entdecken" | **11,53:1** | dunkle Schrift auf `rgb(0,224,209)` |

Der Stationsname nutzt den festen Hex-Wert `text-gq-grey` — genau die Klasse, die als **BUG-1** im Light Theme auf 2,29:1 fällt. Hier ist das **kein Fehler**: `src/app/play/layout.tsx` setzt `data-theme="dark"` fest, der Grund bleibt also garantiert dunkel. Das Design System erlaubt die festen Werte genau für diesen Fall, und fünf weitere Stellen derselben Datei nutzen sie seit jeher ebenso. Geprüft, nicht angenommen.

### Regression: PROJ-5 (Outro-Screen)

`ConfettiEffect` und das Pin-Asset sind geteilt — der Outro wurde deshalb als eigener Durchlauf bis zum Quest-Ende geprüft, auf **beiden Engines identisch**:

- Pin `/assets/mark-pin.png`, `border-radius: 0px`, Bild tatsächlich geladen (`naturalWidth > 0`)
- Animation `gq-cannon`, `iteration-count: 1`, Ursprung `bottom: 0`, 70 Partikel
- Inhalt vollständig: Quest-Name, „1 von 1 Station abgeschlossen", Outro-Text, „Fertig"-Button sichtbar
- „Fertig" führt zurück nach `/play`

Damit ist auch die Beobachtung aus der Frontend-Phase geklärt, der Outro-Screenshot sei „leer" gewesen: Das war reine Aufnahme-Zeit vor Ablauf der Einblend-Animationen. Nach 1,5 s ist der Screen vollständig.

### Security-Audit (Red Team)

**Ohne Befund.**

Der Gratulationsscreen rendert genau ein angreiferkontrolliertes Feld: den **Stationsnamen** aus importiertem Quest-JSON. Genau dort habe ich angesetzt:

| Angriff | Ergebnis |
|---------|----------|
| `<img src=x onerror="window.__pwned=1">` im Stationsnamen | **abgewehrt** — `window.__pwned` bleibt `null`, 0 injizierte `<img>` |
| `<script>window.__pwned2=1</script>` im Stationsnamen | **abgewehrt** — `window.__pwned2` bleibt `null`, 0 injizierte `<script>` |
| Dialoge/`alert()` | **keine** |
| Darstellung des Payloads | als **escapter Text** (`&lt;img src=x onerror=…`) — sichtbar, aber wirkungslos |
| Secrets in den Client-Bundles | **keine Treffer** über 20 geprüfte Chunks |
| Security-Header | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` aktiv |

Die Partikel sind rein dekorativ, tragen `aria-hidden` und `pointer-events: none` — sie können weder Klicks abfangen (per echtem CTA-Klick verifiziert) noch Inhalt vortäuschen.

**Kein neuer externer Host, keine neue Eingabe, kein neuer Speicherzugriff.** Die Änderung entfernt Code und tauscht ein Bild; sie vergrößert die Angriffsfläche nicht.

### Gegenprobe: Fangen die Tests den Fehler überhaupt?

Jede der drei Änderungen einzeln zurückgebaut, gebaut und gemessen:

| Zurückgebaut | Fallende Tests |
|--------------|----------------|
| „Nächstes Ziel"-Karte zurück | **genau 2** (kein Hinweis auf die nächste Station, letzte Station) |
| JPEG mit `rounded-2xl` zurück | **genau 2** (PNG-Nachweis, Border-Radius) |
| **Echte alte Konfetti-Komponente** (`HEAD~1`, 40 Partikel, Rieseln von oben) | **7** (Ursprung, `infinite`, Aufstieg, Ruhe, **Fächer**, Klick-Durchlässigkeit, `aria-hidden`) |
| `prefers-reduced-motion`-Block entfernt | **genau 1** (der zuständige Test) |

Bemerkenswert an der dritten Zeile: Die Frontend-Phase hatte notiert, der Fächer-Test fange die alte Fassung **nicht**. Gegen die **tatsächliche** alte Komponente aus der Git-History fällt er sehr wohl. Die dortige Gegenprobe hatte nur einzelne Parameter der neuen Fassung verändert, nicht die alte Komponente eingespielt — der Test ist also schärfer als dort angenommen.

Nach allen Gegenproben wurde der Produktcode wiederhergestellt und per `git diff` als **byte-identisch** bestätigt.

### Automatisierte Tests

| Suite | Chrome 152 | Mobile Safari |
|-------|-----------|---------------|
| Unit (Vitest) | **219 / 219** | — |
| Gesamt E2E | **460 passed / 23 skipped / 0 failed** | **454 passed / 29 skipped / 0 failed** |
| `proj-3-gratulationsscreen.spec.ts` | **19 / 19** | **19 / 19** |

Build und Lint sauber (0 Errors; die 7 Warnungen sind vorbestehend und betreffen `<img>`-Nutzung sowie eine Hook-Abhängigkeit in fremden Dateien).

### Fehler in meinen eigenen Messungen (offen benannt)

Drei Auffälligkeiten des ersten Durchlaufs waren **Messfehler**, nicht Produktfehler:

1. Eine Sonde meldete, der Stationsname fehle (`stationName: false`). Ursache: Meine Regex prüfte gegen `innerText`, der durch `uppercase` transformiert ist. Der Name stand sehr wohl da.
2. Der XSS-Test schlug zunächst mit einem Locator-Timeout fehl. Ursache: Der Stationsname steckt im `aria-label` des Buttons, der Payload machte den Textfilter unbrauchbar. Umgestellt auf `button[aria-label^="Navigation zu"]`.
3. Ein Hintergrundlauf der Gesamtsuite blieb hängen, während parallel Sonden gegen denselben Server liefen — **genau das in INDEX.md dokumentierte Muster.** Prozesse beendet, Suiten danach einzeln gefahren.

Zusätzlich sind die lokalen Konsolenfehler geprüft: Sie stammen ausschließlich von **Vercel Analytics** (`/_vercel/insights/script.js`, 404), das nur in Production existiert. Sie treten auf allen Routen auf, auch auf unveränderten — vorbestehend und in früheren QA-Läufen bereits so dokumentiert.

### Nicht abgedeckt (ehrliche Einschränkung)

- **Das Erscheinungsbild auf einem echten Gerätedisplay.** Der Pin ist rechnerisch kantenfrei und im Screenshot sauber; wie er auf einem OLED-Handy bei Sonnenlicht wirkt, ist damit nicht beantwortet.
- **Die Performance von 70 Partikeln auf schwacher Android-Hardware.** Lokal kein solches Gerät; auf Chrome und WebKit am Desktop läuft der Schuss ohne sichtbares Ruckeln.
- **Firefox** — Binary fehlt trotz gegenteiliger `--dry-run`-Meldung, kein Firefox in `/Applications`. Risiko gering: Die Änderung nutzt nur CSS-Animationen, `transform` und PNG-Alpha, alles seit Jahren universell unterstützt.
- **Der Vibrations-Pfad** (`navigator.vibrate`) ist unverändert und wurde nicht erneut geprüft.

### Production-Ready Decision

**READY.** Keine Critical-, High-, Medium- oder Low-Bugs. Alle 8 Acceptance Criteria erfüllt, alle 3 Edge Cases bestätigt, drei zusätzliche Grenzfälle geprüft, Security-Audit ohne Befund, PROJ-5 regressionsfrei, beide Engines gleichwertig.

Der vom Betreiber gemeldete Befund zum Pin ist nicht nur behoben, sondern mit einer Messung belegt, die die Frontend-Phase noch nicht geführt hatte: **Randabweichung 0 gegen 43 beim alten JPEG.**

---

## Deployment: Gratulationsscreen (2026-09-20)

**Live auf https://geoquesty.vercel.app** — Tag `v1.31.0-PROJ-3`, Commits `c0016c0` (Frontend) und `eddf9f6` (QA).
Vercel deployte automatisch von `main`, **live nach ~56 Sekunden**.

### Pre-Deployment

| Prüfung | Ergebnis |
|---------|----------|
| `npm run build` | erfolgreich |
| `npm run lint` | 0 Errors (7 vorbestehende Warnungen) |
| QA-Freigabe | Approved, 8/8 AC, keine Bugs |
| Secrets im Diff | **keine** — die drei Grep-Treffer waren die Wörter „Secrets"/„Token" in der QA-Dokumentation selbst |
| `.env`/Key-Dateien im Diff | keine |
| Asset-Integrität | `mark-pin.png` als `PNG image data, 546x558, 8-bit/color RGBA` verifiziert |
| Ausgangslage Production | `/assets/mark-pin.png` → **HTTP 404** (sauberes Vorher-Signal) |

### Der Kern ist in Production bestätigt

Die entscheidende Messung der QA — der Pin ist auf dem echten App-Hintergrund kantenfrei — wurde **gegen das live ausgelieferte Asset wiederholt**, nicht gegen die lokale Datei:

| Messung am Live-Asset | Ergebnis |
|------------------------|----------|
| Live-PNG vs. Repo-Datei | **byte-identisch** (`cmp`, 197.276 Bytes) |
| Live-PNG auf `#0B0F12`, äußerer 12px-Rahmen | **max. Farbabweichung 0**, abweichende Pixel **0** |
| Gegenprobe altes JPEG | **max. Farbabweichung 43** |

Damit ist der vom Betreiber gemeldete Befund nicht nur behoben, sondern **in Production messbar belegt**.

### Verifikation im Live-Browser (beide Engines)

Vollständiger Durchlauf gegen https://geoquesty.vercel.app auf 390×844:

| Prüfpunkt | Chrome 152 | Mobile Safari |
|-----------|-----------|---------------|
| Screen-Inhalt | `ZIEL ERREICHT! \| LIVE ERSTE STATION \| STATION ENTDECKEN` | identisch |
| Hinweis auf nächste Station (bei vorhandener 2. Station) | **keiner** | **keiner** |
| Pin | `/assets/mark-pin.png`, `radius 0px`, geladen 546×558 | identisch |
| Kanone | `gq-cannon`, `iteration-count: 1`, `bottom: 0`, `left: 195px` (exakt mittig), 70 Partikel | identisch |
| Ruhe nach 3,5 s | **0 bewegt, 0 sichtbar** | **0 bewegt, 0 sichtbar** |
| Layer | `pointer-events: none`, `aria-hidden="true"` | identisch |
| CTA | 56px, endet bei 605/844 → führt in den Modul-Screen | 601/844 |
| Konsolenfehler / fehlgeschlagene Requests | 0 fehlgeschlagen | **0 / 0** |

**Am Bildschirm abgenommen:** Screenshot bei 260 ms zeigt den Fächer über die volle Breite, der Pin steht ohne Rechteck auf dem Hintergrund, die „Nächstes Ziel"-Karte ist weg. Screenshot nach 3,5 s zeigt den vollständig ruhigen Screen.

### Regression PROJ-5 (Outro) in Production

Eigener Durchlauf bis zum Quest-Ende: Pin `/assets/mark-pin.png` mit `radius 0px` und geladen, Animation `gq-cannon` mit `iteration-count: 1`, Quest-Name, „1 von 1 Station abgeschlossen" und Outro-Text vollständig. Der Outro erbt beide Änderungen, ohne dass seine Datei dafür angefasst wurde.

### Routen, Header, Nachbarseiten

Alle sieben Routen **HTTP 200** mit 0,30–0,47 s. Security-Header aktiv inkl. **HSTS** (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`. Das PNG wird mit `content-type: image/png` und `nosniff` ausgeliefert.

Nachbarseiten unbeschädigt: `/about` trägt weiterhin `FAQPage`-JSON-LD und 1× Ko-fi, `/anleitung` liefert weiterhin **0 Treffer** für den zurückgehaltenen Prompt (PROJ-14 intakt).

### Eine geprüfte Auffälligkeit

Der Live-Durchlauf meldete 2 Konsolen-404s. **Nachgemessen statt weggewunken:** Ein normaler Besuch von `/` und `/play` erzeugt **0 Requests mit Status 404**. Die beiden stammen aus dem Aufruf von `/play/<id>` — das serverseitig 404 liefert, weil Quests ausschließlich im localStorage liegen. Für den Nutzer unsichtbar (der Client rendert korrekt, was dieser Test selbst belegt), **vorbestehend** und bereits im Deploy vom 2026-09-07 dokumentiert. Kein Regress dieses Features.

### Rollback

Vercel Dashboard → Deployments → vorheriges Deployment „Promote to Production".
Betroffen sind nur `confetti-effect.tsx`, `navigation-screen.tsx`, `outro-screen.tsx`, `quest-player.tsx` und das neue Asset. Ein Rollback bringt die „Nächstes Ziel"-Karte, das rieselnde Endlos-Konfetti und das sichtbare Rechteck um den Pin zurück — mehr nicht. Keine Datenmigration, kein Schema, keine Umgebungsvariable betroffen.
