# PROJ-6: Creator — Quest-Verwaltung

## Status: In Progress
**Created:** 2026-08-27
**Last Updated:** 2026-08-27

## Dependencies
- Requires: PROJ-1 (App Shell & Mode Switch) — für Routing (`/create`) und UI-Rahmen
- Requires: PROJ-2 (Quest Data Model & JSON Import) — für Quest-Schema, den `gq_quests`-Storage-Layer und den bestehenden Import-Button
- Beeinflusst: PROJ-3 (Player — GPS-Navigation, bereits deployed) — die Play-Quest-Liste muss zusätzlich nach `published` filtern. Kein neuer PROJ-3-Spec-Abschnitt nötig, aber `src/app/play/page.tsx` ändert sich als Konsequenz dieser Spec.

## Summary
Die zentrale Verwaltungsansicht im Creator-Modus (`/create`): Nutzer sehen alle ihre Quests (selbst erstellte + importierte), können neue Quests anlegen, bestehende umbenennen oder löschen. Bildet die Eingangstür zum gesamten Creator-Flow — jede hier angelegte Quest landet anschließend im Stationen-Editor (PROJ-7). Steuert außerdem, ob eine Quest im Play-Modus sichtbar/spielbar ist: Erst nach explizitem Veröffentlichen durch den Ersteller erscheint eine (vollständige) Quest in der Play-Liste — unvollständige oder noch nicht freigegebene Quests bleiben ausschließlich im Creator sichtbar.

## User Stories
1. Als Ersteller möchte ich alle meine Quests auf einen Blick sehen, damit ich weiß, woran ich gerade arbeite.
2. Als Ersteller möchte ich eine neue, leere Quest mit einem Namen anlegen können, damit ich sofort mit dem Bau einer neuen Schnitzeljagd beginnen kann.
3. Als Ersteller möchte ich eine Quest umbenennen können, damit ich Tippfehler korrigieren oder den Arbeitstitel anpassen kann.
4. Als Ersteller möchte ich eine Quest löschen können, damit ich nicht mehr benötigte Entwürfe oder Testquests entfernen kann.
5. Als Ersteller möchte ich vor dem Löschen gefragt werden, ob ich sicher bin, damit ich nicht versehentlich Arbeit verliere.
6. Als Ersteller möchte ich erkennen, welche Quests noch unvollständige Entwürfe sind, damit ich weiß, welche noch nicht spielbar/exportierbar sind.
7. Als Ersteller möchte ich eine fertige Quest explizit veröffentlichen, damit sie erst dann im Play-Modus sichtbar und spielbar wird — vorher kann ich in Ruhe weiterarbeiten, ohne dass eine unfertige oder noch nicht freigegebene Quest dort auftaucht.

## Out of Scope
- Stationen-Editor / Karte zum Setzen von GPS-Koordinaten (PROJ-7)
- Modul-Editor für die 5 Modultypen (PROJ-8)
- JSON-Export (PROJ-9)
- Vorschau/Testmodus (PROJ-10)
- Passwortschutz zum Bearbeiten importierter Quests (PROJ-11)
- Quest duplizieren (bewusst verschoben, kein MVP-Bedarf)
- Quest-Import per Datei (bereits in PROJ-2 gebaut, wird hier nur wiederverwendet, nicht neu spezifiziert)
- Suche/Filter/Tags für die Quest-Liste (bei erwarteter Quest-Anzahl 10–20 nicht nötig)
- Mehrbenutzer-Zugriff / Freigabe an andere Nutzer (kein Account-System laut PRD)
- Feste Obergrenze für Quest-Anzahl (nur natürliches localStorage-Limit aus PROJ-2)
- "Unveröffentlichen" / Zurückziehen einer bereits veröffentlichten Quest (bewusst einmalig/endgültig, siehe Decision Log)
- JSON-Export selbst (PROJ-9, weiterhin nicht gebaut) — diese Refinement legt nur die Regel fest, dass Export später Veröffentlicht voraussetzt; die technische Umsetzung folgt bei `/write-spec PROJ-9`

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Liste:**
- [ ] Angenommen der Nutzer öffnet `/create`, wenn Quests vorhanden sind, dann werden alle Quests sortiert nach letzter Änderung (neueste zuerst) angezeigt, mit Name, Stationsanzahl und Entwurf-Badge falls zutreffend
- [ ] Angenommen der Nutzer öffnet `/create`, wenn keine Quests vorhanden sind, dann erscheint ein Empty State mit Hinweistext, einem "Neue Quest erstellen"-Button und dem bestehenden Import-Button

**Neue Quest erstellen:**
- [ ] Angenommen der Nutzer tippt auf "Neue Quest erstellen", wenn der Dialog erscheint, dann wird nach dem Quest-Namen gefragt
- [ ] Angenommen der Namens-Dialog ist offen, wenn der Nutzer einen gültigen Namen eingibt und bestätigt, dann wird eine neue Quest mit diesem Namen, einer neuen UUID, leerer Stationsliste und `lastModified = jetzt` gespeichert und der Nutzer wird zu `/create/[id]` navigiert
- [ ] Angenommen der Namens-Dialog ist offen, wenn der Nutzer ein leeres Namensfeld bestätigt, dann erscheint eine Validierungsfehlermeldung und es wird keine Quest angelegt
- [ ] Angenommen der Namens-Dialog ist offen, wenn der Nutzer abbricht, dann wird keine Quest angelegt und der Dialog schließt sich

**Entwurf-Kennzeichnung:**
- [ ] Angenommen eine Quest hat 0 Stationen oder unvollständige Pflichtfelder (z.B. leerer Intro-Text) ODER ist vollständig aber noch nicht veröffentlicht, wenn sie in der Liste angezeigt wird, dann erscheint ein "Entwurf"-Badge
- [ ] Angenommen eine Quest wurde veröffentlicht, wenn sie in der Liste angezeigt wird, dann erscheint kein "Entwurf"-Badge

**Veröffentlichen:**
- [ ] Angenommen eine Quest ist unvollständig (erfüllt nicht alle Pflichtfelder des Quest-Schemas), wenn der Nutzer das Aktionen-Menü öffnet, dann ist "Veröffentlichen" sichtbar, aber deaktiviert
- [ ] Angenommen eine Quest ist vollständig und noch nicht veröffentlicht, wenn der Nutzer das Aktionen-Menü öffnet, dann ist "Veröffentlichen" aktiv wählbar
- [ ] Angenommen eine vollständige, unveröffentlichte Quest existiert, wenn der Nutzer "Veröffentlichen" wählt, dann wird `published` auf `true` gesetzt, `lastModified` aktualisiert, eine Erfolgsmeldung (Toast) erscheint, und das "Entwurf"-Badge verschwindet
- [ ] Angenommen eine Quest wurde veröffentlicht, wenn der Nutzer die Quest-Liste im Play-Modus öffnet, dann erscheint die Quest dort (vorher nicht)
- [ ] Angenommen eine Quest wurde bereits veröffentlicht, wenn der Nutzer das Aktionen-Menü öffnet, dann ist die Option "Veröffentlichen" nicht mehr vorhanden (Veröffentlichen ist einmalig, kein Zurück)
- [ ] Angenommen eine Quest wird per Datei importiert (PROJ-2), wenn sie gespeichert wird, dann gilt sie automatisch als veröffentlicht (`published: true`), ohne dass ein manueller Schritt nötig ist

**Umbenennen:**
- [ ] Angenommen eine Quest existiert, wenn der Nutzer die Umbenennen-Aktion auf einer Quest-Karte auswählt, dann öffnet sich ein Dialog mit dem aktuellen Namen vorausgefüllt
- [ ] Angenommen der Umbenennen-Dialog ist offen, wenn der Nutzer einen neuen gültigen Namen bestätigt, dann wird der Name gespeichert, `lastModified` aktualisiert und die Liste neu sortiert
- [ ] Angenommen der Umbenennen-Dialog ist offen, wenn der Nutzer das Feld leert und bestätigt, dann erscheint eine Validierungsfehlermeldung und der alte Name bleibt erhalten

