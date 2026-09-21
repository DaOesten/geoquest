# PROJ-12: PWA-Installation (Add to Homescreen)

## Status: In Progress
**Created:** 2026-09-18
**Last Updated:** 2026-09-21 (Refinement 4: Safe Area — der Startscreen-Inhalt rückt nicht mit)

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

**Der Befund vom 2026-09-20 (Refinement 3):** Der Betreiber hat die App auf iOS installiert — und dort verdecken Uhrzeit, Batterie und WLAN-Anzeige das Burger-Menu und den Zurück-Pfeil. Im Browser tritt das nicht auf. Das ist kein Zufall, sondern die direkte Folge zweier Zeilen, die dieses Feature gesetzt hat: `statusBarStyle: "black-translucent"` und `viewportFit: "cover"`. Zusammen sagen sie iOS, dass die Seite den gesamten Bildschirm bekommt und die Statusleiste **über** ihr schweben soll. Im Browser hält Safari mit seiner Adressleiste den Platz von selbst frei; installiert fällt sie weg, und der Inhalt beginnt bei y=0 — genau dort, wo die Systemanzeigen stehen. Was fehlt, ist die Gegenleistung für diese Freiheit: **kein einziger Screen liest `env(safe-area-inset-top)`.** Gemessen sind alle vier Safe-Area-Vorkommen im Projekt `inset-bottom`. Siehe Refinement 3.

**Ausgangsmaterial für die Icons:** Der Betreiber hat `public/assets/geoquest_pwaIcon.jpeg` geliefert — 1024×1024, markengetreu. Es ist als Quelle brauchbar, aber **nicht direkt einsetzbar** (siehe Product Decisions): Es trägt einen weißen Rand um eine bereits abgerundete Kachel, und der volle Schriftzug ist bei 48px unleserlich.

## User Stories

- Als **Spieler** möchte ich Geo Quest wie eine App auf meinem Homescreen haben, damit ich sie draußen mit einem Tap starte, statt im Browser nach dem Tab zu suchen.
- Als **Spieler** möchte ich die Quest im Vollbild ohne Browser-Leiste spielen, damit Karte und Richtungspfeil den vollen Bildschirm bekommen.
- Als **Ersteller** möchte ich Geo Quest ebenfalls installieren können, damit ich unterwegs schnell in meine Quests komme.
- Als **Spieler**, der ohne Empfang auf das App-Icon tippt, möchte ich eine verständliche Meldung statt einer Browser-Fehlerseite sehen, damit ich weiß, dass mein Netz das Problem ist und nicht die App.
- Als **Nutzer**, der die App nicht installieren will, möchte ich den Hinweis wegklicken können und in Ruhe gelassen werden, damit er mich nicht bei jedem Besuch stört.
- Als **Betreiber** möchte ich, dass eine neue Version sofort bei allen installierten Nutzern ankommt, damit niemand mit einer veralteten App unterwegs ist, die er nicht per Adressleiste neu laden kann.
- Als **Nutzer der installierten App** möchte ich Burger-Menu und Zurück-Pfeil vollständig sehen und treffen können, obwohl die Statusleiste des Systems über der App schwebt, damit ich in der installierten App genauso navigieren kann wie im Browser. *(Refinement 3, 2026-09-20)*

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
- **Ein Wechsel von `statusBarStyle: "black-translucent"` auf `default`/`black`** *(Refinement 3)* — erwogen und verworfen, siehe Product Decisions. Das wäre ein Einzeiler, nähme aber den randlosen Look zurück, den dieses Feature ausdrücklich gewählt hat.
- **Ein Abfragen des Standalone-Modus im JavaScript, um das Padding nur installiert zu setzen** *(Refinement 3)* — unnötig: `env(safe-area-inset-top)` ist im Browser von selbst `0px`, weil Safari den Platz dort schon freihält. Die Lösung ist damit ohne jede Abfrage modus-abhängig.
- **Querformat-Safe-Areas (linker/rechter Inset)** *(Refinement 3)* — das Manifest erzwingt Portrait; ein Notch am seitlichen Rand kann in diesem Feature nicht auftreten.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Service Worker nur in Production (Refinement 2026-09-20)

- [x] Angenommen ein Entwickler öffnet die App über `localhost` oder `127.0.0.1`, wenn die Seite lädt, dann wird **kein** Service Worker registriert — `navigator.serviceWorker.controller` bleibt `null` und es entsteht kein Cache
- [x] Angenommen die App läuft unter ihrer Produktionsdomain, wenn die Seite lädt, dann registriert sich der Service Worker unverändert wie bisher und der Installationsweg auf Android bleibt erhalten
- [x] Angenommen ein Entwickler öffnet `localhost`, während kein Dev-Server läuft, wenn der Browser die Anfrage stellt, dann zeigt er **seine eigene** Fehlermeldung über den nicht erreichbaren Server — nicht die Geo-Quest-Offline-Seite
- [x] Angenommen auf dem Rechner ist aus einem früheren Besuch noch ein Worker für `localhost` registriert, wenn die App dort erneut geladen wird, dann meldet sie diesen bestehenden Worker aktiv ab und löscht seine Caches, sodass sich das Problem ohne manuellen Eingriff des Entwicklers auflöst
- [x] Angenommen die E2E-Suite läuft gegen den Production-Build auf `localhost:3100`, wenn die PROJ-12-Tests den Service Worker prüfen, dann sind sie weiterhin lauffähig — die Unterscheidung darf **nicht** allein am Hostnamen `localhost` hängen, weil die Suite genau dort einen echten Production-Build testet
- [x] Angenommen die Offline-Seite und das Manifest werden weiterhin ausgeliefert, wenn ein Entwickler sie lokal direkt aufruft, dann sind sie unverändert erreichbar — dieses Refinement ändert nur, **wer den Worker registriert**, nicht welche Dateien existieren

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

### Der Hinweis als schwebendes Overlay (Refinement 2026-09-20)

- [x] Angenommen der Hinweis erscheint auf `/` oder `/play`, wenn seine Position gemessen wird, dann ist er **fixiert am unteren Rand des Viewports** (`position: fixed`) und nicht Teil des Seitenflusses
- [x] Angenommen der Hinweis ist sichtbar, wenn der Nutzer die Seite scrollt, dann **scrollt der Seiteninhalt darunter weiter** und der Hinweis bleibt an seiner Position stehen, bis er weggeklickt wird
- [x] Angenommen der Hinweis ist sichtbar, wenn die Seitenhöhe gemessen wird, dann **hat er die Höhe des Dokuments nicht verändert** — er verdrängt keinen Inhalt und erzeugt keinen Scrollbalken, wo vorher keiner war
- [x] Angenommen der Hinweis erscheint auf `/` auf 360×640, wenn der Startscreen betrachtet wird, dann **scrollt die Seite weiterhin gar nicht** und alle vier Elemente aus dem PROJ-1-Kriterium bleiben sichtbar
- [x] Angenommen der Hinweis ist sichtbar, wenn sein Inhalt betrachtet wird, dann trägt er **genau eine Zeile** — auf Android Icon, Kurztext und Installieren-Weg, auf iOS Safari Icon und die Kurzanleitung „Teilen → Home-Bildschirm" — ohne Eyebrow, ohne Überschrift, ohne Beschreibungsabsatz
- [x] Angenommen der Hinweis ist auf beiden Plattformen sichtbar, wenn seine Höhe gemessen wird, dann ist sie **auf Android und iOS gleich** (eine Zeile je Plattform)
- [x] Angenommen der Hinweis ist auf `/play` sichtbar, wenn der schwebende Import-Button betrachtet wird, dann **liegt dieser vollständig über dem Hinweis** und beide sind unverdeckt bedienbar; klickt der Nutzer den Hinweis weg, rückt der Import-Button an seine gewohnte Position zurück
- [x] Angenommen der Hinweis erscheint auf einem Gerät mit unterer Systemleiste (iPhone mit Home-Indikator), wenn er gemessen wird, dann liegt sein Inhalt **oberhalb der Safe Area** und wird nicht vom Systembereich überlagert
- [x] Angenommen der Hinweis ist sichtbar, wenn ein Sheet, Dialog oder das Burger-Menu geöffnet wird, dann **liegt der Hinweis darunter** und blockiert keine Bedienelemente dieser Ebenen
- [x] Angenommen der Nutzer scrollt auf `/play` ans Listenende, wenn der Hinweis sichtbar ist, dann **bleibt die letzte Quest-Karte erreichbar** und wird nicht dauerhaft vom Hinweis verdeckt

### Safe Area — die Systemleisten verdecken nichts (Refinement 2026-09-20)

- [ ] Angenommen die App ist auf einem iPhone mit Notch/Dynamic Island installiert, wenn ein Screen mit Kopfzeile geöffnet wird (`/play`, `/create`, Quest-Detail, Station-Detail, Station-Liste, Module, Navigation), dann liegen Zurück-Pfeil und Burger-Menu **vollständig unterhalb** der Statusleiste und sind in ganzer Fläche antippbar
- [ ] Angenommen die App ist installiert, wenn der Startscreen `/` geöffnet wird, dann liegt das schwebende Burger-Icon vollständig unterhalb der Statusleiste
- [ ] Angenommen die App ist installiert, wenn eine Info-Seite (`/about`, `/anleitung`, `/impressum`, `/datenschutz`) geöffnet und gescrollt wird, dann liegt die Sticky-Kopfzeile in jedem Scroll-Zustand unterhalb der Statusleiste
- [ ] Angenommen dieselben Screens werden **im Browser** geöffnet, wenn sie mit dem Zustand vor dieser Änderung verglichen werden, dann ist die Darstellung **unverändert** — kein zusätzlicher Abstand oben, keine verschobenen Elemente
- [ ] Angenommen die App ist installiert, wenn ein Screen mit Kopfzeile geöffnet wird, dann reicht die Hintergrundfläche der Kopfzeile (Blur bzw. Backdrop) **bis zur obersten Bildschirmkante** — die Statusleiste steht nicht auf blankem Inhalt und es entsteht kein durchsichtiger Spalt über der Kopfzeile
- [ ] Angenommen die App ist installiert, wenn ein Screen mit Kopfzeile geöffnet wird, dann bleibt die Kopfzeile selbst 56px hoch — der Inset kommt **zusätzlich** hinzu und staucht keinen Inhalt
- [ ] Angenommen die App ist auf einem iPhone mit Home-Indikator installiert, wenn ein Creator-Screen mit schwebendem Aktions-Button geöffnet wird (`/create`, Quest-Detail, Station-Detail), dann liegt der Button vollständig oberhalb des Home-Indikators
- [ ] Angenommen die App ist installiert, wenn ein Player-Screen geöffnet wird (Navigation, Ankunft, Module, Outro), dann liegt kein Bedienelement unter dem Home-Indikator
- [ ] Angenommen ein Gerät ohne Notch und ohne Home-Indikator (älteres iPhone, Android mit Tastenleiste), wenn die installierte App geöffnet wird, dann entsteht **kein** zusätzlicher Leerraum oben oder unten — der Inset ist dort `0px`

### Safe Area — auch der Inhalt rückt mit (Refinement 4, 2026-09-21)

- [ ] Angenommen die App ist auf einem iPhone mit Notch/Dynamic Island installiert, wenn der Startscreen `/` geöffnet wird, dann liegt das **Logo** vollständig unterhalb der Statusleiste
- [ ] Angenommen dieselbe Lage, wenn `/` geöffnet wird, dann liegen auch Headline, Trennstrich, Untertitel und beide Mode-Cards unterhalb der Statusleiste
- [ ] Angenommen dieselbe Lage, wenn `/` geöffnet wird, dann rückt das Burger-Icon **weiterhin** korrekt nach (Refinement 3 bleibt erfüllt)
- [ ] Angenommen `/` wird **im Browser** geöffnet, wenn mit dem Zustand vor dieser Änderung verglichen wird, dann ist die Darstellung unverändert — Logo weiterhin bei y=24, Burger bei y=12
- [ ] Angenommen ein Gerät mit 360×640, wenn `/` installiert geöffnet wird, dann bleiben Logo, Headline und beide Mode-Cards ohne Scrollen sichtbar (bestehendes PROJ-1-Kriterium)

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

15. **Entwickler öffnet `localhost`, während kein Dev-Server läuft** → Bisher zeigte der Browser die Geo-Quest-Offline-Seite, weil der Service Worker die Navigation abfing und aus dem Cache antwortete. Das sah aus wie ein Produktfehler, war aber korrektes Verhalten am falschen Ort. **Nach diesem Refinement registriert sich der Worker lokal gar nicht mehr** — der Browser zeigt seine eigene „Server nicht erreichbar"-Meldung, die den wahren Grund nennt.

16. **Ein anderes Projekt läuft auf demselben `localhost`** → Der Service-Worker-Scope ist die **Origin**, nicht der Port. Ein auf `localhost` registrierter Worker galt damit für jedes Projekt auf jedem Port dieser Maschine — ein fremdes Projekt mit kurz gestopptem Server zeigte die Offline-Seite von Geo Quest. Nach diesem Refinement kann das nicht mehr entstehen.

17. **Ein bereits registrierter Worker aus einem früheren Besuch lebt lokal weiter** → Die Änderung verhindert **neue** Registrierungen, entfernt aber keine bestehende. Wer die App vor diesem Refinement lokal geöffnet hat, trägt den Worker weiter, bis er ihn löscht (Safari: Entwickler → Caches leeren, oder Einstellungen → Datenschutz → Website-Daten verwalten → `localhost` entfernen; Chrome: DevTools → Application → Service Workers → Unregister). Deshalb muss die Unregistrierung aktiv passieren, statt auf den Ablauf zu warten — siehe Acceptance Criteria.

18. **Sehr kurzer Viewport im Querformat** (z.B. 640×360) → Das Overlay nimmt eine Zeile am unteren Rand ein. Auf `/play` bleibt die Liste scrollbar, auf `/` gilt das Nicht-Scrollen-Kriterium nur für 360×640 (Hochformat). Der Hinweis bleibt wegklickbar — wem er im Weg ist, der schließt ihn.

19. **Der Nutzer scrollt auf `/play` ans Listenende** → Das Overlay schwebt über dem Listenende und könnte die letzte Quest-Karte verdecken. Die Liste bekommt deshalb unteren Freiraum in Höhe des Overlays, solange es sichtbar ist; nach dem Wegklicken fällt er weg. Alternative — die Liste dauerhaft mit Freiraum ausstatten — wurde verworfen: Das hinterließe eine unerklärliche Lücke, sobald der Hinweis weg ist.

20. **Das Overlay trifft auf eine andere schwebende Ebene** (Burger-Menu, Sheet, Erststart-Dialog) → Der Hinweis liegt unter diesen Ebenen. Für den Erststart-Dialog greift ohnehin schon Edge Case 13 (Vorrang, der Hinweis erscheint erst nach dem Schließen); für Menu und Sheets entscheidet die Stapelreihenfolge. Das Burger-Menu liegt bei `z-[1100]`, der Import-FAB bei `z-40` — der Hinweis ordnet sich dazwischen ein.

