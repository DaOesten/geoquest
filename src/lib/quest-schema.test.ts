import { describe, it, expect } from "vitest";
import { questSchema } from "./quest-schema";

const base = {
  version: 1,
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Test Quest",
  lastModified: "2026-08-23T12:00:00.000Z",
  intro: { text: "Willkommen!" },
  outro: { text: "Geschafft!" },
};

function questWithTask(task: Record<string, unknown>) {
  return {
    ...base,
    stations: [
      {
        id: "223e4567-e89b-12d3-a456-426614174001",
        name: "Station 1",
        lat: 52.52,
        lng: 13.405,
        radiusMeters: 10,
        modules: [
          {
            type: "task",
            taskType: "multiple-choice",
            question: "Frage?",
            options: ["A", "B", "C"],
            ...task,
          },
        ],
      },
    ],
  };
}

describe("questSchema — multiple-choice correctIndices migration", () => {
  it("migrates a legacy correctIndex to a correctIndices array", () => {
    const result = questSchema.safeParse(questWithTask({ correctIndex: 1 }));
    expect(result.success).toBe(true);
    if (result.success) {
      const mod = result.data.stations[0].modules[0];
      if (mod.type === "task" && mod.taskType === "multiple-choice") {
        expect(mod.correctIndices).toEqual([1]);
      }
    }
  });

  it("accepts a new-format correctIndices array directly", () => {
    const result = questSchema.safeParse(questWithTask({ correctIndices: [0, 2] }));
    expect(result.success).toBe(true);
    if (result.success) {
      const mod = result.data.stations[0].modules[0];
      if (mod.type === "task" && mod.taskType === "multiple-choice") {
        expect(mod.correctIndices).toEqual([0, 2]);
      }
    }
  });

  it("prefers correctIndices over correctIndex when both are present", () => {
    const result = questSchema.safeParse(
      questWithTask({ correctIndex: 0, correctIndices: [1, 2] })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      const mod = result.data.stations[0].modules[0];
      if (mod.type === "task" && mod.taskType === "multiple-choice") {
        expect(mod.correctIndices).toEqual([1, 2]);
      }
    }
  });

  it("rejects correctIndices pointing at an out-of-bounds option", () => {
    const result = questSchema.safeParse(questWithTask({ correctIndices: [5] }));
    expect(result.success).toBe(false);
  });

  it("defaults to [0] when neither correctIndex nor correctIndices is present", () => {
    const result = questSchema.safeParse(questWithTask({}));
    expect(result.success).toBe(true);
    if (result.success) {
      const mod = result.data.stations[0].modules[0];
      if (mod.type === "task" && mod.taskType === "multiple-choice") {
        expect(mod.correctIndices).toEqual([0]);
      }
    }
  });
});