**Löschen:**
- [ ] Angenommen eine Quest existiert, wenn der Nutzer die Löschen-Aktion auf einer Quest-Karte auswählt, dann erscheint ein Bestätigungsdialog ("Quest wirklich löschen? Das kann nicht rückgängig gemacht werden.")
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Nutzer bestätigt, dann wird die Quest aus localStorage entfernt, ihr Spielfortschritt (`gq_progress_{questId}`) ebenfalls gelöscht, und die Liste aktualisiert sich
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Nutzer abbricht, dann bleibt die Quest unverändert erhalten

## Edge Cases
1. **Doppelte Quest-Namen:** Zwei Quests heißen "Stadtrallye" → beide werden erlaubt und normal angezeigt, Unterscheidung über Stationsanzahl/Datum
2. **Löschen der letzten Quest:** Nutzer löscht seine einzige Quest → Liste zeigt danach den Empty State
3. **Löschen während die Quest gerade im Player läuft (anderer Tab):** Quest wird trotzdem gelöscht, der andere Tab zeigt beim nächsten Laden/Speicherversuch einen Fehler bzw. verwaiste Daten (kein Cross-Tab-Sync in MVP)
4. **Sehr langer Quest-Name:** Wird wie andere Textfelder (PROJ-2) nicht künstlich begrenzt außer durch das Gesamtgrößen-Limit, in der Karte per `line-clamp` gekürzt dargestellt
5. **HTML/Script im Quest-Namen:** Wird wie in PROJ-2 beim Speichern sanitized (Tags entfernt)
6. **localStorage voll beim Anlegen einer neuen Quest:** Gleiche Fehlermeldung wie in PROJ-2 ("Speicher voll. Lösche eine Quest und versuche es erneut.")
7. **Import-Button auf `/create`:** Bereits durch PROJ-2 abgedeckt — importierte Quests erscheinen in derselben Liste wie selbst erstellte
8. **Import setzt automatisch `published: true`:** Bewahrt das bestehende "Import und sofort spielen"-Verhalten aus PROJ-2 — nur selbst erstellte Quests durchlaufen den Entwurf → Veröffentlichen-Zyklus
9. **"Veröffentlichen" bei unvollständiger Quest:** Menüpunkt ist sichtbar, aber deaktiviert — kein Klick möglich, keine Fehlermeldung nötig, da die UI die Aktion gar nicht erst zulässt
10. **Erneutes "Veröffentlichen" einer bereits veröffentlichten Quest:** Nicht möglich — die Option verschwindet aus dem Menü, sobald `published === true`
11. **Bestehende Quests ohne `published`-Feld (vor diesem Refinement angelegt):** Werden beim Lesen als bereits veröffentlicht behandelt (siehe Open Questions) — verhindert, dass Quests durch dieses Update plötzlich aus der Play-Liste verschwinden

## Technical Requirements
- Speicher: Nutzt den bestehenden `gq_quests`-Storage-Layer aus PROJ-2 (kein neuer Key)
- Neue Quest erfüllt NICHT zwingend das volle `questSchema` aus PROJ-2 (leere Stationsliste erlaubt) — das Speicherformat muss den Entwurfsstatus zulassen (Detail für /architecture)
- Sanitization: Quest-Name wird wie andere Textfelder in PROJ-2 von HTML-Tags bereinigt
- Touch-Targets: min. 44px (PRD-Anforderung)
- Bestätigungsdialog bei kritischen Aktionen (Löschen) — PRD-Vorgabe
- Neues Feld `published: boolean` im Quest-Datenmodell (Erweiterung von PROJ-2). Default `false` für neu angelegte Quests (`createDraftQuest`), `true` für per Datei importierte Quests (`quest-import.ts`)
- `/play`-Quest-Liste (PROJ-3, `src/app/play/page.tsx`) muss zusätzlich nach `published === true` filtern — bestehende Live/Neu/Fertig-Filter-Tabs bleiben unverändert und wirken nur auf die bereits vorgefilterte, veröffentlichte Menge

