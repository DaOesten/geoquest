# PROJ-6: Creator — Quest-Verwaltung

## Status: Architected
**Created:** 2026-08-27
**Last Updated:** 2026-08-27

## Dependencies
- Requires: PROJ-1 (App Shell & Mode Switch) — für Routing (`/create`) und UI-Rahmen
- Requires: PROJ-2 (Quest Data Model & JSON Import) — für Quest-Schema, den `gq_quests`-Storage-Layer und den bestehenden Import-Button

## Summary
Die zentrale Verwaltungsansicht im Creator-Modus (`/create`): Nutzer sehen alle ihre Quests (selbst erstellte + importierte), können neue Quests anlegen, bestehende umbenennen oder löschen. Bildet die Eingangstür zum gesamten Creator-Flow — jede hier angelegte Quest landet anschließend im Stationen-Editor (PROJ-7).

## User Stories
1. Als Ersteller möchte ich alle meine Quests auf einen Blick sehen, damit ich weiß, woran ich gerade arbeite.
2. Als Ersteller möchte ich eine neue, leere Quest mit einem Namen anlegen können, damit ich sofort mit dem Bau einer neuen Schnitzeljagd beginnen kann.
3. Als Ersteller möchte ich eine Quest umbenennen können, damit ich Tippfehler korrigieren oder den Arbeitstitel anpassen kann.
4. Als Ersteller möchte ich eine Quest löschen können, damit ich nicht mehr benötigte Entwürfe oder Testquests entfernen kann.
5. Als Ersteller möchte ich vor dem Löschen gefragt werden, ob ich sicher bin, damit ich nicht versehentlich Arbeit verliere.
6. Als Ersteller möchte ich erkennen, welche Quests noch unvollständige Entwürfe sind, damit ich weiß, welche noch nicht spielbar/exportierbar sind.

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
- [ ] Angenommen eine Quest hat 0 Stationen oder unvollständige Pflichtfelder (z.B. leerer Intro-Text), wenn sie in der Liste angezeigt wird, dann erscheint ein "Entwurf"-Badge
- [ ] Angenommen eine Quest erfüllt alle Pflichtfelder des Quest-Schemas (min. 1 Station mit min. 1 Modul, Intro-/Outro-Text vorhanden), wenn sie in der Liste angezeigt wird, dann erscheint kein "Entwurf"-Badge

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

## Technical Requirements
- Speicher: Nutzt den bestehenden `gq_quests`-Storage-Layer aus PROJ-2 (kein neuer Key)
- Neue Quest erfüllt NICHT zwingend das volle `questSchema` aus PROJ-2 (leere Stationsliste erlaubt) — das Speicherformat muss den Entwurfsstatus zulassen (Detail für /architecture)
- Sanitization: Quest-Name wird wie andere Textfelder in PROJ-2 von HTML-Tags bereinigt
- Touch-Targets: min. 44px (PRD-Anforderung)
- Bestätigungsdialog bei kritischen Aktionen (Löschen) — PRD-Vorgabe

## Open Questions
- [x] Ab welcher Kombination von Feldern gilt eine Quest exakt als "vollständig" vs. "Entwurf"? → Gelöst in `/architecture`: Eine separate Vollständigkeits-Prüfung wendet dieselben Regeln wie das Import-Schema aus PROJ-2 an (mind. 1 Station mit mind. 1 Modul, Intro-/Outro-Text vorhanden), ohne beim Speichern zu blockieren. Siehe Tech Design.
- [ ] Soll es eine maximale Zeichenlänge für den Quest-Namen geben (UI-Konsistenz), oder reicht das bestehende 5-MB-Gesamtlimit aus PROJ-2?

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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
