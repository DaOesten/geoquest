import { describe, it, expect } from "vitest";
import { getModuleWarning } from "./module-warnings";

describe("getModuleWarning", () => {
  it("warns on an empty text module", () => {
    expect(getModuleWarning({ type: "text", content: "" })).toBe("Kein Inhalt");
    expect(getModuleWarning({ type: "text", content: "   " })).toBe("Kein Inhalt");
  });

  it("is silent for a text module with content", () => {
    expect(getModuleWarning({ type: "text", content: "Hallo" })).toBeNull();
  });

  it("warns on a media module without a valid https url", () => {
    expect(getModuleWarning({ type: "image", url: "" })).toBe("Keine URL");
    expect(getModuleWarning({ type: "audio", url: "http://unsicher.de/a.mp3" })).toBe("Keine URL");
  });

  it("is silent for a media module with a valid https url", () => {
    expect(getModuleWarning({ type: "video", url: "https://example.com/v.mp4" })).toBeNull();
  });

  it("warns on a code task missing question or answer", () => {
    expect(getModuleWarning({ type: "task", taskType: "code", question: "", answer: "42" })).toBe("Keine Frage");
    expect(getModuleWarning({ type: "task", taskType: "code", question: "Frage?", answer: "" })).toBe("Keine Antwort");
  });

  it("is silent for a complete code task", () => {
    expect(getModuleWarning({ type: "task", taskType: "code", question: "Frage?", answer: "42" })).toBeNull();
  });

  it("warns on multiple-choice with too few filled options", () => {
    expect(
      getModuleWarning({ type: "task", taskType: "multiple-choice", question: "Q", options: ["A", ""], correctIndices: [0] })
    ).toBe("Zu wenige Optionen");
  });

  it("warns on multiple-choice with no correct answer marked", () => {
    expect(
      getModuleWarning({ type: "task", taskType: "multiple-choice", question: "Q", options: ["A", "B"], correctIndices: [] })
    ).toBe("Keine Antwort markiert");
  });

  it("is silent for a complete multiple-choice task", () => {
    expect(
      getModuleWarning({ type: "task", taskType: "multiple-choice", question: "Q", options: ["A", "B"], correctIndices: [1] })
    ).toBeNull();
  });

  it("warns on sorting with too few filled items", () => {
    expect(getModuleWarning({ type: "task", taskType: "sorting", question: "Q", items: ["A", "B", ""] })).toBe(
      "Zu wenige Items"
    );
  });

  it("is silent for a complete sorting task", () => {
    expect(getModuleWarning({ type: "task", taskType: "sorting", question: "Q", items: ["A", "B", "C"] })).toBeNull();
  });
});