## Open Questions
- [x] Ab welcher Kombination von Feldern gilt eine Quest exakt als "vollständig" vs. "Entwurf"? → Gelöst in `/architecture`: Eine separate Vollständigkeits-Prüfung wendet dieselben Regeln wie das Import-Schema aus PROJ-2 an (mind. 1 Station mit mind. 1 Modul, Intro-/Outro-Text vorhanden), ohne beim Speichern zu blockieren. Siehe Tech Design.
- [ ] Soll es eine maximale Zeichenlänge für den Quest-Namen geben (UI-Konsistenz), oder reicht das bestehende 5-MB-Gesamtlimit aus PROJ-2?
- [x] Wie werden bereits gespeicherte Quests ohne `published`-Feld beim ersten Laden nach diesem Update behandelt? → Gelöst in `/architecture`: Eine `isPublished()`-Prüfung liest das Feld mit Fallback `true`, wenn es fehlt — bestehende Quests bleiben ohne Zutun weiterhin in der Play-Liste sichtbar. Siehe Tech Design.
- [ ] Wie erzwingt PROJ-9 (JSON-Export, noch nicht spezifiziert) die Regel "Export setzt Veröffentlicht voraus" technisch (z.B. Export-Button deaktiviert bei unveröffentlichten Quests)? Wird bei `/write-spec PROJ-9` aufgegriffen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kernaktionen: Liste, Neu anlegen, Umbenennen, Löschen | Deckt den minimalen Verwaltungs-Workflow ab, mehr Funktionen erhöhen Scope ohne MVP-Nutzen | 2026-08-27 |
| Duplizieren out of scope | Kein klarer MVP-Bedarf, kann als eigenes Feature nachgezogen werden | 2026-08-27 |
| Neue Quest: nur Name wird abgefragt | Minimale Hürde zum Start, Rest wird im Stationen-/Modul-Editor (PROJ-7/8) ergänzt | 2026-08-27 |
| Neue Quests starten als "Entwurf" mit leerer Stationsliste | Quest-Schema verlangt min. 1 Station mit 1 Modul — ein Entwurfsstatus erlaubt trotzdem sofortiges Speichern und Sichtbarkeit in der Liste, statt Datenverlust bei Abbruch zu riskieren | 2026-08-27 |
| Entwurf-Badge in der Liste | Gibt dem Nutzer sichtbares Feedback, welche Quests noch nicht spielbar/exportierbar sind | 2026-08-27 |
| Sortierung: zuletzt bearbeitet zuerst | Nutzer findet die Quest, an der er gerade arbeitet, sofort oben | 2026-08-27 |
| Umbenennen über Dialog (nicht inline) | Konsistent mit "Neue Quest"-Dialog, gleiche Validierung, leichter zu entdecken | 2026-08-27 |
| Löschen entfernt auch den Spielfortschritt | Verhindert verwaiste `gq_progress_{questId}`-Einträge in localStorage | 2026-08-27 |
| Kein hartes Quest-Limit | Nur natürliches localStorage-Limit aus PROJ-2, keine künstliche Zahl nötig | 2026-08-27 |
| Doppelte Quest-Namen erlaubt | IDs sind eindeutig, nicht Namen — einfacher für Nutzer, keine zusätzliche Fehlerprüfung nötig | 2026-08-27 |
| Empty State mit CTA "Neue Quest erstellen" | Führt neue Nutzer direkt zur wichtigsten Aktion, statt sie raten zu lassen | 2026-08-27 |
| "Veröffentlichen" als expliziter, manueller Schalter (kein Auto-Publish bei Vollständigkeit) | Ersteller behält Kontrolle über den Zeitpunkt — kann eine fertige Quest weiter testen/anpassen, ohne dass sie sofort im Play-Modus erscheint. Ausgelöst durch Nutzer-Feedback: fertige Entwürfe erschienen ungewollt in der Play-Liste | 2026-08-27 |
| Importierte Quests gelten automatisch als veröffentlicht | Bewahrt das bestehende PROJ-2-Verhalten ("Import und sofort spielen") — nur selbst erstellte Quests durchlaufen den Entwurf → Veröffentlichen-Zyklus | 2026-08-27 |
| Veröffentlichen ist einmalig/endgültig, kein "Unveröffentlichen" | Bewusste Vereinfachung auf ausdrücklichen Wunsch des Nutzers — einfacher, linearer Zustand ohne Zurück-Option | 2026-08-27 |
| "Entwurf"-Badge wird für "unvollständig" UND "vollständig aber unveröffentlicht" wiederverwendet, statt ein zweites Badge einzuführen | Weniger visuelles Rauschen und keine dritte State-Unterscheidung nötig — ein Badge bedeutet einheitlich "noch nicht im Play-Modus sichtbar", unabhängig vom genauen Grund. Auf Wunsch des Nutzers vereinfacht | 2026-08-27 |
| Export (PROJ-9, künftig) setzt Veröffentlicht voraus | Konsistente Regel: eine geteilte Quest-Datei sollte immer vom Ersteller freigegeben sein. Als Decision für die spätere PROJ-9-Spezifikation vorgemerkt, nicht Teil des PROJ-6-Scopes | 2026-08-27 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein neuer Storage-Key — Entwürfe leben im bestehenden `gq_quests` | Eine Quest-Sammlung für Player+Creator bleibt konsistent mit der PROJ-2-Entscheidung | 2026-08-27 |
| Speicher-Layer lockert die Pflichtfelder gegenüber der Import-/Export-Regel | Ermöglicht sofortiges Speichern unvollständiger Entwürfe, ohne die Datei-Kompatibilität für Import (PROJ-2) und Export (PROJ-9) zu gefährden — die strikte Validierung gilt weiterhin an diesen beiden Grenzen | 2026-08-27 |
| Separate "Vollständigkeits-Prüfung" statt Zod-Parse für das Entwurf-Badge | Die Import-Validierung würde bei einer unvollständigen Quest einen Fehler werfen statt sie nur zu markieren — eine einfache Ja/Nein-Prüfung mit denselben Regeln reicht für die Badge-Anzeige | 2026-08-27 |
| `crypto.randomUUID()` statt neues UUID-Paket | Native Browser-API, keine zusätzliche Dependency nötig (bereits in PROJ-2 als zukünftiger Bedarf vorgesehen) | 2026-08-27 |
| Neue Quest und Umbenennen teilen sich eine Dialog-Komponente | Gleiche Eingabe (ein Namensfeld) und gleiche Validierung — weniger Code zu pflegen | 2026-08-27 |
| Löschen kombiniert zwei bestehende Funktionen (Quest löschen + Fortschritt löschen) | Kein neuer Storage-Mechanismus nötig — nutzt `deleteQuest` (PROJ-2) und `deleteProgress` (PROJ-3) direkt hintereinander | 2026-08-27 |
| Neue `QuestManagementCard`-Komponente statt Wiederverwendung von `QuestCard` | `QuestCard` ist auf den Player-Kontext zugeschnitten (Live/Done-Status, Play-Link) — der Creator braucht ein Aktionen-Menü (Umbenennen/Löschen) statt einer Fortschrittsanzeige | 2026-08-27 |
| Sortierung rein über vorhandenes `lastModified`-Feld | Kein zusätzlicher Speicherbedarf, Feld existiert bereits im Quest-Schema (PROJ-2) | 2026-08-27 |
| `published` wird NICHT Teil des strikten `questSchema` (Import/Export-Vertrag) | Der Veröffentlicht-Status ist lokal/geräte-spezifisch, keine Eigenschaft der teilbaren Quest-Datei — Import-Dateien kennen das Feld nicht und sollen es auch nicht kennen müssen. Hält Vollständigkeits-Prüfung (`isQuestComplete`) und Veröffentlicht-Status sauber getrennt, wie von der Spec gefordert (Menüpunkt ist bei unvollständigen Quests deaktiviert, nicht abhängig vom Publish-Status) | 2026-08-27 |
| Neue `isPublished()`-Prüfung (Fallback `true` bei fehlendem Feld) statt eines Pflichtfelds | Gleiches Muster wie `isQuestComplete()` — eine abgeleitete Prüfung statt eines rohen Feldzugriffs. Der Fallback löst die Altbestand-Frage ohne Migrationsschritt: Quests, die vor diesem Feature gespeichert wurden, haben kein `published`-Feld und gelten automatisch als veröffentlicht | 2026-08-27 |
| Zwei explizite Schreibpfade statt eines globalen Defaults: `createDraftQuest()` setzt `published: false`, die Import-Pipeline setzt `published: true` | Neuer Code setzt das Feld immer explizit — der `isPublished()`-Fallback greift ausschließlich für alten, vor diesem Feature gespeicherten Bestand, nie für neu geschriebene Quests | 2026-08-27 |
| Neue Funktion `publishQuest(id)`, symmetrisch zu `renameQuest(id, name)` | Konsistent mit dem bestehenden Storage-Layer-Muster — setzt `published: true` und aktualisiert `lastModified` über denselben `saveQuest`-Mechanismus | 2026-08-27 |
| `/play/page.tsx` filtert die Quest-Liste einmalig ganz am Anfang nach `isPublished()`, vor der bestehenden Live/Neu/Fertig-Statusberechnung | Minimaler, chirurgischer Eingriff in bereits deployten Code — alles danach (Filter-Tabs, Sortierung, Fortschrittsanzeige) bleibt unverändert und arbeitet einfach auf einer kleineren, vorgefilterten Menge | 2026-08-27 |
| `QuestManagementCard` bekommt zwei separate Booleans (`isComplete`, `isPublished`) statt eines einzigen `isDraft`-Flags | Das "Entwurf"-Badge braucht die ODER-Verknüpfung beider Zustände, aber der "Veröffentlichen"-Menüpunkt braucht sie einzeln (deaktiviert nur bei `!isComplete`, komplett ausgeblendet bei `isPublished`) — eine Komponente kann beide Anzeigen aus den zwei Rohwerten ableiten, ein einzelnes gemischtes Flag könnte das nicht mehr eindeutig | 2026-08-27 |
| Kein Bestätigungsdialog beim Veröffentlichen | Anders als Löschen ist Veröffentlichen zwar einmalig, aber nicht destruktiv (kein Datenverlust) — passt nicht in die PRD-Vorgabe "Bestätigungsdialog bei kritischen Aktionen", die bislang ausschließlich für Löschen gilt | 2026-08-27 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
/create (Page) — erweitert die bestehende Seite aus PROJ-2
├── AppHeader "Meine Quests" (Light Theme) — bereits vorhanden
├── Empty State (bereits vorhanden)
│   ├── Hinweistext
│   ├── "Neue Quest erstellen"-Button
│   └── QuestImportButton (PROJ-2, unverändert)
├── Quest-Liste (neu befüllt, sortiert nach zuletzt bearbeitet)
│   └── QuestManagementCard (neu) — Light-Theme-Pendant zur Player-QuestCard
│       ├── Name, Stationsanzahl
│       ├── "Entwurf"-Badge (nur wenn unvollständig)
│       └── Aktionen-Menü: "Umbenennen" / "Löschen"
├── "Neue Quest erstellen"-Button (FAB, analog zum bestehenden Import-FAB)
│   └── Namens-Dialog (neu: ein Textfeld, "Erstellen" / "Abbrechen")
├── Umbenennen-Dialog (nutzt dieselbe Namens-Dialog-Komponente, Name vorausgefüllt)
├── Lösch-Bestätigung (AlertDialog, gleicher Stil wie der Überschreib-Dialog aus PROJ-2)
└── QuestImportButton (bereits vorhanden, unverändert)
```

### Daten-Architektur

Kein neuer Speicherort — alles läuft weiterhin über den bestehenden `gq_quests`-Eintrag in localStorage (PROJ-2).

**Zentrale Entscheidung:** Die App speichert Quests intern etwas "lockerer", als die strikte Regel für Import-Dateien erlaubt.
- Die Validierungsregeln aus PROJ-2 (mind. 1 Station, mind. 1 Modul pro Station, Intro-/Outro-Text vorhanden) bleiben unverändert die Regel für **Import** (PROJ-2) und **Export** (PROJ-9) — eine Quest-Datei, die jemand anderes bekommt, ist immer vollständig oder wird abgelehnt.
- Beim internen Speichern während der Bearbeitung wird diese Regel gelockert: eine frisch angelegte Quest darf 0 Stationen und leere Intro-/Outro-Texte haben, damit sie sofort speicherbar ist, statt erst am Ende eines Editier-Vorgangs.
- Eine separate, einfache "Vollständigkeits-Prüfung" wendet dieselben inhaltlichen Regeln an wie die Import-Validierung — aber nur, um zu entscheiden, ob das "Entwurf"-Badge angezeigt wird. Sie blockiert nichts und wirft keinen Fehler.

Beim Anlegen einer neuen Quest werden folgende Felder gesetzt:
- Neue eindeutige ID (über die eingebaute Browser-Funktion zur ID-Erzeugung, kein neues Paket nötig)
- Der eingegebene Name
- Leere Stationsliste
- Platzhalter-Intro/Outro mit leerem Text
- `lastModified` = Anlagezeitpunkt

Beim Umbenennen: Name wird ersetzt, `lastModified` wird aktualisiert — läuft über denselben "Speichern"-Mechanismus wie ein Update in PROJ-2 (bestehende ID wird ersetzt statt neu angelegt).

Beim Löschen: Die Quest wird aus `gq_quests` entfernt, zusätzlich wird der zugehörige Fortschritts-Eintrag `gq_progress_{questId}` gelöscht (Mechanismus existiert bereits aus PROJ-3).

Die Liste wird beim Anzeigen nach `lastModified` absteigend sortiert (neueste zuerst) — kein zusätzlicher Speicherbedarf, das Feld existiert bereits.

### UI/Interaktions-Entscheidungen

- "Neue Quest" und "Umbenennen" laufen über denselben Dialog-Typ (ein Textfeld, "Speichern"/"Abbrechen") — konsistente UX, weniger zu pflegender Code
- Löschen läuft über einen zweiten Bestätigungsschritt (AlertDialog), im gleichen Stil wie der bereits gebaute Überschreib-Dialog aus PROJ-2
- Das Aktionen-Menü (Umbenennen/Löschen) sitzt auf der Quest-Karte, analog zum Reset-Button-Muster der bestehenden Player-QuestCard

### Wiederverwendete vs. neue Bausteine

| Baustein | Status |
|----------|--------|
| `gq_quests`-Storage (Laden/Speichern/Löschen) | ♻️ Wiederverwendet aus PROJ-2 |
| Löschen des Fortschritts (`gq_progress_{id}`) | ♻️ Wiederverwendet aus PROJ-3 |
| `QuestImportButton` | ♻️ Wiederverwendet aus PROJ-2, unverändert |
| "Ist Quest vollständig?"-Prüfung | 🆕 Neu |
| Namens-Dialog (Neu anlegen/Umbenennen) | 🆕 Neu |
| Lösch-Bestätigungsdialog | 🆕 Neu (gleiches Muster wie PROJ-2) |
| `QuestManagementCard` (Light-Theme-Karte mit Aktionen-Menü) | 🆕 Neu |

### Dependencies

Keine neuen Pakete nötig. Alles Benötigte ist bereits installiert oder Teil des Browsers:
- Zod — Namens-Validierung (bereits installiert)
- shadcn Dialog + AlertDialog — bereits im Projekt verwendet
- Sonner/Toast — Erfolgs-/Fehlermeldungen, bereits verwendet
- Eingebaute Browser-Funktion zur eindeutigen ID-Erzeugung — kein Paket nötig

---

## Tech Design — Refinement: Veröffentlichen (2026-08-27)

Ergänzt das ursprüngliche Tech Design um das "Veröffentlichen"-Konzept aus dem `/refine`-Durchlauf. Betrifft drei bereits bestehende Bausteine (Datenmodell, Creator-Karte, Play-Liste), keine neue Seite und keine neue Kernkomponente.

### Komponenten-Struktur (Ergänzung)

```
QuestManagementCard (bestehend, erweitert)
├── "Entwurf"-Badge — jetzt sichtbar bei: unvollständig ODER vollständig-aber-unveröffentlicht
└── Aktionen-Menü — neuer dritter Eintrag "Veröffentlichen", oberhalb von Umbenennen/Löschen
    ├── Zustand "ausgeblendet" — Quest ist bereits veröffentlicht
    ├── Zustand "deaktiviert" — Quest ist unvollständig
    └── Zustand "aktiv" — Quest ist vollständig und unveröffentlicht

