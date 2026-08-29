# PROJ-11: Import — Passwortschutz

## Status: In Review
**Created:** 2026-08-29
**Last Updated:** 2026-08-29

## Dependencies
- Requires: PROJ-2 (Quest Data Model & JSON Import) — neues optionales `passwordHash`-Feld im Quest-Datenmodell, Import-Verhalten wird erweitert
- Requires: PROJ-6 (Creator — Quest-Verwaltung) — neues Feld im bestehenden "Quest bearbeiten"-Dialog (`QuestFormDialog`)
- Requires: PROJ-9 (Creator — JSON-Export) — Passwort-Hash wird bei jeder Sicherung/Veröffentlichung automatisch mitexportiert, ohne den bestehenden ungegateten Export-Flow zu verändern
- Beeinflusst: `/create/[id]` und `/create/[id]/station/[stationId]` — beide erhalten eine Zugriffssperre für nicht-autorisierte Browser

## Summary
Ersteller können ihrer Quest optional ein Passwort geben, das verhindert, dass jemand anderes (z.B. ein Spieler, der die Quest-Datei in die Finger bekommt) sie im Creator-Modus öffnet und dort die Rätsel-Lösungen sieht. Der Ersteller selbst muss dieses Passwort in seinem eigenen Browser nie eingeben — die App erkennt lokal, dass die Quest dort erstellt wurde. Erst wenn die Quest-Datei auf einem anderen Gerät/Browser importiert wird, sperrt die App den Creator-Zugriff (Stationsliste, Modul-Editor, Bearbeiten) hinter einer Passwort-Abfrage; der Play-Modus bleibt für jeden uneingeschränkt spielbar. Ein einmal korrekt eingegebenes Passwort wird sich für dieses Gerät dauerhaft gemerkt.

## User Stories
1. Als Ersteller möchte ich meiner Quest ein optionales Passwort geben, damit Spieler die Antworten nicht vorab sehen können, falls sie an die Quest-Datei kommen.
2. Als Ersteller möchte ich beim Bearbeiten meiner eigenen Quest nie nach einem Passwort gefragt werden, damit mein gewohnter Workflow nicht gestört wird.
3. Als Spieler, der eine fremde Quest-Datei importiert hat, möchte ich sie ganz normal spielen können, ohne ein Passwort zu benötigen.
4. Als Spieler möchte ich daran gehindert werden, eine importierte, passwortgeschützte Quest im Creator-Modus zu öffnen, damit ich nicht versehentlich (oder absichtlich) die Lösungen sehe, bevor ich sie spiele.
5. Als Mit-Ersteller (z.B. ein Kollege) möchte ich mit dem korrekten Passwort einmalig Zugriff auf die Creator-Ansicht einer importierten Quest bekommen und mir das nicht bei jedem Besuch erneut merken müssen.
6. Als Ersteller möchte ich das Passwort meiner Quest jederzeit ändern oder entfernen können.

## Out of Scope
- Schutz der rohen JSON-Datei selbst (z.B. Verschlüsselung des Dateiinhalts) — wer die Datei in einem Texteditor öffnet, sieht weiterhin alle Inhalte inkl. Lösungen im Klartext. Der Schutz wirkt ausschließlich innerhalb der App gegen das Öffnen im Creator-Modus (siehe Decision Log)
- Entfernen/Verschlüsseln der Antwortfelder (`correctIndices`, `answer`) aus der exportierten Datei selbst — deutlich größerer struktureller Eingriff, bewusst nicht Teil dieses Features (siehe Decision Log)
- Zugriffsschutz für den Play-Modus (`/play`) — Spielen bleibt für jeden immer uneingeschränkt möglich, das Feature schützt nur die Creator-Ansicht
- Passwort-Wiederherstellung (Reset per E-Mail o.ä.) — kein Backend, kein Account-System (PRD Non-Goal)
- Versuchslimit / Rate-Limiting bei falscher Passwort-Eingabe — Bedrohungsmodell ist Abschreckung, kein Schutz vor Brute-Force
- Mehrere unterschiedliche Passwörter/Rollen pro Quest (z.B. getrennte Passwörter für "Ansehen" vs. "Bearbeiten") — nur ein einziges Passwort pro Quest, das den gesamten Creator-Zugriff freischaltet
- Ändern/Entfernen des Passworts auf bereits verteilten, älteren Exportdateien — eine Passwort-Änderung wirkt erst ab dem nächsten Export; ältere, bereits geteilte Dateien behalten das darin gespeicherte alte Passwort
- Sperrung des Creator-Zugriffs für importierte Quests OHNE gesetztes Passwort — Verhalten bleibt wie heute (offen), der Schutz ist rein opt-in
- Passwortschutz für den in PROJ-10 verworfenen Creator-Testmodus — unabhängiges Feature, hat mit dieser Spec nichts zu tun

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

**Passwort setzen/ändern/entfernen:**
- [ ] Angenommen der Ersteller öffnet den "Quest bearbeiten"-Dialog, wenn der Dialog erscheint, dann ist ein optionales Passwort-Feld mit erklärendem Hinweistext sichtbar (z.B. "Schützt diese Quest davor, dass andere sie im Ersteller-Modus öffnen und die Lösungen sehen")
- [ ] Angenommen der Ersteller trägt ein Passwort mit mindestens 4 Zeichen ein, wenn er speichert, dann wird ein Hash dieses Passworts der Quest zugeordnet
- [ ] Angenommen der Ersteller trägt ein Passwort mit weniger als 4 Zeichen ein, wenn er speichert, dann erscheint eine Validierungsfehlermeldung am Feld und die Quest wird nicht gespeichert
- [ ] Angenommen eine Quest hat bereits ein Passwort, wenn der Ersteller den Dialog öffnet, dann wird das bestehende Passwort nicht im Klartext angezeigt (nur ein Hinweis, dass eines gesetzt ist, mit Möglichkeit es zu ändern oder zu entfernen)
- [ ] Angenommen eine Quest hat ein Passwort, wenn der Ersteller das Feld leert und speichert, dann wird der Passwortschutz vollständig entfernt

