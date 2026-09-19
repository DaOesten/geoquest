# PROJ-12: PWA-Installation (Add to Homescreen)

## Status: Deployed
**Created:** 2026-09-18
**Last Updated:** 2026-09-19 (deployt)

## Dependencies
- Requires: PROJ-1 (App Shell & Mode Switch) — der Startscreen `/` trägt einen der beiden Hinweis-Orte, und das Wurzel-Layout (`src/app/layout.tsx`) hält heute schon `themeColor` und `viewportFit: "cover"`
- Berührt: PROJ-5 (Player — Fortschritt & Abschluss) — die Quest-Liste `/play` trägt den zweiten Hinweis-Ort
- Berührt: PROJ-3 (Player — GPS-Navigation) — die Standortfreigabe verhält sich in der installierten App als eigener Ursprungskontext (siehe Edge Case 7)

_Keine Datenabhängigkeit: Dieses Feature ändert nichts am Quest-Modell, an Import/Export oder am Editor. Es fügt Metadaten, Icons und einen Hinweis hinzu._

## Kontext

Das PRD nennt Geo Quest in seinem allerersten Satz eine **PWA** und führt „PWA-Installation (Add to Homescreen)" als P0-Feature. Technisch ist davon bisher **nichts vorhanden**: kein Manifest, kein Service Worker, keine App-Icons (`git ls-files` findet nur die Leaflet-Marker). Wer die Seite heute auf dem Homescreen ablegt, bekommt ein Browser-Lesezeichen mit einem Screenshot-Icon — kein Vollbild, keine Marke.

Der Nutzen ist für den **Spieler** am größten und sehr konkret: Ohne Browser-Adressleiste gewinnt der Player-Screen rund 100px Höhe — Platz, der auf 360×640 direkt der Karte und dem Richtungspfeil zugutekommt. Dazu ein echtes Icon auf dem Homescreen statt eines Lesezeichens, das zwischen Tabs verloren geht.

**Der Rahmen, den das PRD setzt, und der Konflikt darin:** Das PRD sagt „PWA-fähig" und zugleich „Kein Offline-Modus" als ausdrückliches Non-Goal. Beides gilt weiter. Dieses Feature macht die App **installierbar**, nicht offlinefähig — die App braucht zum Starten weiterhin Internet, genau wie heute.

**Die eine Stelle, an der das nicht ohne Weiteres aufgeht:** Chrome/Android feuert `beforeinstallprompt` nur, wenn neben dem Manifest auch ein **Service Worker mit fetch-Handler** registriert ist. Ohne ihn gäbe es auf Android überhaupt keinen Installationsweg — und Android Chrome ist laut PRD eine der beiden Hauptplattformen. Der Service Worker dieses Features ist deshalb bewusst **minimal**: Er hält genau eine Datei vor, die Offline-Fallback-Seite. Alles andere geht ungefiltert ins Netz. Das ist die Eintrittskarte zur Installierbarkeit, kein Offline-Modus durch die Hintertür.

**Warum die Fallback-Seite trotzdem sein muss:** Eine installierte App sieht aus wie eine echte App. Tippt ein Spieler draußen ohne Empfang auf das Icon und bekommt Chromes Dinosaurier-Fehlerseite, wirkt das Produkt kaputt — nicht das Netz. Eine eigene Seite im Geo-Quest-Look, die ehrlich sagt „Geo Quest braucht Internet zum Starten" und einen „Erneut versuchen"-Button anbietet, kostet wenig und rettet genau diesen Moment.

**Ausgangsmaterial für die Icons:** Der Betreiber hat `public/assets/geoquest_pwaIcon.jpeg` geliefert — 1024×1024, markengetreu. Es ist als Quelle brauchbar, aber **nicht direkt einsetzbar** (siehe Product Decisions): Es trägt einen weißen Rand um eine bereits abgerundete Kachel, und der volle Schriftzug ist bei 48px unleserlich.

## User Stories

- Als **Spieler** möchte ich Geo Quest wie eine App auf meinem Homescreen haben, damit ich sie draußen mit einem Tap starte, statt im Browser nach dem Tab zu suchen.
- Als **Spieler** möchte ich die Quest im Vollbild ohne Browser-Leiste spielen, damit Karte und Richtungspfeil den vollen Bildschirm bekommen.
- Als **Ersteller** möchte ich Geo Quest ebenfalls installieren können, damit ich unterwegs schnell in meine Quests komme.
- Als **Spieler**, der ohne Empfang auf das App-Icon tippt, möchte ich eine verständliche Meldung statt einer Browser-Fehlerseite sehen, damit ich weiß, dass mein Netz das Problem ist und nicht die App.
- Als **Nutzer**, der die App nicht installieren will, möchte ich den Hinweis wegklicken können und in Ruhe gelassen werden, damit er mich nicht bei jedem Besuch stört.
- Als **Betreiber** möchte ich, dass eine neue Version sofort bei allen installierten Nutzern ankommt, damit niemand mit einer veralteten App unterwegs ist, die er nicht per Adressleiste neu laden kann.

## Out of Scope

- **Caching von App-Shell, HTML, CSS, JS oder Schriften** — bewusst verworfen. Der Service Worker cacht **ausschließlich** die Offline-Fallback-Seite. Alles andere kommt bei jedem Aufruf aus dem Netz. Das hält das PRD-Non-Goal „Kein Offline-Modus" ein und vermeidet die Klasse von Fehlern, bei der Nutzer eine alte Version festhalten.
- **Offline spielbare Quests** — Kartenkacheln (OSM) und Multimedia-Module (externe URLs) vorab laden wäre ein eigenes, großes Feature und widerspricht dem PRD direkt („Multimedia-Module brauchen Internetverbindung", „Kein Offline-Modus").
- **Push-Benachrichtigungen** — erfordern Backend und Einwilligung; das PRD schließt ein Backend aus.
- **Background Sync / periodische Hintergrundaktualisierung** — kein Anwendungsfall ohne Backend.
- **App-Store-Veröffentlichung (TWA, Play Store, App Store)** — PRD-Non-Goal: „Keine native App (nur PWA)".
- **Ein „Neue Version verfügbar"-Banner** — unnötig, weil der Service Worker sofort übernimmt und nichts außer der Fehlerseite hält (siehe Technical Decisions).
- **Ein Menu-Eintrag „App installieren" im Burger-Menu** — verworfen; der Hinweis auf `/` und `/play` genügt, und das Menu trägt seit PROJ-1 bereits sieben Ziele in vier Gruppen.
- **Installations-Hinweis im Creator-Bereich (`/create`, Editoren)** — der Ersteller arbeitet überwiegend am Desktop, wo Installation kaum Nutzen bringt. Installieren kann er trotzdem jederzeit über die Browser-Funktion.
- **Installations-Hinweis während einer laufenden Quest** (`/play/[id]`, Navigation, Module, Outro) — analog zur Ko-fi-Regel des PRD: kein Hinweis im Spielverlauf.
- **Screenshots im Manifest** (für die erweiterte Android-Installations-Ansicht) — nice-to-have, erfordert gepflegte Bildmaterialien und ist für die Installierbarkeit nicht nötig.
- **Shortcuts im Manifest** (Direktsprung zu `/play` / `/create` per Icon-Longpress) — als spätere Ergänzung denkbar, nicht MVP-relevant.
- **Querformat-Unterstützung** — das Manifest legt Portrait fest (siehe Product Decisions); Player-Screens sind nie für Querformat gestaltet worden.
- **Ein Deinstallations- oder „Auf Update prüfen"-Weg in der App** — Sache des Betriebssystems.
- **BUG-2 (16px-Schließen-X in Sheets) und BUG-9 (kein `:focus-visible` app-weit)** — vorbestehend, app-weit und unabhängig von diesem Feature.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Installierbarkeit

- [ ] Angenommen ein Besucher ruft eine beliebige Seite der App auf, wenn der Browser das Dokument lädt, dann findet er ein verlinktes Web-App-Manifest, das Name, Kurzname, Start-URL, Anzeigemodus, Ausrichtung, Hintergrund-, Themenfarbe und Icons deklariert
- [ ] Angenommen ein Nutzer öffnet die App in Chrome auf Android, wenn Manifest und Service Worker geladen sind, dann erfüllt die App die Installationsbedingungen des Browsers und ein Installationsweg wird angeboten
- [ ] Angenommen ein Nutzer öffnet die App in Safari auf iOS, wenn er „Teilen → Zum Home-Bildschirm" wählt, dann wird die App mit dem Geo-Quest-Icon und dem Namen „Geo Quest" abgelegt
- [ ] Angenommen die App wurde installiert, wenn der Nutzer sie über das Homescreen-Icon startet, dann öffnet sie im Vollbild ohne Browser-Adressleiste (`display: standalone`)
- [ ] Angenommen die App wurde installiert, wenn sie startet, dann zeigt sie den Startscreen `/` mit beiden Mode-Cards und dem Burger-Menu
- [ ] Angenommen die App läuft installiert, wenn der Nutzer das Gerät dreht, dann bleibt die Anzeige im Hochformat
- [ ] Angenommen die App wurde installiert, wenn der Nutzer sie startet, dann sind seine im Browser angelegten Quests und Fortschritte vorhanden (gleicher Ursprung, gleicher localStorage)

### App-Icons

- [ ] Angenommen ein Nutzer hat die App installiert, wenn er seinen Homescreen betrachtet, dann sieht er ein Geo-Quest-Icon ohne weißen Rand und ohne sichtbare doppelte Abrundung
- [ ] Angenommen das Betriebssystem beschneidet Icons zu Kreis oder Squircle (Android), wenn es das Geo-Quest-Icon maskiert, dann bleibt das Pin-Motiv vollständig und mittig sichtbar
- [ ] Angenommen ein Nutzer betrachtet das Icon in kleiner Darstellung (etwa 48×48), wenn er es ansieht, dann ist das Pin-Motiv als solches erkennbar
- [ ] Angenommen das Manifest wird geprüft, wenn seine Icon-Liste gelesen wird, dann enthält sie mindestens eine Grafik mit 192×192 und eine mit 512×512 sowie eine eigens als `maskable` gekennzeichnete Variante
- [ ] Angenommen ein iOS-Nutzer legt die App ab, wenn das Icon gesetzt wird, dann greift ein `apple-touch-icon` (iOS wertet das Manifest-Icon nicht in allen Versionen aus)

