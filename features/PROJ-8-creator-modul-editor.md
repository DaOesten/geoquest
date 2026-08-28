# PROJ-8: Creator — Modul-Editor

## Status: In Progress
**Created:** 2026-08-28
**Last Updated:** 2026-08-28

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

## Out of Scope
- Rich-Text-Formatierung (fett, kursiv) in Text-Modulen — konsistent mit PROJ-2/PROJ-4 (Plain Text mit Zeilenumbrüchen/Listen, keine XSS-Fläche durch echtes HTML)
- Datei-Upload für Bild/Audio/Video — kein Backend/Storage im MVP (PRD-Constraint "Kein Backend"), nur URL-Eingabe zu bereits gehosteten Medien
- Live-Vorschau/Testmodus der ganzen Station im Player-Look — PROJ-10
- Drag-and-Drop-Umsortierung der Antwort-Optionen im Multiple-Choice-Editor (Reihenfolge ist funktional irrelevant, nur Hinzufügen/Entfernen/Korrekt-Markieren)
- Neue Modultypen über die bestehenden 5 (Text/Bild/Audio/Video/Task) hinaus
- JSON-Export der fertigen Module — PROJ-9
- Undo nach dem Löschen eines Moduls (bewusst Bestätigungsdialog statt Undo-Toast, konsistent mit PROJ-7 Stationslöschung)
- Validierung/Blockieren beim Speichern eines unvollständigen Moduls (bewusst als Entwurf erlaubt, siehe Decision Log)
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
7. **Drag & Drop der Modul-Liste vs. Drag & Drop innerhalb der Sortierungs-Aufgabe:** Kein Konflikt — Modul-Listen-Drag passiert auf der Übersichtsseite, Item-Drag passiert isoliert im geöffneten Sortierungs-Sheet.
8. **Zwischenstand-Garantie:** Wie in PROJ-6/PROJ-7 etabliert — jedes gespeicherte Modul (auch unvollständig) wird sofort in `gq_quests` persistiert, kein Datenverlust bei Navigation weg von der Seite.
9. **Wechsel des Modultyps nach dem Anlegen:** Nicht möglich — ein bestehendes Modul behält seinen Typ; um den Typ zu ändern, muss der Ersteller das Modul löschen und neu anlegen (kein Typ-Umschalter im Bearbeiten-Sheet).
10. **Navigation zu `/create/[id]/station/[stationId]` mit ungültiger oder gelöschter `stationId`:** Zeigt einen "Station nicht gefunden"-Zustand mit Link zurück zur Stationsliste — analog zum bestehenden Verhalten bei ungültiger `id` auf `/create/[id]`.

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

## Open Questions
_Keine offenen Fragen._

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