**Export/Import:**
- [ ] Angenommen eine Quest hat ein Passwort gesetzt, wenn sie exportiert wird (Sicherung oder Veröffentlichen), dann enthält die exportierte Datei den Passwort-Hash, niemals das Klartext-Passwort
- [ ] Angenommen eine Quest-Datei mit Passwort-Hash wird in einen Browser importiert, der diese Quest nicht selbst erstellt hat, dann wird der Creator-Zugriff für diese Quest gesperrt

**Zugriff durch den Ersteller selbst:**
- [ ] Angenommen eine Quest wurde in diesem Browser über "Neue Quest" angelegt, wenn der Ersteller sie in `/create/[id]` öffnet, dann wird zu keinem Zeitpunkt nach einem Passwort gefragt — unabhängig davon, ob später ein Passwort gesetzt wurde
- [ ] Angenommen der Ersteller ändert oder entfernt das Passwort seiner eigenen Quest, wenn er dies im "Quest bearbeiten"-Dialog tut, dann ist dafür keine erneute Passwort-Eingabe nötig

**Zugriff durch Dritte (gesperrter Creator-Zugriff):**
- [ ] Angenommen eine importierte Quest ist gesperrt, wenn der Nutzer in `/create` auf ihre Karte tippt, dann erscheint sofort eine Passwort-Abfrage anstelle der Stationsliste
- [ ] Angenommen die Passwort-Abfrage ist sichtbar, wenn der Nutzer ein falsches Passwort eingibt, dann erscheint eine Fehlermeldung ("Falsches Passwort"), das Eingabefeld bleibt nutzbar und weitere Versuche sind unbegrenzt möglich
- [ ] Angenommen die Passwort-Abfrage ist sichtbar, wenn der Nutzer das korrekte Passwort eingibt, dann wird der Creator-Zugriff (Stationsliste, Modul-Editor, Bearbeiten-Dialog) für diese Quest sofort freigeschaltet
- [ ] Angenommen ein Nutzer hat das korrekte Passwort einmal erfolgreich eingegeben, wenn er zu einem späteren Zeitpunkt (auch nach Browser-Neustart) erneut auf dieselbe Quest zugreift, dann wird nicht erneut nach dem Passwort gefragt
- [ ] Angenommen eine importierte Quest ist gesperrt, wenn der Nutzer versucht direkt die URL `/create/[id]/station/[stationId]` aufzurufen, dann greift dieselbe Passwort-Sperre wie auf `/create/[id]`

**Play-Modus bleibt unberührt:**
- [ ] Angenommen eine importierte Quest hat ein Passwort und ist für diesen Browser gesperrt, wenn der Nutzer sie über `/play` öffnet, dann kann er sie ganz normal ohne Passwort-Eingabe spielen

**Importierte Quest ohne Passwort:**
- [ ] Angenommen eine importierte Quest hat kein Passwort gesetzt, wenn der Nutzer sie in `/create` öffnet, dann ist der Creator-Zugriff wie bisher uneingeschränkt möglich

## Edge Cases
1. **Ersteller vergisst sein eigenes Passwort UND verliert die lokale "hier erstellt"-Markierung** (z.B. durch Löschen der Browser-Daten): Kein Wiederherstellungsweg — die Quest bleibt für den Creator-Zugriff dauerhaft gesperrt, außer der Ersteller erinnert sich zufällig noch an sein selbst gewähltes Passwort. Wird beim Setzen des Passworts explizit im Hinweistext kommuniziert.
2. **Ersteller importiert seine eigene, frühere Sicherungsdatei erneut in denselben (aber inzwischen "hier erstellt"-losen) Browser:** Technisch nicht von einem fremden Import unterscheidbar — der Ersteller muss einmalig sein eigenes (ihm bekanntes) Passwort eingeben, danach ist der Browser dauerhaft freigeschaltet, kein Sonderfall nötig.
3. **Quest ohne Passwort wird später (nach Verteilung ohne Passwort) doch noch mit einem Passwort versehen:** Nur der nächste Export enthält den neuen Hash. Bereits verteilte, ältere Kopien der Datei bleiben ungeschützt — kein rückwirkender Schutz möglich.
4. **Zwei verschiedene Quests haben zufällig dasselbe Passwort:** Kein Problem — die Freischaltung ist immer an die konkrete Quest-ID gebunden, nicht global.
5. **Import überschreibt eine bereits vorhandene, in diesem Browser selbst erstellte Quest mit derselben ID** (Sonderfall aus PROJ-2): Bestehendes PROJ-2-Konfliktverhalten hat Vorrang; die "hier erstellt"-Markierung des lokalen Originals bleibt maßgeblich für den Zugriff.
6. **Nutzer öffnet direkt eine Deep-Link-URL zum Modul-Editor einer gesperrten Quest, ohne vorher die Stationsliste gesehen zu haben:** Wird ebenfalls von der Sperre abgefangen (siehe Acceptance Criteria) — kein Umweg über die Stationsliste nötig, um den Schutz zu umgehen.
7. **localStorage wird lokal manipuliert, um die Sperre zu umgehen** (z.B. über die Browser-Konsole): Wird bewusst nicht verhindert — Bedrohungsmodell ist ein durchschnittlicher Spieler/Klassenkamerad, kein technisch versierter Angreifer mit Konsolen-Zugriff auf das eigene Gerät (siehe Decision Log, Out of Scope).

