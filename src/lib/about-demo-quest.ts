import type { Quest } from "@/lib/quest-schema";

/**
 * Die Quest der Simulation auf /about (PROJ-13, Refinement 13).
 *
 * EINE Datenquelle im echten Quest-Format: Wer den Inhalt austauschen will,
 * ändert nur diese Datei. `about-demo-quest.test.ts` prüft sie gegen
 * `questSchema` — ein Tippfehler bricht die Simulation sonst still.
 *
 * Dieselbe Quest wie in den Hero-Screens (`scripts/make-about-screenshot.mjs`),
 * damit beide Handys zusammenpassen: Namen und Koordinaten dort mitziehen.
 *
 * Als Funktion statt Konstante, weil das Schema für Bilder eine
 * `https://`-Adresse verlangt. Die Simulation übergibt die eigene Origin —
 * das Foto lädt so immer von der Domain, auf der die Seite läuft, nie von
 * einem fremden Host.
 */
export function buildDemoQuest(origin: string): Quest {
  return {
    version: 1,
    id: "d1a0b0c0-0000-4000-8000-000000000001",
    name: "Das Waldgeheimnis",
    lastModified: "2026-10-16T00:00:00.000Z",
    intro: {
      text: "Findet die drei Geheimnisse des Waldes! Folgt dem Pfeil von Station zu Station und löst an jeder ein Rätsel.",
    },
    outro: {
      text: "Ihr habt alle drei Geheimnisse des Waldes gelüftet. Stark gemacht!",
    },
    stations: [
      {
        id: "d1a0b0c0-0000-4000-8000-000000000011",
        name: "Die alte Eiche",
        lat: 53.5509,
        lng: 9.9906,
        radiusMeters: 20,
        modules: [
          {
            type: "text",
            content:
              "Diese Eiche ist älter als eure Urgroßeltern. In ihrer Krone wohnt nachts ein lautloser Jäger.",
          },
          {
            type: "task",
            taskType: "multiple-choice",
            question: "Welches Tier kann seinen Kopf fast ganz nach hinten drehen?",
            options: ["Eichhörnchen", "Eule", "Igel"],
            correctIndices: [1],
          },
        ],
      },
      {
        id: "d1a0b0c0-0000-4000-8000-000000000012",
        name: "Am Ententeich",
        lat: 53.552,
        lng: 9.992,
        radiusMeters: 20,
        modules: [
          {
            type: "image",
            url: `${origin}/assets/demo-ententeich.jpg`,
            caption: "Foto: Jack1956, Wikimedia Commons, CC0",
          },
          {
            type: "task",
            taskType: "code",
            question: "Zähle die Beine einer Spinne. Wie viele sind es?",
            answer: "8",
          },
        ],
      },
      {
        id: "d1a0b0c0-0000-4000-8000-000000000013",
        name: "Der Fuchsbau",
        lat: 53.553,
        lng: 9.993,
        radiusMeters: 20,
        modules: [
          {
            type: "text",
            content:
              "Hier unter den Wurzeln hat ein Fuchs seinen Bau. Im Teich nebenan wächst gerade die nächste Froschgeneration heran.",
          },
          {
            type: "task",
            taskType: "sorting",
            question: "Bring die Entwicklung des Frosches in die richtige Reihenfolge.",
            items: ["Laich", "Kaulquappe", "Kaulquappe mit Beinen", "Frosch"],
          },
        ],
      },
    ],
  };
}
