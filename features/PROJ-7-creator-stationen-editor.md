# PROJ-7: Creator — Stationen-Editor

## Status: In Progress
**Created:** 2026-08-28
**Last Updated:** 2026-08-28

## Dependencies
- Requires: PROJ-1 (App Shell & Mode Switch) — für Routing und UI-Rahmen
- Requires: PROJ-2 (Quest Data Model & JSON Import) — für Station-Schema (`id`, `name`, `lat`, `lng`, `radiusMeters`, `modules`)
- Requires: PROJ-6 (Creator — Quest-Verwaltung) — Einstiegspunkt ist die dort gebaute Navigation zu `/create/[id]` beim Anlegen einer neuen Quest
- Beeinflusst: PROJ-6 — die "Entwurf"/"spielbar"-Logik (`isQuestComplete`, `isPlayable`) reagiert automatisch auf hier gespeicherte Stationsänderungen, kein neuer Code in PROJ-6 nötig
- Ermöglicht: PROJ-8 (Creator — Modul-Editor) — jede Station bekommt hier einen "Module bearbeiten"-Einstiegspunkt, der erst in PROJ-8 mit Inhalt gefüllt wird

## Summary
Der Stationen-Editor ist das Herzstück des Creator-Modus: Auf `/create/[id]` (aktuell nur ein Platzhalter aus PROJ-6) legt der Ersteller die Stationen seiner Quest an, platziert sie per interaktiver Karte (Leaflet/OpenStreetMap) mit GPS-Koordinaten, benennt sie, legt den Ankunftsradius fest und bringt sie per Drag & Drop in die Reihenfolge, in der sie später linear gespielt werden (PROJ-3). Sobald die erste Station mit Position existiert, wird die Quest automatisch im Play-Modus testbar (bestehendes PROJ-6-Verhalten, `isPlayable`).

## User Stories
1. Als Ersteller möchte ich eine neue Station zu meiner Quest hinzufügen können, damit ich meine Schnitzeljagd Schritt für Schritt aufbauen kann.
2. Als Ersteller möchte ich die Position einer Station durch Antippen einer Karte festlegen können, damit ich keine GPS-Koordinaten von Hand eintippen muss.
3. Als Ersteller möchte ich meine aktuelle Position als Stationskoordinate übernehmen können, damit ich Stationen direkt vor Ort anlegen kann, während ich am Zielort stehe.
4. Als Ersteller möchte ich einer Station einen Namen und einen Ankunftsradius geben können, damit Spieler wissen, wo sie sind, und die Ankunftserkennung zum Ort passt.
5. Als Ersteller möchte ich die Reihenfolge meiner Stationen per Drag & Drop ändern können, damit ich die Route anpassen kann, ohne Stationen neu anzulegen.
6. Als Ersteller möchte ich eine Station löschen können, damit ich Fehler oder nicht mehr benötigte Punkte entfernen kann.
7. Als Ersteller möchte ich beim Bearbeiten einer Station sehen, wo meine anderen Stationen liegen, damit ich einschätzen kann, ob die Route sinnvoll ist (z.B. nicht zwei Stationen zu nah beieinander).
8. Als Ersteller möchte ich meinen Zwischenstand beim Bearbeiten einer Station nicht verlieren, auch wenn ich noch keine Position gesetzt habe, damit ich in Ruhe weiterarbeiten kann.