## Technical Requirements
- Neues optionales Feld im Quest-Datenmodell für den Passwort-Hash (Klartext-Passwort wird nie gespeichert oder exportiert)
- Client-seitiges Hashing (kein Backend verfügbar) — Hash-Algorithmus ist eine `/architecture`-Entscheidung, muss aber im Browser ohne Server-Aufruf laufbar sein
- Lokale, gerätespezifische Markierung "in diesem Browser erstellt" pro Quest, unabhängig vom Quest-Datenmodell selbst (darf nicht mitexportiert werden)
- Lokale, gerätespezifische Markierung "für dieses Gerät freigeschaltet" pro Quest nach korrekter Passwort-Eingabe (ebenfalls nicht Teil des exportierten Quest-Objekts)
- Zugriffssperre muss sowohl `/create/[id]` als auch `/create/[id]/station/[stationId]` abdecken (Route Guards oder gemeinsame Prüf-Logik)
- Sicherung/Veröffentlichen (PROJ-9) bleiben exakt wie spezifiziert ungegated — das Passwort-Feld ist nur ein normales Quest-Feld, keine Änderung am Export-Flow selbst nötig
- Mindestlänge 4 Zeichen fürs Passwort, keine weiteren Komplexitätsanforderungen
- Sanitization des Passwort-Eingabefelds konsistent mit bestehenden Textfeldern (`stripHtmlTags()` o.ä. aus PROJ-6/7/8, falls anwendbar)

## Open Questions
_Keine offenen Fragen._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Reines In-App-Deterrent, keine echte Dateiverschlüsselung | Kein Backend, keine Accounts (PRD-Constraint) — echte Sicherheit ist nicht erreichbar. Zielgruppe/Bedrohungsmodell ist ein neugieriger Mitschüler, nicht ein Angreifer mit Texteditor-Zugriff auf die Datei | 2026-08-29 |
| Antwortfelder bleiben in der exportierten Datei enthalten (nicht entfernt/verschlüsselt) | Würde eine grundlegende Strukturänderung an Export/Import (PROJ-2/8/9) erfordern — deutlich größerer Aufwand für einen MVP-Deterrent-Mechanismus | 2026-08-29 |
| Passwort schützt nur den Creator-Zugriff, Play-Modus bleibt immer offen | Kernzweck ist es, Spielern die Lösungen vorzuenthalten, nicht das Spielen selbst einzuschränken — jeder soll die Quest weiterhin spielen können | 2026-08-29 |
| Passwort-Feld optional im bestehenden "Quest bearbeiten"-Dialog (kein neuer Dialog) | Konsistent mit dem bestehenden Bearbeiten-Flow aus PROJ-6, kein neues UI-Pattern nötig | 2026-08-29 |
| Lokale "hier erstellt"-Markierung ersetzt tägliche Passwort-Eingabe für den Ersteller | Der Ersteller hat sein Passwort selbst vergeben und soll es nicht bei jeder eigenen Bearbeitung erneut eintippen müssen — die App kann bereits unterscheiden, ob eine Quest lokal angelegt oder importiert wurde | 2026-08-29 |
| Einmal korrekt eingegebenes Passwort wird pro Gerät dauerhaft gemerkt (auch für Dritte/Mit-Ersteller) | Ein Kollege, der regelmäßig mitbearbeitet, soll das Passwort nicht bei jedem Besuch erneut eingeben müssen — gleicher Mechanismus wie die Ersteller-Markierung, nur nachträglich freigeschaltet | 2026-08-29 |
| Re-Import der eigenen Sicherungsdatei (nach Verlust der "hier erstellt"-Markierung) erfordert einmalige, dem Ersteller bekannte Passwort-Eingabe | Technisch nicht von einem fremden Import unterscheidbar — kein Sonderfall nötig, der Ersteller kennt sein eigenes Passwort ja | 2026-08-29 |
| Passwort jederzeit änderbar/entfernbar wie jedes andere Quest-Feld | Konsistent mit Name/Intro/Outro — keine künstliche Einschränkung, Änderung wirkt einfach erst ab dem nächsten Export | 2026-08-29 |
| Mindestlänge 4 Zeichen, keine weiteren Komplexitätsregeln | Zielgruppe (Eltern/Lehrer als Ersteller) erwartet kein Passwort-Tresor-Verhalten — nur ein Schutz gegen leere/versehentliche Eingaben | 2026-08-29 |
| Kein Passwort-Reset-Mechanismus bei Vergessen | Konsistent mit PRD-Constraint "kein Backend/Account" — es gibt schlicht keinen Kanal für eine Wiederherstellung. Analog zum bestehenden PRD-Hinweis auf Datenverlust durch Browser-Löschung | 2026-08-29 |
| Unbegrenzte Eingabeversuche, kein Rate-Limiting | Bedrohungsmodell ist Abschreckung vor beiläufigem Neugierverhalten, nicht Schutz vor Brute-Force — ein Lockout-Mechanismus wäre unverhältnismäßiger Aufwand ohne echten Sicherheitsgewinn | 2026-08-29 |
| Importierte Quest ohne gesetztes Passwort bleibt wie bisher frei zugänglich im Creator-Modus | Der Schutz ist bewusst rein opt-in — bestehende, unveränderte Quests dürfen sich nicht plötzlich anders verhalten | 2026-08-29 |
| Manipulation von localStorage über die Browser-Konsole wird nicht verhindert | Außerhalb des realistischen Bedrohungsmodells (durchschnittlicher Spieler) — ein Schutz davor wäre ohnehin clientseitig nicht wasserdicht umsetzbar | 2026-08-29 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Passwort-Hash wird Teil des Quest-Datenmodells (`questSchema`), reist also mit der exportierten/importierten Datei mit | Der Hash muss auf jedem Gerät verfügbar sein, auf dem die Datei landet, damit dort geprüft werden kann — anders als `published`/`lastExported` (PROJ-6/9), die bewusst lokal bleiben, weil sie reinen Gerätezustand beschreiben | 2026-08-29 |
| "Hier erstellt"- und "hier entsperrt"-Markierung bleiben rein lokal (localStorage, pro Gerät), analog zu `published`/`lastExported` | Beide Merkmale beschreiben Gerätezustand, keine Eigenschaft der Quest selbst — folgen exakt dem bereits etablierten PROJ-6/9-Muster für genau diese Art von Unterscheidung | 2026-08-29 |
| Client-seitiges Hashing über die im Browser eingebaute Web Crypto API, kein zusätzliches Package | Kein Backend verfügbar (PRD-Vorgabe) — Hashing muss vollständig im Browser laufen; die Browser-eigene Funktion reicht für das hier benötigte Bedrohungsmodell (Abschreckung, keine Hochsicherheit), ein zusätzliches Passwort-Hashing-Package wäre unverhältnismäßig | 2026-08-29 |
| Eine einzige, gemeinsame Zugriffsprüf-Funktion, die beiden bestehenden Creator-Einstiegspunkten (`/create/[id]` und `/create/[id]/station/[stationId]`) vorgeschaltet wird | Verhindert, dass die beiden Seiten unabhängig voneinander geprüft werden und dabei auseinanderdriften oder eine Lücke für Deep-Links entsteht | 2026-08-29 |
| Kein neuer Dialog — das Passwort-Feld wird in den bestehenden `QuestFormDialog` (PROJ-6) integriert | Konsistent mit dem bereits etablierten "Quest bearbeiten"-Flow, kein neues UI-Muster nötig | 2026-08-29 |
| Kein neues Backend/keine neue Datenbank | Konsistent mit der PRD-Vorgabe "Kein Backend" | 2026-08-29 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
"Quest bearbeiten"-Dialog (bestehend, PROJ-6 — QuestFormDialog)
└── [NEU] Passwort-Feld mit Hinweistext
        ├── Leer gelassen → kein Schutz (unverändertes heutiges Verhalten)
        ├── Ausgefüllt (≥ 4 Zeichen) beim Speichern → Schutz wird aktiv, wirkt ab der nächsten Sicherung/Veröffentlichung
        ├── Bereits gesetzt, Dialog wird erneut geöffnet → Hinweis "Passwort ist gesetzt" statt Klartext-Anzeige, mit Möglichkeit zum Ändern oder Entfernen
        └── Geleert und gespeichert → Schutz wird vollständig entfernt

