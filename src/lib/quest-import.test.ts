import { describe, it, expect } from "vitest";
import { parseAndValidateQuestFile } from "./quest-import";

function createFile(content: string, name = "test.json", size?: number): File {
  const blob = new Blob([content], { type: "application/json" });
  const file = new File([blob], name, { type: "application/json" });
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size });
  }
  return file;
}

const validQuest = {
  version: 1,
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Test Quest",
  lastModified: "2026-08-23T12:00:00.000Z",
  intro: { text: "Willkommen!" },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "223e4567-e89b-12d3-a456-426614174001",
      name: "Station 1",
      lat: 52.52,
      lng: 13.405,
      radiusMeters: 10,
      modules: [{ type: "text", content: "Hier ist Station 1" }],
    },
  ],
};

describe("parseAndValidateQuestFile", () => {
  it("accepts a valid quest file", async () => {
    const file = createFile(JSON.stringify(validQuest));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.quest.name).toBe("Test Quest");
      expect(result.skippedModules).toBe(0);
    }
  });

  it("marks an imported quest as published (preserves import-and-play-immediately)", async () => {
    const file = createFile(JSON.stringify(validQuest));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.quest.published).toBe(true);
    }
  });

  it("rejects files larger than 5 MB", async () => {
    const file = createFile("{}", "big.json", 6 * 1024 * 1024);
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("file-too-large");
    }
  });

  it("rejects invalid JSON", async () => {
    const file = createFile("not json at all {{{");
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("invalid-json");
    }
  });

  it("rejects unsupported version", async () => {
    const file = createFile(JSON.stringify({ ...validQuest, version: 99 }));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("unsupported-version");
      expect(result.error.message).toContain("neuere App-Version");
    }
  });

  it("rejects quest without name", async () => {
    const noName = { ...validQuest, name: "" };
    const file = createFile(JSON.stringify(noName));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("keinen Namen");
    }
  });

  it("rejects quest with too many stations", async () => {
    const tooMany = {
      ...validQuest,
      stations: Array.from({ length: 21 }, (_, i) => ({
        id: `${i}23e4567-e89b-12d3-a456-42661417400${i}`.slice(0, 36).replace(/[^0-9a-f-]/g, "0"),
        name: `Station ${i + 1}`,
        lat: 52.52,
        lng: 13.405,
        radiusMeters: 10,
        modules: [{ type: "text", content: "text" }],
      })),
    };
    const file = createFile(JSON.stringify(tooMany));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
  });

  it("strips HTML tags from text fields", async () => {
    const withHtml = {
      ...validQuest,
      name: "Test <script>alert('xss')</script>Quest",
      stations: [
        {
          ...validQuest.stations[0],
          modules: [{ type: "text", content: "Hello <b>world</b>" }],
        },
      ],
    };
    const file = createFile(JSON.stringify(withHtml));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.quest.name).toBe("Test alert('xss')Quest");
      expect(result.quest.stations[0].modules[0]).toHaveProperty("content", "Hello world");
    }
  });

  it("skips unknown module types", async () => {
    const withUnknown = {
      ...validQuest,
      stations: [
        {
          ...validQuest.stations[0],
          modules: [
            { type: "text", content: "Valid" },
            { type: "quiz", question: "Unknown type" },
          ],
        },
      ],
    };
    const file = createFile(JSON.stringify(withUnknown));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.skippedModules).toBe(1);
      expect(result.quest.stations[0].modules).toHaveLength(1);
    }
  });

  it("rejects station without GPS coordinates", async () => {
    const noGps = {
      ...validQuest,
      stations: [
        {
          id: "223e4567-e89b-12d3-a456-426614174001",
          name: "No GPS",
          radiusMeters: 10,
          modules: [{ type: "text", content: "text" }],
        },
      ],
    };
    const file = createFile(JSON.stringify(noGps));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Station 1");
    }
  });

  it("rejects non-https URLs in media modules", async () => {
    const httpUrl = {
      ...validQuest,
      stations: [
        {
          ...validQuest.stations[0],
          modules: [{ type: "image", url: "http://example.com/img.jpg" }],
        },
      ],
    };
    const file = createFile(JSON.stringify(httpUrl));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
  });

  it("rejects javascript: URLs in media modules", async () => {
    const jsUrl = {
      ...validQuest,
      stations: [
        {
          ...validQuest.stations[0],
          modules: [{ type: "image", url: "javascript:alert('xss')" }],
        },
      ],
    };
    const file = createFile(JSON.stringify(jsUrl));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
  });

  it("handles empty file gracefully", async () => {
    const file = createFile("");
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("invalid-json");
    }
  });

  it("sanitizes HTML in task questions and options", async () => {
    const withHtmlTask = {
      ...validQuest,
      stations: [
        {
          ...validQuest.stations[0],
          modules: [{
            type: "task",
            taskType: "multiple-choice",
            question: "<img src=x onerror=alert(1)>Was ist richtig?",
            options: ["<script>steal()</script>Option A", "Option B"],
            correctIndex: 0,
          }],
        },
      ],
    };
    const file = createFile(JSON.stringify(withHtmlTask));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(true);
    if (result.success) {
      const task = result.quest.stations[0].modules[0];
      if (task.type === "task" && task.taskType === "multiple-choice") {
        expect(task.question).toBe("Was ist richtig?");
        expect(task.options[0]).toBe("steal()Option A");
      }
    }
  });

  it("sanitizes HTML in intro/outro text", async () => {
    const withHtmlIntro = {
      ...validQuest,
      intro: { text: "<div onmouseover='alert(1)'>Willkommen</div>" },
    };
    const file = createFile(JSON.stringify(withHtmlIntro));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.quest.intro.text).toBe("Willkommen");
    }
  });

  it("rejects quest without stations array", async () => {
    const noStations = { ...validQuest, stations: [] };
    const file = createFile(JSON.stringify(noStations));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
  });

  it("accepts quest with all optional fields missing", async () => {
    const minimal = {
      version: 1,
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Minimal",
      lastModified: "2026-08-23T12:00:00.000Z",
      intro: { text: "Hi" },
      outro: { text: "Bye" },
      stations: [{
        id: "223e4567-e89b-12d3-a456-426614174001",
        name: "S1",
        lat: 0,
        lng: 0,
        radiusMeters: 10,
        modules: [{ type: "text", content: "x" }],
      }],
    };
    const file = createFile(JSON.stringify(minimal));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(true);
  });

  it("rejects quest with invalid UUID format", async () => {
    const badId = { ...validQuest, id: "not-a-uuid" };
    const file = createFile(JSON.stringify(badId));
    const result = await parseAndValidateQuestFile(file);
    expect(result.success).toBe(false);
  });
});