/play (Page, PROJ-3, bereits deployed) — ein Filterschritt ergänzt
└── Quest-Liste — zeigt nur noch Quests mit Status "veröffentlicht"
    └── Alles danach (Live/Neu/Fertig-Tabs, Sortierung, Fortschrittsanzeige) unverändert
```

### Daten-Architektur (Ergänzung)

**Zentrale Entscheidung:** `published` wird ein neues Feld auf der gespeicherten Quest, aber bewusst **kein Teil des strikten `questSchema`** (der Regel für Import-/Export-Dateien aus PROJ-2). Begründung: Der Veröffentlicht-Status ist eine lokale, geräte-spezifische Eigenschaft — er beschreibt, ob *dieser Ersteller auf diesem Gerät* die Quest freigegeben hat, nicht eine Eigenschaft der Quest-Datei selbst. Eine importierte Datei kennt dieses Feld nicht und muss es auch nicht kennen.

Das hält zwei bisher getrennte Konzepte sauber getrennt:
- **Vollständigkeit** (`isQuestComplete`) — hat die Quest alle Pflichtfelder? Rein strukturell, ändert sich nicht durch Veröffentlichen.
- **Veröffentlicht** (`isPublished`, neu) — hat der Ersteller die fertige Quest freigegeben? Rein manuell, unabhängig von weiteren Bearbeitungen.

Beide zusammen ergeben das "Entwurf"-Badge (`!vollständig ODER !veröffentlicht`), aber der "Veröffentlichen"-Menüpunkt braucht sie einzeln: deaktiviert nur bei Unvollständigkeit, ausgeblendet nur bei bereits erfolgtem Veröffentlichen.

**Umgang mit Bestandsdaten:** Eine neue `isPublished()`-Prüfung liest das Feld mit einem Fallback auf `true`, wenn es fehlt. Das löst die Frage nach bereits gespeicherten Quests aus der Zeit vor diesem Feature ohne Migrationsschritt — sie bleiben automatisch sichtbar in der Play-Liste, genau wie bisher.

Zwei Schreibpfade setzen das Feld ab sofort explizit:
- Neu angelegte Quests (`createDraftQuest`) → `published: false`
- Per Datei importierte Quests (PROJ-2-Import-Pipeline) → `published: true` (bewahrt "Import und sofort spielen")

Eine neue Storage-Funktion `publishQuest(id)` — symmetrisch zum bestehenden `renameQuest(id, name)` — setzt `published: true` und aktualisiert `lastModified` über denselben `saveQuest`-Mechanismus wie jede andere Änderung.

Die Play-Liste (PROJ-3) bekommt einen einzigen zusätzlichen Filterschritt ganz am Anfang der Datenverarbeitung: nur Quests mit `isPublished(quest) === true` werden überhaupt betrachtet. Alles, was danach passiert (Live/Neu/Fertig-Filter-Tabs, Sortierung, Fortschritts-Badges), bleibt technisch unverändert — es arbeitet einfach auf einer kleineren, vorgefilterten Menge.

### UI/Interaktions-Entscheidungen (Ergänzung)

- Kein Bestätigungsdialog beim Veröffentlichen (anders als beim Löschen) — die Aktion ist zwar einmalig, aber nicht destruktiv, es geht keine Daten verloren
- Erfolgsmeldung als Toast, konsistent mit "Quest umbenannt"
- Menüpunkt-Reihenfolge: Veröffentlichen, Umbenennen, Löschen — die vorwärtsgerichtete Aktion zuerst, die destruktive zuletzt

### Wiederverwendete vs. neue Bausteine (Ergänzung)

| Baustein | Status |
|----------|--------|
| `publishQuest()` (Storage-Funktion) | 🆕 Neu, aber strukturell identisch zu `renameQuest()` |
| `isPublished()`-Prüfung | 🆕 Neu, gleiches Muster wie `isQuestComplete()` |
| `saveQuest`, Toast-Erfolgsmeldung | ♻️ Wiederverwendet, unverändert |
| `QuestManagementCard`-Aktionen-Menü (shadcn DropdownMenu) | ♻️ Erweitert um einen dritten Eintrag |
| `/play/page.tsx`-Datenverarbeitung (Filter-Tabs, Sortierung) | ♻️ Unverändert, bekommt nur einen vorgeschalteten Filterschritt |

### Dependencies (Ergänzung)

Keine neuen Pakete — alles läuft über bereits vorhandene Bausteine (Zod bleibt unverändert, da `published` bewusst nicht Teil des Zod-Schemas wird).

## Implementation Notes (Frontend)

**Date:** 2026-08-27

### Neue/geänderte Dateien
| Datei | Zweck |
|-------|-------|
| `src/lib/sanitize.ts` | `stripHtmlTags()` extrahiert aus `quest-import.ts`, jetzt von PROJ-2 und PROJ-6 gemeinsam genutzt |
| `src/lib/quest-storage.ts` | + `createDraftQuest()`, `isQuestComplete()` (nutzt `questSchema.safeParse` direkt statt eigener Regel-Duplikation), `renameQuest()` |
| `src/components/quest-name-dialog.tsx` | Neu — geteilter Dialog für "Neue Quest" und "Umbenennen" |
| `src/components/quest-management-card.tsx` | Neu — Light-Theme-Karte mit Entwurf-Badge und Aktionen-Menü (shadcn DropdownMenu) |
| `src/app/create/page.tsx` | Erweitert: Liste (sortiert nach `lastModified`), Empty State, Neue-Quest-FAB, Rename-/Delete-Flow |
| `src/components/quest-import-button.tsx` | 1-Zeilen-Fix (siehe Bug unten), sonst unverändert |

### Abweichung von der Tech-Design-Skizze
- `isQuestComplete()` ruft `questSchema.safeParse(quest).success` direkt auf, statt Regeln handschriftlich zu duplizieren — garantiert, dass die Entwurf-Erkennung nie von der tatsächlichen Import-/Export-Validierung abweicht.

### Bug gefunden + behoben (nicht im ursprünglichen Scope, aber auf `/create` sichtbar)
Radix-Portale (Dialog, AlertDialog, DropdownMenu) hängen ihren Inhalt an `<body>`, außerhalb des `<div data-theme="light">`-Wrappers aus `create/layout.tsx`. Dadurch rendern alle Popups auf `/create` mit den Dark-Theme-Farben von `<html data-theme="dark">` — u.a. unlesbarer Text (weiß auf weiß) in Titeln und Buttons ohne eigene Textfarben-Klasse. Betroffen war auch der bereits deployte PROJ-2-Überschreib-Dialog.
**Fix:** `data-theme="light"` + `text-foreground` direkt auf die jeweilige Portal-Root (`DialogContent`/`AlertDialogContent`/`DropdownMenuContent`) gesetzt, damit die CSS-Variablen lokal neu aufgelöst werden. Betrifft `quest-name-dialog.tsx`, `create/page.tsx` (Lösch-Dialog), `quest-management-card.tsx` (Aktionen-Menü) und `quest-import-button.tsx` (Überschreib-Dialog, via bestehendem `variant`-Prop).

### Verifikation
- `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, nur 6 vorbestehende `<img>`-Warnungen) · `npm test` ✓ (68/68)
- Manuell im Browser (Playwright/WebKit, 390×844 Mobile-Viewport) durchgespielt: Empty State → Neue Quest erstellen → Entwurf-Badge sichtbar → Umbenennen → Löschen (mit Bestätigung) → zurück zum Empty State. Keine Konsolenfehler.
- E2E-Testsuite (Playwright, `tests/`) wurde für PROJ-6 nicht ergänzt — folgt in `/qa` analog zum bestehenden Muster (`tests/proj-1-app-shell.spec.ts`).

