# PROJ-15: Medien-Links — YouTube, Vimeo, Cloud-Speicher und Wikimedia

## Status: Planned
**Created:** 2026-09-28
**Last Updated:** 2026-09-30

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
2. **Cloud-Speicher (Dropbox, Google Drive):** Die App wandelt den Teilen-Link beim Anzeigen in einen **direkten Dateilink** um. Danach spielen die vorhandenen Bild-, Audio- und Video-Module die Datei ganz normal ab. Das löst zugleich das Hosting-Problem für KI-generiertes Audio (ElevenLabs u. ä.): MP3 in Dropbox legen, Teilen-Link einfügen.

3. **Wikimedia (Commons und Wikipedia):** Kopiert der Ersteller die Adresse einer Commons-Dateiseite oder eines Bildes aus dem Wikipedia-Bildbetrachter, führt auch sie auf eine Webseite. Die App erkennt den Dateinamen und lädt die Datei direkt von Wikimedia — Bilder in einer Web-Größe statt als oft viele Megabyte schweres Original, Audio und Video nach Möglichkeit in einer iPhone-tauglichen Fassung. *(Ergänzt 2026-09-30)*

Im Creator bekommt jede Audio- und Video-Adresse — ob Cloud-Link oder direkte Datei — einen **Probe-Player**, damit der Ersteller vor dem Weitergeben sieht, ob sie läuft. Das schließt die Lücke, die im PROJ-8-Refinement vom 2026-09-28 für Audio/Video offen geblieben war.

**Anlass:** Refinement PROJ-8 vom 2026-09-28 (Bildvorschau). Auf die Frage, ob Audio und Video ebenso geprüft werden: *„Ich möchte aber YouTube, Vimeo etc. über den Link einbinden."* Und zum Hosting von KI-Audio: *„Was ist denn mit Dateien in Cloud-Speichern wie Dropbox, Google Drive und so? Das ist sowohl für Video, Audio und Bild eine Möglichkeit."* Wikimedia kam am 2026-09-30 hinzu — die Spec empfahl Commons bereits als einfachsten Weg zu frei lizenzierten Bildern, ohne dass die App die dort kopierten Seiten-Adressen darstellen konnte.

## User Stories
1. Als Ersteller (Lehrkraft, Elternteil, Jugendleiter) möchte ich einen YouTube- oder Vimeo-Link aus der Adresszeile in ein Video-Modul einfügen, damit ich Videos einbauen kann, ohne eine Videodatei selbst hosten zu müssen.
2. Als Ersteller möchte ich den Teilen-Link einer Datei aus Dropbox oder Google Drive in ein Bild-, Audio- oder Video-Feld einfügen, damit ich eigene Dateien — etwa ein mit KI erzeugtes Hörspiel — ohne eigenen Server einbinden kann.
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
- [ ] Angenommen ein Bild-, Audio- oder Video-Feld enthält einen Google-Drive-Teilen-Link auf eine einzelne Datei (`drive.google.com/file/d/<ID>/…`, `drive.google.com/open?id=<ID>`), wenn das Medium im Player angezeigt wird, dann versucht die App, die Datei direkt zu laden
- [ ] Angenommen ein Cloud-Link wird umgewandelt, wenn die Umwandlung beim Anzeigen passiert, dann bleibt der **gespeicherte** Link unverändert so, wie der Ersteller ihn eingefügt hat
- [ ] Angenommen ein Intro- oder Outro-Bild ist ein Dropbox- oder Google-Drive-Link, wenn Intro bzw. Outro angezeigt werden, dann wird es genauso umgewandelt wie im Bild-Modul
- [ ] Angenommen eine Adresse ist weder Plattform-, Cloud- noch Wikimedia-Adresse (z. B. `https://beispiel.de/ton.mp3`), wenn das Modul gerendert wird, dann verhält es sich exakt wie bisher

