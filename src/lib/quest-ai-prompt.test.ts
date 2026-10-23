import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { questSchema } from "./quest-schema";
import { parseAndValidateQuestFile } from "./quest-import";
import {
  EXAMPLE_QUEST_JSON,
  PROMPT_ANGABEN,
  QUEST_AI_PROMPT,
  buildQuestAiPrompt,
  normalizeAngabe,
  validateAnzahl,
} from "./quest-ai-prompt";

/**
 * Guard tests for the AI prompt (PROJ-13, rebuilt in PROJ-14 Refinement
 * 2026-10-23).
 *
 * Two things can silently go wrong: the schema changes and the example in the
 * prompt no longer imports, or the prompt text drifts from the operator's
 * approved template. Both fail here instead of in a user's AI conversation.
 */

/** The approved template, copied verbatim into the spec (all fields empty). */
function templateFromSpec(): string {
  const spec = readFileSync(
    join(process.cwd(), "features/PROJ-14-anleitung-coming-soon.md"),
    "utf8"
  );
  const section = spec.slice(spec.indexOf("### Die Vorlage (wörtlich"));
  const match = section.match(/````text\n([\s\S]*?)\n````/);
  if (!match) throw new Error("Vorlage im Spec-Abschnitt nicht gefunden");
  return match[1];
}

const EMPTY_LINES = [
  "- Thema: [z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum]",
  "- Alter der Kinder: [z. B. 8–10 Jahre]",
  "- Anzahl der Stationen (höchstens 20): [z. B. 8]",
  "- Spielort: [z. B. Park]",
  "- Besondere Wünsche (optional): [z. B. nicht zu gruselig]",
];

describe("example quest inside the prompt", () => {
  it("validates against the real quest schema", () => {
    const parsed = questSchema.safeParse(JSON.parse(EXAMPLE_QUEST_JSON));

    if (!parsed.success) {
      throw new Error(
        "The example quest in quest-ai-prompt.ts no longer matches questSchema. " +
          "Update the example AND the field rules in the prompt text.\n" +
          JSON.stringify(parsed.error.issues, null, 2)
      );
    }
    expect(parsed.success).toBe(true);
  });

  /**
   * Schema validity alone isn't enough: what users actually hit is the import
   * pipeline (size check, version gate, unknown-module filtering, sanitising).
   */
  it("survives the real import pipeline", async () => {
    const file = new File([EXAMPLE_QUEST_JSON], "quest.json", {
      type: "application/json",
    });

    const result = await parseAndValidateQuestFile(file);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.skippedModules).toBe(0);
      expect(result.quest.stations).toHaveLength(1);
    }
  });

  it("follows the rules the prompt states (lat/lng 0, radius 20, text then task)", () => {
    const quest = JSON.parse(EXAMPLE_QUEST_JSON);
    for (const station of quest.stations) {
      expect(station.lat).toBe(0);
      expect(station.lng).toBe(0);
      expect(station.radiusMeters).toBe(20);
      expect(station.modules.map((m: { type: string }) => m.type)).toEqual(["text", "task"]);
    }
  });

  it("is embedded in the prompt", () => {
    expect(QUEST_AI_PROMPT).toContain(EXAMPLE_QUEST_JSON);
  });
});

describe("prompt template", () => {
  it("with all fields empty equals the approved template in the spec, character for character", () => {
    expect(QUEST_AI_PROMPT).toBe(templateFromSpec());
  });

  it("contains a literal backslash-n, not a real line break, in the line-break rule", () => {
    expect(QUEST_AI_PROMPT).toContain("Zeilenumbrüche im Text als \\n schreiben.");
  });

  it("keeps step 1 of the flow (AI asks only for what is missing)", () => {
    expect(QUEST_AI_PROMPT).toContain(
      "1. Prüfe zuerst meine Angaben. Wenn etwas fehlt oder unklar ist, stelle Rückfragen"
    );
  });

  it("form placeholders and empty prompt lines come from the same definition", () => {
    for (const { label, beispiel } of PROMPT_ANGABEN) {
      expect(QUEST_AI_PROMPT).toContain(`- ${label}: [${beispiel}]`);
    }
  });
});

describe("buildQuestAiPrompt", () => {
  it("all empty → exactly the template", () => {
    expect(buildQuestAiPrompt({})).toBe(QUEST_AI_PROMPT);
    for (const line of EMPTY_LINES) expect(buildQuestAiPrompt({})).toContain(line);
  });

  it("all filled → every line carries the value, no example left", () => {
    const prompt = buildQuestAiPrompt({
      thema: "Piraten",
      alter: "10–12 Jahre",
      anzahl: "6",
      spielort: "Schulhof",
      wuensche: "mit Seemannsknoten",
    });
    expect(prompt).toContain(
      [
        "## Meine Angaben",
        "- Thema: Piraten",
        "- Alter der Kinder: 10–12 Jahre",
        "- Anzahl der Stationen (höchstens 20): 6",
        "- Spielort: Schulhof",
        "- Besondere Wünsche (optional): mit Seemannsknoten",
        "",
        "## Rahmenbedingungen",
      ].join("\n")
    );
    for (const line of EMPTY_LINES) expect(prompt).not.toContain(line);
  });

  it("partly filled → each line decided on its own", () => {
    const prompt = buildQuestAiPrompt({ thema: "Weltraum", spielort: "Wald" });
    expect(prompt).toContain("- Thema: Weltraum");
    expect(prompt).toContain("- Alter der Kinder: [z. B. 8–10 Jahre]");
    expect(prompt).toContain("- Anzahl der Stationen (höchstens 20): [z. B. 8]");
    expect(prompt).toContain("- Spielort: Wald");
    expect(prompt).toContain("- Besondere Wünsche (optional): [z. B. nicht zu gruselig]");
  });

  it("only changes the „Meine Angaben“ block", () => {
    const filled = buildQuestAiPrompt({ thema: "Magie", anzahl: "3" });
    const cut = (s: string) => s.replace(/## Meine Angaben\n[\s\S]*?\n\n/, "");
    expect(cut(filled)).toBe(cut(QUEST_AI_PROMPT));
  });

  it("whitespace-only counts as empty", () => {
    expect(buildQuestAiPrompt({ thema: "   ", wuensche: "\n\t " })).toBe(QUEST_AI_PROMPT);
  });

  it("trims values and turns line breaks into spaces", () => {
    const prompt = buildQuestAiPrompt({ wuensche: "  nicht gruselig\nmit Tieren  " });
    expect(prompt).toContain("- Besondere Wünsche (optional): nicht gruselig mit Tieren\n");
  });

  it("passes special characters through as plain text", () => {
    const prompt = buildQuestAiPrompt({ thema: '<script>alert(1)</script> "Piraten" \\ ${x}' });
    expect(prompt).toContain('- Thema: <script>alert(1)</script> "Piraten" \\ ${x}');
  });
});

describe("normalizeAngabe", () => {
  it("handles undefined", () => {
    expect(normalizeAngabe(undefined)).toBe("");
  });
});

describe("validateAnzahl", () => {
  it.each(["", "  ", undefined, "1", "8", "20", " 12 "])("accepts %j", (v) => {
    expect(validateAnzahl(v)).toBeNull();
  });

  it.each(["0", "21", "25", "acht", "8 Stationen", "-3", "2.5", "1e1"])("rejects %j", (v) => {
    expect(validateAnzahl(v)).toBe("Bitte eine Zahl von 1 bis 20");
  });
});