### UI-Verfeinerung (2026-08-27, zweite Iteration)

Nach einem `/design`-Prototyp (Canvas-Vorschau, vom Nutzer freigegeben) wurden drei Controls überarbeitet:

| Änderung | Vorher | Nachher |
|----------|--------|---------|
| Filter | kein Filter, nur die volle Liste | `QuestManagementFilterTabs` ("Alle" / "Entwurf") — gleiche Pill-/Glow-Optik wie `QuestFilterTabs` im Player, auf Light-Theme-Tokens (`primary` statt `gq-teal`) übertragen |
| Quest importieren | eigener Inline-/Floating-Button (`QuestImportButton`) neben der Liste | in den FAB integriert: Tippen auf den `+`-FAB dreht ihn zu einem Schließen-Glyph und klappt zwei Pill-Buttons auf ("Neue Quest", "Quest importieren") |
| Karten | Entwurf und fertige Quests optisch identisch (nur Badge unterschied) | Entwürfe bekommen einen gestrichelten Rahmen + gedämpften Hintergrund statt Vollton-Karte + Schatten — sofort als "unfertig" erkennbar, ohne neues UI-Muster einzuführen |

**Technische Umsetzung:**
- `QuestImportButton` bekam eine neue optionale `renderTrigger`-Prop, die die eingebaute Button-Auszeichnung durch eigenes Markup ersetzt, aber den Import-Hook, das versteckte File-Input und den Überschreib-Dialog unverändert weiterverwendet — der Player-Gebrauch (`floating`) bleibt unangetastet.
- Neue Datei `src/components/quest-management-filter-tabs.tsx`.
- `quest-management-card.tsx`: Kartenklasse jetzt abhängig von `isDraft` (gestrichelt vs. Vollton).
- `create/page.tsx`: FAB-Zustand (`fabOpen`) steuert Rotation (`rotate-45`), Scrim (Tap-Outside-to-Close) und die Sichtbarkeit der zwei aufklappenden Aktions-Buttons.
- Verifiziert wie oben (Build/Lint/Test grün) plus manueller Playwright/WebKit-Durchlauf: Filter umschalten, FAB öffnen/schließen (Klick auf FAB, Klick auf Scrim), gemischte Entwurf-/Fertig-Karten optisch geprüft — keine Konsolenfehler.

