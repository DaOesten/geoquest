# PROJ-8: Creator — Modul-Editor

## Status: In Progress
**Created:** 2026-08-28
**Last Updated:** 2026-09-28

> **Refinement (2026-09-28) — Bildvorschau mit Warnung:** Betreiber-Befund: *„Bilder aus dem Internet, die im Create mode per URL eingebunden wurden, werden im Play mode nicht angezeigt — weder im Intro/Outro, noch als Modul in einer Station."* Die gelieferte Beispiel-URL (`https://www.magnific.com/de/vektoren-kostenlos/…_24467363.htm#…`) ist **keine Bilddatei, sondern die Detailseite** einer Stockbild-Plattform. Ein `<img>` kann sie nicht darstellen. Der Player verhält sich korrekt; der Fehler ist, dass der Creator jede `https://`-Adresse annimmt und der Ersteller erst beim Spielen merkt, dass sie nicht funktioniert. Lösung: Live-Vorschau unter jedem Bild-URL-Feld, mit Warnung und Anleitung, wenn die Adresse nicht als Bild lädt — Speichern bleibt möglich. Gilt für das Bild-Modul (diese Spec) **und** die Intro-/Outro-Bildfelder im Quest-Dialog (PROJ-6, mitbetroffen). Siehe User Story 10, Acceptance Criteria „Bildvorschau", Edge Cases 11–16, Technical Requirements, Decision Log und Abschnitt „Refinement 2026-09-28".

## Dependencies
- Requires: PROJ-2 (Quest Data Model & JSON Import) — für das Modul-Schema (Text/Bild/Audio/Video/Task, inkl. `correctIndices`)
- Requires: PROJ-7 (Creator — Stationen-Editor) — der "Module bearbeiten"-Button (Puzzle-Icon) existiert bereits in `station-list-item.tsx`, aber ohne Ziel; PROJ-8 füllt ihn mit Funktion
- Beeinflusst: PROJ-6/PROJ-7 — `isQuestComplete()` prüft bereits, ob jede Station mindestens ein (vollständiges) Modul hat; PROJ-8 liefert die Module, die diese Prüfung erfüllen können, ändert die Prüf-Logik selbst aber nicht
- Ermöglicht: PROJ-10 (Creator — Vorschau/Testmodus) — Module müssen existieren, bevor eine Quest sinnvoll testbar ist

## Summary
Der Modul-Editor ist der Ort, an dem der Ersteller die eigentlichen Inhalte einer Station anlegt: Texte, Bilder, Audio, Video und interaktive Aufgaben (Code-Eingabe, Multiple Choice, Sortierung) — exakt die 5 Modultypen, die PROJ-4 im Player rendert. Erreichbar über den bereits vorhandenen "Module bearbeiten"-Button in der Stationsliste (PROJ-7), öffnet sich eine eigene Unterseite pro Station (`/create/[id]/station/[stationId]`) mit einer sortierbaren Modul-Liste. Jedes Modul wird über ein eigenes Sheet mit typspezifischem Formular angelegt/bearbeitet, konsistent mit dem in PROJ-7 etablierten Sheet-Muster (lokaler Entwurf, erst bei "Speichern" übernommen).

## User Stories
1. Als Ersteller möchte ich von der Stationsliste aus direkt zur Modul-Verwaltung einer Station springen, damit ich meine Inhalte dort anlegen kann, wo ich sie gerade brauche.
2. Als Ersteller möchte ich beim Hinzufügen eines Moduls zuerst den Typ auswählen (Text/Bild/Audio/Video/Aufgabe), damit ich gezielt das passende Formular ausfülle.
3. Als Ersteller möchte ich Text-Module mit Zeilenumbrüchen und Listen anlegen können, damit ich Geschichten und Hinweise erzählen kann.
4. Als Ersteller möchte ich Bild-, Audio- und Video-Module über eine URL einbinden können, damit ich Multimedia-Inhalte einbauen kann, ohne eigenen Server zu brauchen.
5. Als Ersteller möchte ich Code-Eingabe-, Multiple-Choice- und Sortierungs-Aufgaben erstellen können, damit ich Rätsel für die Spieler baue.
6. Als Ersteller möchte ich die Reihenfolge der Module per Drag & Drop ändern können, damit ich die Erzählstruktur einer Station anpassen kann, ohne alles neu anzulegen.
7. Als Ersteller möchte ich ein Modul löschen können, damit ich Fehler oder nicht mehr benötigte Inhalte entfernen kann.
8. Als Ersteller möchte ich sehen, welche Module noch unvollständig sind (z.B. fehlender Inhalt, keine markierte richtige Antwort), damit ich weiß, was ich noch fertigstellen muss.
9. Als Ersteller möchte ich ein Modul auch unvollständig speichern können, damit ich meinen Zwischenstand nicht verliere, wenn ich später weiterarbeiten will.
10. Als Ersteller möchte ich schon beim Eintragen einer Bild-URL sehen, ob das Bild angezeigt wird, und erklärt bekommen, welche Adresse ich stattdessen brauche, damit ich keine Quest weitergebe, in der die Spieler vor leeren Stellen stehen.

## Out of Scope
- Rich-Text-Formatierung (fett, kursiv) in Text-Modulen — konsistent mit PROJ-2/PROJ-4 (Plain Text mit Zeilenumbrüchen/Listen, keine XSS-Fläche durch echtes HTML)
- Datei-Upload für Bild/Audio/Video — kein Backend/Storage im MVP (PRD-Constraint "Kein Backend"), nur URL-Eingabe zu bereits gehosteten Medien
- Live-Vorschau/Testmodus der ganzen Station im Player-Look — PROJ-10
- Drag-and-Drop-Umsortierung der Antwort-Optionen im Multiple-Choice-Editor (Reihenfolge ist funktional irrelevant, nur Hinzufügen/Entfernen/Korrekt-Markieren)
- Neue Modultypen über die bestehenden 5 (Text/Bild/Audio/Video/Task) hinaus
- JSON-Export der fertigen Module — PROJ-9
- Undo nach dem Löschen eines Moduls (bewusst Bestätigungsdialog statt Undo-Toast, konsistent mit PROJ-7 Stationslöschung)
- Validierung/Blockieren beim Speichern eines unvollständigen Moduls (bewusst als Entwurf erlaubt, siehe Decision Log)
- Speichern sperren, wenn ein Bild nicht lädt — die Vorschau warnt nur (Decision Log 2026-09-28)
- Vorschau/Ladeprüfung für Audio und Video — gemeldet war nur Bild; beide Player-Elemente zeigen ohnehin eigene Fehlerzustände (2026-09-28)
- Automatisches Umwandeln einer Seiten-URL in die Bild-URL (z. B. Auslesen von `og:image`) — bräuchte einen Server-Abruf fremder Seiten, PRD „Kein Backend" (2026-09-28)
- Prüfung von Bildrechten/Lizenzen — der Creator kann sie nicht erkennen; nur ein Hinweistext (2026-09-28)
- Bild-Ladeprüfung beim Veröffentlichen (PROJ-9) — asynchron und netzabhängig, die Warnung am Feld genügt (2026-09-28)
- Änderungen am Player: Intro/Outro blenden ein nicht ladbares Bild weiter still aus, das Bild-Modul zeigt weiter „Bild konnte nicht geladen werden" (PROJ-4/PROJ-5 unverändert, 2026-09-28)
- Maximale Modulanzahl als UI-Sperre (bestehende Schema-Grenze von 20 Modulen/Station aus PROJ-2 bleibt die einzige durchgesetzte Regel, greift beim Export/Import)
- Import einzelner Module aus anderen Quests ("Modul kopieren")

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Navigation zur Modul-Liste:**
- [ ] Angenommen der Nutzer ist auf `/create/[id]` (Stationsliste), wenn er das Puzzle-Icon einer Station antippt, dann navigiert er zu `/create/[id]/station/[stationId]` mit der Modul-Liste dieser Station
- [ ] Angenommen der Nutzer ist auf `/create/[id]/station/[stationId]`, wenn er auf "Zurück" tippt, dann kehrt er zur Stationsliste `/create/[id]` zurück

**Modul-Liste:**
- [ ] Angenommen eine Station hat noch keine Module, wenn die Modul-Liste lädt, dann erscheint ein Empty State mit Hinweistext und einem "Modul hinzufügen"-Button
- [ ] Angenommen eine Station hat Module, wenn die Modul-Liste lädt, dann werden alle Module in gespeicherter Reihenfolge mit Typ-Icon und Kurzvorschau (z.B. Textanfang, Dateiname aus URL, Frage) angezeigt
- [ ] Angenommen ein Modul ist unvollständig (siehe Vollständigkeitsregeln unten), wenn es in der Liste angezeigt wird, dann erscheint ein sichtbarer Warnhinweis (z.B. "Kein Inhalt", "Keine Antwort markiert")

**Modultyp-Auswahl:**
- [ ] Angenommen die Modul-Liste ist offen, wenn der Nutzer auf "Modul hinzufügen" tippt, dann erscheint eine Typ-Auswahl mit 5 Kacheln (Text/Bild/Audio/Video/Aufgabe)
- [ ] Angenommen der Nutzer wählt "Aufgabe", wenn die Auswahl erscheint, dann werden zusätzlich die 3 Aufgaben-Unterarten (Code-Eingabe/Multiple Choice/Sortierung) zur Wahl angeboten
- [ ] Angenommen ein Typ (bzw. eine Aufgaben-Unterart) wurde gewählt, wenn die Auswahl abgeschlossen ist, dann öffnet sich das passende leere Formular-Sheet für diesen Typ

**Text-Modul-Editor:**
- [ ] Angenommen das Text-Modul-Sheet ist offen, wenn der Nutzer Text mit Zeilenumbrüchen und `- `-Listenzeilen eingibt, dann wird dies beim Speichern unverändert als `content` übernommen

