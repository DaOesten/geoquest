# PROJ-14: KI-Anleitung

_Bis 2026-10-23: „KI-Anleitung — Coming soon zum Launch". Mit Refinement 2026-10-23 wird die Anleitung freigeschaltet und bekommt ein Prompt-Formular; der Dateiname bleibt, damit bestehende Verweise gültig bleiben._

## Status: Approved
**Created:** 2026-09-17
**Last Updated:** 2026-10-24 (Refinement: Prompt-Formular und Freischaltung — vorher deployt, Tag `v1.29.0-PROJ-14`)

## Dependencies
- Requires: PROJ-13 (Landing Page) — die Seite `/anleitung`, ihre Einstiegspunkte und der geteilte Seitenrahmen `InfoPageShell` stammen von dort
- Requires: PROJ-1 (App Shell & Mode Switch) — der Menu-Eintrag „Anleitung" und die Datenstruktur `APP_NAV_GROUPS` gehören dorthin
- Berührt: PROJ-6 (Creator — Quest-Verwaltung) — die Leeransicht von `/create` trägt einen der drei Einstiegspunkte

_Keine Datenabhängigkeit: Dieses Feature ändert ausschließlich Sichtbarkeit und Copy. Quest-Modell, Import und Editor bleiben unberührt._

## Kontext

Die Seite `/anleitung` ist **fertig gebaut und deployt** (Tag `v1.27.0-PROJ-13`): Prompt-Vorlage zum Kopieren, vier Schritte, vier Troubleshooting-Einträge, ein Ausblick-Kasten „Was dabei herauskommt". Der Betreiber hat entschieden, **die App ohne diese Funktion zu launchen** — aber anzukündigen, dass sie kommt.

Der Grund, warum das ein eigenes Feature ist und kein reines Zurückrollen: Die KI-Anleitung ist an **fünf Stellen** in die App eingewoben, drei davon werblich. Sie einfach abzuschalten würde einen Menu-Eintrag ins Leere zeigen lassen, zwei Call-to-Actions auf eine Ankündigung führen und eine FAQ-Antwort auf `/about` stehen lassen, die eine Funktion beschreibt, die es nicht gibt. Der Launch soll nichts versprechen, was er nicht hält — und zugleich das Interesse für später halten.

**Die fünf Berührungspunkte (vollständig erhoben, Stand 2026-09-17):**

| # | Ort | Heute | Datei |
|---|-----|-------|-------|
| 1 | Die Seite selbst | Prompt, Schritte, Troubleshooting | `src/app/(info)/anleitung/page.tsx` |
| 2 | Burger-Menu, Gruppe „Info" | Eintrag „Anleitung" → `/anleitung` | `src/lib/app-nav.ts` |
| 3 | `/about`, sekundärer Hero-CTA | Button „Mit KI erstellen" | `src/app/(info)/about/page.tsx` |
| 4 | `/create`, Leeransicht | Textlink „Quest mit KI bauen" | `src/app/create/page.tsx` |
| 5 | Desktop-Header aller Info-Seiten | einziger Textlink: „Anleitung" | `src/lib/app-nav.ts` (`HEADER_NAV_LINKS`) |

Dazu die FAQ-Antwort „Wie lange dauert das Erstellen?" auf `/about`, die die KI-Anleitung als gegebenen Weg beschreibt.

**Leitgedanke:** Der fertige Inhalt wird **nicht gelöscht**, sondern nur nicht gerendert. Das spätere Freischalten soll eine kleine, risikoarme Änderung sein — kein Wiederaufbau.

## User Stories

- Als **Besucher**, der einem geteilten Link oder QR-Code auf `/anleitung` folgt, möchte ich eine verständliche Seite vorfinden statt einer Fehlermeldung, damit ich weiß, dass das Angebot existiert und nur noch nicht verfügbar ist.
- Als **Ersteller** (Elternteil, Lehrkraft, Jugendleiter) möchte ich beim Launch nur Wege angeboten bekommen, die auch funktionieren, damit ich nicht auf einen Button klicke, der mir nichts liefert.
- Als **interessierter Ersteller** möchte ich erfahren, dass die KI-Unterstützung geplant ist und was sie können wird, damit ich später wiederkomme.
- Als **Betreiber** möchte ich die fertige Anleitung im Code behalten, damit ich sie nach dem Launch mit minimalem Aufwand freischalten kann.
- Als **Betreiber** möchte ich, dass keine Stelle der App eine Funktion verspricht, die es zum Launch nicht gibt, damit der erste Eindruck der App ehrlich ist.
- Als **Ersteller** möchte ich Thema, Alter, Anzahl der Stationen, Spielort und besondere Wünsche in Felder auf der Seite eintragen und daraus einen fertigen Prompt erzeugen, damit ich ihn nur noch kopieren muss und nicht im Prompt-Text nach den Stellen suchen muss, die ich ändern soll. _(Refinement 2026-10-23)_
- Als **Ersteller**, der die Felder leer lässt, möchte ich trotzdem eine Prompt-Vorlage bekommen, damit ich meine Angaben auch erst im Chat mit der KI machen kann. _(Refinement 2026-10-23)_

## Out of Scope