### Hinweis auf die Installation

- [ ] Angenommen ein Nutzer besucht `/` oder `/play` in einem Browser, der die App installieren kann, und hat sie noch nicht installiert, wenn die Seite geladen ist, dann sieht er einen zurückhaltenden Hinweis, dass er Geo Quest als App installieren kann
- [ ] Angenommen der Hinweis wird auf Android angezeigt, wenn der Nutzer den Installations-Button antippt, dann öffnet der Browser seinen nativen Installationsdialog
- [ ] Angenommen der Hinweis wird auf iOS Safari angezeigt (wo es keinen nativen Dialog gibt), wenn der Nutzer ihn betrachtet, dann erklärt er in kurzen Worten den Weg „Teilen → Zum Home-Bildschirm"
- [ ] Angenommen der Nutzer hat die App bereits installiert und ruft sie im Standalone-Modus auf, wenn `/` oder `/play` laden, dann erscheint **kein** Installations-Hinweis
- [ ] Angenommen ein Nutzer sieht den Hinweis, wenn er ihn wegklickt, dann verschwindet er sofort und erscheint bei den nächsten Besuchen **30 Tage lang nicht wieder**
- [ ] Angenommen ein Nutzer hat den Hinweis vor mehr als 30 Tagen weggeklickt und die App immer noch nicht installiert, wenn er `/` oder `/play` erneut besucht, dann wird ihm der Hinweis erneut angeboten
- [ ] Angenommen ein Nutzer befindet sich in einer laufenden Quest (`/play/[id]`) oder im Creator (`/create` und Unterseiten), wenn er diese Screens betrachtet, dann erscheint **kein** Installations-Hinweis
- [ ] Angenommen der Hinweis wird angezeigt, wenn seine Bedienelemente gemessen werden, dann ist jedes Tap-Ziel mindestens 44×44px groß und der Textkontrast erreicht mindestens 4.5:1
- [ ] Angenommen der Hinweis erscheint auf `/`, wenn der Startscreen auf 360×640 betrachtet wird, dann bleiben Logo, Headline und beide Mode-Cards ohne Scrollen sichtbar (Kriterium aus PROJ-1 bleibt erfüllt)

### Verhalten ohne Netz

- [ ] Angenommen die App ist installiert und der Service Worker aktiv, wenn der Nutzer sie ohne Internetverbindung startet, dann sieht er eine Geo-Quest-eigene Seite mit der Aussage, dass die App eine Internetverbindung zum Starten braucht — nicht die Fehlerseite des Browsers
- [ ] Angenommen der Nutzer sieht die Offline-Seite, wenn er den „Erneut versuchen"-Button antippt, dann versucht die App erneut zu laden
- [ ] Angenommen der Nutzer sieht die Offline-Seite und stellt die Verbindung wieder her, wenn er „Erneut versuchen" antippt, dann startet die App normal
- [ ] Angenommen die Offline-Seite wird angezeigt, wenn sie betrachtet wird, dann verspricht sie **nicht**, dass Quests offline spielbar seien

### Aktualisierung

- [ ] Angenommen eine neue Version wurde deployt, wenn ein Nutzer die installierte App das nächste Mal startet, dann erhält er die neue Version, ohne die App deinstallieren oder alle Fenster schließen zu müssen
- [ ] Angenommen der Service Worker ist registriert, wenn eine beliebige Seite oder ein Asset angefragt wird, dann liefert er sie aus dem Netz aus und nicht aus einem Cache (einzige Ausnahme: die Offline-Fallback-Seite, wenn das Netz ausfällt)

### Keine Regression

- [ ] Angenommen die PWA-Metadaten wurden ergänzt, wenn alle sieben Routen aufgerufen werden, dann antworten sie weiterhin mit HTTP 200 und unverändertem Inhalt
- [ ] Angenommen das Wurzel-Layout wurde geändert, wenn `/about`, `/anleitung`, `/impressum` und `/datenschutz` geprüft werden, dann sind ihre Metadaten, ihr JSON-LD und ihr Seitenrahmen unverändert
- [ ] Angenommen der Service Worker ist aktiv, wenn ein Spieler eine Quest mit GPS, Karte und Multimedia-Modulen spielt, dann funktioniert alles wie zuvor (Kartenkacheln, externe Medien, Standortabfrage)
- [ ] Angenommen ein Besucher ruft die Seite in einem Browser ohne Service-Worker-Unterstützung auf, wenn die App lädt, dann funktioniert sie vollständig wie bisher, nur ohne Installationsangebot
- [ ] Angenommen die neuen Dateien werden ausgeliefert, wenn die Security-Header geprüft werden, dann sind sie unverändert aktiv

## Edge Cases

1. **Nutzer besucht die Seite in einem Browser ohne `beforeinstallprompt` und ohne iOS-Homescreen-Funktion** (z.B. Desktop-Firefox) → Es erscheint kein Hinweis. Die App funktioniert normal. Der Hinweis erscheint nur, wenn ein Installationsweg tatsächlich existiert.

2. **Nutzer hat die App bereits installiert, besucht die Seite aber zusätzlich im normalen Browser-Tab** → Der Browser meldet die App in der Regel als bereits installiert (`getInstalledRelatedApps` bzw. ausbleibendes `beforeinstallprompt`); dann erscheint kein Hinweis. Lässt sich das nicht sicher feststellen, ist ein einmalig angezeigter und wegklickbarer Hinweis hinnehmbar — er wird nicht erzwungen erneut gezeigt.

3. **Nutzer bricht den nativen Installationsdialog ab** → Der Hinweis verschwindet trotzdem und gilt für 30 Tage als weggeklickt. Begründung: Wer aktiv abbricht, hat eine Entscheidung getroffen; ihn im selben Besuch erneut zu fragen wäre aufdringlich.

4. **localStorage ist blockiert oder voll** (privater Modus, Speicher erschöpft) → Der Hinweis lässt sich trotzdem wegklicken und verschwindet für die laufende Sitzung; beim nächsten Besuch kann er erneut erscheinen. Kein Fehler, keine Fehlermeldung — genauso verhält sich heute schon der Erststart-Dialog.

5. **Netz fällt mitten in einer laufenden Quest aus** (nicht beim Start) → Die Offline-Seite erscheint **nicht**. Die App bleibt geladen, Quest-Daten liegen lokal vor, das Spiel läuft weiter. Nur Kartenkacheln und externe Medien fehlen — unverändertes Verhalten wie ohne PWA.

6. **Nutzer startet die installierte App ohne Netz, stellt die Verbindung her, tippt aber nicht „Erneut versuchen"** → Er bleibt auf der Offline-Seite, bis er den Button benutzt oder die App neu startet. Die Seite lädt nicht von selbst neu.

7. **Standortfreigabe in der installierten App** → Die installierte PWA kann vom Betriebssystem als eigener Kontext behandelt werden; die Standortfreigabe muss dann einmalig erneut erteilt werden. Das ist erwartetes Plattformverhalten. Wichtig ist, dass der bestehende Permission-Screen aus PROJ-3 dabei greift und kein stiller Ausfall entsteht.

8. **Alte Service-Worker-Version bleibt nach einem Deploy aktiv** → Ausgeschlossen durch sofortige Übernahme (siehe Technical Decisions). Der Nutzer bekommt beim nächsten Start die aktuelle Version, ohne etwas zu tun.

9. **Nutzer installiert die App aus einer Unterseite heraus** (z.B. `/play`) → Die installierte App startet trotzdem immer auf `/`, weil die Start-URL im Manifest festgelegt ist.

10. **Icon-Motiv wird vom Betriebssystem stark beschnitten** (kreisrunde Maske auf manchen Android-Launchern) → Deshalb die eigene `maskable`-Variante mit Sicherheitsrand. Innerhalb der inneren 80% des Bildes steht nichts, was verloren gehen darf.

11. **Nutzer hat die App installiert und deinstalliert sie wieder** → Beim nächsten Besuch im Browser kann der Hinweis wieder erscheinen, sofern die 30-Tage-Frist abgelaufen ist. Kein Sonderfall.

12. **Service Worker kann nicht registriert werden** (Browser blockiert ihn, unsicherer Kontext, Nutzer hat ihn abgeschaltet) → Die App funktioniert vollständig weiter; nur die Offline-Seite und der Android-Installationsweg entfallen. Kein Fehler für den Nutzer sichtbar.

13. **Erststart-Dialog (PROJ-1) und Installations-Hinweis treffen auf demselben Screen zusammen** → Sie dürfen sich nicht überlagern. Der Erststart-Dialog hat Vorrang; der Installations-Hinweis wird erst sichtbar, wenn der Dialog geschlossen ist.

14. **Nutzer öffnet die App über einen geteilten `/play/[id]`-Link auf einem Gerät, auf dem sie installiert ist** → Verhalten ist plattformabhängig (Browser oder App). Kein Anspruch dieses Features; der Link muss lediglich weiterhin funktionieren.

## Technical Requirements