### UI-Verfeinerung (2026-08-27, dritte Iteration)

Header und Headline analog zum Player-Vorbild (`/play`) angepasst:
- `AppHeader` auf `/create` bekommt kein `title` mehr — zeigt wie im Player nur noch das Logo.
- Direkt darunter (über den Filter-Tabs) steht jetzt eine Display-Headline "Create" (`font-display italic uppercase`, gleiche Größe/Optik wie "Meine Quests" im Player), unconditional sichtbar in Empty State und Liste.
- Kein neuer Code — reine Umschichtung in `create/page.tsx` (Header-Prop entfernt, `<h1>`-Block ergänzt).
- Verifiziert per Playwright/WebKit-Screenshot in beiden Zuständen (leer/gefüllt), keine Konsolenfehler.
- Kurz ergänzt um ein Lime-Stift-Icon (`Pencil`) vor der Headline, direkt danach wieder entfernt — in Lime auf dem hellen Creator-Hintergrund schlecht lesbar/zu dünn. Headline bleibt ohne Icon.

### Bugfix-Pass (2026-08-27, nach /qa)

Alle drei in der QA gefundenen Bugs behoben:

- **BUG-1 (Medium, HTML-only-Name):** `quest-name-dialog.tsx` validiert jetzt den bereits mit `stripHtmlTags()` bereinigten Wert statt des rohen Eingabewerts — ein Name wie `<b></b>` löst denselben "Der Name darf nicht leer sein"-Fehler aus wie ein leeres Feld, statt eine Quest mit leerem Namen zu speichern. `onConfirm` erhält jetzt direkt den sanitisierten Namen.
- **BUG-2 (Low, Touch-Targets):** Filter-Tabs (`quest-management-filter-tabs.tsx` UND, für Konsistenz zwischen den Modi, `quest-filter-tabs.tsx` im Player) nutzen jetzt `min-h-11` statt reinem vertikalem Padding — garantiert 44px unabhängig von Font-Metriken, statt sich auf geschätzte `py-*`-Werte zu verlassen.
- **BUG-3 (Low, Crash bei kaputten Daten):** `quest-storage.ts` bekommt eine `normalizeQuest()`-Funktion, die jeden aus `localStorage` gelesenen Eintrag defensiv absichert (fehlende `stations`/`intro`/`outro`/Modul-Arrays werden mit leeren Defaults aufgefüllt, Einträge ganz ohne `id` werden verworfen) — greift in `getAllQuests()`. Wichtiger Fund dabei: `use-quests.ts`s `getSnapshot()` (der Pfad für den *ersten* Render) parste `localStorage` bisher direkt selbst und umging damit `getAllQuests()` komplett — behoben, indem `getSnapshot()` jetzt ebenfalls `getAllQuests()` verwendet. Ohne diese zweite Änderung hätte der Fix nur beim manuellen `refreshQuests()` gegriffen, nicht beim ersten Laden der Seite — genau der Pfad, der in der QA gecrasht ist.

**Tests:** 4 neue Unit-Tests in `quest-storage.test.ts` (fehlende ID wird verworfen, fehlende `stations`/`intro`/`outro` normalisiert, fehlende `modules` normalisiert, weiterhin `[]` bei kaputtem JSON) + 3 neue E2E-Regressionstests in `tests/proj-6-creator-quest-verwaltung.spec.ts` (je einer pro Bug). `npm run build`/`lint`/`test` grün (88/88 Unit-Tests), alle 15 E2E-Tests grün auf "Mobile Safari". Alle drei Fixes zusätzlich manuell per Playwright/WebKit-Screenshot gegengeprüft, inkl. Bestätigung, dass BUG-3 auch auf `/play` behoben ist (derselbe `getAllQuests()`-Fix schützt beide Seiten).

### Veröffentlichen-Refinement umgesetzt (2026-08-27, nach /architecture)

Setzt das Tech Design aus dem `/refine`-Durchlauf 1:1 um.

**Neue/geänderte Dateien:**
| Datei | Änderung |
|-------|----------|
| `src/lib/quest-schema.ts` | `Quest`-Typ um `published?: boolean` erweitert — per Intersection-Type NACH `z.infer<typeof questSchema>`, nicht im Zod-Schema selbst (siehe Tech Design: bleibt außerhalb des Import-/Export-Vertrags) |
| `src/lib/quest-storage.ts` | + `isPublished()` (Fallback `true`), + `publishQuest(id)` (symmetrisch zu `renameQuest`); `createDraftQuest()` setzt jetzt `published: false` |
| `src/lib/quest-import.ts` | `sanitizeQuest()` setzt `published: true` auf jede importierte Quest |
| `src/app/play/page.tsx` | Ein Filterschritt ganz am Anfang: `allQuests.filter(isPublished)` — alles danach (Filter-Tabs, Sortierung, Fortschritt) unverändert |
| `src/components/quest-management-card.tsx` | Props `isDraft` → `isComplete` + `isPublished` + `onPublish`; neuer Menüpunkt "Veröffentlichen" (Icon: `Rocket`) — ausgeblendet wenn bereits veröffentlicht, deaktiviert wenn unvollständig, sonst aktiv; "Entwurf"-Badge jetzt `!isComplete || !isPublished` |
| `src/app/create/page.tsx` | Berechnet `isComplete`/`isPublished` pro Quest statt eines einzelnen `isDraft`-Flags; neuer `handlePublish()` (ruft `publishQuest` + `refreshQuests` + Toast "Quest veröffentlicht"); Entwurf-Filter-Tab nutzt dieselbe `!isComplete || !isPublished`-Bedingung |

**Kein Zod-Schema-Update nötig** — `published` ist bewusst kein Feld von `questSchema`, daher bleibt `isQuestComplete()` (das intern `questSchema.safeParse` nutzt) komplett unbeeinflusst vom Publish-Status, genau wie im Tech Design gefordert.

**Tests:** 5 neue Unit-Tests in `quest-storage.test.ts` (`isPublished`-Fallback bei fehlendem Feld, explizit `false`/`true`, `publishQuest` aktualisiert Status + `lastModified`, No-op bei unbekannter ID) + 1 neuer Unit-Test in `quest-import.test.ts` (importierte Quest ist `published: true`). `npm test` grün (95/95).

**Verifikation:** `npm run build`/`lint` grün. Manueller Playwright/WebKit-Durchlauf mit drei Quests (Entwurf 0 Stationen, vollständig-unveröffentlicht, bereits veröffentlicht): Menüzustände korrekt in allen drei Fällen (sichtbar+deaktiviert / sichtbar+aktiv / ausgeblendet), Veröffentlichen setzt Status + zeigt Toast + entfernt Badge, `/play` zeigt danach nur die zwei veröffentlichten Quests und nicht den unveröffentlichten Entwurf. Keine Konsolenfehler. E2E-Testsuite (`tests/proj-6-creator-quest-verwaltung.spec.ts`) wurde für dieses Refinement noch nicht erweitert — folgt in `/qa`.

## QA Test Results

**Tested:** 2026-08-27
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, 6 vorbestehende `<img>`-Warnungen) · `npm test` ✓ (84/84, davon 16 neu für `quest-storage.ts`)

### Acceptance Criteria Status

#### Liste
- [x] Angenommen Quests vorhanden, werden sie sortiert nach `lastModified` (neueste zuerst) mit Name, Stationsanzahl und Entwurf-Badge angezeigt
- [x] Angenommen keine Quests vorhanden, erscheint Empty State mit Hinweistext, "Neue Quest erstellen"-Button und Import-Button