/create/[id] (Stationsliste — bestehend, PROJ-7)
└── [NEU] Zugriffsprüfung, bevor die Stationsliste gerendert wird
        ├── Diese Quest wurde in diesem Browser selbst erstellt, ODER hat kein Passwort, ODER wurde hier bereits entsperrt
        │       → Stationsliste wird normal angezeigt (unverändert)
        └── Diese Quest ist importiert, hat ein Passwort, und wurde in diesem Browser noch nie entsperrt
                → NEU: Passwort-Abfrage-Screen statt Stationsliste

/create/[id]/station/[stationId] (Modul-Editor — bestehend, PROJ-8)
└── [NEU] Dieselbe Zugriffsprüfung wie oben (schützt auch gegen direkte Deep-Links)
```

Kerngedanke: Es entsteht **keine neue Route**. Eine einzige, gemeinsame Zugriffsprüfung wird den beiden bestehenden Einstiegspunkten in den Creator-Bereich vorgeschaltet, bevor diese ihre normalen Inhalte zeigen. Der Play-Modus (`/play`, `/play/[id]`) wird von dieser Prüfung überhaupt nicht berührt.

### Daten-Architektur (plain language)

**Neu, Teil der geteilten Quest-Datei** (reist mit, wenn die Datei exportiert/importiert wird):
```
Passwort-Hash (optional) — ein irreversibler digitaler Fingerabdruck des
Passworts. Niemals das Passwort selbst im Klartext.
```

**Neu, ausschließlich lokal im jeweiligen Browser gespeichert** (reist NICHT mit der Datei mit, wird nie exportiert):
```
Pro Quest, pro Gerät gemerkt:
- "Wurde diese Quest in diesem Browser selbst angelegt?" (ja/nein)
- "Wurde das richtige Passwort für diese Quest in diesem Browser schon einmal
   erfolgreich eingegeben?" (ja/nein)
```

Dieses Muster ist im Projekt bereits etabliert: `published` und `lastExported` (PROJ-6/PROJ-9) sind exakt auf dieselbe Art lokale, gerätespezifische Zustände, die bewusst nicht Teil der exportierten Datei sind. Die neuen Zugriffs-Merkmale folgen demselben Prinzip.

**Zugriffs-Logik (zusammengefasst):**
```
Creator-Zugriff auf eine Quest ist erlaubt, wenn IRGENDEINE der folgenden Bedingungen zutrifft:
  1. Die Quest hat kein Passwort gesetzt
  2. Dieser Browser hat die Quest selbst erstellt ("hier erstellt"-Merkmal)
  3. Dieser Browser hat das Passwort für diese Quest bereits einmal korrekt eingegeben ("hier entsperrt"-Merkmal)

