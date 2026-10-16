import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { buildDemoQuest } from "./about-demo-quest";
import { questSchema } from "./quest-schema";

/**
 * Wächter über die Simulations-Quest auf /about (PROJ-13, Refinement 13).
 *
 * Der Betreiber tauscht den Inhalt später aus. Ohne diesen Test würde ein
 * Tippfehler (fehlende Antwort, zu wenige Sortier-Elemente) die Simulation
 * still brechen — sie validiert zur Laufzeit nicht.
 */
describe("buildDemoQuest", () => {
  const quest = buildDemoQuest("https://geoquest.technolomagie.de");

  it("besteht die Validierung von questSchema", () => {
    const result = questSchema.safeParse(quest);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it("hat drei Stationen mit je einem anderen Aufgabentyp", () => {
    expect(quest.stations).toHaveLength(3);
    const types = quest.stations.map(
      (s) => s.modules.find((m) => m.type === "task")?.taskType
    );
    expect(new Set(types)).toEqual(new Set(["multiple-choice", "code", "sorting"]));
  });

  it("zeigt an genau einer Station ein Foto, die anderen tragen Text", () => {
    const media = quest.stations.map((s) => s.modules[0].type);
    expect(media.filter((m) => m === "image")).toHaveLength(1);
    expect(media.filter((m) => m === "text")).toHaveLength(2);
  });

  it("lädt das Foto von der übergebenen Origin, nie von einem fremden Host", () => {
    const local = buildDemoQuest("http://localhost:3100");
    const image = local.stations
      .flatMap((s) => s.modules)
      .find((m) => m.type === "image") as { url: string; caption?: string };
    expect(image.url).toBe("http://localhost:3100/assets/demo-ententeich.jpg");
    // CC0 verlangt keine Namensnennung — die App empfiehlt sie Erstellern trotzdem.
    expect(image.caption).toMatch(/Jack1956.*Wikimedia Commons.*CC0/);
  });

  it("die Bilddatei liegt im Repo", () => {
    expect(existsSync(resolve(__dirname, "../../public/assets/demo-ententeich.jpg"))).toBe(true);
  });
});