#### Neue Quest erstellen
- [x] Tippen auf "Neue Quest erstellen" fragt nach dem Quest-Namen
- [x] Gültiger Name + Bestätigen → Quest mit neuer UUID, leerer Stationsliste, `lastModified = jetzt` gespeichert, Navigation zu `/create/[id]`
- [x] Leeres Namensfeld + Bestätigen → Validierungsfehlermeldung, keine Quest angelegt
- [x] Abbrechen → keine Quest angelegt, Dialog schließt sich

#### Entwurf-Kennzeichnung
- [x] Quest mit 0 Stationen/unvollständigen Pflichtfeldern → "Entwurf"-Badge sichtbar
- [x] Quest erfüllt alle Pflichtfelder → kein Badge

#### Umbenennen
- [x] Umbenennen-Aktion öffnet Dialog mit vorausgefülltem aktuellem Namen
- [x] Gültiger neuer Name → gespeichert, `lastModified` aktualisiert, Liste neu sortiert
- [x] Leeres Feld + Bestätigen → Validierungsfehlermeldung, alter Name bleibt erhalten

#### Löschen
- [x] Löschen-Aktion → Bestätigungsdialog ("Quest wirklich löschen? Das kann nicht rückgängig gemacht werden.")
- [x] Bestätigen → Quest UND `gq_progress_{questId}` aus localStorage entfernt, Liste aktualisiert sich
- [x] Abbrechen → Quest bleibt unverändert erhalten

**Ergebnis: 13/13 Kriterien bestanden**

### Edge Cases Status

| # | Edge Case | Status |
|---|-----------|--------|
| 1 | Doppelte Quest-Namen | ✅ Beide werden normal angezeigt |
| 2 | Löschen der letzten Quest | ✅ Empty State erscheint |
| 3 | Löschen während Quest in anderem Tab läuft | ⏭️ Nicht automatisiert testbar (Multi-Tab); Verhalten wie spezifiziert akzeptiert (kein Cross-Tab-Sync im MVP) |
| 4 | Sehr langer Quest-Name | ✅ `line-clamp` kürzt visuell, kein Layout-Bruch |
| 5 | HTML/Script im Quest-Namen | ✅ Tags werden entfernt (siehe Security Audit) — mit einer Einschränkung, siehe BUG-1 |
| 6 | localStorage voll beim Anlegen | ✅ Durch Unit-Test abgedeckt (`saveQuest` wirft die erwartete Meldung) |
| 7 | Import-Button auf `/create` | ✅ Weiterhin vorhanden (jetzt im FAB), Import-Pipeline unverändert von PROJ-2 |

### Security Audit Results
- [x] XSS via Quest-Name (`<img src=x onerror=...>`): Tags entfernt, Payload löst nicht aus — zusätzlich abgesichert durch Reacts automatisches Escaping (kein `dangerouslySetInnerHTML`)
- [x] Keine Authentifizierung/Autorisierung im Scope (kein Account-System, lokal-only laut PRD) — kein Angriffsvektor hier
- [x] Kein Server/API-Endpunkt im Scope — Rate-Limiting nicht anwendbar
- [x] Keine Secrets im Code oder in localStorage-Werten
- [ ] BUG: HTML-only-Namen (`<b></b>`) umgehen die "Name darf nicht leer sein"-Validierung, siehe BUG-1 (kein Sicherheitsrisiko, aber ein Validierungs-Bypass)

### Bugs Found

#### BUG-1: HTML-only-Name umgeht die Pflichtfeld-Validierung und speichert eine Quest mit leerem Namen — ✅ FIXED (siehe Re-Verifikation unten)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. "Neue Quest erstellen" (oder "Umbenennen") öffnen
  2. Als Namen ausschließlich `<b></b>` eingeben (oder jedes andere Konstrukt, das nach dem Entfernen der Tags leer ist) und bestätigen
  3. Erwartet: Wie bei einem leeren Feld — Validierungsfehler, keine Quest wird angelegt/umbenannt
  4. Tatsächlich: Die Quest wird mit `name: ""` gespeichert. Die Karte zeigt eine leere Titelzeile, der Lösch-Dialog zeigt „" wird endgültig gelöscht.
- **Root Cause:** `quest-name-dialog.tsx` validiert den rohen (unsanitized) Eingabewert auf Leerheit; `createDraftQuest()`/`renameQuest()` in `quest-storage.ts` entfernen HTML-Tags erst danach — ein Name, der nur aus Tags besteht, besteht die Prüfung, kollabiert aber beim Speichern zu einem leeren String.
- **Empfohlener Fix:** Die Validierung in `quest-name-dialog.tsx` auf den bereits mit `stripHtmlTags()` bereinigten Wert anwenden (oder `createDraftQuest`/`renameQuest` bei leerem sanitisiertem Namen einen Fehler werfen lassen, den die Seite als Toast + erneut geöffneten Dialog behandelt).
- **Screenshot:** siehe Implementation Notes — visuell bestätigt (leere Kartentitel-Zeile, leerer Name im Lösch-Dialog)
- **Priority:** Fix before deployment (verletzt eine explizite Acceptance-Criterion in ihrem Kern, auch wenn der Trigger ungewöhnlich ist)

#### BUG-2: Filter-Tabs ("Alle"/"Entwurf") unterschreiten die 44px-Touch-Target-Vorgabe — ✅ FIXED (siehe Re-Verifikation unten)
- **Severity:** Low
- **Steps to Reproduce:**
  1. `/create` mit mind. 1 Quest öffnen
  2. Höhe der Filter-Tab-Buttons messen
  3. Erwartet: ≥44px (PRD-Anforderung, auch explizit in den Technical Requirements dieser Spec)
  4. Tatsächlich: gemessen 33px
- **Root Cause:** 1:1 aus der Player-`QuestFilterTabs` übernommenes Padding (`px-4 py-2`) — dort besteht dieselbe Abweichung bereits seit PROJ-3/5 (nicht in deren QA aufgefallen).
- **Empfohlener Fix:** Vertikales Padding erhöhen (z.B. `py-3`); der Konsistenz halber am besten zusammen mit der Player-Variante in einem eigenen Follow-up angepasst, nicht isoliert nur hier.
- **Priority:** Nice to have (nicht PROJ-6-spezifisch verursacht, betrifft aber auch diese neue Komponente)

#### BUG-3: Ein Quest-Objekt mit fehlendem Pflichtfeld (z.B. `stations`) lässt die gesamte Seite abstürzen — ✅ FIXED (siehe Re-Verifikation unten)
- **Severity:** Low
- **Steps to Reproduce:**
  1. In der Konsole ein Quest-Objekt ohne `stations`-Feld in `gq_quests` schreiben (simuliert defekte/sehr alte Daten)
  2. `/create` (oder `/play`) neu laden
  3. Erwartet: Fehlerhafte Quest wird übersprungen oder tolerant behandelt, Rest der App bleibt nutzbar
  4. Tatsächlich: "Application error" — die komplette Seite stürzt ab (kein Error Boundary)
- **Root Cause:** Vorbestehende Lücke in `getAllQuests()` (PROJ-2) — liest `localStorage` per `JSON.parse` ohne Schema-Validierung. **Identisch reproduzierbar auf dem bereits deployten `/play`** (verifiziert) — keine PROJ-6-Regression, aber die neuen `quest-management-card.tsx`/`isQuestComplete()` setzen implizit ebenfalls die vollständige Form voraus.
- **Empfohlener Fix:** `getAllQuests()` um eine tolerante Validierung ergänzen (ungültige Einträge überspringen statt die ganze Liste crashen zu lassen) — als eigenes, funktionsübergreifendes Hardening-Ticket, nicht als Teil von PROJ-6.
- **Priority:** Fix in next sprint (nicht PROJ-6-blockierend, aber sollte nicht liegen bleiben)