Trifft keine der drei Bedingungen zu → Passwort-Abfrage wird angezeigt.
```

### Verhalten der neuen/geänderten Bausteine

| Baustein | Verhalten |
|----------|-----------|
| Passwort-Feld im "Quest bearbeiten"-Dialog | Optionales Textfeld mit Hinweis, wofür es dient. Mindestens 4 Zeichen wenn ausgefüllt. Zeigt bei bestehendem Passwort nur einen Status-Hinweis, nie den Klartext |
| "Hier erstellt"-Merkmal | Wird automatisch gesetzt, sobald eine Quest über "Neue Quest" in diesem Browser angelegt wird — der Ersteller selbst tut dafür nichts Zusätzliches |
| "Hier entsperrt"-Merkmal | Wird automatisch gesetzt, sobald ein Nutzer auf einem beliebigen Gerät das korrekte Passwort einmal erfolgreich eingegeben hat |
| Passwort-Abfrage-Screen | Erscheint anstelle der Stationsliste bzw. des Modul-Editors, wenn keine der drei Zugriffsbedingungen erfüllt ist. Zeigt bei falscher Eingabe eine Fehlermeldung, erlaubt unbegrenzte weitere Versuche |
| Sicherung/Veröffentlichen (PROJ-9) | Unverändert in ihrem Ablauf — der Passwort-Hash ist einfach ein weiteres Feld der Quest, das automatisch mitexportiert wird, kein zusätzlicher Schritt im Export-Flow |

### Wiederverwendete vs. neue Bausteine

| Baustein | Status |
|----------|--------|
| `QuestFormDialog` (PROJ-6) | 🔧 Geändert — zusätzliches optionales Passwort-Feld |
| `gq_quests`-Storage (Laden/Speichern) | ♻️ Wiederverwendet aus PROJ-2/6/7/8, Passwort-Hash ist einfach ein weiteres Quest-Feld |
| Export-Flow (PROJ-9, "Sicherung"/"Veröffentlichen") | ♻️ Wiederverwendet, unverändert — kein neuer Schritt, der Hash ist bereits Teil des Quest-Objekts |
| Import-Validierung (PROJ-2/`quest-import.ts`) | 🔧 Geändert — akzeptiert und übernimmt das neue optionale Hash-Feld |
| `/create/[id]`-Seite (PROJ-7) | 🔧 Geändert — Zugriffsprüfung vorgeschaltet |
| `/create/[id]/station/[stationId]`-Seite (PROJ-8) | 🔧 Geändert — dieselbe Zugriffsprüfung vorgeschaltet |
| Gemeinsame Zugriffsprüf-Logik | 🆕 Neu |
| Passwort-Abfrage-Screen | 🆕 Neu |
| Lokale Speicherung der beiden Zugriffs-Merkmale | 🆕 Neu |

### Dependencies

Kein neues Package zwingend erforderlich. Das Hashing kann über eine bereits im Browser eingebaute Funktion (Web Crypto API) erfolgen — passend für das hier vorliegende Bedrohungsmodell (Abschreckung, keine Hochsicherheit), ohne eine zusätzliche externe Bibliothek einzuführen.

## Implementation Notes (Frontend)

**Date:** 2026-08-29

### Neue/geänderte Dateien
| Datei | Zweck |
|-------|-------|
| `src/lib/quest-access.ts` | Neu — gesamte PROJ-11-Zugriffslogik: `hasCreatorAccess()`, `markCreatedHere()`, `hashNewPassword()`/`verifyPassword()` (Web Crypto SHA-256), lokale "hier erstellt"/"hier entsperrt"-Markierungen in zwei eigenen localStorage-Keys (`gq_created_here`, `gq_unlocked_here`) |
| `src/components/creator-access-gate.tsx` | Neu — `CreatorAccessGate`-Wrapper: rendert Kinder direkt wenn `hasCreatorAccess()` true ist, sonst den Passwort-Abfrage-Screen (unbegrenzte Versuche, Fehlermeldung bei falscher Eingabe) |
| `src/lib/quest-schema.ts` | + optionales `passwordHash`-Feld in `questSchema` — reist mit der exportierten/importierten Datei mit (bewusst anders als `published`/`lastExported`) |
| `src/lib/quest-storage.ts` | `createDraftQuest()` ruft jetzt `markCreatedHere()` auf; `updateQuestDetails()` akzeptiert zusätzlich `passwordHash` |
| `src/components/quest-form-dialog.tsx` | + optionales Passwort-Feld mit Hinweistext, Mindestlänge-4-Validierung, "Passwort ist gesetzt"-Anzeige statt Klartext bei bestehendem Passwort, "Ändern"-Link zum Überschreiben; Speichern hasht ein neues Passwort asynchron über `hashNewPassword()` |
| `src/app/create/[id]/page.tsx` | Ganzer Seiteninhalt (Stationsliste, "Quest bearbeiten"-Button, alle Dialoge) in `CreatorAccessGate` gewrappt; `AppHeader`s Zurück-Link bleibt außerhalb der Sperre immer erreichbar |
| `src/app/create/[id]/station/[stationId]/page.tsx` | Dieselbe Sperre wie oben, deckt auch direkte Deep-Links zum Modul-Editor ab |

### Neue Tests
- `src/lib/quest-access.test.ts` — 11 Tests: Zugriffsregel (kein Passwort / hier erstellt / hier entsperrt / andere Quest bleibt gesperrt), Hash-Erzeugung (kein Klartext im Hash, unterschiedliche Passwörter → unterschiedliche Hashes), Verifikation (richtig/falsch, markiert nach Erfolg als entsperrt, Quest ohne Passwort ist immer "korrekt")

### Abweichungen von der Tech-Design-Skizze
- Keine strukturellen Abweichungen. Eine Detailentscheidung während der Umsetzung: Der "Quest bearbeiten"-Button in der Kopfzeile von `/create/[id]` wird bei gesperrtem Zugriff komplett ausgeblendet (nicht nur deaktiviert) — da das Bearbeiten-Dialog Intro-/Outro-Text und den Passwort-Status zeigen würde, was ebenfalls hinter der Sperre liegen soll.

### Verifikation
- `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, nur vorbestehende `<img>`-Warnungen) · `npm test` ✓ (151/151, davon 11 neu für `quest-access.ts`)
- Manuell im Browser (Playwright-Treiber gegen WebKit, da der gebündelte Chromium-Headless-Shell-Download in dieser Sandbox fehlt — gleiches etabliertes Muster wie PROJ-3/4/5/7/8/10) mit zwei getrennten Browser-Kontexten (simuliert zwei Geräte) vollständig durchgespielt:
  - Kontext 1 ("Ersteller"): Neue Quest erstellt, im "Quest bearbeiten"-Dialog ein Passwort gesetzt und gespeichert
  - Seite neu geladen (derselbe Browser) → **kein** Passwort-Prompt, Stationsliste direkt sichtbar (Ersteller-Erkennung funktioniert)
  - "Quest bearbeiten" erneut geöffnet → zeigt "Passwort ist gesetzt" statt Klartext, mit "Ändern"-Option
  - Quest-Objekt aus `localStorage` ausgelesen: `passwordHash` ist ein 64-stelliger SHA-256-Hex-Hash, kein Klartext-Passwort enthalten
  - Kontext 2 ("Fremdgerät", eigener Browser-Kontext ohne "hier erstellt"-Markierung): dieselbe Quest importiert (via `localStorage`-Injektion, entspricht einem echten Datei-Import) → `/create/[id]` zeigt sofort den Passwort-Abfrage-Screen statt der Stationsliste
  - Falsches Passwort eingegeben → Fehlermeldung "Falsches Passwort", Eingabefeld bleibt nutzbar
  - Richtiges Passwort eingegeben → sofortige Freischaltung, Stationsliste inkl. "Quest bearbeiten"-Button sichtbar
  - Seite neu geladen → bleibt entsperrt (kein erneuter Prompt) — "hier entsperrt"-Markierung persistiert korrekt
  - Dritter, separater Browser-Kontext mit derselben importierten (gesperrten) Quest → `/play/[id]` zeigt **keinen** Passwort-Prompt, Play-Modus vollständig ungegated bestätigt
  - Keine Konsolen-/Seitenfehler während des gesamten Durchlaufs

