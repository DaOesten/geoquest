import { z } from "zod";
import { questSchema, type Quest } from "./quest-schema";
import { stripHtmlTags } from "./sanitize";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function sanitizeQuest(quest: Quest): Quest {
  function sanitizeString(val: unknown): string {
    return typeof val === "string" ? stripHtmlTags(val) : "";
  }

  return {
    ...quest,
    name: sanitizeString(quest.name),
    description: quest.description ? sanitizeString(quest.description) : undefined,
    author: quest.author ? sanitizeString(quest.author) : undefined,
    intro: {
      ...quest.intro,
      text: sanitizeString(quest.intro.text),
    },
    outro: {
      ...quest.outro,
      text: sanitizeString(quest.outro.text),
    },
    stations: quest.stations.map((station) => ({
      ...station,
      name: sanitizeString(station.name),
      modules: station.modules.map((mod) => {
        if (mod.type === "text") {
          return { ...mod, content: sanitizeString(mod.content) };
        }
        if ("caption" in mod && mod.caption) {
          return { ...mod, caption: sanitizeString(mod.caption) };
        }
        if (mod.type === "task") {
          if (mod.taskType === "code") {
            return { ...mod, question: sanitizeString(mod.question), answer: sanitizeString(mod.answer) };
          }
          if (mod.taskType === "multiple-choice") {
            return { ...mod, question: sanitizeString(mod.question), options: mod.options.map(sanitizeString) };
          }
          if (mod.taskType === "sorting") {
            return { ...mod, question: sanitizeString(mod.question), items: mod.items.map(sanitizeString) };
          }
        }
        return mod;
      }),
    })),
  };
}

export type ImportError = {
  type: "file-too-large" | "invalid-json" | "unsupported-version" | "validation-error";
  message: string;
};

export type ImportResult =
  | { success: true; quest: Quest; skippedModules: number }
  | { success: false; error: ImportError };

export async function parseAndValidateQuestFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: { type: "file-too-large", message: "Die Datei ist zu groß (max. 5 MB)." },
    };
  }

  let raw: string;
  try {
    raw = await file.text();
  } catch {
    return {
      success: false,
      error: { type: "invalid-json", message: "Die Datei konnte nicht gelesen werden." },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      success: false,
      error: { type: "invalid-json", message: "Die Datei ist kein gültiges JSON-Format." },
    };
  }

  if (typeof parsed !== "object" || parsed === null || !("version" in parsed)) {
    return {
      success: false,
      error: { type: "validation-error", message: "Die Datei enthält keine gültige Quest." },
    };
  }

  const version = (parsed as Record<string, unknown>).version;
  if (typeof version === "number" && version !== 1) {
    return {
      success: false,
      error: { type: "unsupported-version", message: "Diese Quest benötigt eine neuere App-Version." },
    };
  }

  // Filter unknown module types before validation
  let skippedModules = 0;
  if (typeof parsed === "object" && parsed !== null && "stations" in parsed) {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.stations)) {
      obj.stations = obj.stations.map((station: unknown) => {
        if (typeof station === "object" && station !== null && "modules" in station) {
          const s = station as Record<string, unknown>;
          if (Array.isArray(s.modules)) {
            const knownTypes = ["text", "image", "audio", "video", "task"];
            const filtered = s.modules.filter((m: unknown) => {
              if (typeof m === "object" && m !== null && "type" in m) {
                const isKnown = knownTypes.includes((m as Record<string, unknown>).type as string);
                if (!isKnown) skippedModules++;
                return isKnown;
              }
              skippedModules++;
              return false;
            });
            return { ...s, modules: filtered };
          }
        }
        return station;
      });
    }
  }

  const result = z.safeParse(questSchema, parsed);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = formatValidationError(firstIssue);
    return {
      success: false,
      error: { type: "validation-error", message },
    };
  }

  const sanitized = sanitizeQuest(result.data);

  return { success: true, quest: sanitized, skippedModules };
}

function formatValidationError(issue: z.core.$ZodIssue): string {
  const path = issue.path;

  if (path.length >= 2 && path[0] === "stations" && typeof path[1] === "number") {
    const stationNum = (path[1] as number) + 1;
    const field = path.slice(2).join(".");

    if (field === "lat" || field === "lng" || field === "") {
      return `Station ${stationNum} hat keine gültige Position auf der Karte.`;
    }
    if (field === "name") {
      return `Station ${stationNum} hat keinen Namen.`;
    }
    if (field.startsWith("modules")) {
      return `Station ${stationNum} hat ein ungültiges Modul.`;
    }
    return `Station ${stationNum}: ${issue.message}`;
  }

  if (path.length >= 1 && path[0] === "name") {
    return "Die Quest hat keinen Namen.";
  }
  if (path.length >= 1 && path[0] === "stations") {
    return issue.message || "Die Stationen der Quest sind ungültig.";
  }
  if (path.length >= 1 && path[0] === "intro") {
    return "Das Intro der Quest ist ungültig.";
  }
  if (path.length >= 1 && path[0] === "outro") {
    return "Das Outro der Quest ist ungültig.";
  }

  return issue.message || "Die Quest-Datei enthält ungültige Daten.";
}