**Bild-/Audio-/Video-Modul-Editor:**
- [ ] Angenommen das Sheet für Bild/Audio/Video ist offen, wenn der Nutzer eine URL einträgt, dann wird beim Speichern geprüft, dass sie mit `https://` beginnt; bei Verstoß erscheint eine Fehlermeldung direkt am Feld, das Sheet bleibt offen
- [ ] Angenommen das Sheet für Bild/Audio/Video ist offen, wenn der Nutzer optional eine Caption einträgt, dann wird diese beim Speichern übernommen

**Bildvorschau (Refinement 2026-09-28) — gilt für das Bild-Modul und für die Intro-/Outro-Bildfelder im Quest-Dialog (PROJ-6):**
- [ ] Angenommen der Ersteller trägt eine `https://`-URL in ein Bild-Feld ein, wenn die Adresse als Bild lädt, dann erscheint direkt unter dem Feld eine Vorschau des Bildes
- [ ] Angenommen die eingetragene Adresse lädt **nicht** als Bild (Webseite, Tippfehler, gesperrter Server), wenn die Prüfung abgeschlossen ist, dann erscheint an der Stelle der Vorschau eine Warnung: dass das Bild so im Spiel nicht angezeigt wird, und wie man die richtige Adresse bekommt („Rechtsklick bzw. lange drücken auf das Bild → Bildadresse kopieren")
- [ ] Angenommen die Warnung ist sichtbar, wenn der Ersteller auf „Speichern" tippt, dann wird trotzdem gespeichert — die Warnung sperrt nicht
- [ ] Angenommen der Ersteller ändert die URL, wenn er tippt, dann wird die Vorschau für die neue Adresse neu geprüft — eine veraltete Vorschau oder Warnung bleibt nicht stehen
- [ ] Angenommen das Feld ist leer oder die Adresse beginnt nicht mit `https://`, wenn der Ersteller es ansieht, dann erscheint keine Vorschau und keine Lade-Warnung — es greift nur die bestehende `https://`-Prüfung beim Speichern
- [ ] Angenommen ein bestehendes Bild-Modul oder eine bestehende Quest mit Intro-/Outro-Bild wird zum Bearbeiten geöffnet, wenn das Sheet bzw. der Dialog erscheint, dann wird die gespeicherte Adresse sofort geprüft — auch vorhandene kaputte Bilder werden so sichtbar
- [ ] Angenommen die Prüfung läuft noch, wenn der Ersteller hinsieht, dann ist ein Ladezustand erkennbar — weder eine leere Fläche noch eine vorschnelle Warnung
- [ ] Angenommen ein Bild-Modul hat eine Adresse, die nicht als Bild lädt, wenn die Modul-Liste angezeigt wird, dann trägt es **keinen** zusätzlichen Warnhinweis — die Ladeprüfung läuft nur im geöffneten Sheet (siehe Decision Log)
- [ ] Angenommen die Vorschau wird angezeigt, wenn der Ersteller den Dialog im Light Theme sieht, dann erfüllt die Warnung den Kontrast von mindestens 4.5:1 und die Vorschau sprengt die Breite nicht (auch bei sehr großen oder sehr schmalen Bildern)

**Code-Eingabe-Task-Editor:**
- [ ] Angenommen das Code-Task-Sheet ist offen, wenn der Nutzer Frage und Antwort einträgt, dann werden beide beim Speichern übernommen

**Multiple-Choice-Task-Editor:**
- [ ] Angenommen das Multiple-Choice-Sheet ist offen, wenn der Nutzer auf "Option hinzufügen" tippt, dann erscheint ein neues leeres Optionsfeld mit Checkbox (max. 5 Optionen gemäß Schema)
- [ ] Angenommen mindestens 3 Optionen existieren, wenn der Nutzer eine Option entfernt, dann verschwindet sie aus der Liste (min. 2 Optionen gemäß Schema bleiben erhalten, "Entfernen" ist bei genau 2 Optionen deaktiviert)
- [ ] Angenommen der Nutzer markiert eine oder mehrere Options-Checkboxen als korrekt, wenn er speichert, dann werden die markierten Indices als `correctIndices` übernommen (1 markiert → Single-Choice im Player, mehrere → Multi-Choice)
- [ ] Angenommen der Nutzer entfernt eine Option, die als korrekt markiert war, wenn er speichert, dann wird sie automatisch auch aus `correctIndices` entfernt

**Sortierungs-Task-Editor:**
- [ ] Angenommen das Sortierungs-Sheet ist offen, wenn der Nutzer Items in Textfelder einträgt, dann bestimmt die Eingabereihenfolge die korrekte Reihenfolge (`items`-Array)
- [ ] Angenommen mindestens 2 Items existieren, wenn der Nutzer ein Item per Drag verschiebt, dann übernimmt die neue Position sofort die Reihenfolge im lokalen Entwurf
- [ ] Angenommen mindestens 4 Items existieren, wenn der Nutzer ein Item entfernt, dann verschwindet es aus der Liste (min. 3 Items gemäß Schema bleiben erhalten, "Entfernen" ist bei genau 3 Items deaktiviert)

**Speichern (Entwurfsprinzip):**
- [ ] Angenommen ein Modul-Sheet ist offen und Pflichtfelder sind leer (z.B. Text-Inhalt, Frage, Antwort), wenn der Nutzer auf "Speichern" tippt, dann wird das Modul trotzdem gespeichert und das Sheet schließt sich
- [ ] Angenommen ein Modul-Sheet ist offen, wenn der Nutzer "Abbrechen" tippt oder das Sheet wegwischt, dann werden keine Änderungen übernommen
- [ ] Angenommen ein Modul wird gespeichert (neu oder bearbeitet), wenn der Vorgang abgeschlossen ist, dann wird `lastModified` der Quest aktualisiert

**Reihenfolge (Drag & Drop):**
- [ ] Angenommen die Modul-Liste hat mindestens 2 Module, wenn der Nutzer ein Modul per Drag an eine andere Position zieht, dann wird die neue Reihenfolge sofort übernommen und gespeichert
- [ ] Angenommen eine Umsortierung wurde vorgenommen, wenn der Nutzer die Seite neu lädt, dann bleibt die neue Reihenfolge erhalten

**Bearbeiten:**
- [ ] Angenommen ein Modul existiert, wenn der Nutzer es in der Liste antippt, dann öffnet sich das passende Sheet mit allen vorhandenen Werten vorausgefüllt

**Löschen:**
- [ ] Angenommen ein Modul existiert, wenn der Nutzer die Löschen-Aktion auswählt, dann erscheint ein Bestätigungsdialog ("Modul wirklich löschen? Das kann nicht rückgängig gemacht werden.")
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Nutzer bestätigt, dann wird das Modul aus der Station entfernt und die Liste aktualisiert sich
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Nutzer abbricht, dann bleibt das Modul unverändert erhalten

## Edge Cases
1. **Vollständigkeits-Definition pro Modultyp:** Ein Modul gilt als "unvollständig" (Warnhinweis in der Liste), wenn: Text ohne `content`; Bild/Audio/Video ohne gültige `https://`-URL; Code-Task ohne `question` oder `answer`; Multiple-Choice ohne `question`, mit weniger als 2 ausgefüllten Optionen oder ohne mindestens eine als korrekt markierte Option; Sortierung ohne `question` oder mit weniger als 3 ausgefüllten Items. Diese Prüfung ist rein informativ (Warnhinweis), blockiert nicht das Speichern.
2. **Letztes Modul einer Station wird gelöscht:** Modul-Liste zeigt danach den Empty State; die bestehende `isQuestComplete()`-Prüfung (PROJ-6) erkennt die Station automatisch wieder als unvollständig (Station braucht laut PROJ-2-Schema mindestens 1 Modul) — kein neuer Code nötig.
3. **Multiple-Choice: alle Optionen als korrekt markiert:** Wird erlaubt, keine Sonderbehandlung — ergibt einen (ungewöhnlichen, aber technisch gültigen) Multi-Choice-Task, bei dem der Spieler alle Optionen wählen muss.
4. **Multiple-Choice: keine Option als korrekt markiert:** Wird als unvollständiges Modul gespeichert (Entwurfsprinzip) und in der Liste mit Warnhinweis "Keine Antwort markiert" angezeigt.
5. **Sortierung: zwei identische Item-Texte:** Wird ohne Sonderbehandlung akzeptiert — Duplikate sind technisch gültig, auch wenn sie das Rätsel im Player mehrdeutig machen könnten; Verantwortung liegt beim Ersteller.
6. **Media-URL wird nach dem Speichern ungültig (z.B. Bild wird offline genommen):** Kein Editor-seitiges Problem — PROJ-4s bestehender `onError`-Fallback im Player greift, PROJ-8 prüft nur das URL-Format (`https://`-Präfix) beim Speichern, keine Erreichbarkeitsprüfung.
    *Präzisiert 2026-09-28:* „Keine Erreichbarkeitsprüfung" gilt nicht mehr für Bilder. Beim Eintragen und beim erneuten Öffnen wird geprüft, ob die Adresse als Bild lädt (Vorschau/Warnung). Fällt ein Bild **nach** dem Speichern weg, gilt weiterhin der Player-Fallback — der Creator prüft nicht im Hintergrund nach.
7. **Drag & Drop der Modul-Liste vs. Drag & Drop innerhalb der Sortierungs-Aufgabe:** Kein Konflikt — Modul-Listen-Drag passiert auf der Übersichtsseite, Item-Drag passiert isoliert im geöffneten Sortierungs-Sheet.
8. **Zwischenstand-Garantie:** Wie in PROJ-6/PROJ-7 etabliert — jedes gespeicherte Modul (auch unvollständig) wird sofort in `gq_quests` persistiert, kein Datenverlust bei Navigation weg von der Seite.
9. **Wechsel des Modultyps nach dem Anlegen:** Nicht möglich — ein bestehendes Modul behält seinen Typ; um den Typ zu ändern, muss der Ersteller das Modul löschen und neu anlegen (kein Typ-Umschalter im Bearbeiten-Sheet).
10. **Navigation zu `/create/[id]/station/[stationId]` mit ungültiger oder gelöschter `stationId`:** Zeigt einen "Station nicht gefunden"-Zustand mit Link zurück zur Stationsliste — analog zum bestehenden Verhalten bei ungültiger `id` auf `/create/[id]`.
11. **Seiten-URL statt Bild-URL (Anlass des Refinements 2026-09-28):** Stockbild-Plattformen (Magnific/Freepik, Pixabay, Unsplash, Pinterest) und die Google-Bildersuche zeigen Bilder auf einer Detailseite. Kopiert der Ersteller die Adresse aus der Adresszeile, bekommt er diese Seite (`…/lass-uns-textsymbol…_24467363.htm`), nicht die Bilddatei. Das `https://`-Format ist erfüllt, das Bild lädt nie. Häufigster realer Fall; die Warnung muss genau diesen Weg erklären.
12. **Server verweigert das Einbetten (Hotlink-Schutz):** Manche Server liefern Bilder nur an ihre eigene Website aus. Die Vorschau im Creator läuft im selben Browser, mit derselben Origin und derselben `Referrer-Policy` wie der Player — was dort lädt, lädt auch beim Spielen, was dort scheitert, scheitert auch beim Spielen. Die Vorschau ist damit ein verlässlicher Stellvertreter, keine Schätzung.
13. **Langsamer oder kurz nicht erreichbarer Server:** Die Prüfung kann fehlschlagen, obwohl das Bild später lädt. Deshalb warnt sie nur und sperrt das Speichern nicht (Decision Log). Der Ersteller kann weiterarbeiten und das Bild später erneut prüfen, indem er das Sheet wieder öffnet.
14. **Adresse ist ein Bild, aber riesig (mehrere MB):** Die Vorschau lädt es trotzdem; sie ist auf die Feldbreite begrenzt. Eine Größenwarnung ist nicht Teil dieses Refinements.
15. **Bild lädt im Creator, aber der Spieler ist offline oder hat schlechten Empfang:** Nicht Sache des Creators — PRD „Multimedia-Module brauchen Internetverbindung". Der Player-Fallback greift wie bisher.
16. **Privatsphäre:** Die Vorschau ruft die fremde Adresse schon beim Eintragen ab — der Bild-Server sieht dabei die IP des Erstellers und die Origin der App (`Referrer-Policy: origin-when-cross-origin`). Beim Spielen passiert dasselbe für jeden Spieler, es ist also kein neuer Datenfluss, nur ein früherer. Prüfen, ob die Datenschutzerklärung (PROJ-13) die Einbindung externer Medien bereits abdeckt (Open Question).

## Technical Requirements
- Datenmodell: Nutzt das bestehende PROJ-2-Modul-Union-Schema (`text`/`image`/`audio`/`video`/`task` mit `taskType`) ohne strukturelle Änderung
- **Neue Lockerung analog zu PROJ-7s `DraftStation`:** Ein `DraftModule`-Typ erlaubt intern unvollständige Pflichtfelder (leerer `content`, leere `question`/`answer`, `options` mit weniger als 2 Einträgen, `items` mit weniger als 3 Einträgen, leere `correctIndices`) — das strikte PROJ-2-Zod-Schema bleibt unverändert die Grundlage für Import/Export-Validierung
- Drag & Drop: `@dnd-kit/core` + `@dnd-kit/sortable` (bereits als Dependency aus PROJ-7 vorhanden) — für Modul-Liste UND Sortierungs-Task-Items
- Speicher: Nutzt den bestehenden `gq_quests`-Storage-Layer aus PROJ-2/PROJ-6/PROJ-7, keine neue Storage-Schicht
- Sanitization: Alle Textfelder (Text-Inhalt, Captions, Fragen, Antworten, Optionen, Items) laufen durch das bestehende `stripHtmlTags()` aus PROJ-6/PROJ-7
- URL-Validierung: Wiederverwendung des bestehenden `https://`-Präfix-Checks aus PROJ-2 (`quest-schema.ts`)
- Touch-Targets: min. 44px (PRD-Anforderung), gilt für Drag-Handles, Checkboxen, "Entfernen"-Buttons
- Bestätigungsdialog bei kritischen Aktionen (Löschen) — PRD-Vorgabe
- Sheet/Dialog-Portal-Rendering: Muss das bestehende Light-Theme-Fix-Muster aus PROJ-6/PROJ-7 übernehmen (`data-theme="light"` + `text-foreground` auf der Portal-Root)
- Routing: Neue dynamische Route `/create/[id]/station/[stationId]/page.tsx`

**Bildvorschau (Refinement 2026-09-28):**
- **Eine** gemeinsame Vorschau-Komponente für beide Einbauorte (Bild-Modul-Sheet in `module-editor-sheets.tsx`, Intro-/Outro-Felder in `quest-form-dialog.tsx`) — nicht zweimal nachgebaut, sonst laufen Wortlaut und Verhalten auseinander
- Die Prüfung ist ein schlichtes Laden als Bild im Browser (`onLoad`/`onError` bzw. `new Image()`), **kein** `fetch()`: Ein `fetch` scheitert an CORS bei Servern, die das Bild als `<img>` problemlos ausliefern, und würde gültige Bilder als kaputt melden
- Vorschau und Player müssen dieselben Ladebedingungen haben (gleiche Origin, gleiche `Referrer-Policy` aus `next.config.ts`, kein `crossOrigin`-Attribut) — nur dann ist „lädt in der Vorschau" gleichbedeutend mit „lädt beim Spielen"
- Neu prüfen bei jeder URL-Änderung, entprellt (Richtwert 400–500 ms), damit nicht jeder Tastendruck eine Anfrage an einen fremden Server auslöst. Eine ältere, noch laufende Prüfung darf das Ergebnis einer neueren nicht überschreiben
- Geprüft wird nur eine Adresse mit `https://`-Präfix; leere oder ungültige Felder zeigen weder Vorschau noch Lade-Warnung
- Das Ergebnis wird **nicht** gespeichert — es ist ein Anzeige-Zustand des geöffneten Formulars, kein Quest-Feld. Das Datenmodell (PROJ-2) bleibt unverändert
- Warnung als Text-Hinweis am Feld, nicht als Toast (verschwindet sonst, bevor er gelesen ist) und nicht als Blocker. Farbe und Kontrast nach Design System im Light Theme der Creator-Sheets
- Vorschau-Bild: `max-width: 100%`, begrenzte Höhe, `object-fit: contain`, leeres `alt` (dekorativ, die URL steht im Feld darüber)
- Kein neues Paket, keine neue Route
- **Abnahme:** E2E-prüfbar — Playwright kann Bildanfragen per `page.route` mit einem echten PNG oder mit HTML beantworten. Wächter: Eine HTML-Seite als Bild-URL erzeugt die Warnung und lässt das Speichern zu; ein PNG erzeugt die Vorschau ohne Warnung; eine schnell geänderte URL zeigt das Ergebnis der letzten Eingabe

## Open Questions
- [ ] Deckt die Datenschutzerklärung (PROJ-13) die Einbindung externer Medien-URLs bereits ab, oder braucht sie einen Satz dazu? Die Vorschau erzeugt keinen neuen Datenfluss, zieht ihn aber in den Creator vor (Edge Case 16, 2026-09-28)
- [ ] Wie genau lautet der Anleitungstext der Warnung — kurz („Das ist kein Bild. Kopiere die Bildadresse: lange auf das Bild drücken → Bildadresse kopieren") oder mit Beispiel? Am Bildschirm in `/frontend` festzulegen (2026-09-28)
- [ ] Soll die Warnung einen Hinweis auf Bildrechte enthalten (Namensnennung bei kostenlosen Stockbildern)? Betrifft vor allem Lehrkräfte, die Quests weitergeben (2026-09-28)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Modul-Liste als eigene Unterseite (`/create/[id]/station/[stationId]`), kein Sheet | Bis zu 20 Module pro Station laut PROJ-2-Schema — eine eigene Seite bietet mehr Platz als ein Bottom-Sheet über der Stationsliste | 2026-08-28 |
| Sheet pro Modul zum Bearbeiten (wie PROJ-7s `StationEditorSheet`) | Konsistentes, bereits etabliertes Muster: lokaler Entwurf, explizites Speichern/Abbrechen, kein neues UX-Pattern nötig | 2026-08-28 |
| Typ-Auswahl-Screen vor dem leeren Formular | Explizite Entscheidung vor der Dateneingabe vermeidet ein verwirrendes Umschalten des Formulars nach Beginn der Eingabe; Aufgaben-Unterarten (Code/MC/Sortierung) sind inhaltlich so unterschiedlich, dass ein gemeinsames Formular keinen Sinn ergäbe | 2026-08-28 |
| Modul-Reihenfolge per Drag & Drop änderbar | Module werden im Player (PROJ-4) linear in dieser Reihenfolge angezeigt — Reihenfolge ist eine inhaltliche Erzählentscheidung des Erstellers | 2026-08-28 |
| Nur URL-Textfeld für Medien (kein Datei-Upload) | PRD-Constraint "Kein Backend" — ein Upload würde Storage-Infrastruktur erfordern, die explizit außerhalb des MVP-Scopes liegt | 2026-08-28 |
| Multiple-Choice: Checkboxen statt Single/Multi-Modusumschalter | Ein Schritt weniger für den Ersteller; `correctIndices.length` bestimmt automatisch, ob der Player Radio- oder Checkbox-UI zeigt (bereits bestehende PROJ-4-Logik) | 2026-08-28 |
| Sortierung: Eingabereihenfolge = korrekte Reihenfolge, mit Drag zum Nachjustieren | Intuitiv (was zuerst eingegeben wird, kommt zuerst), Drag erlaubt nachträgliche Korrektur ohne Neueingabe — konsistent mit dem Drag-Muster aus PROJ-7 | 2026-08-28 |
| Keine Drag-Umsortierung der MC-Optionen | Options-Reihenfolge hat keine funktionale Bedeutung (im Gegensatz zu Sortierungs-Items, wo die Reihenfolge die Aufgabe selbst ist) — spart UI-Komplexität ohne Funktionsverlust | 2026-08-28 |
| Modul darf unvollständig gespeichert werden (Entwurfsprinzip) | Konsistent mit dem in PROJ-6/PROJ-7 etablierten Muster: sofortiges Speichern verhindert Datenverlust, Vollständigkeit wird separat als Warnhinweis angezeigt, nicht beim Speichern blockiert | 2026-08-28 |
| Visueller Warnhinweis pro unvollständigem Modul in der Liste | Gibt dem Ersteller Orientierung, was noch fehlt, ohne ihn beim Speichern zu blockieren — gleiches Prinzip wie PROJ-7s "Keine Position gesetzt"-Hinweis | 2026-08-28 |
| Bestätigungsdialog beim Löschen eines Moduls (kein Undo-Toast) | PRD verlangt generell Bestätigungsdialoge bei kritischen/destruktiven Aktionen; konsistent mit dem bereits etablierten Muster aus PROJ-6/PROJ-7 | 2026-08-28 |
| Kein Typ-Wechsel bei bestehendem Modul | Die 5 Modultypen (bzw. 3 Task-Unterarten) haben strukturell unterschiedliche Felder — ein Wechsel würde entweder Datenverlust oder komplexe Migrationslogik bedeuten; Löschen+Neuanlegen ist einfacher und für den seltenen Fall ausreichend | 2026-08-28 |
| Keine UI-Sperre bei Erreichen von 20 Modulen | Die Schema-Grenze aus PROJ-2 bleibt die einzige durchgesetzte Regel (greift bei Import/Export), konsistent mit der gleichen Entscheidung für Stationen in PROJ-7 | 2026-08-28 |
| Bildvorschau mit Warnung, Speichern bleibt möglich | Betreiber-Entscheidung nach dem Befund, dass eingebundene Bilder im Player fehlen. Die Ursache war eine Seiten-URL statt einer Bild-URL — ein Fehler, den der Ersteller erst beim Spielen bemerken konnte. Eine Sperre wäre strenger, würde aber auch bei einem kurz nicht erreichbaren Server blockieren und widerspräche dem Entwurfsprinzip dieser Spec. Ein reiner Hinweistext hätte den Fehler nicht abgefangen. | 2026-09-28 |
| Die Warnung gehört an den Creator, nicht an den Player | Nur der Ersteller kann eine falsche Adresse reparieren. Der Spieler steht draußen vor einer Station und kann nichts tun; ein Hinweis bei ihm wäre Rauschen. Intro/Outro blenden deshalb weiter still aus, das Modul behält seinen bestehenden Fallback. | 2026-09-28 |
| Gilt auch für Intro-/Outro-Bilder (PROJ-6) | Der Befund betraf Intro, Outro und Modul gleichermaßen. Eine Vorschau nur im Modul hätte zwei der drei gemeldeten Stellen offen gelassen. | 2026-09-28 |
| Keine Lade-Warnung in der Modul-Liste | Eine Liste mit bis zu 20 Modulen würde beim Öffnen gleichzeitig Anfragen an fremde Server stellen, nur um Warnhinweise zu setzen. Die bestehenden Listen-Warnungen prüfen Vollständigkeit, nicht Erreichbarkeit — diese Trennung bleibt. Wer ein Modul öffnet, sieht den Zustand. | 2026-09-28 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Route `/create/[id]/station/[stationId]` als eigene Page-Komponente | Next.js App Router-Standardmuster für eine per-Entity-Unterseite, konsistent mit dem bereits vorhandenen `/create/[id]`-Muster; kein neuer Routing-Mechanismus nötig | 2026-08-28 |
| `DraftModule`-Typ + `createDraftModule`/`upsertModule`/`deleteModule`/`reorderModules` in `quest-storage.ts` | Spiegelt exakt das in PROJ-7 etablierte Muster für `DraftStation` — gleiche Datei, gleiche Funktionssignatur-Form, gleiche "Draft lockert Pflichtfelder, isQuestComplete() bleibt die einzige strikte Prüfung"-Philosophie | 2026-08-28 |
| Kein neuer localStorage-Key — Module leben weiterhin im `modules`-Array der jeweiligen Station innerhalb von `gq_quests` | Konsistent mit PROJ-2/PROJ-6/PROJ-7: eine Quest ist ein einziges Objekt, Module sind kein eigenständig adressierbares Storage-Konzept | 2026-08-28 |
| `ModuleTypePicker` als eigene, neue Komponente (kein bestehendes shadcn-Primitive) | Eine Typ-Auswahl mit 5 Kacheln + bedingten Task-Unterarten ist eine geschäftsspezifische Komposition, die intern bestehende Bausteine (Button/Card) verwendet — kein direktes shadcn-Äquivalent vorhanden | 2026-08-28 |
| Fünf typspezifische Sheet-Formular-Komponenten statt eines generischen Formulars mit Feldern nach Bedarf | Jeder Modultyp hat strukturell unterschiedliche Felder (z.B. Options-Array bei Multiple Choice, Items-Array bei Sortierung) — separate Komponenten sind einfacher zu verstehen, zu testen und zu erweitern als ein bedingtes Mega-Formular; folgt dem bereits etablierten Muster separater Komponenten pro Renderer in `station-modules.tsx` (PROJ-4) | 2026-08-28 |
| Wiederverwendung von `@dnd-kit/core` + `@dnd-kit/sortable` (bereits aus PROJ-7 installiert) für Modul-Liste UND Sortierungs-Item-Liste | Keine neue Dependency nötig, gleiches Interaktionsmuster (PointerSensor/TouchSensor mit Aktivierungsdistanz) wie die Stationsliste in PROJ-7 | 2026-08-28 |
| Vollständigkeits-Warnhinweis als reine Anzeige-Funktion (`getModuleWarning(module)`), kein Zod-Schema-Zweitpfad | Die Prüfung ist informativ, nicht blockierend (Entwurfsprinzip) — eine einfache, direkt lesbare Prüf-Funktion pro Modultyp ist verständlicher als ein zweites, gelockertes Zod-Schema nur für Warnhinweise | 2026-08-28 |
| Multiple-Choice-Editor hält `correctIndices` als lokales `Set<number>`, das beim Entfernen einer Option automatisch neu indiziert wird | Verhindert, dass ein gelöschtes Options-Index-Loch stehen bleibt oder auf eine falsche Option zeigt — die Neuindizierung passiert rein im lokalen Sheet-State, bevor überhaupt gespeichert wird | 2026-08-28 |
| Ladeprüfung als Bild, nicht per `fetch()` | `fetch` unterliegt CORS und scheitert bei vielen Servern, die dasselbe Bild als `<img>` anstandslos ausliefern. Die Vorschau würde dann gültige Bilder als kaputt melden — genau das Gegenteil ihres Zwecks. Laden als Bild prüft exakt das, was der Player tut. | 2026-09-28 |
| Eine gemeinsame Vorschau-Komponente für Modul und Quest-Dialog | Zwei Einbauorte, ein Verhalten, ein Wortlaut. Eine zweite Fassung würde bei der nächsten Textkorrektur auseinanderlaufen — dieselbe Begründung wie beim wiederverwendeten Permission-Wortlaut in PROJ-3. | 2026-09-28 |
| Prüfergebnis wird nicht gespeichert | Ob ein Bild lädt, ist ein Zustand des Netzes zum Prüfzeitpunkt, keine Eigenschaft der Quest. Im Datenmodell würde es veralten und beim Export an andere Geräte ein falsches Versprechen weitergeben. | 2026-09-28 |

## Refinement 2026-09-28: Bildvorschau mit Warnung

**Befund:** Per URL eingebundene Bilder erscheinen im Player nicht — weder im Intro/Outro noch als Modul.

**Der Datenweg ist intakt, im Code nachverfolgt:**

| Stelle | Ergebnis |
|---|---|
| `quest-form-dialog.tsx:121-125` | Intro-/Outro-URL wird mit `mediaType: "image"` gespeichert |
| `quest-storage.ts:358` (`sanitizeDraftModule`) | Modul-URL nur getrimmt und von Tags befreit — bleibt erhalten |
| `quest-import.ts` (`sanitizeQuest`) | URLs werden nicht angefasst |
| `intro-screen.tsx:70`, `image-module.tsx` | schlichtes `<img src>` |
| `next.config.ts` | bewusst **keine** Content-Security-Policy |
| `public/sw.js` | greift nur bei `mode === "navigate"`, nicht bei Bildern |

**Ursache:** Die gelieferte Adresse `https://www.magnific.com/de/vektoren-kostenlos/lass-uns-textsymbol-auf-weissem-hintergrund-gehen_24467363.htm#…` ist eine **HTML-Detailseite**, keine Bilddatei. Das `https://`-Format ist erfüllt, also nimmt der Creator sie an; ein `<img>` kann sie nie darstellen. Im Modul erscheint dann „Bild konnte nicht geladen werden", im Intro/Outro wird die Fläche still ausgeblendet (`onError` → `display: none`) — für den Ersteller sieht es aus, als sei das Bild „verschwunden".

**Warum es bisher nicht auffiel:** Der Creator hat nie eine Vorschau gezeigt. Edge Case 6 schloss eine Erreichbarkeitsprüfung ausdrücklich aus — damals mit Blick auf Bilder, die *später* offline gehen, nicht auf Adressen, die *nie* funktioniert haben.

**Entschieden:** Vorschau unter jedem Bild-URL-Feld (Modul **und** Intro/Outro), Warnung mit Anleitung bei Nicht-Laden, Speichern bleibt möglich, Player unverändert.

**Für `/frontend`:** Die Intro-/Outro-Felder liegen in `quest-form-dialog.tsx` (PROJ-6), das Bild-Modul in `module-editor-sheets.tsx`. Beide binden dieselbe neue Komponente ein. Die bestehenden Tests zum `https://`-Präfix bleiben unverändert gültig — die Vorschau ergänzt die Formatprüfung, sie ersetzt sie nicht. Bildanfragen in Tests per `page.route` beantworten, sonst hängen die Tests an fremden Servern.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
/create/[id]/station/[stationId] (NEUE Page)
├── AppHeader (Stationsname + Zurück → /create/[id]) — gleiches Muster wie bestehende Header
├── Empty State (Module leer)
│   ├── Hinweistext
│   └── "Modul hinzufügen"-Button
├── Modul-Liste (sortierbar via @dnd-kit, wie StationListItem in PROJ-7)
│   └── ModuleListItem (neu, pro Modul)
│       ├── Drag-Griff (Icon, min. 44px Touch-Target)
│       ├── Typ-Icon + Kurzvorschau (Textanfang / Dateiname aus URL / Frage)
│       ├── Warnhinweis-Badge, falls unvollständig (z.B. "Kein Inhalt")
│       └── Aktionen-Menü: "Bearbeiten" / "Löschen"
├── "Modul hinzufügen"-Button (FAB, analog zum PROJ-7-Muster)
├── ModuleTypePicker (neu, Sheet oder Vollbild-Auswahl)
│   ├── 5 Kacheln: Text / Bild / Audio / Video / Aufgabe
│   └── Bei "Aufgabe": 3 weitere Kacheln (Code-Eingabe / Multiple Choice / Sortierung)
├── Fünf typspezifische Editor-Sheets (neu, je nach gewähltem/bearbeitetem Typ)
│   ├── TextModuleSheet — Textarea für Inhalt
│   ├── MediaModuleSheet — URL-Feld + optionale Caption (wiederverwendet für Bild/Audio/Video, Titel/Icon je Typ)
│   ├── CodeTaskSheet — Frage + Antwort
│   ├── MultipleChoiceSheet — Frage + Options-Liste mit Checkbox "korrekt" + Hinzufügen/Entfernen
│   └── SortingTaskSheet — Frage + sortierbare Item-Liste (eigener @dnd-kit-Kontext) + Hinzufügen/Entfernen
└── Lösch-Bestätigung (AlertDialog, gleiches Muster wie PROJ-7 Stations-Löschen)
```

### Daten-Architektur

Kein neuer Speicherort. Module sind bereits Teil des Quest-Objekts im bestehenden `gq_quests`-localStorage-Eintrag (`stations[].modules`-Array, PROJ-2-Schema) — PROJ-8 liest/schreibt ausschließlich über den bestehenden Storage-Layer aus PROJ-2/PROJ-6/PROJ-7.

**Lockerung gegenüber dem strikten Import-/Export-Schema** (identisches Prinzip wie `DraftStation` in PROJ-7): Ein `DraftModule` darf mit leeren Pflichtfeldern gespeichert werden — leerer `content`, leere `question`/`answer`, `options` mit weniger als den schema-geforderten 2 Einträgen, `items` mit weniger als den geforderten 3 Einträgen, leere `correctIndices`. Das strikte PROJ-2-Zod-Schema (`questSchema`) bleibt unverändert die einzige Grundlage für Import/Export-Validierung; `isQuestComplete()` erkennt ein unvollständiges Modul automatisch, kein neuer Prüfmechanismus nötig.

**Ablauf beim Bearbeiten eines Moduls:**
1. Sheet öffnet mit einer lokalen Kopie der Moduldaten (neu: leeres Formular für den gewählten Typ; bearbeiten: vorhandene Werte)
2. Eingaben verändern nur diesen lokalen Entwurf — die gespeicherte Quest bleibt unangetastet
3. Erst "Speichern" schreibt den Entwurf zurück ins `modules`-Array der Station und aktualisiert `lastModified`
4. "Abbrechen" verwirft den lokalen Entwurf vollständig, keine Schreiboperation

**Reihenfolge:** Die Position im `modules`-Array bestimmt die Anzeigereihenfolge im Player (bereits die Regel aus PROJ-4). Ein Drag-Vorgang in der Modul-Liste schreibt die neue Array-Reihenfolge sofort in `gq_quests`.

**Löschen:** Entfernt den Modul-Eintrag aus dem Array, aktualisiert `lastModified` — nutzt denselben Schreib-Mechanismus wie jede andere Änderung.

**Vollständigkeits-Warnhinweis:** Eine reine Anzeigefunktion prüft pro Modultyp, ob die für den Player relevanten Pflichtfelder gefüllt sind (z.B. Multiple Choice: mindestens 2 ausgefüllte Optionen UND mindestens eine als korrekt markiert). Das Ergebnis steuert nur den Warnhinweis in der Liste — es verändert nicht, ob gespeichert werden darf.

### Modultyp-Auswahl-Verhalten

- "Modul hinzufügen" öffnet zunächst den `ModuleTypePicker` — keine Vorauswahl eines Typs
- Wahl von "Aufgabe" blendet direkt darunter/danach die 3 Unterarten ein (kein zusätzlicher Navigationsschritt zurück)
- Nach der Typwahl öffnet sich sofort das passende leere Editor-Sheet — der Picker selbst schreibt nichts, er bestimmt nur, welches Sheet als Nächstes gerendert wird
- Beim Bearbeiten eines bestehenden Moduls wird der Picker übersprungen — der Typ ist bereits durch `module.type`/`module.taskType` festgelegt

### Wiederverwendete vs. neue Bausteine

| Baustein | Status |
|----------|--------|
| `gq_quests`-Storage (Laden/Speichern) | ♻️ Wiederverwendet aus PROJ-2/PROJ-6/PROJ-7 |
| `isQuestComplete()` | ♻️ Wiederverwendet aus PROJ-6, keine Änderung nötig |
| `stripHtmlTags()` | ♻️ Wiederverwendet aus PROJ-6/PROJ-7 |
| `httpsUrl`-Validierungslogik (Präfix-Check) | ♻️ Wiederverwendet aus PROJ-2 (`quest-schema.ts`) |
| shadcn Sheet, AlertDialog, DropdownMenu, Checkbox, Input, Textarea, Label, Button | ♻️ Bereits im Projekt vorhanden |
| `@dnd-kit/core` + `@dnd-kit/sortable` | ♻️ Wiederverwendet aus PROJ-7 |
| PointerSensor/TouchSensor-Aktivierungsdistanz-Setup | ♻️ Gleiches Muster wie `/create/[id]/page.tsx` (PROJ-7) |
| Light-Theme-Portal-Fix (`data-theme="light"` + `text-foreground`) | ♻️ Bestehendes Muster aus PROJ-6/PROJ-7, auf alle neuen Sheets/Dialoge übertragen |
| `ModuleListItem` | 🆕 Neu (analog zu `StationListItem`) |
| `ModuleTypePicker` | 🆕 Neu |
| `TextModuleSheet`, `MediaModuleSheet`, `CodeTaskSheet`, `MultipleChoiceSheet`, `SortingTaskSheet` | 🆕 Neu (5 typspezifische Editor-Sheets) |
| `getModuleWarning()`-Hilfsfunktion (Vollständigkeits-Check für den Warnhinweis) | 🆕 Neu |
| `/create/[id]/station/[stationId]/page.tsx` | 🆕 Neu |

### Dependencies

| Package | Zweck | Status |
|---------|-------|--------|
| `@dnd-kit/core`, `@dnd-kit/sortable` | Drag & Drop für Modul-Liste und Sortierungs-Items | ♻️ Bereits installiert (PROJ-7) |
| Zod, Sonner, bestehende shadcn-Komponenten | Wiederverwendung des `httpsUrl`-Schemas, Toasts, UI-Bausteine | ♻️ Bereits installiert |

Keine neuen Pakete erforderlich.

### Offene technische Hinweise für `/frontend`

- `MediaModuleSheet` sollte als eine Komponente mit einem `mediaType`-Prop ("image"/"audio"/"video") gebaut werden statt drei fast identischer Kopien — Titel, Icon und ggf. Platzhaltertext ändern sich, Feldstruktur (URL + optionale Caption) ist identisch
- Beim Entfernen einer als korrekt markierten Multiple-Choice-Option muss der lokale `correctIndices`-State neu indiziert werden (nicht nur gefiltert) — sonst zeigt ein verbleibender Index auf die falsche, nachgerückte Option
- Der Sortierungs-Editor braucht einen eigenen, vom Haupt-`DndContext` der Modul-Liste getrennten `DndContext` innerhalb des Sheets — analog dazu, wie PROJ-7s Karten-Pin-Drag unabhängig vom Listen-Drag funktioniert
- `ModuleListItem`-Kurzvorschau: Text zeigt die ersten ~60 Zeichen von `content`, Bild/Audio/Video zeigen den Dateinamen-Teil der URL (nach dem letzten `/`) oder "Keine URL" als Fallback, Tasks zeigen die `question` oder "Keine Frage" als Fallback

## Implementation Notes (Frontend)

**Date:** 2026-08-28

### Neue/geänderte Dateien
| Datei | Zweck |
|-------|-------|
| `src/app/create/[id]/station/[stationId]/page.tsx` | Neu — Modul-Liste einer Station: Empty State, sortierbare Liste (`@dnd-kit`), "Modul hinzufügen"-FAB, Lösch-Bestätigung |
| `src/components/module-type-picker.tsx` | Neu — Sheet mit 5 Typ-Kacheln, blendet bei "Aufgabe" 3 weitere Kacheln (Code/Multiple Choice/Sortierung) ein |
| `src/components/module-editor-sheets.tsx` | Neu — Router-Komponente `ModuleEditorSheet` + 5 typspezifische Sheets (`TextModuleSheet`, `MediaModuleSheet`, `CodeTaskSheet`, `MultipleChoiceSheet`, `SortingTaskSheet`), gemeinsame `SheetShell` |
| `src/components/module-list-item.tsx` | Neu — sortierbarer Listeneintrag (`useSortable`): Drag-Griff, Typ-Icon, Kurzvorschau, Warnhinweis-Badge, Aktionen-Menü |
| `src/lib/module-warnings.ts` | Neu — `getModuleWarning()`, reine Vollständigkeits-Anzeigefunktion pro Modultyp |
| `src/lib/quest-storage.ts` | + `DraftModule`-Typ, `getStationById()`, `upsertModule()`, `deleteModule()`, `reorderModules()`, interne `sanitizeDraftModule()` |
| `src/app/create/[id]/page.tsx` | `handleEditModules` navigiert jetzt zu `/create/[id]/station/[stationId]` statt Platzhalter-Toast ("Der Modul-Editor folgt in PROJ-8.") |

### Abweichungen von der Tech-Design-Skizze
- `MediaModuleSheet` wie im Tech-Design-Hinweis vorgeschlagen als eine Komponente mit `mediaType`-Prop gebaut (kein dreifacher Copy-Paste für Bild/Audio/Video)
- Multiple-Choice-Editor hält `correctIndices` als lokalen `Set<number>` und indiziert ihn beim Entfernen einer Option neu (wie im Tech-Design-Hinweis beschrieben) — verifiziert durch einen expliziten Reindexierungs-Test
- Der Sortierungs-Editor nutzt einen eigenen, in `SortingTaskSheet` gekapselten `DndContext`, unabhängig vom `DndContext` der Modul-Liste auf der übergeordneten Seite (wie geplant)

### Verifikation
- `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, 6 vorbestehende `<img>`-Warnungen, keine neuen) · `npm test` ✓ (133/133, davon 24 neu: 14 für `getStationById`/`upsertModule`/`deleteModule`/`reorderModules` in `quest-storage.test.ts`, 10 für `getModuleWarning` in `module-warnings.test.ts`)
- Manuell im Browser (Playwright-Treiber gegen WebKit, da der Chromium-Download in dieser Sandbox blockiert war — gleiches Muster wie PROJ-7; 390×844 Mobile-Viewport, gemockte Geolocation Berlin) vollständig durchgespielt: Quest anlegen → Station mit Kartenposition anlegen → über Puzzle-Icon zur Modul-Liste → Empty State → Typ-Auswahl → Text-Modul anlegen → Bild-Modul mit https-URL + Caption anlegen → Aufgabe → Multiple Choice mit 2 Optionen + markierter korrekter Antwort anlegen → Modul-Liste zeigt alle 3 mit korrekten Icons/Kurzvorschauen → Sortierungs-Aufgabe mit 3 Items anlegen → Modul-Listen-Drag (erstes Modul ans Ende gezogen) → per localStorage-Dump verifiziert: Reihenfolge tatsächlich persistiert → Bild-Modul bearbeiten → Sheet öffnet mit URL + Caption korrekt vorausgefüllt → Löschen-Aktion → Bestätigungsdialog mit korrektem Wortlaut → Abbrechen lässt Modul unverändert → Zurück-Navigation → Stationsliste zeigt Station mit Puzzle-Icon wieder korrekt. Keine Konsolenfehler während des gesamten Durchlaufs.
- Nicht per Browser-Automation verifiziert: der Drag-and-Drop-Vorgang für Sortierungs-Items *innerhalb* des Sortierungs-Sheets selbst — die synthetischen Pointer-Events des WebKit-Treibers lösten `@dnd-kit`s Drag-Aktivierung dort nicht zuverlässig aus (Items blieben in Eingabereihenfolge), obwohl derselbe `@dnd-kit`-Sortable-Code auf der Modul-Liste (eine Ebene höher auf derselben Seite) im selben Testlauf nachweislich funktionierte und persistierte. Dies deckt sich mit der bereits in PROJ-7 dokumentierten Einschränkung des automatisierten Treibers bei echten Pointer-Drag-Vorgängen und ist keine neue, PROJ-8-spezifische Auffälligkeit. Sollte in `/qa` gezielt mit echter Touch-/Maus-Interaktion geprüft werden.

## QA Test Results

**Tested:** 2026-08-28
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, 6 vorbestehende `<img>`-Warnungen) · `npm test` ✓ (133/133)
**Browser-Hinweis:** Der gebündelte Playwright-Chromium-Download bricht in dieser Sandbox beim Entpacken ab (reproduzierbar, auf Nutzerwunsch nicht weiter verfolgt). Alle Browser-Tests liefen auf `webkit` ("Mobile Safari"-Projekt) — bereits das etablierte Muster aus PROJ-3/4/6/7.