## QA Test Results

**Tested:** 2026-08-29
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build:** `npm run build` ✓ · `npm run lint` ✓ (0 Fehler, nur vorbestehende `<img>`-Warnungen) · `npm test` ✓ (151/151)
**Browser:** WebKit ("Mobile Safari"-Projekt, gleiches etabliertes Muster wie PROJ-3/4/5/7/8) — der gebündelte Playwright-Chromium-Headless-Shell-Download ist in dieser Sandbox nicht installiert (nur der volle Chromium-Browser), WebKit ist gecacht und funktioniert zuverlässig.

### Acceptance Criteria Status

#### Passwort setzen/ändern/entfernen
- [x] Optionales Passwort-Feld mit erklärendem Hinweistext im "Quest bearbeiten"-Dialog sichtbar
- [x] Passwort mit ≥ 4 Zeichen → Hash wird der Quest zugeordnet (verifiziert: 64-stelliger SHA-256-Hex-Hash)
- [x] Passwort mit < 4 Zeichen → Validierungsfehlermeldung, Quest wird nicht gespeichert (Dialog bleibt offen)
- [x] Bestehendes Passwort → "Passwort ist gesetzt" statt Klartext, mit "Ändern"-Option
- [x] Feld leeren (nach "Ändern") und speichern → Passwortschutz vollständig entfernt
- [ ] BUG-1: Beim **Erstellen** einer neuen Quest wird das Passwort-Feld ebenfalls angezeigt und ist ausfüllbar, aber die Eingabe wird beim Speichern still verworfen (siehe Bugs Found)

#### Export/Import
- [x] Exportierte Datei (echter "Sicherung"-Button, echter Download geprüft) enthält den Passwort-Hash, nie das Klartext-Passwort
- [x] Vollständiger Real-World-Roundtrip verifiziert: Passwort setzen → echten Export-Button klicken → echte heruntergeladene Datei in einem zweiten Browser-Kontext über den echten Datei-Import-Dialog importieren → Creator-Zugriff ist dort gesperrt

#### Zugriff durch den Ersteller selbst
- [x] In diesem Browser über "Neue Quest" angelegte Quest wird nie nach einem Passwort gefragt, auch nachdem eines gesetzt wurde (inkl. Reload)
- [x] Passwort der eigenen Quest ändern/entfernen erfordert keine erneute Passwort-Eingabe

#### Zugriff durch Dritte (gesperrter Creator-Zugriff)
- [x] Passwort-Abfrage erscheint sofort anstelle der Stationsliste
- [x] Falsches Passwort → Fehlermeldung "Falsches Passwort.", Eingabefeld bleibt nutzbar, unbegrenzte Versuche verifiziert (3 aufeinanderfolgende Fehlversuche)
- [x] Korrektes Passwort → sofortige Freischaltung (Stationsliste, "Quest bearbeiten"-Button)
- [x] Freischaltung bleibt nach Browser-Neustart/Reload bestehen
- [x] Direkter Deep-Link zu `/create/[id]/station/[stationId]` einer gesperrten Quest wird ebenfalls gesperrt — Modul-Inhalte sind nicht im DOM vorhanden (nicht nur visuell versteckt)
- [ ] BUG-2: Der Stationsname wird im Header des Modul-Editors **außerhalb** der Zugriffssperre gerendert und ist dadurch bei gesperrtem Zugriff sichtbar (siehe Bugs Found)

#### Play-Modus bleibt unberührt
- [x] Gesperrte Quest ist über `/play` uneingeschränkt spielbar, keine Passwort-Abfrage