## Out of Scope
- Modul-Editor für die 5 Modultypen (Text/Bild/Audio/Video/Task) an einer Station — PROJ-8. Jede Station bekommt hier einen "Module bearbeiten"-Button, der zu PROJ-8 führt, aber ohne Funktion, bis PROJ-8 gebaut ist
- JSON-Export — PROJ-9
- Vorschau/Testmodus im Creator — PROJ-10 (Testen läuft vorerst nur über den echten Play-Modus, wie in PROJ-6 etabliert)
- Passwortschutz zum Bearbeiten importierter Quests — PROJ-11
- Manuelle Lat/Lng-Zahlen-Eingabe als Alternative zur Karte (bewusst nicht gebaut — Karte ist der einzige Eingabeweg, siehe Decision Log)
- Adress-Suche / Ortsnamen-Suche auf der Karte (kein Geocoding-Service im MVP, nur Antippen + "aktuelle Position")
- Kartenansicht mit Route/Wegbeschreibung zwischen Stationen (kein Routing-API, nur Kontext-Pins)
- Undo nach dem Löschen einer Station (bewusst Bestätigungsdialog statt Undo-Toast, siehe Decision Log)
- Validierung/Blockieren beim Speichern einer Station ohne Position (bewusst als Entwurf erlaubt, siehe Decision Log)
- Maximale Stationsanzahl als UI-Sperre (die bestehende Schema-Grenze von 20 aus PROJ-2 gilt weiterhin, aber die UI blockiert das Hinzufügen nicht separat — wird beim Export/Import geprüft)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Stationsliste:**
- [ ] Angenommen der Nutzer öffnet `/create/[id]` einer Quest ohne Stationen, wenn die Seite lädt, dann erscheint ein Empty State mit Hinweistext und einem "Station hinzufügen"-Button
- [ ] Angenommen die Quest hat Stationen, wenn `/create/[id]` geladen wird, dann werden alle Stationen in gespeicherter Reihenfolge mit Name, Positions-Status (gesetzt/nicht gesetzt) und Radius angezeigt
- [ ] Angenommen eine Station hat noch keine Position, wenn sie in der Liste angezeigt wird, dann erscheint ein sichtbarer Hinweis "Keine Position gesetzt" statt Koordinaten

**Station hinzufügen:**
- [ ] Angenommen der Nutzer tippt auf "Station hinzufügen", wenn das Sheet öffnet, dann zeigt es ein leeres Namensfeld, eine Karte ohne gesetzten Pin und einen Radius-Regler mit Standardwert 10m
- [ ] Angenommen das Sheet ist offen und es existieren bereits andere Stationen mit Position, wenn die Karte lädt, dann zentriert sie auf die zuletzt gesetzte Station der Quest und zeigt die anderen Stationen als nicht-anklickbare graue Kontext-Pins
- [ ] Angenommen das Sheet ist offen und es existiert noch keine Station mit Position, wenn die Karte lädt, dann zentriert sie auf eine Deutschland-Standardansicht

**Position setzen:**
- [ ] Angenommen das Stations-Sheet ist offen, wenn der Nutzer auf die Karte tippt, dann wird an dieser Stelle ein Pin gesetzt bzw. ein bestehender Pin dorthin verschoben
- [ ] Angenommen ein Pin ist gesetzt, wenn der Nutzer ihn per Drag verschiebt, dann übernimmt die neue Position die Lat/Lng-Werte
- [ ] Angenommen der Nutzer tippt auf "Aktuelle Position verwenden", wenn die Browser-GPS-Permission erteilt ist und ein Signal verfügbar ist, dann wird der Pin auf die aktuelle Geräteposition gesetzt und die Karte zentriert dorthin
- [ ] Angenommen der Nutzer tippt auf "Aktuelle Position verwenden", wenn die Permission verweigert wird oder kein Signal verfügbar ist, dann erscheint eine Fehlermeldung ("Standort nicht verfügbar") und die Karte bleibt unverändert nutzbar für manuelles Antippen

**Name & Radius:**
- [ ] Angenommen das Sheet ist offen, wenn der Nutzer einen Stationsnamen eingibt, dann wird dieser beim Speichern übernommen
- [ ] Angenommen das Sheet ist offen, wenn der Nutzer den Radius-Regler bewegt, dann wird der Wert im Bereich 10–100m auf den nächsten sinnvollen Schritt begrenzt

**Speichern (Entwurfsprinzip):**
- [ ] Angenommen das Sheet ist offen und der Nutzer hat nur einen Namen eingegeben, aber keine Position gesetzt, wenn er auf "Speichern" tippt, dann wird die Station trotzdem gespeichert (mit `lat`/`lng` als `null`/nicht gesetzt) und das Sheet schließt sich
- [ ] Angenommen das Sheet ist offen und der Nutzer bricht ab, wenn er "Abbrechen" tippt oder das Sheet wegwischt, dann werden keine Änderungen übernommen
- [ ] Angenommen eine Station wird gespeichert (neu oder bearbeitet), wenn der Vorgang abgeschlossen ist, dann wird `lastModified` der Quest aktualisiert

