# PROJ-15: Medien-Links — YouTube, Vimeo, Cloud-Speicher und Wikimedia

## Status: Deployed
**Created:** 2026-09-28
**Last Updated:** 2026-10-04

## Dependencies
- Requires: PROJ-4 (Player — Modul-Rendering): Das Video-Modul bekommt eine zweite Darstellung (Plattform-Player hinter Platzhalter); Bild-, Audio- und Video-Modul spielen umgewandelte Cloud- und Wikimedia-Links ab
- Requires: PROJ-5 (Fortschritt & Abschluss): Intro-/Outro-Bilder spielen umgewandelte Cloud- und Wikimedia-Links ab (Anzeige im Player)
- Requires: PROJ-8 (Creator — Modul-Editor): Video-Modul-Sheet erkennt Plattform-Links; Audio-/Video-Sheets bekommen einen Probe-Player; die Bildvorschau (`ImageUrlPreview`, Refinement 2026-09-28) prüft künftig die **umgewandelte** Adresse
- Requires: PROJ-6 (Creator — Quest-Verwaltung): Intro-/Outro-Bildfelder nutzen dieselbe Bildvorschau, also ebenfalls die umgewandelte Adresse
- Requires: PROJ-13 (Info-Seiten): Die Datenschutzerklärung (`/datenschutz`) braucht einen Absatz zu YouTube und Vimeo
- Bezug: PROJ-2 (Quest Data Model): **keine Änderung**. Plattform- und Cloud-Links sind gültige `https://`-URLs im bestehenden Feld `url` bzw. `mediaUrl` und werden schon heute gespeichert, exportiert und importiert

## Summary
Ersteller sollen Medien so einbinden können, wie sie sie tatsächlich vorliegen haben: als YouTube- oder Vimeo-Link, oder als Teilen-Link aus Dropbox oder Google Drive. Heute nimmt der Creator solche Links an, aber der Player kann sie nicht darstellen — alle vier führen auf eine **Webseite**, nicht auf eine Datei. Der Spieler sieht „… konnte nicht geladen werden", und der Ersteller merkt es erst beim Spielen.

Das Feature löst zwei verschiedene Fälle mit zwei Mechanismen:

1. **Plattform-Videos (YouTube, Vimeo):** Die App erkennt den Link und bettet den offiziellen Player der Plattform ein — **erst nach einem Tippen** (Zwei-Klick). Bis dahin fließen keine Daten an Google oder Vimeo.
2. **Cloud-Speicher (Dropbox, Google Drive):** Die App wandelt den Teilen-Link beim Anzeigen in einen **direkten Dateilink** um. Danach spielen die vorhandenen Bild-, Audio- und Video-Module die Datei ganz normal ab. Das löst zugleich das Hosting-Problem für KI-generiertes Audio (ElevenLabs u. ä.): MP3 in Dropbox legen, Teilen-Link einfügen. *(Präzisiert 2026-10-04: Google Drive nur für Bilder — Google sperrt Audio und Video beim Einbetten, gemessen.)*

3. **Wikimedia (Commons und Wikipedia):** Kopiert der Ersteller die Adresse einer Commons-Dateiseite oder eines Bildes aus dem Wikipedia-Bildbetrachter, führt auch sie auf eine Webseite. Die App erkennt den Dateinamen und lädt die Datei direkt von Wikimedia — Bilder in einer Web-Größe statt als oft viele Megabyte schweres Original, Audio und Video nach Möglichkeit in einer iPhone-tauglichen Fassung. *(Ergänzt 2026-09-30)*

Im Creator bekommt jede Audio- und Video-Adresse — ob Cloud-Link oder direkte Datei — einen **Probe-Player**, damit der Ersteller vor dem Weitergeben sieht, ob sie läuft. Das schließt die Lücke, die im PROJ-8-Refinement vom 2026-09-28 für Audio/Video offen geblieben war.

**Anlass:** Refinement PROJ-8 vom 2026-09-28 (Bildvorschau). Auf die Frage, ob Audio und Video ebenso geprüft werden: *„Ich möchte aber YouTube, Vimeo etc. über den Link einbinden."* Und zum Hosting von KI-Audio: *„Was ist denn mit Dateien in Cloud-Speichern wie Dropbox, Google Drive und so? Das ist sowohl für Video, Audio und Bild eine Möglichkeit."* Wikimedia kam am 2026-09-30 hinzu — die Spec empfahl Commons bereits als einfachsten Weg zu frei lizenzierten Bildern, ohne dass die App die dort kopierten Seiten-Adressen darstellen konnte.

## User Stories
1. Als Ersteller (Lehrkraft, Elternteil, Jugendleiter) möchte ich einen YouTube- oder Vimeo-Link aus der Adresszeile in ein Video-Modul einfügen, damit ich Videos einbauen kann, ohne eine Videodatei selbst hosten zu müssen.
2. Als Ersteller möchte ich den Teilen-Link einer Datei aus Dropbox oder Google Drive in ein Bild-, Audio- oder Video-Feld einfügen, damit ich eigene Dateien — etwa ein mit KI erzeugtes Hörspiel — ohne eigenen Server einbinden kann. *(Google Drive: nur Bilder, seit 2026-10-04.)*
3. Als Ersteller möchte ich im Creator sehen, dass mein Link erkannt wurde, und prüfen können, ob er abspielt, damit ich keine Quest weitergebe, in der die Spieler vor einer Fehlermeldung stehen.
4. Als Spieler möchte ich ein eingebettetes Video an der Station mit einem Tippen starten, damit ich es ansehen kann, ohne die App zu verlassen.
5. Als Spieler (bzw. als Elternteil eines Spielers) möchte ich vor dem Laden eines YouTube-/Vimeo-Videos erfahren, dass dabei Daten an den Anbieter übertragen werden, damit ich entscheiden kann, ob ich das will.
6. Als Ersteller möchte ich einen verständlichen Hinweis bekommen, wenn mein Link so nicht funktioniert (YouTube-Kanal statt Video, Dropbox-Ordner statt Datei, Google-Drive-Einschränkungen), damit ich weiß, was ich stattdessen kopieren muss.
7. Als Ersteller, dessen bestehende Quests direkte Datei-Adressen (`.jpg`, `.mp3`, `.mp4`) enthalten, möchte ich, dass diese unverändert weiter funktionieren. *(Einzige Ausnahme: `upload.wikimedia.org`-Bilder laden künftig in Web-Größe, also nur schneller — Edge Case 22.)*
8. Als Ersteller möchte ich ein Bild, ein Geräusch oder ein Video aus Wikipedia oder Wikimedia Commons einbinden, indem ich einfach die Adresse aus der Browserzeile kopiere, damit ich frei lizenzierte Medien nutzen kann, ohne die versteckte Originaldatei-Adresse suchen zu müssen.

