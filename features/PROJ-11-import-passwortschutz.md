# PROJ-11: Import — Passwortschutz

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