#### Importierte Quest ohne Passwort
- [x] Verhalten unverändert wie vor PROJ-11 — Creator-Zugriff frei

### Edge Cases Status

1. [x] Passwort vergessen + "hier erstellt"-Markierung verloren → dauerhaft gesperrt, kein Wiederherstellungsweg (Hinweistext kommuniziert das explizit beim Setzen)
2. [x] Re-Import der eigenen Sicherungsdatei nach Verlust der Markierung → einmalige Passwort-Eingabe nötig, danach dauerhaft freigeschaltet (durch Code-Review bestätigt: `hasCreatorAccess()` unterscheidet nicht zwischen "eigener Re-Import" und "fremder Import", exakt wie spezifiziert)
3. [x] Passwort wird nachträglich gesetzt → nur der nächste Export enthält den Hash, ältere Kopien bleiben ungeschützt (Code-Review: Hash ist ein normales Quest-Feld, kein rückwirkender Mechanismus vorhanden)
4. [x] Zwei Quests mit demselben Passwort → Freischaltung ist an die konkrete Quest-ID gebunden (durch Unit-Test `does not grant access to a different quest just because another was created here` abgesichert)
5. [x] Import überschreibt eine selbst erstellte Quest mit derselben ID → durch Code-Review bestätigt, bestehendes PROJ-2-Verhalten unverändert, "hier erstellt"-Markierung bleibt lokal unabhängig vom Import-Vorgang bestehen
6. [x] Deep-Link zum Modul-Editor ohne vorherigen Besuch der Stationsliste → wird von der Sperre abgefangen (siehe AC oben) — **mit der BUG-2-Einschränkung, dass der Stationsname trotzdem im Header sichtbar ist**
7. [x] localStorage-Manipulation zur Umgehung → bewusst nicht verhindert (Bedrohungsmodell laut Spec), kein Bug

### Security Audit Results
- [x] Authentifizierung/Autorisierung: N/A — kein Backend, kein Account-System (PRD Non-Goal), Zugriffsmodell ist bewusst client-seitiges Deterrent
- [x] XSS: `<script>`-Payload als Passwort eingegeben → landet ausschließlich gehasht (64-stelliger Hex-String) in `localStorage`, kein Skript wird ausgeführt, kein Klartext/Payload irgendwo im DOM auffindbar
- [x] Passwort wird nirgends im Klartext im DOM oder in einem `value`-Attribut angezeigt, auch nicht beim erneuten Öffnen des Bearbeiten-Dialogs mit bestehendem Passwort
- [x] Gesperrter Modul-Inhalt (Fragen/Antworten) ist bei aktiver Sperre nachweislich nicht im DOM vorhanden (per `page.content()`-Prüfung, nicht nur CSS-versteckt)
- [x] Passwort-Hash selbst ist ein SHA-256-Digest — nicht umkehrbar, kein Klartext-Leak über den Hash möglich
- [x] Kein `dangerouslySetInnerHTML`, `eval()` oder `new Function()` in den neuen PROJ-11-Dateien
- [x] Keine neuen Netzwerk-Calls, kein Secret-Leak — alles läuft rein client-seitig über Web Crypto API und `localStorage`
- [x] Rate-Limiting bewusst nicht implementiert (siehe Out of Scope) — kein Fund, sondern spezifiziertes Verhalten

### Regression Testing
Volle bestehende E2E-Suite (`npx playwright test --project="Mobile Safari"`) für alle Features, deren gemeinsam genutzte Dateien PROJ-11 berührt (`QuestFormDialog`, `quest-storage.ts`, `quest-schema.ts`, `/create/[id]`, `/create/[id]/station/[stationId]`), erneut ausgeführt:

| Suite | Ergebnis |
|-------|----------|
| PROJ-6 (Creator — Quest-Verwaltung) | 28/28 bestehen |
| PROJ-9 (Creator — JSON-Export) | 11/11 bestehen |
| PROJ-7 (Creator — Stationen-Editor) | vollständig grün (Teil der 49/49 gemeinsamen PROJ-7/8-Laufzeit) |
| PROJ-8 (Creator — Modul-Editor) | vollständig grün (Teil der 49/49 gemeinsamen PROJ-7/8-Laufzeit) |

**Ergebnis: Keine Regressionen durch PROJ-11.** Alle 88 vorbestehenden E2E-Tests über die vier betroffenen, bereits deployten Features bestehen unverändert.

### Unit Tests (Vitest)
Bereits im Frontend-Schritt ergänzt: `src/lib/quest-access.test.ts`, 11 Tests (Zugriffsregel, Hash-Erzeugung, Verifikation) — keine weiteren im QA-Schritt nötig, vollständige Logik-Abdeckung bereits vorhanden. Gesamte Suite weiterhin grün: 151/151.

### E2E Tests (Playwright)
Neue Datei `tests/proj-11-import-passwortschutz.spec.ts`: 17 Tests, mindestens einer pro Akzeptanzkriterien-Gruppe plus zwei dedizierte Tests, die die unten dokumentierten Bugs als aktuellen (fehlerhaften) Ist-Zustand festhalten (`Bekannte Bugs`-Describe-Block) — dienen als Regressionsschutz und müssen nach den Fixes aktualisiert werden, um das dann korrekte Verhalten zu prüfen. Alle 17 grün auf "Mobile Safari".

### Bugs Found

#### BUG-1: Passwort-Feld beim Erstellen einer neuen Quest ist funktionslos, aber ausfüllbar — Eingabe wird still verworfen
- **Severity:** Medium
- **Steps to Reproduce:**
  1. `/create` öffnen, "Neue Quest erstellen" antippen
  2. Name, Intro- und Outro-Text ausfüllen
  3. Im sichtbaren, normal aussehenden Passwort-Feld ein Passwort eintragen (z.B. "geheim123")
  4. "Erstellen" antippen
  5. Erwartet: entweder wird das Passwort übernommen, oder das Feld ist in diesem Dialog-Modus gar nicht erst sichtbar
  6. Tatsächlich: Die Quest wird ohne jeglichen Passwortschutz angelegt (`passwordHash` bleibt `undefined`), ohne jede Fehlermeldung oder Warnung — der Nutzer hat keinen Hinweis darauf, dass sein eingegebenes Passwort verworfen wurde