### Acceptance Criteria Status

#### Navigation zur Modul-Liste
- [x] Puzzle-Icon auf `/create/[id]` navigiert zu `/create/[id]/station/[stationId]`
- [x] "Zurück" auf der Modul-Liste kehrt zu `/create/[id]` zurück

#### Modul-Liste
- [x] Empty State mit Hinweistext und "Modul hinzufügen"-Button bei 0 Modulen
- [x] Module werden in gespeicherter Reihenfolge mit Typ-Icon und Kurzvorschau angezeigt
- [x] Unvollständiges Modul zeigt sichtbaren Warnhinweis (z.B. "Kein Inhalt")

#### Modultyp-Auswahl
- [x] "Modul hinzufügen" zeigt Typ-Auswahl mit 5 Kacheln (Text/Bild/Audio/Video/Aufgabe)
- [x] "Aufgabe" blendet die 3 Aufgaben-Unterarten ein (Code-Eingabe/Multiple Choice/Sortierung)
- [x] Typwahl öffnet das passende leere Formular-Sheet

#### Text-Modul-Editor
- [x] Mehrzeiliger Text mit `- `-Listenzeilen wird unverändert als `content` übernommen

#### Bild-/Audio-/Video-Modul-Editor
- [x] Nicht-https-URL wird mit Inline-Fehler abgelehnt, Sheet bleibt offen
- [x] Gültige https-URL + optionale Caption werden gespeichert