**Reihenfolge (Drag & Drop):**
- [ ] Angenommen die Stationsliste hat mindestens 2 Stationen, wenn der Nutzer eine Station per Drag an eine andere Position zieht, dann wird die neue Reihenfolge sofort übernommen und gespeichert
- [ ] Angenommen eine Umsortierung wurde vorgenommen, wenn der Nutzer die Seite neu lädt, dann bleibt die neue Reihenfolge erhalten

**Bearbeiten:**
- [ ] Angenommen eine Station existiert, wenn der Nutzer sie in der Liste antippt, dann öffnet sich das Sheet mit allen vorhandenen Werten (Name, Position, Radius) vorausgefüllt

**Löschen:**
- [ ] Angenommen eine Station existiert, wenn der Nutzer die Löschen-Aktion auswählt, dann erscheint ein Bestätigungsdialog ("Station wirklich löschen? Das kann nicht rückgängig gemacht werden.")
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Nutzer bestätigt, dann wird die Station inklusive ihrer Module aus der Quest entfernt und die Liste aktualisiert sich
- [ ] Angenommen der Bestätigungsdialog ist sichtbar, wenn der Nutzer abbricht, dann bleibt die Station unverändert erhalten

## Edge Cases
1. **Station ohne Position wird als "Entwurf" gezählt:** Die bestehende PROJ-6-Vollständigkeitsprüfung (`isQuestComplete`) verlangt gültige GPS-Koordinaten pro Station (aus dem PROJ-2-Schema) — eine Station ohne Position hält die Quest im "Entwurf"-Status, blockiert aber laut PROJ-6 nicht die Play-Sichtbarkeit, solange irgendeine Station existiert
2. **Erste Station mit Position wird angelegt:** Die Quest wird automatisch im Play-Modus sichtbar (bestehende `isPlayable`-Logik aus PROJ-6, kein neuer Code hier nötig) — sofern die Station auch mindestens ein Modul hat; ohne Module ist die Station laut PROJ-2-Schema ohnehin nicht vollständig, was den Entwurf-Status weiter offen hält (PROJ-8 löst das)
3. **GPS-Permission dauerhaft blockiert (Browser-Einstellung):** "Aktuelle Position verwenden" zeigt denselben Fehlerhinweis wie bei einmaliger Ablehnung — kein separater Deep-Link zu Geräte-Einstellungen wie im Player (PROJ-3), da die Karte hier immer eine funktionierende Alternative bieter
4. **Ersteller tippt außerhalb der Karte auf Wasser/Ozean:** Wird ohne Sonderbehandlung akzeptiert — die Koordinate ist technisch gültig, ob der Ort sinnvoll ist, liegt in der Verantwortung des Erstellers
5. **Zwei Stationen an (fast) derselben Position:** Wird erlaubt, keine Kollisionsprüfung — die Kontext-Pins auf der Karte machen das für den Ersteller sichtbar, aber es gibt keine blockierende Warnung
6. **Drag & Drop auf Touch-Geräten während der Karte offen ist:** Reihenfolge-Drag passiert nur in der Stationsliste (Sheet ist dabei geschlossen), keine Konflikte mit dem Karten-Pin-Drag im Sheet
7. **Löschen der letzten Station:** Liste zeigt danach den Empty State, Quest fällt zurück in "nicht spielbar" (kein Stationen mehr) — bestehende PROJ-6-Logik greift automatisch
8. **Sheet wird während eines laufenden GPS-Lookups geschlossen (Abbrechen):** Der GPS-Request wird verworfen, keine Race Condition, da der State nur beim Speichern übernommen wird
9. **Sehr schnelles Antippen der Karte mehrfach hintereinander:** Nur die letzte Tap-Position zählt, der Pin springt entsprechend — kein Debounce nötig, da nur eine lokale State-Änderung ohne Netzwerk-Call
10. **Zwischenstand-Garantie:** Wie in PROJ-6 explizit festgehalten — jede gespeicherte Station (auch ohne Position) wird sofort in `gq_quests` persistiert, kein Datenverlust bei Navigation weg von der Seite