- **Ursache:** `QuestFormDialog` wird für beide Modi ("Neue Quest erstellen" und "Quest bearbeiten") wiederverwendet und zeigt das Passwort-Feld in beiden identisch an. Der "create"-Zweig in `handleFormConfirm` (`src/app/create/page.tsx`) ruft jedoch `createDraftQuest(values.name, values.intro, values.outro)` auf — eine Funktion, die gar keinen `passwordHash`-Parameter entgegennimmt — statt `updateQuestDetails()`, das `passwordHash` verarbeitet.
- **Impact:** Ein Ersteller, der naheliegenderweise direkt beim Anlegen ein Passwort vergeben möchte (bevor er überhaupt Inhalte erstellt hat), verliert dieses Passwort lautlos. Er bemerkt es erst, wenn jemand anderes die vermeintlich geschützte Quest unbemerkt öffnen kann — zu einem Zeitpunkt, an dem der eigentliche Schutzzweck (Lösungen geheim halten) bereits gescheitert sein könnte.
- **Priority:** Fix before deployment (verletzt die stillschweigende Erwartung, dass ein ausgefülltes, sichtbares Formularfeld auch tatsächlich etwas bewirkt — ein klassisches "silent data loss"-Muster)

#### BUG-2: Stationsname bleibt bei gesperrtem Modul-Editor-Zugriff im Header sichtbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Eine passwortgeschützte, importierte (gesperrte) Quest mit einer Station besitzen, deren Name potenziell einen Hinweis oder eine Antwort enthält (z.B. "Das Codewort lautet Banane")
  2. Direkt die URL `/create/[id]/station/[stationId]` dieser Station aufrufen (Deep Link)
  3. Erwartet: Der komplette Modul-Editor-Bereich inkl. Kopfzeile ist hinter der Passwort-Sperre verborgen, analog zum Verhalten auf `/create/[id]`
  4. Tatsächlich: Der Passwort-Abfrage-Screen erscheint korrekt, aber der `AppHeader` mit dem echten Stationsnamen wird bereits **davor** (außerhalb der `CreatorAccessGate`) gerendert und bleibt sichtbar
- **Ursache:** In `src/app/create/[id]/station/[stationId]/page.tsx` steht `<AppHeader title={station.name || "Unbenannte Station"} .../>` vor dem öffnenden `<CreatorAccessGate>`-Tag, nicht innerhalb.
- **Impact (begrenzt):** Um diese URL überhaupt zu kennen, braucht ein Angreifer bereits die exakte `stationId` (eine UUID) — der reguläre Weg dorthin (Stationsliste antippen) ist selbst bereits gesperrt, sodass ein Spieler ohne vorherigen (ggf. berechtigten) Zugriff diese ID normalerweise nicht kennt. Das Risiko ist dadurch spürbar geringer als ein direkter Lösungs-Leak auf dem Hauptpfad, aber die Sperre ist an dieser einen Stelle nachweislich unvollständig.
- **Priority:** Fix before deployment (Sperre soll laut Spec vollständig sein — "Angenommen eine importierte Quest ist gesperrt, ... dann greift dieselbe Passwort-Sperre wie auf `/create/[id]`" ist für den Stationsnamen aktuell nicht erfüllt)

### Summary
- **Acceptance Criteria:** 17/19 vollständig bestanden, 2 mit dokumentiertem Bug (BUG-1, BUG-2) — beide sind eng umrissene Einzelpunkte innerhalb ansonsten bestandener Kriteriengruppen, nicht ganze Gruppen ausgefallen
- **Bugs Found:** 2 total (0 Critical, 0 High, 2 Medium, 0 Low)
- **Security:** Pass — keine ausnutzbaren Schwachstellen gefunden, Bedrohungsmodell (Abschreckung, kein Hochsicherheitsanspruch) wird eingehalten
- **Regression:** Pass — 88/88 vorbestehende E2E-Tests über PROJ-6/7/8/9 unverändert grün
- **Production Ready:** NO — beide gefundenen Bugs sind Medium-Severity, aber beide verletzen den Kernzweck des Features (Passwort tatsächlich wirksam setzen können; Sperre tatsächlich vollständig). Ein Ersteller, der das naheliegendste Verhalten ausprobiert (Passwort direkt beim Anlegen setzen), erlebt eine stille Fehlfunktion — das ist für ein Sicherheits-/Datenschutz-Feature nicht akzeptabel, auch wenn kein Critical/High-Bug im klassischen Sinn vorliegt.
- **Recommendation:** Beide Bugs vor dem Deploy beheben. BUG-1 vermutlich am einfachsten durch Übergabe von `values.passwordHash` an eine erweiterte `createDraftQuest()`-Signatur (oder einen `updateQuestDetails()`-Aufruf direkt nach dem Erstellen) zu lösen. BUG-2 durch Verschieben des `AppHeader` in den Body von `CreatorAccessGate` (mit einem reduzierten, generischen Titel für den gesperrten Zustand) oder durch Übergabe eines "safe title" an den Header, wenn gesperrt. Nach den Fixes: `/frontend` erneut aufrufen, dann `/qa` erneut, inkl. Aktualisierung der beiden `Bekannte Bugs`-E2E-Tests auf das dann korrekte Verhalten.

## Deployment
_To be added by /deploy_