- **Kein Backend, keine neuen Netzabhängigkeiten** — alle neuen Dateien werden von der eigenen Domain ausgeliefert
- **Kein neues Laufzeit-Paket**, sofern vermeidbar — das Projekt hält seine Abhängigkeiten bewusst klein
- **Die Startzeit darf nicht steigen** — PRD-Vorgabe: < 2s Ladezeit. Die Info-Seiten sind heute statisch (0,07–0,09s); das muss so bleiben
- **Der Service Worker cacht ausschließlich die Offline-Fallback-Seite** — kein HTML, CSS, JS, keine Schriften, keine Kartenkacheln, keine Medien
- **Der Service Worker übernimmt bei jedem Deploy sofort die Kontrolle** — kein Warten auf geschlossene Tabs
- **HTTPS** — Service Worker laufen nur im sicheren Kontext; in der Produktion durch Vercel gegeben, lokal über `localhost`
- **Browser-Support:** Chrome (Android/Desktop) und Safari (iOS/macOS) müssen den Installationsweg bieten; Firefox und Edge müssen die App **fehlerfrei ohne** Installationsangebot darstellen
- **Kontrast mindestens 4.5:1 und Tap-Ziele mindestens 44×44px** für alle neuen Bedienelemente (PRD/WCAG-AA-Vorgabe) — auch auf der Offline-Seite
- **Die Offline-Seite kommt ohne JavaScript-Framework aus** — sie muss funktionieren, wenn die App gar nicht geladen werden konnte, und darf deshalb nicht von React oder Next.js abhängen
- **Icons als PNG**, abgeleitet aus `public/assets/geoquest_pwaIcon.jpeg`; das Quellbild bleibt im Repository
- **Das `maskable`-Icon hält die inneren 80% als Sicherheitszone frei** (Android-Maskierung)
- **Die bestehenden Security-Header bleiben unverändert** und müssen auch für Manifest, Service Worker und Icons gelten

## Open Questions

