import type { Quest } from "./quest-schema";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "quest"
  );
}

function buildFileName(quest: Quest): string {
  const shortId = quest.id.split("-")[0];
  return `${shortId}-${slugify(quest.name)}.json`;
}

/**
 * Downloads the quest exactly as currently stored, including incomplete
 * drafts — export is a backup mechanism (PROJ-9) and must never block on
 * questSchema validity. `published`/`lastExported` are local device state
 * and are stripped so the file matches the shareable, re-importable format.
 */
export function exportQuest(quest: Quest): void {
  const { published: _published, lastExported: _lastExported, ...shareable } = quest;
  const blob = new Blob([JSON.stringify(shareable, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildFileName(quest);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
