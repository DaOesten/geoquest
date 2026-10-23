import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Steht der Schalter `ANLEITUNG_VERFUEGBAR` (PROJ-14) auf `true`?
 *
 * Gelesen aus dem Quelltext statt aus einer Umgebungsvariable: Die Tests
 * prüfen den Zustand, der gebaut und ausgeliefert wird. Bis 2026-10-23 hing
 * der freigeschaltete Zustand an `ANLEITUNG_FREIGESCHALTET=1` und die
 * Ankündigungs-Tests an gar nichts — beim Umlegen wären sie still rot
 * geworden statt sich selbst zu überspringen.
 */
function leseSchalter(): boolean {
  const src = readFileSync(join(process.cwd(), "src/lib/app-nav.ts"), "utf8");
  const m = src.match(/export const ANLEITUNG_VERFUEGBAR = (true|false);/);
  if (!m) throw new Error("ANLEITUNG_VERFUEGBAR in src/lib/app-nav.ts nicht gefunden");
  return m[1] === "true";
}

export const ANLEITUNG_AN = leseSchalter();
