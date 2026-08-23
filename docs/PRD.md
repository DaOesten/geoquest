# Product Requirements Document

## Vision
Geo Quest ist eine Mobile-First-Web-App (PWA), die Kinder und Jugendliche (10–15 Jahre) nach draußen bringt, indem sie GPS-basierte Schnitzeljagden in ein spannendes Gaming-Erlebnis verwandelt. Nutzer können interaktive Quests mit Rätseln, Multimedia-Inhalten und GPS-Navigation erstellen und spielen — ohne Account, ohne Backend, komplett frei und offen.

## Target Users
- **Spieler (10–15 Jahre):** Wollen Abenteuer erleben, Rätsel lösen, sich draußen bewegen — aber mit dem Reiz eines Handy-Games. Pain Point: "Draußen ist langweilig" vs. Bildschirmzeit.
- **Ersteller (Kinder, Eltern, Lehrer, Jugendleiter):** Wollen Schnitzeljagden für Geburtstage, Schulausflüge oder Ferienprogramme bauen. Pain Point: Bestehende Tools sind teuer (Actionbound-Abo) oder zu nüchtern.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Quest Player — GPS-Navigation & Stationen | Planned |
| P0 (MVP) | Quest Player — Modulsystem (Text, Bild, Audio, Video, Tasks) | Planned |
| P0 (MVP) | Quest Player — Fortschritt & Abschluss | Planned |
| P0 (MVP) | Quest Creator — Quest-Verwaltung | Planned |
| P0 (MVP) | Quest Creator — Stationen-Editor mit Karte | Planned |
| P0 (MVP) | Quest Creator — Modul-Editor (alle 5 Typen) | Planned |
| P0 (MVP) | Quest Creator — JSON-Export | Planned |
| P0 (MVP) | Quest Creator — Vorschau / Testmodus | Planned |
| P0 (MVP) | Quest Data Model & JSON Import | Planned |
| P0 (MVP) | Quest Import — Passwortschutz zum Bearbeiten/Testen | Planned |
| P0 (MVP) | PWA-Installation (Add to Homescreen) | Planned |
| P1 | Landing Page mit App-Link & KI-Anleitung zur Quest-Erstellung | Planned |

## Produktziele
1. Intuitive Benutzerführung für beide Modi (Creator/Player)
2. Zuverlässige GPS-Navigation mit klarer Richtungsanzeige
3. Stabile lokale Datenhaltung
4. Reibungsloser Import/Export von Quests

## Success Metrics
- App funktioniert zuverlässig auf mobilen Geräten (iOS Safari, Android Chrome)
- Mindestens eine vollständige Quest erstellt und von anderen gespielt
- Nutzungszahlen sichtbar via Vercel Analytics (Page Views, Sessions)

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
- Fokus auf die Zielgruppe 10–15 Jahre