#### Code-Eingabe-Task-Editor
- [x] Frage und Antwort werden gespeichert

#### Multiple-Choice-Task-Editor
- [x] "Option hinzufügen" fügt ein leeres Optionsfeld hinzu, deaktiviert bei 5 Optionen
- [x] "Entfernen" hält mindestens 2 Optionen, deaktiviert bei genau 2
- [x] Markierte Checkboxen werden korrekt als `correctIndices` gespeichert
- [x] Entfernen einer markierten Option indiziert `correctIndices` korrekt neu (kein stiller Fehlzeiger auf die falsche, nachgerückte Option) — gezielt getestet, siehe Tech-Design-Hinweis

#### Sortierungs-Task-Editor
- [x] Eingabereihenfolge bestimmt `items`-Array
- [x] Drag eines Items übernimmt die neue Reihenfolge im lokalen Entwurf sofort — **entgegen der Erwartung aus den Implementation Notes ("nicht per Browser-Automation verifizierbar") funktionierte der automatisierte Pointer-Drag in dieser QA-Runde zuverlässig**, siehe Hinweis unten
- [x] "Entfernen" hält mindestens 3 Items, deaktiviert bei genau 3

#### Speichern (Entwurfsprinzip)
- [x] Unvollständiges Modul (leerer Text-Inhalt) wird trotzdem gespeichert, Sheet schließt sich
- [x] Abbrechen verwirft alle Änderungen vollständig
- [x] `lastModified` der Quest wird bei jedem Speichervorgang aktualisiert