## Technical Requirements
- Karten-Bibliothek: Leaflet + OpenStreetMap-Tiles (kostenlos, kein API-Key nötig) — neue Dependency, siehe Decision Log
- GPS: `navigator.geolocation.getCurrentPosition()` (Einzelabfrage, kein `watchPosition` nötig wie im Player) für "Aktuelle Position verwenden"
- Radius-Regler: shadcn-kompatibler Slider im Bereich 10–100m (ggf. neue shadcn-Komponente `slider` nachinstallieren, falls nicht vorhanden)
- Drag & Drop: Neue Dependency nötig (Detail für `/architecture`, z.B. `@dnd-kit`), da im Projekt noch keine Sortier-Interaktion existiert
- Speicher: Nutzt den bestehenden `gq_quests`-Storage-Layer aus PROJ-2/PROJ-6, keine neue Storage-Schicht
- Sanitization: Stationsname wird wie andere Textfelder von HTML-Tags bereinigt (bestehendes `stripHtmlTags()` aus PROJ-6)
- Touch-Targets: min. 44px (PRD-Anforderung), gilt auch für Karten-Interaktionselemente (Zoom-Buttons, "Aktuelle Position"-Button)
- Bestätigungsdialog bei kritischen Aktionen (Löschen) — PRD-Vorgabe
- Performance: Karte < 100ms Response bei Zoom/Pan (PRD-Anforderung)
- Sheet/Dialog-Portal-Rendering: Muss das bestehende Light-Theme-Fix-Muster aus PROJ-6 übernehmen (`data-theme="light"` + `text-foreground` auf der Portal-Root), sonst droht derselbe Dark-Theme-Rendering-Bug

