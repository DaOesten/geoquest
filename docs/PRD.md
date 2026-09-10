# Product Requirements Document

## Vision
Geo Quest ist eine Mobile-First-Web-App (PWA), die Kinder und Jugendliche (etwa 8–16 Jahre) nach draußen bringt, indem sie GPS-basierte Schnitzeljagden in ein spannendes Gaming-Erlebnis verwandelt. Nutzer können interaktive Quests mit Rätseln, Multimedia-Inhalten und GPS-Navigation erstellen und spielen — ohne Account, ohne Backend, komplett frei und offen.

## Target Users
- **Spieler (etwa 8–16 Jahre, aber niemand ist zu alt):** Wollen Abenteuer erleben, Rätsel lösen, sich draußen bewegen — aber mit dem Reiz eines Handy-Games. Pain Point: "Draußen ist langweilig" vs. Bildschirmzeit. Die Altersangabe ist der Schwerpunkt, keine Grenze — Quests werden auch von Erwachsenen gespielt.
- **Ersteller (überwiegend Erwachsene: Eltern, Lehrkräfte, Jugendleiter — Kinder ebenfalls möglich):** Wollen Schnitzeljagden für Geburtstage, Schulausflüge oder Ferienprogramme bauen. Pain Point: Bestehende Tools sind teuer (Actionbound-Abo) oder zu nüchtern. Sie sind die Gruppe, die den Nutzen der App bewertet — und damit auch Adressat der freiwilligen Unterstützung (siehe Finanzierung).

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Quest Player — GPS-Navigation & Stationen | Planned |
| P0 (MVP) | Quest Player — Modulsystem (Text, Bild, Audio, Video, Tasks) | Planned |
| P0 (MVP) | Quest Player — Fortschritt & Abschluss | Planned |
| P0 (MVP) | Quest Creator — Quest-Verwaltung | Planned |
| P0 (MVP) | Quest Creator — Stationen-Editor mit Karte | Deployed |
| P0 (MVP) | Quest Creator — Modul-Editor (alle 5 Typen) | Deployed |
| P0 (MVP) | Quest Creator — JSON-Export | Planned |
| ~~P0 (MVP)~~ | Quest Creator — Vorschau / Testmodus | Verworfen |
| P0 (MVP) | Quest Data Model & JSON Import | Planned |
| P0 (MVP) | Quest Import — Passwortschutz zum Bearbeiten/Testen | Planned |
| P0 (MVP) | PWA-Installation (Add to Homescreen) | Planned |
| P1 | Landing Page mit App-Link & KI-Anleitung zur Quest-Erstellung | Deployed |
| P1 | Impressum & Datenschutzerklärung (Teil von PROJ-13) | Deployed |
| P1 | „Support me" — Ko-fi-Link in Burger-Menu & Info-Kopfzeile (PROJ-1, PROJ-13) | Deployed |

## Produktziele
1. Intuitive Benutzerführung für beide Modi (Creator/Player)
2. Zuverlässige GPS-Navigation mit klarer Richtungsanzeige
3. Stabile lokale Datenhaltung
4. Reibungsloser Import/Export von Quests

## Success Metrics
- App funktioniert zuverlässig auf mobilen Geräten (iOS Safari, Android Chrome)
- Mindestens eine vollständige Quest erstellt und von anderen gespielt
- Nutzungszahlen sichtbar via Vercel Analytics (Page Views, Sessions) — eingebunden am 2026-09-05, cookiefrei; im Vercel-Projekt zu aktivieren

## Constraints
- Solo-Entwickler mit AI-Unterstützung
- Kein Backend — IndexedDB/localStorage + JSON-Dateien
- Mobile-First (360–430px), Desktop nutzbar (Creator)
- Design System: siehe `docs/design-system.md`
- Multimedia-Module brauchen Internetverbindung (URLs)
- Performance: < 2s Ladezeit, GPS innerhalb 5s, Karte < 100ms Response
- PWA-fähig, letzte 2 Browser-Versionen (Chrome, Safari, Firefox, Edge)
- WCAG AA Kontrast (4.5:1), min. 44px Touch-Targets, min. 16px Body-Text
- JSON-Import muss gegen XSS validiert werden
- Datenschutzhinweis bei erstem Start
- Automatisches Speichern bei Änderungen
- Bestätigungsdialog bei kritischen Aktionen (Löschen)
- Hinweis auf Datenverlust durch Browser-Löschung bei erstem Start

## Finanzierung
Geo Quest bleibt kostenlos und ohne Abo (siehe Differenzierung). Die einzige Einnahmeform ist eine **freiwillige Unterstützung über Ko-fi** (https://ko-fi.com/technolomagie), erreichbar über das Burger-Menu und die Kopfzeile der Info-Seiten. Adressat sind die **erwachsenen Ersteller** — Eltern, Lehrkräfte, Jugendleiter —, die den Nutzen der App kennen und für die eine Unterstützung überhaupt in Frage kommt. Bewusst zurückhaltend platziert: keine Werbung, keine Bezahlschranke, kein Hinweis im Spielverlauf. Gespielt wird in jedem Alter; wer unterwegs eine Station sucht, ist nicht der Adressat.

## Non-Goals
- Kein Benutzer-Account / Login
- Keine zentrale Quest-Bibliothek / Marktplatz
- Keine Multiplayer-Echtzeit-Features
- Keine native App (nur PWA)
- Kein Punkte-/Ranglisten-/Achievement-System
- Kein Offline-Modus
- Keine Bottom-Navigation

## Differenzierung (vs. Actionbound, Geocaching)
- Komplett kostenlos und offen (kein Abo)
- Gaming-Look statt nüchternem Bildungs-Tool-Design
- Kein Account-Zwang
- Fokus auf die Zielgruppe der 8–16-Jährigen (Schwerpunkt, keine Grenze)