- [x] ~~Lässt sich der Pin sauber aus `geoquest_pwaIcon.jpeg` freistellen, oder braucht es eine Zulieferung des Betreibers?~~ **Geschlossen in `/architecture` (2026-09-18): ja, keine Zulieferung nötig.** Das Quellbild wurde vermessen — weißer Rand 55/54/61px, und zwischen Pin-Gruppe und Schriftzug liegt eine motivfreie Spalte bei x 392..401. Ein Probeschnitt (330×420 ab x=62, y=250) zeigt Pin, gestrichelte Route und X vollständig, ohne Buchstabenrest und ohne weißen Rand. Werkzeug: `sips` (Teil von macOS).
- [ ] Soll die Themenfarbe (Statusleiste der installierten App) bei `#0B0F12` bleiben oder das Teal aufnehmen? Vorschlag: Deep Black beibehalten, damit die Statusleiste nahtlos in den App-Hintergrund übergeht. Am echten Gerät zu beurteilen.
- [ ] Verhält sich die Standortfreigabe in der installierten iOS-PWA wie im Safari-Tab, oder muss sie neu erteilt werden? (Edge Case 7) — nur auf einem echten iPhone abschließend zu klären; für die Korrektheit des Features unkritisch, weil der Permission-Screen aus PROJ-3 greift.
- [ ] Bleibt es dauerhaft bei „keine Screenshots im Manifest"? Sie würden die Android-Installations-Ansicht aufwerten, erfordern aber gepflegtes Bildmaterial.
- [ ] Wie weit soll der Pin die `any`-Icons ausfüllen? Randlos wirkt kräftig, kann auf iOS aber gedrungen aussehen, weil dort kein Sicherheitsrand abgezogen wird. Beim Erzeugen der PNGs im Augenschein zu entscheiden — betrifft nur die Optik, nicht die Installierbarkeit.

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Nur Installierbarkeit, **kein** Offline-Modus | Das PRD führt „Kein Offline-Modus" als ausdrückliches Non-Goal und zugleich „PWA-fähig" als Constraint. Beides ist erfüllbar: Installierbarkeit ist Metadaten plus Icons, Offlinefähigkeit wäre eine Caching-Strategie, die jeden Screen berührt. | 2026-09-18 |
| **Doch** ein minimaler Service Worker | Chrome/Android installiert nur mit registriertem Service Worker mit fetch-Handler. Ohne ihn gäbe es auf einer der beiden PRD-Hauptplattformen gar keinen Installationsweg — das Feature verfehlte sein Ziel. Er cacht nichts außer der Fehlerseite, das Non-Goal bleibt gewahrt. | 2026-09-18 |
| Eigene Offline-Fallback-Seite statt Browser-Fehlerseite | Eine installierte App sieht aus wie eine echte App. Chromes Dinosaurier lässt das Produkt kaputt wirken, nicht das Netz. Genau der Moment — draußen, wenig Empfang, Tap aufs Icon — ist der, für den die App existiert. | 2026-09-18 |
| Hinweis nur auf `/` und `/play` | Die beiden Screens vor dem Loslaufen. Nicht im Spielverlauf (analog zur Ko-fi-Regel des PRD: „kein Hinweis im Spielverlauf") und nicht im Creator, der überwiegend am Desktop läuft. | 2026-09-18 |
| Hinweis ist dezent und wegklickbar, kein Modal | Das Projekt tritt durchgehend zurückhaltend auf — keine Werbung, keine Bezahlschranke, Ko-fi nur am Rand. Ein aufdringliches Install-Interstitial widerspräche dieser Haltung. | 2026-09-18 |
| Weggeklickt = 30 Tage Ruhe, dann erneut | Lang genug, um nicht zu nörgeln; kurz genug, dass jemand, der die App ein zweites Mal für einen Ausflug nutzt, das Angebot noch einmal bekommt. Bewusst abweichend vom Erststart-Dialog, der dauerhaft verschwindet — der ist eine Pflichtinformation, das hier ein Angebot. | 2026-09-18 |
| Schwerpunkt Spieler, Ersteller aber nicht ausgeschlossen | Der Vollbildgewinn (~100px) nützt dem Player-Screen am meisten. Der Ersteller kann jederzeit über die Browser-Funktion installieren, bekommt nur keinen Hinweis dazu. | 2026-09-18 |
| Icon zeigt **nur den Pin**, nicht den vollen Schriftzug | Bei 48×48 auf dem Homescreen wird „GEO QUEST" unleserlich. Das Design System sieht den Pin ohnehin ausdrücklich als „Standalone App-Icon" vor. Der Produktname steht auf dem Homescreen als Text unter dem Icon — er muss nicht zusätzlich im Bild stehen. | 2026-09-18 |
| `geoquest_pwaIcon.jpeg` als Quelle, nicht als fertiges Icon | 1024×1024 und markengetreu, aber mit weißem Rand um eine bereits abgerundete Kachel: iOS und Android runden selbst nochmal ab, das Ergebnis wäre ein Icon im Icon mit weißen Ecken. Der Pin wird daraus freigestellt und randlos auf Deep Black gesetzt. | 2026-09-18 |
| Manifest erzwingt Hochformat | Die App ist Mobile-First auf 360–430px gebaut; Kompass, Karte und Module sind nie für Querformat gestaltet worden. Querformat zuzulassen hieße, alle Player-Screens dafür zu prüfen — Aufwand, den keine Spec vorsieht. | 2026-09-18 |
| Start-URL ist `/`, nicht `/play` | Die installierte App verhält sich wie die Website. `/` trägt seit BUG-10 das vollständige Burger-Menu und beide Mode-Cards; von dort sind Play und Create je einen Tap entfernt. Ein Start auf `/play` würde den Creator in der installierten App verstecken, obwohl die Installation laut PRD auch ihm offensteht. | 2026-09-18 |
| Kein Menu-Eintrag „App installieren" | Das Burger-Menu trägt bereits sieben Ziele in vier Gruppen. Ein achter Eintrag, der auf den meisten Geräten nichts tun kann (iOS bietet keinen programmatischen Weg), wäre mehr Last als Nutzen. | 2026-09-18 |
| Offline-Seite verspricht ausdrücklich **keine** Offline-Fähigkeit | Sie sagt, dass Internet zum Starten nötig ist. Eine Formulierung wie „du bist offline" könnte als „sonst ginge es auch offline" gelesen werden — und würde ein Versprechen erzeugen, das das Produkt nicht hält. | 2026-09-18 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Service Worker übernimmt sofort (`skipWaiting` + `clients.claim` o.ä.) | Die installierte App hat keine Adressleiste — der Nutzer kann ein hängengebliebenes Update nicht selbst erzwingen. Da nichts außer der Fehlerseite gecacht wird, ist die sofortige Übernahme risikofrei; ein „Neue Version"-Banner wäre unnötige Komplexität. | 2026-09-18 |
| Manifest als `src/app/manifest.ts`, nicht als statische JSON-Datei | Next.js 16 kennt diese Datei als eigene Metadaten-Route und prüft die Feldnamen beim Bauen. Ein Tippfehler fällt damit im Build auf statt erst im Browser, wo ein ungültiges Manifest still die Installierbarkeit kostet. Das `<link rel="manifest">` wird automatisch gesetzt. | 2026-09-18 |
| Kein PWA-Paket (serwist, next-pwa, Workbox) | Wären ~15 neue Pakete plus Build-Plugin, um **eine** Datei zu cachen. Beide cachen zudem standardmäßig die App-Shell — genau das PRD-Non-Goal — und müssten erst in ihrer Kernfunktion abgeschaltet werden. Ein handgeschriebener Service Worker von ~40 Zeilen ist hier kleiner, vollständig lesbar und im Review prüfbar. Das Projekt hält seine 41 Dependencies bewusst klein. | 2026-09-18 |
| Service Worker als statische `public/sw.js`, nicht als gebündeltes Modul | Er muss unter einer stabilen URL im Wurzel-Scope liegen, damit er die ganze App abdeckt. Eine Datei in `public/` wird unverändert ausgeliefert; ein Bundle bekäme bei jedem Build einen neuen Namen. | 2026-09-18 |
| Offline-Seite als eigenständige `public/offline.html` mit eingebettetem CSS | Sie wird genau dann gezeigt, wenn die App **nicht** laden konnte — sie darf also nicht von React, Next.js oder den selbst gehosteten Google-Schriften abhängen, die in diesem Moment ebenfalls fehlen. Preis: Die Farbwerte stehen dort ein zweites Mal und können bei einem Redesign auseinanderlaufen. Akzeptiert, weil die Alternative (App-Shell cachen) das Non-Goal bricht. | 2026-09-18 |
| Der Cache enthält ausschließlich `offline.html` | Macht das Non-Goal strukturell unverletzbar statt nur absichtlich eingehalten: Es gibt nichts im Cache, woraus die App offline zusammengesetzt werden könnte. Zugleich entfällt die ganze Fehlerklasse „Nutzer hängt auf alter Version fest". | 2026-09-18 |
| Icons einmalig mit `sips` erzeugt und eingecheckt | `sips` ist Teil von macOS — keine Dependency, kein `sharp`, keine verlängerte Build-Zeit für Dateien, die sich praktisch nie ändern. Das Ergebnis liegt sichtbar im Repository und ändert sich nie unbemerkt. | 2026-09-18 |
| Pin bei x 62..392 aus dem Quellbild geschnitten | Gemessen, nicht geschätzt: Der weiße Rand liegt bei 55/54/61px, und zwischen Pin-Gruppe und Schriftzug gibt es eine motivfreie Spalte bei **x 392..401** — eine saubere Schnittkante. Ein Probeschnitt zeigt Pin, Route und X vollständig ohne Buchstabenrest. | 2026-09-18 |
| Eigener `apple-touch-icon` neben den Manifest-Icons | iOS wertet die Manifest-Icon-Liste nicht in allen Versionen aus. Ohne dieses Icon nimmt Safari einen Screenshot der Seite — auf dem Homescreen unter den echten App-Icons sofort erkennbar. | 2026-09-18 |
| Anzeige-Logik in einem eigenen Hook `use-install-prompt.ts` | „Darf der Hinweis erscheinen?" hängt an vier Bedingungen (installiert? weggeklickt? Frist um? Weg vorhanden?) und wird an zwei Orten gebraucht. Als Hook steht die Regel einmal da und ist ohne Browser testbar — **die Lücke, durch die BUG-6 live gehen konnte, war ein ungetesteter Hook** (`use-device-orientation.ts` hatte keine Unit-Tests). | 2026-09-18 |
| iOS-Erkennung über mehrere Signale, im Zweifel nichts anzeigen | Direkte Lehre aus BUG-6 (PROJ-3, 2026-09-07): Dort schloss `isIOS()` allein aus der Existenz von `requestPermission` auf iOS und lag auf Desktop-Chrome falsch — der Spieler bekam einen Button, der garantiert fehlschlug. Ein ausbleibender Hinweis ist harmlos; eine Anleitung, die auf dem Gerät nicht funktioniert, ist der eigentliche Fehler. | 2026-09-18 |
| Hinweis im Seitenfluss statt fixiert am unteren Rand | Das Design System verbietet ausdrücklich Bottom-Navigation und Tab-Bars; ein fixierter Banner läse sich als solche. Als normale Karte im Fluss verdeckt er nichts und schiebt nichts weg. | 2026-09-18 |
| Auf `/` steht der Hinweis **hinter** den Mode-Cards | Das PROJ-1-Kriterium verlangt Logo, Headline und beide Cards ohne Scrollen auf 360×640; gemessen endet der Inhalt dort bei 559/640px. Davor würde der Hinweis dieses Kriterium brechen, dahinter kostet er nichts. | 2026-09-18 |
| Speicherschlüssel `gq_install_hint_dismissed` mit Zeitstempel | Gleiches Präfix und gleicher Mechanismus wie `gq_first_visit_done` (PROJ-1). Ein Zeitstempel statt eines Wahrheitswerts, weil die 30-Tage-Frist sonst nicht berechenbar wäre. | 2026-09-18 |
| Konstanten (Frist, Speicherschlüssel) in `src/lib/app-nav.ts` | Dort liegen bereits die app-weiten Navigations- und Schalterkonstanten (`KOFI_URL`, `ANLEITUNG_VERFUEGBAR`). Das Modul ist bewusst kein Client-Modul und aus Server- wie Client-Komponenten importierbar. | 2026-09-18 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

**Entworfen am:** 2026-09-18

### Der Kern in einem Satz

Vier neue Dateien und zwei kleine Ergänzungen an bestehenden Dateien — **kein neues Paket, kein Backend, keine neue Route im App-Router**. Die App bleibt, was sie ist; sie bekommt Metadaten, Icons und einen Hinweis.

### Was gebaut wird (Struktur)

```
Manifest & Metadaten
+-- src/app/manifest.ts              [NEU]  Name, Icons, Start-URL, Portrait, Farben
+-- src/app/layout.tsx               [ERW]  apple-touch-icon fuer iOS

App-Icons (einmalig erzeugt, eingecheckt)
+-- public/icons/icon-192.png        [NEU]  Homescreen, kleine Darstellung
+-- public/icons/icon-512.png        [NEU]  Splash, Store-Ansichten
+-- public/icons/icon-maskable.png   [NEU]  Android-Maskierung, mit Sicherheitsrand
+-- public/icons/apple-touch-icon.png[NEU]  iOS (wertet Manifest-Icons nicht aus)

Service Worker & Offline-Seite
+-- public/sw.js                     [NEU]  ~40 Zeilen, cacht NUR offline.html
+-- public/offline.html              [NEU]  Eigenstaendig, ohne React/Next/Schriften

Installations-Hinweis
+-- src/hooks/use-install-prompt.ts  [NEU]  Wann darf der Hinweis erscheinen?
+-- src/components/install-hint.tsx  [NEU]  Die Karte selbst (Android + iOS)
+-- src/lib/app-nav.ts               [ERW]  Konstanten (Frist, Speicherschluessel)
+-- src/app/page.tsx                 [ERW]  Hinweis auf dem Startscreen
+-- src/app/play/page.tsx            [ERW]  Hinweis in der Quest-Liste
```

### Wo der Hinweis im Bild sitzt

```
Startscreen /                        Quest-Liste /play
+-- Burger-Menu (absolut)            +-- Backdrop
+-- Logo-Lockup                      +-- Kopfzeile (Zurueck)
+-- Headline                         +-- "Meine Quests" + Meta
+-- Mode-Card "Deine Quests"         +-- >> Installations-Hinweis <<
+-- Mode-Card "Quest Creator"        +-- Filter-Tabs
+-- >> Installations-Hinweis <<      +-- Quest-Karten
+-- Erststart-Dialog (Vorrang)       +-- Import-Button (schwebend)
```

**Unten im Fluss, nicht schwebend.** Das Design System verbietet Bottom-Navigation und Tab-Bars; ein fixierter Banner am unteren Rand laese sich genau als solche. Der Hinweis ist eine normale Karte im Seitenfluss — er schiebt nichts weg und verdeckt nichts.

Auf `/` steht er **hinter** den Mode-Cards. Grund: Das Kriterium aus PROJ-1 verlangt Logo, Headline und beide Cards ohne Scrollen auf 360x640; gemessen endet der Inhalt dort heute bei 559 von 640px. Ein Hinweis davor wuerde dieses Kriterium brechen, dahinter kostet er nichts — wer ihn sehen will, scrollt, und wer spielen will, tippt vorher.

### Die drei Zustaende des Hinweises

```
                      Kann der Browser installieren?
                       /                          \
                     ja                           nein
                     |                              |
        Android/Chrome        iOS Safari         (nichts anzeigen)
        (beforeinstallprompt) (kein Event)
                     |              |
        [Installieren]-Button   Kurzanleitung
        oeffnet nativen Dialog  "Teilen -> Zum Home-Bildschirm"
```

Erkennung in drei Stufen, jede fuer sich pruefbar:

1. **Laeuft die App schon installiert?** (`display-mode: standalone`) -> Hinweis nie zeigen.
2. **Wurde er weggeklickt und ist die Frist noch nicht um?** -> nicht zeigen.
3. **Gibt es einen Weg?** Android liefert das Event; iOS wird an Plattform-Signalen erkannt. Sonst: nichts zeigen.

**Die iOS-Erkennung nutzt bewusst dieselbe Lehre wie BUG-6** (PROJ-3, 2026-09-07): Ein einzelnes Merkmal genuegt nicht. Dort schloss `isIOS()` allein aus der Existenz von `requestPermission` auf iOS — und lag auf Desktop-Chrome falsch, was dem Spieler einen Button anbot, der garantiert fehlschlug. Hier gilt dasselbe Muster: iOS wird an mehreren Signalen zusammen erkannt (Plattform-Kennung, Touch-Punkte, Abwesenheit des Android-Events), und im Zweifel wird **nichts** angezeigt. Ein ausbleibender Hinweis ist harmlos; ein Hinweis mit einer Anleitung, die auf dem Geraet nicht funktioniert, ist der Fehler, den BUG-6 beschrieb.

### Daten — was gespeichert wird

```
Ein einziger Eintrag im Browser-Speicher:

  Schluessel:  gq_install_hint_dismissed
  Inhalt:      Zeitpunkt des Wegklickens
  Lebensdauer: 30 Tage, danach darf der Hinweis erneut erscheinen

Kein Server. Keine Uebertragung. Keine Geraete-Kennung.
Gleicher Ort und gleiches Muster wie `gq_first_visit_done` (PROJ-1).
```

Ist der Browser-Speicher blockiert oder voll, faellt der Hinweis still auf „fuer diese Sitzung weg" zurueck — genau wie der Erststart-Dialog heute (Edge Case 4).

**Das Manifest speichert nichts.** Es beschreibt die App: Name „Geo Quest", Start-URL `/`, Anzeige im Vollbild, Hochformat, Hintergrund und Statusleiste in Deep Black, dazu die Icon-Liste.

### Der Service Worker — was er tut und was ausdruecklich nicht

```
Anfrage vom Browser
        |
        v
  Ist es eine Seitennavigation?
    /                    \
  nein                   ja
   |                      |
  durchreichen       aus dem Netz holen
  (nichts anfassen)        |
                      klappt es?
                       /      \
                     ja       nein (kein Netz)
                     |          |
                 ausliefern   offline.html aus dem Cache
```

**Der Cache enthaelt genau eine Datei: `offline.html`.** Kein HTML der App, kein CSS, kein JavaScript, keine Schriften, keine Kartenkacheln, keine Medien. Damit ist das PRD-Non-Goal „Kein Offline-Modus" nicht nur eingehalten, sondern strukturell unmoeglich zu verletzen — es gibt nichts, woraus die App offline zusammengesetzt werden koennte.

**Warum es ihn trotzdem gibt:** Chrome auf Android bietet den Installationsweg nur an, wenn ein Service Worker mit Netz-Handler registriert ist. Ohne ihn waere eine der beiden PRD-Hauptplattformen gar nicht installierbar.

**Aktualisierung:** Der Service Worker uebernimmt bei jedem Deploy sofort. Er haelt nichts fest, was veralten koennte, und die installierte App hat keine Adressleiste, mit der ein Nutzer ein haengendes Update erzwingen koennte.

### Die Offline-Seite

Eine eigenstaendige HTML-Datei mit eingebettetem CSS. Sie darf **nichts** nachladen — nicht React, nicht Next.js, nicht die Google-Schriften (die in genau diesem Moment ebenfalls nicht laden wuerden). Deshalb: Systemschriften, Farben als feste Werte, ein Button.

Inhalt: Pin-Icon, die Aussage „Geo Quest braucht eine Internetverbindung zum Starten", ein „Erneut versuchen"-Button. Sie sagt ausdruecklich nicht „du bist offline" — das laese sich als „sonst ginge es auch offline" verstehen und waere ein Versprechen, das das Produkt nicht haelt.

Preis dieser Entscheidung, offen benannt: Die Farben stehen dort ein zweites Mal und koennen bei einem Redesign auseinanderlaufen. Akzeptiert, weil die Alternative (die App-Shell cachen) das Non-Goal bricht.

### Die Icons — gemessen, nicht geschaetzt

Das gelieferte `geoquest_pwaIcon.jpeg` (1024x1024) wurde vermessen:

| Befund | Messwert |
|--------|----------|
| Weisser Rand um die Kachel | links 55px, rechts 54px, oben 61px |
| Kachel bereits abgerundet | ja — wuerde nach der OS-Maskierung als Icon-im-Icon erscheinen |
| Pin-Motiv (mit Route und X) | x 62..392, y 250..670 |
| Freie Spalte zwischen Pin und Schriftzug | **x 392..401** — saubere Schnittkante |

**Ergebnis: Der Pin laesst sich sauber freistellen** — mit `sips`, das auf jedem Mac vorhanden ist. Ein Probeschnitt (330x420 ab x=62, y=250) zeigt Pin, gestrichelte Route und X vollstaendig, ohne einen Buchstabenrest und ohne weissen Rand. **Damit ist Open Question 1 der Spec geschlossen: keine Zulieferung noetig.**

Daraus entstehen vier PNGs auf Deep Black:

```
icon-192 / icon-512 (purpose "any")
+-- Pin randlos, fuellt die Flaeche weitgehend aus

icon-maskable (purpose "maskable")
+-- Pin kleiner, innerhalb der inneren 80%
+-- Aussen ringsum Deep Black als Opferzone fuer die OS-Maskierung

apple-touch-icon
+-- wie icon-192, weil iOS die Manifest-Icons nicht in allen Versionen auswertet
```

Erzeugt wird einmalig; die Dateien werden eingecheckt. Kein `sharp`, keine Build-Zeit-Generierung fuer Dateien, die sich praktisch nie aendern.

### Technologie-Entscheidungen, PM-lesbar

| Entscheidung | Warum |
|---|---|
| **Manifest als `manifest.ts`, nicht als JSON-Datei** | Next.js 16 kennt diese Datei als eigene Metadaten-Route. Vorteil gegenueber einer handgepflegten JSON-Datei: Tippfehler in Feldnamen fallen beim Bauen auf, nicht erst im Browser. Die Datei bleibt im Code neben dem Rest der App. |
| **Kein PWA-Paket (serwist, next-pwa)** | Waeren ~15 neue Pakete plus Build-Plugin, um eine einzige Datei zu cachen. Beide cachen ausserdem standardmaessig die App-Shell — also genau das, was das PRD ausschliesst; man muesste ihre Kernfunktion erst abschalten. Ein handgeschriebener Service Worker von ~40 Zeilen ist hier kleiner, lesbarer und pruefbar. |
| **Icons eingecheckt statt zur Build-Zeit erzeugt** | Der Build bleibt unveraendert schnell, das Ergebnis ist im Repository sichtbar und aenderst sich nie unbemerkt. |
| **Offline-Seite als statische HTML-Datei** | Sie muss funktionieren, wenn die App gar nicht geladen werden konnte — also ohne React, ohne Next.js, ohne nachgeladene Schriften. |
| **Hinweis im Seitenfluss, nicht fixiert** | Das Design System verbietet Bottom-Navigation; ein fixierter Banner laese sich als solche. |
| **Ein eigener Hook fuer die Anzeige-Logik** | „Darf der Hinweis erscheinen?" haengt an vier Bedingungen und wird an zwei Orten gebraucht. Als Hook steht die Regel einmal da und ist ohne Browser testbar — die Luecke, durch die BUG-6 live gehen konnte, war ein ungetesteter Hook. |

### Abhaengigkeiten

**Keine.** Keine neue Laufzeit-Abhaengigkeit, keine neue Entwicklungs-Abhaengigkeit. Die Icon-Erzeugung nutzt `sips` (Teil von macOS) und laeuft einmalig von Hand, nicht im Build.

Das Projekt haelt seine 41 Abhaengigkeiten bewusst klein; dieses Feature erhoeht die Zahl nicht.

### Was das Frontend beachten muss

1. **Erststart-Dialog hat Vorrang** (Edge Case 13). Der Hinweis erscheint erst, wenn der Dialog geschlossen ist — sonst liegen zwei Aufforderungen uebereinander.
2. **PROJ-1-Kriterium bleibt messbar.** Nach dem Einbau auf 360x640 pruefen, dass Logo, Headline und beide Mode-Cards weiter ohne Scrollen sichtbar sind.
3. **Der Hook braucht Unit-Tests.** Vier Bedingungen, davon eine zeitabhaengig (30-Tage-Frist) — genau die Art Logik, die im Browser schwer und im Test leicht zu pruefen ist.
4. **Die iOS-Erkennung nicht an einem einzigen Merkmal aufhaengen** (BUG-6). Im Zweifel nichts anzeigen.
5. **Service Worker nur im sicheren Kontext registrieren.** Lokal ueber `localhost`, in Produktion ueber HTTPS; sonst still nichts tun (Edge Case 12).
6. **`public/assets/geoquest_pwaIcon.jpeg` ist noch nicht eingecheckt** — gehoert mit ins Repository, weil die Icons daraus stammen.
7. **Playwright kann den Standalone-Modus nicht vollstaendig nachstellen.** Pruefbar sind Manifest-Inhalt, Icon-Erreichbarkeit, Service-Worker-Registrierung, Offline-Verhalten und die Anzeige-Logik des Hinweises. Das echte Homescreen-Icon bleibt Augenschein.

## Implementation Notes (Frontend)

**Umgesetzt am:** 2026-09-19

### Was gebaut wurde

Elf Dateien, davon fünf Ergänzungen an bestehenden. **Kein neues Paket** — die Abhängigkeitszahl bleibt bei 41, wie in der Architektur zugesagt.

```
NEU
  src/app/manifest.ts                     Manifest als Metadaten-Route
  src/hooks/use-install-prompt.ts         Anzeige-Logik (4 Bedingungen)
  src/hooks/use-install-prompt.test.ts    33 Unit-Tests
  src/components/install-hint.tsx         Die Karte (Android + iOS + kompakt)
  src/components/service-worker-registration.tsx
  public/sw.js                            91 Zeilen, cacht NUR offline.html
  public/offline.html                     Eigenständig, ohne React/Next/Schriften
  public/icons/{icon-192,icon-512,icon-maskable,apple-touch-icon}.png
  scripts/make-pwa-icons.swift            Erzeugt die Icons reproduzierbar
  tests/proj-12-pwa-installation.spec.ts  31 E2E-Tests

ERWEITERT
  src/app/layout.tsx                      apple-touch-icon + SW-Registrierung
  src/app/page.tsx                        Hinweis (kompakt)
  src/app/play/page.tsx                   Hinweis (volle Karte)
  src/lib/app-nav.ts                      Speicherschlüssel + 30-Tage-Frist
  src/components/first-visit-dialog.tsx   Schlüssel exportiert + Schließ-Ereignis
  playwright.config.ts / .prod.config.ts  serviceWorkers: 'block'
```

### Die Icons — gemessen statt geschätzt

Die Architektur schätzte das Pin-Motiv auf x 62..392, y 250..670. Per Pixel-Analyse (Swift/CoreGraphics, `scripts/make-pwa-icons.swift`) nachgemessen: **x 90..391, y 276..670**. Die von der Architektur gefundene motivfreie Spalte bei **x 392..401** ist exakt bestätigt — die Schnittkante stimmt.

**Eine Abweichung vom Plan, die im Augenschein nötig wurde:** Die Architektur sah Deep Black (`#0B0F12`) als Icon-Grund vor. Gemessen liegt der Grund des Quellbilds bei **rgb(4,10,11)** — dunkler als der Token. Mit `#0B0F12` war an der Zuschnittkante ein deutliches Rechteck sichtbar (Screenshot geprüft). Die Fläche bekommt jetzt den gemessenen Wert; optisch ist er von Deep Black nicht zu unterscheiden, aber die Kante verschwindet.

`sips` allein reichte nicht: Es padded nur einseitig und kann nicht zentriert compositen. Stattdessen ein einmaliges Swift-Skript über CoreGraphics — ebenfalls ohne jede Abhängigkeit, da `swift` auf jedem Mac liegt. Das Skript ist eingecheckt, die Ableitung damit reproduzierbar statt einmalig von Hand.

Die Sicherheitszone ist **nachgemessen, nicht behauptet**: Das maskable-Icon hält das Motiv bei x 139..372, y 103..408 von 512 — vollständig innerhalb der inneren 80% (51..460). Kein Motivpixel liegt bei irgendeiner Variante außerhalb einer Kreismaske.

### Der Konflikt, den die Architektur nicht vorhergesehen hat

Die Architektur schrieb: Auf `/` steht der Hinweis hinter den Mode-Cards, „dahinter kostet er nichts" — begründet damit, dass der Inhalt auf 360×640 bei 559/640 endet.

**Gemessen stimmt das nicht.** Die volle Hinweis-Karte ist **195px** hoch und ließ die Seite auf **799px** wachsen. Beide Mode-Cards blieben zwar sichtbar, aber der bestehende PROJ-1-Test prüft schärfer: `document.documentElement.scrollHeight > window.innerHeight` — der Startscreen darf **gar nicht scrollen**. Zwei Tests fielen (`proj-1-navigation-qa`, `proj-1-startscreen-refinement`), zuerst nur auf WebKit.

Das Kriterium ist älter als dieses Feature und hat Vorrang. Nach Rückfrage beim Betreiber: **kompakte Fassung auf `/`**. Der Hinweis trägt dort nur eine Zeile — kein Eyebrow, keine Display-Überschrift, kein Beschreibungstext — und misst **exakt 44px** (das Tap-Ziel-Minimum). Damit endet die Seite bei **640 von 640**: kein Scroll, Kriterium gehalten. Auf `/play` gibt es kein solches Kriterium, dort steht die volle Karte.

### Der zweite Konflikt: Service Worker vs. Playwright

Nach dem Einbau fielen **6 Tests in PROJ-4 und PROJ-7**, die externe Dienste per `page.route` mocken. Die Ursache ist gemessen, nicht vermutet: Sobald der Service Worker die Seite kontrolliert (`navigator.serviceWorker.controller !== null`), **greift `page.route` nicht mehr** — die Sonde zeigte 0 Treffer im Mock und eine Antwort der echten Nominatim-API (erkennbar am OSM-Lizenztext).

Das ist eine bekannte Playwright-Grenze; die Bibliothek empfiehlt in ihrer eigenen Typdefinition ausdrücklich `serviceWorkers: 'block'`. Beide Configs setzen das jetzt. Die PROJ-12-Suite hebt es per `test.use({ serviceWorkers: "allow" })` für sich wieder auf — dort ist der Worker der Prüfgegenstand.

Gegenprobe gefahren: Ohne die Änderung fallen die 6 Tests, mit ihr laufen alle 74 durch. Das Produkt war in allen 6 Fällen richtig.

### Abweichungen vom Tech Design

1. **Kompakte Hinweis-Fassung auf `/`** (siehe oben) — die Architektur sah nur eine Fassung vor.
2. **`service-worker-registration.tsx` als eigene Komponente.** Die Architektur listete die Registrierung nicht als eigene Datei. Nötig, weil `layout.tsx` eine Server-Komponente bleiben soll — ein `useEffect` dort hätte das gesamte Wurzel-Layout zur Client-Komponente gemacht.
3. **`first-visit-dialog.tsx` musste angefasst werden.** Für Edge Case 13 („Dialog hat Vorrang") braucht der Hinweis ein Signal beim Schließen: `localStorage` löst im selben Tab kein `storage`-Ereignis aus, und Pollen wäre die schlechtere Lösung. Der Dialog feuert jetzt `gq:first-visit-done`.
4. **`scripts/make-pwa-icons.swift` eingecheckt.** Die Architektur sagte „einmalig von Hand mit `sips`". Das Skript macht die Ableitung nachvollziehbar und wiederholbar, ohne etwas zum Build hinzuzufügen.
5. **`useSyncExternalStore` statt `useState` im Effekt.** Die erste Fassung las Anzeigemodus, Frist und Dialog-Zustand in einem `useEffect` und rief dort `setState` — ESLint (`react-hooks/set-state-in-effect`) meldete das als Fehler, zu Recht. Jetzt dasselbe Muster wie in `FirstVisitDialog`.

### Zwei Fehler, die erst beim Messen auffielen

**1. Abgeschnittene Anleitung auf 320px.** Die erste kompakte Fassung lautete „Als App: Teilen → Zum Home-Bildschirm" und brauchte 224px; auf 320px standen 184px zur Verfügung. Der iOS-Nutzer hätte dort eine **halbe Anweisung** gesehen — genau das Gegenteil dessen, wofür der Hinweis da ist. Im Code fiel das nicht auf, weil `truncate` sauber aussieht. Die Fassung heißt jetzt „Teilen → Home-Bildschirm" und passt ab 320px; die vollständige Anleitung mit beiden Schritten steht auf `/play`. Ein eigener Test misst das auf 320px nach.

**2. Blockierter Speicher hielt den Hinweis dauerhaft zurück.**

Bei blockiertem `localStorage` schreibt der Erststart-Dialog seinen Schlüssel nicht — `isFirstVisitPending()` blieb dann dauerhaft `true`, und der Installations-Hinweis wäre in dieser Sitzung **nie** erschienen, obwohl der Dialog längst weg war. Das Schließ-Ereignis gilt jetzt als Beweis für sich. Ein eigener Test hält das fest.

### Testabdeckung

**33 Unit-Tests** (`use-install-prompt.test.ts`) — der Hook, den die Architektur ausdrücklich als testbedürftig markierte, weil „die Lücke, durch die BUG-6 live gehen konnte, ein ungetesteter Hook war". Die Plattform-Erkennung wird gegen sieben echte User-Agent-Strings geprüft, darunter die drei Fälle, die wie iOS-Safari aussehen und keines sind: **Chrome auf iOS, Firefox auf iOS und ein echter Mac** (gleiche UA wie iPadOS, aber 0 Touch-Punkte).

**32 E2E-Tests** (`proj-12-pwa-installation.spec.ts`).

**Drei Gegenproben gefahren**, alle mit dem erwarteten Ergebnis:

| Absichtlicher Fehler | Fallende Tests |
|---|---|
| BUG-6-Muster: iOS an einem Merkmal festmachen | 5 Unit-Tests, darunter Desktop-Chrome |
| App-Shell mitcachen (das PRD-Non-Goal) | „cacht AUSSCHLIESSLICH offline.html" |
| Volle Hinweis-Karte auf `/` | „`/` scrollt auf 360x640 weiterhin nicht" |

### Suiten-Ergebnis

Gegen den **Production-Build** gefahren (`playwright.prod.config.ts`), nicht gegen den Dev-Server.

| Suite | Ergebnis |
|---|---|
| Unit (Vitest) | **219/219** (vorher 186) |
| E2E Chrome 153 | **436 passed / 23 skipped / 0 failed** |
| E2E Mobile Safari | **430 passed / 29 skipped / 0 failed** |
| Build | sauber, `/` `/play` und alle Info-Seiten weiterhin statisch (`○`) |
| Lint | 0 Fehler (7 Warnungen, alle vorbestehend: `<img>` in fremden Komponenten) |

Beide Engines fahren dieselben 459 Tests. Die Skip-Differenz von 6 ist vollständig erklärt: 5 Offline-Navigationstests laufen nur auf Chrome (WebKit-Grenze, siehe oben), 1 iOS-Anleitungstest nur auf WebKit.

Vor diesem Feature lagen die Suiten bei 405/22 (Chrome) und 404/23 (Mobile Safari) — die 32 neuen Tests und ein zusätzlicher Skip je Engine gehen vollständig darin auf.

### Was nicht per Test prüfbar ist

- **Das echte Homescreen-Icon** — bleibt Augenschein auf einem Gerät.
- **Offline-Navigation auf WebKit**: `setOffline(true)` + `page.goto()` wirft dort „WebKit encountered an internal error"; die Navigation erreicht den Service Worker gar nicht. Fünf Tests laufen deshalb nur auf Chrome. Ersatzweise prüft ein eigener Test auf **beiden** Engines, dass `offline.html` mit dem richtigen Inhalt im Cache liegt — die Voraussetzung dafür gilt engineübergreifend.
- **Der echte `beforeinstallprompt`** — Chrome feuert ihn nur nach eigenen Engagement-Heuristiken. Die Tests stellen das Ereignis nach.
- **Standortfreigabe in der installierten iOS-PWA** (Edge Case 7, offene Frage der Spec) — nur auf einem echten iPhone zu klären.

## QA Test Results

**Getestet am:** 2026-09-19
**Getestet gegen:** Production-Build (`next build` + `next start`), nicht den Dev-Server
**Engines:** Google Chrome 153 (echtes Binary via `channel: 'chrome'`) und WebKit (iPhone-13-Profil)

> **Hinweis zur Unabhängigkeit:** Dieses Feature wurde in derselben Sitzung gebaut. Die beiden zentralen Behauptungen der Frontend-Phase — „der Cache enthält nur die Offline-Seite" und „die Icons halten die Sicherheitszone" — wurden deshalb **nicht übernommen, sondern mit eigenen Sonden neu gemessen**.

### Ergebnis in einem Satz

**30 von 31 Acceptance Criteria erfüllt, 1 nicht prüfbar (echtes Gerät nötig), keine Critical- oder High-Bugs. Ein Low-Bug gefunden. Production-Ready: JA.**

### Acceptance Criteria

#### Installierbarkeit (7)

| # | Kriterium | Ergebnis | Nachweis |
|---|---|---|---|
| 1 | Manifest verlinkt, alle Pflichtfelder | **PASS** | Auf allen 7 Routen `<link rel="manifest">`; Felder gemessen |
| 2 | Chrome/Android bietet Installationsweg | **PASS** | Alle 9 Installationsbedingungen erfüllt; SW mit fetch-Handler aktiv |
| 3 | iOS „Zum Home-Bildschirm" mit Icon und Namen | **PASS (technisch)** | `apple-touch-icon` + `apple-mobile-web-app-title` ausgeliefert; die Ablage selbst braucht ein echtes iPhone |
| 4 | Vollbild ohne Adressleiste | **PASS** | `display: standalone` im Manifest |
| 5 | Startet auf `/` mit beiden Mode-Cards | **PASS** | `start_url: "/"`, beide Cards gerendert |
| 6 | Bleibt im Hochformat | **PASS** | `orientation: "portrait"` |
| 7 | Quests und Fortschritt vorhanden | **PASS** | Quest überlebt Reload mit aktivem SW (gemessen: 1 Quest vor und nach) |

#### App-Icons (5)

| # | Kriterium | Ergebnis | Messwert |
|---|---|---|---|
| 8 | Kein weißer Rand, keine doppelte Abrundung | **PASS** | Hellster Randpixel aller vier Icons: **11 von 255**; alle vier Ecken `rgb(3,10,11)` |
| 9 | Pin überlebt Kreis-/Squircle-Maske | **PASS** | **0 Motivpixel** außerhalb der Kreismaske, in allen vier Varianten |
| 10 | Bei 48×48 erkennbar | **PASS** | Auf 48px herunterskaliert und angesehen: Pin, Route und X klar lesbar |
| 11 | 192, 512 und eigene `maskable`-Variante | **PASS** | Alle drei vorhanden, `maskable` ist eine **eigene Datei**, nicht dasselbe Bild mit zwei Zwecken |
| 12 | `apple-touch-icon` gesetzt | **PASS** | `<link rel="apple-touch-icon" sizes="180x180">`, Datei liefert 200 + `image/png` |

Die Sicherheitszone ist unabhängig nachgemessen: Das maskable-Icon hält das Motiv bei **x 139..372, y 103..408** von 512 — vollständig in den inneren 80% (51..460). Die `any`-Icons liegen bewusst darüber, weil sie unbeschnitten dargestellt werden.

#### Hinweis auf die Installation (9)

| # | Kriterium | Ergebnis | Messwert |
|---|---|---|---|
| 13 | Hinweis auf `/` und `/play` | **PASS** | Gezählt je Route: `/`=1, `/play`=1 |
| 14 | Android-Button öffnet nativen Dialog | **PASS** | `preventDefault` **und** `prompt()` nachweislich aufgerufen |
| 15 | iOS erklärt „Teilen → Zum Home-Bildschirm" | **PASS** | Auf echtem WebKit ohne künstliches Event: beide Schritte genannt, **0 Installieren-Buttons** |
| 16 | Kein Hinweis im Standalone-Modus | **PASS** | `/`=0 und `/play`=0 bei `display-mode: standalone` |
| 17 | Wegklicken → 30 Tage Ruhe | **PASS** | Zeitstempel geschrieben; nach 1 / 29 / 29,99 Tagen: kein Hinweis |
| 18 | Nach 30 Tagen wieder angeboten | **PASS** | Bei 30,01 und 31 Tagen: Hinweis wieder da — die Grenze liegt exakt richtig |
| 19 | Kein Hinweis in Quest und Creator | **PASS** | `/create`, `/about`, `/anleitung`, `/impressum`, `/datenschutz` und **`/play/[id]`** je 0 |
| 20 | Tap-Ziele ≥44px, Kontrast ≥4.5:1 | **PASS** | Alle Bedienelemente **44px**; schlechtester Kontrast **6.61:1** |
| 21 | PROJ-1-Kriterium auf 360×640 bleibt erfüllt | **PASS** | Cards enden bei **559/640**, `scrollHeight` = `innerHeight` = **640** — kein Scroll |

#### Verhalten ohne Netz (4)

| # | Kriterium | Ergebnis | Nachweis |
|---|---|---|---|
| 22 | Eigene Seite statt Browser-Fehlerseite | **PASS** | „KEINE VERBINDUNG / Geo Quest braucht eine Internetverbindung, um zu starten." |
| 23 | „Erneut versuchen" versucht neu zu laden | **PASS** | Klick während Offline → bleibt auf der Seite (korrekt) |
| 24 | Mit Netz zurück startet die App | **PASS** | Klick nach `setOffline(false)` → Startscreen mit beiden Mode-Cards |
| 25 | Verspricht **keine** Offline-Fähigkeit | **PASS** | Text enthält „starten"; „offline spielbar", „offline spielen", „offline verfügbar", „du bist offline" kommen **nicht** vor |

#### Aktualisierung (2)

| # | Kriterium | Ergebnis | Nachweis |
|---|---|---|---|
| 26 | Neue Version ohne Fensterschließen | **PASS** | Nach `update()` hängt **kein** Worker in `waiting`; Seite bleibt kontrolliert. Ein untergeschobener Fremd-Cache wird bei echter Aktivierung **entfernt** |
| 27 | Alles aus dem Netz, nur Offline-Seite aus dem Cache | **PASS** | Siehe Kernmessung unten |

#### Keine Regression (5)

| # | Kriterium | Ergebnis | Nachweis |
|---|---|---|---|
| 28 | Alle 7 Routen HTTP 200 | **PASS** | Alle 200, auf beiden Engines |
| 29 | Info-Seiten unverändert | **PASS** | `FAQPage`- und `WebApplication`-JSON-LD vorhanden; Ko-fi exakt 1×/1×/0×/0×; PROJ-14-Prompt weiterhin **nicht** ausgeliefert |
| 30 | Quest spielen funktioniert wie zuvor | **PASS** | Quest-Intro rendert, **0 Seitenfehler**, Cache wächst dabei nicht |
| 31 | Browser ohne SW-Unterstützung | **PASS** | Eigenschaft fehlt → Guard greift, **0 Fehler**. Unsicherer Kontext → still übersprungen, 0 Registrierungen, 0 Fehler |
| 32 | Security-Header unverändert aktiv | **PASS** | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` auf **allen** neuen Dateien |

### Die Kernmessung — unabhängig wiederholt

Die zentrale Behauptung des Features ist, dass das PRD-Non-Goal „Kein Offline-Modus" strukturell eingehalten wird. Eigene Sonde, härter als die Frontend-Tests: alle 7 Routen besucht, zwei davon doppelt, dazu zweimal zurück, einmal vorwärts und ein Reload.

```
CACHE-DUMP: {"geoquest-offline-v1":["/offline.html"]}
```

**Ein Eintrag. Ein Cache-Name.** Zusätzlich nach einem kompletten Quest-Durchlauf mit Karte und Modulen erneut geprüft: unverändert. Dokument-Antworten kamen durchgehend vom Netz (`from: "net"`, Status 200).

### Security-Audit (Red Team)

Der Service Worker ist neue Angriffsfläche — er sitzt zwischen Nutzer und Netz. **Kein Befund.**

| Angriff | Ergebnis |
|---|---|
| Cache-Poisoning über manipulierte URLs (`/play?x=<script>`, `/create?evil=%3Cscript%3E`, Query, Hash) | Cache danach **weiterhin exakt 1 Eintrag** |
| XSS über die Offline-Seite (`?q=<script>alert(1)</script>`, `"><img src=x onerror=...`) | Nichts reflektiert, `alert(1)` und `onerror=` nicht im Dokument |
| Ausführbarer Code auf der Offline-Seite | **0 `<script>`-Tags**, genau **ein** Inline-Handler: `onclick="location.reload()"` |
| Fremde Hosts auf der Offline-Seite | Keine — einzige Fundstelle ist der SVG-Namespace (kein Netzaufruf) |
| Secrets in `sw.js` | Keine; und **keine absolute URL** — der Worker kann keine fremde Origin ansprechen |
| Scope-Ausweitung | Scope ist `http://localhost:3200/`, Skript `/sw.js` — eigene Origin |
| Fremde Ziele im Manifest | Keine; `start_url` und `scope` sind relativ, alle Icons relativ |
| Security-Header auf den neuen Dateien | Alle aktiv, auch auf `sw.js`, `offline.html`, Manifest und Icons |

Positiv erwähnenswert: `sw.js` wird mit `Cache-Control: public, max-age=0` ausgeliefert. Eine neue Worker-Version wird dadurch sofort geholt und kann nicht von einem HTTP-Cache festgehalten werden — genau das, was `skipWaiting` voraussetzt.

### Geprüfte Edge Cases

| Edge Case | Ergebnis |
|---|---|
| 3 — Abbruch des Dialogs zählt als weggeklickt | **PASS** — Hinweis weg, Zeitstempel gesetzt |
| 4 — localStorage blockiert | **PASS** — Hinweis verschwindet für die Sitzung, kein Fehler |
| 5 — Netzausfall **mitten** in der Sitzung | **PASS** — keine Offline-Seite, die App bleibt stehen und bedienbar |
| 12 — Service Worker nicht registrierbar | **PASS** bei fehlender Unterstützung und unsicherem Kontext; **BUG-11** im Sonderfall (siehe unten) |
| 13 — Erststart-Dialog hat Vorrang | **PASS** — Dialog offen: kein Hinweis; nach „Verstanden" rückt er ohne Neuladen nach |

**Zusätzlich geprüft (nicht in der Spec):**

- **HTTP-Fehlerseiten:** Ein 404 zeigt weiterhin die App-eigene Seite „ZIEL NICHT GEFUNDEN", **nicht** die Offline-Seite. Richtig, denn `fetch` wirft nur bei echtem Netzfehler — eine Serverantwort ist kein Offline-Zustand.
- **Abschneiden der kompakten Fassung:** Auf 320px wird auf beiden Engines **kein** Text abgeschnitten.
- **Fremd-Cache beim Versionswechsel:** Wird bei echter Aktivierung entfernt.

### Gefundene Bugs

#### BUG-11 (Low) — ~~Konsolenfehler, wenn eine Erweiterung `navigator.serviceWorker` auf `undefined` setzt~~ **BEHOBEN am 2026-09-19**

**Ort:** `service-worker-registration.tsx` — damals Zeile 22, nach der Behebung [Zeile 33](src/components/service-worker-registration.tsx#L33)

**Beschreibung:** Der Guard lautet `if (!("serviceWorker" in navigator)) return;`. Er prüft, ob die *Eigenschaft existiert* — nicht, ob sie einen Wert hat. Härtungs-Erweiterungen und datenschutzorientierte Browser setzen solche APIs gelegentlich auf `undefined`, statt sie zu löschen. Dann besteht der Guard, und `navigator.serviceWorker.register(...)` wirft.

**Schritte zum Reproduzieren:**
1. `Object.defineProperty(navigator, 'serviceWorker', { get: () => undefined })` vor dem Laden setzen
2. Eine beliebige Seite aufrufen

**Beobachtet:** `TypeError: Cannot read properties of undefined (reading 'register')`, mehrfach pro Seitenaufruf.

**Auswirkung: gering.** Die App bleibt **vollständig bedienbar** — `/`, `/play` und `/create` wurden in diesem Zustand geprüft und funktionieren. Es ist ein Konsolenfehler, kein Funktionsverlust, und er tritt im normalen Betrieb nicht auf: Ein echter Browser ohne Unterstützung lässt die Eigenschaft **weg** (gemessen: `'serviceWorker' in navigator === false`), und dann greift der Guard einwandfrei.

**Mögliche Behebung (eine Zeile):** `if (!navigator.serviceWorker) return;` statt der `in`-Prüfung — deckt beide Formen ab.

**Nicht blockierend.** Kein Nutzer verliert Funktionalität; die `.catch()`-Klausel fängt bereits alles ab, was *nach* diesem Punkt schiefgehen kann.

**Behoben am 2026-09-19.** Die Prüfung fragt jetzt den **Wert** ab (`if (!navigator.serviceWorker) return;`) statt die Existenz der Eigenschaft. Damit sind beide Formen abgedeckt: der echte Browser ohne Unterstützung, der die Eigenschaft weglässt, und die Erweiterung, die sie auf `undefined` setzt.

**Zusätzlich abgesichert, über den gemeldeten Fehler hinaus:** Die Registrierung läuft in der Regel erst beim `load`-Ereignis, also messbar später als die Prüfung im Effekt. In diesem Fenster kann eine Erweiterung die Eigenschaft noch ersetzen. `register()` prüft deshalb ein zweites Mal — der `.catch()` darunter fängt nur abgelehnte Promises, nicht diesen synchronen Zugriff.

**Die eigentliche Lücke war das Fehlen jeden Tests.** Für die drei Wege ohne Service Worker gab es keinen einzigen — genau so konnte BUG-11 entstehen. Jetzt drei Tests im Block „Ohne Service Worker (Edge Case 12)": Eigenschaft fehlt ganz, Eigenschaft ist `undefined`, unsicherer Kontext. Alle drei prüfen nicht nur die Abwesenheit des Fehlers, sondern dass `/`, `/play` und `/create` **bedienbar bleiben**.

**Per Gegenprobe geschärft:** Mit dem alten Guard (`"serviceWorker" in navigator`) fällt **genau der BUG-11-Test**, während die beiden anderen bestehen — der Test trifft den echten Fehler und nicht bloß die Umgebung.

#### Dabei gefunden: ein flakiger Test (kein Produktfehler)

Beim Absichern des BUG-11-Fixes fiel der Test „die Offline-Seite laedt nichts nach" **in 1 von 3 parallelen Läufen** um — in Einzelläufen dagegen nie (6 von 6 grün). Das war kein Produktfehler und auch keine Folge des Fixes: **Die Flakiness steckte schon in der Suite, die in der QA als grün gemeldet wurde** — sie ist dort durch Glück nicht aufgetreten.

Ursache, gemessen statt vermutet: Der Test horchte auf `page.on("request")` und fing dabei Next.js-Prefetches (`/about?_rsc=…`) auf, die ein **anderer, parallel laufender Test** ausgelöst hatte. Über die Offline-Seite sagte das nichts aus.

Behoben, indem der Test jetzt misst, was die Seite **selbst referenziert** (`script[src]`, `link[href]`, `img[src]` plus die Zahl der `<script>`-Tags) statt was während ihrer Anzeige zufällig durchs Netz geht. **5 von 5 parallelen Läufen grün.**

Die Verschärfung ist per Gegenprobe belegt: Lädt die Offline-Seite eine externe Google-Schrift nach, fallen **2 Tests**, darunter dieser. Der Test wurde also nicht stillgelegt, sondern präzisiert.

#### Und noch einer — mit einer unangenehmen Nebenwirkung

Ein **zweiter** Test war flaky: `waitForFunction(() => !!navigator.serviceWorker.controller)` lief im vollen 464-Test-Lauf in ein Timeout, in Einzelläufen nie (5 von 5 grün). Ursache: Ein Service Worker kontrolliert nur Seiten, die **nach** seiner Aktivierung geladen wurden. `clients.claim()` holt das nach, aber unter Last ist das ein Rennen, das länger dauern kann als das Timeout. Fünf Teststellen teilten dieses Muster; sie laufen jetzt über den Helfer `warteAufKontrolle()`, der kurz wartet und notfalls einmal neu lädt.

**Die Gegenprobe deckte dabei ein echtes Problem auf.** Mit dem Reload als Rückfallebene bestand die Suite **auch dann vollständig**, wenn man `skipWaiting()` und `clients.claim()` aus `sw.js` entfernte — der Reload verdeckte den Verlust. Damit wäre das Acceptance Criterion „neue Version ohne Deinstallieren oder Fensterschließen" **unbemerkt ungeschützt** gewesen: Der Worker hätte im Wartezustand hängen können, und niemand hätte es gemerkt.

Behoben durch zwei neue Tests im Block „Sofortige Uebernahme (skipWaiting + claim)", die die Übernahme **ohne Reload** prüfen. Erneute Gegenprobe: Entfernt man die beiden Zeilen aus `sw.js`, **fällt jetzt ein Test** — die Lücke ist zu.

**Beide flakigen Tests steckten bereits in der Suite, die in der QA als grün gemeldet wurde.** Sie sind dort zufällig durchgelaufen. Das ist eine Korrektur der QA-Meldung, kein Fehler im Produkt — angefasst wurde nur Testcode.

### Beobachtungen ohne Bug-Status

**1. 320×568 scrollt — aber schon vorher.** Der Startscreen überläuft auf dem kleinsten Referenz-Viewport. **Das ist kein Regress:** Mit der Fassung vor diesem Feature (Commit `de882fb~1`) gemessen, scrollte er dort bereits (`scrollHeight` 581 bei 568px Höhe). Der Hinweis vergrößert einen vorhandenen Überlauf von 13px auf 65px. Das Spec-Kriterium nennt ausdrücklich 360×640, und dort ist es erfüllt. Passt zur bereits in `INDEX.md` vermerkten Beobachtung, dass 320×568 die Stelle ist, die zuerst kippt.

**2. Firefox bleibt ungetestet.** Das Binary fehlt, obwohl `playwright install --dry-run` es als vorhanden meldet, und es liegt kein Firefox in `/Applications`. Risiko gering: Firefox stellt `beforeinstallprompt` gar nicht bereit und wird von `isIOSSafari()` sicher ausgeschlossen — der Hinweis erscheint dort schlicht nicht, was dem gewünschten Verhalten entspricht (Edge Case 1).

**3. Das echte Homescreen-Icon bleibt Augenschein.** Alles technisch Messbare ist geprüft; wie das Icon auf einem echten iPhone- oder Android-Homescreen zwischen anderen Apps wirkt, kann kein Test beantworten.

**4. `apple-mobile-web-app-status-bar-style: black-translucent`** ist gesetzt. Die Spec führt die Statusleistenfarbe als offene Frage („am echten Gerät zu beurteilen") — vor dem Deploy ein Blick auf einem iPhone wäre sinnvoll.

### Gegenprobe — greifen die Tests wirklich?

Vier absichtlich eingebaute Fehler, jeweils mit dem erwarteten Ergebnis:

| Absichtlicher Fehler | Fallende Tests |
|---|---|
| Standalone-Prüfung entfernt (installierte App bekäme den Hinweis) | 1 — genau der zuständige |
| 30-Tage-Frist auf 3 Tage geändert | 1 — „ist nach 29 Tagen noch true" |
| Offline-Seite verspricht „Deine Quests sind offline spielbar" | **4**, darunter der eigens dafür geschriebene Test |
| BUG-6-Muster: iOS an einem Merkmal festmachen | 5 Unit-Tests (in der Frontend-Phase belegt) |

Die drei `test.skip` der PROJ-12-Suite sind nachvollzogen und **keine stillgelegten Tests**: zweimal eine Engine-Grenze (WebKit kann Offline-Navigation in Playwright nicht nachstellen — unabhängig verifiziert), einmal eine bewusst engine-spezifische Prüfung (iOS-Fassung nur auf WebKit sinnvoll).

### Suiten

| Suite | Ergebnis |
|---|---|
| Unit (Vitest) | **219/219** |
| E2E Chrome 153 | **441 passed / 23 skipped / 0 failed** (Stand nach BUG-11-Fix) |
| E2E Mobile Safari (WebKit) | **435 passed / 29 skipped / 0 failed** (Stand nach BUG-11-Fix) |
| Build | sauber; `/`, `/play` und alle Info-Seiten weiterhin statisch (`○`) |
| Lint | 0 Fehler (7 Warnungen, alle vorbestehend: `<img>` in fremden Komponenten) |

Beide Engines fahren dieselben 464 Tests, beide mit Exit-Code 0 (464 = 441+23 bzw. 435+29). Die Skip-Differenz von 6 ist vollständig erklärt: 5 Offline-Navigationstests laufen nur auf Chrome (WebKit-Grenze), 1 iOS-Test nur auf WebKit.

### Production-Ready: **JA**

Keine Critical- oder High-Bugs. Der einzige Fund (BUG-11) ist ein Konsolenfehler in einem Sonderfall, der keine Funktionalität kostet und im normalen Betrieb nicht auftritt.


## Deployment

**Deployt am:** 2026-09-19
**Production-URL:** https://geoquesty.vercel.app
**Tag:** `v1.30.0-PROJ-12`
**Weg:** Push auf `main` → Vercel deployt automatisch (wie alle bisherigen Deploys dieses Projekts)

### Vor dem Deploy geprüft

| Prüfung | Ergebnis |
|---|---|
| `npm run build` | sauber; `/`, `/play` und alle Info-Seiten weiterhin statisch (`○`) |
| `npm run lint` | 0 Fehler (7 Warnungen, alle vorbestehend: `<img>` in fremden Komponenten) |
| Unit (Vitest) | 219/219 |
| E2E Chrome 153 | 441 passed / 23 skipped / 0 failed, Exit-Code 0 |
| E2E Mobile Safari | 435 passed / 29 skipped / 0 failed, Exit-Code 0 |
| QA-Freigabe | 30/31 Acceptance Criteria, keine Critical/High-Bugs |
| Offene Bugs | keine — BUG-11 vor dem Deploy behoben |
| Secrets im Repo | keine; nur `.env.local.example` ist getrackt |
| Security-Header | aktiv, auch auf `sw.js`, `offline.html`, Manifest und Icons |

_Ergänzt nach der Production-Verifikation._