- ~~**Das Freischalten der Anleitung selbst**~~ — **aufgehoben 2026-10-23:** Das Refinement „Prompt-Formular und Freischaltung" schaltet die Anleitung frei.
- ~~**Inhaltliche Änderungen an der Anleitung**~~ — **aufgehoben 2026-10-23:** Neuer Prompt, Formular, neue Schritte und überarbeitete Hilfe sind Teil des Refinements.
- **Angaben im Browser speichern** _(2026-10-23)_ — die Felder merken sich nichts über einen Seitenaufruf hinaus. Wer die Seite neu lädt, beginnt leer.
- **Den Prompt direkt an ein KI-Tool übergeben** (Link „In ChatGPT öffnen" o. ä.) _(2026-10-23)_ — der Nutzer kopiert und fügt selbst ein. Kein Anbieter wird bevorzugt, kein Datenfluss an Dritte.
- **Weitere Felder über die fünf Angaben hinaus** (z. B. Dauer, Schwierigkeit) _(2026-10-23)_ — der neue Prompt kennt nur diese fünf; Dauer und Schwierigkeit leitet die KI selbst ab.
- **Die FAQ auf `/about` um die KI-Anleitung ergänzen** _(2026-10-23)_ — siehe Open Questions.
- **Eine E-Mail-Benachrichtigung / „Sag mir Bescheid"-Anmeldung** — bewusst verworfen: erfordert Backend und Datenverarbeitung, beides laut PRD ausgeschlossen (kein Backend, kein Account).
- **Ein Datum oder Zeitraum für die Verfügbarkeit** — siehe Product Decisions.
- **Ein allgemeines Feature-Flag-System** — dieses Feature schaltet genau eine Seite. Eine generische Infrastruktur dafür wäre Overhead ohne zweiten Anwendungsfall.
- **Änderungen an `/impressum` und `/datenschutz`** — sie verweisen nicht auf die Anleitung und bleiben unangetastet.
- **Die Prompt-Vorlage aus dem Auslieferungs-Bundle entfernen** — nicht das Ziel. Der Prompt ist kein Geheimnis, er soll nur nicht als fertiges Angebot präsentiert werden.
- **BUG-2 (16px-Schließen-X) und BUG-9 (kein `:focus-visible`)** — vorbestehend und app-weit, unabhängig von diesem Feature.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Die Ankündigungsseite

- [ ] Angenommen ein Besucher ruft `/anleitung` auf, wenn die Seite lädt, dann erhält er HTTP 200 und eine Ankündigungsseite statt einer 404-Seite
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite betrachtet, dann erkennt er an einer deutlich sichtbaren Kennzeichnung („Bald verfügbar"), dass die Funktion noch nicht nutzbar ist
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite liest, dann erfährt er in wenigen Sätzen, was die KI-Anleitung können wird (Quest von ChatGPT oder Claude bauen lassen — mit Story, Zielen und Rätseln)
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite betrachtet, dann sieht er die vier Punkte aus „Was dabei herauskommt" als Ausblick, sprachlich in die Zukunft gesetzt
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite vollständig durchsucht, dann findet er **weder die Prompt-Vorlage noch den Kopieren-Button** — auch nicht ausgeblendet im sichtbaren Text
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite vollständig durchsucht, dann findet er **keine Schritt-für-Schritt-Anleitung und keine Troubleshooting-Einträge**
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er die Seite betrachtet, dann findet er **keine Datums- oder Zeitraumangabe** zur Verfügbarkeit
- [ ] Angenommen ein Besucher steht auf der Ankündigungsseite, wenn er weitermachen möchte, dann bietet ihm die Seite einen Weg zum manuellen Erstellen (`/create`) an
- [ ] Angenommen ein Besucher ist auf `/anleitung`, wenn er den Zurück-Pfeil benutzt, dann gelangt er nach `/about` — wie vor der Änderung

### Die Einstiegspunkte

- [ ] Angenommen ein Nutzer öffnet das Burger-Menu auf einem beliebigen Screen, wenn er die Gruppe „Info" betrachtet, dann sieht er den Eintrag „Anleitung" weiterhin, versehen mit einer Kennzeichnung „Bald"
- [ ] Angenommen ein Nutzer sieht den Menu-Eintrag „Anleitung" mit der „Bald"-Kennzeichnung, wenn er ihn antippt, dann gelangt er auf die Ankündigungsseite (der Eintrag bleibt bedienbar, nicht deaktiviert)
- [ ] Angenommen ein Besucher ist auf `/about`, wenn er den Hero betrachtet, dann sieht er **nur noch einen** Call-to-Action („Quest erstellen") — der sekundäre Button „Mit KI erstellen" ist entfallen
- [ ] Angenommen ein Ersteller öffnet `/create` ohne angelegte Quests, wenn er die Leeransicht betrachtet, dann sieht er „Neue Quest erstellen" und „Quest importieren", aber **keinen Link „Quest mit KI bauen"**
- [ ] Angenommen ein Besucher ist auf einer Info-Seite an einem Desktop-Viewport, wenn er die Kopfzeile betrachtet, dann sieht er **keinen Textlink „Anleitung"** mehr — die Kopfzeile trägt nur noch das Ko-fi-Icon und „Zur App"
- [ ] Angenommen der Textlink der Kopfzeile ist entfallen, wenn ein Besucher die Kopfzeile auf 375px, 768px und 1440px betrachtet, dann ist die Kopfzeile in allen drei Breiten frei von Überlauf und Lücken im Layout

### Ehrlichkeit der übrigen Copy

- [ ] Angenommen ein Besucher liest die FAQ auf `/about`, wenn er die Frage zum Erstellen einer Quest aufklappt, dann beschreibt die Antwort das **manuelle** Erstellen, ohne die KI-Anleitung als verfügbaren Weg darzustellen
- [ ] Angenommen die FAQ-Antwort wurde umgeschrieben, wenn ein Besucher sie liest, dann enthält sie **keine Zeitangabe** zur Dauer des Erstellens
- [ ] Angenommen die Zeitangabe entfällt, wenn die zugehörige FAQ-Frage gelesen wird, dann fragt sie nicht mehr nach der Dauer (sonst bliebe sie unbeantwortet)
- [ ] Angenommen die FAQ-Antwort wurde geändert, wenn das ausgelieferte `FAQPage`-JSON-LD auf `/about` geprüft wird, dann trägt es denselben neuen Text wie die sichtbare Seite
- [ ] Angenommen ein Besucher durchsucht `/about` und `/create`, wenn er nach Aussagen über KI-Unterstützung sucht, dann findet er **keine Formulierung, die sie als bereits verfügbar darstellt**

### Bewahrung des fertigen Inhalts

- [ ] Angenommen die Ankündigung ist live, wenn ein Entwickler den Quelltext prüft, dann sind Prompt-Vorlage, Schritte und Troubleshooting **weiterhin im Repository vorhanden** und nicht gelöscht
- [ ] Angenommen der Betreiber möchte die Anleitung später freischalten, wenn er den dafür vorgesehenen Schalter umlegt, dann erscheint die vollständige Seite wieder — ohne dass Inhalte neu geschrieben werden müssen

### Keine Regression

- [ ] Angenommen `/anleitung` wurde umgebaut, wenn `/about`, `/impressum` und `/datenschutz` aufgerufen werden, dann sind sie unverändert und vollständig (der geteilte Seitenrahmen `InfoPageShell` wird mitverändert)
- [ ] Angenommen der Menu-Eintrag trägt eine neue Kennzeichnung, wenn das Burger-Menu geöffnet wird, dann sind weiterhin **vier Gruppen mit sieben Zielen** vorhanden und der Ko-fi-Eintrag ist unberührt
- [ ] Angenommen der sekundäre CTA auf `/about` ist entfallen, wenn die Seite auf den elf bekannten Referenz-Viewports (320×568 bis 1920×1080) geprüft wird, dann steht der verbliebene primäre CTA weiterhin über dem Falz (BUG-7 bleibt behoben)

### Prompt-Formular (Refinement 2026-10-23)

- [ ] Angenommen ein Besucher ruft `/anleitung` auf, wenn die Seite lädt, dann sieht er die volle Anleitung — keine „Bald verfügbar"-Kennzeichnung mehr, keine Ankündigung
- [ ] Angenommen ein Besucher ist im Abschnitt zum Prompt, wenn er ihn betrachtet, dann sieht er fünf Eingabefelder mit Beschriftung: „Thema", „Alter der Kinder", „Anzahl der Stationen (höchstens 20)", „Spielort", „Besondere Wünsche (optional)"
- [ ] Angenommen ein Feld ist leer, wenn der Besucher es betrachtet, dann zeigt es als graue Vorlage das Beispiel aus dem Prompt (z. B. „z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum"); die Vorlage verschwindet beim Tippen und ist **kein** eingetragener Wert
- [ ] Angenommen der Besucher hat noch nicht auf „Prompt erzeugen" getippt, wenn er die Seite betrachtet, dann sieht er die Felder und den Button „Prompt erzeugen", aber **noch keine Prompt-Box**
- [ ] Angenommen der Besucher hat alle fünf Felder ausgefüllt, wenn er auf „Prompt erzeugen" tippt, dann erscheint darunter der vollständige Prompt, in dem der Block „Meine Angaben" seine Werte trägt (z. B. „- Thema: Piraten") und sonst wörtlich der Vorlage entspricht
- [ ] Angenommen der Besucher hat **kein** Feld ausgefüllt, wenn er auf „Prompt erzeugen" tippt, dann erscheint der Prompt mit dem Block „Meine Angaben" exakt so, wie er in der Vorlage steht (mit den Beispielen in eckigen Klammern) — es gibt keine Fehlermeldung und keine Sperre
- [ ] Angenommen der Besucher hat nur einen Teil der Felder ausgefüllt, wenn er auf „Prompt erzeugen" tippt, dann trägt jede Zeile einzeln entweder seinen Wert (Feld ausgefüllt) oder die Vorlagen-Zeile (Feld leer)
- [ ] Angenommen ein Feld enthält nur Leerzeichen, wenn der Prompt erzeugt wird, dann gilt es als leer; Leerzeichen am Anfang und Ende eines Werts werden entfernt
- [ ] Angenommen der Prompt wurde erzeugt, wenn er erscheint, dann scrollt die Seite so, dass die Prompt-Box mit dem „Kopieren"-Knopf sichtbar ist (auf dem Handy sonst leicht zu übersehen)
- [ ] Angenommen der Prompt ist sichtbar, wenn der Besucher auf „Kopieren" tippt, dann landet **genau der angezeigte** Prompt in der Zwischenablage; schlägt das Kopieren fehl, erscheint der bestehende Hinweis zum Markieren von Hand
- [ ] Angenommen der Prompt wurde erzeugt, wenn der Besucher danach ein Feld ändert, dann bleibt die Box stehen, **im Formular direkt über dem Button** erscheint der Hinweis „Angaben geändert. Der Prompt unten zeigt noch den alten Stand." und der Button heißt „Prompt neu erzeugen" — es gibt keinen zweiten Knopf _(geändert 2026-10-24, vorher Hinweis mit eigenem Knopf über der Box)_
- [ ] Angenommen der Besucher hat den Prompt neu erzeugt, wenn er die Box betrachtet, dann ist der Hinweis „Angaben geändert" verschwunden, der Button heißt wieder „Prompt erzeugen" und der Prompt trägt die neuen Werte
- [ ] Angenommen der Besucher trägt bei „Anzahl der Stationen" eine Zahl außerhalb von 1 bis 20 oder etwas anderes als eine ganze Zahl ein, wenn er auf „Prompt erzeugen" tippt, dann erscheint am Feld ein Hinweis („Bitte eine Zahl von 1 bis 20") und der Prompt wird nicht erzeugt
- [ ] Angenommen ein Besucher bedient die Seite per Tastatur, wenn er durch das Formular geht, dann erreicht er alle Felder, „Prompt erzeugen" und danach „Kopieren" in sinnvoller Reihenfolge; Enter in einem einzeiligen Feld erzeugt den Prompt
- [ ] Angenommen ein Besucher nutzt einen Screenreader, wenn der Prompt erzeugt oder neu erzeugt wird, dann wird das angesagt (z. B. „Prompt erzeugt")

### Der neue Prompt (Refinement 2026-10-23)

- [ ] Angenommen der Prompt wird erzeugt, wenn man ihn mit der Vorlage im Abschnitt „Refinement 2026-10-23" vergleicht, dann ist er außerhalb des Blocks „Meine Angaben" Zeichen für Zeichen identisch — insbesondere steht im Prompt wörtlich `\n` (Backslash + n), nicht ein echter Zeilenumbruch
- [ ] Angenommen das Beispiel-JSON im Prompt wird gegen das Import-Schema (`questSchema`) geprüft, wenn der Unit-Test läuft, dann besteht es; ändert sich das Schema so, dass das Beispiel nicht mehr importierbar ist, schlägt der Test fehl
- [ ] Angenommen der alte Prompt wurde ersetzt, wenn ein Entwickler das Repository durchsucht, dann gibt es **nur noch eine** Prompt-Vorlage (keine zweite, veraltete Fassung)

### Anleitung an den neuen Prompt angepasst (Refinement 2026-10-23)

- [ ] Angenommen ein Besucher liest den Kopfbereich, wenn er Lead, Meta-Zeile und Infokasten betrachtet, dann beschreiben sie den neuen Ablauf (Angaben eintragen → Prompt kopieren → mit der KI die Geschichte abstimmen → Datei importieren); die Meta-Zeile lautet „4 Schritte" ohne Zeitangabe; der Infokasten nennt nur noch einen Schritt, den man selbst macht: Ziele auf die Karte setzen
- [ ] Angenommen ein Besucher liest „So geht es", wenn er die vier Schritte betrachtet, dann lauten sie sinngemäß: (1) Angaben eintragen und Prompt erzeugen, (2) in ChatGPT, Claude oder Gemini einfügen und den Story-Vorschlag abstimmen, (3) wenn die KI fragt, die Datei ausgeben lassen und als .json speichern, (4) in Geo Quest importieren
- [ ] Angenommen ein Besucher liest „Danach", wenn er die Hinweise betrachtet, dann ist „Ziele auf die Karte setzen" weiterhin als Pflicht gekennzeichnet und „Bilder, Ton oder Video ergänzen" als freiwilliger Tipp — es gibt keinen Pflichtschritt „Medien-Adressen ersetzen" und keinen Hinweis auf „BITTE-ERSETZEN" mehr
- [ ] Angenommen ein Besucher liest „Woher Medien nehmen", wenn er den Abschnitt betrachtet, dann nennt er die heute unterstützten Quellen (YouTube, Vimeo, Dropbox, Google Drive nur für Bilder, Wikimedia Commons und Wikipedia, direkte Datei-Links) — die Aussage „die Adresse muss auf .jpg/.png/.mp3/.mp4 enden" ist entfallen
- [ ] Angenommen ein Besucher öffnet die Hilfe, wenn er die Einträge betrachtet, dann gibt es keinen Eintrag mehr zu erfundenen Bild-Adressen, der Eintrag zu ungültigen Werten erwähnt keinen Radius mehr, und es gibt einen neuen Eintrag „Die KI gibt keine Datei aus" mit dem Rat, ihr zu schreiben: „Gib die Schnitzeljagd jetzt als Geo-Quest-Datei (JSON) aus."

### Freischaltung (Refinement 2026-10-23)

- [ ] Angenommen die Anleitung ist freigeschaltet, wenn ein Nutzer das Burger-Menu öffnet, dann trägt der Eintrag „Anleitung" **keine** „Bald"-Kennzeichnung mehr
- [ ] Angenommen die Anleitung ist freigeschaltet, wenn ein Besucher `/about` öffnet, dann sieht er im Hero neben „Quest erstellen" wieder den Button „Mit KI erstellen", der nach `/anleitung` führt
- [ ] Angenommen die Anleitung ist freigeschaltet, wenn ein Ersteller `/create` ohne Quests öffnet, dann sieht er wieder den Link „Quest mit KI bauen"
- [ ] Angenommen die Anleitung ist freigeschaltet, wenn ein Besucher eine Info-Seite am Desktop öffnet, dann trägt die Kopfzeile wieder den Textlink „Anleitung", ohne Überlauf auf 375, 768 und 1440px
- [ ] Angenommen die Anleitung ist freigeschaltet, wenn `/about` auf den elf Referenz-Viewports geprüft wird, dann steht der **primäre** CTA „Quest erstellen" weiterhin über dem Falz (BUG-7 bleibt behoben)
- [ ] Angenommen die Anleitung ist freigeschaltet, wenn `/anleitung` gebaut wird, dann bleibt die Seite statisch (`○`) und die Metadaten (Title/Description) beschreiben die verfügbare Anleitung, nicht mehr die Ankündigung

## Edge Cases

1. **Besucher kommt über einen alten geteilten Link / QR-Code direkt auf `/anleitung`** → Er landet auf der Ankündigungsseite mit HTTP 200, nicht auf einer 404. Genau dafür bleibt die Route bestehen.
2. **Suchmaschine hat die alte `/anleitung` mit Prompt und Schritten indexiert** → Das Snippet im Suchergebnis kann veraltet sein, bis neu gecrawlt wird. Der Besucher landet aber auf einer Seite, die den Zustand klar erklärt. Metadaten (Title/Description) der Seite werden auf die Ankündigung gezogen, damit die Diskrepanz so kurz wie möglich bleibt.
3. **Nutzer hat die Seite im Browser-Cache oder als PWA-Shell offline** → Er sieht kurzzeitig die alte Fassung. Unkritisch: Der Prompt funktioniert weiterhin, er ist ja kein Geheimnis. Beim nächsten Laden erscheint die Ankündigung.
4. **Nutzer öffnet das Burger-Menu, während er auf `/anleitung` steht** → Der Eintrag „Anleitung" wird wie bisher als aktive Seite markiert (`aria-current`), zusätzlich zur „Bald"-Kennzeichnung. Beides zugleich ist korrekt: Es ist die aktuelle Seite *und* eine angekündigte Funktion.
5. **Screenreader-Nutzer erreicht den Menu-Eintrag** → Die „Bald"-Kennzeichnung muss vorgelesen werden, nicht nur visuell erkennbar sein. Ein rein farbliches oder rein grafisches Signal genügt nicht.
6. **Besucher mit sehr schmalem Viewport (320px) öffnet das Menu** → Der Eintrag „Anleitung" plus Kennzeichnung darf nicht umbrechen oder das 44px-Tap-Ziel verkleinern.
7. **Die Leeransicht von `/create` verliert einen ihrer drei Wege** → Es bleiben „Neue Quest erstellen" und „Quest importieren". Die Ansicht darf dadurch nicht unausgewogen oder leer wirken; der Abstand zwischen den verbliebenen Elementen ist zu prüfen.
8. **Der Hero auf `/about` verliert seinen zweiten Button** → Der verbleibende primäre CTA darf nicht allein und verloren wirken. Zugleich gewinnt der Hero Höhe, was BUG-7 (CTA über dem Falz) entschärft statt gefährdet.
9. **Der Desktop-Header verliert seinen einzigen Textlink** → `HEADER_NAV_LINKS` wird zur leeren Liste. Die Kopfzeile muss auch ohne Eintrag korrekt umbrechen und darf keine leere Lücke oder verrutschte Ausrichtung zeigen.
10. **Jemand ruft `/anleitung` mit angehängten Parametern auf** (z. B. aus einer Kampagne) → Verhalten unverändert, die Ankündigungsseite wird normal gerendert.
11. **Freischaltung später: Der Betreiber legt den Schalter um, vergisst aber die „Bald"-Kennzeichnung im Menu** → Vermeidbar, wenn beide Stellen von **derselben** Quelle gesteuert werden. Als technische Anforderung festgehalten.

_Edge Cases 12–21: Refinement 2026-10-23 (Prompt-Formular und Freischaltung)_

12. **Besucher füllt nichts aus und tippt auf „Prompt erzeugen"** → Er bekommt die unveränderte Vorlage. Die KI fragt dann laut Schritt 1 des Ablaufs selbst nach den fehlenden Angaben. Das ist gewollt, kein Fehler.
13. **Besucher trägt Anführungszeichen, Backslashes, spitze Klammern oder Markup ein** (z. B. `<script>`, `"Piraten"`) → Der Wert landet als reiner Text im Prompt und wird als Text angezeigt; nichts wird ausgeführt, kein Element entsteht. Der Prompt ist reiner Text für ein KI-Tool, kein JSON — Anführungszeichen müssen nicht maskiert werden.
14. **Besucher fügt einen sehr langen Text ein** (z. B. eine ganze Geschichte in „Besondere Wünsche") → Die Felder haben eine sinnvolle Höchstlänge; das Layout bricht nicht, kein horizontaler Überlauf auf 320px.
15. **Besucher tippt Zeilenumbrüche in „Besondere Wünsche"** → Mehrzeilige Wünsche sind erlaubt (Feld ist mehrzeilig) — oder werden zu Leerzeichen zusammengefasst, damit der Block „Meine Angaben" lesbar bleibt. Am Bildschirm zu entscheiden (siehe Open Questions).
16. **Besucher tippt bei „Anzahl" Text wie „acht" oder „8 Stationen"** → Hinweis am Feld, kein Prompt (siehe Acceptance Criteria). Auf dem Handy öffnet sich die Zahlentastatur, damit das selten vorkommt.
17. **Besucher ändert ein Feld und kopiert, ohne neu zu erzeugen** → Er kopiert den alten Stand. Der Hinweis „Angaben geändert" steht seit 2026-10-24 im Formular über dem Button, nicht mehr direkt über der Box — wer nach dem Ändern zur Box scrollt, sieht ihn dort nicht. Bewusst kein automatisches Mitändern (Betreiber-Entscheidung).
18. **JavaScript ist aus oder lädt nicht** → Formular und Button funktionieren nicht. Der Rest der Anleitung (Schritte, Hilfe) bleibt lesbar. Hingenommen: Wer ein KI-Tool im Browser bedient, hat JavaScript an. Abweichung von PROJ-13, wo der Prompt ohne JavaScript lesbar war (siehe Decision Log).
19. **Zwischenablage blockiert** (z. B. Safari ohne Nutzergeste, eingebettete Browser) → Der bestehende Hinweis aus `prompt-copy-box.tsx` erscheint, der Prompt bleibt markierbar.
20. **`/about` am Handy bekommt den zweiten Hero-Button zurück** → Auf schmalen Geräten stehen die Buttons untereinander; auf 320×568 hat der primäre CTA seit Refinement 16 von PROJ-13 nur noch 7px Luft. Der **sekundäre** Button „Mit KI erstellen" darf unter dem Falz liegen; der primäre muss sichtbar bleiben (BUG-7-Wächter).
21. **Ein Nutzer hat die Ankündigungsseite im Cache oder als installierte PWA geöffnet** → Beim nächsten Laden erscheint die volle Anleitung. Der Service Worker cacht keine Seiten (PROJ-12), es bleibt nichts hängen.

## Technical Requirements

- **Eine einzige Schaltstelle:** Sichtbarkeit der Anleitung und die „Bald"-Kennzeichnung im Menu müssen von derselben Konstante abhängen. Zwei unabhängige Schalter würden beim Freischalten auseinanderlaufen (Edge Case 11).
- **Inhalt bleibt erhalten:** Prompt (`src/lib/quest-ai-prompt.ts`), Schritte, Troubleshooting und die Komponente `prompt-copy-box.tsx` bleiben im Repository. Löschen ist ausdrücklich nicht gewünscht.
- **Der Prompt darf nicht im ausgelieferten HTML der Ankündigungsseite stehen** — nicht aus Geheimhaltung, sondern damit die Seite nicht versehentlich doch die Vorlage preisgibt und das Ausblenden dadurch wirkungslos wird.
- **Metadaten mitziehen:** `title` und `description` der Route beschreiben die Ankündigung, nicht die fertige Anleitung (Edge Case 2).
- **Statisch bleiben:** `/anleitung` steht im Build heute als statisch (`○`). Das muss so bleiben — die Ankündigung braucht keine Laufzeitlogik.
- **`InfoPageShell` bleibt Server-Komponente** — eine der bestehenden Design-Entscheidungen aus PROJ-13; Änderungen an der Kopfzeile dürfen sie nicht zur Client-Komponente machen.
- **Design System:** Die „Bald"-Kennzeichnung folgt `docs/design-system.md`. Zu beachten: maximal ein Lime-Element pro Screen (dokumentierte Regel aus PROJ-13), Kontrast ≥ 4.5:1, Tap-Ziele ≥ 44px.
- **Barrierefreiheit:** Die Kennzeichnung ist für Screenreader wahrnehmbar (Edge Case 5).
- **Tests:** Die bestehenden Suiten prüfen `/anleitung` an 41 Stellen über sechs Dateien (`proj-13-landing-page.spec.ts` allein 21×). Sie müssen auf den neuen Zustand gezogen werden — inklusive der Tests, die den Header-Textlink und den `/about`-CTA prüfen.
- **Browser:** Chrome und Mobile Safari (WebKit), wie im Projekt etabliert.

_Ergänzt 2026-10-23 (Prompt-Formular und Freischaltung):_
- **Freischalten über den bestehenden Schalter:** `ANLEITUNG_VERFUEGBAR = true` in `src/lib/app-nav.ts`. Alle fünf Stellen kommen gemeinsam zurück; keine Stelle wird einzeln umgebaut.
- **Eine Quelle für Feld-Vorlagen und Prompt-Zeilen:** Beschriftung, graue Vorlage und die Vorlagen-Zeile im Prompt kommen aus derselben Definition. Sonst kann die graue Vorlage im Feld vom Beispiel im Prompt abweichen.
- **Prompt-Erzeugung als reine Funktion** (Angaben rein, Prompt-Text raus) in `src/lib/`, mit Unit-Tests für: alle Felder leer → exakt die Vorlage; alle gefüllt; teilweise gefüllt; nur Leerzeichen; Werte mit Sonderzeichen.
- **`\n` im Quelltext:** Der Prompt steht in einem JavaScript-Template-String. Die Anweisung „Zeilenumbrüche im Text als \n schreiben" muss im Quelltext als `\\n` stehen, sonst wird daraus ein echter Zeilenumbruch und die Anweisung an die KI ist sinnlos. Ein Unit-Test hält das fest.
- **Beispiel-JSON bleibt geprüft:** Das Beispiel im Prompt liegt weiterhin als eigene Konstante vor und wird gegen `questSchema` validiert (bestehender Schutz aus PROJ-13 in `quest-ai-prompt.test.ts`).
- **`/anleitung` bleibt statisch** (`○`): Das Formular ist eine Client-Komponente innerhalb der statischen Seite; `InfoPageShell` bleibt Server-Komponente.
- **Bestehende Bausteine nutzen:** shadcn `Input`, `Textarea`, `Label`, `Button`; die Ergebnis-Box ist die vorhandene `PromptCopyBox`. Keine neuen Pakete.
- **Kein Speichern:** keine `localStorage`-Schreibzugriffe, keine Anfrage an einen Server oder Dritte beim Erzeugen oder Kopieren.
- **Barrierefreiheit:** sichtbare Beschriftung an jedem Feld (nicht nur Platzhalter — die graue Vorlage ist kein Label), Kontrast der grauen Vorlage ≥ 4.5:1 gegen den Feldhintergrund, Tap-Ziele ≥ 44px, Statusmeldung per `aria-live`.
- **Tests:** Der freigeschaltete Zustand wird zum Normalzustand. Die Ankündigungs-Tests in `proj-14-anleitung-coming-soon.spec.ts` sind an den Schalter gebunden und laufen danach nicht mehr — sie bleiben als Wächter für ein mögliches Zurückschalten erhalten, statt gelöscht zu werden. `scripts/test-anleitung-freigeschaltet.mjs` bricht heute ab, wenn der Schalter nicht auf `false` steht — anzupassen oder zu entfernen. Bestehende Assertions auf den alten Prompt, die alten Schritte, „BITTE-ERSETZEN", „ca. 15 Min" und die alten Hilfe-Einträge sind zu **ziehen, nicht zu löschen**. Neu: ein E2E-Wächter, der nach Ausfüllen und Erzeugen den Inhalt der Box mit den eingetragenen Werten vergleicht.

## Open Questions

- [x] **Geschlossen 2026-09-17:** Die FAQ-Antwort trägt **gar keine Zeitangabe** mehr (Betreiber-Entscheidung). Folge: Die Frage selbst wird mit umformuliert — eine Frage nach der Dauer ohne Antwort auf die Dauer wirkt ausweichend. Neu geht es darum, *was* zu tun ist, nicht *wie lange* es dauert.
- [x] Soll die Ankündigungsseite den Hinweis tragen, dass Quests sich **auch heute schon** mit einer KI bauen lassen? → **Gegenstandslos 2026-10-23:** Die Ankündigung entfällt mit der Freischaltung.
- [x] **Geschlossen 2026-09-17 (Frontend):** Die Meta-Zeile entfällt auf der Ankündigung — sie beschreibt einen Ablauf, der dort nicht gezeigt wird. Im freigeschalteten Zustand bleibt sie.
- [ ] _(2026-10-23)_ Soll die FAQ auf `/about` die KI-Anleitung erwähnen? Heute beschreibt sie nur das manuelle Erstellen — das bleibt nach der Freischaltung richtig, verschweigt aber den neuen Weg. Empfehlung: nach dem Launch beobachten, nicht in diesem Refinement.
- [x] _(2026-10-23)_ Die Vorlagen-Zeile „Spielort: z.B. Park" steht im gelieferten Prompt **ohne** eckige Klammern und mit „z.B." statt „z. B." — anders als die übrigen vier. Bleibt das Feld leer, könnte die KI „Park" als echte Angabe lesen statt als Beispiel und nicht nachfragen. Empfehlung: angleichen zu „[z. B. Park]". Vom Betreiber zu bestätigen, bevor `/frontend` die Vorlage übernimmt. → **Geschlossen 2026-10-24:** Angeglichen zu „Spielort: [z. B. Park]" (Betreiber).
- [x] _(2026-10-23)_ „Besondere Wünsche": einzeiliges Feld oder mehrzeiliges Textfeld (Edge Case 15)? → **Geschlossen 2026-10-24 (Frontend):** mehrzeilig, 3 Zeilen; Zeilenumbrüche werden im Prompt zu Leerzeichen.
- [x] _(2026-10-23)_ Höchstlängen der Felder → **Geschlossen 2026-10-24 (Frontend):** wie vorgeschlagen, Thema 80, Alter 40, Anzahl 2, Spielort 80, Wünsche 300.
- [x] **Geschlossen 2026-09-17:** Ja — der freigeschaltete Zustand wird mitgeprüft (Betreiber-Entscheidung). Ohne diese Absicherung könnte die fertige Anleitung während der Ankündigungsphase unbemerkt kaputtgehen; auffallen würde es erst beim Freischalten, also im denkbar schlechtesten Moment.

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Route `/anleitung` bleibt bestehen und wird zur Ankündigungsseite, statt 404 zu liefern | Bereits geteilte Links, QR-Codes und Suchergebnisse laufen sonst ins Leere. Eine erklärende Seite ist in jedem Fall besser als eine Fehlermeldung — und die URL bleibt für die spätere Freischaltung erhalten | 2026-09-17 |
| Menu-Eintrag bleibt sichtbar, mit „Bald"-Kennzeichnung | Das **ist** die Ankündigung. Der Eintrag nimmt keinen Platz weg, der anderweitig gebraucht würde, und erreicht jeden Nutzer auf jedem Screen — anders als die Seite selbst, die man erst aufrufen muss | 2026-09-17 |
| Eintrag bleibt klickbar statt deaktiviert | Ein ausgegrauter, toter Eintrag frustriert; er kündigt an, ohne zu erklären. Der Klick führt auf die Seite, die die Ankündigung ausführt | 2026-09-17 |
| Die beiden werblichen CTAs (`/about` Hero, `/create` Leeransicht) entfallen ersatzlos | Ein Call-to-Action ist ein Versprechen auf eine Handlung. Führt er auf „gibt's noch nicht", beschädigt er den Conversion-Weg an genau der Stelle, an der er am teuersten ist. Refinement 4 von PROJ-13 hat die Hero-CTAs eigens auf `/create` gezogen, um diesen Weg zu verkürzen — ihn jetzt mit einer Sackgasse zu teilen, wäre ein Rückschritt | 2026-09-17 |
| Kein Datum und kein Zeitraum für die Verfügbarkeit | Solo-Entwickler ohne festen Termin (PRD, Constraints). Ein verpasstes Datum auf einer Live-Seite kostet mehr Glaubwürdigkeit, als die Angabe an Vorfreude einbringt. Die Seite sagt stattdessen klar, **was** kommt | 2026-09-17 |
| Ankündigungsseite zeigt einen kurzen Ausblick inkl. „Was dabei herauskommt", aber keinen Prompt und keine Schritte | Der Besucher soll verstehen, worauf er wartet — sonst nimmt er von der Seite nichts mit. Prompt und Schritte zu zeigen, würde die Funktion faktisch doch ausliefern und die Entscheidung gegen den Launch aushebeln | 2026-09-17 |
| Der Ausblick nutzt die bereits vorhandenen vier „Was dabei herauskommt"-Punkte, sprachlich in die Zukunft gesetzt | Der Text ist geschrieben, abgenommen und beschreibt exakt das Richtige. Neu zu formulieren, was schon passt, erzeugt nur eine zweite Fassung, die später auseinanderläuft | 2026-09-17 |
| Die Seite bietet einen Weg zum manuellen Erstellen an | Wer die Anleitung sucht, will eine Quest bauen. Ihn mit „geht noch nicht" allein zu lassen, verschenkt genau den Besucher, der am ehesten Ersteller wird — das manuelle Erstellen funktioniert ja vollständig | 2026-09-17 |
| Der einzige Textlink des Desktop-Headers („Anleitung") entfällt, ohne Ersatz | Konsequent zur Entscheidung, die werblichen Wege zu schließen. Ein anderes Ziel nachrücken zu lassen, würde die Navigation über die Ankündigung hinaus verändern — das ist nicht Zweck dieses Features | 2026-09-17 |
| Die FAQ-Antwort „Wie lange dauert das Erstellen?" wird auf das manuelle Erstellen umgeschrieben, statt entfernt | „Wie lange dauert das?" ist für Ersteller eine der relevantesten Fragen. Sie stehen zu lassen mit einer Antwort über eine nicht existierende Funktion wäre das Gegenteil dessen, was dieses Feature erreichen soll | 2026-09-17 |
| Keine „Benachrichtige mich"-Anmeldung | Erfordert Backend und Verarbeitung personenbezogener Daten — beides laut PRD ausgeschlossen (kein Backend, kein Account, kein Tracking) | 2026-09-17 |
| Der fertige Inhalt wird ausgeblendet, nicht gelöscht | Die Anleitung ist gebaut, QA-geprüft und deployt gewesen. Sie zu löschen und später neu zu schreiben, wäre Verschwendung und würde beim Wiederaufbau neue Fehler einführen | 2026-09-17 |
| Die FAQ-Antwort zum Erstellen trägt gar keine Zeitangabe mehr | Betreiber-Entscheidung. Jede Zahl wäre geraten: Die bisherige halbe Stunde galt mit KI-Hilfe, und wie lange manuelles Erstellen dauert, hängt stark vom Umfang ab. Eine falsche Zahl enttäuscht beim ersten Versuch — lieber keine als eine erfundene | 2026-09-17 |
| Die zugehörige FAQ-Frage wird mitumformuliert (weg von „wie lange") | Folge der Entscheidung darüber: Eine Frage nach der Dauer, die keine Dauer nennt, wirkt ausweichend. Die Frage zielt neu darauf, *was* zu tun ist | 2026-09-17 |
| **Refinement 2026-10-23:** Die Anleitung wird mit diesem Refinement freigeschaltet | Betreiber-Entscheidung. Formular und neuer Prompt sind der Inhalt, auf den die Ankündigung gewartet hat; ohne Freischaltung sähe niemand außer den Tests das Formular | 2026-10-23 |
| **Refinement 2026-10-23:** Das Refinement hängt an PROJ-14, nicht an PROJ-13 | PROJ-14 trägt den Schalter und den ganzen Weg von der Ankündigung zum Launch. Der Titel wird zu „KI-Anleitung" | 2026-10-23 |
| **Refinement 2026-10-23:** Alle fünf Angaben aus „Meine Angaben" werden Eingabefelder (Thema, Alter, Anzahl, Spielort, Wünsche) | Betreiber-Entscheidung. Ohne Feld bliebe die Zeile als Beispiel im kopierten Prompt stehen, und der Nutzer müsste sie im Chat doch selbst ändern — genau das soll das Formular ersparen | 2026-10-23 |
| **Refinement 2026-10-23:** Beispiele als graue Vorlage im leeren Feld, nicht vorausgefüllt | Betreiber-Entscheidung. Niemand bekommt versehentlich eine Detektiv-Quest, weil er ein vorausgefülltes Feld übersehen hat | 2026-10-23 |
| **Refinement 2026-10-23:** Leere Felder sperren nichts; je Feld steht entweder der Wert oder die unveränderte Vorlagen-Zeile im Prompt | Betreiber-Entscheidung. Wer nichts einträgt, bekommt die Vorlage und macht seine Angaben im Chat. Ausgefüllte Angaben fehlen der KI nicht, also fragt sie laut Schritt 1 auch nicht danach — der gewünschte Effekt „KI fragt nicht nach dem, was im Formular stand" ergibt sich ohne Änderung am Prompt | 2026-10-23 |
| **Refinement 2026-10-23:** Schritt 1 des Ablaufs („Prüfe zuerst meine Angaben … stelle Rückfragen") bleibt wörtlich | Betreiber-Entscheidung. Vorgeschlagen war eine Umformulierung („Angaben sind vollständig, frag nicht nach"); verworfen, weil sie bei leeren Feldern falsch wäre | 2026-10-23 |
| **Refinement 2026-10-23:** Prompt-Box erst nach „Prompt erzeugen", kein Live-Mitändern | Betreiber-Entscheidung. Die Reihenfolge „ausfüllen, dann erzeugen" ist sichtbar. Ändert sich danach ein Feld, bleibt die Box mit dem Hinweis „Angaben geändert" und einem Knopf zum Neuerzeugen stehen — niemand kopiert unbemerkt einen alten Stand | 2026-10-23 |
| **Refinement 2026-10-23:** „Anzahl der Stationen" nimmt nur ganze Zahlen von 1 bis 20 an, sonst Hinweis am Feld | Die App erlaubt höchstens 20 Stationen (Import-Schema). Ein Prompt mit „25" würde eine Datei erzeugen, die der Import abweist — der Fehler fiele erst am Ende des KI-Gesprächs auf. Ohne Rückfrage entschieden, weil es nur die bestehende Grenze durchsetzt | 2026-10-23 |
| **Refinement 2026-10-23:** Der alte Prompt wird ersetzt, nicht neben dem neuen behalten | Zwei Vorlagen würden auseinanderlaufen. Die Git-History bewahrt die alte Fassung | 2026-10-23 |
| **Refinement 2026-10-23:** Die übrige Anleitung wird an den neuen Prompt angepasst (Lead, Meta ohne Zeit, vier neue Schritte, Medien als freiwilliger Tipp, Medienquellen nach PROJ-15, Hilfe überarbeitet) | Betreiber-Entscheidung. Der neue Prompt erzeugt keine Medien und arbeitet im Dialog; Pflichtschritt „Medien-Adressen ersetzen", „BITTE-ERSETZEN" und „Adresse endet auf .jpg" würden ins Leere zeigen bzw. waren seit PROJ-15 überholt. „ca. 15 Min" entfällt, weil das Abstimmen mit der KI unterschiedlich lange dauert | 2026-10-23 |
| **Refinement 2026-10-24:** Vorlagen-Zeile „Spielort" angeglichen zu „[z. B. Park]" | Betreiber-Entscheidung. Ohne eckige Klammern hätte die KI „Park" bei leerem Feld als echte Angabe lesen und nicht nachfragen können. Jetzt sind alle fünf Zeilen gleich gebaut | 2026-10-24 |
| **2026-10-24:** Die Ankündigung („Bald verfügbar") wird vollständig entfernt — Schalter `ANLEITUNG_VERFUEGBAR`, Ankündigungsseite, „Bald"-Kennzeichnung im Menü, die Bedingungen an `/about`, `/create` und in der Kopfzeile, die Ankündigungs-Tests, das Prüfskript `test:e2e:angekuendigt` und der Test-Helfer | Betreiber-Entscheidung: Ein Zurück zur Ankündigung ist nicht vorgesehen. Hebt die Entscheidungen „Ankündigung bleibt als Weg zurück im Code" und „Tests prüfen beide Zustände" (2026-09-17 und 2026-10-23) auf. Die alte Fassung liegt in der Git-History | 2026-10-24 |
| **2026-10-24:** Hinweis „Angaben geändert" ins Formular über den Button; der Button selbst heißt dann „Prompt neu erzeugen", der eigene Knopf an der Box entfällt | Betreiber-Entscheidung. Der Hinweis steht dort, wo man gerade tippt, und es gibt nur noch einen Erzeugen-Knopf statt zwei mit derselben Wirkung. Preis: Direkt an der Box steht kein Hinweis mehr (Edge Case 17) | 2026-10-24 |
| **Refinement 2026-10-23:** Der Prompt braucht JavaScript, um sichtbar zu werden | Folge des Formulars. PROJ-13 hatte den Prompt bewusst ohne JavaScript lesbar gemacht; das gilt für eine feste Vorlage, nicht für einen erzeugten Text. Hingenommen (Edge Case 18) | 2026-10-23 |
| Eigenes Feature (PROJ-14) statt Refinement von PROJ-13 | Die Änderung umfasst fünf Berührungspunkte über drei bestehende Features (PROJ-1 Navigation, PROJ-6 Creator-Leeransicht, PROJ-13 Info-Seiten), ist eigenständig testbar und deploybar — und wird später als Ganzes wieder zurückgenommen. Als Refinement in PROJ-13 wäre der Navigations- und Creator-Anteil dort fehl am Platz | 2026-09-17 |

### Technical Decisions
_To be added by /architecture_

| Decision | Rationale | Date |
|----------|-----------|------|
| Ein einziger Wahrheitswert steuert alle fünf Stellen | Die Spec verlangt es (Edge Case 11), und der Fehler ohne ihn wäre still: Eine vergessene Stelle beim Freischalten stürzt nicht ab und warnt nicht — etwa eine funktionierende Anleitung, deren Menu-Eintrag weiter „Bald" sagt | 2026-09-17 |
| Der Schalter steht in `src/lib/app-nav.ts` | Diese Datei ist bereits heute der gemeinsame Ursprung für Burger-Menu und Info-Kopfzeile — zwei der fünf betroffenen Stellen. Sie ist zudem ein reines Datenmodul ohne `"use client"`, wird also sowohl von der Client-Komponente `app-nav-menu.tsx` als auch von der Server-Komponente `info-page-shell.tsx` gelesen | 2026-09-17 |
| Fester Wert im Quelltext statt Umgebungsvariable | Eine Laufzeit-Einstellung würde die betroffenen Seiten von statisch auf dynamisch umstellen und ihre Ladezeit von 0,07–0,09 s verschlechtern. Für einen Schalter, der voraussichtlich genau einmal umgelegt wird, ein schlechter Tausch. Zusätzlicher Vorteil: Der Prompt landet gar nicht erst im ausgelieferten HTML | 2026-09-17 |
| Die entfernten CTAs bleiben als bedingter Code stehen, statt gelöscht zu werden | Vom Betreiber so entschieden: Freischalten soll eine Zeile kosten, nicht ein Wiedereinbauen aus der Git-History. Preis ist etwas mehr Code, der zum Launch nicht ausgeführt wird | 2026-09-17 |
| Kein neues Paket; `badge.tsx` aus shadcn/ui wird **nicht** verwendet | Die vorhandene Badge-Komponente ist eine gefüllte Pille mit Rahmen und damit kräftiger als gewünscht — neben der großen kursiven Menu-Schrift ein Fremdkörper. Die Kennzeichnung soll ankündigen, nicht um Aufmerksamkeit konkurrieren | 2026-09-17 |
| Kennzeichnung als echter Text, nicht als Farbe oder Icon | Sie muss für Screenreader wahrnehmbar sein (Edge Case 5). Ein rein visuelles Signal erfüllt das nicht | 2026-09-17 |
| Kennzeichnung in Grau statt in einer Signalfarbe | Das Design System erlaubt ein Lime-Element pro Screen; Teal ist im Menu bereits für den aktiven Eintrag belegt. Grau hält die Ankündigung zurückhaltend — sie soll informieren, nicht werben | 2026-09-17 |
| Kennzeichnung sitzt innerhalb der bestehenden 48px-Zeile, rechtsbündig | Verhindert, dass sie das 44px-Tap-Ziel verkleinert oder auf 320px umbricht (Edge Case 6). Die Position ist erprobt — der Ko-fi-Eintrag trägt dort sein Pfeil-Icon | 2026-09-17 |
| `prompt-copy-box.tsx` und `quest-ai-prompt.ts` bleiben unangetastet | Sie werden von der Ankündigungsseite nur nicht mehr aufgerufen. Sie zu ändern würde Risiko ohne Nutzen erzeugen — und beide tragen eigene Unit-Tests, die grün bleiben sollen | 2026-09-17 |
| Die Tests prüfen beide Zustände — auch den freigeschalteten | Betreiber-Entscheidung. Die fertige Anleitung bleibt im Code liegen, wird aber nicht ausgeliefert und damit von keinem normalen Test berührt. Ohne ausdrückliche Prüfung könnte sie still verrotten und erst beim Freischalten auffallen. Technisch möglich, weil beide Zustände im Code vorliegen | 2026-09-17 |
| Kein Backend, keine gespeicherten Daten | Das Feature ändert nur, was dargestellt wird. Es gibt keinen Zustand, der über einen Seitenaufruf hinaus bestehen müsste — im Einklang mit dem PRD (kein Backend, kein Account) | 2026-09-17 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

_Erstellt: 2026-09-17_

### Die Kernentscheidung: ein Schalter für fünf Stellen

Das gesamte Feature hängt an einer einzigen Frage: **Woher wissen fünf verschiedene Stellen der App, dass die Anleitung noch nicht verfügbar ist?**

Die Antwort ist ein einzelner Wahrheitswert (verfügbar: ja/nein), der an einem Ort steht und von allen fünf Stellen gelesen wird. Beim Freischalten wird dieser eine Wert umgestellt — und Seite, Menu-Kennzeichnung, Header-Link und beide Call-to-Actions kommen **gleichzeitig** zurück.

Warum das wichtig genug für eine eigene Entscheidung ist: Ohne diesen gemeinsamen Ursprung müsste der Betreiber beim Freischalten an fünf Stellen daran denken. Vergisst er eine, entsteht ein Zustand, den niemand bemerkt — etwa eine fertige, funktionierende Anleitung, auf deren Menu-Eintrag weiterhin „Bald" steht. Dieser Fehler ist still: Nichts stürzt ab, keine Warnung erscheint, und der Betreiber sieht es nur, wenn er zufällig das Menu öffnet.

Der Schalter kommt in die Datei, die die Navigation der App beschreibt (`src/lib/app-nav.ts`). Das ist bereits heute der gemeinsame Ursprung für Burger-Menu und Info-Kopfzeile — dieselbe Rolle, dieselbe Datei.

**Wichtige Eigenschaft:** Der Wert steht fest im Code, er ist keine Einstellung zur Laufzeit. Das heißt, beim Bauen der App ist bereits entschieden, was ausgeliefert wird — die Ankündigungsseite enthält den Prompt dann gar nicht erst, statt ihn nur zu verstecken. Das erfüllt die Anforderung aus der Spec, dass der Prompt nicht im ausgelieferten HTML stehen darf.

### Was an den fünf Stellen passiert

```
src/lib/app-nav.ts
  └── ANLEITUNG_VERFUEGBAR  (der eine Schalter)
        │
        ├──► 1. Die Seite /anleitung
        │       verfügbar:       volle Anleitung (Prompt, Schritte, Troubleshooting)
        │       nicht verfügbar: Ankündigung (Ausblick, kein Prompt)
        │
        ├──► 2. Burger-Menu, Gruppe Info
        │       verfügbar:       „Anleitung"
        │       nicht verfügbar: „Anleitung  [Bald]"
        │
        ├──► 3. Desktop-Header der Info-Seiten
        │       verfügbar:       Textlink „Anleitung"
        │       nicht verfügbar: kein Textlink
        │
        ├──► 4. /about, zweiter Hero-Button
        │       verfügbar:       „Mit KI erstellen"
        │       nicht verfügbar: Button fehlt
        │
        └──► 5. /create, Leeransicht
                verfügbar:       Link „Quest mit KI bauen"
                nicht verfügbar: Link fehlt
```

### Aufbau der Ankündigungsseite

Die Seite behält ihren Rahmen (Kopfzeile, Zurück-Pfeil, Fußzeile) — es wechselt nur, was in der Mitte steht:

```
/anleitung  (Zustand: nicht verfügbar)
+-- Seitenrahmen (unverändert, aus PROJ-13)
|   +-- Kopfzeile: Zurück-Pfeil, Ko-fi-Icon, „Zur App"
|   +-- Fußzeile
|
+-- Kennzeichnung „Bald verfügbar"
+-- Titel „Quest bauen mit KI."           (unverändert)
+-- Kurzer Ausblick (2-3 Sätze)           (neu formuliert)
+-- Kasten „Was dabei herauskommen wird"  (4 bestehende Punkte, Zukunft)
+-- Weg zum manuellen Erstellen -> /create
|
+-- NICHT enthalten: Prompt, Kopieren-Button, 4 Schritte, Troubleshooting
```

Die ausgeblendeten Teile bleiben als Textbausteine in der Datei stehen und werden nur nicht dargestellt. Die Prompt-Vorlage selbst (`src/lib/quest-ai-prompt.ts`) und der Kopier-Baustein (`prompt-copy-box.tsx`) werden **nicht angefasst** — sie werden lediglich von dieser Seite aus nicht mehr aufgerufen.

### Datenmodell

**Es wird nichts gespeichert.** Dieses Feature legt keine Daten an, liest keine und verändert keine. Es gibt keinen neuen Eintrag im Browser-Speicher, keine Datei, keine Nutzereinstellung.

Der einzige Zustand ist die eine Konstante im Quelltext:

```
Verfügbarkeit der KI-Anleitung
- ein Wahrheitswert: verfügbar oder nicht verfügbar
- steht fest im Quelltext (src/lib/app-nav.ts)
- zum Launch: nicht verfügbar
- Änderung erfordert ein neues Deployment
```

Bewusst **keine** Laufzeit-Einstellung (etwa über eine Umgebungsvariable in Vercel): Das würde erlauben, die Anleitung ohne Deployment umzuschalten — klingt praktisch, macht aber die Seite dynamisch statt statisch und nimmt ihr damit die heutige Ladezeit von 0,07–0,09 s. Für einen Schalter, der voraussichtlich genau einmal umgelegt wird, ist das ein schlechter Tausch.

### Kein Backend

Unverändert zum Rest des Projekts: kein Server, keine Datenbank, keine API-Route. Die Änderung betrifft ausschließlich, was beim Bauen der Seiten dargestellt wird. `/anleitung`, `/about` und die übrigen Info-Seiten bleiben statische Seiten.

### Die Kennzeichnung „Bald"

Drei Anforderungen aus der Spec bestimmen die Gestaltung:

1. **Für Screenreader wahrnehmbar** (Edge Case 5) — die Kennzeichnung ist echter Text, kein Farbpunkt und kein Icon. Wer die App vorlesen lässt, hört „Anleitung, Bald".
2. **Kein zweites Lime-Element** — das Design System erlaubt ein Lime-Element pro Screen. Das Burger-Menu nutzt Teal für den aktiven Eintrag; die Kennzeichnung wird deshalb zurückhaltend in Grau gehalten, nicht in einer Signalfarbe. Sie soll ankündigen, nicht um Aufmerksamkeit konkurrieren.
3. **Darf das Tap-Ziel nicht verkleinern** (Edge Case 6) — sie sitzt innerhalb der bestehenden 48px-Zeile des Menu-Eintrags, rechtsbündig an der Stelle, an der der Ko-fi-Eintrag sein Pfeil-Icon trägt. Diese Position ist also bereits erprobt.

Für den Eintrag gilt weiterhin die bestehende Markierung der aktiven Seite: Steht der Nutzer auf `/anleitung`, ist der Eintrag zugleich als aktuelle Seite markiert **und** trägt die Kennzeichnung (Edge Case 4).

### Der Sonderfall Desktop-Header

Die Kopfzeile aller Info-Seiten führt heute genau einen Textlink, und das ist „Anleitung". Fällt er weg, ist die Liste leer.

Das ist unkritisch, aber es lohnt der ausdrückliche Hinweis an die Umsetzung: Die Kopfzeile darf durch die leere Liste keine Lücke und keine verrutschte Ausrichtung bekommen (Edge Case 9). Die verbleibenden Elemente — Ko-fi-Icon und „Zur App" — sind rechtsbündig gesetzt und sollten unverändert stehen.

Ein zweiter Punkt: Die Datei `info-page-shell.tsx` ist eine **Server-Komponente** und muss es bleiben (Technical Requirement aus der Spec). Der Schalter ist ein einfacher Wert ohne Interaktivität und ändert daran nichts — anders als etwa der Ko-fi-Tooltip, der dafür seinerzeit in eine eigene Datei ausgelagert werden musste.

### Betroffene Dateien

| Datei | Art der Änderung |
|-------|------------------|
| `src/lib/app-nav.ts` | Der Schalter kommt hinzu; Menu-Eintrag und Header-Liste lesen ihn |
| `src/components/app-nav-menu.tsx` | Zeigt die Kennzeichnung, wenn der Schalter es verlangt |
| `src/components/info-page-shell.tsx` | Kopfzeile ohne Textlink prüfen (Ausrichtung) |
| `src/app/(info)/anleitung/page.tsx` | Zwei Zustände: Ankündigung oder volle Anleitung |
| `src/app/(info)/about/page.tsx` | Zweiter Hero-Button bedingt; FAQ-Antwort umgeschrieben |
| `src/app/create/page.tsx` | KI-Link in der Leeransicht bedingt |

**Nicht angefasst:** `src/lib/quest-ai-prompt.ts`, `src/components/prompt-copy-box.tsx`, `/impressum`, `/datenschutz` sowie sämtliche Quest-, Import- und Editor-Logik.

### Auswirkung auf die Tests

Die bestehenden Suiten prüfen `/anleitung` an 41 Stellen über sechs Dateien — die meisten davon (21) in `proj-13-landing-page.spec.ts`. Diese Tests beschreiben den heutigen, funktionierenden Zustand und werden durch die Änderung **absichtlich** falsch.

Empfehlung für die Umsetzung: Diese Tests nicht einfach löschen, sondern auf den neuen Zustand ziehen. Sie sind die Absicherung dafür, dass beim späteren Freischalten wieder der richtige Zustand entsteht.

**Entschieden (2026-09-17):** Die Tests prüfen **beide** Zustände. Weil beide im Code vorliegen, lässt sich der freigeschaltete Zustand mitprüfen, ohne ihn auszuliefern — sonst könnte die fertige Anleitung während der Ankündigungsphase unbemerkt kaputtgehen und würde erst beim Freischalten auffallen.

Die Umsetzung braucht dafür einen Weg, die Seite im Test mit umgelegtem Schalter zu rendern. Das ist der einzige Punkt, an dem der Schalter mehr als ein fester Wert sein muss — und der Grund, ihn beim Bauen bewusst testbar anzulegen.

### Neue Pakete

**Keine.** Alles Nötige ist vorhanden: `lucide-react` liefert die Icons, das Design System die Gestaltung, und die Kennzeichnung ist schlichter Text.

Bewusst **nicht** verwendet wird die vorhandene `badge.tsx`-Komponente aus shadcn/ui: Ihr Erscheinungsbild (gefüllte Pille mit Rahmen) ist kräftiger als gewünscht und würde im Menu neben der großen kursiven Schrift der Einträge als Fremdkörper wirken. Die Kennzeichnung soll zurückhaltend sein — eine dezente Textmarkierung genügt, wie sie der Ko-fi-Eintrag mit seinem Pfeil-Icon an derselben Stelle bereits vorzeichnet.

### Risiken

| Risiko | Einschätzung |
|--------|--------------|
| Der geteilte Seitenrahmen `InfoPageShell` wird verändert und beschädigt Nachbarseiten | Bekanntes Muster im Projekt — bei jeder bisherigen Änderung daran wurden `/impressum` und `/datenschutz` mitgeprüft. Als Acceptance Criterion bereits festgehalten |
| Der Hero auf `/about` verliert seinen zweiten Button und wirkt unausgewogen | Gestalterisch zu prüfen. Nebeneffekt ist positiv: Der Hero wird kürzer, was BUG-7 (CTA über dem Falz) weiter entschärft |
| Beim Freischalten bleibt eine Stelle zurück | Durch den einen Schalter konstruktiv ausgeschlossen — das ist sein Zweck |
| Suchmaschinen zeigen noch die alte Beschreibung | Zeitlich begrenzt; Metadaten werden mitgezogen (Edge Case 2) |


## Implementation Notes (Frontend)

_Umgesetzt: 2026-09-17_

### Was gebaut wurde

Sechs Dateien, kein neues Paket, keine neue Komponente, keine neue Route.

| Datei | Änderung |
|-------|----------|
| `src/lib/app-nav.ts` | `ANLEITUNG_VERFUEGBAR` (der Schalter), Feld `badge` an `AppNavLink`, Menu-Eintrag mit „Bald", `HEADER_NAV_LINKS` leer solange angekündigt |
| `src/components/app-nav-menu.tsx` | Rendert die Kennzeichnung im bestehenden `content`-Block |
| `src/app/(info)/anleitung/page.tsx` | Aufgeteilt in `AnleitungAngekuendigt()` und `AnleitungVollstaendig()`; Metadaten folgen dem Schalter |
| `src/app/(info)/about/page.tsx` | Sekundärer Hero-CTA bedingt; FAQ-Frage und -Antwort umgeschrieben |
| `src/app/create/page.tsx` | KI-Link der Leeransicht bedingt |
| `scripts/test-anleitung-freigeschaltet.mjs` | **neu** — legt den Schalter um, baut, testet, stellt zurück |

`src/components/info-page-shell.tsx` musste **nicht** angefasst werden: Es rendert `HEADER_NAV_LINKS` in einer Schleife, und eine leere Liste ergibt von selbst keine Ausgabe. Die Kopfzeile bleibt damit auch eine Server-Komponente. `quest-ai-prompt.ts` und `prompt-copy-box.tsx` sind unverändert.

### Gemessen statt geschätzt

**Der Prompt ist nicht ausgeliefert, nicht bloß versteckt.** Im gebauten HTML von `/anleitung`: 0 Treffer für „BITTE-ERSETZEN", „Prompt kopieren", „Der Prompt", „So geht es", „Zwei Pflichtschritte", „Die Datei wird nicht angenommen". Auch **0 Treffer im gesamten Client-Bundle** (`.next/static/`). Der Wert ist zur Bauzeit bekannt, der Zweig wird nie gerendert.

**Die Kennzeichnung im Menu** (Chrome, 360×640): Text „AnleitungBald", Farbe `rgb(160, 168, 171)`, 11px, rechtsbündig bei x=313, Breite 23px. Tap-Ziel unverändert **231×48px** — die Kennzeichnung verkleinert es nicht. Vier Gruppen, sieben Ziele, Ko-fi unberührt.

**`/anleitung` bleibt statisch** (`○` im Build) — Ladezeit im Production-Server 0,0017 s. Alle sieben Routen HTTP 200.

**Der Header-Textlink ist auf allen vier Info-Seiten weg** (0 Treffer für `href="/anleitung"` in about, anleitung, impressum, datenschutz). Nachbarseiten unbeschädigt.

**Das JSON-LD zog automatisch mit:** Die FAQ-Konstante speist sichtbare Seite und strukturierte Daten — „Wie erstelle ich eine Quest?" erscheint zweimal im HTML, „halbe Stunde" keinmal.

### Der freigeschaltete Zustand ist geprüft

Auf Entscheidung des Betreibers prüfen die Tests **beide** Zustände. `npm run test:e2e:freigeschaltet` legt den Schalter um, baut, testet und stellt ihn zurück — auch bei Fehlschlag oder Abbruch (`finally` + Signal-Handler).

**Ergebnis: 22/22 auf Chrome und Mobile Safari.** Damit ist die zentrale Behauptung des Features belegt: Eine Zeile bringt Seite, Prompt, Schritte, Troubleshooting, beide CTAs und den Header-Link gleichzeitig zurück.

### Gegenprobe

Zwei absichtlich eingebaute Fehler, beide gefangen:

1. **Badge entfernt** → genau die 2 zuständigen Tests fallen
2. **`HEADER_NAV_LINKS` ignoriert den Schalter** (der „stille Fehler", den das Feature verhindern soll) → 4 Tests fallen, darunter der Kopfzeilen-Test

### Bestehende Tests: gezogen, nicht gelöscht

Die Suiten prüften `/anleitung` an 41 Stellen. Behandlung:

- **11 Tests zur Anleitungs-Inhalten** (Prompt-Vorlage, Erwartungsmanagement, Troubleshooting) sind per `test.skip` an den Schalter gehängt statt gelöscht — sie sind genau das, was beim Freischalten wieder greifen muss.
- **Der Rest ist auf den neuen Zustand gezogen:** CTA-Tests prüfen jetzt Abwesenheit, der Titel-Test die neuen Metadaten, der Eyebrow-Test „Bald verfügbar", die FAQ-Tests die neue Frage.
- **Zwei Stellen fielen erst im Lauf auf:** `getByRole("link", { name: "Anleitung", exact: true })` trifft nicht mehr, weil der Eintrag jetzt „AnleitungBald" heißt — in zwei Dateien auf `href` umgestellt.

### Drei Fehler in meinen eigenen Tests (Produkt war jeweils richtig)

1. **Mehrdeutiger Locator** — „Rätsel und Aufgaben" steht im Ausblick *und* im Abschluss-CTA; auf die Liste eingegrenzt.
2. **Jahres-Regex** `\b20\d\d\b` schlug auf dem Copyright-Jahr der Fußzeile an — auf `main` eingegrenzt.
3. **`nav a` zählte 11 statt 7** — die Fußzeilen-Navigation zählte mit; auf den Menu-Dialog eingegrenzt.

Dazu zwei **Messfehler in der Browser-Sonde**, die wie Produktfehler aussahen: `page.url()` vor dem Ende der Client-Navigation gelesen (die H1 war bereits die richtige), und „So geht es" auf `/about` gefunden — das ist dort eine eigene Sektionsüberschrift, nicht ein Rest der Anleitung.

### Testergebnis

| Suite | Ergebnis |
|-------|----------|
| Chrome 152 (Production-Build) | **405 passed / 22 skipped / 0 failed** |
| Mobile Safari (WebKit) | **404 passed / 23 skipped / 0 failed** |
| Freigeschalteter Zustand (beide Engines) | **22 passed / 0 failed** |
| Unit (Vitest) | **186 passed** |
| Build / Lint | sauber (6 vorbestehende Warnungen, 0 Fehler) |

Neu: `tests/proj-14-anleitung-coming-soon.spec.ts` (27 Tests) und `tests/proj-14-anleitung-freigeschaltet.spec.ts` (11 Tests, nur im Schalter-Lauf).

### Abweichungen von der Spec

Keine inhaltlichen. Zwei Präzisierungen:

- **`info-page-shell.tsx` blieb unverändert** — die Spec führte sie als „Kopfzeile ohne Textlink prüfen (Ausrichtung)". Geprüft wurde sie (375/768/1440px ohne Überlauf), zu ändern war nichts.
- **Die Meta-Zeile „4 Schritte · ca. 15 Min" entfällt auf der Ankündigung** (offene Frage aus der Spec). Sie beschreibt einen Ablauf, der dort nicht gezeigt wird.

### Offen

- **Edge Case 3** (Nutzer mit gecachter alter Fassung) ist konstruktiv abgedeckt, aber nicht messbar — beim nächsten Laden erscheint die Ankündigung.
- Die reguläre `playwright.config.ts` zeigt weiterhin auf das kaputte Chromium-Binary. Dieser Lauf nutzte `playwright.prod.config.ts` (Chrome + Production-Build).

## QA Test Results

_Getestet: 2026-09-18 — gegen den **Production-Build** (`next start`), nicht gegen den Dev-Server._

### Ergebnis

**25 von 25 Acceptance Criteria erfüllt. Keine Critical-, High-, Medium- oder Low-Bugs im Feature. Production-Ready.**

| Bereich | AC | Ergebnis |
|---------|----|----------|
| Die Ankündigungsseite | 9 | 9 bestanden |
| Die Einstiegspunkte | 6 | 6 bestanden |
| Ehrlichkeit der übrigen Copy | 5 | 5 bestanden |
| Bewahrung des fertigen Inhalts | 2 | 2 bestanden |
| Keine Regression | 3 | 3 bestanden |

### Unabhängig nachgemessen, nicht aus der Frontend-Phase übernommen

**Der Prompt ist nicht ausgeliefert, nicht bloß versteckt.** Live vom Server geprüft (nicht aus `.next/`): 0 Treffer für „BITTE-ERSETZEN", „Du hilfst mir", „Aufbau der JSON-Datei", „HIER EINTRAGEN", „Prompt", „Kopieren", „So geht es", „Zwei Pflichtschritte", „Wikimedia", „Die Datei wird nicht angenommen". Darüber hinaus **alle 15 JS-Dateien einzeln abgerufen**, die die Seite lädt — kein Treffer; ebenso wenig irgendwo in `.next/static/`. Das strengste Kriterium der Spec ist damit erfüllt.

**Der Schalter wurde selbst umgelegt.** Ich habe mich nicht auf den Testlauf der Frontend-Phase verlassen: Schalter auf `true`, gebaut, gemessen — die volle Anleitung kommt zurück (BITTE-ERSETZEN 8×, „Du hilfst mir" 2×, Troubleshooting, Pflichtschritte), die Ankündigung verschwindet (0×), und **alle drei Einstiegspunkte sind wieder da** (`/about`-CTA, Header-Link, `/create`-Link). Danach zurückgesetzt und per `diff` als **byte-identisch** bestätigt. Die zentrale Behauptung des Features ist damit unabhängig belegt.

**Kontrast gemessen statt geschätzt:**

| Element | Dark | Light | Vorgabe |
|---------|------|-------|---------|
| Eyebrow „Bald verfügbar" | 11.60:1 | — | 4.5:1 |
| Menu-Kennzeichnung „Bald" | 8.02:1 | **5.30:1** | 4.5:1 |
| Menu-Label | 19.40:1 | 18.21:1 | 4.5:1 |

Der Light-Wert ist der interessante: Die Kennzeichnung nutzt `text-muted-foreground` und ergibt dort `rgb(94,105,110)` auf `rgb(246,248,249)` = 5.30:1. Gegengerechnet: Der naheliegende feste Hex-Wert `text-gq-grey` (#A0A7AD) hätte **2.29:1** ergeben und WCAG AA verfehlt — genau die Falle, die als BUG-1 im QA vom 2026-09-06 dokumentiert ist. Die Token-Wahl hat einen latenten Wiederholungsfehler vermieden.

**BUG-7 bleibt behoben.** Der Hero verliert einen Button, deshalb auf allen **elf** Referenz-Viewports nachgemessen (320×568 bis 1920×1080): Der primäre CTA steht überall vollständig über dem Falz. Knappster Fall unverändert 320×568 mit +27px — dieselbe Zahl wie vor diesem Feature, also nicht verschlechtert.

**Kopfzeile ohne Textlink** (Edge Case 9): auf 320/375/768/1440/1920px je 3 Elemente, `header-overflow = 0`, `doc-overflow = 0`, kein Element unter 44px. Keine Lücke, keine verrutschte Ausrichtung.

### Edge Cases

| # | Fall | Ergebnis |
|---|------|----------|
| 3 | Gecachte alte Fassung | Nach Reload erscheint die Ankündigung |
| 4 | Menu auf `/anleitung` geöffnet | `aria-current="page"` **und** Kennzeichnung zugleich — wie spezifiziert |
| 5 | Screenreader | ARIA-Snapshot: `link "Anleitung Bald"` — die Kennzeichnung wird vorgelesen |
| 6 | 320px | Tap-Ziel 231×48px, kein Umbruch, `doc-overflow = 0` |
| 7 | `/create` verliert einen Weg | Zwei Aktionen mit 12px Abstand, keine Lücke, Leertext korrekt |
| 9 | Header-Liste leer | siehe oben — kein Layout-Schaden |
| 10 | Route mit Parametern | `?utm_source=qr&x=1` rendert die Ankündigung normal |

Zusätzlich geprüft (nicht in der Spec): **Tastaturbedienung.** Tab-Reihenfolge folgt der visuellen Ordnung (Zurück → Ko-fi → Zur App → Menü → CTA → Footer), der CTA ist per Enter auslösbar und führt nach `/create`.

### Security-Audit — ohne Befund

- **Security-Header aktiv:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`
- **Keine Angriffsfläche:** Die Seite hat kein `<form>`, kein `<input>`, kein `<textarea>` — sie ist statisch
- **Keine Secrets** in den 15 geladenen Bundles (gesucht nach `sk-*`, `service_role`, `SUPABASE_SERVICE`, `api_key`-Mustern)
- **Injection:** `/anleitung/<img src=x onerror=alert(1)>` → HTTP 404, 0 Reflexionen; `?x=<script>alert(1)</script>` → HTTP 200, 0 Reflexionen
- **Externe Hosts:** nur `ko-fi.com` (und die W3C-SVG-Namespace-URL). Der Ko-fi-Link trägt `target="_blank" rel="noopener noreferrer"`
- **Kein Informationsleck durch das Feature:** Der zurückgehaltene Prompt ist über keinen ausgelieferten Pfad erreichbar (oben belegt)

### Gegenprobe — fängt die Suite echte Fehler?

Zwei absichtlich eingebaute Fehler, beide gefangen:

1. **FAQ bekommt wieder eine Zeitangabe** („In etwa einer halbe Stunde") → **2 Tests fallen**
2. **Die Seite ignoriert den Schalter** (`if (false)`) — der teuerste denkbare Fehler, die volle Anleitung ginge live, während die App sie ankündigt → **6 Tests fallen**

Beide Male anschließend sauber wiederhergestellt.

### Skips geprüft

Die 22 bzw. 23 Skips sind **keine stillgelegten Tests**, sondern: 2 vorbestehende Plattformgrenzen (kein Hover auf Touch, Clipboard in WebKit nicht setzbar), 4 bewusste PROJ-14-Gates und die Datei für den freigeschalteten Zustand. Alle nachvollzogen.

### Regression

- **Alle sieben Routen HTTP 200** mit 0,0007–0,0017 s
- **Nachbarseiten intakt:** `/impressum` und `/datenschutz` behalten ihren Eyebrow „Rechtliches" — der kritische Punkt, weil `HEADER_NAV_LINKS` aus dem geteilten Seitenrahmen kommt
- **`/anleitung` bleibt statisch** (`○` im Build) — die Ladezeit-Anforderung ist gehalten
- **Creator-Flow unbeschädigt:** „Neue Quest erstellen" öffnet den Dialog
- **JSON-LD deckungsgleich** mit der sichtbaren Seite: fünf FAQ-Fragen, „Wie erstelle ich eine Quest?" enthalten, keine Zeitangabe in der Antwort
- **WebKit strukturgleich zu Chrome:** Titel, Eyebrow, CTA, Menu-Eintrag „AnleitungBald", Tap-Ziel 231×48, 7 Dialog-Links, `/about` ohne KI-CTA

### Testsuiten

| Suite | Ergebnis |
|-------|----------|
| Chrome 152 (Production-Build) | **405 passed / 22 skipped / 0 failed** |
| Mobile Safari (WebKit) | **404 passed / 23 skipped / 0 failed** |
| Freigeschalteter Zustand (beide Engines) | **22 passed / 0 failed** |
| Unit (Vitest) | **186 passed** |

### Befunde ohne Bug-Status

**Beobachtung 1 — „Quest importieren" misst 42px statt 44px.** Aufgefallen bei der Vermessung der `/create`-Leeransicht (Edge Case 7). **Vorbestehend aus PROJ-6** (`quest-import-button.tsx`, Commit `0c1c3c9`, in dieser Session unverändert) und damit **kein PROJ-14-Bug**. Verursacht durch `py-3` statt einer festen Höhe. Betrifft die PRD-Vorgabe von 44px Tap-Zielen — ein eigenes Refinement wert, zusammen mit BUG-2 (16px-Schließen-X).

**Beobachtung 2 — 320×568 hat weiterhin nur 27px Luft unter dem CTA.** Unverändert gegenüber dem Stand vor diesem Feature (bereits in Refinement 5 von PROJ-13 vermerkt). Kein Fehler, aber die Stelle, die zuerst kippt, falls der Hero künftig wächst.

**Beobachtung 3 — lokale Konsolenfehler durch Vercel Analytics.** `/_vercel/insights/script.js` liefert lokal 404 und erzeugt zwei Konsolenmeldungen. Tritt auf **allen** Routen auf, auch auf unveränderten wie `/impressum` — Umgebungsartefakt, in Production nicht vorhanden.

### Testumgebung

Gelaufen über `playwright.prod.config.ts` (Chrome 152 via `channel: 'chrome'`, Production-Build auf Port 3100). Die reguläre `playwright.config.ts` zeigt weiterhin auf das 428-KB-Chromium-Fragment; WebKit ist vorhanden und wurde genutzt. Firefox fehlt unverändert.


## Deployment

**Deployt: 2026-09-18** — Tag `v1.29.0-PROJ-14`, Commit `18007e0`
**Production-URL:** https://geoquesty.vercel.app/anleitung

Vercel deployte automatisch von `main`, live nach ~42 Sekunden.

### In Production verifiziert

**Der Prompt ist nicht ausgeliefert.** 0 Treffer im HTML für „BITTE-ERSETZEN", „Du hilfst mir", „Aufbau der JSON-Datei", „HIER EINTRAGEN", „Prompt", „Kopieren", „So geht es", „Zwei Pflichtschritte", „Die Datei wird nicht angenommen" — und **alle 15 ausgelieferten JS-Bundles einzeln abgerufen**, kein Treffer. Die Ankündigung steht (Eyebrow, Ausblick-Kasten, CTA, ChatGPT/Claude).

**Alle sieben Routen HTTP 200** mit 0,07–0,20 s.

**Die Einstiegspunkte:** `/about` ohne „Mit KI erstellen" (0), `/create` ohne „Quest mit KI bauen" (0), **kein Header-Textlink auf allen vier Info-Seiten** (je 0).

**Das Menu im Live-Browser:** 7 Links, Eintrag „AnleitungBald", ARIA-Name `link "Anleitung Bald"`, `aria-current="page"` auf der eigenen Seite, Tap-Ziel 231×48, **Badge-Kontrast 8.02:1**. Ein echter Klick führt auf die Ankündigung.

**Die FAQ:** „Wie lange dauert" (0), „halbe Stunde" (0), „Wie erstelle ich eine Quest?" sichtbar. Das `FAQPage`-JSON-LD trägt alle fünf Fragen mit der neuen Antwort und **ohne Zeitangabe** — deckungsgleich mit der sichtbaren Seite.

**BUG-7 bleibt behoben:** acht Viewports von 320×568 bis 1920×1080 nachgemessen, der primäre CTA steht überall vollständig über dem Falz. Die Werte decken sich **exakt** mit den lokalen Messungen (320×568: +27px, 1366×768: +208px, 1440×900: +340px).

**Nachbarseiten unbeschädigt** — wichtig, weil `HEADER_NAV_LINKS` aus dem geteilten Seitenrahmen kommt: `/impressum` und `/datenschutz` behalten Eyebrow „Rechtliches" und ihre H1.

**WebKit strukturgleich:** Eyebrow „Bald verfügbar", keine Prompt-Reste im Text.

**Security-Header aktiv:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS gibt es nur in Production). Der Ko-fi-Link trägt `rel="noopener noreferrer"`.

**0 fehlgeschlagene Requests, 0 Konsolenfehler** bei frischem Erstbesuch ohne Cache — die lokalen Vercel-Analytics-404 sind in Production wie erwartet verschwunden.

### Eine Fehlspur, damit sie niemand erneut verfolgt

Ein erster Messdurchlauf meldete **einen** Konsolenfehler (404) auf `/anleitung`, den die unveränderte `/impressum` nicht hatte — das sah nach einem Deploy-Schaden aus. Nachgestellt mit frischem Kontext ohne Cache: **0 Antworten ≥400 auf beiden Seiten.** Der Fehler stammte aus dem vorherigen Navigationsschritt desselben Skripts (dem Menu-Klick), nicht aus dem Laden der Seite. Kein Produktfehler.

Ebenso irreführend: `grep -c` meldete „Wie erstelle ich eine Quest?" in Production nur **1×** statt lokal 2×. Ursache ist das Zählen von *Zeilen* — das Production-HTML ist minifiziert. Tatsächlich sechs Vorkommen (sichtbare Seite + JSON-LD).

### Mit ausgeliefert

Auf Entscheidung des Betreibers sind zwei Werkzeugdateien mit eingecheckt:

- **`playwright.prod.config.ts`** — läuft auf dem vorhandenen Chrome 152 (`channel: 'chrome'`) gegen den Production-Build und umgeht damit das projektlange 428-KB-Chromium-Fragment
- **`scripts/test-anleitung-freigeschaltet.mjs`** (`npm run test:e2e:freigeschaltet`) — der einzige Weg, die zurückgehaltene Anleitung am Leben zu halten. Legt den Schalter um, baut, testet, stellt zurück — auch bei Fehlschlag oder Abbruch (`finally` + SIGINT/SIGTERM). Bricht ab, wenn der Schalter nicht auf `false` steht, statt etwas zu überschreiben.

### Zum Freischalten

`ANLEITUNG_VERFUEGBAR = true` in `src/lib/app-nav.ts`, committen, pushen. Seite, Menu-Kennzeichnung, Header-Link und beide CTAs kommen gleichzeitig zurück. Vorher `npm run test:e2e:freigeschaltet` laufen lassen — 22 Tests prüfen genau diesen Zustand.


## Refinement 2026-10-23: Prompt-Formular und Freischaltung

**Anlass:** Der Betreiber hat einen neuen Prompt geschrieben. Er arbeitet im Dialog (Story-Vorschlag → Abnahme → lesbare Fassung → Änderungen → erst auf Zustimmung JSON), erzeugt pro Station genau ein Text- und ein Aufgaben-Modul und keine Medien. Die Angaben im Block „Meine Angaben" sollen auf `/anleitung` als Felder ausgefüllt werden können; ein Button erzeugt daraus den Prompt zum Kopieren. Mit diesem Refinement wird die Anleitung freigeschaltet.

**Am Code geprüft:** Die Zusage im Prompt „Groß- und Kleinschreibung spielt keine Rolle" stimmt — `code-task.tsx:20` vergleicht mit `trim().toLowerCase()`. Der feste Radius von 20 m liegt im erlaubten Bereich 10–100.

### Die fünf Felder

| Feld | Beschriftung | Graue Vorlage | Prompt-Zeile, wenn ausgefüllt | Prompt-Zeile, wenn leer |
|---|---|---|---|---|
| Thema | Thema | z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum | `- Thema: <Wert>` | `- Thema: [z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum]` |
| Alter | Alter der Kinder | z. B. 8–10 Jahre | `- Alter der Kinder: <Wert>` | `- Alter der Kinder: [z. B. 8–10 Jahre]` |
| Anzahl | Anzahl der Stationen (höchstens 20) | z. B. 8 | `- Anzahl der Stationen (höchstens 20): <Wert>` | `- Anzahl der Stationen (höchstens 20): [z. B. 8]` |
| Spielort | Spielort | z. B. Park | `- Spielort: <Wert>` | `- Spielort: [z. B. Park]` _(an die übrigen Zeilen angeglichen, 2026-10-24)_ |
| Wünsche | Besondere Wünsche (optional) | z. B. nicht zu gruselig | `- Besondere Wünsche (optional): <Wert>` | `- Besondere Wünsche (optional): [z. B. nicht zu gruselig]` |

### Die Vorlage (wörtlich, wie vom Betreiber geliefert)

Der Block „Meine Angaben" zeigt den Zustand „alle Felder leer". Einzige Abweichung von der gelieferten Fassung: die Spielort-Zeile, angeglichen am 2026-10-24. Alles andere wird Zeichen für Zeichen übernommen. `\n` in Format B ist ein Backslash gefolgt von n.

````text
Du bist Autor:in von Schnitzeljagden für Kinder. Erstelle eine GPS-Schnitzeljagd mit einer durchgehenden Geschichte für die App "Geo Quest". Die App führt die Kinder von Station zu Station. Die nächste Station wird erst freigeschaltet, wenn die Aufgabe der vorherigen gelöst ist.

## Meine Angaben
- Thema: [z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum]
- Alter der Kinder: [z. B. 8–10 Jahre]
- Anzahl der Stationen (höchstens 20): [z. B. 8]
- Spielort: [z. B. Park]
- Besondere Wünsche (optional): [z. B. nicht zu gruselig]

## Rahmenbedingungen
1. Die Kinder spielen gemeinsam als ein Team.
2. An den Stationen ist nichts vorbereitet, und die Orte sind vorher unbekannt. Jede Aufgabe muss ohne Bezug zur Umgebung lösbar sein. Keine Aufgaben wie "Zählt die Bäume" oder "Lest das Schild".
3. Die Aufgaben werden in der App angezeigt, die Lösung wird dort eingegeben. Es gibt genau drei Aufgabentypen:
   - Code-Eingabe: Die Kinder tippen eine Zahl oder ein Wort ein.
   - Multiple Choice: Die Kinder wählen aus 2 bis 5 Antworten.
   - Sortieraufgabe: Die Kinder bringen 3 bis 6 Elemente in die richtige Reihenfolge.
4. Es gibt keine Hinweise oder Tipps. Jede Aufgabe muss für das angegebene Alter ohne Hilfe lösbar sein.

## Anforderungen an die Geschichte
- Die Geschichte passt zum Thema und hat einen Anfang, eine Steigerung und ein Ende.
- Jede Station ist ein Kapitel. Jede gelöste Aufgabe bringt die Geschichte voran (z. B. ein gefundener Hinweis, ein geknackter Code, ein gelöster Zauberspruch).
- Die Kinder sind selbst Teil der Geschichte (z. B. als Detektivteam, Zauberlehrlinge, Expeditionsgruppe). Sprich sie in der Ihr-Form an.
- Der Ton passt zum Alter: spannend, aber nicht beängstigend. Keine Emojis.
- Die Texte pro Station sind kurz genug für ein Handy (höchstens ca. 80–120 Wörter Geschichte plus Aufgabe, für jüngere Kinder kürzer).

## Anforderungen an die Aufgaben
- Jede Aufgabe passt zum Thema und zur Szene (z. B. bei Detektiv: Zeugenaussagen vergleichen, Alibis prüfen; bei Magie: Zaubertrankzutaten in die richtige Reihenfolge bringen).
- Mische Wissensfragen und Rätsel (Logik, Zahlen, Wortspiele, Geheimschriften, die in der Aufgabe selbst erklärt werden).
- Verteile die drei Aufgabentypen abwechslungsreich über die Stationen.
- Die Schwierigkeit passt zum Alter und steigt zum Ende hin leicht an.
- Jede Aufgabe hat genau eine eindeutige Lösung.
- Code-Eingabe: Die Lösung ist eine Zahl oder ein einzelnes Wort, ohne Leerzeichen, ohne Umlaute und ohne ß (z. B. "SCHLUESSEL" statt "Schlüssel"), damit es beim Eintippen keine Fehler gibt. Groß- und Kleinschreibung spielt keine Rolle.
- Multiple Choice: 3 oder 4 Antworten, genau eine ist richtig. Die falschen Antworten sind glaubwürdig, aber eindeutig falsch.
- Sortieraufgabe: 3 bis 6 Elemente mit einer eindeutigen Reihenfolge (zeitlich, der Größe nach, logisch aus der Geschichte). Die Elemente sind alle unterschiedlich und enthalten keine Kommas. In der Frage steht, wonach sortiert wird.
- Aufgaben dürfen sich auf Informationen aus früheren Stationen beziehen, wenn diese Information dort klar im Text stand.

## Ablauf
1. Prüfe zuerst meine Angaben. Wenn etwas fehlt oder unklar ist, stelle Rückfragen, bevor du loslegst. Frage nur, was du wirklich brauchst.
2. Schlage mir eine Story-Idee vor (3–4 Sätze) und eine Übersicht, welche Station welchen Aufgabentyp bekommt. Warte auf mein OK.
3. Erstelle die komplette Schnitzeljagd in gut lesbarer Form (Format A unten). Prüfe sie vorher selbst: Ist jede Lösung eindeutig? Ist jede Aufgabe ohne Ortsbezug lösbar? Passt die Schwierigkeit zum Alter?
4. Frage mich danach, ob ich Änderungen möchte. Setze Änderungswünsche um und zeige die geänderten Stationen erneut.
5. Wenn ich zufrieden bin, frage mich: "Soll ich die Schnitzeljagd jetzt als Geo-Quest-Datei (JSON) ausgeben, damit du sie in die App importieren kannst?"
6. Erst wenn ich zustimme, gib die Quest im Format B aus.

## Format A: Lesbare Fassung

**Titel der Schnitzeljagd**

**Einleitung** (wird vor dem Start angezeigt): Ausgangslage der Geschichte und Auftrag an das Team.

Für jede Station:
---
**Station [Nummer]: [Kapitelname]**
- Geschichte: [Text, der die Szene beschreibt und zur Aufgabe führt]
- Aufgabentyp: [Code-Eingabe / Multiple Choice / Sortieraufgabe]
- Aufgabe: [Fragestellung, wie sie in der App erscheint]
- Antwortmöglichkeiten: [nur bei Multiple Choice, mit A, B, C, D]
- Elemente zum Sortieren: [nur bei Sortieraufgabe, in RICHTIGER Reihenfolge]
- Lösung: [richtige Antwort]
- Erklärung für Erwachsene: [ein Satz, warum das die Lösung ist]
---

**Abschluss** (wird nach der letzten Station angezeigt): Ende der Geschichte, passend zum Finale.

## Format B: Geo-Quest-Datei (JSON)

Gib NUR das JSON in einem einzigen Codeblock aus, ohne Text davor oder danach. Übernimm die Inhalte aus Format A unverändert.

Regeln:
- "version": immer die Zahl 1
- "id": eine echte UUID im Format 8-4-4-4-12 (Hexadezimalzeichen, z. B. "3f2504e0-4f89-41d3-9a0c-0305e82c3301"). Quest und jede Station bekommen eine eigene, unterschiedliche UUID. Keine Zählnummern wie "station-1".
- "name": Titel der Schnitzeljagd
- "description": ein Satz zur Schnitzeljagd
- "lastModified": heutiges Datum im Format "2026-01-15T10:00:00.000Z"
- "estimatedDuration": z. B. "ca. 60 Min"
- "difficulty": genau "easy", "medium" oder "hard" (passend zum Alter)
- "intro": {"text": "Einleitung"}
- "outro": {"text": "Abschluss"}
- "stations": eine Station pro Kapitel, in der Reihenfolge der Geschichte
- Jede Station: "id" (UUID), "name" (Kapitelname), "lat": 0, "lng": 0, "radiusMeters": 20, "modules" (Liste)
- Erfinde KEINE Koordinaten. Die Stationen werden danach in der App auf der Karte platziert.
- Jede Station hat genau zwei Module: zuerst ein Text-Modul mit der Geschichte, dann ein Aufgaben-Modul.
- Zeilenumbrüche im Text als \n schreiben. Anführungszeichen im Text vermeiden oder als „…“ schreiben.
- Die "Erklärung für Erwachsene" kommt NICHT ins JSON.

Text-Modul:
{"type": "text", "content": "Geschichte der Station"}

Code-Eingabe:
{"type": "task", "taskType": "code", "question": "Frage", "answer": "LOESUNG"}

Multiple Choice ("correctIndices" zählt ab 0, also ist [0] die erste Antwort):
{"type": "task", "taskType": "multiple-choice", "question": "Frage", "options": ["Antwort A", "Antwort B", "Antwort C"], "correctIndices": [1]}

Sortieraufgabe ("items" in der RICHTIGEN Reihenfolge, die App mischt sie selbst):
{"type": "task", "taskType": "sorting", "question": "Bringt ... in die richtige Reihenfolge.", "items": ["Erstes", "Zweites", "Drittes"]}

Beispiel für den Aufbau (gekürzt auf eine Station):
{
  "version": 1,
  "id": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "name": "Der Fall der verschwundenen Krone",
  "description": "Ein Detektivabenteuer für junge Ermittler.",
  "lastModified": "2026-01-15T10:00:00.000Z",
  "estimatedDuration": "ca. 60 Min",
  "difficulty": "easy",
  "intro": {"text": "Die Krone des Königs ist verschwunden. Ihr seid das beste Detektivteam im Land."},
  "outro": {"text": "Fall gelöst! Die Krone ist zurück im Schloss."},
  "stations": [
    {
      "id": "8b1f4c2a-9d3e-4a7b-8c5d-1e2f3a4b5c6d",
      "name": "Der erste Zeuge",
      "lat": 0,
      "lng": 0,
      "radiusMeters": 20,
      "modules": [
        {"type": "text", "content": "Der Gärtner hat in der Nacht etwas gesehen."},
        {"type": "task", "taskType": "multiple-choice", "question": "Wer war zuletzt im Thronsaal?", "options": ["Der Koch", "Die Zofe", "Der Gärtner"], "correctIndices": [1]}
      ]
    }
  ]
}

Prüfe vor der JSON-Ausgabe:
- Sind alle UUIDs gültig und alle unterschiedlich?
- Hat jede Station "lat": 0, "lng": 0 und "radiusMeters": 20?
- Zeigt "correctIndices" auf die richtige Antwort?
- Stehen die Sortier-Elemente in der richtigen Reihenfolge?
- Ist das JSON gültig (keine fehlenden Kommas, keine Kommas nach dem letzten Element)?
````

### Seitenaufbau nach dem Refinement

1. **Kopf**: Eyebrow „Anleitung", Titel unverändert, Meta „4 Schritte", Lead zum neuen Ablauf, Infokasten „Was dabei herauskommt" mit dem Satz „Eins machst du danach selbst: Ziele auf die Karte setzen."
2. **So geht es**: vier Schritte (siehe Acceptance Criteria)
3. **Schritt 1: Deine Angaben**: fünf Felder, Button „Prompt erzeugen", danach die Prompt-Box mit „Kopieren"
4. **Danach**: Pflicht „Ziele auf die Karte setzen"; Tipp „Bilder, Ton oder Video ergänzen"
5. **Woher Medien nehmen**: knapp, nach dem Stand von PROJ-15
6. **Hilfe**: überarbeitet (siehe Acceptance Criteria)
7. **Abschluss-CTA** „Prompt kopiert?" → `/create` (unverändert)

### Für `/frontend` vorab benannt
- Der Schalter wird umgelegt, der Ankündigungs-Code bleibt als Weg zurück.
- Die graue Vorlage ist kein Label; jedes Feld braucht eine sichtbare Beschriftung darüber.
- Die Spielort-Zeile lautet „Spielort: [z. B. Park]" (geklärt 2026-10-24), nicht „z.B. Park" wie in der ersten Lieferung.
- `/about` am Handy: Nach der Freischaltung den BUG-7-Wächter laufen lassen. Der sekundäre Button darf unter dem Falz liegen, der primäre nicht.

## Implementation Notes (Frontend, Refinement 2026-10-24)

**Gebaut:** Neue Komponente `src/components/prompt-generator.tsx` mit fünf Feldern (shadcn `Input`, `Textarea`, `Label`, `Button`) und der vorhandenen `PromptCopyBox` als Ergebnis-Box. Der Prompt wird in `src/lib/quest-ai-prompt.ts` als reine Funktion `buildQuestAiPrompt(werte)` gebaut; die alte Fassung ist ersetzt. `PROMPT_ANGABEN` ist die eine Quelle für Beschriftung, graue Vorlage und die Prompt-Zeile bei leerem Feld. `/anleitung` an den neuen Ablauf angepasst (Lead, „4 Schritte", neue Schritte, „Nach dem Import" mit Pflicht + Tipp, Medienquellen nach PROJ-15, Hilfe), Schalter `ANLEITUNG_VERFUEGBAR = true`. Kein neues Paket, `/anleitung` bleibt statisch (`○`).

**Am Bildschirm entschieden (Open Questions geschlossen):** Wünsche mehrzeilig (3 Zeilen), Zeilenumbrüche werden im Prompt zu Leerzeichen. Höchstlängen wie vorgeschlagen (80/40/2/80/300). Die `maxlength` von 2 bei „Anzahl" fängt Eingaben wie „8 Stationen" schon beim Tippen ab.

**Abweichungen:**
- Der Hinweis „Angaben geändert" ist **Teal**, nicht Lime: Lime stand am Bildschirm zusammen mit dem Lime-Kicker „Danach — nicht vergessen" im Bild (Design System: ein Lime-Element pro Screen). Der Fehlerhinweis an „Anzahl" bleibt Lime; er erscheint nur, solange keine Box und damit nichts weiter unten im Bild steht.
- Kurzer Hinweis unter den Feldern: „Felder, die du leer lässt, fragt die KI im Chat bei dir nach." Er erklärt die Regel aus der Spec, damit niemand ein leeres Feld für einen Fehler hält.
- `PromptCopyBox`: Beschriftung „Dein Prompt" statt „Prompt-Vorlage", der Satz „Die markierten Stellen füllst du in deinem KI-Tool aus" ist entfallen.

**Gemessen:** WebKit 390×844 und 320×568, Chrome 1440×900: 0 px Überlauf, Felder 48 px hoch mit 16 px Schrift (kein iOS-Zoom), Buttons 48 px, Kopieren-Knopf nach dem Erzeugen im Bild. Graue Vorlage **7,54:1**. Auf `/about` 320×568 endet der primäre CTA bei 561/568 (unverändert 7 px Luft), „Mit KI erstellen" liegt 53 px darunter (Edge Case 20). Auf 390 px wird die Vorlage im Thema-Feld abgeschnitten („…Pirat") — hingenommen, weil Feld und Prompt denselben Text teilen.

**Tests:**
- Unit: `quest-ai-prompt.test.ts` neu (31 Tests), darunter der Vergleich der leeren Vorlage **Zeichen für Zeichen mit dem Spec-Abschnitt** und das wörtliche `\n`. Unit gesamt **455/455**.
- E2E: neue Suite `proj-14-prompt-formular.spec.ts` (29 je Engine). Neuer Helfer `tests/helpers/anleitung-schalter.ts` liest den Schalter aus dem Quelltext; Freigeschaltet- und Ankündigungs-Tests hängen daran statt an `ANLEITUNG_FREIGESCHALTET=1`. Die Ankündigungs-Suite überspringt sich jetzt selbst und lässt sich mit `npm run test:e2e:angekuendigt` prüfen (Skript umgedreht und umbenannt, vorher `test:e2e:freigeschaltet`).
- Gezogen, nicht gelöscht: 4 Tests in der Freigeschaltet-Datei, 7 in `proj-13-landing-page`, je 1–2 in `proj-13-landing-qa`, `-landing-refinement`, `-info-refinement`, `proj-12-pwa-installation`; alle zustandsabhängigen prüfen jetzt den Zustand des Schalters. Durch die Freischaltung wurden zwei weitere falsch: `proj-12-safe-area` nahm das erste Kopfzeilen-Element, jetzt den auf dem Handy ausgeblendeten Link „Anleitung" (→ erstes **sichtbares**), und `proj-13-about-eltern` zählte Tabs ab „Quest erstellen", davor steht jetzt „Mit KI erstellen".
- **Gegenprobe** (alte Seite und alter Prompt, Schalter `true`): neue Formular-Suite **0 von 57** bestanden; Freigeschaltet-Datei 8 rot (die gezogenen), 16 grün (Einstiegspunkte, die nur am Schalter hängen); `proj-13-landing-page` 19 rot (die gezogenen), 22 grün. Danach Produktcode byte-identisch zurückgespielt.
- **Gesamtlauf beider Engines:** 1518 erwartet / 9 unerwartet — 6 davon die oben gezogenen Tests in `proj-13-landing-page`, 3 die Safe-Area- und Tab-Tests; nach dem Ziehen isoliert **164/164**. Die 6 „failed" der `test.fail`-Wächter (BUG-15, BUG-17, BUG-18) sind erwartet. Lint 0 Fehler, `tsc` nur die 2 bekannten Fehler aus PROJ-6.

**Für künftige Läufe:** Ein Lauf, bei dem alle sichtbaren Prozesse bei 0 % CPU stehen, ist nicht zwingend ein Hänger — die Arbeit läuft in den Worker-Kindprozessen (`pgrep -P <pid>`).

**Nicht abgedeckt:** das Gespräch mit einer echten KI (ob ChatGPT/Claude/Gemini den Ablauf einhalten und importierbare Dateien liefern), echtes iPhone, Firefox.

**Nachtrag 2026-10-24 — Hero-Absatz:** Auf Betreiber-Wunsch neu: „Du hast eine Idee, die du mit Hilfe eines KI-Tools wie duck.ai, ChatGPT, Gemini oder Claude in eine spielbare Geschichte verwandelst und in die App importierst. Dann wählst du aus, wo gespielt wird, verteilst die Quest an die Spieler:innen und los geht's!" Drei Tippfehler der Vorlage dabei korrigiert („KI Tool" → „KI-Tool", Komma vor „wo", „du Quest" → „die Quest"). Damit nennt der Absatz das Setzen der Orte nicht mehr ausdrücklich; der Infokasten daneben und der Pflichtschritt „Ziele auf die Karte setzen" tragen es weiter.

**Nachtrag 2026-10-24 — Infokasten:** Auf Betreiber-Wunsch heißt der Kasten „Was du mit der KI erstellst" mit den Punkten „Die Story mit Einstieg und Abschluss", „Ein Kapitel pro Station der Route", „Jedes Kapitel enthält ein Rätsel oder eine Aufgabe", „Eine Import-Datei im richtigen Format für die App" und dem Schlusssatz „Im Creator bestimmst du die Route und setzt Station für Station einen Marker auf der Karte." Die vier Punkte sind eine gemeinsame Liste mit der Ankündigungsseite; deren Test ist mitgezogen. Freigeschaltet-, Formular- und PROJ-13-Suite 122/122.

**Nachtrag 2026-10-24 — Begriffe angeglichen:** Punkt 3 heißt „Ein Rätsel oder eine Aufgabe pro Kapitel" (gleich gebaut wie die anderen, auf dem Handy einzeilig), Punkt 4 „Eine Datei zum Importieren in die App" (Betreiber). Der Pflichtschritt heißt „Stationen auf die Karte setzen" statt „Ziele …", sein Text spricht von Stationen und vom Marker — wie der Creator und der Infokasten. Die ausgeschaltete Ankündigungsseite sagt weiterhin „Ziele"; sie wird nicht ausgeliefert und bleibt unangetastet. Suiten 122/122.

**Nachtrag 2026-10-24 — Hinweis ins Formular:** Der Hinweis „Angaben geändert. Der Prompt unten zeigt noch den alten Stand." steht jetzt im Formular direkt über dem Button, und der Button selbst heißt dann „Prompt neu erzeugen" (mit Pfeil-Symbol); der eigene Knopf an der Box ist entfallen. Gemessen auf 390×844: Hinweis und Button liegen untereinander; zwischen Hinweis und Kopieren-Knopf liegen 121 px (Edge Case 17 entsprechend angepasst). Zwei Tests gezogen, einer neu (Hinweis über dem Button, nur ein Erzeugen-Knopf). Formular-Suite beider Engines: 57 bestanden, 1 übersprungen (Zwischenablage auf WebKit).

---

## QA Test Results (Refinement 2026-10-24: Prompt-Formular und Freischaltung)

**Tested:** 2026-10-24
**App URL:** Production-Build im eigenen Git-Worktree (Port 3200; der Dev-Server des Betreibers lief parallel und wurde nicht angefasst)
**Tester:** QA Engineer (AI)

### Ergebnis
**29/29 Acceptance Criteria erfüllt, 4 Low-Bugs (BUG-25 bis BUG-28), keine Critical/High/Medium — Production-Ready.**

### Acceptance Criteria
- **Prompt-Formular (15):** alle erfüllt. Einschränkung beim Kriterium „Erzeugen wird angesagt": Das erste Erzeugen und das erste Neuerzeugen werden angesagt, ein zweites Neuerzeugen in Folge nicht (BUG-26).
- **Der neue Prompt (3):** alle erfüllt. Die leere Vorlage ist per Unit-Test Zeichen für Zeichen gleich dem Spec-Abschnitt, `\n` steht wörtlich, das Beispiel-JSON besteht Schema und Import-Pipeline.
- **Anleitung angepasst (5):** alle erfüllt, einschließlich der späteren Betreiber-Texte (Hero-Absatz, Infokasten, „Stationen auf die Karte setzen").
- **Freischaltung (6):** alle erfüllt. Menü ohne „Bald" mit `aria-current="page"` auf `/anleitung`; `/about` mit „Mit KI erstellen" → `/anleitung`; `/create` (leer) mit „Quest mit KI bauen"; Kopfzeile auf 320/375/768/1440 px ohne Überlauf und Überlappung, Tap-Ziele 44 px, Textlink ab 640 px; `/anleitung` statisch, Titel „Quest mit KI erstellen" ohne „bald".

### Über die Frontend-Phase hinaus geprüft
- **Der Weg zurück:** `npm run test:e2e:angekuendigt` lief zum ersten Mal (das Skript wurde in der Frontend-Phase umgedreht, aber nie ausgeführt). Mit Schalter `false`: **54/54**; danach Schalter wieder `true`, Arbeitsstand unverändert.
- **Kopfzeile nach der Freischaltung:** Die Überlauf-Tests für 375/768/1440 px lagen in der Ankündigungs-Suite, die sich seit der Freischaltung überspringt — das Kriterium war also ungetestet. Neu abgedeckt in `proj-14-qa.spec.ts`.
- **320×568 auf `/about`:** primärer CTA bleibt über dem Falz, „Mit KI erstellen" darunter (Edge Case 20 bestätigt).
- **Tastatur:** fünf Felder, dann „Prompt erzeugen" (Chrome; WebKit/macOS überspringt Buttons per Tab, bekannt).
- **Bewegung reduzieren:** Box kommt ohne Animation ins Bild. **Doppelklick:** genau eine Box. **Einfügen von 500 Zeichen** ins Wunsch-Feld: auf 300 gekürzt.
- **Ausgeliefertes HTML:** enthält das Formular, aber nicht den Prompt — der entsteht erst beim Klick.

### Security
- Markup in Feldern wird als Text gerendert (0 injizierte Elemente, keine Ausführung, kein Dialog) — bereits Teil der Formular-Suite, beide Engines bestanden.
- Die Eingabe verlässt den Browser nicht: keine fremde Origin, kein Request mit dem eingegebenen Text, kein `localStorage`-Schreibzugriff.
- Keine Angriffsfläche durch die Freischaltung: statische Seite, kein Backend, keine neuen externen Hosts.

### Bugs

#### BUG-25: Hinweis „Angaben geändert" wird Screenreadern nicht angesagt — **behoben 2026-10-24**
- **Severity:** Low (Barrierefreiheit)
- **Schritte:** Feld ausfüllen → „Prompt erzeugen" → Feld ändern. Erwartet: Ansage, dass der Prompt veraltet ist. Tatsächlich: Hinweis steht in keiner Live-Region; nur die Button-Beschriftung ändert sich still.
- **Priorität:** Nice to have. Wächter: `proj-14-qa.spec.ts`, `test.fail`.

#### BUG-26: Wiederholtes Neuerzeugen wird nicht erneut angesagt — **behoben 2026-10-24**
- **Severity:** Low (Barrierefreiheit)
- **Schritte:** „Prompt erzeugen" dreimal hintereinander. Erwartet: jedes Mal eine Ansage. Tatsächlich: ab dem zweiten Mal derselbe Statustext „Prompt neu erzeugt." — Screenreader lesen einen unveränderten Text in der Regel nicht erneut.
- **Priorität:** Nice to have. Wächter vorhanden.

#### BUG-27: Kopier-Zustand bleibt nach dem Neuerzeugen stehen — **behoben 2026-10-24**
- **Severity:** Low
- **Schritte:** Prompt erzeugen, Kopieren schlägt fehl (blockierte Zwischenablage) → Feld ändern → neu erzeugen. Erwartet: Zustand zurückgesetzt. Tatsächlich: „Kopieren hat nicht geklappt" bleibt stehen. Kurz (≤ 2,5 s) nach erfolgreichem Kopieren zeigt der neu erzeugte, nicht kopierte Prompt sogar „Kopiert" — der irreführendere Fall.
- **Priorität:** Nice to have. Wächter vorhanden.

#### BUG-28: Lime-Fehlerhinweis steht mit anderem Lime im Bild — **behoben 2026-10-24**
- **Severity:** Low (Design System)
- **Schritte:** 1440×900 (ebenso 390×844), bei „Anzahl" 99 eintragen → „Prompt erzeugen". Erwartet: ein Lime-Element pro Screen. Tatsächlich: „Bitte eine Zahl von 1 bis 20" und der Lime-Abschnitt „Danach — nicht vergessen" sind gleichzeitig sichtbar — ohne Box folgt der Abschnitt direkt unter dem Formular. **Die Frontend-Notiz („nichts weiter unten im Bild") war damit falsch.**
- **Priorität:** Nice to have. Wächter vorhanden.

### Testsuiten
- **Unit:** 455/455.
- **E2E gesamt, beide Engines:** 1526 wie erwartet, 1 unerwartet, 71 übersprungen. Der eine: `proj-12-sw-nur-production` (Mobile Safari), seriell 3× 6/6 — die dokumentierte Service-Worker-Wackelei, keine Regression.
- **Neu:** `tests/proj-14-qa.spec.ts`, 13 Tests je Engine (25 bestanden, 1 übersprungen).
- **Weg zurück:** `npm run test:e2e:angekuendigt` 54/54.

### Nicht abgedeckt
Das Gespräch mit einer echten KI (Ablauf eingehalten, Datei importierbar?) — die wichtigste offene Frage des Features, nur am echten Tool zu beantworten. Dazu echtes iPhone und Firefox (Binary fehlt). Eine eigene WebKit-Sonde der Kopfzeile hing am kalten Bild-Optimierer (dokumentiertes lokales Artefakt); dieselbe Prüfung lief über die Playwright-Suite auf WebKit grün.

### Summary
- **Acceptance Criteria:** 29/29
- **Bugs:** 4 (0 Critical, 0 High, 0 Medium, 4 Low)
- **Security:** ohne Befund
- **Production Ready:** YES


## Nachtrag 2026-10-24: Ankündigung entfernt, BUG-26 bis BUG-28 behoben

**Ankündigung entfernt (Betreiber):** Schalter `ANLEITUNG_VERFUEGBAR`, die Funktion `AnleitungAngekuendigt` samt Metadaten, die „Bald"-Kennzeichnung (`badge`) in `app-nav.ts`/`app-nav-menu.tsx`, die Bedingungen an `/about` (Hero-CTA), `/create` (Leeransicht) und `HEADER_NAV_LINKS`. In den Tests: `proj-14-anleitung-coming-soon.spec.ts`, `scripts/test-anleitung-angekuendigt.mjs`, das npm-Skript `test:e2e:angekuendigt` und `tests/helpers/anleitung-schalter.ts` gelöscht; wo Tests nach dem Schalter verzweigten, bleibt der freigeschaltete Zweig als feste Prüfung. Folge: Übersprungene Tests im Gesamtlauf von 71 auf 18 — die vorher am Schalter hängenden laufen jetzt immer. Die Acceptance Criteria der Ankündigungsphase (Blöcke „Die Ankündigungsseite" bis „Bewahrung des fertigen Inhalts") sind damit historisch; gültig sind die Blöcke vom 2026-10-23.

**Behoben:**
- **BUG-26:** Der Ansagetext wechselt bei jedem Erzeugen um ein unsichtbares Leerzeichen, damit Screenreader ihn jedes Mal vorlesen.
- **BUG-27:** Die Kopier-Box wird bei jedem Erzeugen neu aufgebaut (`key`), „Kopiert" und „Kopieren hat nicht geklappt" gehören nie zu einem neuen Prompt.
- **BUG-28:** Fehlerhinweis und Feldrand bei „Anzahl" in Fehler-Rot (`destructive`, wie im Creator) statt Lime.

**BUG-25 ebenfalls behoben (2026-10-24, nachbeauftragt):** Der Hinweis steht in einer Live-Region (`aria-live="polite"`), die dauerhaft im Formular steht — nur ihr Inhalt wechselt, weil ein erst beim Erscheinen erzeugtes Live-Element von vielen Screenreadern nicht angesagt wird. Ein zweiter Test hält fest, dass die Region vorher leer im DOM steht. Gegenprobe gegen die Komponente davor: beide BUG-25-Tests fallen auf beiden Engines (4); mit Behebung PROJ-14-Suiten 2× 110 bestanden / 2 übersprungen (bekannte Engine-Ausnahmen). **Damit sind alle Bugs aus der QA behoben.**

**Geprüft:** Typprüfung, Lint (0 Fehler), Build (`/anleitung` statisch, kein „Bald verfügbar" im HTML), Unit 455/455. Gesamtlauf beider Engines **1553 erwartet / 1 unerwartet** (Service-Worker-Wackelei, seriell 3× 6/6). **Gegenprobe** mit der Komponente vor der Behebung: die Tests zu BUG-26, BUG-27 (beide) und BUG-28 fallen auf beiden Engines (8). Ein eigener Testfehler dabei gefunden: Der „Kopiert"-Test wartete bis zu 5 s und bestand deshalb auch ohne Behebung, weil der alte Zustand nach 2,5 s von selbst verschwand — jetzt 500 ms. QA- und Formular-Suite danach 3× 84/84.