#### Reihenfolge (Drag & Drop)
- [x] Echter Pointer-Drag eines Moduls an eine andere Position übernimmt und speichert die neue Reihenfolge sofort
- [x] Neue Reihenfolge bleibt nach Reload erhalten

#### Bearbeiten
- [x] Sheet öffnet mit allen vorhandenen Werten korrekt vorausgefüllt (getestet am Bild-Modul: URL + Caption)

#### Löschen
- [x] Bestätigungsdialog erscheint mit korrektem Wortlaut
- [x] Bestätigen entfernt das Modul aus der Station
- [x] Abbrechen lässt das Modul unverändert

**Ergebnis: 24/24 testbare Kriterien bestanden**

### Edge Cases Status

1. [x] Vollständigkeits-Definition pro Modultyp — verifiziert für Text, Multiple-Choice (getestet: "Kein Inhalt"), plus 10 dedizierte Unit-Tests in `module-warnings.test.ts` für alle 5 Typen/Task-Unterarten
2. [x] Letztes Modul einer Station gelöscht → Empty State, Stationsliste zeigt "0 Module" (Regressionstest gegen PROJ-6/7 `isQuestComplete`/Modul-Zähler)
3. [x] Multiple-Choice: alle Optionen korrekt markierbar — Code-Pfad erlaubt es ohne Sonderbehandlung (kein Limit auf `correctIndices.size`, per Code-Review bestätigt)
4. [x] Multiple-Choice: keine Option korrekt → wird gespeichert, Warnhinweis "Keine Antwort markiert" (per `getModuleWarning`-Unit-Test abgedeckt)
5. [x] Sortierung: identische Item-Texte → keine Sonderbehandlung im Code (per Code-Review bestätigt, kein Duplikat-Check vorhanden)
6. [x] Media-URL wird nach Speichern ungültig → PROJ-4s bestehender `onError`-Fallback bleibt zuständig, PROJ-8 prüft nur das URL-Format beim Speichern
7. [x] Kein Konflikt zwischen Modul-Listen-Drag und Sortierungs-Item-Drag — beide unabhängig getestet, funktionieren nebeneinander (gezielter Stresstest: Drag in der Liste, dann Drag im Sheet, keine Interferenz)
8. [x] Zwischenstand-Garantie — jedes gespeicherte Modul landet sofort in `gq_quests`, verifiziert per Reload-Test
9. [x] Kein Typ-Wechsel bei bestehendem Modul — Bearbeiten-Sheet zeigt immer den ursprünglichen Typ, kein Umschalter im UI vorhanden
10. [x] Navigation zu ungültiger `stationId` → liefert korrekt HTTP 404 (`notFound()`), analog zum bestehenden `/create/[id]`-Verhalten

