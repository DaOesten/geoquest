/**
 * Copy-paste prompt template for generating a Geo Quest with an external AI tool
 * (ChatGPT, Claude, ...). Shown verbatim on /anleitung (PROJ-13).
 *
 * IMPORTANT — keep in sync with `questSchema` in `quest-schema.ts`.
 * `quest-ai-prompt.test.ts` validates EXAMPLE_QUEST_JSON (embedded in the prompt
 * below) against the real schema, so a schema change breaks that test and points
 * here. If the test fails, update BOTH the example and the field rules in the
 * prompt text — an outdated template silently produces quests that no longer import.
 */

/**
 * Minimal but complete quest used as the worked example inside the prompt.
 * Deliberately exercises every module type and every task type so the guard
 * test covers the whole schema surface the prompt describes.
 */
export const EXAMPLE_QUEST_JSON = `{
  "version": 1,
  "id": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "name": "Das Geheimnis der alten Mühle",
  "description": "Eine Spurensuche durch den Stadtpark.",
  "author": "Team Abenteuer",
  "lastModified": "2026-01-15T10:00:00.000Z",
  "estimatedDuration": "ca. 45 Min",
  "difficulty": "medium",
  "intro": {
    "text": "In der alten Mühle wurde etwas versteckt. Folge den Spuren und finde heraus, was."
  },
  "outro": {
    "text": "Du hast das Geheimnis gelüftet. Stark gemacht!"
  },
  "stations": [
    {
      "id": "8b1f4c2a-9d3e-4a7b-8c5d-1e2f3a4b5c6d",
      "name": "Der alte Brunnen",
      "lat": 0,
      "lng": 0,
      "radiusMeters": 20,
      "modules": [
        {
          "type": "text",
          "content": "Am Brunnen beginnt die Spur. Schau dir die Inschrift genau an."
        },
        {
          "type": "image",
          "url": "https://example.com/BITTE-ERSETZEN-brunnen.jpg",
          "caption": "Der Brunnen im Stadtpark"
        },
        {
          "type": "task",
          "taskType": "code",
          "question": "Welche Jahreszahl steht auf dem Brunnenrand?",
          "answer": "1897"
        }
      ]
    },
    {
      "id": "7c2e5d3b-1a4f-4b8c-9d6e-2f3a4b5c6d7e",
      "name": "Die große Eiche",
      "lat": 0,
      "lng": 0,
      "radiusMeters": 25,
      "modules": [
        {
          "type": "audio",
          "url": "https://example.com/BITTE-ERSETZEN-hinweis.mp3",
          "caption": "Der Hinweis des Müllers"
        },
        {
          "type": "task",
          "taskType": "multiple-choice",
          "question": "Was hat der Müller im Jahr 1897 versteckt?",
          "options": ["Eine Truhe", "Ein Buch", "Einen Schlüssel"],
          "correctIndices": [2]
        }
      ]
    },
    {
      "id": "6d3f6e4c-2b5a-4c9d-8e7f-3a4b5c6d7e8f",
      "name": "Die alte Mühle",
      "lat": 0,
      "lng": 0,
      "radiusMeters": 15,
      "modules": [
        {
          "type": "video",
          "url": "https://example.com/BITTE-ERSETZEN-muehle.mp4",
          "caption": "Die Mühle von innen"
        },
        {
          "type": "task",
          "taskType": "sorting",
          "question": "Bring die Ereignisse in die richtige Reihenfolge.",
          "items": [
            "Die Mühle wird gebaut",
            "Der Müller versteckt den Schlüssel",
            "Die Mühle wird stillgelegt",
            "Das Versteck wird entdeckt"
          ]
        }
      ]
    }
  ]
}`;

