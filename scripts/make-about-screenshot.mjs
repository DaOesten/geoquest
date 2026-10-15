#!/usr/bin/env node
/**
 * Erzeugt den App-Screenshot fuer den Hero von /about (PROJ-13, Refinement 12).
 *
 * Bewusst ein echter Zustand der App statt eines Mockups: Die Landingpage
 * zeigt Eltern und Lehrkraeften, was die Kinder in der Hand haben werden.
 * Ein nachgebautes Bild liefe bei jeder Design-Aenderung still auseinander;
 * dieses Skript erzeugt es neu.
 *
 * Voraussetzung: Ein Production-Build laeuft (`npm run build && npx next start -p 3100`).
 *
 *   node scripts/make-about-screenshot.mjs [baseURL]
 *
 * WebKit mit iPhone-Profil, weil das der Zielgeraet entspricht und dort kein
 * `requestPermission`-Knopf erscheint (Desktop-Chrome mit iPhone-UA wuerde
 * „Kompass aktivieren" zeigen). Die Quest ist erfunden, die Koordinaten
 * liegen auf keinem privaten Grundstueck.
 */
import { webkit, devices } from "@playwright/test";

const BASE_URL = process.argv[2] ?? "http://localhost:3100";
const OUT = "public/assets/about-hero-navigation.png";

const QUEST = {
  version: 1,
  id: "d1a0b0c0-0000-4000-8000-000000000001",
  name: "Das Waldgeheimnis",
  lastModified: "2026-10-15T00:00:00.000Z",
  intro: { text: "Findet die drei Geheimnisse des Waldes!" },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "d1a0b0c0-0000-4000-8000-000000000011",
      name: "Die alte Eiche",
      lat: 53.5509,
      lng: 9.9906,
      radiusMeters: 20,
      modules: [{ type: "text", content: "Station 1" }],
    },
    {
      id: "d1a0b0c0-0000-4000-8000-000000000012",
      name: "Am Ententeich",
      lat: 53.552,
      lng: 9.992,
      radiusMeters: 20,
      modules: [{ type: "text", content: "Station 2" }],
    },
    {
      id: "d1a0b0c0-0000-4000-8000-000000000013",
      name: "Der Fuchsbau",
      lat: 53.553,
      lng: 9.993,
      radiusMeters: 20,
      modules: [{ type: "text", content: "Station 3" }],
    },
  ],
};

// Rund 110 m suedwestlich der ersten Station — weit genug, dass keine Ankunft
// ausgeloest wird, nah genug fuer eine glaubwuerdige Entfernung.
const PLAYER = { latitude: 53.55, longitude: 9.99, accuracy: 5 };

const browser = await webkit.launch();
const context = await browser.newContext({
  ...devices["iPhone 13"],
  geolocation: PLAYER,
  permissions: ["geolocation"],
  serviceWorkers: "block",
});
const page = await context.newPage();

await page.goto(`${BASE_URL}/play`);
await page.evaluate((quest) => {
  localStorage.setItem("gq_quests", JSON.stringify([quest]));
  localStorage.removeItem(`gq_progress_${quest.id}`);
  // Erststart-Dialog und Installations-Hinweis wuerden das Bild verdecken.
  localStorage.setItem("gq_first_visit_done", "true");
  localStorage.setItem("gq_install_hint_dismissed", String(Date.now()));
}, QUEST);
await page.goto(`${BASE_URL}/play/${QUEST.id}`);
await page.getByRole("button", { name: /Los geht/ }).click();
await page.getByRole("button", { name: /Die alte Eiche/ }).click();

// Kompass-Heading nach Norden, mehrfach, damit die Glaettung den Zielwert
// erreicht. Der Pfeil zeigt dann leicht nach rechts zur Station.
for (let i = 0; i < 80; i++) {
  await page.evaluate(() => {
    const e = new Event("deviceorientation");
    Object.defineProperty(e, "webkitCompassHeading", { value: 0 });
    Object.defineProperty(e, "absolute", { value: true });
    window.dispatchEvent(e);
  });
}
await page.getByText(/\d+\s*m$/).first().waitFor();
// Einblend-Animationen und Pfeil-Transition auslaufen lassen.
await page.waitForTimeout(1500);

await page.screenshot({ path: OUT });
await browser.close();
console.log(`geschrieben: ${OUT}`);