### Security Audit Results
- [x] XSS via `<script>` im Text-Modul-Inhalt: Tag wird entfernt (`stripHtmlTags`), kein Alert ausgelöst, kein rohes `<script>` im DOM
- [x] XSS via `<img onerror>` in der Multiple-Choice-Frage: Tag entfernt, kein Alert
- [x] XSS via `<svg onload>` in einer Multiple-Choice-Option: Tag entfernt, kein Alert
- [x] `javascript:`-URL in einem Bild-Modul: von der UI-Validierung (`https://`-Präfix-Check in `MediaModuleSheet`) korrekt abgelehnt, Sheet bleibt offen, nichts gespeichert
- [x] Gerenderte Medien-URLs landen ausschließlich in `src`-Attributen von `<img>`/`<audio>`/`<video>` (PROJ-4) — diese Elemente führen `javascript:`-URLs in modernen Browsern ohnehin nicht aus, selbst im hypothetischen Fall einer gespeicherten nicht-https-URL
- [x] Keine neuen Netzwerk-Calls, keine Secrets, keine PII-Übertragung an Dritte
- [x] localStorage-Schreibzugriffe laufen ausschließlich über die geprüften `quest-storage.ts`-Funktionen (`upsertModule`/`deleteModule`/`reorderModules`), konsequent an `questId`+`stationId` gebunden — kein Cross-Quest- oder Cross-Station-Datenleck möglich