### Cloud-Speicher — Creator
- [ ] Angenommen der Ersteller fügt einen Dropbox-Link ein, wenn die Adresse erkannt ist, dann erscheint der Hinweis „Dropbox-Datei erkannt" — und Vorschau bzw. Probe-Player nutzen bereits die umgewandelte Adresse
- [ ] Angenommen der Ersteller fügt einen Google-Drive-Link ein, wenn die Adresse erkannt ist, dann erscheint zusätzlich der Hinweis, dass Google das Einbinden oft blockiert (besonders bei Audio und Video) und Dropbox die verlässlichere Wahl ist — auch dann, wenn die Probe gerade funktioniert
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
10. **Google Drive: große Datei** — Google schaltet ab einer bestimmten Größe eine Viren-Warnseite vor den Download. Die umgewandelte Adresse liefert dann HTML statt der Datei → Lade-Warnung im Creator, Fehlerzustand im Player. Genau dafür steht der Google-Hinweis dauerhaft.
11. **Google Drive: funktioniert heute, morgen nicht** — Google hat das direkte Einbinden mehrfach eingeschränkt. Deshalb bleibt der Hinweis auch bei erfolgreicher Probe stehen.
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
- [ ] Stimmen die Umwandlungsregeln für Dropbox (`raw=1`) und Google Drive (Download-/Anzeige-Endpunkt) heute noch, und für welche Medientypen funktioniert Google Drive tatsächlich? In `/architecture` gegen echte, öffentlich geteilte Testdateien (Bild, MP3, MP4) zu messen, nicht aus Dokumentation zu übernehmen (2026-09-29)
- [ ] Soll die Anleitung (`/anleitung`, PROJ-14, derzeit „Coming soon") beim Freischalten erklären, wie man einen Dropbox-Link teilt und auf Traffic-Grenzen bei großen Gruppen hinweisen? (2026-09-29)
- [ ] Wie lautet der genaue Platzhalter-Text im Player? Richtung: „Video von YouTube abspielen — beim Laden werden Daten an Google übertragen." In `/frontend` am Bildschirm festzulegen (2026-09-28)
- [ ] Reicht die Beschränkung der YouTube-Empfehlungen auf den eigenen Kanal im Praxistest mit Kindern? (2026-09-28)
- [ ] Welche Adressformen liefern Wikimedia-Dateien zuverlässig als `<img>`/`<audio>`/`<video>` (Weiterleitung über `Spezial:Dateipfad`/`Special:FilePath` mit Breitenangabe, Vorschaubild-Pfad auf `upload.wikimedia.org`), und welche Umcodierungen gibt es für Ogg-Audio und WebM-Video? In `/architecture` gegen echte Dateien zu messen (Bild, SVG, animiertes GIF, Ogg-Geräusch, MP3, WebM-Video, lokal auf de.wikipedia gespeicherte Datei) (2026-09-30)
- [ ] Welche lokalisierten Namensräume (`Fichier:`, `Archivo:`, `Plik:` …) werden erkannt? Vorschlag: `File`/`Datei`/`Image`/`Bild` plus die großen Sprachversionen; Rest bekommt die normale Lade-Warnung (2026-09-30)
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
| Cloud-Speicher: Dropbox und Google Drive, Google mit dauerhaftem Hinweis | Dropbox liefert über einen stabilen, bekannten Weg Direktlinks. Google Drive wird von vielen Schulen genutzt, schränkt das direkte Einbinden aber immer wieder ein — anbieten, aber ehrlich warnen. OneDrive (umständlich, instabil) und iCloud (keine stabilen Direktlinks) erwogen und verworfen | 2026-09-29 |
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
| Priorität P0 | Betreiber-Entscheidung. Ohne dieses Feature scheitern die naheliegenden Wege, Medien einzubauen (YouTube-Link, Dropbox-Link), und der Ersteller merkt es erst beim Spielen | 2026-09-28 |

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