## Out of Scope
- **Audio-Plattformen mit eigenem Player** (Spotify, SoundCloud) — nicht gewünscht; Spotify spielt ohne Konto meist nur Vorschauen
- **Weitere Video-Plattformen** (Dailymotion, TikTok, Instagram …) — jede braucht eigene Erkennung, eigenen Datenschutz-Absatz und eigene Tests
- **Weitere Cloud-Speicher** (OneDrive, iCloud, Nextcloud, WeTransfer …) — OneDrive ist nur umständlich und instabil umwandelbar, iCloud bietet praktisch keine stabilen Direktlinks. Erwogen und verworfen, siehe Decision Log
- **Ordner-Links** aus Dropbox oder Google Drive — nur Links auf einzelne Dateien werden umgewandelt; Ordner bekommen eine Warnung
- **Videos und Audio in Intro und Outro** — der Quest-Dialog bietet dort nur Bilder an (`mediaType: "image"` fest). Cloud-Links für Intro-/Outro-**Bilder** sind dagegen Teil dieses Features
- **Vorschaubild (Thumbnail) vor dem Tippen** bei YouTube/Vimeo — würde es von Google/Vimeo laden und die Zwei-Klick-Regel unterlaufen
- **Empfehlungen am Videoende vollständig unterdrücken** — nur die offizielle Beschränkung auf den eigenen Kanal (Decision Log)
- **Einwilligung merken** („YouTube immer laden") — kein Consent-Banner, kein gespeicherter Zustand
- **Prüfung, ob ein YouTube-/Vimeo-Video existiert, privat ist oder Einbetten verbietet** — ohne Plattform-API nicht vorab feststellbar; im Creator über „Vorschau laden" selbst prüfbar
- **Überwachung von Traffic-Grenzen der Cloud-Anbieter** — die App kann nicht erkennen, ob ein Dropbox-Link wegen zu vieler Abrufe gesperrt ist; der Player zeigt dann den bestehenden Fehlerzustand
- **Upload von Dateien in einen Cloud-Speicher aus der App heraus** — PRD „Kein Backend", keine Anmeldung bei Drittanbietern
- **Automatisches Übernehmen von Urheber und Lizenz** bei Wikimedia-Dateien — bräuchte die Wikimedia-Schnittstelle (Plattform-API, bisher bewusst ausgeschlossen); stattdessen ein Hinweis im Creator (Decision Log)
- **Wikimedia-Seiten ohne einzelne Datei** (Kategorien, Galerien, Artikel ohne `#/media/…`) — Warnung statt Umwandlung, wie bei Ordner-Links
- **Andere Wikimedia-Projekte und fremde MediaWiki-Wikis** (Wikivoyage, Wikibooks, Fandom, Schul-Wikis …) — nur `commons.wikimedia.org` und `*.wikipedia.org`
- **Offline-Abspielen** — PRD-Non-Goal
- **Änderung am Datenmodell oder Export-Format** — nicht nötig (siehe Dependencies)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Plattform-Videos — Erkennung
- [ ] Angenommen eine Video-URL hat eine der üblichen YouTube-Formen (`youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`, `youtube.com/embed/…`, `m.youtube.com/…`, `youtube-nocookie.com/embed/…`), wenn sie ausgewertet wird, dann wird sie als YouTube-Video mit der richtigen Video-ID erkannt
- [ ] Angenommen eine Video-URL hat die Form `vimeo.com/<Zahl>`, `vimeo.com/<Zahl>/<Hash>` (nicht gelistetes Video) oder `player.vimeo.com/video/<Zahl>`, wenn sie ausgewertet wird, dann wird sie als Vimeo-Video erkannt — beim nicht gelisteten Video inklusive Hash
- [ ] Angenommen eine YouTube-URL enthält eine Startzeit (`t=90`, `t=1m30s`, `start=90`), wenn das Video eingebettet wird, dann beginnt es an dieser Stelle
- [ ] Angenommen eine YouTube-URL enthält zusätzlich eine Playlist (`&list=…`), wenn sie ausgewertet wird, dann wird nur das einzelne Video eingebettet
- [ ] Angenommen eine YouTube- oder Vimeo-Adresse steht in einem **Bild**- oder **Audio**-Feld, wenn der Ersteller sie einträgt, dann erscheint eine Warnung, dass Plattform-Videos nur im Video-Modul abgespielt werden

### Plattform-Videos — Player (Zwei-Klick)
- [ ] Angenommen eine Station enthält ein YouTube- oder Vimeo-Modul, wenn der Spieler die Station öffnet, dann sieht er einen Platzhalter mit Plattform-Namen, Abspiel-Symbol und dem Hinweis, dass beim Laden Daten an Google bzw. Vimeo übertragen werden — **ohne** dass eine Anfrage an YouTube, Google oder Vimeo gestellt wurde
- [ ] Angenommen der Platzhalter ist sichtbar, wenn der Spieler darauf tippt, dann wird der Player der Plattform geladen und an derselben Stelle angezeigt
- [ ] Angenommen der Player ist geladen, wenn der Spieler das Video startet, dann läuft es innerhalb der Station, Vollbild ist möglich, und die App bleibt geöffnet
- [ ] Angenommen eine Station enthält zwei eingebettete Videos, wenn der Spieler eines lädt, dann bleibt das andere ein Platzhalter, bis es selbst angetippt wird
- [ ] Angenommen ein YouTube-Video endet, wenn YouTube Empfehlungen anzeigt, dann stammen diese nur aus dem Kanal des Videos
- [ ] Angenommen das Modul hat eine Bildunterschrift, wenn es gerendert wird, dann steht sie wie bisher unter Platzhalter bzw. Player
- [ ] Angenommen der Platzhalter wird angezeigt, wenn er gemessen wird, dann hat er das Seitenverhältnis 16:9 wie der spätere Player (kein Sprung beim Laden), ein Tap-Ziel von mindestens 44 px, einen Kontrast von mindestens 4.5:1 und ist per Tastatur auslösbar

### Plattform-Videos — Creator
- [ ] Angenommen der Ersteller trägt im Video-Modul einen YouTube- oder Vimeo-Link ein, wenn die Adresse erkannt ist, dann erscheint unter dem Feld der Hinweis „YouTube-Video erkannt" bzw. „Vimeo-Video erkannt" mit dem Zusatz, dass es im Spiel nach einem Tippen geladen wird
- [ ] Angenommen der Erkannt-Hinweis ist sichtbar, wenn der Ersteller auf „Vorschau laden" tippt, dann wird der Plattform-Player im Sheet angezeigt — erst ab diesem Tippen fließen Daten an die Plattform
- [ ] Angenommen der Ersteller ändert die URL, wenn eine geladene Vorschau sichtbar war, dann verschwindet sie und Hinweis bzw. Warnung gelten für die neue Adresse
- [ ] Angenommen der Ersteller trägt eine YouTube- oder Vimeo-Adresse ein, die **kein einzelnes Video** ist (Kanal, `@Name`, Playlist ohne Video, Suche, Startseite), wenn sie ausgewertet wird, dann erscheint eine Warnung, dass diese Adresse im Spiel nichts abspielt, mit dem Rat, den Link des einzelnen Videos zu kopieren

### Cloud-Speicher — Umwandlung
- [ ] Angenommen ein Bild-, Audio- oder Video-Feld enthält einen Dropbox-Teilen-Link auf eine einzelne Datei (ältere Form `dropbox.com/s/…` wie neuere Form `dropbox.com/scl/fi/…?rlkey=…`), wenn das Medium im Player angezeigt wird, dann wird die Datei direkt geladen und dargestellt bzw. abgespielt
- [ ] Angenommen ein **Bild**-Feld (Modul, Intro, Outro) enthält einen Google-Drive-Teilen-Link auf eine einzelne Datei (`drive.google.com/file/d/<ID>/…`, `drive.google.com/open?id=<ID>`), wenn das Bild im Player angezeigt wird, dann wird es direkt geladen und dargestellt *(geändert 2026-10-04: nur Bilder, siehe Messung im Tech Design)*
- [ ] Angenommen ein **Audio**- oder **Video**-Feld enthält einen Google-Drive-Link, wenn das Modul im Player gerendert wird, dann wird kein Ladeversuch über eine Drive-Adresse unternommen; es gilt der bestehende Fehlerzustand *(neu 2026-10-04)*
- ~~Angenommen ein Bild-, Audio- oder Video-Feld enthält einen Google-Drive-Teilen-Link … dann versucht die App, die Datei direkt zu laden~~ — überholt 2026-10-04: Google sperrt Audio und Video beim Einbetten (gemessen, Tech Design)
- [ ] Angenommen ein Cloud-Link wird umgewandelt, wenn die Umwandlung beim Anzeigen passiert, dann bleibt der **gespeicherte** Link unverändert so, wie der Ersteller ihn eingefügt hat
- [ ] Angenommen ein Intro- oder Outro-Bild ist ein Dropbox- oder Google-Drive-Link, wenn Intro bzw. Outro angezeigt werden, dann wird es genauso umgewandelt wie im Bild-Modul
- [ ] Angenommen eine Adresse ist weder Plattform-, Cloud- noch Wikimedia-Adresse (z. B. `https://beispiel.de/ton.mp3`), wenn das Modul gerendert wird, dann verhält es sich exakt wie bisher

### Cloud-Speicher — Creator
- [ ] Angenommen der Ersteller fügt einen Dropbox-Link ein, wenn die Adresse erkannt ist, dann erscheint der Hinweis „Dropbox-Datei erkannt" — und Vorschau bzw. Probe-Player nutzen bereits die umgewandelte Adresse
- [ ] Angenommen der Ersteller fügt einen Google-Drive-Link in ein **Bild**-Feld ein, wenn die Adresse erkannt ist, dann erscheint der Hinweis „Google-Drive-Bild erkannt" und die Vorschau nutzt bereits die umgewandelte Adresse *(geändert 2026-10-04)*
- [ ] Angenommen der Ersteller fügt einen Google-Drive-Link in ein **Audio**- oder **Video**-Feld ein, wenn die Adresse erkannt ist, dann erscheint sofort eine Warnung, dass Google Drive Audio und Video nicht in anderen Apps abspielen lässt, mit dem Rat, die Datei bei Dropbox abzulegen — kein Probe-Player für diese Adresse *(neu 2026-10-04)*
- ~~Angenommen der Ersteller fügt einen Google-Drive-Link ein … Hinweis, dass Google das Einbinden oft blockiert … auch dann, wenn die Probe gerade funktioniert~~ — überholt 2026-10-04: Für Bilder ist der Weg gemessen funktionsfähig, für Audio/Video gemessen gesperrt; ein „oft"-Hinweis passt zu keinem der beiden Fälle
- [ ] Angenommen der Ersteller fügt einen Dropbox- oder Google-Drive-Link auf einen **Ordner** ein, wenn er ausgewertet wird, dann erscheint eine Warnung, dass nur Links auf einzelne Dateien funktionieren
- [ ] Angenommen ein Cloud-Link zeigt auf eine Datei, die nicht öffentlich geteilt ist, wenn Vorschau bzw. Probe laden, dann erscheint die Lade-Warnung mit dem Zusatz, die Freigabe „Jeder mit dem Link" zu prüfen

### Wikimedia — Erkennung und Umwandlung *(ergänzt 2026-09-30)*
- [ ] Angenommen ein Bild-, Audio- oder Video-Feld enthält die Adresse einer Commons-Dateiseite (`commons.wikimedia.org/wiki/File:<Name>`, auch `Datei:`, mobile Fassung `commons.m.wikimedia.org`), wenn das Medium im Player angezeigt wird, dann wird die zugehörige Datei direkt von Wikimedia geladen und dargestellt bzw. abgespielt
- [ ] Angenommen ein Feld enthält einen Link aus dem Wikipedia-Bildbetrachter (`<sprache>.wikipedia.org/wiki/<Artikel>#/media/Datei:<Name>` bzw. `…#/media/File:<Name>`) oder eine Wikipedia-Dateiseite (`<sprache>.wikipedia.org/wiki/Datei:<Name>`, auch mobile Fassung `<sprache>.m.wikipedia.org`), wenn das Medium angezeigt wird, dann wird genau diese Datei geladen — nicht das Artikelbild oder die Artikelseite
- [ ] Angenommen der Dateiname enthält Leerzeichen, Unterstriche, Umlaute oder Prozent-Kodierung (`K%C3%B6lner_Dom.jpg`), wenn er ausgewertet wird, dann wird dieselbe Datei geladen wie beim Aufruf der Dateiseite im Browser
- [ ] Angenommen ein **Bild** stammt von Wikimedia — als umgewandelter Seiten-Link **oder** als bereits eingetragener Direktlink `upload.wikimedia.org/…` —, wenn es im Player, in Intro/Outro oder in der Creator-Vorschau angezeigt wird, dann wird eine verkleinerte Web-Fassung geladen statt des Originals (Richtwert ~1280 px Breite); ist das Original kleiner, wird es nicht vergrößert
- [ ] Angenommen eine **Audio**- oder **Video**-Datei von Wikimedia liegt in einem Format vor, das iPhones nicht zuverlässig abspielen (Ogg, Opus, WebM, FLAC …), wenn Wikimedia dafür eine iPhone-taugliche Umcodierung bereitstellt (z. B. MP3 für Ogg-Audio), dann spielt die App diese Fassung ab
- [ ] Angenommen ein Wikimedia-Link wird umgewandelt, wenn die Umwandlung beim Anzeigen passiert, dann bleibt der **gespeicherte** Link unverändert so, wie der Ersteller ihn eingefügt hat
- [ ] Angenommen ein Intro- oder Outro-Bild ist ein Wikimedia-Link, wenn Intro bzw. Outro angezeigt werden, dann wird es genauso umgewandelt und verkleinert wie im Bild-Modul

### Wikimedia — Creator *(ergänzt 2026-09-30)*
- [ ] Angenommen der Ersteller fügt einen Wikimedia-Link auf eine einzelne Datei ein, wenn die Adresse erkannt ist, dann erscheint der Hinweis „Wikimedia-Datei erkannt" — und Vorschau bzw. Probe-Player nutzen bereits die umgewandelte (bei Bildern verkleinerte) Adresse
- [ ] Angenommen ein Wikimedia-Link ist erkannt, wenn der Hinweis erscheint, dann enthält er den Rat, Urheber und Lizenz von der Dateiseite in die Bildunterschrift zu übernehmen (bei Intro/Outro: in den Text, dort gibt es keine Bildunterschrift)
- [ ] Angenommen eine Wikimedia-Audio- oder -Video-Datei liegt in einem Format vor, das iPhones nicht zuverlässig abspielen, und es gibt **keine** taugliche Umcodierung, wenn der Link erkannt ist, dann erscheint ein Hinweis, dass die Datei auf iPhones möglicherweise nicht abspielt — **auch wenn die Probe am eigenen Gerät funktioniert**
- [ ] Angenommen der Ersteller fügt eine Wikimedia-Adresse ein, die **keine einzelne Datei** ist (Kategorie, Galerie, Artikel ohne `#/media/…`), wenn sie ausgewertet wird, dann erscheint eine Warnung, dass diese Adresse im Spiel nichts anzeigt, mit dem Rat, im Artikel auf das Bild zu tippen und dann die Adresse zu kopieren
- [ ] Angenommen die Datei existiert nicht (Tippfehler, gelöscht), wenn Vorschau bzw. Probe laden, dann erscheint die normale Lade-Warnung

### Probe-Player für Audio und Video (Creator)
- [ ] Angenommen der Ersteller trägt im Audio- oder Video-Modul eine `https://`-Adresse ein, die kein YouTube-/Vimeo-Link ist, wenn sie ausgewertet ist, dann erscheint unter dem Feld ein kleiner Player mit dieser (ggf. umgewandelten) Adresse
- [ ] Angenommen die Adresse lässt sich nicht als Audio bzw. Video laden, wenn der Browser das meldet, dann erscheint eine Warnung mit Anleitung — im Wortlaut und Aufbau wie die Bild-Warnung aus PROJ-8
- [ ] Angenommen der Browser lädt ohne Nutzeraktion nichts vor (iOS Safari), wenn die Prüfung nach einigen Sekunden kein Ergebnis hat, dann erscheint **keine** Warnung, sondern der Hinweis, zum Prüfen auf „Abspielen" zu tippen — nie eine falsche Warnung
- [ ] Angenommen Warnung oder Hinweis sind sichtbar, wenn der Ersteller speichert, dann wird trotzdem gespeichert (wie Bildvorschau, PROJ-8)
- [ ] Angenommen der Ersteller ändert die URL, wenn eine Probe lief, dann wird sie gestoppt und für die neue Adresse neu aufgebaut

### Datenschutz
- [ ] Angenommen ein Besucher öffnet `/datenschutz`, wenn er den Abschnitt zu Medien liest, dann erfährt er, dass YouTube- und Vimeo-Videos erst nach einem Tippen geladen werden, welche Anbieter dann Daten erhalten, und dass YouTube über `youtube-nocookie.com` eingebunden wird
- [ ] Angenommen ein Spieler lädt kein einziges Plattform-Video, wenn er eine Quest vollständig spielt, dann ist keine Anfrage an YouTube, Google-Video-Dienste oder Vimeo erfolgt und kein Cookie dieser Anbieter gesetzt
- [ ] Angenommen eine Quest enthält Dropbox-, Google-Drive- oder Wikimedia-Dateien, wenn sie gespielt wird, dann gilt der bestehende Absatz „Medien in Quests" (Anbieter erfährt die IP-Adresse) — kein zusätzlicher Klick

### Sicherheit
- [ ] Angenommen eine importierte Quest enthält eine manipulierte Adresse (z. B. `https://youtube.com.evil.example/watch?v=x`, `https://evil.example/dropbox.com/s/x`, `https://de.wikipedia.org.evil.example/wiki/Datei:x.jpg`, eine ID oder ein Dateiname mit Steuer- oder Pfadzeichen wie `../`), wenn das Modul gerendert wird, dann wird **weder eingebettet noch umgewandelt** — die Adresse wird behandelt wie jede unbekannte Adresse
- [ ] Angenommen ein Plattform-Player ist eingebettet, wenn er ausgeführt wird, dann kann er die App-Seite nicht navigieren und keine Pop-ups ohne Nutzeraktion öffnen
- [ ] Angenommen ein Cloud-Link wird umgewandelt, wenn die direkte Adresse gebaut wird, dann zeigt sie ausschließlich auf die offiziellen Hosts des Anbieters

## Edge Cases
1. **YouTube-/Vimeo-Video privat, gelöscht oder Einbetten vom Urheber verboten:** Vorab nicht feststellbar. Nach dem Tippen zeigt der Plattform-Player seine eigene Meldung. Der Ersteller kann das im Creator über „Vorschau laden" selbst sehen.
2. **Kein Netz beim Tippen / beim Laden einer Cloud-Datei:** Plattform-Player bzw. bestehender Modul-Fehlerzustand. Kein App-Absturz; die übrigen Module bleiben bedienbar (PRD: Multimedia braucht Internet).
3. **Nicht gelistetes Vimeo-Video (`vimeo.com/123/abcdef`):** Ohne den Hash verweigert Vimeo die Wiedergabe — der Hash muss erhalten bleiben.
4. **YouTube Shorts (Hochformat):** Im 16:9-Rahmen mit Balken. Akzeptiert.
5. **Tracking-Parameter** (`si=…`, `feature=share`, `pp=…`, Dropbox `e=1`): Werden ignoriert; zählen nur ID, Startzeit bzw. die für die Datei nötigen Schlüssel (Dropbox `rlkey`).
6. **Mehrere Videos auf einer Station:** Jeder Platzhalter braucht sein eigenes Tippen. Laufen zwei gleichzeitig, ist das Plattform-Verhalten.
7. **Spieler verlässt die Station, während ein Video läuft:** Es endet mit dem Verlassen; beim erneuten Öffnen steht wieder der Platzhalter.
8. **Adressen, die nur so aussehen** (`youtube.com.evil.example`, `dropbox.com.evil.example`, `evil.example/?u=dropbox.com/s/…`): Erkennung am tatsächlichen Host, nicht per Text-Suche. Nicht erkannt → Verhalten wie bisher.
9. **Dropbox-Traffic-Grenze erreicht:** Kostenlose Konten haben Tageslimits. Wird eine Quest von vielen gleichzeitig gespielt (Schulklasse), kann der Link zeitweise gesperrt sein. Der Player zeigt den bestehenden Fehlerzustand. Nicht abfangbar; im Creator-Hinweis nicht erwähnt, um nicht zu verunsichern — Open Question, ob ein Hinweis in der Anleitung reicht.
10. **Google Drive: große Datei** — *(überholt 2026-10-04)* Betraf den Download-Weg, den die App nicht mehr nutzt. Bilder laufen über Googles Bild-Server, der in Web-Größe ausliefert; eine Viren-Warnseite tritt dort nicht auf.
11. **Google Drive: funktioniert heute, morgen nicht** — Der Bild-Weg ist nicht offiziell dokumentiert und kann sich ändern. Dann greift die normale Lade-Warnung der Vorschau; der Spieler sieht den bestehenden Fehlerzustand. Ein dauerhafter Hinweis entfällt (Betreiber-Entscheidung 2026-10-04).
12. **Cloud-Datei nicht öffentlich geteilt** („Nur ich" / „Nur Personen in der Organisation" — bei Schul-Google-Konten häufig Standard): Probe scheitert. Die Warnung nennt die Freigabe „Jeder mit dem Link" als wahrscheinliche Ursache.
13. **Falsches Medium im falschen Feld** (Dropbox-MP3 im Bild-Modul, YouTube-Link im Audio-Modul): Bild-Vorschau bzw. Probe scheitert mit der normalen Warnung; bei YouTube/Vimeo im Bild-/Audio-Feld die spezifische Warnung aus den Acceptance Criteria.
14. **iOS Safari lädt Medien erst nach Nutzeraktion:** Die Probe bekommt ohne Tippen weder „geladen" noch „Fehler". Deshalb Zeitgrenze mit neutralem Hinweis statt Warnung — eine falsche Warnung würde funktionierende Links als kaputt ausweisen.
15. **Bestehende Quests mit direkten Datei-Adressen:** Unverändert (Ausnahme: `upload.wikimedia.org`-Bilder, Edge Case 22). Die Probe im Creator erscheint auch dort, wenn das Modul geöffnet wird — kann also vorhandene kaputte Audio-/Video-Adressen sichtbar machen.
16. **320 px und Querformat:** Platzhalter, Player, Probe-Player und Hinweise skalieren auf die Kartenbreite, kein horizontaler Überlauf.
17. **Wikipedia-Datei liegt nicht auf Commons:** Manche Sprachversionen (auch die deutsche) haben lokal hochgeladene Dateien, die es auf Commons nicht gibt. Die Auflösung muss über das Wiki laufen, aus dem der Link stammt — ein pauschaler Umweg über Commons fände diese Dateien nicht.
18. **Lokalisierte Namensräume:** Andere Sprachversionen schreiben `Fichier:`, `Archivo:`, `Plik:` … statt `Datei:`/`File:`. Mindestens `File:`, `Datei:`, `Image:` und `Bild:` werden erkannt; wie weit darüber hinaus, ist in `/architecture` zu entscheiden (Open Question). Nicht erkannt → normale Lade-Warnung, kein falsches Verhalten.
19. **Bildbetrachter-Link mit weiterem Anker oder Parametern** (`?uselang=en`, `#/media/…` mitten in einer langen Adresse, Adresse aus der App-Version): Es zählt nur der Dateiname nach `#/media/`.
20. **Vektorgrafik (SVG) und animierte GIFs:** SVG wird als gerastertes Bild in Web-Größe geladen (Wikimedia liefert dafür PNG). Bei animierten GIFs darf die Verkleinerung die Animation nicht zerstören — sonst Original laden. In `/architecture` zu messen.
21. **Sehr kurze Geräusche und große Videos:** Kurze Ogg-Geräusche (Tierstimmen, Glocken) sind der häufigste Audio-Fall auf Commons und genau der Fall, der ohne MP3-Umcodierung auf dem iPhone stumm bliebe. Videos auf Commons sind oft hochauflösend; wo Wikimedia kleinere Umcodierungen anbietet, ist die kleinere zu bevorzugen.
22. **Bestehende Quests mit `upload.wikimedia.org`-Bildern:** Laden ab diesem Feature die verkleinerte Fassung statt des Originals — gewollte Verhaltensänderung (Decision Log). Gespeichert bleibt die Adresse unverändert; schlägt die Verkleinerung fehl, gilt der bestehende Fehlerzustand.

## Technical Requirements
- **Keine Anfrage an YouTube/Google-Video-Dienste/Vimeo vor dem Tippen:** Weder Skript, iframe, Vorschaubild noch Schrift der Plattform — im Player wie im Creator. Per E2E prüfbar (Netzwerk-Mitschnitt)
- **YouTube über `youtube-nocookie.com`**, Empfehlungen auf den Kanal beschränkt; **Vimeo mit „Do not track"**
- **Nur selbst zusammengesetzte Adressen:** Die App extrahiert IDs/Schlüssel aus der gespeicherten URL, prüft sie gegen ein strenges Muster und baut Embed- bzw. Direktadresse selbst. Die gespeicherte URL wird **nie** direkt als iframe-Quelle verwendet
- **Host-Prüfung am geparsten Host**, nicht per Text-Suche in der URL
- **iframe eingeschränkt:** nur Wiedergabe, Vollbild und die nötigen Skripte der Plattform; keine Top-Level-Navigation
- **Eine** Auflösungsfunktion („Welche Art Link ist das, und was wird angezeigt?") für Creator und Player, alle Medientypen, Intro/Outro — nicht mehrere Kopien. Sonst erkennt der Creator etwas, das der Player anders darstellt (dieselbe Fehlerklasse wie BUG-6)
- **Gespeichert wird die Eingabe unverändert** — Datenmodell und Export (PROJ-2, PROJ-9) bleiben unberührt; Umwandlung nur beim Anzeigen
- **Wikimedia:** Dateiname aus dem geparsten Pfad bzw. dem Anker `#/media/…` extrahieren und normalisieren (dekodieren, Unterstrich ↔ Leerzeichen). Direktadresse ausschließlich auf den Hosts `*.wikipedia.org`, `commons.wikimedia.org` bzw. `upload.wikimedia.org` bauen — über das **Wiki, aus dem der Link stammt** (Edge Case 17), nicht pauschal über Commons. Kein Aufruf der Wikimedia-Schnittstelle (API), keine Anfrage, um Urheber oder Lizenz zu lesen
- **Wikimedia-Bilder in Web-Größe:** gilt für umgewandelte Links **und** vorhandene `upload.wikimedia.org`-Direktlinks. Welche Breite und welcher Mechanismus (Weiterleitung mit Breitenangabe vs. Vorschaubild-Pfad), ist in `/architecture` gegen echte Dateien zu messen
- **Wikimedia-Formate:** Welche Umcodierungen Wikimedia für Audio und Video tatsächlich bereitstellt und unter welcher Adresse, ist in `/architecture` gegen echte Dateien zu messen — nicht aus Dokumentation zu übernehmen. Die Entscheidung „iPhone-tauglich oder nicht" fällt anhand des Dateiformats, nicht anhand der Probe am Gerät des Erstellers
- Die Bildvorschau aus PROJ-8 (`ImageUrlPreview`) prüft die **umgewandelte** Adresse — sonst warnt sie bei jedem Dropbox-Link, obwohl der Player ihn anzeigen kann
- Probe-Player: Zeitgrenze für „keine Rückmeldung" (Richtwert 5–8 s), danach neutraler Hinweis, keine Warnung
- Touch-Targets ≥ 44 px, Kontrast ≥ 4.5:1, Body-Text ≥ 16 px wo Fließtext (PRD). Player-Platzhalter im Dark-Theme des Players, Creator-Hinweise im Light-Theme der Sheets
- Kein Backend, kein API-Schlüssel, keine Plattform-API, keine Anmeldung bei Cloud-Anbietern
- **Abnahme:** Erkennung und Adressbau per Unit-Test (viele URL-Varianten je Anbieter inkl. Angriffsfälle). Zwei-Klick per E2E mit Netzwerk-Mitschnitt. Umwandlung per E2E mit `page.route` auf die Direkt-Hosts. Wikimedia-Erkennung per Unit-Test (Commons, Bildbetrachter, mobile Adressen, Umlaute/Prozent-Kodierung, Angriffsfälle). **Echte Dropbox-/Drive-/Wikimedia-Abrufe, das Abspielen auf einem echten iPhone und das tatsächliche Abspielen von YouTube/Vimeo sind Augenschein** — die Umwandlungsregeln der Anbieter sind in `/architecture` gegen echte Links zu verifizieren

## Open Questions
- [x] Wie wird KI-generiertes Audio (ElevenLabs u. ä.) gehostet? → Über Cloud-Speicher: MP3 in Dropbox (oder Google Drive) legen, Teilen-Link einfügen; die App wandelt ihn um. Vorschlag des Betreibers, Teil dieses Features (2026-09-29)
- [x] ~~Stimmen die Umwandlungsregeln für Dropbox und Google Drive …~~ → **Google Drive gemessen (2026-10-04):** Bilder nur über Googles Bild-Server, Audio/Video gesperrt (Tech Design, Messung). **Dropbox nicht gemessen** — Betreiber-Entscheidung, Dropbox im Produktivsystem zu testen; siehe neue Open Question
- [ ] Funktioniert der Dropbox-Weg (Teilen-Link mit `raw=1`, `rlkey` erhalten) für Bild, MP3 und MP4 beim Einbetten in Chrome und Safari? Vom Betreiber nach dem Deploy mit echten Dateien zu prüfen (2026-10-04)
- [ ] Spielt das iPhone die 360p-Fassung (`.mov`, MPEG-4) von Wikimedia-Videos ab? Wenn nicht, gilt der iPhone-Format-Hinweis für **alle** Wikimedia-Videos. Gerätetest des Betreibers (2026-10-04)
- [ ] Soll die Anleitung (`/anleitung`, PROJ-14, derzeit „Coming soon") beim Freischalten erklären, wie man einen Dropbox-Link teilt und auf Traffic-Grenzen bei großen Gruppen hinweisen? (2026-09-29)
- [x] Wie lautet der genaue Platzhalter-Text im Player? → „Video von YouTube abspielen" / „Beim Laden werden Daten an Google übertragen." (2026-10-04)
- [ ] Reicht die Beschränkung der YouTube-Empfehlungen auf den eigenen Kanal im Praxistest mit Kindern? (2026-09-28)
- [x] Welche Adressformen liefern Wikimedia-Dateien zuverlässig, welche Umcodierungen gibt es? → Gemessen 2026-10-04 an echten Dateien, Ergebnis im Tech Design (Messung)
- [x] Welche lokalisierten Namensräume werden erkannt? → Für Bilder **alle**: Jedes Wiki versteht seinen eigenen Präfix, die App reicht ihn unverändert an das Herkunfts-Wiki weiter (gemessen: `Fichier:`, `Archivo:`, `Plik:` → 200). Für die MP3-/Video-Fassungen braucht die App den reinen Dateinamen und erkennt dafür eine feste Liste von Präfixen; unbekannte Präfixe spielen das Original (2026-10-04)
- [ ] Welche Zielbreite für Wikimedia-Bilder? Richtwert ~1280 px; in `/frontend` gegen Ladezeit im Mobilfunk und Schärfe auf 3×-Displays abzuwägen (2026-09-30)
- [ ] Muss die Datenschutzerklärung wegen der Übermittlung an Google (USA) über den reinen Hinweis hinaus angepasst werden? Rechtliche Einschätzung liegt beim Betreiber (2026-09-28)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Plattform-Videos werden eingebettet statt abgelehnt | Betreiber-Entscheidung: „Ich möchte YouTube, Vimeo etc. über den Link einbinden." Video-Links sind der Weg, auf dem Ersteller realistisch Videos einbauen. Die Alternative (Warnung „YouTube-Links funktionieren nicht") hätte den häufigsten Fall verboten statt ihn zu lösen | 2026-09-28 |
| Zwei-Klick: Platzhalter, erst Tippen lädt den Plattform-Player | Die Datenschutzerklärung verspricht „keinerlei Cookies" und „keine sozialen Netzwerke", die Spieler sind großteils Kinder. Zwei-Klick kostet praktisch nichts, weil zum Abspielen ohnehin getippt wird, und hält das Versprechen für jeden, der das Video nicht startet | 2026-09-28 |
| Nur YouTube und Vimeo als Plattformen | Decken nahezu alle Video-Links ab, die Ersteller kopieren; beide bieten offizielle datensparsame Einbettung. Audio-Plattformen (Spotify, SoundCloud) nicht gewünscht | 2026-09-28 |
| Cloud-Speicher-Links gehören in dieses Feature | Betreiber-Entscheidung (Alternative war ein eigenes PROJ-16). Beide Mechanismen lösen dasselbe Nutzerproblem — „ich habe einen Link, der auf eine Webseite statt auf eine Datei zeigt" — und teilen sich die Erkennung im Creator. Preis: gemischte Regeln (Zwei-Klick nur für Plattform-Player) und gemeinsamer Test/Deploy | 2026-09-29 |
| ~~Cloud-Speicher: Dropbox und Google Drive, Google mit dauerhaftem Hinweis~~ *(teilweise überholt 2026-10-04, siehe „Google Drive nur für Bilder")* | Dropbox liefert über einen stabilen, bekannten Weg Direktlinks. Google Drive wird von vielen Schulen genutzt, schränkt das direkte Einbinden aber immer wieder ein — anbieten, aber ehrlich warnen. OneDrive (umständlich, instabil) und iCloud (keine stabilen Direktlinks) erwogen und verworfen | 2026-09-29 |
| Cloud-Dateien ohne Zwei-Klick | Eine Datei von Dropbox ist datenschutzrechtlich dasselbe wie jede andere externe Mediendatei; der bestehende Absatz „Medien in Quests" deckt sie ab. Ein zusätzlicher Klick wäre Aufwand ohne Gegenwert | 2026-09-29 |
| Probe-Player für **alle** Audio-/Video-Adressen im Creator | Betreiber-Entscheidung. Schließt die im PROJ-8-Refinement offen gelassene Lücke für Audio/Video und hilft unabhängig davon, ob der Link aus einer Cloud stammt. Nur auf Cloud-Links begrenzt, blieben direkte `.mp3`/`.mp4`-Tippfehler weiter unentdeckt | 2026-09-29 |
| Keine falsche Warnung auf iOS | Safari lädt Medien oft erst nach einem Tippen. Eine Zeitüberschreitung ist deshalb kein Fehler, sondern ein „bitte zum Prüfen abspielen". Eine falsche Warnung würde funktionierende Links als kaputt ausweisen und das Vertrauen in alle Warnungen untergraben | 2026-09-29 |
| Creator: Erkannt-Hinweis sofort, Plattform-Vorschau erst auf Knopfdruck | Der Ersteller soll prüfen können, ob es das richtige Video ist. Gleiche Regel wie im Spiel: erst eine Aktion, dann Daten an die Plattform | 2026-09-28 |
| YouTube-Empfehlungen am Ende: auf den Kanal beschränken und akzeptieren | Ganz abschalten lässt YouTube sie nicht; Ausblenden nach Videoende bräuchte die Steuerungsschnittstelle von YouTube. Der Ersteller wählt Video und Kanal bewusst aus | 2026-09-28 |
| Kein Vorschaubild im Platzhalter | Das Bild käme von Google/Vimeo und würde die Zwei-Klick-Regel unterlaufen | 2026-09-28 |
| Keine gemerkte Einwilligung | Kein Consent-Banner, kein gespeicherter Zustand — die App hat keine Konten und soll keine Einwilligungsverwaltung bekommen | 2026-09-28 |
| Eingabe wird unverändert gespeichert, Umwandlung nur beim Anzeigen | Der Ersteller erkennt seinen eigenen Link wieder, das Datenformat bleibt stabil, und ändert ein Anbieter seine Regeln, genügt ein App-Update — alle bestehenden Quests profitieren, ohne neu exportiert zu werden | 2026-09-28 |
| Videos/Audio in Intro/Outro nicht Teil dieses Features | Der Quest-Dialog kennt dort nur Bilder; eine Video-Option wäre eine eigene Erweiterung von PROJ-6. Cloud-Links für Intro-/Outro-**Bilder** dagegen schon, weil sie ohne neue Bedienelemente auskommen | 2026-09-29 |
| Wikimedia (Commons und Wikipedia) gehört in dieses Feature | Betreiber-Entscheidung. Derselbe Fehler wie Dropbox und Magnific: Die kopierte Adresse ist eine Webseite, keine Datei. Die Spec empfahl Commons schon als einfachen Weg zu frei lizenzierten Bildern, ohne dass die App die dort kopierten Adressen darstellen konnte. Die Umwandlung ist über einen offiziellen, stabilen Weg möglich und braucht keinen Schlüssel | 2026-09-30 |
| Wikipedia-Bildbetrachter-Links werden mit erkannt, nicht nur Commons-Dateiseiten | Betreiber-Entscheidung. Ersteller finden Bilder fast immer über einen Wikipedia-Artikel, tippen aufs Bild und kopieren die Adresse des Bildbetrachters (`…#/media/Datei:…`). Nur Commons zu erkennen hätte den häufigsten Kopierweg verfehlt | 2026-09-30 |
| Wikimedia-Bilder in Web-Größe, auch bestehende `upload.wikimedia.org`-Direktlinks | Betreiber-Entscheidung. Commons-Originale sind oft 5–30 MB; das verletzt die PRD-Ladezeit im Gelände. Direktlinks mitzunehmen ändert das Verhalten bestehender Quests — gewollt, weil es sie nur schneller macht und gespeichert bleibt, was eingetragen wurde. Alternative „nur umgewandelte Links" hätte zwei Regeln für dieselben Dateien bedeutet | 2026-09-30 |
| Wikimedia-Audio/-Video: iPhone-taugliche Umcodierung bevorzugen, sonst Format-Hinweis | Betreiber-Entscheidung. Commons speichert Audio oft als Ogg/Opus, Video nur als WebM/Ogg (MP4 ist dort nicht zugelassen). Am Desktop meldet die Probe „läuft", auf dem iPhone des Spielers scheitert es — der Probe-Player allein würde den Fehler also verdecken. Deshalb entscheidet das Format, nicht das Probe-Ergebnis | 2026-09-30 |
| Lizenz: Hinweis im Creator statt Automatik | Betreiber-Entscheidung. CC-BY/-SA verlangt Urheber und Lizenz. Automatisches Befüllen bräuchte die Wikimedia-API, die bisher bewusst ausgeschlossen ist; ein Hinweis kostet nichts und lässt die Verantwortung beim Ersteller, wo sie rechtlich liegt | 2026-09-30 |
| Wikimedia-Dateien ohne Zwei-Klick | Wie Cloud-Dateien: eine externe Mediendatei, gedeckt vom bestehenden Absatz „Medien in Quests" der Datenschutzerklärung. Wikimedia setzt keine Tracking-Cookies | 2026-09-30 |
| Google Drive nur für Bilder; Audio/Video mit sofortiger Warnung statt Ladeversuch | Betreiber-Entscheidung nach Messung (2026-10-04): Google sperrt Audio und Video beim Einbetten in fremde Seiten (403 in Chrome und Safari), Bilder liefert Googles Bild-Server zuverlässig. Ein Ladeversuch, der nach heutigem Stand nie gelingt, hätte den Ersteller nur Zeit gekostet. Der dauerhafte „oft blockiert"-Hinweis entfällt, weil er zu keinem der beiden gemessenen Fälle passt | 2026-10-04 |
| Priorität P0 | Betreiber-Entscheidung. Ohne dieses Feature scheitern die naheliegenden Wege, Medien einzubauen (YouTube-Link, Dropbox-Link), und der Ersteller merkt es erst beim Spielen | 2026-09-28 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine reine Auflösungsfunktion in `src/lib` für alle Medienadressen | Creator und Player fragen dieselbe Funktion „was ist das für ein Link, was wird geladen?". Zwei Kopien hätten auseinanderlaufen können (BUG-6-Fehlerklasse). Rein und ohne Netz → vollständig per Unit-Test prüfbar | 2026-10-04 |
| Ergebnis ist eine **Liste** von Quellen, nicht eine Adresse | Wikimedia-Audio/-Video braucht mehrere Fassungen (MP3 + Original, WebM + MOV); der Browser wählt die erste, die er abspielen kann. Das ersetzt jede Geräte-Erkennung und übersteht fehlende Umcodierungen (404 → nächste Quelle) | 2026-10-04 |
| Google Drive über `lh3.googleusercontent.com/d/<ID>=w1280` | Gemessen der einzige Weg, der beim Einbetten in Chrome und WebKit lädt; `uc?export=view` und `drive.usercontent.google.com` liefern 403, sobald der Browser den Abruf als eingebettetes Bild aus fremder Seite kennzeichnet. Nicht offiziell dokumentiert — Risiko im Decision Log, Rückfall ist die bestehende Lade-Warnung | 2026-10-04 |
| Wikimedia über `Special:FilePath` des **Herkunfts-Wikis** mit `?width=1280` | Gemessen: offizielle, stabile Weiterleitung; skaliert 18,2 MB → 846 KB, vergrößert kleine Originale nicht, wandelt SVG in PNG, erhält GIF-Animation; versteht den lokalen Präfix jedes Wikis. Der Weg über Commons fände lokal gespeicherte Dateien nicht (gemessen: 404) | 2026-10-04 |
| Wikimedia-MP3-/Video-Fassungen ohne Wikimedia-API, über den berechneten Ablagepfad | Der Pfad ergibt sich aus einer MD5-Prüfsumme des Dateinamens; an 4 von 4 echten Dateien bestätigt. Hält die Regel „keine Plattform-API" ein und kostet keine zusätzliche Anfrage | 2026-10-04 |
| MD5 als kleine eigene Hilfsfunktion statt Paket | Browser bieten MD5 nicht an (Web Crypto kennt es nicht). Es dient hier nur zur Pfadberechnung, nicht zur Sicherheit. Eine eigene Funktion von ~50 Zeilen, geprüft gegen die gemessenen Wikimedia-Pfade, hält die Abhängigkeiten bei null — anders als bei Sicherheits-Kryptografie ist ein Fehler hier sofort als 404 sichtbar und per Test gefangen | 2026-10-04 |
| Wikimedia-Video: nie das Original zuerst | Commons-Originale können Gigabyte groß sein (Testvideo: 3 GB). Reihenfolge 480p-WebM, 360p-MOV, Original zuletzt — das Original nur, falls Wikimedia noch keine Fassung erzeugt hat | 2026-10-04 |
| YouTube/Vimeo-Player in eingeschränktem iframe, eingebettet nur nach Tippen | Sandbox ohne Erlaubnis zur Navigation der App; erlaubt nur Skripte der Plattform, Vollbild und Öffnen eines Links nach Tippen. Adresse wird aus geprüfter ID selbst gebaut, nie aus der gespeicherten URL übernommen | 2026-10-04 |
| Referrer-Policy der App bleibt `origin-when-cross-origin` | YouTube verweigert eingebettete Wiedergabe ohne Referer. Die bestehende Policy sendet nur die Herkunft (keine Pfade, keine Quest-IDs) — genug für YouTube, nichts darüber hinaus. Am iframe darf kein `no-referrer` gesetzt werden | 2026-10-04 |
| Kein Content-Security-Policy-Header nötig | `next.config.ts` setzt bewusst keine CSP (beliebige Medien-Hosts). Damit sind iframes von YouTube/Vimeo ohne Konfigurationsänderung möglich; `X-Frame-Options: DENY` betrifft nur das Einbetten **unserer** Seite | 2026-10-04 |
| `AudioModule` wird von einer einzelnen Adresse auf eine Quellenliste umgestellt | Nötig für die MP3-Fassung vor dem Ogg-Original. Intro/Outro nutzen bereits Quellen-Elemente | 2026-10-04 |
| Keine neuen Pakete, kein Backend, keine gespeicherten Daten | Alle Mechanismen laufen im Browser aus der gespeicherten Adresse; Datenmodell und Export bleiben unberührt (PROJ-2, PROJ-9) | 2026-10-04 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
*Erstellt 2026-10-04. Reines Frontend — kein Backend, keine Datenbank, kein neues Paket.*

### Grundidee in einem Satz
Eine zentrale **Auflösung** schaut sich jede eingetragene Medienadresse an und beantwortet zwei Fragen: *Was ist das für ein Link?* (Datei, YouTube, Vimeo, Dropbox, Google Drive, Wikimedia, oder etwas, das so nicht funktioniert) und *Was wird tatsächlich geladen?* Creator und Player fragen dieselbe Auflösung — was der Creator als „erkannt" meldet, spielt der Player genau so ab.

### Messung vom 2026-10-04 (Grundlage der Entscheidungen)
Gemessen an echten Dateien, nicht aus Dokumentation übernommen. Browser-Werte in echtem Chrome 152 und WebKit, von `geoquest.technolomagie.de` aus eingebettet.

**Google Drive** (Testbild des Betreibers, 2592×4608):

| Adresse | Ohne Browser-Kennung | Eingebettet in Chrome/WebKit |
|---|---|---|
| `drive.google.com/uc?export=view&id=…` | 200, Bild | **Fehler** (403) |
| `drive.usercontent.google.com/download?id=…` | — | **Fehler** (403) |
| `lh3.googleusercontent.com/d/<ID>=w1280` | 200, 1280×2276, 217 KB | **lädt** |

Ursache eingegrenzt: Google antwortet mit 403, sobald der Browser den Abruf als „eingebettet aus fremder Seite" kennzeichnet — für Bild, Audio **und** Video gleichermaßen. Referer allein stört nicht. `lh3` ist Googles Bild-Server: liefert Bilder (mit Größenangabe, CORS offen), aber kein Audio und Video. **Folge: Google Drive nur für Bilder** (Betreiber-Entscheidung, Decision Log).

**Wikimedia:**

| Fall | Ergebnis |
|---|---|
| Foto 18,2 MB über `Special:FilePath/…?width=1280` | **846 KB**, 1280 px breit |
| Kleines Original (283 KB) mit Breitenangabe | unverändert, nicht hochskaliert |
| SVG mit Breitenangabe | PNG, 1280 px |
| Animiertes GIF verkleinert | Animation erhalten (8 Frames) |
| Datei, die nur auf de.wikipedia liegt | über **de**.wikipedia 200, über Commons **404** |
| Commons-Datei über de.wikipedia | 200 — das Herkunfts-Wiki findet beides |
| Präfixe `Fichier:`, `Archivo:`, `Plik:` am jeweiligen Wiki | 200 — jedes Wiki versteht seinen eigenen |
| Nicht vorhandene Datei | 404 (HTML) → normale Lade-Warnung greift |
| Kurze Ogg-Vogelrufe (95–365 KB), Ogg-Sinfonie | **alle** mit MP3-Fassung |
| WebM-Video (Original 3 GB) | Fassungen 240p/480p/1080p WebM-VP9 und **360p MOV** |
| Ablagepfad der Fassungen | aus MD5 des Dateinamens berechenbar, 4/4 bestätigt |
| Referer unserer Domain | kein Hotlink-Schutz, 200 |

**Dropbox:** nicht gemessen (Betreiber-Entscheidung: Prüfung im Produktivsystem, Open Question).

### Komponenten-Struktur

```
Medien-Auflösung (neu, src/lib — keine Oberfläche)
+-- erkennt: direkte Datei | YouTube | Vimeo | Dropbox | Google Drive | Wikimedia
+-- erkennt Fehlgriffe: Kanal/Playlist, Ordner, Kategorie/Galerie, Plattform-Video im falschen Feld,
|   Drive-Audio/-Video
+-- liefert: Art des Links, Liste der zu ladenden Quellen, Hinweise für den Creator
+-- Hilfsfunktion: MD5 für den Wikimedia-Ablagepfad

PLAYER
Station
+-- Bild-Modul        → lädt die aufgelöste Adresse (Drive/Wikimedia in Web-Größe)
+-- Audio-Modul       → umgestellt auf eine Quellenliste (z. B. MP3-Fassung, dann Ogg-Original)
+-- Video-Modul
|   +-- Datei/Cloud/Wikimedia → wie bisher, mit Quellenliste
|   +-- YouTube/Vimeo → Plattform-Video (neu)
|       +-- Platzhalter: Plattform-Name, Abspiel-Symbol, Datenhinweis (16:9, keine Anfrage)
|       +-- nach Tippen: Plattform-Player im eingeschränkten Rahmen
+-- Intro-/Outro-Screen → Bild, Audio, Video ebenfalls über die Auflösung

CREATOR
Modul-Sheet (Bild/Audio/Video)
+-- URL-Feld (unverändert)
+-- Link-Status (neu): „YouTube-Video erkannt", „Wikimedia-Datei erkannt" …
|   +-- Warnungen: kein einzelnes Video, Ordner, Drive-Audio/-Video, falsches Feld
|   +-- Lizenz-Hinweis (Wikimedia), iPhone-Format-Hinweis (Wikimedia ohne taugliche Fassung)
+-- Bildvorschau (PROJ-8, bestehend) → prüft künftig die aufgelöste Adresse
+-- Probe-Player (neu) für Audio/Video → spielt die aufgelöste Quellenliste,
|   meldet „lädt nicht" oder auf iOS nach Zeitgrenze „zum Prüfen abspielen"
+-- Plattform-Vorschau (neu) → erst nach „Vorschau laden"
Quest-Dialog (Intro/Outro-Bild)
+-- Link-Status + Bildvorschau mit aufgelöster Adresse

INFO-SEITEN
/datenschutz → neuer Absatz zu YouTube und Vimeo (Zwei-Klick, youtube-nocookie, Anbieter)
```

### Was die Auflösung je Link-Art lädt

| Link-Art | Bild | Audio | Video |
|---|---|---|---|
| Direkte Datei | unverändert | unverändert | unverändert |
| Wikimedia (Seite oder `upload.wikimedia.org`) | `Special:FilePath` des Herkunfts-Wikis, 1280 px | MP3-Fassung, dann Original | 480p-WebM, 360p-MOV, Original zuletzt |
| Google Drive | Bild-Server, 1280 px | Warnung, kein Ladeversuch | Warnung, kein Ladeversuch |
| Dropbox | Direktlink (`raw=1`, `rlkey` bleibt) | dto. | dto. |
| YouTube / Vimeo | Warnung „nur im Video-Modul" | Warnung „nur im Video-Modul" | Platzhalter → Plattform-Player |
| Unbekannt / manipuliert | unverändert wie bisher | wie bisher | wie bisher |

Bei `upload.wikimedia.org`-Adressen, die bereits eine Vorschaugröße (`/thumb/…`) oder eine Fassung (`/transcoded/…`) sind, wird nichts umgeschrieben.

### Datenmodell
**Keine Änderung.** Gespeichert, exportiert und importiert wird die Adresse genau so, wie der Ersteller sie eingefügt hat (Felder `url` bzw. `mediaUrl`). Alles Aufgelöste entsteht beim Anzeigen und wird nie gespeichert — auch nicht das Ergebnis von Vorschau oder Probe. Kein neuer `localStorage`-Schlüssel, keine Einwilligung wird gemerkt.

### Sicherheit
- **Erkennung am geparsten Host**, nie per Textsuche: `youtube.com.evil.example` oder `evil.example/?u=dropbox.com/s/…` sind „unbekannt".
- **Jede geladene Adresse baut die App selbst** aus geprüften Bestandteilen (Video-ID, Drive-ID, Dateiname) auf den offiziellen Hosts. IDs gegen strenge Muster; Dateinamen mit Pfad- oder Steuerzeichen werden verworfen, alles Übrige wird kodiert.
- **Plattform-Player** in eingeschränktem Rahmen: keine Navigation der App, Pop-ups nur nach Tippen, Vollbild erlaubt.
- Importierte Quests laufen durch dieselbe Auflösung — eine manipulierte Adresse wird höchstens wie eine unbekannte behandelt.

### Datenschutz-Abgrenzung
- **YouTube/Vimeo:** Zwei-Klick. Vor dem Tippen keine Anfrage — weder iframe, Skript, Vorschaubild noch Schrift. Neuer Absatz in `/datenschutz`.
- **Dropbox, Google Drive, Wikimedia:** externe Mediendateien wie bisher, gedeckt vom bestehenden Absatz „Medien in Quests". Kein zusätzlicher Klick.

### Tests (Abnahme-Strategie)
- **Unit (Kern):** Die Auflösung mit vielen echten URL-Varianten je Anbieter, Angriffsfällen, Umlauten, lokalisierten Präfixen und den **gemessenen Wikimedia-Pfaden als Sollwerte** (inkl. MD5). Weil die Auflösung rein ist, ist das der Großteil der Abdeckung.
- **E2E:** Zwei-Klick per Netzwerk-Mitschnitt (keine Anfrage an YouTube/Google/Vimeo vor dem Tippen); Umwandlung per `page.route` auf die Ziel-Hosts; Creator-Hinweise und -Warnungen; Probe-Player inkl. iOS-Zeitgrenze; bestehende Bildvorschau-Tests müssen grün bleiben.
- **Augenschein / Gerät:** echtes Abspielen von YouTube/Vimeo, Dropbox mit echten Dateien, Wikimedia-Video (360p-MOV) auf einem iPhone.

### Abhängigkeiten
Keine neuen Pakete. Genutzt wird, was da ist: `Alert` (shadcn) für Hinweise und Warnungen, `Button`, `lucide-react`-Icons, die bestehende `ImageUrlPreview`.

### Risiken
- **Googles Bild-Server ist kein dokumentierter Weg.** Ändert Google ihn, erscheint die normale Lade-Warnung; der Player zeigt seinen Fehlerzustand. Behebung wäre eine Zeile in der Auflösung — alle bestehenden Quests profitieren, weil die Eingabe gespeichert ist, nicht die Umwandlung.
- **Dropbox ungemessen** — bis zum Produktivtest des Betreibers eine begründete Annahme.
- **iPhone und MPEG-4-Video** ungeklärt (Open Question); fällt der Test negativ aus, bekommt jedes Wikimedia-Video den iPhone-Hinweis — eine Regel in der Auflösung, kein Umbau.

## Implementation Notes (Frontend)
*Umgesetzt 2026-10-04. Kein neues Paket, keine neue Route, kein Datenmodell-Eingriff.*

### Neue Dateien
- `src/lib/media-link.ts` — die zentrale Auflösung `resolveMediaUrl(url, field)`: liefert Anbieter, eine **Liste** von Quellen, ggf. die Plattform-Embed-Adresse und Hinweis-Codes. Rein, ohne Netz
- `src/lib/md5.ts` — MD5 für den Wikimedia-Ablagepfad
- `src/components/platform-video.tsx` — Zwei-Klick-Platzhalter (Player) und der eingeschränkte iframe (`PlatformFrame`, auch im Creator)
- `src/components/quest-frame-media.tsx` — Medium von Intro/Outro über die Auflösung (ersetzt zwei fast gleiche Blöcke in `intro-screen.tsx`/`outro-screen.tsx`)
- `src/components/media-url-feedback.tsx` — Creator-Rückmeldung unter jedem Medien-URL-Feld: Hinweise/Warnungen, Bildvorschau, Probe-Player (Audio/Video), Plattform-Vorschau

### Geänderte Dateien
- `modules/image-module.tsx`, `audio-module.tsx`, `video-module.tsx` — laden die aufgelöste Adresse. Audio und Video nutzen jetzt `<source>`-Listen; der Fehlerzustand hängt an der **letzten** Quelle (bei Quellen-Elementen meldet nicht das Medienelement den Fehler, sondern die Quelle)
- `image-url-preview.tsx` — prüft die aufgelöste Adresse; bei Dropbox/Drive nennt die Warnung zusätzlich die Freigabe „Jeder mit dem Link“
- `module-editor-sheets.tsx`, `quest-form-dialog.tsx` — `ImageUrlPreview` durch `MediaUrlFeedback` ersetzt (Bild **und** Audio/Video; Intro/Outro mit Lizenz-Hinweis „in den Intro- bzw. Outro-Text")
- `(info)/datenschutz/page.tsx` — neuer Absatz „Videos von YouTube und Vimeo", Satz zu Dropbox/Drive/Wikimedia im Absatz „Medien in Quests"

### Abweichungen und Präzisierungen gegenüber dem Tech Design
- **Lokalisierte Präfixe brauchen keine Liste — auch nicht für Audio/Video.** Das Design sah für die MP3-/Video-Fassungen eine feste Präfix-Liste vor. Unnötig: Ein Datei-Titel trägt immer genau einen Namensraum-Präfix, der Dateiname ist alles nach dem ersten Doppelpunkt. Jede Sprache funktioniert damit auch für Audio/Video
- **Wikipedia-Pfad ohne `#/media/`** wird als Datei nur erkannt, wenn der Name auf eine Medien-Endung endet (`.jpg`, `.ogg`, `.webm` …). Sonst wäre ein Artikel wie „Star Wars: Episode I" als Datei „Episode I" missverstanden worden
- **Audio aus einem Sprach-Wiki** versucht die MP3-Fassung auf Commons **und** im Sprach-Wiki, weil vorab unbekannt ist, wo die Datei liegt (Edge Case 17). Ein 404 fällt automatisch auf die nächste Quelle
- **Hinweise sofort, Probe entprellt:** Erkennung und Warnungen sind rein lokal und erscheinen beim Tippen ohne Verzögerung; nur der Probe-Player lädt erst nach 450 ms Ruhe (wie die Bildvorschau). Zeitgrenze ohne Rückmeldung: 6 s → neutraler Hinweis „tippe zum Prüfen auf ‚Abspielen‘", nie eine Warnung
- **Info-Hinweise mit `role="status"`, Warnungen mit `role="alert"`** — ein Screenreader soll „YouTube-Video erkannt" nicht als Alarm ansagen
- **Platzhalter-Text** (Open Question) am Bildschirm festgelegt: „Video von YouTube abspielen" / „Beim Laden werden Daten an Google übertragen."
- **Intro/Outro mit YouTube-Link** (nur über importierte Quests möglich) zeigen ebenfalls den Zwei-Klick-Platzhalter statt eines kaputten Videos

### Gemessen bei der Umsetzung
- MD5-Pfad an einer fünften Datei bestätigt (Toco-Tukan-Ruf: berechnet `a/a8`, Abruf 200 `audio/mpeg`); Klammern im Pfad funktionieren roh und kodiert
- `Special:FilePath` versteht den Präfix auch prozentkodiert (`Datei%3A…` → 200)

### Tests
- **Unit:** `media-link.test.ts` (80 Tests: alle URL-Formen je Anbieter, Startzeiten, Playlist, Ordner, Wikimedia-Präfixe/mobil/Umlaute/Direktlinks, Fassungs-Reihenfolge, Angriffsfälle, Host-Prüfung jeder gebauten Adresse) und `md5.test.ts` (RFC-1321-Vektoren + gemessene Wikimedia-Pfade). Suite **418/418**
- **E2E:** `tests/proj-15-medien-links.spec.ts`, **24 Tests je Engine, 48/48**. Darunter der Netzwerk-Mitschnitt „keine Anfrage an YouTube/Google/Vimeo vor dem Tippen" in Player und Creator
- **Gegenprobe gegen den echten Vorgängerstand** (eigener Build): **42 von 48 fallen**. Grün bleiben genau die drei Wächter, die in beiden Ständen bestehen müssen — Fehlerzustand bei scheiternden Quellen, unbekannte Adresse unverändert, manipulierte Adresse nicht eingebettet (je Engine)

### Eigene Fehler, offen benannt (Produkt jeweils richtig)
1. Ein falsch abgeschriebener MD5-Testvektor (`message digest`) — per Python gegengeprüft, die Funktion war richtig
2. `main img` im Test: Die Station hat kein `<main>`-Element
3. Eine 404-Route wurde von der später registrierten Sammel-Route überdeckt — Playwright wertet die **zuletzt** registrierte Route zuerst aus
4. Der Intro-Test wartete auf „Standort erlauben" — mit erteilter Freigabe kommt das Intro sofort. **Der Lauf hing danach komplett**, statt nach 30 s abzubrechen; im Browser einzeln nachgestellt: Die Seite blockiert nicht, es lag allein am Test
5. Ein erster Entwurf entprellte den Probe-Player in einer Komponente, die erst beim Tippen eingehängt wird — das erste getippte Zeichen hätte als „beim Öffnen vorhanden" gegolten und sofort einen fremden Server angefragt. Vor dem ersten Lauf korrigiert

### Nicht abgedeckt
Echtes Abspielen von YouTube/Vimeo (Augenschein), Dropbox mit echten Dateien (Betreiber, Produktivsystem), Wikimedia-360p-MOV auf einem echten iPhone, Firefox.

## QA Test Results

**Tested:** 2026-10-04
**App URL:** Production-Build (`next start`) in isoliertem Worktree auf Port 3200, Commit `dadadaa`
**Tester:** QA Engineer (AI)
**Browser:** Desktop Chrome 152, WebKit (iPhone-13-Profil). Firefox nicht verfügbar (Binary fehlt, wie seit Projektbeginn dokumentiert)

### Zusammenfassung
- **Acceptance Criteria:** 50 / 50 erfüllt (49/50 in der ersten Runde; BUG-21 behoben und nachgeprüft)
- **Bugs:** 1 neu — **BUG-21 (Medium, Rückschritt), am 2026-10-04 behoben**; keine Critical/High
- **Security:** ohne Befund
- **Production Ready:** JA (kein Critical/High) — Empfehlung: BUG-21 vor dem Deploy beheben, weil er bestehende Quests betreffen kann und der Fix klein ist

### Mit echtem Netz geprüft (nicht nur gegen Attrappen)
Die Frontend-Suite beantwortet jeden fremden Host per `page.route`. Was dort nicht beweisbar war, ist hier gegen die echten Anbieter gemessen — in Chrome **und** WebKit identisch:

| Prüfung | Ergebnis |
|---|---|
| YouTube im eingeschränkten iframe (`youtube-nocookie`, Sandbox, nur Herkunft als Referer) | lädt, Titel „Big Buck Bunny…", echtes `<video>`-Element, **keine** Referer-Fehlermeldung |
| Vimeo mit `dnt=1` | lädt, Player-Bedienelemente vorhanden |
| Wikimedia-Ogg-Audio | `currentSrc` endet auf `.ogg.mp3` — die **MP3-Fassung** wird gespielt, Dauer 11 s |
| Wikimedia-Video (Original 3 GB) | beide Engines wählen **480p-WebM**, `readyState` 4 (Chrome); das Original wird nicht angefasst |
| Google-Drive-Bild des Betreibers | lädt über den Bild-Server, 1280×2276 |

### Acceptance Criteria Status

#### Plattform-Videos — Erkennung (5/5)
- [x] Alle YouTube-Formen inkl. Shorts/Embed/mobil/nocookie mit richtiger ID (Unit)
- [x] Vimeo inkl. Hash nicht gelisteter Videos in beiden Schreibweisen (Unit + E2E)
- [x] Startzeit `t=90`, `1m30s`, `start=` (Unit + E2E)
- [x] Playlist: nur das einzelne Video
- [x] Plattform-Link im Bild-/Audio-Feld → Warnung

#### Plattform-Videos — Player / Zwei-Klick (7/7)
- [x] Platzhalter ohne **jede** Anfrage an YouTube/Google/Vimeo (Netzwerk-Mitschnitt)
- [x] Tippen lädt den Player an derselben Stelle
- [x] Video läuft in der Station, Vollbild erlaubt (`allowfullscreen`), App bleibt offen — echter Player geladen; das tatsächliche Abspielen mit Ton bleibt Augenschein
- [x] Zwei Videos: nur das angetippte lädt
- [x] Empfehlungen auf den Kanal beschränkt (`rel=0` in der gebauten Adresse; Wirkung Augenschein)
- [x] Bildunterschrift unter Platzhalter bzw. Player
- [x] 16:9 ohne Sprung beim Laden, Tap-Ziel ≥ 44 px, Tastatur; **Kontrast gemessen ≥ 4.5:1** (QA-Test)

#### Plattform-Videos — Creator (4/4)
- [x] „YouTube-/Vimeo-Video erkannt" mit Zwei-Klick-Zusatz
- [x] Plattform-Vorschau erst nach „Vorschau laden", vorher keine Anfrage
- [x] Neue Adresse entfernt die geladene Vorschau
- [x] Kanal/Playlist/Suche → Warnung

#### Cloud-Speicher — Umwandlung (6/6)
- [x] Dropbox alt und neu (`rlkey` bleibt, Tracking entfällt) — gegen Attrappe; echte Dropbox-Datei steht aus (Betreiber, Produktivsystem)
- [x] Google-Drive-Bild über den Bild-Server — **mit echter Datei bestätigt**
- [x] Google-Drive-Audio/-Video: kein Ladeversuch, Fehlerzustand, **0 Anfragen an Google**
- [x] Gespeichert bleibt die Eingabe (QA-Test: Dropbox-Link landet unverändert im Speicher)
- [x] Intro **und Outro** (QA-Test) werden umgewandelt
- [x] Unbekannte Adressen unverändert

#### Cloud-Speicher — Creator (5/5)
- [x] „Dropbox-Datei erkannt", Vorschau/Probe mit umgewandelter Adresse
- [x] „Google-Drive-Bild erkannt"
- [x] Drive-Audio/-Video: sofortige Warnung mit Rat zu Dropbox, kein Probe-Player
- [x] Ordner → Warnung
- [x] Nicht freigegebene Datei → Lade-Warnung nennt „Jeder mit dem Link" — für Bild **und** Audio (QA-Test)

#### Wikimedia — Erkennung und Umwandlung (7/7)
- [x] Commons-Dateiseite, mobil, `Datei:`
- [x] Wikipedia-Bildbetrachter → genau diese Datei aus dem Herkunfts-Wiki
- [x] Umlaute, Leerzeichen, Prozent-Kodierung
- [x] Bilder in Web-Größe, auch vorhandene `upload.wikimedia.org`-Links
- [x] Audio/Video: iPhone-taugliche Fassung bevorzugt — **mit echtem Netz bestätigt** (MP3 bzw. 480p-WebM)
- [x] Gespeichert bleibt die Eingabe
- [x] Intro/Outro wie im Modul

#### Wikimedia — Creator (4/5)
- [x] „Wikimedia-Datei erkannt"; Vorschau mit aufgelöster Adresse (beim Sichttest lud versehentlich das echte Bild)
- [x] Lizenz-Hinweis: Bildunterschrift bzw. Intro-/Outro-Text
- [x] iPhone-Format-Hinweis auch bei gelingender Probe (QA-Test)
- [x] ~~**BUG-21:** Warnung „keine einzelne Datei" erscheint auch bei `Special:FilePath`-/`Spezial:Dateipfad`-/`Special:Redirect`-Links — das **sind** einzelne Dateien~~ — behoben 2026-10-04
- [x] Nicht vorhandene Datei → normale Lade-Warnung (QA-Test)

#### Probe-Player (5/5)
- [x] Kleiner Player mit aufgelöster Adresse
- [x] Nicht ladbar → Warnung mit Anleitung
- [x] iOS-Fall: nach 6 s neutraler Hinweis, **nie** eine Warnung
- [x] Speichern trotz Warnung
- [x] Adresswechsel ersetzt den laufenden Probe-Player (QA-Test: alte Quelle verschwindet)

#### Datenschutz (3/3)
- [x] `/datenschutz` erklärt Zwei-Klick, Anbieter, `youtube-nocookie.com`
- [x] **Vollständiger Durchlauf bis zum Outro ohne Tippen: 0 Anfragen und 0 Cookies** von YouTube/Google/Vimeo (QA-Test)
- [x] Cloud-/Wikimedia-Dateien ohne zusätzlichen Klick

#### Sicherheit (3/3)
- [x] Manipulierte Adressen weder eingebettet noch umgewandelt
- [x] iframe-Sandbox ohne `allow-top-navigation`
- [x] Jede gebaute Adresse auf einem offiziellen Host (Unit)

### Edge Cases
- [x] EC 1–6, 8, 12–16 wie in der Frontend-Suite; EC 7 (Station verlassen beendet das Video, zurück steht der Platzhalter) neu als QA-Test
- [x] EC 17 (lokale Wikipedia-Datei): Auflösung über das Herkunfts-Wiki, Unit-belegt
- [x] EC 18 (lokalisierte Präfixe), 19, 20, 22: Unit-belegt
- [x] EC 21: Wikimedia-Video lädt die 480p-Fassung statt des 3-GB-Originals (echtes Netz)
- [ ] EC 9/10/11 (Dropbox-Limits, Drive-Änderungen): nicht testbar, wie spezifiziert

### Security Audit
- [x] XSS: Markup in Bildunterschrift **und** Adresse (Player und Creator) wird nicht ausgeführt — 0 Dialoge, 0 injizierte Elemente, `window.__pwn` bleibt leer
- [x] `javascript:`-Adresse: keine Hinweise, kein Player, keine Anfrage
- [x] Host-Prüfung am geparsten Host; Lookalike-Domains → unbekannt
- [x] Pfadzeichen/Steuerzeichen in Dateinamen werden verworfen (`../`, `%0A`)
- [x] iframe: Sandbox ohne Navigation der App; Embed-Adresse nur aus geprüfter ID
- [x] Keine neuen Abhängigkeiten, keine Secrets, keine gespeicherten Daten

### Responsive
- [x] 320 / 375 / 768 / 1440 px: Platzhalter 16:9, kein horizontaler Überlauf; Creator-Warnungen ohne Überlauf, „Vorschau laden" ≥ 44 px

### Bugs Found

#### BUG-21: Direkte Wikimedia-Links über `Special:FilePath` laden nicht mehr
- **Severity:** Medium (Rückschritt gegenüber dem Stand vor PROJ-15)
- **Steps to Reproduce:**
  1. Bild-Modul mit `https://commons.wikimedia.org/wiki/Special:FilePath/Cologne_Cathedral.jpg` (oder `…/Spezial:Dateipfad/…`, `…/w/index.php?title=Special:Redirect/file/…`)
  2. Creator: Erwartet „Wikimedia-Datei erkannt" + Vorschau. Tatsächlich: Warnung „Diese Seite ist keine einzelne Datei."
  3. Player: Erwartet das Bild. Tatsächlich: „Bild konnte nicht geladen werden"
- **Gemessen mit echtem Netz:** dieselbe Adresse lädt als einfaches `<img>` (Verhalten vor PROJ-15) in 480×640. Bestehende Quests mit solchen Links zeigen nach dem Deploy kein Bild mehr.
- **Ursache:** `splitFileTitle` sieht den Titel `Special:FilePath/Cologne_Cathedral.jpg`, Präfix `Special`, Name mit `/` → `checkFileName` verwirft ihn → `wikimedia-not-a-file`, keine Quellen.
- **Naheliegende Behebung:** Spezialseiten `Special:FilePath`/`Spezial:Dateipfad`/`Special:Redirect/file` erkennen und den Dateinamen dahinter wie eine Dateiseite behandeln (bekommt dann auch die Web-Größe). Mindestens: sie unverändert durchreichen statt zu verwerfen.
- **Wächter:** `test.fail` in `tests/proj-15-medien-links-qa.spec.ts` — wird grün, sobald behoben
- **Priority:** Vor dem Deploy beheben (kleiner Eingriff, betrifft möglicherweise vorhandene Quests)

#### BUG-21 behoben (2026-10-04)
- **Eingriff:** `media-link.ts` erkennt Spezialseiten, die direkt auf eine Datei weiterleiten — `Special:`/`Spezial:` + `FilePath`/`Dateipfad` bzw. `Redirect`/`Weiterleitung` + `/file/`, unabhängig von Groß-/Kleinschreibung, auch mit `File:`-Präfix im Dateinamen und über `/w/index.php?title=`. Sie werden wie eine Dateiseite behandelt: Bild in Web-Größe, Audio/Video mit Fassungen
- **Rückfall statt Abweisung:** Eine unbekannte Wikimedia-Form, die auf eine Medien-Endung endet (z.B. eine lokalisierte Spezialseite), bleibt jetzt **unverändert wie vor PROJ-15**. Abgewiesen mit „keine einzelne Datei" wird nur noch, was sicher keine Datei ist. Gemessen: französische Spezialseiten heißen anders und existieren in dieser Form nicht (404) — der Rückfall schützt vor genau dieser Fehlerklasse, statt eine Namensliste zu pflegen
- **Gemessen vor dem Bau:** `special:filepath` (klein), `Spezial:Dateipfad`, `Spezial:Weiterleitung/file/`, `Special:FilePath/File:…` → alle 200 `image/jpeg`
- **Mit echtem Netz, Chrome und WebKit:** `Special:FilePath`-Link lädt wieder (480×640, nicht hochskaliert); `Spezial:Dateipfad` auf das 18-MB-Foto lädt jetzt in Web-Größe (1280 px) — bestehende Quests gewinnen also, statt nur den alten Zustand zurückzubekommen
- **Sicherheitstest präzisiert:** Er verlangte bei Pfadzeichen im Dateinamen „lädt nichts". Mit dem Rückfall lädt eine solche Adresse wieder exakt die Eingabe — wie jede unbekannte Adresse, wie es das Sicherheitskriterium vorsieht. Geprüft wird jetzt, was der Test belegen soll: **keine selbst gebaute Adresse** aus einem solchen Namen
- **Tests:** 9 neue Unit-Tests (427/427). Gegenprobe mit der fehlerhaften Fassung: **genau 8 fallen**, der Test „Spezialseite ohne Dateinamen" besteht in beiden Fassungen, wie er soll. E2E: der `test.fail`-Wächter ist jetzt ein normaler Test, dazu ein Creator-Test („Wikimedia-Datei erkannt" statt Warnung). **PROJ-15 + PROJ-8-Bildvorschau 146/146** über beide Engines; Lint 0 Fehler, Build sauber

#### QA der Behebung (2026-10-04): BUG-21 bestätigt behoben, keine neuen Bugs
- **Mit echtem Netz, Chrome und WebKit, 8 Formen:** `Special:FilePath`, kleingeschrieben, `Spezial:Dateipfad` (de), `Spezial:Weiterleitung/file/`, `index.php?title=Special:Redirect/file/`, mobil mit `File:`-Präfix und eigener `width`, eine **nur auf de.wikipedia** liegende Datei — **alle laden, 0 Fehlerzustände**. Audio über `Special:FilePath` spielt die MP3-Fassung
- **Besser als vor PROJ-15:** `Spezial:Dateipfad` auf **Commons** liefert als rohe Adresse 404 (gemessen) — durch die Auflösung lädt es jetzt. Und `Spezial:Dateipfad` auf das 18-MB-Foto lädt in 1280 px
- **Gegenprobe gegen den Stand vor dem Fix** (`a7df82a`, eigener Build): **alle 4 BUG-21-Tests fallen** (Player und Creator, je Engine)
- **Regression:** Unit 427/427; E2E PROJ-15 (beide Dateien), PROJ-8-Bildvorschau (beide), PROJ-4-Module, PROJ-5-Abschluss **248/248**, 0 flaky
- **Code-Review des Diffs, drei Punkte geprüft, keiner ein Bug:**
  1. Der Rückfall liefert `url.href` statt der wörtlichen Eingabe — `URL` schreibt den Host klein und kodiert Sonderzeichen. Zum Laden gleichwertig; nicht wörtlich „unverändert", aber ohne Wirkung für den Nutzer
  2. Ein **ungültiger** Bildbetrachter-Link, der auf `.jpg` endet, fällt jetzt in den Rückfall statt die Warnung „keine einzelne Datei" zu bekommen. Die Bildvorschau meldet dann die normale Lade-Warnung — der Ersteller wird weiterhin gewarnt, nur mit dem allgemeineren Text
  3. Pfadzeichen (`..%2F`) in einer Spezialseite: kein gebauter Pfad; der Rückfall reicht die Eingabe durch wie vor PROJ-15 — `%2F` wird vom Browser nicht als Pfadtrenner aufgelöst
- **Security unverändert ohne Befund**

### Beobachtungen ohne Bug-Status
- `music.youtube.com` wird nicht erkannt und als Videodatei versucht (scheitert mit dem normalen Fehlerzustand). Nicht in der Spec gefordert; YouTube-Music-Links in Quests sind unwahrscheinlich.
- `dl.dropboxusercontent.com`-Links bleiben unverändert — richtig, sie sind bereits Direktlinks.
- WebKit erreicht „Vorschau laden" per Tastatur mit Alt+Tab statt Tab — Safari-Plattformverhalten, im Test berücksichtigt.

### Tests
- **Neu:** `tests/proj-15-medien-links-qa.spec.ts`, **22 Tests je Engine, 44/44** (inkl. BUG-21-Wächter als `test.fail`)
- **Gegenprobe gegen den echten Vorgängerstand** (`f41188a`, eigener Build): **40 von 44 fallen**. Grün bleiben genau zwei Wächter, die in beiden Ständen bestehen müssen — XSS wird nicht ausgeführt, die Eingabe wird unverändert gespeichert (je Engine). Der BUG-21-Wächter fällt dort korrekt, weil der Link vor PROJ-15 lud — der Rückschritt ist damit auch automatisiert belegt
- **Regression der betroffenen Features** (PROJ-4, 5, 6, 8, 13-Info, 15): **459 passed / 0 unexpected / 0 flaky** über beide Engines; die zwei BUG-15-Zeilen sind die erwarteten `test.fail`-Wächter
- **Unit:** 418/418
- **Gesamtsuite** (aus der Frontend-Phase, byte-identischer Stand): 1322 passed; die 28 Ausreißer sind als Umgebungsartefakte belegt (lokaler Bild-Optimierer, Service-Worker-Flakiness)

### Eigene Fehler in den QA-Tests, offen benannt (Produkt jeweils richtig)
1. Die Sammel-Route beantwortete `.mp3` als WAV, **bevor** die Regel für die nicht freigegebene Dropbox-Datei griff — Reihenfolge der Bedingungen
2. Das Outro wollte ich über einen gespeicherten Bildschirmzustand erreichen; es folgt aber erst auf das Abschließen der letzten Station
3. WebKit springt mit Tab nicht auf Knöpfe (Safari-Standard) — Alt+Tab


## Deployment

**Deployed:** 2026-10-04 · **Tag:** `v1.45.0-PROJ-15` · **Push:** `57102e9..b3e0632`
**Live:** https://geoquest.technolomagie.de und https://geoquesty.vercel.app (dieselbe Vercel-Bereitstellung)

**Vorabprüfung:** QA Approved (50/50, BUG-21 behoben und nachgeprüft), Lint 0 Fehler, keine Secrets versioniert. Produktcode an HEAD byte-identisch zum QA-geprüften Build. Mitgenommen wurde `7480c40` aus einer parallelen Sitzung (PROJ-3: BUG-20 als „kein Fehler" geschlossen) — nur Doku und eine Testerwartung, kein Produktcode; die geänderte Testerwartung lief in der Gesamtregression grün.

**Live nach 55 s**, belegt an einem Merkmal, das umschlagen konnte: Der Absatz „Videos von YouTube und Vimeo" stand vorher auf keiner der beiden Domains in `/datenschutz`.

**Beide PROJ-15-Suiten direkt gegen Production: 94/94** (Chrome 47/47, WebKit 47/47).

**Mit echten Anbietern in Production, Chrome und WebKit identisch:**
- **0 Anfragen** an YouTube/Vimeo vor dem Tippen; danach laden beide Player mit echtem `<video>`
- Google-Drive-Bild 1280×2276, Wikipedia-Bildbetrachter 1280×2014 (Original 18 MB), `Special:FilePath` 480×640 (BUG-21 live behoben)
- Wikimedia-Ogg spielt die MP3-Fassung
- WebKit **0 Konsolenfehler**

**Alle 10 Endpunkte HTTP 200** (0,08–0,46 s), Security-Header aktiv (HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: origin-when-cross-origin` — die Policy, die YouTube braucht).

**Zwei Auffälligkeiten geprüft statt weggewunken:**
1. Chrome meldete zwei Konsolen-404 — sie stammen aus `/play/<id>`, das serverseitig 404 liefert, weil Quests nur im localStorage liegen (vorbestehend seit 2026-09-07). Ein ruhiger Besuch von `/`, `/play`, `/create`, `/datenschutz` ergibt **0 Antworten ≥ 400**
2. Der erste Lauf der Suiten gegen Production **hing** bei 0 % CPU (zwei Worker, beide Engines parallel). Seriell je Engine laufen dieselben Tests in je 1,1–1,2 min vollständig grün — ein Problem der Testumgebung, nicht des Produkts. Dasselbe Hängen war in der Frontend-Phase schon einmal aufgetreten

**Offen für den Betreiber:**
- **Dropbox mit echten Dateien** (Bild, MP3, MP4) — Teilen-Link einfügen, Hinweis „Dropbox-Datei erkannt", Probe bzw. Vorschau prüfen
- **Wikimedia-Video auf einem echten iPhone** (spielt iOS die WebM- oder die 360p-MOV-Fassung?)
- Echtes Abspielen von YouTube/Vimeo mit Ton am Handy