export const QUEST_AI_PROMPT = `Du hilfst mir, eine Schnitzeljagd für die App "Geo Quest" zu erstellen.

Geo Quest ist eine GPS-Schnitzeljagd für Kinder und Jugendliche. Spieler laufen zu echten Orten draußen. An jedem Ort ("Station") warten Inhalte und Aufgaben, die sie lösen müssen.

## Das sollst du machen

Erstelle eine komplette Quest als JSON-Datei. Gib am Ende NUR das JSON aus — keine Erklärung davor oder danach, kein Markdown-Codeblock drumherum.

## Meine Vorgaben

- Thema / Story: [HIER EINTRAGEN — z.B. "Piratenschatz", "Detektivfall", "Zeitreise ins Mittelalter"]
- Wo wird gespielt: [HIER EINTRAGEN — z.B. "Stadtpark in Bonn", "Schulgelände", "Waldweg am See"]
- Alter der Spieler: [HIER EINTRAGEN — z.B. "10-12 Jahre"]
- Anzahl Stationen: [HIER EINTRAGEN — z.B. "5"]
- Ungefähre Dauer: [HIER EINTRAGEN — z.B. "45 Minuten"]

## Wichtige Regeln

**Koordinaten:** Setze bei jeder Station "lat": 0 und "lng": 0. Ich positioniere die Stationen danach selbst auf der Karte. Erfinde KEINE echten Koordinaten.

**Bilder, Audio, Video:** Du kennst keine echten Mediendateien. Schlage trotzdem passende Medien vor, aber setze immer eine Platzhalter-Adresse nach diesem Muster:
"https://example.com/BITTE-ERSETZEN-kurzbeschreibung.jpg" (bzw. .mp3 für Audio, .mp4 für Video)
Beschreibe im "caption"-Feld, was für ein Medium hier hingehört. Ich ersetze die Adressen später.

**Kennnummern (id):** Jede Quest und jede Station braucht eine echte UUID im Format 8-4-4-4-12 Zeichen (Hexadezimal), z.B. "3f2504e0-4f89-41d3-9a0c-0305e82c3301". Erfinde für jede Station eine eigene, unterschiedliche UUID. Verwende keine Zählnummern wie "station-1".

**Sprache:** Deutsch, Du-Form, kurz und spannend. Sprich die Spieler direkt an. Keine Emojis.

## Aufbau der JSON-Datei

Ganz oben (Pflichtfelder):
- "version": immer die Zahl 1
- "id": UUID der Quest
- "name": Name der Quest
- "lastModified": Datum im Format "2026-01-15T10:00:00.000Z"
- "intro": Objekt mit "text" (Einstiegstext, wird vor dem Start gezeigt)
- "outro": Objekt mit "text" (Abschlusstext nach der letzten Station)
- "stations": Liste der Stationen (mindestens 1, höchstens 20)

Optional:
- "description": kurze Beschreibung
- "author": Name des Erstellers
- "estimatedDuration": z.B. "ca. 45 Min"
- "difficulty": genau einer dieser Werte: "easy", "medium" oder "hard"

Jede Station braucht:
- "id": eigene UUID
- "name": Name des Ortes
- "lat": 0
- "lng": 0
- "radiusMeters": Zahl zwischen 10 und 100 (wie nah man rankommen muss; 15-25 ist üblich)
- "modules": Liste der Inhalte (mindestens 1, höchstens 20)

## Die Bausteine (modules)

Es gibt genau fünf Typen. Mische sie sinnvoll — jede Station sollte mindestens einen Text und eine Aufgabe haben.

1. Text:
{"type": "text", "content": "Dein Text hier."}

2. Bild:
{"type": "image", "url": "https://example.com/BITTE-ERSETZEN-name.jpg", "caption": "Was hier zu sehen sein soll"}

3. Audio:
{"type": "audio", "url": "https://example.com/BITTE-ERSETZEN-name.mp3", "caption": "Was hier zu hören sein soll"}

4. Video:
{"type": "video", "url": "https://example.com/BITTE-ERSETZEN-name.mp4", "caption": "Was hier zu sehen sein soll"}

5. Aufgabe: Es gibt drei Arten.

a) Code-Eingabe — Spieler tippt eine Antwort ein, die er vor Ort herausfindet:
{"type": "task", "taskType": "code", "question": "Welche Jahreszahl steht am Tor?", "answer": "1897"}
Die Antwort muss vor Ort ablesbar oder abzählbar sein (Jahreszahl, Anzahl Fenster, Name auf einem Schild).

b) Multiple Choice — 2 bis 5 Antwortmöglichkeiten:
{"type": "task", "taskType": "multiple-choice", "question": "Deine Frage?", "options": ["A", "B", "C"], "correctIndices": [1]}
"correctIndices" zählt ab 0. Für mehrere richtige Antworten mehrere Zahlen angeben, z.B. [0, 2].

c) Sortieren — 3 bis 6 Elemente, die in die richtige Reihenfolge gebracht werden:
{"type": "task", "taskType": "sorting", "question": "Bring die Ereignisse in die richtige Reihenfolge.", "items": ["Erstes", "Zweites", "Drittes"]}
Die Elemente in "items" stehen bereits in der RICHTIGEN Reihenfolge — die App mischt sie automatisch.

## Vollständiges Beispiel

So sieht eine fertige Quest aus:

${EXAMPLE_QUEST_JSON}

## Zum Schluss

Prüfe vor der Ausgabe:
- Sind alle UUIDs echte UUIDs und alle unterschiedlich?
- Steht bei jeder Station "lat": 0 und "lng": 0?
- Hat jede Station mindestens ein Modul?
- Fangen alle Medien-Adressen mit "https://" an?
- Liegt "radiusMeters" zwischen 10 und 100?
- Ist "difficulty" (falls gesetzt) genau "easy", "medium" oder "hard"?

Gib jetzt nur das JSON aus.`;
