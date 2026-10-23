/**
 * Prompt for generating a Geo Quest with an external AI tool (ChatGPT, Claude,
 * Gemini, ...). Built on /anleitung from the five fields of „Meine Angaben"
 * (PROJ-14, Refinement 2026-10-23).
 *
 * IMPORTANT — keep in sync with `questSchema` in `quest-schema.ts`.
 * `quest-ai-prompt.test.ts` validates EXAMPLE_QUEST_JSON (embedded in the prompt
 * below) against the real schema and the real import pipeline, so a schema
 * change breaks that test and points here. An outdated template silently
 * produces quests that no longer import.
 */

/**
 * The fields of „Meine Angaben". One definition feeds the form (label, grey
 * placeholder) AND the prompt line for an empty field — so the example a user
 * sees in the field can never drift from the one the AI reads.
 */
export const PROMPT_ANGABEN = [
  {
    key: "thema",
    label: "Thema",
    beispiel: "z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum",
    maxLength: 80,
  },
  {
    key: "alter",
    label: "Alter der Kinder",
    beispiel: "z. B. 8–10 Jahre",
    maxLength: 40,
  },
  {
    key: "anzahl",
    label: "Anzahl der Stationen (höchstens 20)",
    beispiel: "z. B. 8",
    maxLength: 2,
  },
  {
    key: "spielort",
    label: "Spielort",
    beispiel: "z. B. Park",
    maxLength: 80,
  },
  {
    key: "wuensche",
    label: "Besondere Wünsche (optional)",
    beispiel: "z. B. nicht zu gruselig",
    maxLength: 300,
  },
] as const;

export type PromptAngabeKey = (typeof PROMPT_ANGABEN)[number]["key"];
export type PromptAngabenWerte = Partial<Record<PromptAngabeKey, string>>;

/** Highest station count the import accepts (`questSchema`: max 20 stations). */
export const MAX_STATIONEN = 20;

/**
 * Trims and collapses whitespace. Line breaks from the multiline wish field
 * become spaces, so every entry stays on its own line in „Meine Angaben".
 */
export function normalizeAngabe(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Empty is fine (the AI asks back); anything else must be a whole number in
 * 1..20. A prompt asking for 25 stations would end in a file the import
 * rejects — and the user would only notice after the whole AI conversation.
 */
export function validateAnzahl(value: string | undefined): string | null {
  const v = normalizeAngabe(value);
  if (v === "") return null;
  if (!/^\d+$/.test(v)) return `Bitte eine Zahl von 1 bis ${MAX_STATIONEN}`;
  const n = Number(v);
  if (n < 1 || n > MAX_STATIONEN) return `Bitte eine Zahl von 1 bis ${MAX_STATIONEN}`;
  return null;
}

function angabenBlock(werte: PromptAngabenWerte): string {
  return PROMPT_ANGABEN.map(({ key, label, beispiel }) => {
    const wert = normalizeAngabe(werte[key]);
    return `- ${label}: ${wert === "" ? `[${beispiel}]` : wert}`;
  }).join("\n");
}

/**
 * Shortened worked example inside the prompt (one station). Kept as its own
 * constant so the guard test can validate exactly what the AI is shown.
 */
export const EXAMPLE_QUEST_JSON = `{
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
}`;

/**
 * The full prompt. Outside „Meine Angaben" the text is the operator's template
 * verbatim (spec PROJ-14, section „Refinement 2026-10-23").
 *
 * Note `\\n` below: the AI must read a literal backslash-n ("write line breaks
 * as \n"). A single `\n` here would become a real line break and the
 * instruction would be meaningless.
 */
export function buildQuestAiPrompt(werte: PromptAngabenWerte = {}): string {
  return `Du bist Autor:in von Schnitzeljagden für Kinder. Erstelle eine GPS-Schnitzeljagd mit einer durchgehenden Geschichte für die App "Geo Quest". Die App führt die Kinder von Station zu Station. Die nächste Station wird erst freigeschaltet, wenn die Aufgabe der vorherigen gelöst ist.

## Meine Angaben
${angabenBlock(werte)}

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
- Zeilenumbrüche im Text als \\n schreiben. Anführungszeichen im Text vermeiden oder als „…“ schreiben.
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
${EXAMPLE_QUEST_JSON}

Prüfe vor der JSON-Ausgabe:
- Sind alle UUIDs gültig und alle unterschiedlich?
- Hat jede Station "lat": 0, "lng": 0 und "radiusMeters": 20?
- Zeigt "correctIndices" auf die richtige Antwort?
- Stehen die Sortier-Elemente in der richtigen Reihenfolge?
- Ist das JSON gültig (keine fehlenden Kommas, keine Kommas nach dem letzten Element)?`;
}

/** The template with all fields empty — what a user gets without input. */
export const QUEST_AI_PROMPT = buildQuestAiPrompt();