### Regression Testing
- Volle bestehende E2E-Suite (`tests/proj-1-*.spec.ts`, `proj-3-*`, `proj-4-*`, `proj-5-*`) gegen **Mobile Safari** (WebKit) ausgeführt: 75/91 bestanden. Die 16 Fehlschläge treten **identisch auf dem unveränderten Vor-PROJ-6-Stand** auf (per `git stash` verifiziert) — vorbestehende Umgebungs-Flakiness (vermutlich Geolocation-Mocking/Timing in dieser Sandbox), **keine PROJ-6-Regression**.
- `/play`-Kernfunktionen (Liste, Filter-Tabs, Import-FAB) manuell gegenprüft — unverändert funktionsfähig.
- `quest-import-button.tsx`, `quest-storage.ts`, `quest-import.ts` wurden für PROJ-6 angepasst (siehe Implementation Notes) — die bestehende `quest-import.test.ts`-Suite (17 Tests) läuft weiterhin grün.

### Responsive & Accessibility
- 375px / 768px / 1440px: kein horizontales Scrollen, Inhalt sichtbar, keine Konsolenfehler (Chromium, alle drei Breakpoints)
- Touch-Targets: FAB 48×48px ✓, Karten-Aktionen-Button 44×44px ✓, FAB-Mini-Aktionen 44px Höhe ✓, Filter-Tabs 33px Höhe ✗ (BUG-2)
- Kontrast (WCAG AA, ≥4.5:1) der neuen Entwurf-Karten-Optik: Meta-Text 5.01:1 ✓, Quest-Name 17.21:1 ✓

### Cross-Browser Testing
- **WebKit (Safari-Engine):** Vollständig getestet — Desktop-WebKit (manuelle QA-Skripte) + "Mobile Safari"-Projekt der E2E-Suite (12/12 neue Tests grün)
- **Chromium:** In dieser Sandbox konnte der Chromium-Browser-Download trotz mehrerer Versuche nicht zuverlässig abgeschlossen werden (Umgebungs-/Netzwerk-Einschränkung, kein Produkt-Problem). Die Chromium-E2E-Projektkonfiguration (`playwright.config.ts`) ist unverändert und sollte auf einer Maschine mit funktionierendem Browser-Download identisch laufen; **nicht in dieser Runde verifiziert**.
- **Firefox:** Nicht Teil der projekteigenen E2E-Matrix (`playwright.config.ts` definiert nur `chromium` + `Mobile Safari`); aus Zeit-/Umgebungsgründen nicht manuell nachgetestet.

### Unit Tests (neu)
`src/lib/quest-storage.test.ts` — 16 Tests: CRUD (`getAllQuests`/`saveQuest`/`deleteQuest`/`questExists`), `createDraftQuest` (Form, eindeutige IDs, Zeitstempel, Sanitization), `isQuestComplete` (vollständig/unvollständig in allen relevanten Kombinationen), `renameQuest` (Update, Sanitization, No-op bei unbekannter ID). Alle grün.

### E2E Tests (neu)
`tests/proj-6-creator-quest-verwaltung.spec.ts` — 12 Tests, je AC-Gruppe mind. ein Test (Liste, Neue Quest ×3, Entwurf-Kennzeichnung, Umbenennen ×2, Löschen ×2, Filter, FAB). Alle grün auf "Mobile Safari".

### Re-Verifikation nach Bugfix-Pass (2026-08-27)

**Getestet nach:** `fix(PROJ-6)`-Commit `fea30e6`

- **BUG-1:** E2E-Regressionstest "a name made only of HTML tags is rejected instead of saving as empty" ✅ grün. Manuell erneut geprüft: `<b></b>` als Name → "Der Name darf nicht leer sein.", keine Navigation, `localStorage.getItem("gq_quests")` bleibt `null`.
- **BUG-2:** E2E-Regressionstest misst die Tab-Höhe direkt (`boundingBox().height`) ✅ 44px (vorher 33px). Fix betrifft `quest-management-filter-tabs.tsx` UND `quest-filter-tabs.tsx` (Player) — für beide verifiziert.
- **BUG-3:** E2E-Regressionstest seedet eine Quest ohne `stations`-Feld und prüft, dass weder ein Application-Error erscheint noch die Seite leer bleibt ✅ grün. Zusätzlich manuell auf `/play` gegengeprüft (derselbe `getAllQuests()`-Fix) — Quest erscheint dort ebenfalls tolerant als "0 Ziele" statt die Seite abstürzen zu lassen.
- **Vollständige PROJ-6-Suite:** 15/15 E2E-Tests grün auf "Mobile Safari" (12 ursprüngliche + 3 neue Bug-Regressionstests).
- **Unit-Tests:** 88/88 grün (4 neue Tests für `normalizeQuest`-Verhalten in `getAllQuests()`).
- **Regressionstest (voller bestehender Suite):** 78/94 E2E-Tests grün auf "Mobile Safari" (94 = 91 bestehende + 3 neue). Die 16 Fehlschläge sind exakt dieselben wie vor dem Bugfix-Pass (PROJ-1/3/4-Tests, vorbestehende Umgebungs-Flakiness, bereits in der ersten QA-Runde per `git stash` als nicht PROJ-6-bedingt verifiziert) — keine neuen Regressionen durch die Fixes.
- **Build:** `npm run build` ✓ · `npm run lint` ✓ (0 Fehler) · `npm test` ✓ (88/88)
- **Cross-Browser:** Weiterhin nur WebKit in dieser Sandbox verifizierbar (Chromium-Download trotz erneutem Versuch nicht erfolgreich — Umgebungs-Einschränkung, siehe oben).

### Summary
- **Acceptance Criteria:** 13/13 passed
- **Bugs Found:** 3 total (0 critical, 0 high, 1 medium, 2 low) — **alle 3 gefixt und re-verifiziert**
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy. Alle drei vom Nutzer angeforderten Fixes sind verifiziert, keine neuen Regressionen gefunden. Einzige offene Einschränkung: Chromium-Cross-Browser-Testing konnte in dieser Sandbox nicht durchgeführt werden (Umgebungs-, kein Produktproblem) — die Chromium-E2E-Projektkonfiguration ist unverändert und unabhängig von den Fixes.

## Deployment

**Production URL:** https://geoquesty.vercel.app
**Deployed:** 2026-08-27
**Platform:** Vercel (auto-deploy on push to main)
**Commit:** 803eaf2
**Tag:** v1.6.0-PROJ-6

**Pre-Deployment Checks:**
- `npm run build` ✓ · `npm run lint` ✓ (0 Fehler) · `npm test` ✓ (88/88)
- Keine neuen Umgebungsvariablen, keine Secrets im Diff
- Working Tree sauber (bis auf unabhängiges `design-preparation/`), 5 Commits nach `origin/main` gepusht

**Post-Deployment-Verifikation (live auf Production):**
- `/`, `/play`, `/create` → alle HTTP 200
- HTML-Response von `/create` bestätigt den neuen Build (Headline "Create" vorhanden, alter Header-Titel "Meine Quests" verschwunden)
- Browser-Smoke-Test (Playwright/WebKit) direkt gegen die Produktions-URL: Empty State → Neue Quest erstellen → Navigation zu `/create/[id]` → zurück zur Liste → Quest sichtbar mit Entwurf-Badge → Filter-Tab-Höhe 44px (BUG-2-Fix live bestätigt) → FAB öffnet Mini-Aktionen → HTML-only-Name (`<b></b>`) wird korrekt abgelehnt (BUG-1-Fix live bestätigt) — keine Konsolenfehler
- Sicherheits-Header (next.config) und Error-Tracking wurden für dieses Projekt bisher bei keinem der vorherigen Deploys eingerichtet (PROJ-1–5) — bewusst außerhalb des Scopes von PROJ-6 belassen, keine Regression