## Open Questions
- [x] Welche konkrete Drag-and-Drop-Bibliothek soll verwendet werden? → Gelöst in `/architecture`: `@dnd-kit` (Begründung siehe Tech Design)
- [x] Soll der Radius-Regler in festen Schritten oder stufenlos laufen? → Gelöst in `/architecture`: feste Stufen 10/25/50/100m
- [x] Wie genau sieht der "Deutschland-Default-Zoom" aus? → Gelöst in `/architecture`: Kartenmittelpunkt 51.1657° N, 10.4515° O (geographische Mitte Deutschlands), Zoomstufe 6

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Karte als einziger Eingabeweg für GPS-Koordinaten (keine manuelle Lat/Lng-Eingabe) | PRD verlangt wörtlich "Stationen-Editor mit Karte"; Zielgruppe (Kinder/Lehrer/Eltern) kennt keine GPS-Koordinaten zum manuellen Eintippen | 2026-08-28 |
| Zusätzlicher "Aktuelle Position verwenden"-Button | Ersteller bauen Quests häufig direkt am Zielort — spart das manuelle Suchen auf der Karte, wenn man ohnehin vor Ort steht | 2026-08-28 |
| Bearbeitung als Sheet/Dialog auf derselben Seite, keine eigene Unterseite pro Station | Weniger Navigationsschritte, Kontext (Stationsliste) bleibt sichtbar/erreichbar, weniger Routing-Code | 2026-08-28 |
| Reihenfolge per Drag & Drop änderbar | Quest wird linear gespielt (PROJ-3) — Reihenfolge ist eine Kernentscheidung des Erstellers, muss ohne Löschen/Neuanlegen änderbar sein | 2026-08-28 |
| Station ohne Position darf gespeichert werden (Entwurfsprinzip) | Konsistent mit dem in PROJ-6 etablierten Muster: sofortiges Speichern verhindert Datenverlust, Vollständigkeit wird separat geprüft, nicht beim Speichern blockiert | 2026-08-28 |
| Bestätigungsdialog beim Löschen einer Station (kein Undo-Toast) | PRD verlangt generell Bestätigungsdialoge bei kritischen/destruktiven Aktionen; konsistent mit dem bereits etablierten Muster aus PROJ-6 (Quest löschen), kein neues UX-Pattern nötig | 2026-08-28 |
| Karte zeigt andere Stationen der Quest als Kontext-Pins | Hilft dem Ersteller einzuschätzen, ob die Route sinnvoll ist (z.B. Stationen zu nah beieinander), ohne dass er zwischen Stationen hin- und herwechseln muss | 2026-08-28 |
| Kein Modul-Platzhalter-UI in PROJ-7 | Saubere Trennung von PROJ-8, analog zum bereits etablierten PROJ-6/PROJ-7-Split — vermeidet halbfertige UI-Elemente ohne Funktion | 2026-08-28 |
| Keine UI-Sperre bei Erreichen von 20 Stationen | Die Schema-Grenze aus PROJ-2 bleibt die einzige durchgesetzte Regel (greift bei Import/Export); eine zusätzliche UI-Sperre wäre doppelte Logik ohne klaren MVP-Nutzen | 2026-08-28 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| `react-leaflet` + `leaflet` (OpenStreetMap-Tiles) für die Karte | De-facto-Standard-Wrapper für Leaflet in React, deklarative Komponenten statt manueller DOM-Ref-Verwaltung, große Community, kein API-Key nötig (im Gegensatz zu Google Maps/Mapbox) | 2026-08-28 |
| `@dnd-kit/core` + `@dnd-kit/sortable` für Drag & Drop | Exzellente Touch-Unterstützung (kritisch für Mobile-First-PWA), barrierefrei (Tastatur-Support out of the box), aktiv gepflegt — im Gegensatz zum unmaintained Original `react-beautiful-dnd` | 2026-08-28 |
| Karte wird nur clientseitig geladen (`next/dynamic`, `ssr: false`) | Leaflet greift direkt auf `window`/`document` zu und hat kein Server-Side-Rendering-Konzept — Next.js-Standardmuster für Browser-only-Bibliotheken | 2026-08-28 |
| Neue shadcn-Komponente `slider` nachinstalliert | Bisher nicht im Projekt vorhanden, aber Standard-shadcn-Primitive (Radix-basiert) — passt zum bestehenden Komponenten-Set, keine Custom-Implementierung nötig | 2026-08-28 |
| Radius als feste Stufen (10/25/50/100m) statt stufenlos | Leichter verständlich für Ersteller ohne GPS-Fachwissen, präziseres Antippen auf Mobile-Touchscreens als Freihand-Ziehen; GPS-Genauigkeit selbst liegt ohnehin oft im 5–10m-Bereich, feinere Abstufung hätte keinen Spielnutzen | 2026-08-28 |
| Deutschland-Default: Zentrum 51.1657° N / 10.4515° O, Zoomstufe 6 | Geographischer Mittelpunkt Deutschlands mit einer Zoomstufe, die das ganze Land sichtbar zeigt — sinnvoller Startpunkt, wenn die Quest noch keine einzige positionierte Station hat | 2026-08-28 |
| Stations-State im Sheet als lokaler Entwurf, erst bei "Speichern" in `gq_quests` übernommen | Verhindert, dass Kartenbewegungen/Zwischenzustände beim bloßen Öffnen des Sheets bereits die Quest verändern — Persistenz passiert nur bei explizitem Nutzer-Tap auf "Speichern", passend zum "Abbrechen verwirft alles"-Kriterium der Spec | 2026-08-28 |
| Kein neuer localStorage-Key — Stationen leben weiterhin im bestehenden `gq_quests`-Quest-Objekt (`stations`-Array) | Konsistent mit PROJ-2/PROJ-6: eine Quest ist ein einziges Objekt, Stationen sind kein eigenständig adressierbares Storage-Konzept | 2026-08-28 |
| `radiusMeters` erlaubt weiterhin beliebige Zahlen im Zod-Schema (PROJ-2), UI erzwingt nur die 4 Stufen | Schema bleibt kompatibel mit importierten Dateien, die z.B. `radiusMeters: 37` enthalten könnten (von einer anderen App oder älteren Version) — die UI-Einschränkung auf 4 Stufen ist rein editorseitig, kein Datenmodell-Zwang | 2026-08-28 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
/create/[id] (Page) — ersetzt den PROJ-6-Platzhalter
├── AppHeader "Quest bearbeiten" (Light Theme, Zurück → /create) — bereits vorhanden
├── Empty State (Stationen leer)
│   ├── Hinweistext
│   └── "Station hinzufügen"-Button
├── Stationsliste (sortierbar)
│   └── StationListItem (neu, pro Station) — sortierbarer Eintrag via @dnd-kit
│       ├── Drag-Griff (Icon, min. 44px Touch-Target)
│       ├── Name + Radius-Anzeige
│       ├── Positions-Status ("Position gesetzt" / "Keine Position gesetzt")
│       ├── "Module bearbeiten"-Button (führt zu PROJ-8, aktuell ohne Funktion)
│       └── Aktionen-Menü: "Bearbeiten" / "Löschen"
├── "Station hinzufügen"-Button (FAB, analog zum PROJ-6-Muster)
├── StationEditorSheet (neu, shadcn Sheet) — für Anlegen UND Bearbeiten
│   ├── Namensfeld
│   ├── StationMap (neu, Leaflet-Karte)
│   │   ├── Eigener Pin (setzbar per Tap, verschiebbar per Drag)
│   │   ├── Kontext-Pins (andere Stationen der Quest, grau, nicht interaktiv)
│   │   └── "Aktuelle Position verwenden"-Button (Kartenüberlagerung)
│   ├── Radius-Regler (shadcn Slider, Stufen 10/25/50/100m)
│   └── "Speichern" / "Abbrechen"
└── Lösch-Bestätigung (AlertDialog, gleiches Muster wie PROJ-6 Quest-Löschen)
```

### Daten-Architektur

Kein neuer Speicherort. Stationen sind bereits Teil des Quest-Objekts im bestehenden `gq_quests`-localStorage-Eintrag (`stations`-Array, PROJ-2-Schema) — PROJ-7 liest/schreibt ausschließlich über den bestehenden Storage-Layer aus PROJ-2/PROJ-6.

**Wichtige Lockerung gegenüber dem strikten Import-/Export-Schema** (konsistent mit dem PROJ-6-Entwurfsprinzip): Eine Station darf intern ohne `lat`/`lng` gespeichert werden, auch wenn das PROJ-2-Schema diese Felder für eine *importierbare/exportierbare* Quest-Datei zwingend verlangt. Die bestehende `isQuestComplete()`-Prüfung (PROJ-6) erkennt eine Station ohne Position automatisch als unvollständig — kein neuer Prüfmechanismus nötig, PROJ-7 nutzt das bereits vorhandene Werkzeug.

**Ablauf beim Bearbeiten einer Station:**
1. Sheet öffnet mit einer lokalen Kopie der Stationsdaten (neu: leeres Formular; bearbeiten: vorhandene Werte)
2. Kartenklicks, Radius-Änderungen, Namenseingabe verändern nur diesen lokalen Entwurf — die gespeicherte Quest bleibt unangetastet
3. Erst "Speichern" schreibt den Entwurf zurück ins `stations`-Array der Quest und aktualisiert `lastModified`
4. "Abbrechen" verwirft den lokalen Entwurf vollständig, keine Schreiboperation

**Reihenfolge:** Die Position im `stations`-Array bestimmt die Spielreihenfolge (bereits die Regel aus PROJ-3). Ein Drag-Vorgang in der Liste schreibt die neue Array-Reihenfolge sofort in `gq_quests` — keine separate "Sortierindex"-Eigenschaft nötig.

**Löschen:** Entfernt den Stationseintrag (inkl. seiner `modules`) aus dem Array, aktualisiert `lastModified` — nutzt denselben Schreib-Mechanismus wie jede andere Änderung.

### Karten-Verhalten (Leaflet)

- **Default-Zentrum ohne jede positionierte Station der Quest:** 51.1657° N, 10.4515° O (geografische Mitte Deutschlands), Zoomstufe 6
- **Default-Zentrum mit mindestens einer positionierten Station:** die zuletzt gesetzte Station der Quest, Zoomstufe nah genug für präzises Pin-Setzen (Straßenebene)
- **Kontext-Pins:** alle anderen Stationen der Quest mit gesetzter Position werden als kleinere, ausgegraute Marker angezeigt — rein visuell, nicht anklickbar, kein Tooltip nötig für MVP
- **"Aktuelle Position verwenden":** einmalige Geolocation-Abfrage (kein fortlaufendes Tracking wie im Player); bei Erfolg wird der Pin gesetzt und die Karte zentriert; bei Fehler/Ablehnung erscheint ein Toast-Hinweis, die Karte bleibt unverändert für manuelles Tippen nutzbar
- Karte wird ausschließlich clientseitig geladen (kein Server-Side-Rendering), da Leaflet Browser-APIs voraussetzt

### Wiederverwendete vs. neue Bausteine

| Baustein | Status |
|----------|--------|
| `gq_quests`-Storage (Laden/Speichern) | ♻️ Wiederverwendet aus PROJ-2/PROJ-6 |
| `isQuestComplete()` (erkennt Station ohne Position automatisch) | ♻️ Wiederverwendet aus PROJ-6, keine Änderung nötig |
| `isPlayable()` (Play-Sichtbarkeit ab 1 Station) | ♻️ Wiederverwendet aus PROJ-6, keine Änderung nötig |
| `stripHtmlTags()` | ♻️ Wiederverwendet aus PROJ-6 |
| shadcn Sheet, AlertDialog, DropdownMenu | ♻️ Bereits im Projekt vorhanden |
| Light-Theme-Portal-Fix (`data-theme="light"` + `text-foreground` auf Portal-Root) | ♻️ Bestehendes Muster aus PROJ-6, auf `StationEditorSheet` + Lösch-Dialog übertragen |
| shadcn `Slider` | 🆕 Neu installiert (Radix-basiert, Standard-shadcn-Komponente) |
| `StationMap` (Leaflet-Wrapper-Komponente) | 🆕 Neu |
| `StationEditorSheet` | 🆕 Neu |
| `StationListItem` (sortierbar via @dnd-kit) | 🆕 Neu |
| `useCurrentPosition`-Hook (Einzelabfrage `getCurrentPosition`) | 🆕 Neu — bewusst kein neuer `watchPosition`-Hook wie im Player, da nur eine einmalige Positionsabfrage gebraucht wird |

### Dependencies

| Package | Zweck | Status |
|---------|-------|--------|
| `leaflet` | Basis-Kartenbibliothek (OpenStreetMap-Tiles, kein API-Key) | 🆕 Neu |
| `react-leaflet` | Deklarativer React-Wrapper für Leaflet | 🆕 Neu |
| `@types/leaflet` | TypeScript-Typen für Leaflet | 🆕 Neu (Dev-Dependency) |
| `@dnd-kit/core` | Basis-Drag-and-Drop-Engine | 🆕 Neu |
| `@dnd-kit/sortable` | Sortierbare Listen-Utilities (baut auf `@dnd-kit/core` auf) | 🆕 Neu |
| shadcn `slider` | Radius-Regler-UI | 🆕 Neu installiert (`npx shadcn@latest add slider`) |
| Zod, Sonner, bestehende shadcn-Komponenten | Validierung, Toasts, UI-Bausteine | ♻️ Bereits installiert |

### Offene technische Hinweise für `/frontend`

- Leaflet benötigt eigenes CSS (`leaflet/dist/leaflet.css`) — muss global importiert werden, sonst werden Kacheln/Marker falsch positioniert dargestellt
- Leaflets Standard-Marker-Icons laden per Default von einem CDN-Pfad, der in Next.js-Bundling-Setups oft bricht — Marker-Icons müssen lokal referenziert oder als Custom-Icon gesetzt werden
- `@dnd-kit` benötigt einen `PointerSensor`/`TouchSensor`-Setup mit einer kleinen Aktivierungs-Distanz, damit ein normaler Tap (z.B. auf "Bearbeiten") nicht versehentlich als Drag-Start interpretiert wird

## Implementation Notes (Frontend)

**Date:** 2026-08-28

### Neue/geänderte Dateien
| Datei | Zweck |
|-------|-------|
| `src/app/create/[id]/page.tsx` | Ersetzt den PROJ-6-Platzhalter: Stationsliste (sortierbar via `@dnd-kit`), Empty State, "Station hinzufügen"-FAB, Lösch-Bestätigung |
| `src/components/station-editor-sheet.tsx` | Neu — Sheet (`side="bottom"`, `h-[92dvh]`) für Anlegen/Bearbeiten einer Station: Namensfeld, Karte, "Aktuelle Position verwenden", Radius-Regler |
| `src/components/station-map.tsx` | Neu — Leaflet/`react-leaflet`-Wrapper: eigener Pin (Tap + Drag), graue Kontext-Pins, Klick-Handler, Recenter-Handler bei Positionswechsel |
| `src/components/station-list-item.tsx` | Neu — sortierbarer Listeneintrag (`useSortable`): Drag-Griff, Name, Positions-Status, "Module bearbeiten"-Button (Platzhalter für PROJ-8), Aktionen-Menü |
| `src/components/station-radius-slider.tsx` | Neu — shadcn `Slider` mit 4 festen Stufen (10/25/50/100m) |
| `src/hooks/use-current-position.ts` | Neu — einmalige `getCurrentPosition()`-Abfrage (kein `watchPosition`) für den "Aktuelle Position verwenden"-Button |
| `src/lib/quest-storage.ts` | + `DraftStation`-Typ (lat/lng optional), `createDraftStation()`, `upsertStation()`, `deleteStation()`, `reorderStations()` |
| `src/components/ui/slider.tsx` | Neu installiert via `npx shadcn@latest add slider` |
| `public/leaflet/*.png` | Leaflets Marker-/Schatten-Icons lokal aus `node_modules/leaflet/dist/images/` kopiert (siehe Bug unten) |

### Abweichung von der Tech-Design-Skizze
- Grauer Kontext-Pin nutzt keinen separaten "grey marker"-Asset (den Leaflet gar nicht mitliefert), sondern denselben Icon-PNG wie der eigene Pin, per CSS (`opacity-50 grayscale`) abgedunkelt — spart einen dritten Marker-Asset-Satz ohne visuellen Unterschied für den MVP-Zweck (rein informative Kontext-Pins)

### Bug gefunden + behoben (während der Browser-Verifikation)
Die Tech-Design-Notiz „Marker-Icons müssen lokal referenziert werden" wurde in der ersten Implementierung fälschlich mit einem Verweis auf einen *anderen* CDN-Host (`unpkg.com`) statt echter lokaler Assets umgesetzt. Beim Browser-Test blockierte Chrome den grauen Kontext-Pin mit `ERR_BLOCKED_BY_ORB` (Cross-Origin-Read-Blocking) — der Pin blieb unsichtbar.
**Fix:** Leaflets eigene Marker-/Schatten-PNGs aus `node_modules/leaflet/dist/images/` nach `public/leaflet/` kopiert, `station-map.tsx` referenziert jetzt `/leaflet/*.png` (Next.js Static-Asset-Pfad), keine externe Domain mehr im Spiel.

### Verifikation
- `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, 6 vorbestehende `<img>`-Warnungen) · `npm test` ✓ (109/109, davon 11 neu für `upsertStation`/`deleteStation`/`reorderStations`/`createDraftStation`)
- Manuell im Browser (Playwright-Treiber gegen System-Chrome, da der gebündelte Playwright-Chromium-Download in dieser Sandbox blockiert war; 390×844 Mobile-Viewport, gemockte Geolocation Berlin) durchgespielt: Empty State → Station hinzufügen → Karte antippen (Pin setzen) → Radius per Tastatur auf 25m → Speichern → zweite Station per "Aktuelle Position verwenden" → beide Stationen in Liste sichtbar mit Positions-Icon/Radius → Bearbeiten (Werte korrekt vorausgefüllt) → Löschen mit Bestätigungsdialog → nur verbleibende Station sichtbar. Keine Konsolenfehler außer einem vorbestehenden, unabhängigen `favicon.ico`-404.
- E2E-Testsuite (Playwright, `tests/`) wurde für PROJ-7 noch nicht ergänzt — folgt in `/qa` analog zum bestehenden Muster (`tests/proj-6-creator-quest-verwaltung.spec.ts`)
- Nicht manuell verifiziert: Drag-and-Drop-Reihenfolge-Änderung selbst (Klick-Interaktionen wurden getestet, ein echter Pointer-Drag-Vorgang ließ sich im automatisierten Treiber-Skript nicht zuverlässig simulieren) — Code folgt dem Standard-`@dnd-kit`-Sortable-Muster, sollte in `/qa` gezielt mit echter Touch-/Maus-Interaktion geprüft werden

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