21. **Gerät mit unterer Systemleiste** (iPhone mit Home-Indikator, Android-Gestenleiste) → Das Overlay respektiert die Safe Area; sein Inhalt endet oberhalb des Systembereichs. Ohne das läge das Schließen-X teilweise unter der Gestenleiste und wäre schwer zu treffen. Das Wurzel-Layout setzt `viewportFit: "cover"` bereits, die nötige Information liegt also vor.

22. **Gerät ohne Notch, ohne Home-Indikator** (iPhone SE, Android mit Tastenleiste, jeder Desktop) *(Refinement 3)* → `env(safe-area-inset-top)` meldet `0px`, die Kopfzeile sitzt exakt wie heute. Das ist keine Sonderbehandlung, sondern das definierte Verhalten der Funktion — es braucht **keine** Fallunterscheidung im Code. Der naheliegende Fehler wäre eine feste Ersatzhöhe („44px auf iOS"), die auf genau diesen Geräten einen leeren Streifen erzeugt.

23. **Dieselben Screens im Browser statt installiert** *(Refinement 3)* → Unverändert. Safari hält den Platz unter seiner Adressleiste schon frei und meldet deshalb keinen oberen Inset; `statusBarStyle` liest es außerhalb des Standalone-Modus gar nicht erst. Beide Mechanismen sind von sich aus modus-abhängig — es darf **keine** Standalone-Abfrage im JavaScript geben, die dasselbe noch einmal nachbaut und dabei auseinanderlaufen kann.

24. **Der Nutzer dreht das Gerät** *(Refinement 3)* → Das Manifest erzwingt Portrait, der Fall tritt in der installierten App nicht auf. Im Browser ist Querformat möglich; dort ist der obere Inset ohnehin `0px`. Seitliche Insets werden bewusst nicht behandelt (siehe Out of Scope).

25. **Ein Sheet oder Dialog öffnet sich** (Stations-Editor, Modul-Editor, Erststart-Dialog, Burger-Menu) *(Refinement 3)* → Diese Ebenen beginnen nicht an der obersten Kante: Sheets fahren von unten ein, das Menu-Panel ist eine eigene Fläche. Sie brauchen den oberen Inset nicht. Die eine Ausnahme wäre ein Sheet, das über die volle Höhe geht — `SheetContent` ist `h-[92dvh]` und lässt oben 8% frei, auf 844px rund 67px. Das deckt den größten iOS-Inset (59px) ab; zu prüfen, nicht anzunehmen.

26. **Der Player-Navigations-Screen unten** *(Refinement 3)* → `min-h-[100dvh]` mit `justify-center` zentriert den Inhalt, statt ihn an den unteren Rand zu hängen — der „Station entdecken"-Button dürfte den Home-Indikator gar nicht erreichen. Das ist eine Ableitung aus dem Markup, **keine Messung**; am Gerät zu bestätigen. Bestätigt betroffen sind dagegen die drei Creator-FABs (siehe Technical Requirements).

27. **Ein Screen ohne Kopfzeile** *(Refinement 4)* → `/` ist der einzige. Sein Burger-Icon ist `absolute` und kostet 0px Layout-Höhe (BUG-10) — es kann deshalb per Konstruktion nichts nach unten schieben. Ein Inset am Icon-Wrapper bewegt nur das Icon; der Inhalt braucht seinen eigenen am `<main>`. Wird künftig ein weiterer Screen ohne Kopfzeile gebaut, gilt dasselbe.

28. **320×568 mit Inset** *(Refinement 4)* → Die Seite scrollt. Sie tut das aber **schon heute ohne Inset** um 13px (vorbestehend, seit 2026-09-19 dokumentiert); ein realistischer Inset für dieses Gerät sind 20px (iPhone SE, Home-Button, keine Notch), nicht die 59px von Dynamic Island. Das Nicht-Scrollen-Kriterium nennt 360×640, und dort ist es erfüllt.

## Technical Requirements

- **Kein Backend, keine neuen Netzabhängigkeiten** — alle neuen Dateien werden von der eigenen Domain ausgeliefert
- **Kein neues Laufzeit-Paket**, sofern vermeidbar — das Projekt hält seine Abhängigkeiten bewusst klein
- **Die Startzeit darf nicht steigen** — PRD-Vorgabe: < 2s Ladezeit. Die Info-Seiten sind heute statisch (0,07–0,09s); das muss so bleiben
- **Der Service Worker cacht ausschließlich die Offline-Fallback-Seite** — kein HTML, CSS, JS, keine Schriften, keine Kartenkacheln, keine Medien
- **Der Service Worker übernimmt bei jedem Deploy sofort die Kontrolle** — kein Warten auf geschlossene Tabs
- **HTTPS** — Service Worker laufen nur im sicheren Kontext; in der Produktion durch Vercel gegeben, lokal über `localhost`
- **Der Service Worker registriert sich ausschließlich in Production** (Refinement 2026-09-20) — auf dem lokalen Dev-Server nicht; zusätzlich meldet die App einen dort bereits registrierten Worker aktiv ab und löscht dessen Caches. Die Unterscheidung läuft über `process.env.NODE_ENV`, **nicht** über den Hostnamen, weil die E2E-Suite den Production-Build auf `localhost:3100` testet
- **Browser-Support:** Chrome (Android/Desktop) und Safari (iOS/macOS) müssen den Installationsweg bieten; Firefox und Edge müssen die App **fehlerfrei ohne** Installationsangebot darstellen
- **Kontrast mindestens 4.5:1 und Tap-Ziele mindestens 44×44px** für alle neuen Bedienelemente (PRD/WCAG-AA-Vorgabe) — auch auf der Offline-Seite
- **Die Offline-Seite kommt ohne JavaScript-Framework aus** — sie muss funktionieren, wenn die App gar nicht geladen werden konnte, und darf deshalb nicht von React oder Next.js abhängen
- **Icons als PNG**, abgeleitet aus `public/assets/geoquest_pwaIcon.jpeg`; das Quellbild bleibt im Repository
- **Das `maskable`-Icon hält die inneren 80% als Sicherheitszone frei** (Android-Maskierung)
- **Die bestehenden Security-Header bleiben unverändert** und müssen auch für Manifest, Service Worker und Icons gelten
- **Der Installations-Hinweis ist `position: fixed` am unteren Rand** (Refinement 2026-09-20) und darf die Dokumenthöhe nicht verändern — messbar daran, dass `scrollHeight` mit und ohne sichtbaren Hinweis identisch ist
- **Der Hinweis respektiert die untere Safe Area** (`env(safe-area-inset-bottom)`); das Wurzel-Layout setzt `viewportFit: "cover"` bereits
- **Der Hinweis ordnet sich unter Menu und Sheets ein, über dem Import-FAB** — konkret zwischen `z-40` (FAB) und `z-[1100]` (Burger-Menu)
- **Der Import-FAB auf `/play` weicht dem Hinweis aus**, solange dieser sichtbar ist, und kehrt beim Wegklicken an seine Position zurück
- **Die Quest-Liste auf `/play` bekommt unteren Freiraum in Höhe des Hinweises**, solange er sichtbar ist, damit die letzte Karte erreichbar bleibt

**Safe Area — Inhalt auf `/` (Refinement 4, 2026-09-21):**

- **`<main>` auf `/` trägt den oberen Inset zusätzlich zu `py-6`**, additiv statt als Ersatz — sonst verliert der Screen im Browser seine 24px Kopfabstand
- **Das `pt-safe-top` am `absolute`-Wrapper des Burger-Icons bleibt bestehen** — beide Insets sind nötig und stapeln sich nicht, weil der Wrapper aus dem Fluss ist
- **Ein Wächter prüft, dass das Logo unter simuliertem Inset frei liegt** — das Fehlen genau dieser Assertion hat den Befund durchgelassen

**Safe Area (Refinement 2026-09-20):**

- **Jedes Element, das die oberste Bildschirmkante erreicht, respektiert `env(safe-area-inset-top)`.** Gemessen sind das drei Stellen, die neun Screens abdecken:
  - `src/components/app-header.tsx` — trägt **sieben** Screens auf einmal (`/play`, `/create`, Quest-Detail, Station-Detail, Station-Liste, Module, Navigation)
  - `src/app/page.tsx` — der schwebende Burger auf `/` (eigene Stelle, weil `absolute top-3` statt Kopfzeile)
  - `src/components/info-page-shell.tsx` — die Sticky-Kopfzeile der vier Info-Seiten
- **Der Inset wird als Polsterung *innerhalb* des Kopfzeilen-Elements gesetzt, nicht als Abstand davor.** `AppHeader` hat `bg-background/80 backdrop-blur-sm`, `InfoPageShell` hat `bg-background/70 backdrop-blur-sm` — liegt der Inset außerhalb, entsteht über der Blur-Fläche ein durchsichtiger Spalt und die Statusleiste steht auf blankem Inhalt. Die 56px-Zeilenhöhe bleibt davon unberührt; der Inset kommt **zusätzlich** hinzu
- **Es darf keine feste Ersatzhöhe und keine Plattform-Abfrage geben** — `env()` liefert auf Geräten ohne Notch von selbst `0px`. Eine Konstante wie `44px` würde dort einen leeren Streifen erzeugen und ist zugleich falsch für Dynamic Island (59px). Dieselbe Lehre wie bei BUG-6: nicht aus einem Merkmal auf eine Plattform schließen, wenn der Browser die Antwort direkt liefert
- **Die Backdrops bleiben unangetastet** — `creator-backdrop.tsx` und `quest-list-backdrop.tsx` sind `fixed inset-0` und reichen von selbst bis zur obersten Kante. Genau das soll so bleiben: Die durchscheinende Statusleiste braucht eine Fläche unter sich
- **Die drei Creator-FABs respektieren `env(safe-area-inset-bottom)`** — `src/app/create/page.tsx:263`, `src/app/create/[id]/page.tsx:236` und `src/app/create/[id]/station/[stationId]/page.tsx:184` stehen heute auf `fixed bottom-6` ohne Inset. Der FAB auf `/play` (`quest-import-button.tsx`) macht es bereits richtig und ist die Vorlage
- **Der Browser-Zustand bleibt messbar unverändert** — die Kriterien sind gegen den Zustand vor der Änderung zu prüfen, nicht nur gegen „sieht gut aus"

## Open Questions

- [x] ~~Lässt sich der Pin sauber aus `geoquest_pwaIcon.jpeg` freistellen, oder braucht es eine Zulieferung des Betreibers?~~ **Geschlossen in `/architecture` (2026-09-18): ja, keine Zulieferung nötig.** Das Quellbild wurde vermessen — weißer Rand 55/54/61px, und zwischen Pin-Gruppe und Schriftzug liegt eine motivfreie Spalte bei x 392..401. Ein Probeschnitt (330×420 ab x=62, y=250) zeigt Pin, gestrichelte Route und X vollständig, ohne Buchstabenrest und ohne weißen Rand. Werkzeug: `sips` (Teil von macOS).
- [ ] Soll die Abmeldung des lokalen Workers dauerhaft im Code bleiben oder nach einer Übergangszeit entfernt werden? Sie nützt nur Rechnern, die die App vor dem 2026-09-20 lokal geöffnet haben. Vorschlag: vorerst belassen — sie kostet wenige Zeilen, und ein wiederkehrender Worker wäre schwer zu diagnostizieren.
- [x] ~~Soll die Themenfarbe (Statusleiste der installierten App) bei `#0B0F12` bleiben oder das Teal aufnehmen?~~ → **Bleibt Deep Black (2026-09-20).** Am echten Gerät beurteilt: Der Betreiber hat die App installiert; die Farbe war nicht der Befund. Was auffiel, war die fehlende Safe-Area-Behandlung — siehe Refinement 3. Mit `black-translucent` ist `themeColor` ohnehin nur für den Splash und für Android maßgeblich.
- [ ] Verhält sich die Standortfreigabe in der installierten iOS-PWA wie im Safari-Tab, oder muss sie neu erteilt werden? (Edge Case 7) — nur auf einem echten iPhone abschließend zu klären; für die Korrektheit des Features unkritisch, weil der Permission-Screen aus PROJ-3 greift.
- [ ] Bleibt es dauerhaft bei „keine Screenshots im Manifest"? Sie würden die Android-Installations-Ansicht aufwerten, erfordern aber gepflegtes Bildmaterial.
- [ ] Soll die Bottom-Nav-Ausnahme für temporäre Hinweise in `docs/design-system.md` festgeschrieben werden? (Refinement 2026-09-20) Die Entscheidung ist hier begründet, aber das Design System kennt sie noch nicht — der nächste, der einen schwebenden Hinweis baut, liest dort weiterhin ein pauschales Verbot. Vorschlag: einen Satz bei der Regel in Zeile 62 ergänzen, der die Ausnahme eng fasst (temporär **und** wegklickbar **und** nicht navigierend).
- [ ] Sollten die Acceptance Criteria für Safe Area künftig **Inhalt** statt nur **Bedienelemente** prüfen? *(Refinement 4)* Die neun Kriterien von Refinement 3 nennen Zurück-Pfeil, Burger, Kopfzeile und FABs — das Logo auf `/` fiel durch, weil es kein Bedienelement ist. Vorschlag: Bei künftigen Safe-Area-Prüfungen das oberste sichtbare Element je Screen messen, unabhängig davon, ob es bedienbar ist.
- [ ] Reicht der 8%-Freiraum von `SheetContent` (`h-[92dvh]`, auf 844px rund 67px) verlässlich über den größten iOS-Inset (59px bei Dynamic Island)? *(Refinement 3, Edge Case 25)* Rechnerisch ja, aber nur am Gerät zu bestätigen. Wenn nein, braucht auch `sheet.tsx` den oberen Inset — das wäre eine geteilte shadcn-Komponente und beträfe alle Sheets der App.
- [ ] Erreicht der „Station entdecken"-Button des Player-Navigations-Screens den Home-Indikator? *(Refinement 3, Edge Case 26)* Aus dem Markup abgeleitet: nein, weil `justify-center` zentriert statt unten anzuhängen. Nicht gemessen — am Gerät zu bestätigen, bevor dort vorsorglich Polsterung eingebaut wird.
- [ ] Gehört die Safe-Area-Behandlung als Regel nach `docs/design-system.md`? *(Refinement 3)* Es ist jetzt die zweite Fehlerklasse dieser Art in diesem Feature (unten beim Overlay, oben bei den Kopfzeilen) und betrifft jedes künftige Element am Bildschirmrand. Vorschlag: ein Satz bei den Layout-Regeln, zusammen mit der bereits offenen Bottom-Nav-Ausnahme in einem Zug.
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
| **Der Hinweis wird ein schwebendes Overlay am unteren Rand** statt einer Karte im Seitenfluss | Betreiber-Entscheidung 2026-09-20. Im Fluss verbraucht der Hinweis Platz auf genau den beiden Screens, die ihn am knappsten haben — auf `/` erzwang er bereits eine eigene, abgespeckte zweite Fassung, weil die volle Karte das PROJ-1-Nicht-Scrollen-Kriterium brach. Schwebend kostet er **null** Layout-Höhe, der Inhalt scrollt unverändert darunter weiter, und die Sonderfassung je Screen entfällt. Dieselbe Begründung, die bei BUG-10 das schwebende Burger-Icon auf `/` trug: Was nicht in die Höhe zählt, kann kein Höhen-Kriterium brechen. | 2026-09-20 |
| **Eine Zeile auf beiden Plattformen** — die zweischrittige iOS-Anleitung entfällt | „Sehr kompakt" war die ausdrückliche Vorgabe. Ein Overlay verdeckt Inhalt, solange es steht; je kleiner die verdeckte Fläche, desto eher darf es überhaupt schweben. Die bisher zweizeilige iOS-Fassung hätte den Hinweis je Plattform unterschiedlich hoch gemacht und die verdeckte Fläche verdoppelt. Die Kurzform „Teilen → Home-Bildschirm" ist auf `/` seit dem 2026-09-19 live und hat sich als ausreichend erwiesen. | 2026-09-20 |
| **Bleibt stehen, bis weggeklickt** — kein Ausblenden beim Scrollen, kein Selbstschließen nach Sekunden | Ein Hinweis, der beim Scrollen wegfährt und wiederkommt, ist genau die Ambient-Bewegung, die das Design System ausschließt („keine Ambient-Loops", vgl. PROJ-3 Konfetti). Ein Selbstschließen nach Sekunden wäre zudem kein Wegklicken und müsste beim nächsten Besuch wiederkommen — der Nutzer bekäme den Hinweis dauerhaft, ohne ihn je loszuwerden. Ein Tap auf ✕ schweigt wie bisher 30 Tage. | 2026-09-20 |
| **Unverändert nur auf `/` und `/play`** | Die Overlay-Form ändert nichts an der Frage, *wo* der Hinweis angebracht ist. Kein Hinweis im Spielverlauf (Ko-fi-Regel des PRD), keiner im Creator (überwiegend Desktop). | 2026-09-20 |
| **Der Import-FAB auf `/play` rückt hoch, statt den Hinweis zu verdecken oder ihn zu verkürzen** | Beide Elemente sind vollwertige Bedienelemente; eines teilweise zu verdecken wäre in beide Richtungen falsch. Einen schmaleren Hinweis nur auf `/play` zu bauen hieße, die gerade erst abgeschaffte Zwei-Fassungen-Logik durch die Hintertür zurückzuholen. Der FAB ist das beweglichere Element — er schwebt ohnehin schon frei. | 2026-09-20 |
| Weggeklickt = 30 Tage Ruhe, dann erneut | Lang genug, um nicht zu nörgeln; kurz genug, dass jemand, der die App ein zweites Mal für einen Ausflug nutzt, das Angebot noch einmal bekommt. Bewusst abweichend vom Erststart-Dialog, der dauerhaft verschwindet — der ist eine Pflichtinformation, das hier ein Angebot. | 2026-09-18 |
| Schwerpunkt Spieler, Ersteller aber nicht ausgeschlossen | Der Vollbildgewinn (~100px) nützt dem Player-Screen am meisten. Der Ersteller kann jederzeit über die Browser-Funktion installieren, bekommt nur keinen Hinweis dazu. | 2026-09-18 |
| Icon zeigt **nur den Pin**, nicht den vollen Schriftzug | Bei 48×48 auf dem Homescreen wird „GEO QUEST" unleserlich. Das Design System sieht den Pin ohnehin ausdrücklich als „Standalone App-Icon" vor. Der Produktname steht auf dem Homescreen als Text unter dem Icon — er muss nicht zusätzlich im Bild stehen. | 2026-09-18 |
| `geoquest_pwaIcon.jpeg` als Quelle, nicht als fertiges Icon | 1024×1024 und markengetreu, aber mit weißem Rand um eine bereits abgerundete Kachel: iOS und Android runden selbst nochmal ab, das Ergebnis wäre ein Icon im Icon mit weißen Ecken. Der Pin wird daraus freigestellt und randlos auf Deep Black gesetzt. | 2026-09-18 |
| Manifest erzwingt Hochformat | Die App ist Mobile-First auf 360–430px gebaut; Kompass, Karte und Module sind nie für Querformat gestaltet worden. Querformat zuzulassen hieße, alle Player-Screens dafür zu prüfen — Aufwand, den keine Spec vorsieht. | 2026-09-18 |
| Start-URL ist `/`, nicht `/play` | Die installierte App verhält sich wie die Website. `/` trägt seit BUG-10 das vollständige Burger-Menu und beide Mode-Cards; von dort sind Play und Create je einen Tap entfernt. Ein Start auf `/play` würde den Creator in der installierten App verstecken, obwohl die Installation laut PRD auch ihm offensteht. | 2026-09-18 |
| Kein Menu-Eintrag „App installieren" | Das Burger-Menu trägt bereits sieben Ziele in vier Gruppen. Ein achter Eintrag, der auf den meisten Geräten nichts tun kann (iOS bietet keinen programmatischen Weg), wäre mehr Last als Nutzen. | 2026-09-18 |
| Offline-Seite verspricht ausdrücklich **keine** Offline-Fähigkeit | Sie sagt, dass Internet zum Starten nötig ist. Eine Formulierung wie „du bist offline" könnte als „sonst ginge es auch offline" gelesen werden — und würde ein Versprechen erzeugen, das das Produkt nicht hält. | 2026-09-18 |
| **`/` bekommt den Inset am Inhalt statt eine echte Kopfzeile** | Betreiber-Entscheidung 2026-09-21, nach Klärung eines Missverständnisses: Die Sorge galt dem Logo, das von beiden Wegen unberührt bleibt (es ist ein eigenes Element in der Seitenmitte, nicht Teil der Kopfzeile). Gegen die Kopfzeile sprechen zwei gemessene Gründe — sie kostet 56px, die der Startscreen nicht hat (2026-09-10: Inhalt endet dann bei 615 von 640), und sie bräuchte weder Zurück-Pfeil noch Titel, wäre also eine leere Leiste für ein Icon. Der Inset am Inhalt kostet **null zusätzliche Höhe**: Der Platz, der oben entsteht, ist genau der, den die Statusleiste ohnehin verdeckt. | 2026-09-21 |
| **Der randlose Look bleibt — die Safe Area wird respektiert, statt `statusBarStyle` zu ändern** | Betreiber-Entscheidung 2026-09-20. Der Einzeiler `statusBarStyle: "default"` hätte den Befund ebenfalls behoben, aber um den Preis eines massiven schwarzen Balkens über der App — genau das, was `black-translucent` am 2026-09-18 ausdrücklich vermeiden sollte („damit Statusleiste und Splash nahtlos in den App-Hintergrund übergehen"). Die Safe-Area-Lösung kostet mehr Stellen, hält aber die getroffene Gestaltungsentscheidung. Geprüft und entkräftet: das Risiko heller Flächen unter der Statusleiste — es gibt keine. Die Karte lebt ausschließlich im Stations-Sheet des Creators und erreicht die oberste Kante nie; alle Screens, die y=0 berühren, sind dunkel. | 2026-09-20 |
| **Der Browser-Zustand ist nicht gefährdet — und braucht dafür keinen Code** | Die Sorge des Betreibers („im Browser sieht alles gut aus, das will ich nicht verlieren") ist berechtigt, aber durch die Wahl der Mechanismen bereits beantwortet: `env(safe-area-inset-top)` ist im Browser `0px`, weil Safari den Platz unter seiner Adressleiste selbst freihält, und `statusBarStyle` wird außerhalb des Standalone-Modus gar nicht gelesen. Beide sind von sich aus modus-abhängig. Eine zusätzliche Standalone-Abfrage im JavaScript wäre eine zweite Wahrheit über denselben Sachverhalt — die Fehlerklasse, die BUG-6 erzeugt hat. | 2026-09-20 |
| **Die Info-Seiten kommen mit in den Scope** | Betreiber-Entscheidung 2026-09-20. Sie sind installiert übers Burger-Menu erreichbar und hätten sonst denselben Fehler — nur seltener gesehen, weil `start_url` auf `/` zeigt. Eine Datei mehr (`info-page-shell.tsx`), derselbe Prüf-Durchlauf, dasselbe Gerät. Ein eigener Zyklus dafür hätte mehr gekostet als die Scope-Erweiterung. | 2026-09-20 |
| **Der untere Rand kommt mit in den Scope** | Betreiber-Entscheidung 2026-09-20. Gleiche Ursache (`viewportFit: "cover"`), gleiches Gerät zum Prüfen. Beim Nachsehen zeigte sich mehr als vermutet: **drei** Creator-FABs stehen auf `fixed bottom-6` ohne Inset und säßen auf einem iPhone mit Home-Indikator teilweise unter dem Strich. Die ursprüngliche Vermutung, der Player-Navigations-Screen sei betroffen, hielt der Prüfung dagegen **nicht** stand — er zentriert seinen Inhalt. Sie steht als zu prüfende Annahme in Edge Case 26, nicht als bestätigter Fehler. | 2026-09-20 |
| Der Service Worker läuft **nur in Production**, nicht auf `localhost` | Ein Betreiber-Befund vom 2026-09-20: Desktop-Safari zeigte beim Öffnen von `localhost` nur noch „Keine Verbindung". Reproduziert — der Dev-Server lief nicht, der Worker fing die Navigation ab und antwortete aus dem Cache. Technisch korrekt, aber am falschen Ort: Lokal ist ein gestoppter Server der **Normalfall**, und die Offline-Seite verdeckt dann die wahre Ursache. Der Nutzen des Workers (Installierbarkeit auf Android, würdige Fehlerseite draußen) entsteht ausschließlich in Production; lokal hat er nur Kosten. | 2026-09-20 |

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
| ~~Hinweis im Seitenfluss statt fixiert am unteren Rand~~ **überholt am 2026-09-20** | Ursprünglich: „Das Design System verbietet ausdrücklich Bottom-Navigation und Tab-Bars; ein fixierter Banner läse sich als solche." **Diese Auslegung ist zu weit.** Die Regel in `docs/design-system.md:62` zielt auf **dauerhaftes Navigations-Mobiliar** — eine Leiste, die immer da ist und den Wechsel zwischen Bereichen trägt. Der Installations-Hinweis ist weder dauerhaft (ein Tap auf ✕ und er schweigt 30 Tage) noch navigiert er irgendwohin. Die Annahme „verdeckt nichts und schiebt nichts weg" traf zudem nur die halbe Wahrheit: Im Fluss verdeckt er zwar nichts, **schiebt aber sehr wohl** — auf `/` um 195px, was das PROJ-1-Kriterium brach und die kompakte Sonderfassung erzwang. | 2026-09-18, überholt 2026-09-20 |
| **Fixiertes Overlay unten, Bottom-Nav-Regel bekommt eine dokumentierte Ausnahme** | Die Ausnahme gilt eng: **temporäre, wegklickbare Hinweise** dürfen unten schweben; dauerhafte Navigation weiterhin nicht. Damit bleibt die Regel wirksam für das, wofür sie geschrieben wurde. Diese Ausnahme gehört nach `docs/design-system.md` — siehe Open Questions. | 2026-09-20 |
| **Safe Area statt fester Polsterung** | Auf einem iPhone mit Home-Indikator läge das Schließen-X sonst teilweise unter der Gestenleiste. `viewportFit: "cover"` steht bereits im Wurzel-Layout, die Information liegt also vor; `station-editor-sheet.tsx:198` nutzt für denselben Zweck bereits den 14px-Wert des Design Systems. | 2026-09-20 |
| **Stapelreihenfolge zwischen FAB (`z-40`) und Burger-Menu (`z-[1100]`)** | Der Hinweis muss über dem normalen Seiteninhalt liegen, aber unter jeder Ebene, die der Nutzer bewusst geöffnet hat. Ein Hinweis, der ein offenes Sheet überlagert, wäre genau das aufdringliche Verhalten, das die Produkt-Entscheidung von 2026-09-18 ausschließt. | 2026-09-20 |
| ~~Auf `/` steht der Hinweis **hinter** den Mode-Cards~~ **gegenstandslos am 2026-09-20** | Die Reihenfolge im Seitenfluss entscheidet nichts mehr, sobald der Hinweis gar nicht mehr im Fluss steht. Mit ihr entfällt auch die daraus entstandene `compact`-Prop: Es gibt nur noch **eine** Fassung, und die ist die kompakte. | 2026-09-18, gegenstandslos 2026-09-20 |
| Speicherschlüssel `gq_install_hint_dismissed` mit Zeitstempel | Gleiches Präfix und gleicher Mechanismus wie `gq_first_visit_done` (PROJ-1). Ein Zeitstempel statt eines Wahrheitswerts, weil die 30-Tage-Frist sonst nicht berechenbar wäre. | 2026-09-18 |
| Konstanten (Frist, Speicherschlüssel) in `src/lib/app-nav.ts` | Dort liegen bereits die app-weiten Navigations- und Schalterkonstanten (`KOFI_URL`, `ANLEITUNG_VERFUEGBAR`). Das Modul ist bewusst kein Client-Modul und aus Server- wie Client-Komponenten importierbar. | 2026-09-18 |
| **Auf `/` braucht es zwei Insets, nicht einen** | Das Burger-Icon ist `absolute` (BUG-10, damit es 0px Layout-Höhe kostet) und der Inhalt steht im normalen Fluss — zwei getrennte Positionierungswelten, die sich nicht gegenseitig verschieben. Refinement 3 hat nur die erste bedient. Die beiden Insets stapeln sich nicht: Der Wrapper ist aus dem Fluss, sein Padding wirkt nur auf ihn selbst. | 2026-09-21 |
| **Der Inset als Polsterung *innerhalb* der Kopfzeile, nicht als Abstand davor** | Beide Kopfzeilen haben einen halbtransparenten Blur-Hintergrund (`bg-background/80` bzw. `/70` mit `backdrop-blur-sm`). Läge der Inset außerhalb — als Margin, als Wrapper-Padding, als Spacer-Element —, begänne die Blur-Fläche erst unterhalb der Statusleiste, und darüber stünde ein durchsichtiger Spalt mit blankem Seiteninhalt. Der Effekt wäre schlechter lesbar als der Fehler, den wir beheben. Innerhalb gesetzt wächst die Fläche nach oben mit und die 56px-Zeile bleibt unangetastet. | 2026-09-20 |
| **`env()` direkt, ohne Plattform-Abfrage und ohne feste Ersatzhöhe** | Der Browser kennt den Wert; er ist `0px` ohne Notch, 47px mit Notch, 59px bei Dynamic Island. Jede Konstante wäre auf mindestens einer dieser drei Klassen falsch — und eine Plattform-Abfrage („ist das iOS?") ist exakt das Muster, das in BUG-6 (PROJ-3) live ging: aus einem Merkmal auf eine Plattform schließen, während die richtige Antwort direkt verfügbar war. | 2026-09-20 |
| **Drei Stellen für neun Screens, statt Screen für Screen** | `AppHeader` allein deckt sieben Screens ab; dazu der schwebende Burger auf `/` (eigene Stelle, weil er bewusst keine Kopfzeile ist — BUG-10) und `InfoPageShell` für die vier Info-Seiten. Die Alternative wäre ein Wrapper im Wurzel-Layout gewesen: verworfen, weil er auch die Backdrops nach unten schöbe, die ausdrücklich bis zur obersten Kante reichen sollen — die durchscheinende Statusleiste braucht eine Fläche unter sich. | 2026-09-20 |
| **Die Backdrops bekommen ausdrücklich *keinen* Inset** | `creator-backdrop.tsx` und `quest-list-backdrop.tsx` sind `fixed inset-0` und damit bereits randlos. Das ist die Hälfte der Lösung, nicht ein übersehener Fall: Ohne eine Fläche unter der Statusleiste stünden Uhrzeit und Batterie auf blankem Hintergrund — der Look, den `black-translucent` gerade vermeiden soll. | 2026-09-20 |
| Unterscheidung über `process.env.NODE_ENV`, **nicht** über den Hostnamen | Die E2E-Suite testet den echten Production-Build auf `localhost:3100` (`playwright.prod.config.ts`). Eine Hostname-Prüfung auf `localhost` würde dort den Worker abschalten und die 37 PROJ-12-Tests entwerten, ohne dass eine einzige Zeile Produktcode kaputt aussieht — ein stiller Testverlust. `NODE_ENV` trennt Dev-Server von Production-Build sauber, unabhängig vom Port. | 2026-09-20 |
| Bestehende lokale Worker aktiv abmelden statt nur neue verhindern | Der Scope eines Service Workers ist die **Origin**, nicht der Port — ein einmal auf `localhost` registrierter Worker überlebt den Dev-Server und gilt für **jedes** Projekt auf dieser Maschine. Würde man nur neue Registrierungen unterlassen, bliebe der bereits ausgelieferte Worker auf allen Entwicklerrechnern liegen und müsste von Hand gelöscht werden. Die Abmeldung ist wenige Zeilen und räumt den Fehler dort auf, wo er entstanden ist. | 2026-09-20 |
| Kein Opt-in-Schalter für lokales Testen | Erwogen und verworfen: Die Offline-Seite und die Installierbarkeit lassen sich gegen den Production-Build prüfen (`playwright.prod.config.ts`, Port 3100) — genau dort, wo die Suite ohnehin läuft. Ein zusätzlicher Schalter wäre ein dritter Zustand, den niemand regelmäßig testet. | 2026-09-20 |

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

### Refinement 2026-09-20 — Service Worker nur in Production

**Anlass:** Der Betreiber sah in Desktop-Safari beim Öffnen von `localhost` nur noch „Keine Verbindung". Kein Produktfehler und in Production nie aufgetreten — der Worker tat genau das, wofür er gebaut wurde, nur am falschen Ort: Es lief kein Dev-Server, er fing die Navigation ab und antwortete aus dem Cache.

**Eine Datei geändert** (`src/components/service-worker-registration.tsx`), kein neues Paket, keine neue Komponente, keine neue Route. `public/sw.js`, das Manifest, die Icons und die Offline-Seite sind **unverändert** — das Refinement ändert nur, *wer* den Worker registriert, nicht welche Dateien existieren.

**Beide Richtungen am Browser gemessen, nicht behauptet** (WebKit, gleicher Hostname `localhost`, nur unterschiedliches `NODE_ENV`):

| Umgebung | Worker registriert | `controller` | Caches |
|---|---|---|---|
| Production-Build (Port 3100) | **1** | `true` | `["geoquest-offline-v1"]` |
| Dev-Server (Port 3000) | **0** | `false` | `[]` |

Damit ist belegt, dass die Unterscheidung nicht am Hostnamen hängt — beide Fälle liefen auf `localhost`.

**Edge Case 17 (Aufräumen) ebenfalls gemessen.** Der erste Versuch war wertlos und wurde verworfen: Er stellte den Altzustand auf `/` her, wo der neue Aufräum-Code sofort lief — „VORHER" zeigte bereits 0 Worker, der Test hätte auch bei kaputtem Code bestanden. Korrigiert über `offline.html`, eine statische Seite ohne React:

- **VORHER:** 1 Worker, Cache `["geoquest-offline-v1"]`
- **NACHHER (ein Seitenaufruf):** 0 Worker, 0 Caches
- **Zweiter Seitenaufruf:** auch `controller: false` — der Rest im ersten Schritt ist die bereits kontrollierte Seite, die ihr Leben zu Ende lebt, kein Halbzustand

Der Entwickler muss also nichts von Hand löschen; es löst sich beim nächsten Aufruf.

**7 neue Unit-Tests** in `service-worker-registration.test.tsx` — bewusst als Unit- und nicht als E2E-Tests: Die E2E-Suite fährt ausschließlich gegen den Production-Build, wo `NODE_ENV` immer `production` ist. Der Dev-Zweig ist dort **strukturell nicht erreichbar**, und genau er ist der Gegenstand des Refinements.

**Per Gegenprobe geschärft:** Mit der alten Fassung fallen **genau 4** der 7 Tests (keine Registrierung im Dev-Modus, Abmelden, Cache-Löschen, fremde Caches). Die 3, die weiter bestehen müssen — Registrierung in Production, kein Aufräumen in Production, BUG-11 —, bestehen auch. Produktcode danach per `diff` als identisch zur gebauten Fassung bestätigt.

**Die zentrale Sorge des Refinements ist eingelöst:** Die **37 PROJ-12-E2E-Tests laufen unverändert** gegen den Production-Build auf `localhost:3100`. Eine Hostname-Prüfung hätte sie entwertet, ohne dass der Produktcode kaputt ausgesehen hätte.

**Suiten:** Unit **226/226** (vorher 219). Vollständiger E2E-Lauf gegen den Production-Build: **913 passed / 52 skipped / 1 failed** — der eine Fehlschlag liegt in `proj-7-creator-stationen-editor.spec.ts` (Radius-Slider), besteht einzeln und ist von diesem Refinement nicht erreichbar: Die Datei ist unverändert und ihre Suite läuft mit `serviceWorkers: 'block'`. PROJ-12 selbst **3× seriell hintereinander 36/36 grün** auf Chrome. Build und Lint sauber (0 Fehler; die 7 Warnungen sind vorbestehend, keine in den geänderten Dateien).

**Zwei Messfehler offen benannt, beide meine:** Ein `tail`-Aufruf schnitt die Fehlerzeile ab, sodass ich kurzzeitig „0 failed" las, während 10 Tests fehlschlugen — Ursache war die Datei `tests/zz-probe-radius.spec.ts`, die während des Laufs verschwand (nicht von mir angelegt und nicht von mir gelöscht). Und ein `pkill` gegen Playwright beendete zugleich den Production-Server, worauf der Folgelauf „No tests found" meldete.

**Nicht abgedeckt:** Das Verhalten in Production bleibt unverändert und wurde nur lokal gegen `next start` geprüft, nicht gegen Vercel — der Deploy muss bestätigen, dass sich der Worker dort weiterhin registriert.

### Refinement 2026-09-20 — Installations-Hinweis wird schwebendes Overlay

**Anlass (Betreiber):** Der Hinweis sitzt fest im Seitenfluss auf `/` und `/play`. Gewünscht ist stattdessen ein Overlay, hinter dem die Seite weiter scrollt — und deutlich kompakter.

**Was sich ändert**

| Heute (live seit 2026-09-19) | Nach diesem Refinement |
|---|---|
| Karte im Seitenfluss, verdrängt Inhalt | `position: fixed` unten, verdrängt nichts |
| Zwei Fassungen (`compact` auf `/`, volle Karte auf `/play`) | **Eine** Fassung, überall dieselbe |
| Volle Karte 195px, kompakt 44px | Eine Zeile, beide Plattformen gleich hoch |
| iOS: zweischrittige Anleitung mit zwei Icons | iOS: eine Zeile „Teilen → Home-Bildschirm" |
| Auf `/play` hinter dem Titel-Block, auf `/` hinter den Mode-Cards | Position im Markup ist gleichgültig — der Hinweis schwebt |

**Was ausdrücklich gleich bleibt:** die vier Anzeige-Bedingungen in `use-install-prompt.ts` (installiert? weggeklickt? Frist um? Weg vorhanden?), die 30-Tage-Frist, der Vorrang des Erststart-Dialogs (Edge Case 13), die iOS-Erkennung an mehreren Signalen (BUG-6-Lehre) und die Beschränkung auf `/` und `/play`. **Der Hook wird nicht angefasst** — dieses Refinement ändert nur, wie der Hinweis aussieht und wo er sitzt, nicht wann er erscheint.

**Drei Fallstricke, die beim Bauen zu beachten sind**

1. **Der Import-FAB auf `/play` steht im Weg.** `quest-import-button.tsx:71` ist bereits `fixed bottom-6 right-5 z-40`. Er muss hochrücken, solange der Hinweis sichtbar ist — und zurückfallen, sobald er weggeklickt ist. Beide Komponenten brauchen dafür dieselbe Information; die Quelle ist `useInstallPrompt().shouldShow`, nicht ein zweiter, eigener Zustand.

2. **Die `compact`-Prop verschwindet.** Sie existierte nur, weil die volle Karte auf `/` das PROJ-1-Kriterium brach. Mit dem Overlay gibt es nur noch eine Fassung — die Prop ersatzlos entfernen, statt sie auf `true` festzunageln. Die ausführliche iOS-`<ol>` mit zwei Schritten entfällt mit ihr.

3. **Bestehende Tests werden absichtlich falsch.** `tests/proj-12-pwa-installation.spec.ts` prüft den Hinweis heute im Seitenfluss. Diese Assertions sind auf den neuen Zustand zu **ziehen, nicht zu löschen** — insbesondere die Messung der kompakten 44px-Fassung und die Stelle, an der der Hinweis im DOM erwartet wird. Neu dazu gehört der Wächter, der belegt, dass die Dokumenthöhe mit und ohne sichtbaren Hinweis identisch ist; genau das ist die Behauptung dieses Refinements.

**Die Messung, die dieses Refinement belegt:** `document.documentElement.scrollHeight` mit sichtbarem Hinweis gegen denselben Wert ohne ihn — auf `/` und `/play`, auf beiden Engines. Sind die Werte identisch, kostet der Hinweis null Layout-Höhe. Dasselbe Muster hat bei BUG-10 das schwebende Burger-Icon auf `/` belegt (24 Werte, alle identisch).

#### Umsetzung am 2026-09-20

**Fünf Dateien, kein neues Paket, keine neue Komponente, keine neue Route.**

| Datei | Änderung |
|---|---|
| `src/components/install-hint.tsx` | `fixed bottom-0 … z-50`, eine Fassung statt zwei, `compact`-Prop entfernt, iOS-`<ol>` durch eine Zeile ersetzt |
| `src/hooks/use-install-prompt.ts` | neues Ereignis `gq:install-hint-changed` (siehe „Der Fehler, den erst die Messung fand") |
| `src/components/quest-import-button.tsx` | FAB weicht dem Hinweis aus und fällt zurück |
| `src/app/page.tsx` | `compact`-Prop und Flow-Klassen entfernt |
| `src/app/play/page.tsx` | Flow-Klassen entfernt, Listen-Freiraum solange der Hinweis steht |

**Der Kern ist gemessen, nicht behauptet — und schärfer, als ich zuerst geprüft hatte.**

Die naheliegende Messung („Seitenhöhe mit Hinweis == Seitenhöhe ohne Hinweis") war **falsch** und hätte ein richtiges Ergebnis vorgetäuscht: Auf `/play` wuchs die Seite von 922 auf 994px, weil die Liste absichtlich Freiraum bekommt (Edge Case 19). Der Vergleich hätte dort einen gewollten Unterschied als Fehler gemeldet — oder, mit umgekehrtem Vorzeichen, den Freiraum als Beweis für Layout-Kosten des Overlays missdeutet.

Stattdessen wird der Beitrag **des Overlays selbst** isoliert: aus dem DOM nehmen, neu messen, zurücksetzen. Ergebnis auf beiden Seiten und beiden Engines: **0px**. Der Hinweis nimmt keinen Platz im Fluss ein. Das PROJ-1-Kriterium hält mit `scrollHeight == innerHeight == 640` auf 360×640, also exakt auf Kante wie vorher.

**Der Fehler, den erst die Messung fand — und den ich selbst eingebaut hatte.** Der FAB blieb nach dem Wegklicken oben stehen (gemessen: 552 statt 616). Ursache: `useInstallPrompt()` läuft jetzt an **drei** Stellen zugleich (Hinweis, FAB, Listen-Freiraum), und jeder Aufruf hat eigenen React-State — `dismiss()` schaltete nur die Instanz des Hinweises um. Ich hatte in denselben Code den Kommentar geschrieben, ein zweiter Zustand könnte auseinanderlaufen, und genau das dann produziert.

Gelöst mit dem Muster, das `FirstVisitDialog` schon nutzt: ein Fensterereignis (`gq:install-hint-changed`) statt eines Context-Providers, weil die drei Komponenten in verschiedenen Teilbäumen sitzen. Per Gegenprobe abgesichert — nimmt man das `dispatchEvent` heraus, fällt **genau ein** Test, der zuständige.

**Gemessen statt geschätzt** (Chrome 152 und WebKit, Production-Build):

- Overlay-Beitrag zur Layout-Höhe: **0px** auf `/` und `/play`, beide Engines
- Höhe **72px** (44px Zeile + 14px Safe-Area + Polsterung) — **auf Android und iOS identisch**; die alte volle Karte maß 195px
- Kontrast **9.64:1** bei 4.5:1 Vorgabe; Tap-Ziele 44×44 (Schließen) und 238–348×44 (Installieren)
- Kein abgeschnittener Text und kein horizontaler Überlauf auf 320/360/390/430px
- Safe-Area-Polsterung löst zu 14px auf, wenn keine Systemleiste da ist
- FAB und Hinweis überlappen **nicht**; nach dem Wegklicken steht der FAB wieder exakt auf seiner Ausgangsposition (616/640)
- Letzte Quest-Karte beim Scrollen ans Listenende **nicht verdeckt** (Unterkante 552 gegen Hinweis-Oberkante 568)
- iOS-Zweig auf echtem WebKit: eine Zeile, **0 Installieren-Buttons** — die BUG-6-Lehre hält

**Am Bildschirm abgenommen**, nicht nur gemessen — bei einer Design-Änderung reichen Zahlen nicht: Die Leiste liest sich auf beiden Plattformen als kompakter Hinweis, nicht als Tab-Bar, und tritt neben den Mode-Cards zurück.

**Ein Fehler im Test selbst** (das Produkt war richtig): Der Wächter „liegt unter dem Burger-Menu" prüfte, was am Mittelpunkt des Hinweises liegt — und fiel auf Desktop-Chrome um. Ursache gemessen: Auf 1280px sitzt das Menu-Panel bei x=1000..1280, der Hinweis mittig bei x=425..855; sie berühren sich dort gar nicht. Der Test prüfte Geometrie, die nur auf schmalen Bildschirmen gilt. Er setzt jetzt einen schmalen Viewport und prüft zusätzlich, dass das Menu bedienbar bleibt.

**Testabdeckung:** 12 neue Tests, PROJ-12 damit **49 statt 37** je Engine. Per Gegenprobe geschärft: Stellt man den Hinweis zurück in den Seitenfluss, fallen **6** Tests; nimmt man das Ereignis für den FAB heraus, fällt **genau 1**.

Die bestehenden Assertions sind **gezogen, nicht gelöscht**: Der iOS-Test prüft jetzt die Kurzform und zusätzlich, dass es keine `<li>` mehr gibt; der Truncation-Test heißt nicht mehr „die kompakte Fassung", weil es nur noch eine gibt.

**Suiten gegen den Production-Build:** Unit **226/226**. E2E über beide Engines: **978 passed / 52 skipped / 0 failed**. Build und Lint sauber (7 Warnungen, alle vorbestehend), `/` und `/play` bleiben statisch (`○`).

**Nicht abgedeckt und benannt:** die Safe Area auf einem echten iPhone mit Home-Indikator (Playwright emuliert `env(safe-area-inset-bottom)` nicht — konstruktiv abgedeckt, am Gerät zu bestätigen), das Verhalten bei eingeblendeter Bildschirmtastatur, und Firefox (Binary fehlt; Risiko gering, da Firefox `beforeinstallprompt` nicht bereitstellt und die iOS-Erkennung dort `false` liefert).

---

## Refinement 3 (2026-09-20) — Safe Area: die Statusleiste verdeckt die Kopfzeile

**Status:** Deployed am 2026-09-21 (Tag `v1.37.0-PROJ-12`)

### Der Befund

Der Betreiber hat die App auf iOS installiert. Im Vollbild verdecken Uhrzeit, Batterie und WLAN-Anzeige das Burger-Menu und den Zurück-Pfeil. **Im Browser tritt das nicht auf** — und genau diese Beobachtung ist der Schlüssel zur Ursache.

### Warum nur installiert

Im Browser rendert Safari seine Adressleiste über der Seite. Die Seite beginnt unterhalb davon; die Statusleiste ist kein Thema, weil Safari den Platz freihält.

Installiert (`display: standalone`) fällt die Adressleiste weg und die Seite bekommt den ganzen Bildschirm. Erst jetzt greift, was dieses Feature am 2026-09-18 gesetzt hat:

| Zeile | Datei | Wirkung installiert |
|---|---|---|
| `statusBarStyle: "black-translucent"` | `src/app/layout.tsx:81` | iOS zeichnet die Statusleiste **durchsichtig über** den Inhalt |
| `viewportFit: "cover"` | `src/app/layout.tsx:88` | Der Viewport reicht in die Safe Areas hinein |

Zusammen sagen sie: *Die Seite beginnt bei y=0.* Das ist gewollt — es ist der randlose Look, den die Entscheidung von 2026-09-18 ausdrücklich wollte. **Was fehlt, ist die Gegenleistung:** Wer bei y=0 anfängt, muss die Systemleisten selbst freihalten.

### Gemessen, nicht vermutet

`grep -rn "safe-area" src/` findet **vier** Vorkommen — und alle vier sind `inset-bottom`:

| Datei | Zeile | Inset |
|---|---|---|
| `src/app/play/page.tsx` | 127 | bottom |
| `src/components/quest-import-button.tsx` | 92 | bottom |
| `src/components/station-editor-sheet.tsx` | 198 | bottom (als 14px-Konstante) |
| `src/components/install-hint.tsx` | 56 | bottom |

**`env(safe-area-inset-top)` kommt im gesamten Projekt nicht vor.** Der obere Rand ist nie behandelt worden — deshalb der Befund.

Die fehlende Höhe: 47px auf iPhones mit Notch, 59px mit Dynamic Island, 0px ohne beides.

### Der gewählte Weg

**Safe Area respektieren, `statusBarStyle` unangetastet lassen.** Der Alternativweg wäre ein Einzeiler gewesen (`statusBarStyle: "default"`), hätte aber die Gestaltungsentscheidung von 2026-09-18 zurückgenommen — siehe Product Decisions.

Die Sorge des Betreibers, den Browser-Zustand zu verlieren, ist durch die Wahl der Mechanismen bereits beantwortet: `env(safe-area-inset-top)` ist im Browser `0px`, `statusBarStyle` wird dort nicht gelesen. **Beide sind von sich aus modus-abhängig** — es braucht keine Standalone-Abfrage im Code, und es darf auch keine geben (siehe Edge Case 23).

### Geprüftes Risiko: helle Flächen unter der Statusleiste

Die naheliegende Sorge bei `black-translucent` ist weiße Statusleisten-Schrift auf hellem Grund. **Im Code nachgesehen statt angenommen:** Die Karte (`station-map.tsx`) existiert ausschließlich im Stations-Sheet des Creators und erreicht die oberste Kante nie. Jeder Screen, der y=0 berührt, ist dunkel — `bg-gq-black`, die Ambient-Backdrops, das `data-theme="dark"` des Play-Layouts. Kein Konflikt.

### Die betroffenen Stellen

**Oben — drei Stellen, neun Screens:**

| Stelle | Deckt ab | Besonderheit |
|---|---|---|
| `src/components/app-header.tsx` | `/play`, `/create`, Quest-Detail, Station-Detail, Station-Liste, Module, Navigation | **7 Screens auf einmal**; `bg-background/80 backdrop-blur-sm` |
| `src/app/page.tsx` | `/` | Schwebender Burger (`absolute top-3 right-3`), bewusst keine Kopfzeile — BUG-10 |
| `src/components/info-page-shell.tsx` | `/about`, `/anleitung`, `/impressum`, `/datenschutz` | `sticky top-0`, `bg-background/70 backdrop-blur-sm` |

**Unten — drei Stellen, beim Nachsehen gefunden:**

| Stelle | Zeile | Heute |
|---|---|---|
| `src/app/create/page.tsx` | 263 | `fixed bottom-6 right-5` ohne Inset |
| `src/app/create/[id]/page.tsx` | 236 | `fixed bottom-6 right-5` ohne Inset |
| `src/app/create/[id]/station/[stationId]/page.tsx` | 184 | `fixed bottom-6 right-5` ohne Inset |

Der FAB auf `/play` (`quest-import-button.tsx:92`) macht es bereits richtig und ist die Vorlage.

**Nicht betroffen:** `creator-backdrop.tsx` und `quest-list-backdrop.tsx` sind `fixed inset-0` und sollen genau so bleiben — sie liefern die Fläche, auf der die durchscheinende Statusleiste steht.

### Eine korrigierte Annahme

Meine erste Vermutung war, der Player-Navigations-Screen sei unten betroffen. Das Markup widerlegt sie: `min-h-[100dvh]` mit `justify-center` zentriert den Inhalt, statt ihn an den Rand zu hängen. Die Vermutung steht als **zu prüfende Annahme in Edge Case 26**, nicht als bestätigter Fehler. Dafür hat dasselbe Nachsehen drei Creator-FABs zutage gefördert, die vorher niemand auf der Liste hatte.

### Der Fallstrick für `/frontend`

**Der Inset gehört *innerhalb* das Kopfzeilen-Element, nicht davor.** Beide Kopfzeilen haben einen halbtransparenten Blur-Hintergrund. Ein Margin, ein Wrapper-Padding oder ein Spacer davor lässt die Blur-Fläche erst unterhalb der Statusleiste beginnen — darüber stünde ein durchsichtiger Spalt mit blankem Seiteninhalt. Das Ergebnis wäre schlechter lesbar als der Fehler, den wir beheben.

**Keine feste Ersatzhöhe, keine Plattform-Abfrage.** `env()` liefert den richtigen Wert für alle drei Geräteklassen. Eine Konstante wie `44px` ist auf mindestens einer davon falsch; eine `isIOS()`-Abfrage ist exakt das Muster, das in BUG-6 live ging.

### Abnahme

Playwright emuliert `env(safe-area-inset-*)` **nicht** — dieselbe Grenze, die schon beim unteren Overlay benannt wurde. Prüfbar per Test ist deshalb:

- dass der Browser-Zustand **unverändert** ist (oberer Inset dort `0px` — jede Verschiebung wäre ein Fehler)
- dass die 56px-Zeilenhöhe der Kopfzeilen erhalten bleibt
- dass die Kopfzeilen-Hintergrundfläche und ihr Inhalt dasselbe Element sind (kein Spalt-Konstrukt)

Das tatsächliche Erscheinungsbild auf einem iPhone mit Notch prüft der Betreiber am Gerät. Mitzunehmen ist dabei Edge Case 25 (Sheet-Höhe gegen Dynamic Island) und Edge Case 26 (Player-Button gegen Home-Indikator).

### Implementation Notes (Frontend, 2026-09-20)

**Umgesetzt.** Sieben Dateien, kein neues Paket, keine neue Komponente, keine neue Route.

#### Was gebaut wurde

Drei benannte Utilities in `globals.css` statt wiederholter `calc()`-Zeichenketten an sechs Aufrufstellen — die Regel steht einmal da, mitsamt ihrer Begründung:

| Utility | Wert |
|---|---|
| `.pt-safe-top` | `padding-top: env(safe-area-inset-top)` |
| `.bottom-safe-6` | `bottom: calc(env(safe-area-inset-bottom) + 1.5rem)` |
| `.bottom-safe-fab-stack` | `bottom: calc(env(safe-area-inset-bottom) + 84px)` |

Angewandt oben in `app-header.tsx` (7 Screens), `page.tsx` (der schwebende Burger auf `/`) und `info-page-shell.tsx` (4 Info-Seiten); unten an den drei Creator-FABs.

#### Eine Abweichung von der Spec, gemessen statt vermutet

**Der Spec fehlte ein viertes unteres Element.** `create/page.tsx:219` trägt das ausgeklappte Aktionsmenü des FAB auf `bottom-[84px]` (24px Gutter + 48px Button + 12px Abstand). Ohne denselben Inset wäre der FAB auf einem Gerät mit Home-Indikator nach oben gerückt und das Menü nicht — der Abstand zwischen beiden wäre verschwunden. Daher die dritte Utility. Gemessen mit simuliertem Inset: FAB `bottom: 58px`, Menü `bottom: 118px`, Abstand exakt 12px.

#### `box-content` — der Teil, der ohne Messung falsch geworden wäre

`AppHeader` brauchte zusätzlich `box-content`. Tailwinds Preflight setzt `border-box` global; mit `h-14` plus `pt-safe-top` hätte der Inset die 56px **von innen aufgezehrt**, statt die Zeile nach unten zu schieben — bei 47px wären 9px Zeilenhöhe übrig geblieben. Die Kopfzeile wäre also gestaucht worden statt verschoben, und das Tap-Ziel hätte die 44px verfehlt. `InfoPageShell` braucht es nicht: Dort trägt ein inneres `div` die Höhe, das Padding am `<header>` addiert sich von selbst.

#### Die Mechanik gemessen, nicht behauptet

Playwright emuliert `env(safe-area-inset-*)` nicht. Gemessen wurde deshalb über eine Simulation: Dieselben Utilities mit festem Wert überschrieben, was exakt den Weg misst, den der echte Inset nimmt.

| | Browser | Notch 47px | Dynamic Island 59px |
|---|---|---|---|
| Kopfzeile `top` | 0 | **0** | **0** |
| Kopfzeilen-Höhe | 56 | 103 | 115 |
| **Bedienelement `top`** | 6 | **53** | **65** |
| Tap-Ziel-Höhe | 44 | **44** | **44** |
| Burger auf `/` | 12 | **59** | 71 |
| FAB `bottom` | 24px | **58px** | 58px |

Die entscheidende Zeile ist das Bedienelement: bei 53 bzw. 65 liegt es **vollständig unterhalb** der 47/59px hohen Statusleiste — der gemeldete Fehler. Die Kopfzeile beginnt weiterhin bei `top: 0`, die Blur-Fläche reicht also bis zur obersten Kante (kein durchsichtiger Spalt), und die 44px bleiben erhalten.

#### Der Browser-Zustand ist unverändert — gemessen

Auf fünf Viewports (320×568 bis 1440×900): `padding-top: 0px` überall, Kopfzeilenhöhe 56px (64px ab `sm` auf `/about`, wie zuvor), Burger bei y=12 mit 44×44, FAB `bottom: 24px`, `/` scrollt auf 360×640 weiterhin nicht. Das ist die ausdrückliche Zusicherung an den Betreiber, und sie ist belegt statt behauptet.

#### Testabdeckung

**34 neue Tests** in `tests/proj-12-safe-area.spec.ts` (17 je Engine), in drei Gruppen: der unveränderte Browser-Zustand, die Mechanik unter simuliertem Inset, und der CSS-Vertrag (`env()` statt fester Werte, `box-content`, randlose Backdrops).

**Per Gegenprobe geschärft:** Mit zurückgenommener Änderung fallen **16 von 34** — alle drei oberen Stellen auf beiden Engines, der Spalt-Wächter und der `box-content`-Wächter. Die Browser-Zustands-Tests bleiben dabei korrekterweise grün, weil sich im Browser tatsächlich nichts ändert. Produktcode danach per `diff` als unverändert bestätigt.

#### Drei Fehler in meinen eigenen Messungen, offen benannt (das Produkt war jeweils richtig)

1. **`/create` zeigte keinen FAB** — die Testumgebung hatte keine Quest im localStorage, also rendert die Leeransicht. Kein Produktfehler; nach dem Seeden erschienen alle Elemente.
2. **Viewport-Arithmetik statt computed `bottom`** — `innerHeight - rect.bottom` ergab 37px auf Chrome und 50px auf WebKit bei identischem Produktwert. Ursache: `innerHeight` weicht je nach Engine vom Layout-Viewport ab (gemessen: 844 gegen 664 bei gleichem Geräteprofil). Der computed `bottom`-Wert ist der Produktwert, die Differenz war ein Messartefakt.
3. **Messung während der Übergangsanimation** — `addStyleTag` löst einen Restyle aus; der FAB trägt `transition-all` und lieferte einen Zwischenwert (44.2548px statt 58px). Über den Accessible Name adressiert und `expect.poll` statt Einzelmessung.

#### Ein vorbestehender Testfehlschlag, nicht von diesem Refinement

`proj-12-pwa-installation.spec.ts:865` („der Import-Button faellt nach dem Wegklicken zurueck") schlägt reproduzierbar fehl: Der FAB bleibt nach dem Wegklicken des Hinweises auf y=648 stehen, statt zurückzufallen.

**Ich hatte das zunächst mir zugeschrieben** — mein neues `.bottom-safe-6` steht in derselben `@layer utilities` wie Tailwinds `.bottom-6`, eine Spezifitätskollision lag nahe. **Die Gegenprobe widerlegt das:** Mit `git stash` — also ohne eine Zeile meiner Änderung — fällt derselbe Test. Er stammt aus `7ee010b` (Overlay-Refinement vom selben Tag), das laut INDEX.md mit der Frontend-Phase endet und **nie eine QA durchlaufen hat**. Bewusst nicht hier mitbehoben: Das wäre ein fremdes Feature in diesem Zyklus.

#### Suiten

**Unit 266/266.** E2E gegen den Production-Build über beide Engines: **1033 passed / 55 skipped / 4 unexpected**. Von den vier: einer ist der oben beschriebene vorbestehende Fehlschlag; die drei anderen sind Kompassnadel-Tests aus PROJ-3, die **einzeln grün** laufen — Last-Flakiness im parallelen Gesamtlauf, das in INDEX.md bereits dokumentierte Muster. Build sauber, `/`, `/play` und die Info-Seiten bleiben statisch. Lint 0 Fehler, 7 vorbestehende Warnungen, keine in geänderten Dateien.

#### Nicht abgedeckt und benannt

Das Erscheinungsbild auf einem echten iPhone (Playwright emuliert `env()` nicht — die Mechanik ist belegt, der Augenschein nicht), Edge Case 25 (Sheet-Höhe gegen Dynamic Island), Edge Case 26 (Player-Button gegen Home-Indikator) und Firefox.

### QA Test Results (2026-09-20)

**Getestet gegen:** Production-Build (`next build` + `next start`, Port 3100)
**Engines:** Google Chrome (via `channel: 'chrome'`) und WebKit
**Ergebnis: 9/9 Acceptance Criteria erfüllt, keine Bugs in diesem Refinement, Production-Ready.**

> **Zur Unabhängigkeit:** In derselben Sitzung gebaut. Die zentralen Behauptungen wurden **nicht übernommen, sondern neu gemessen** — auf 6 Viewports × 2 Engines × 5 Screens statt 5 Viewports, und mit 216 einzeln geprüften Bedienelementen statt nur dem jeweils ersten.

#### Der wichtigste Einzelbefund betrifft die Testqualität, nicht das Produkt

Mit der **echten Vorgängerfassung** (`git stash`, also mit dem vom Betreiber gemeldeten Fehler) bestehen die bestehenden Suiten **189 von 189**. Sie hätten den Befund **nie gefangen** — keine einzige Assertion prüfte die Position der Kopfzeile gegen einen Systemleisten-Bereich. Genau diese Lücke schließen die 34 neuen Tests.

#### Acceptance Criteria

| # | Kriterium | Ergebnis |
|---|---|---|
| 1 | Zurück-Pfeil und Burger vollständig unterhalb der Statusleiste | ✅ 216 Bedienelemente geprüft, **kein einziges** unter dem Inset |
| 2 | Schwebender Burger auf `/` unterhalb der Statusleiste | ✅ 24 Fälle, alle korrekt, durchgehend 44×44 |
| 3 | Info-Sticky-Kopfzeile in jedem Scroll-Zustand darunter | ✅ beide Engines, 6 Viewports |
| 4 | Browser-Zustand unverändert | ✅ `padding-top: 0px` in **allen** Fällen |
| 5 | Kopfzeilen-Fläche bis zur obersten Kante, kein Spalt | ✅ `top: 0` in allen 96 Kopfzeilen-Fällen mit Inset |
| 6 | Kopfzeile bleibt 56px, Inset kommt hinzu | ✅ 56→103 (47px) →115 (59px), exakt additiv |
| 7 | Creator-FABs oberhalb des Home-Indikators | ✅ **alle drei** gemessen: 24px → 58px |
| 8 | Kein Player-Bedienelement unter dem Home-Indikator | ✅ voller Quest-Durchlauf, knappste Stelle **249px** |
| 9 | Kein Leerraum auf Geräten ohne Notch | ✅ `0px` überall |

#### Die Kernmessung

| | Browser | Notch 47px | Dynamic Island 59px |
|---|---|---|---|
| Kopfzeile `top` | 0 | **0** | **0** |
| Kopfzeilen-Höhe | 56 | 103 | 115 |
| **Bedienelement `top`** | 6 | **53** | **65** |
| Tap-Höhe | 44 | **44** | **44** |
| Burger auf `/` | 12 | **59** | 71 |
| FAB `bottom` | 24px | **58px** | 58px |

#### Zwei offene Edge Cases geschlossen

**Edge Case 25 (Sheet gegen Dynamic Island) — hält, aber knapp.** Das Stations-Sheet lässt oben **67,5px** frei; bei 59px Dynamic Island bleiben **8,5px Luft**. Die Rechnung der Spec (67px) war richtig. Das Modul-Sheet startet bei 419px, unkritisch. Beide Engines identisch.

**Edge Case 26 (Player unten) — die Ableitung der Spec ist bestätigt.** Vollständiger Quest-Durchlauf auf beiden Engines bis zum Outro. Knappste Stelle ist „Station entdecken" mit **249px** über der Unterkante; bei 34px Home-Indikator über 200px Reserve. Kein Player-Screen braucht unteren Inset — `justify-center` trägt, wie vermutet.

#### Ein Befund meiner Prüfung, der sich als zu strenges Kriterium erwies

Meine Sonde meldete zunächst 24 Verstöße: `border-box` auf der Info-Kopfzeile. **Entkräftet durch Nachmessen** — `InfoPageShell` braucht `box-content` konstruktiv nicht, weil ein inneres `div` die Höhe trägt. Beide Kopfzeilen wachsen identisch (56→103→115), beide Bedienelemente rücken auf 53/65. Kein Bug; `box-content` wäre dort wirkungslose Dekoration.

#### Security-Audit ohne Befund

Die heikelste Frage bei einer CSS-Änderung ist, ob ein Wert von außen steuerbar ist. **Ist er nicht:** Die drei Utilities enthalten ausschließlich `env()`-Werte, kein Custom Property, keine Nutzereingabe — im CSSOM verifiziert. Ein feindlich gesetztes `--safe-area-inset-top: 9999px` bleibt wirkungslos (`padding-top: 0px`, `top: 0`), die Kopfzeile lässt sich nicht aus dem Bild schieben. Markup in der Route erzeugt **0** injizierte Elemente und **0** Dialoge. Kontrast der Kopfzeilen-Elemente **11.6:1** bei 4.5:1 Vorgabe.

#### Gegenproben

| Eingriff | Erwartung | Gemessen |
|---|---|---|
| Oberen Inset ganz entfernen | neue Tests fallen | **16 von 34** |
| Nur `box-content` entfernen | der subtile Fall wird gefangen | **8 von 34**, darunter der Statusleisten-Test |
| Vorgängerfassung gegen **bestehende** Suiten | Lücke sichtbar | **189/189 bestanden** — sie fangen den Fehler nicht |

Produktcode nach allen Gegenproben per `git diff` als byte-identisch zu `HEAD` bestätigt.

#### Gefundene Bugs

**BUG-12 (Medium) — am 2026-09-21 geprüft und korrigiert: kein Produktfehler, sondern ein Fehler im Test. Behoben.**

Die QA vom 2026-09-20 meldete: „der FAB auf `/play` bleibt nach dem Wegklicken des Installations-Hinweises auf y=648 stehen, statt an seine gewohnte Position zurückzufallen." **Diese Zuordnung war falsch** — nachgemessen verhält sich das Produkt korrekt: Der FAB wandert von `bottom: 88px` (y=584) zurück auf `bottom: 24px` (y=648), die Klasse wechselt von `bottom-[calc(env(safe-area-inset-bottom)+5.5rem)]` auf `bottom-6`, das Ereignis `gq:install-hint-changed` feuert genau einmal, der Speicher-Schlüssel wird geschrieben.

**Die Ursache war ein Wettlauf im Test.** Er las den Ausgangswert `oben` unmittelbar nach `fireInstallPrompt()`, während der Button noch animiert (`transition-all`). Gemessen direkt nach dem Ereignis: `bottom: 47.8228px` — ein Zwischenwert; der Endwert `88px` steht erst ~800 ms später. Trifft die Messung stattdessen den **Ruhewert** 648, verlangt die anschließende Assertion `toBeGreaterThan(648)`, dass der Button *unterhalb* seiner Ruheposition landet — unerfüllbar, denn genau dort gehört er hin.

**Über 10 identische Läufe gemessen: 9 rot, 1 grün.** Der grüne bestand nur, weil er die Animation zufällig bei 47.8px erwischte. Das Produkt war in allen 10 Läufen richtig. Der Test war also nicht nur falsch, sondern in beide Richtungen unzuverlässig — er hätte einen echten Regress ebenso zufällig durchgelassen.

**Behoben** durch Warten auf den angehobenen Zustand vor der Messung, und durch Prüfen des berechneten `bottom`-Werts statt der Fensterposition: Er ist der Vertrag der Komponente und hängt nicht an Viewport-Höhe oder Scrollstand. **Stabilität: 5 von 5 Läufen grün** (vorher 1 von 10). **Gegenprobe:** Nagelt man den FAB dauerhaft auf die angehobene Position — also genau der Fehler, den BUG-12 behauptete —, fällt der Test auf **beiden Engines**. Er fängt den Regress jetzt wirklich, statt ihn zu würfeln.

Produktcode nach der Gegenprobe per `git diff` als byte-identisch zu `HEAD` bestätigt. **Keine Produktdatei wurde angefasst.**

*Lehre für künftige Läufe: Ein Element mit `transition-*` darf nicht unmittelbar nach dem auslösenden Ereignis vermessen werden. Das war in dieser Sitzung der zweite Fall dieser Art — der erste war der FAB, der mitten in der Animation `44.2548px` statt `58px` lieferte.*

#### Suiten

**Unit 266/266.** E2E gegen den Production-Build über beide Engines: **1036 passed / 55 skipped / 1 unexpected**. Der eine Fehlschlag ist ein Kompassnadel-Test aus PROJ-3 (nicht angefasst), der **einzeln 9/9 grün** läuft — Last-Flakiness im parallelen Lauf, das in INDEX.md dokumentierte Muster. Build sauber, Lint 0 Fehler / 7 vorbestehende Warnungen.

#### Beobachtungen ohne Bug-Status

- **Das Sheet hat gegen Dynamic Island nur 8,5px Reserve.** Kein Fehler, aber die Stelle, die zuerst kippt, falls `h-[92dvh]` je verkleinert wird.
- **Die lokalen Konsolenfehler stammen von Vercel Analytics**, das nur in Production existiert. Gegengeprüft auf `/impressum` und `/datenschutz` — also auf Routen, die dieses Refinement nicht anfasst: dort ebenso. Vorbestehend.
- **Firefox bleibt ungetestet** (Binary fehlt trotz gegenteiliger `--dry-run`-Meldung). Risiko gering: `env()` ist seit Jahren Standard, und zwei unabhängige Engines messen identisch.

#### Drei Messfehler offen benannt (das Produkt war jeweils richtig)

1. **Ein `env()`-Fallback als Prüfmittel ist wirkungslos.** Mein erster Ansatz versorgte `env(safe-area-inset-top, 59px)` mit einem Fallback — der greift nur, wenn die Variable *nicht unterstützt* wird. Mit `viewportFit: "cover"` löst sie zu einem echten `0px` auf, der Fallback bleibt außen vor (gemessen: `padMitFallback99` ergab `0px`, nicht `99px`). **Damit kann keine Testumgebung einen echten oberen Inset erzeugen** — das Überschreiben der Utilities ist der einzig gangbare Weg, nicht bloß der bequemere.
2. **Falsches Sheet gemessen.** Mein Selektor `button[aria-label*="Menü"]` traf das Burger-Menu („Menü öffnen") statt der Stations-Aktionen; gemessen wurde das Navigationspanel (`top: 0, h: 844`), was wie ein fehlender Freiraum aussah. Über `aria-label="Stations-Aktionen"` korrekt: 67,5px.
3. **Zwei abgestürzte Server-Läufe** durch parallele Sonden gegen denselben Port — das in INDEX.md dokumentierte Muster. Nur eine Sonde gleichzeitig.

### Deployment (2026-09-21)

**Deployt nach Production** — Tag `v1.37.0-PROJ-12`, Commits `7998b2a` (Frontend), `e7ca31a` (QA), `fc4e91b` (BUG-12). Live auf https://geoquesty.vercel.app, Vercel deployte automatisch von `main`, live nach ~45 Sekunden.

**Pre-Deployment-Checks:** Build sauber (`/`, `/play` und Info-Seiten weiterhin statisch), Lint 0 Fehler / 7 vorbestehende Warnungen, QA approved ohne Bugs, keine Secrets versioniert (nur `.env.local.example`). Die zwei mitgeschobenen Commits `ec90b96` und `140c903` sind reine Spec-Refinements ohne Produktcode — geprüft, nicht angenommen.

**Dass die neue Fassung wirklich ausgeliefert wird, ist am Hash belegt:** Der CSS-Chunk wechselte von `9124ee0237bfd044.css` auf `100393cc4531aacb.css`, und nur der neue enthält `pt-safe-top`. Das Live-CSS ist **byte-identisch** zum lokalen Build (`cmp` ohne Abweichung). Alle drei Utilities stehen live mit den richtigen `env()`-Werten, `box-sizing:content-box` ist vorhanden.

**Im Live-Browser auf beiden Engines gemessen, alle Werte deckungsgleich mit den lokalen:**

| | Browser | Inset 59px |
|---|---|---|
| Kopfzeile `top` | 0 | **0** — kein durchsichtiger Spalt |
| Kopfzeilen-Höhe | 56 | **115** (=56+59) |
| **Bedienelement `top`** | 6 | **65** — vollständig unter der Statusleiste |
| Tap-Höhe | 44 | **44** — nicht gestaucht |
| Burger auf `/` | 12 | **71** |
| FAB `bottom` | 24px | **58px** |

Der Browser-Zustand ist damit auch in Production unverändert (`padding-top: 0px` überall) — die Zusicherung an den Betreiber ist eingelöst.

**Alle 10 Endpunkte HTTP 200** mit 0,06–0,32 s. Security-Header aktiv inkl. HSTS (`max-age=63072000; includeSubDomains; preload`), `x-frame-options: DENY`, `nosniff`.

**Nachbarfeatures unbeschädigt** — wichtig, weil dieses Deployment die geteilte `InfoPageShell` anfasst: `/about` mit `FAQPage` und 1× Ko-fi, `/anleitung` weiterhin **0 Treffer** für den zurückgehaltenen Prompt, die Eyebrows von `/anleitung`, `/impressum` und `/datenschutz` vorhanden, alle drei PWA-Icons byte-identisch zum Repository.

**WebKit mit 0 Konsolenfehlern und 0 fehlgeschlagenen Requests.**

**Zwei Auffälligkeiten geprüft statt weggewunken:** Chrome meldete 2 fehlgeschlagene `?_rsc=`-Requests — ein ruhiger Besuch von `/`, `/play` und `/about` ergibt **0 fehlgeschlagene Requests**; sie stammen aus der schnellen Testnavigation. Der verbleibende Konsolenfehler ist `/favicon.ico`: Ein Besuch von `/` erzeugt **0 Antworten ≥400**, Chrome fragt die Datei von sich aus an. Vorbestehend, seit dem Deploy vom 2026-09-20 dokumentiert.

**Nicht belegbar und weiterhin offen:** das Erscheinungsbild auf einem echten iPhone. Keine Testumgebung kann `env(safe-area-inset-top)` mit einem echten Wert belegen (in dieser QA gemessen: ein `env()`-Fallback greift nicht, weil die Variable mit `viewportFit: "cover"` zu einem echten `0px` auflöst). Die Mechanik ist belegt, der Augenschein bleibt dem Betreiber.

---

## Refinement 4 (2026-09-21) — Auf `/` rückt nur das Icon, nicht der Inhalt

**Status:** Spec aktualisiert, Umsetzung offen (`/frontend`)

### Der Befund

Gerätetest des Betreibers auf dem installierten iPhone: *„alle seiten gut aussehen im full screen … außer die Seite `/`."* Damit sind acht von neun Screens am echten Gerät bestätigt — und die eine Ausnahme ist genau die Stelle, die baulich anders ist.

### Die Ursache, gemessen

| | ohne Inset | mit 59px |
|---|---|---|
| **`/` Logo** | 24 | **24** — unverändert |
| `/` Burger-Icon | 12 | 71 — rückt korrekt |
| `/play` Inhalt | 56 | **115** — rückt mit |

Auf den acht funktionierenden Screens ist die Kopfzeile ein **echtes Element im Fluss**. Sie wächst um den Inset, und alles darunter verschiebt sich automatisch mit.

Auf `/` gibt es keine Kopfzeile. Das Burger-Icon ist `absolute` positioniert und kostet **0px Layout-Höhe** — das war der ganze Zweck von BUG-10 (2026-09-10), damit Logo, Headline und beide Mode-Cards ohne Scrollen passen. Refinement 3 hat den Inset an den Wrapper dieses Icons gehängt: die eine Stelle auf `/`, die per Konstruktion nichts verschieben kann. Das Icon rückt, der Inhalt bleibt bei 24px und liegt unter der Statusleiste.

### Warum die QA das nicht gefunden hat

Die neun Acceptance Criteria von Refinement 3 prüfen **Bedienelemente** — Zurück-Pfeil, Burger, Kopfzeile, FABs. Auf `/` ist das Burger-Icon das einzige Bedienelement, und es war korrekt. Das Logo ist kein Bedienelement und stand in keinem Kriterium; die 216 gemessenen Elemente enthielten es nie.

Das ist eine Lücke im Kriterienkatalog, nicht in der Messung: „Bedienelemente liegen frei" ist enger als „der Screen sieht richtig aus". Refinement 3 hat die Frage nie gestellt, ob auch *Inhalt* unter die Statusleiste geraten kann.

### Der gewählte Weg

**Der Inset kommt zusätzlich auf `<main>`**, additiv zu den bestehenden 24px (`py-6`). Logo und alles darunter rücken mit; das Icon behält seinen eigenen Inset an seinem `absolute`-Wrapper.

Erwogen und **verworfen: `/` bekommt doch eine echte Kopfzeile.** Der Betreiber tendierte zunächst dorthin, aus Sorge um das Logo — die Sorge war gegenstandslos (das Logo ist ein eigenes Element in der Seitenmitte und von beiden Wegen unberührt). Gegen die Kopfzeile sprechen zwei gemessene Gründe: Sie kostet 56px, und der Startscreen hat sie nicht (gemessen 2026-09-10: Inhalt endet dann bei 615 von 640, auf 320×568 fehlen 45px) — das Kriterium „Logo, Headline und beide Mode-Cards ohne Scrollen sichtbar" fiele, und BUG-10 wäre zurückgenommen. Dazu bräuchte die Zeile weder Zurück-Pfeil (oberste Ebene) noch Titel (das Logo zeigt den Namen) und wäre eine leere Leiste für ein Icon.

**Der entscheidende Unterschied:** Weg A kostet **null zusätzliche Höhe**. Der Platz, der oben entsteht, ist genau der, den die Statusleiste ohnehin verdeckt — er war nie nutzbar.

### Was das nicht bricht

Im Browser ist `env(safe-area-inset-top)` weiterhin `0px`; `/` verhält sich dort unverändert. Auf 360×640 — dem Viewport des Nicht-Scrollen-Kriteriums — bleibt es erfüllt.

**Ein Grenzfall, geprüft und eingeordnet:** Auf 320×568 scrollt `/` **schon heute** um 13px (vorbestehend, seit 2026-09-19 in INDEX.md dokumentiert). Mit Inset wächst das. Meine erste Messung meldete +72px — **das war unrealistisch simuliert:** Ein Gerät mit 320×568 ist ein iPhone SE mit Home-Button und **ohne Notch**; sein oberer Inset ist 20px, nicht 59px (die 59px gehören zu Dynamic Island, erst ab 390px Breite). Mit realistischen 20px liegt der Überlauf bei 33px statt 13px. Kein neuer Fehler, sondern ein vorbestehender, der um 20px wächst.

### Für `/frontend`

- Der Inset gehört **additiv** zum bestehenden `py-6`, nicht als Ersatz — sonst verliert der Screen im Browser seine 24px Kopfabstand.
- Das `pt-safe-top` am `absolute`-Wrapper des Icons **bleibt**. Beide Insets sind nötig: Der eine schiebt das Icon, der andere den Inhalt; sie stapeln sich nicht, weil der Wrapper aus dem Fluss ist.
- Der bestehende Wächter auf die y-Position des Logos in `tests/proj-12-safe-area.spec.ts` prüft heute den **Browser**-Zustand (y=12 für den Burger). Er bleibt richtig. Neu dazu gehört ein Wächter, dass das **Logo** unter simuliertem Inset frei liegt — genau die Assertion, deren Fehlen diesen Befund durchgelassen hat.

### Abnahme

Wie bei Refinement 3 kann keine Testumgebung einen echten oberen Inset erzeugen. Prüfbar ist die Mechanik unter simuliertem Inset, der unveränderte Browser-Zustand und das Nicht-Scrollen auf 360×640. Das Erscheinungsbild prüft der Betreiber am Gerät — dieses Mal mit dem Blick auf das Logo, nicht nur auf das Menu.

### Was dieses Refinement über das vorige sagt

Das Overlay-Refinement vom selben Tag schloss mit: *„Nicht abgedeckt und benannt: die Safe Area auf einem echten iPhone … konstruktiv abgedeckt, am Gerät zu bestätigen."* Die Vorhersage war richtig — und zugleich zu eng: Sie sah die Lücke unten, wo sie behandelt war, und nicht oben, wo sie nie behandelt worden war. Der Befund kam aus genau dem Gerätetest, den der Satz angekündigt hatte.

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


### QA Refinement 2026-09-20 — Service Worker nur in Production

**Ergebnis: 6/6 Acceptance Criteria erfüllt, keine Bugs jeglicher Schwere, Production-Ready.**

Weil das Refinement in derselben Sitzung gebaut wurde, habe ich die zentralen Behauptungen **nicht übernommen, sondern mit eigenen Sonden neu gemessen** — und auf **beiden Engines**, während die Frontend-Phase nur WebKit geprüft hatte.

| # | Kriterium | Ergebnis | Nachweis (WebKit / Chrome 152) |
|---|---|---|---|
| 1 | Kein Worker auf localhost (dev) | **PASS** | `worker=0 controller=false caches=[]` auf beiden Engines |
| 2 | Production registriert unverändert | **PASS** | `worker=1 controller=true caches=["geoquest-offline-v1"]` auf beiden |
| 3 | Browser zeigt eigene Fehlermeldung | **PASS** | „Could not connect to the server" / `net::ERR_CONNECTION_REFUSED` |
| 4 | Bestehender Worker wird abgeräumt | **PASS** | 1 Worker + Cache → 0/0 nach einem Aufruf, `controller:false` beim zweiten |
| 5 | E2E-Suite bleibt lauffähig | **PASS** | PROJ-12 **67 passed / 7 skipped / 0 failed** |
| 6 | Offline-Seite, Manifest, sw.js erreichbar | **PASS** | alle drei HTTP 200 auf beiden Engines |

**Der gemeldete Fehler ist direkt gegengeprüft.** Mit der **alten** Fassung zeigen beide Engines bei gestopptem Dev-Server `Titel: "Geo Quest — keine Verbindung"` und den Text „KEINE VERBINDUNG" — exakt der Betreiber-Befund. Mit der neuen Fassung meldet der Browser seinen eigenen Verbindungsfehler. Damit ist nicht nur das Kriterium erfüllt, sondern der **konkrete Symptombericht reproduziert und als behoben nachgewiesen**.

**Die `NODE_ENV`-Entscheidung ist empirisch belegt, nicht nur argumentiert.** Gegenprobe mit einer Hostname-Prüfung eingespielt und gemessen: Der Worker registriert sich auf `localhost:3100` **nicht** (`worker=0`), und die PROJ-12-Suite **hängt** dann, statt sauber rot zu werden (7,7 s regulär gegen Timeout). Eine Hostname-Lösung hätte die 37 Tests also nicht nur entwertet, sondern unlesbar gemacht.

**Über die Spec hinaus geprüft — Security-Audit ohne Befund.** Das Aufräumen löscht Caches auf einer **geteilten Origin**; Über-Löschung wäre ein echter Schaden. Mit fünf gezielt ähnlichen Cache-Namen gemessen: Gelöscht wird **ausschließlich** `geoquest-offline-v1`. Erhalten bleiben `fremdes-projekt-v9`, `GEOQUEST-gross` (Groß-/Kleinschreibung), `xgeoquest-tarnung` (Präfix-Täuschung) und `geoquest` (ohne Bindestrich). Dazu: 0 Konsolenfehler auf `/`, `/play`, `/create` im Dev-Modus, keine Secrets im ausgelieferten HTML.

**Regression:** Unit **226/226**. **Chrome 152: 463 passed / 23 skipped / 0 failed. Mobile Safari: 457 passed / 29 skipped / 0 failed.** Build sauber, Lint 0 Fehler (7 Warnungen vorbestehend, keine in den geänderten Dateien). Die 3 PROJ-12-Skips sind nachvollzogen und dokumentierte Engine-Grenzen, keine stillgelegten Tests. Der PROJ-7-Fehlschlag aus der Frontend-Phase ist hier **nicht** aufgetreten — bestätigt als Last-Flakiness, nicht als Regression.

**Gegenproben:** Unit-Tests — mit der alten Fassung fallen **genau 4 der 7**, die 3, die bestehen müssen, bestehen (unabhängig nachvollzogen). E2E — registriert sich der Worker nie, fallen **2 Tests**. Produktcode nach jeder Gegenprobe per `diff` als byte-identisch bestätigt.

**Vier Fehler in meinen eigenen Tests und Messungen, offen benannt — das Produkt war jedes Mal richtig:**
1. Ein Test erwartete **0 Konsolenfehler**; lokal schlägt aber Vercel Analytics fehl (`_vercel/insights/script.js`, 404). Gegenmessung mit **blockiertem** Worker: dieselben 3 Fehler. Der Test prüft jetzt JavaScript- und Service-Worker-Fehler statt Infrastrukturrauschen.
2. Beim Härten wartete ein Test nur auf die **Registrierung** statt auf den **gefüllten Cache** — auf WebKit reproduzierbar rot.
3. `navigator.serviceWorker.ready` hängt unendlich, wenn sich kein Worker registriert; eine Gegenprobe lief damit ins Timeout statt klar fehlzuschlagen. Ersetzt durch `waitForFunction` mit Timeout.
4. Der `line`-Reporter mit `tail -1` verschluckte Fehlschläge — fünf Läufe sahen grün aus, während der JSON-Reporter 1–2 rote Tests auswies. Alle Stabilitätsaussagen hier stammen aus dem **JSON-Reporter**.

**Ein eigener Test wurde nach mehreren Reparaturversuchen entfernt statt stillgelegt.** Die Cache-Inhalts-Prüfung blieb auf WebKit unzuverlässig (1 von 5 Läufen rot) — bei nachweislich korrektem Produkt: Unabhängig gemessen enthält der Cache vor *und* nach der Navigation exakt `/offline.html`. Da `proj-12-pwa-installation.spec.ts:183` dieselbe Zusicherung **stabil** abdeckt, war die zweite Fassung redundant. Ein Test, der ohne Produktfehler rot wird, kostet mehr Vertrauen als er Deckung bringt. Die Begründung steht als Kommentar an seiner Stelle. Verbleibende Suite: **6 Tests, 6 von 6 Läufen grün**.

**Nicht abgedeckt:** Das Verhalten **auf Vercel** — geprüft wurde gegen `next start`. Der Deploy muss bestätigen, dass sich der Worker in Production weiterhin registriert; das ist die einzige offene Zusicherung. Dazu unverändert: Firefox (Binary fehlt) und ein echtes Android-Gerät.

### QA Refinement 2026-09-20 — Installations-Hinweis als schwebendes Overlay

**Ergebnis: 10/10 Acceptance Criteria erfüllt, keine Bugs jeglicher Schwere, Production-Ready.**

Weil das Refinement in derselben Sitzung gebaut wurde, habe ich die zentralen Behauptungen **nicht übernommen, sondern mit eigenen Sonden neu gemessen** — und an zwei Stellen schärfer geprüft als die Frontend-Phase.

#### Acceptance Criteria

| # | Kriterium | Ergebnis |
|---|---|---|
| 1 | `position: fixed`, nicht im Seitenfluss | ✅ `fixed`, `z-50`, Unterkante bündig (Abstand 0) auf beiden Seiten, beiden Engines |
| 2 | Inhalt scrollt darunter weiter, Hinweis bleibt stehen | ✅ gemessen über drei Scroll-Schritte: erste Karte 198 → −102 → −396, Hinweis konstant bei 568 (Chrome) bzw. 592 (WebKit) |
| 3 | Dokumenthöhe unverändert | ✅ **0px** Beitrag in Höhe **und Breite**, beide Seiten, beide Engines |
| 4 | `/` scrollt auf 360×640 weiterhin nicht | ✅ `scrollHeight == innerHeight == 640` (Chrome), 664 (WebKit) |
| 5 | Genau eine Zeile, kein Eyebrow/Überschrift/Beschreibung | ✅ 0 `<li>`, kein „Tipp", kein „Geo Quest als App", kein „Browser-Leiste" |
| 6 | Höhe auf Android und iOS gleich | ✅ **72px auf beiden**, im selben Viewport gemessen |
| 7 | Import-Button unverdeckt, fällt nach Wegklicken zurück | ✅ keine Überlappung, FAB an seinem Mittelpunkt oberstes Element, rückt beim Wegklicken exakt 64px zurück |
| 8 | Inhalt oberhalb der Safe Area | ✅ `padding-bottom: 14px`, Schließen-X endet 15px über dem Rand (Einschränkung siehe unten) |
| 9 | Liegt unter Menu/Dialog/Sheet | ✅ 280px Überlappung, oben liegt das **Menu** (z 1100 vs 50); Menu bleibt bedienbar und schließt per Escape |
| 10 | Letzte Quest-Karte erreichbar | ✅ 16px Luft, Kartenmitte klickbar — und am Bildschirm abgenommen |

#### Zwei Messungen, die ich schärfer geführt habe als die Frontend-Phase

**Erstens die Layout-Höhe.** Die Frontend-Phase isolierte den Beitrag des Overlays über die Höhe. Das lässt eine Lücke: Ein `fixed` Element kann die Seite auch über die **Breite** beeinflussen (horizontaler Überlauf, Scrollbalken). Nachgeholt: Der Beitrag ist **0px in beiden Achsen**, auf beiden Seiten und beiden Engines.

**Zweitens AC 2**, das eigentliche Anliegen des Betreibers („hinter dem man die Seite noch scrollen kann"). Die Frontend-Phase belegte es indirekt über `position: fixed`. Ich habe es direkt gemessen: über drei Scroll-Schritte bewegt sich der Inhalt (erste Karte 198 → −102 → −396), der Hinweis steht still, und unter dem Overlay liegt nachweislich eine **Quest-Karte** (per `elementFromPoint` mit kurzzeitig abgeschaltetem `pointer-events`).

#### Gemessen statt geschätzt

- **Kontrast:** schlechtester Wert **6.61:1** (der Pfeil „→" im iOS-Zweig), Android 9.64:1, iOS-Text 16.1:1 — Vorgabe 4.5:1
- **Tap-Ziele:** Schließen 44×44, Installieren 238–348×44 auf **acht Viewports** (320×568 bis 1440×900)
- **Kein Überlauf, kein abgeschnittener Text** auf keinem der acht Viewports; ab 768px bleibt der Hinweis auf 430px begrenzt und zentriert (Design-System-Containerbreite)
- **Edge Case 18** (Querformat 640×360): Hinweis 430px breit, mittig, Tap-Ziele unverändert 44px, kein Überlauf

#### Zusätzlich geprüft, in der Spec nicht gefordert

**Tastaturbedienung:** Fokusreihenfolge `Zurück > Menü > Installieren > Hinweis ausblenden` — der Hinweis kommt zuletzt und drängt sich nicht vor. Das X ist fokussierbar und per Enter auslösbar.

#### Security-Audit ohne Befund

- **XSS über den Quest-Namen** (`<img src=x onerror=alert(1)><script>alert(2)</script>`): 0 Dialoge, **0** injizierte `<img>`, **0** injizierte `<script>`; der Hinweis rendert daneben unbeschadet
- **Manipulierter `localStorage`-Schlüssel** in sechs Varianten (Markup, `NaN`, negativ, absurd groß, JSON-Objekt, leer): **0 `pageerror`** in allen sechs, App durchgehend bedienbar
- **0 externe Requests** im Production-Build

Ein Grenzfall geprüft statt weggewunken: Ein absurd großer Zeitstempel (`1e22`) unterdrückt den Hinweis. Das ist **korrekt** — eine negative verstrichene Zeit liegt definitionsgemäß „innerhalb von 30 Tagen" —, und erreichbar nur, indem man den eigenen Speicher manipuliert und damit den eigenen Hinweis unterdrückt. Kein Befund.

#### Gegenproben — greifen die Tests wirklich?

Bewusst **andere** Eingriffe als in der Frontend-Phase, damit die Gegenprobe nicht dieselbe Stelle zweimal trifft:

| Eingriff | Erwartung | Ergebnis |
|---|---|---|
| Listen-Freiraum auf `/play` entfernt (Edge Case 19) | der zuständige Wächter fällt | **genau 2** (einer je Engine) |
| iOS-Kurzform durch die alte zweischrittige `<ol>` ersetzt | der `<li>`-Wächter fällt | **genau 1** (nur WebKit fährt den iOS-Zweig) |

Produktcode danach per Prüfsumme als unverändert bestätigt, keine Gegenproben-Reste im Baum.

Die **7 Skips** sind nachvollzogen und keine stillgelegten Tests: 5× eine unabhängig dokumentierte WebKit-Grenze bei Offline-Navigation, 2× bewusst engine-spezifische Prüfungen des iOS- bzw. Nicht-iOS-Zweigs.

#### Regression

**Unit 226/226. E2E über beide Engines: 978 passed / 52 skipped / 0 failed.** Build sauber, Lint 0 Fehler (7 Warnungen, alle vorbestehend), `/` und `/play` bleiben statisch (`○`).

Der geteilte Hook und der Import-FAB berühren PROJ-1, PROJ-5 und PROJ-6 — alle Suiten grün.

#### Beobachtungen ohne Bug-Status

1. **Der Import-FAB überlappt die letzte Quest-Karte** samt deren Titel. Gegengeprüft mit weggeklicktem Hinweis: **identisches Verhalten** — vorbestehend aus PROJ-6, von diesem Refinement unberührt.
2. **Lokale Konsolenfehler** stammen von Vercel Analytics, das nur in Production existiert; sie treten mit harmlosem Quest-Namen genauso auf (4 statt 5, die Differenz ist ein Favicon-404).

#### Nicht abgedeckt und benannt

- **Die echte Safe Area** auf einem iPhone mit Home-Indikator: Playwright meldet `env(safe-area-inset-bottom)` als 0, gemessen wurde also der 14px-Grundwert des Design Systems. Konstruktiv abgedeckt, am Gerät zu bestätigen.
- **Bildschirmtastatur** (von Playwright nicht emulierbar)
- **Firefox** (Binary fehlt trotz gegenteiliger `--dry-run`-Meldung; Risiko gering, da Firefox `beforeinstallprompt` nicht bereitstellt und die iOS-Erkennung dort `false` liefert)
- **Der echte `beforeinstallprompt`** — im Test nachgestellt, weil er an Chromes Engagement-Heuristiken hängt

#### Production-Ready: **JA**

## Deployment

### Deploy Refinement 2026-09-20 — Service Worker nur in Production

**Am 2026-09-20 nach Production deployt** (Commit `5f758b4`) — live auf https://geoquesty.vercel.app und dort verifiziert. Vercel deployte automatisch von `main`.

**Der Kern ist am live ausgelieferten Bundle bestätigt, nicht an der lokalen Datei — und das Ergebnis ist besser als erwartet:** Alle 12 ausgelieferten JS-Chunks einzeln abgerufen. `register("/sw.js")` steht in `1e73f5b24345fad4.js`; **`getRegistrations` kommt in keinem einzigen Chunk vor**. Der gesamte Dev-Aufräum-Zweig wurde vom Build als toter Code entfernt — die `NODE_ENV`-Lösung wirkt zur Bauzeit und kostet in Production **null Bytes**. Eine Hostname-Prüfung hätte diesen Zweig dauerhaft mit ausgeliefert.

**Die zentrale Zusicherung des Refinements ist in Production eingelöst:** Der Worker registriert sich auf **beiden Engines** weiterhin — gemessen `worker=1`, `state=activated`, `controller=true` nach rund 2 Sekunden, Cache exakt `["geoquest-offline-v1" → "/offline.html"]`. Der Android-Installationsweg und die Offline-Fallback-Seite bleiben damit erhalten.

**Die Offline-Fallback-Seite funktioniert live:** Nach gefülltem Cache und getrennter Verbindung zeigt eine Navigation `Titel: "Geo Quest — keine Verbindung"` mit dem Text „Geo Quest braucht eine Internetverbindung, um zu starten" — die eigene Seite, nicht Chromes Dinosaurier.

Alle **10 Endpunkte HTTP 200** mit korrektem Content-Type und 0,06–0,31 s (sieben Routen plus `offline.html`, `manifest.webmanifest`, `sw.js`). Alle vier PWA-Icons werden als `image/png` ausgeliefert. Security-Header aktiv inkl. HSTS; `sw.js` weiterhin mit `max-age=0`, eine neue Version kann also nicht von einem HTTP-Cache festgehalten werden.

**Smoke-Test auf beiden Engines bestanden:** `/`, `/play` und `/create` rendern vollständig. **WebKit mit 0 Konsolenfehlern und 0 fehlgeschlagenen Requests.**

**Nachbarfeatures unbeschädigt:** `/about` mit `FAQPage`-JSON-LD und genau 1× Ko-fi, `/anleitung` weiterhin mit **0 Treffern** für den zurückgehaltenen Prompt (PROJ-14), Offline-Seite inhaltlich unverändert.

**Eine Auffälligkeit geprüft statt weggewunken:** Chrome meldete einen Konsolen-404, WebKit nicht. Ursache gefunden: `/favicon.ico` liefert 404, weil nie ein Favicon referenziert wurde — Chrome fragt es von sich aus an, WebKit nicht. **Vorbestehend und unabhängig von diesem Deploy** (gegen den Vorgänger-Commit geprüft: dort ebenfalls kein Favicon referenziert). Die vier echten PWA-Icons unter `/icons/` liefern alle 200. Kein Regressionsbefund; ein Favicon wäre ein eigenes, kleines Thema.

**Drei Messfehler offen benannt, alle meine — das Produkt war jedes Mal richtig:** Zwei Sonden meldeten einen leeren Cache und damit eine ausbleibende Offline-Seite. Ursache: Ein `waitForFunction`, das `caches` im Sekundentakt abfragt, kommt dem `install`-Schritt des Workers in die Quere; der Poll meldete „fertig", während der Readback noch leer war. Mit einem schlichten festen Warten von 4 s war das Ergebnis eindeutig und reproduzierbar korrekt. Dritter Fall: Eine frühe Sonde las den Cache 0 ms nach `load` und schloss daraus auf einen Fehler — der Worker braucht rund 2 s bis `activated`.

**Nicht abgedeckt:** Firefox (Binary weiterhin nicht lauffähig) und ein echtes Android-Gerät. Beides unverändert gegenüber dem vorherigen Stand und für dieses Refinement ohne Risiko, da nur die Registrierungsbedingung geändert wurde.

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

### In Production verifiziert (2026-09-19)

**Alle 14 Endpunkte liefern HTTP 200** mit korrektem Content-Type — die sieben Routen (0,07–0,22 s), Manifest (`application/manifest+json`), `sw.js`, `offline.html` und alle vier Icons.

| Prüfung | Ergebnis |
|---|---|
| Service Worker | registriert, **kontrolliert die Seite**, Scope `https://geoquesty.vercel.app/` |
| Cache nach Besuch aller sieben Routen | **`["/offline.html"]`** — genau ein Eintrag |
| Offline-Start | eigene Seite: „Keine Verbindung / … zum Starten"; kein „offline spielen" |
| „Erneut versuchen" mit Netz | App startet wieder |
| Hinweis auf iOS/WebKit | `/` kompakt („Teilen → Home-Bildschirm"), `/play` voll mit beiden Schritten, `/create` keiner |
| Icons | alle vier **byte-identisch** zum Repository (`cmp` gegen `public/icons/`) |
| `apple-touch-icon`, `apple-mobile-web-app-*` | im HTML gesetzt |
| Security-Header | auf allen neuen Dateien aktiv, inkl. **HSTS**; `sw.js` mit `max-age=0` |
| Nachbarseiten | `/about` trägt `FAQPage` + 1× Ko-fi; `/anleitung` weiterhin **ohne** Prompt, mit „Bald" |
| Erstbesuch wie ein echter Nutzer | **0 Konsolenfehler, 0 fehlgeschlagene Requests** |

**Zwei Auffälligkeiten geprüft und beide entkräftet:**

1. **~25 fehlgeschlagene `?_rsc=`-Requests** im ersten Messlauf sahen nach einem Fehler aus. Gegenmessung **ohne** Service Worker: **24** — praktisch dieselbe Zahl. Es sind abgebrochene Next.js-Prefetches durch die schnelle Testnavigation, nicht vom Feature verursacht. Ein ruhiger Erstbesuch zeigt 0.

2. **Der Installations-Hinweis erschien auf Desktop-Chrome nicht.** Einzeln nachgemessen: keine Sperrbedingung greift (nicht standalone, nicht weggeklickt, Erststart erledigt) — **Chrome feuert `beforeinstallprompt` schlicht nicht**, weil seine Engagement-Heuristik einen Erstbesuch nicht genügen lässt. Mit simuliertem Event erscheint der Hinweis sofort. Auf WebKit ist er ohnehin live sichtbar. Erwartetes Verhalten, in der Spec als Grenze benannt.

**Nicht prüfbar geblieben:** Offline-Navigation auf WebKit (`setOffline` + `goto` wirft dort „WebKit encountered an internal error" — dieselbe Playwright-Grenze wie lokal, unabhängig bestätigt) und das echte Homescreen-Icon auf einem Gerät.

**Offen für den Betreiber:** `apple-mobile-web-app-status-bar-style` steht auf `black-translucent`. Die Spec führt die Statusleistenfarbe als offene Frage, die nur am echten iPhone zu beurteilen ist.

### Deploy Refinement 2026-09-20 — Installations-Hinweis als schwebendes Overlay

**Am 2026-09-20 nach Production deployt** (Tag `v1.34.0-PROJ-12`, Commit `7ee010b`) — live auf https://geoquesty.vercel.app und dort verifiziert. Vercel deployte automatisch von `main`.

**Der Kern ist in Production bestätigt, am live ausgelieferten Code gemessen — nicht an der lokalen Datei.** Alle Werte decken sich **exakt** mit den lokalen Messungen:

| Messung | Chrome (live) | WebKit (live) |
|---|---|---|
| `position` / `z-index` | `fixed` / 50 | `fixed` / 50 |
| Höhe | 72px | 72px |
| **Layout-Beitrag** | **0px** | **0px** |
| Inhalt | „ALS APP INSTALLIEREN", 0 `<li>` | „Teilen → Home-Bildschirm", 0 `<li>` |
| FAB überlappt Hinweis | nein (Unterkante 552) | nein (Unterkante 576) |
| Luft zur letzten Quest-Karte | 16px | 16px |
| FAB nach Wegklicken | 616 (**+64px**) | 640 (**+64px**) |
| `padding-bottom` (Safe Area) | 14px | 14px |

Das neue Ereignis `gq:install-hint-changed` ist im ausgelieferten Bundle `1befb48831a57cd2.js` nachgewiesen. **WebKit mit 0 Konsolenfehlern.**

Alle **10 Endpunkte HTTP 200** mit 0,06–0,08 s, Security-Header aktiv inkl. HSTS. Nachbarfeatures unbeschädigt: `/about` mit `FAQPage` und 1× Ko-fi, `/anleitung` weiterhin **0 Treffer** für den zurückgehaltenen Prompt, alle vier PWA-Icons **byte-identisch** zum Repository, und der Service Worker cacht weiterhin nur `/offline.html`.

**Zwei Auffälligkeiten geprüft statt weggewunken:** Die `?_rsc=`-Fehlschläge traten nur bei der schnellen Testnavigation auf — ein **ruhiger Erstbesuch** auf `/` und `/play` ergibt **0 Antworten ≥400**; es sind abgebrochene Next.js-Prefetches, das bereits im Deploy vom 2026-09-19 dokumentierte Muster. Der verbleibende Konsolen-404 ist `/favicon.ico`, ebenfalls vorbestehend und dort schon festgehalten (Chrome fragt es von sich aus an).

**Zwei Fehler in meiner eigenen Messung, offen benannt:**

1. Mein erster „Ist es live?"-Test suchte `fixed bottom-0` im **Server-HTML** — der Hinweis rendert aber ausschließlich clientseitig, der Marker konnte dort nie erscheinen. Der Check lief zehnmal ins Leere und hätte „nicht deployt" gemeldet, während der Deploy längst live war. Korrigiert durch eine Suche nach `gq:install-hint-changed` in den ausgelieferten JS-Bundles.
2. Mein Icon-Check fragte `icon-maskable-192.png` und `icon-maskable-512.png` ab und meldete zwei 404. **Diese Dateien gibt es nicht und gab es nie** — die echten heißen `icon-maskable.png` und `apple-touch-icon.png`. Alle vier tatsächlich referenzierten Icons liefern 200 und sind byte-identisch zum Repository.

**Nicht abgedeckt und unverändert benannt:** die echte Safe Area auf einem iPhone mit Home-Indikator (am Gerät zu begutachten), Bildschirmtastatur, Firefox, und der echte `beforeinstallprompt`.