### Bugs Found

Keine Bugs mit funktionaler Auswirkung gefunden. Ein Low-Severity-Hinweis zur Härtung wurde dokumentiert, ist aber kein Blocker:

#### HINWEIS-1 (Low, kein Blocker): `upsertModule()` erzwingt den `https://`-Präfix für Medien-URLs nicht selbst
- **Beobachtung:** Die `https://`-Validierung für Bild-/Audio-/Video-URLs sitzt ausschließlich in `MediaModuleSheet` (UI-Ebene). Die exportierte `upsertModule()`-Funktion in `quest-storage.ts` würde eine `javascript:`- oder `http://`-URL unverändert speichern, wenn sie direkt (unter Umgehung der Sheet-UI) aufgerufen würde.
- **Tatsächliches Risiko:** Sehr gering bis keines. Es gibt keinen Angreifer, der davon profitiert — wer `upsertModule()` direkt aufrufen könnte, hätte bereits vollen Zugriff auf den eigenen Browser/localStorage und könnte ohnehin beliebige Daten injizieren (kein Privilegiensprung). Zusätzlich rendern die PROJ-4-Medien-Komponenten die URL ausschließlich als `src` von `<img>`/`<audio>`/`<video>` — diese Elemente ignorieren `javascript:`-URLs in allen relevanten Browsern, es gäbe also selbst im Erfolgsfall keine Codeausführung, nur einen fehlerhaften Medien-Placeholder (bestehender PROJ-4-Fallback).
- **Empfehlung:** Optional in einem künftigen Hardening-Pass die `httpsUrl`-Prüflogik aus `quest-schema.ts` auch in `sanitizeDraftModule()` spiegeln, für Verteidigung in der Tiefe. Kein Fix vor Deploy nötig.

### Code-Qualitäts-Hinweis (kein Bug, keine Aktion nötig)
`ModuleListItem` und die Modul-Liste auf `/create/[id]/station/[stationId]/page.tsx` verwenden den Array-Index (`module-${index}`) als `@dnd-kit`-Sortable-`id` und React-`key`, statt einer stabilen, inhaltsunabhängigen ID (Module haben keine eigene `id` im PROJ-2-Schema, anders als Stationen). Das ist ein bekanntes React-Anti-Pattern, das theoretisch zu Drag-Status-Desyncs führen könnte. Gezielt stresstestet (Löschen mitten in der Liste gefolgt von sofortigem Drag; zwei aufeinanderfolgende Drags ohne Pause) — in allen Fällen stimmten sichtbare Liste und gespeicherte Reihenfolge exakt überein, kein Bug beobachtet. Keine Änderung empfohlen, da Module strukturell keine eigene ID besitzen und ein Umbau (z.B. synthetische UUIDs nur für die Editor-Session) unverhältnismäßigen Aufwand für ein rein hypothetisches Risiko bedeuten würde.

### Regressionstests
- **PROJ-7 (Creator — Stationen-Editor):** 1 veralteter Test gefunden und behoben — `shows all stations in saved order with name, radius, and position status` prüfte noch auf "25 m Radius" in der Stationsliste, das durch eine zwischenzeitliche, vom Nutzer angeforderte UI-Änderung (`fix(PROJ-7): Show module count instead of radius in station list`, Commit `c5db9a9`) durch die Modulanzahl ersetzt wurde. **Test korrigiert** (prüft jetzt "1 Modul" statt "25 m Radius"), keine Produktionscode-Änderung nötig, reiner Test-Fix — bestätigt per `git stash`-Vergleichslauf, dass alle anderen 19 PROJ-7-Tests bereits vor PROJ-8 unverändert grün waren. Volle PROJ-7-Suite jetzt wieder 20/20 grün.
- **PROJ-1/PROJ-3/PROJ-4 E2E-Suiten:** 19 vorbestehende Fehlschläge unverändert vorhanden — durch Vergleichslauf mit `git stash` (alle PROJ-8-Commits sowie der PROJ-7-Test-Fix entfernt) bestätigt, dass exakt dieselben 19 Tests bereits ohne jede PROJ-8-Änderung fehlschlagen. Keine neuen Regressionen durch PROJ-8, deckt sich mit der bereits in PROJ-4/PROJ-7 dokumentierten Beobachtung.
- **PROJ-6 (Creator — Quest-Verwaltung):** Keine direkten Tests in dieser Runde erneut ausgeführt (nicht von PROJ-8-Dateien berührt), aber die Regressionsprüfung "Stationsliste zeigt Modulanzahl korrekt, letztes Modul löschen setzt Station auf 'Entwurf' zurück" bestätigt indirekt, dass `isQuestComplete()` weiterhin korrekt mit PROJ-8-Modulen zusammenspielt.

### Unit Tests
Bereits im Frontend-Schritt ergänzt (24 neue Tests: 14 in `quest-storage.test.ts` für `getStationById`/`upsertModule`/`deleteModule`/`reorderModules`, 10 in `module-warnings.test.ts` für `getModuleWarning`) — keine weiteren im QA-Schritt nötig, bestehende Abdeckung wurde stichprobenartig gegen die tatsächliche Sanitization-Pipeline verifiziert (siehe Security Audit).

### E2E Tests
Neue Datei `tests/proj-8-creator-modul-editor.spec.ts`: 29 Tests, mindestens einer pro Akzeptanzkriterien-Gruppe plus dedizierte Edge-Case- und Regressionsprüfungen (ungültige `stationId` → 404, Stationsliste reagiert auf PROJ-8-Löschung). Alle 29 grün auf "Mobile Safari". Zusätzlich `tests/proj-7-creator-stationen-editor.spec.ts` um den oben beschriebenen Radius→Modulanzahl-Test-Fix korrigiert (weiterhin 20/20 grün, jetzt korrekt formuliert).

### Production-Ready Decision

**READY** — Keine Bugs mit funktionaler oder sicherheitsrelevanter Auswirkung gefunden. Alle 24 testbaren Akzeptanzkriterien bestanden, alle 10 dokumentierten Edge Cases verifiziert, Security-Audit ohne Befund. Ein Low-Severity-Härtungshinweis (HINWEIS-1) ist optional und kein Blocker.

### Summary
- **Acceptance Criteria:** 24/24 bestanden
- **Bugs Found:** 0 (0 critical, 0 high, 0 medium, 0 low funktional) — 1 optionaler Härtungshinweis (Low, kein Bug)
- **Security:** Pass — keine ausnutzbaren Schwachstellen gefunden
- **Production Ready:** YES
- **Recommendation:** Deploy freigegeben. Optional: HINWEIS-1 (https-Erzwingung auch in `sanitizeDraftModule()` spiegeln) in einem künftigen Hardening-Pass nachziehen, kein Blocker für dieses Release.

## Deployment

**Production URL:** https://geoquesty.vercel.app
**Deployed:** 2026-08-28
**Platform:** Vercel (auto-deploy on push to main)
**Git Tag:** v1.11.0-PROJ-8

### Pre-Deployment Checks
- [x] `npm run build` erfolgreich
- [x] `npm run lint` erfolgreich (0 Fehler, 6 vorbestehende `<img>`-Warnungen)
- [x] QA-Freigabe: "Approved" / "Production Ready: YES"
- [x] Keine Critical/High-Bugs offen (0 Bugs gefunden, 1 optionaler Low-Härtungshinweis, kein Blocker)
- [x] Keine neuen Umgebungsvariablen nötig
- [x] Keine Secrets im Diff (`git diff origin/main main --stat` vor dem Push geprüft)
- [x] Kein Datenbank-Layer betroffen (weiterhin reines localStorage, kein Supabase-Bezug)
- [x] Alle Commits gepusht nach `main`

### Deploy-Vorgang
`git push origin main` (Commit `0d60a1d`) löst den bestehenden Vercel-GitHub-Auto-Deploy aus — kein manueller `vercel --prod`-Schritt nötig, da das Projekt bereits seit PROJ-1 verbunden ist.

### Post-Deployment-Verifikation
- Neuer Build bestätigt live per End-to-End-Roundtrip direkt in Produktion (Playwright/WebKit): Testquest via `localStorage` gesät → `/create/[id]` geöffnet → Puzzle-Icon "Module bearbeiten" getippt → Navigation zu `/create/[id]/station/[stationId]` erfolgreich (diese Route existierte im vorherigen Deploy noch nicht — eindeutiger Beleg für den neuen Build) → Empty State sichtbar → Text-Modul angelegt und gespeichert → Modul erscheint korrekt in der Liste. Keine Konsolenfehler.
- Erster Verifikationsversuch (unmittelbar nach dem Push) schlug noch fehl, weil der alte Build (Puzzle-Icon ohne Funktion) noch live war — nach kurzer Wartezeit erneut geprüft, dann erfolgreich. Kein Fehler im neuen Code, nur normale Vercel-Build-Propagationszeit.
- Test-Quest wurde ausschließlich im `localStorage` des Test-Browsers angelegt (kein Backend/keine geteilte Datenbank bei GeoQuest) und dort direkt wieder entfernt — keine Bereinigung in Produktion nötig, da nichts serverseitig gespeichert wurde

