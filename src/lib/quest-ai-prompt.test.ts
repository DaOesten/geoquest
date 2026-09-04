import { describe, it, expect } from "vitest";
import { questSchema } from "./quest-schema";
import { parseAndValidateQuestFile } from "./quest-import";
import { EXAMPLE_QUEST_JSON, QUEST_AI_PROMPT } from "./quest-ai-prompt";

/**
 * Guard tests for the AI prompt template (PROJ-13).
 *
 * The prompt describes the quest format to an external AI tool. If the schema
 * changes and the prompt doesn't, users get import errors and nobody notices —
 * these tests fail instead. On failure, update src/lib/quest-ai-prompt.ts.
 */
describe("quest AI prompt template", () => {
  it("embedded example still validates against the real quest schema", () => {
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

  it("example covers every module type the prompt documents", () => {
    const quest = JSON.parse(EXAMPLE_QUEST_JSON);
    const types = quest.stations.flatMap((s: { modules: { type: string }[] }) =>
      s.modules.map((m) => m.type)
    );

    expect(new Set(types)).toEqual(
      new Set(["text", "image", "audio", "video", "task"])
    );
  });

  it("example covers every task type the prompt documents", () => {
    const quest = JSON.parse(EXAMPLE_QUEST_JSON);
    const taskTypes = quest.stations
      .flatMap((s: { modules: { type: string; taskType?: string }[] }) => s.modules)
      .filter((m: { type: string }) => m.type === "task")
      .map((m: { taskType: string }) => m.taskType);

    expect(new Set(taskTypes)).toEqual(
      new Set(["code", "multiple-choice", "sorting"])
    );
  });

  it("example uses placeholder coordinates so creators must position stations themselves", () => {
    const quest = JSON.parse(EXAMPLE_QUEST_JSON);

    for (const station of quest.stations) {
      expect(station.lat).toBe(0);
      expect(station.lng).toBe(0);
    }
  });

  it("example uses recognisable placeholder media URLs, never real-looking ones", () => {
    const quest = JSON.parse(EXAMPLE_QUEST_JSON);
    const mediaUrls = quest.stations
      .flatMap((s: { modules: { url?: string }[] }) => s.modules)
      .filter((m: { url?: string }) => m.url)
      .map((m: { url: string }) => m.url);

    expect(mediaUrls.length).toBeGreaterThan(0);
    for (const url of mediaUrls) {
      expect(url).toContain("BITTE-ERSETZEN");
    }
  });

  it("prompt tells the AI about all placeholders the user must fill in", () => {
    for (const marker of ["Thema / Story", "Wo wird gespielt", "Alter der Spieler", "Anzahl Stationen"]) {
      expect(QUEST_AI_PROMPT).toContain(marker);
    }
    expect(QUEST_AI_PROMPT).toContain("[HIER EINTRAGEN");
  });

  it("prompt embeds the example that these tests validate", () => {
    expect(QUEST_AI_PROMPT).toContain(EXAMPLE_QUEST_JSON);
  });

  /**
   * Schema validity alone isn't enough: what users actually hit is the import
   * pipeline (size check, version gate, unknown-module filtering, sanitising).
   * This is the closest we get to "paste the AI output into the app".
   */
  it("example survives the real import pipeline, not just schema validation", async () => {
    const file = new File([EXAMPLE_QUEST_JSON], "quest.json", {
      type: "application/json",
    });

    const result = await parseAndValidateQuestFile(file);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.skippedModules).toBe(0);
      expect(result.quest.stations).toHaveLength(3);
    }
  });
});
