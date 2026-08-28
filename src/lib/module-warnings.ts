import type { DraftModule } from "./quest-storage";

/**
 * Informational-only completeness check for a module draft (PROJ-8's "Entwurfsprinzip" —
 * an incomplete module still saves; this only drives the warning badge in the module list).
 * Returns null when the module has everything the Player (PROJ-4) needs to render/play it.
 */
export function getModuleWarning(module: DraftModule): string | null {
  switch (module.type) {
    case "text":
      return module.content.trim() === "" ? "Kein Inhalt" : null;
    case "image":
    case "audio":
    case "video":
      return module.url.trim().startsWith("https://") ? null : "Keine URL";
    case "task":
      switch (module.taskType) {
        case "code":
          if (module.question.trim() === "") return "Keine Frage";
          if (module.answer.trim() === "") return "Keine Antwort";
          return null;
        case "multiple-choice": {
          if (module.question.trim() === "") return "Keine Frage";
          const filledOptions = module.options.filter((o) => o.trim() !== "");
          if (filledOptions.length < 2) return "Zu wenige Optionen";
          if (module.correctIndices.length === 0) return "Keine Antwort markiert";
          return null;
        }
        case "sorting": {
          if (module.question.trim() === "") return "Keine Frage";
          const filledItems = module.items.filter((i) => i.trim() !== "");
          if (filledItems.length < 3) return "Zu wenige Items";
          return null;
        }
      }
  }
}