### Bekannte offene Punkte
Keine. HINWEIS-1 aus dem QA-Bericht (fehlende serverseitige https-Erzwingung in `sanitizeDraftModule()`) ist ein optionaler Härtungsvorschlag ohne ausnutzbare Sicherheitslücke (siehe QA Security Audit) — kein Fix vor oder nach diesem Deploy erforderlich, kann bei Bedarf in einem künftigen Hardening-Pass nachgezogen werden.

## Implementation Notes — Creator-Redesign & Hover-Vereinheitlichung (2026-08-28)

Zwei nutzergetriebene Styling-Änderungen ohne neue Acceptance Criteria (siehe PROJ-6 für den ausführlichen, geteilten Kontext):

**Creator-Redesign** (Commit `d5ce893`): `/create/[id]/station/[stationId]` erhält denselben Ambient-Background + transparenten Header wie die anderen beiden Creator-Screens, für ein konsistentes Erscheinungsbild im gesamten Creator-Modus (Nutzer-Entscheidung während der Umsetzung). Die Warnhinweis-Badges bei unvollständigen Modulen (z.B. "Kein Inhalt") sind davon nicht betroffen und bleiben unverändert.

**Hover-Vereinheitlichung** (Commit `d7565a1`): Betrifft PROJ-8 nicht direkt — die Modul-Liste hat wie die Stationsliste bewusst keine Hover-Animation auf Kartenebene und bleibt unverändert.

**Verifikation:** `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, 6 vorbestehende Warnungen) · `npm test` ✓ (133/133) · volle PROJ-8-E2E-Suite weiterhin 29/29 grün (ein Testname wurde von "puzzle icon" auf "pencil icon" korrigiert, um den geänderten Icon-Namen widerzuspiegeln — reine Testbeschreibung, keine Assertion-Änderung), keine Regressionen.

**Kein neuer Feature-Spec-Eintrag:** Reine visuelle Anpassung an ein bereits deploytes, QA-freigegebenes Feature.

**Deployment:** Mit Commits `d5ce893`/`d7565a1`/`85c6300` nach `main` gepusht und live verifiziert — siehe "Deployment — Creator-Redesign & Hover-Vereinheitlichung" in PROJ-6 für Details (kein separater Git-Tag, betrifft PROJ-6/7/8 gemeinsam).

---

## QA Test Results — List-Header-Pattern (2026-08-29)

Modul-Liste (`create/[id]/station/[stationId]/page.tsx`) übernimmt das Eyebrow/Titel/Meta-Zeile/Divider-Muster (Eyebrow „Stationsinhalte", Meta-Zeile „X Module"), jetzt dokumentiert in `docs/design-system.md` → "List-Header-Pattern". Locked-State zeigt weiterhin „Geschützte Station" statt Stationsname (unverändert aus PROJ-11), Modulanzahl bleibt sichtbar — keine neue Informationslücke, da ohne Backend ohnehin alles im Browser-`localStorage` liegt.

**Verifikation:** `npm run build` ✓ · `npm test` ✓ (151/151) · `npm run lint` ✓ (0 Fehler, 6 vorbestehende Warnungen). E2E nicht ausgeführt (Playwright-Chromium fehlte lokal, Neuinstallation vom Nutzer abgelehnt) — stattdessen `proj-1`/`proj-3`/`proj-5`/`proj-8`-Spec-Dateien manuell gegen den Diff geprüft: `proj-8:58` (`Zurück`-Link) bleibt gültig, `proj-3:228`/`proj-5:121` betreffen andere, unberührte Komponenten. Details siehe konsolidierter QA-Eintrag in PROJ-6.

---

## Implementation Notes — Bildvorschau (2026-09-28)

**Drei Produktivdateien, eine davon neu.** Kein neues Paket, keine neue Route, kein Eingriff ins Datenmodell.

| Datei | Änderung |
|---|---|
| `src/components/image-url-preview.tsx` (neu) | Prüfung, Vorschau, Warnung — eine Komponente für beide Einbauorte |
| `src/components/module-editor-sheets.tsx` | eine Zeile unter dem URL-Feld, nur bei `mediaType === "image"` |
| `src/components/quest-form-dialog.tsx` | je eine Zeile unter Intro- und Outro-URL (PROJ-6) |

**Prüfung als Bild, nicht per `fetch()`** — `new Image()` ohne `crossOrigin`, damit dieselben Ladebedingungen gelten wie im Player (Origin, `Referrer-Policy` aus `next.config.ts`). Die beim Öffnen vorhandene Adresse wird sofort geprüft, jede spätere Eingabe mit 450 ms entprellt. Ein `cancelled`-Flag im Effekt-Cleanup verhindert, dass eine ältere, langsamere Prüfung das Ergebnis einer neueren überschreibt; zusätzlich zeigt die Komponente ein Ergebnis nur an, wenn es zur **aktuellen** Adresse gehört — während der Entprellung steht „Bild wird geprüft…", nie die Warnung der vorherigen Eingabe.

**Warnung über shadcns `Alert` (Variante `destructive`)**, nicht selbst gebaut — ein erster Entwurf hatte einen eigenen Warnkasten, der gegen die „shadcn first"-Regel verstieß. `Alert` bringt `role="alert"` mit; `aria-live` am Wrapper ist deshalb entfallen, sonst würde „Bild wird geprüft…" bei jeder Eingabe vorgelesen. Titel „Unter dieser Adresse ist kein Bild.", darunter Folge und Anleitung („lange drücken, am Computer Rechtsklick → Bildadresse kopieren"), beide in `text-foreground`, 14px.

**Am Bildschirm abgenommen und dabei korrigiert:** Der Titel stand zuerst in Warnrot (`--destructive`, gemessen `rgb(230,26,43)` auf `rgb(246,248,249)`) und erreichte nur **4.34:1** — knapp unter der 4.5:1-Vorgabe. Jetzt steht er in der Textfarbe (**18.21:1**); Symbol und Rahmen bleiben rot und tragen das Warnsignal. *Beobachtung ohne Bug-Status, vorbestehend:* Die bestehenden Feld-Fehlermeldungen im Creator („Nur HTTPS-URLs sind erlaubt.") nutzen dieselbe Farbe und liegen damit ebenfalls bei 4.34:1 — nicht in diesem Refinement geändert.

**Vorschau-Bild:** `max-w-full max-h-48 object-contain`, leeres `alt` (dekorativ — die Adresse steht im Feld darüber). Ein 3000 px breites Bild bleibt innerhalb der Feldbreite (E2E-Test).

**Bewusst nicht:** kein Timeout für hängende Server (die Warnung ist nur Hinweis, und ein Browser bricht irgendwann selbst ab), keine Prüfung in der Modul-Liste, keine Änderung am Player.

### Tests
- **8 Unit-Tests** (`image-url-preview.test.tsx`) mit steuerbarer `Image`-Attrappe — jsdom lädt keine Bilder. Gegenprobe: Schutz gegen veraltete Ergebnisse entfernt → **genau der zuständige Test** fällt.
- **11 E2E-Tests je Engine** (inkl. Kontrast-Wächter, nach der Korrektur ergänzt; die Gegenprobe unten lief vor dessen Ergänzung mit 10) (`tests/proj-8-bildvorschau.spec.ts`), Bildanfragen per `page.route` an einen erfundenen Host: PNG, 3000 px breites SVG und eine HTML-Seite, die die gemeldete Magnific-Adresse nachbildet. Gegenprobe gegen den echten Vorgängerstand (beide Einbauorte zurückgesetzt, neu gebaut): **7 von 10 fallen je Engine** mit echten Assertions; grün bleiben genau die drei Wächter, die auch ohne Feature bestehen müssen (leeres Feld/`http://`, Audio-Modul, Modul-Liste).
- Bestehende Tests mit `https://example.com/...`-Bildern lösen jetzt eine echte Anfrage aus und zeigen die Warnung (example.com liefert HTML). Sie prüfen nichts, was davon betroffen ist, und bleiben unverändert.

### Ein Fehlschlag, der kein Produktfehler war
Die Regression über PROJ-4/5/6/8 (beide Engines) ergab **278 passed / 3 skipped / 1 unexpected**. Der Fehlschlag — PROJ-4 „shows all modules of a station…" auf Mobile Safari — war auch isoliert **3 von 3** rot und zeigte „Application error". Per Init-Skript abgefangen: `ChunkLoadError: Failed to load chunk /_next/static/chunks/625da0edc759610b.js` — die Datei existierte nicht mehr, der Server lieferte HTTP 500. `.next/BUILD_ID` war um 22:09 neu geschrieben worden, mein Build lag davor: **Eine parallel laufende Sitzung hatte unter dem laufenden `next start` neu gebaut.** Nach Server-Neustart **3 von 3** grün.

**Für künftige Läufe:** Arbeiten zwei Sitzungen im selben Verzeichnis, darf keine `npm run build` ausführen, während die andere gegen `next start` testet — `.next` ist geteilt. Playwright meldet diesen Fall auf WebKit **nicht** als `pageerror` und nicht als Konsolenfehler; sichtbar wurde er erst über einen eigenen `window.onerror`-Hook.

**Suiten:** Unit **301/301** (vorher 293). E2E neue Suite **22/22** über beide Engines, PROJ-4/5/6/8 wie oben. Build sauber, Lint 0 Fehler (8 Warnungen, keine in geänderten Dateien), `tsc` ohne neue Fehler.
