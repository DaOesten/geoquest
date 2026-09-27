/**
 * PROJ-12 Refinement 5 (2026-09-27) — der fetch-Handler von `public/sw.js`.
 *
 * WARUM ALS UNIT-TEST UND NICHT PER E2E: Playwright kann den fetch() DES
 * WORKERS nicht scheitern lassen, waehrend `navigator.onLine` true bleibt.
 * Gemessen: `page.route(...).abort()` greift nicht fuer Requests, die der
 * Worker stellt — die Navigation kam mit HTTP 200 und der echten Seite zurueck.
 * Ein erster E2E-Versuch bestand deshalb AUCH GEGEN DIE FEHLERHAFTE FASSUNG:
 * Er pruefte eine erfolgreich geladene Seite und belegte nichts. `setOffline()`
 * trifft nur den Fall, der schon immer richtig war (onLine=false).
 *
 * Hier wird stattdessen das ECHTE `public/sw.js` in einem nachgebauten
 * Worker-Scope ausgefuehrt — keine Kopie der Logik, kein Regex auf den
 * Quelltext. Damit ist genau die Kombination pruefbar, die der Betreiber auf
 * dem iPhone hatte: Netz vorhanden, einzelner Request scheitert.
 */
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Führt das echte public/sw.js in einem nachgebauten Worker-Scope aus. */
function ladeWorker(opts: { onLine: boolean; fetchWirft?: boolean; cacheHat?: boolean }) {
  const src = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf-8");
  const listeners: Record<string, ((e: unknown) => void)[]> = {};
  const cacheMatch = vi.fn(async () => (opts.cacheHat === false ? undefined : new Response("OFFLINE")));
  const scope = {
    self: {
      addEventListener: (t: string, fn: (e: unknown) => void) => { (listeners[t] ||= []).push(fn); },
      skipWaiting: vi.fn(), clients: { claim: vi.fn() },
    },
    caches: { open: vi.fn(async () => ({ add: vi.fn(), match: cacheMatch, keys: vi.fn(async () => []) })), keys: vi.fn(async () => []), delete: vi.fn() },
    navigator: { onLine: opts.onLine },
    fetch: vi.fn(async () => { if (opts.fetchWirft) throw new TypeError("Failed to fetch"); return new Response("ECHTE SEITE"); }),
    Request: globalThis.Request, Response: globalThis.Response,
  };
  // eslint-disable-next-line no-new-func
  new Function("self", "caches", "navigator", "fetch", "Request", "Response", src)(
    scope.self, scope.caches, scope.navigator, scope.fetch, scope.Request, scope.Response);
  return { listeners, cacheMatch, scope };
}

async function navigiere(w: ReturnType<typeof ladeWorker>) {
  let zusage: Promise<Response> | undefined;
  const event = { request: { mode: "navigate", url: "http://x/" }, respondWith: (p: Promise<Response>) => { zusage = p; } };
  w.listeners["fetch"][0](event);
  return zusage;
}

describe("sw.js fetch-Handler", () => {
  it("gibt bei onLine=true den Fehler weiter statt der Offline-Seite", async () => {
    const w = ladeWorker({ onLine: true, fetchWirft: true });
    await expect(navigiere(w)).rejects.toThrow(/Failed to fetch/);
    expect(w.cacheMatch).not.toHaveBeenCalled();
  });

  it("liefert bei onLine=false die Offline-Seite", async () => {
    const w = ladeWorker({ onLine: false, fetchWirft: true });
    const r = await navigiere(w);
    expect(await r!.text()).toBe("OFFLINE");
  });

  it("gibt bei onLine=false mit leerem Cache den Fehler weiter (keine leere Seite)", async () => {
    const w = ladeWorker({ onLine: false, fetchWirft: true, cacheHat: false });
    await expect(navigiere(w)).rejects.toThrow(/Failed to fetch/);
  });

  it("liefert im Normalfall die Antwort aus dem Netz", async () => {
    const w = ladeWorker({ onLine: true });
    const r = await navigiere(w);
    expect(await r!.text()).toBe("ECHTE SEITE");
  });
});
