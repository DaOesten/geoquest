import { test, expect, type Page } from '@playwright/test';
import { ANLEITUNG_AN } from './helpers/anleitung-schalter';

/**
 * PROJ-14 — der FREIGESCHALTETE Zustand (`ANLEITUNG_VERFUEGBAR = true`).
 *
 * Bis 2026-10-23 lief diese Datei nur über ein Skript, das den Schalter
 * umlegte. Seit dem Refinement „Prompt-Formular und Freischaltung" ist das
 * der ausgelieferte Zustand und die Datei Teil des normalen Laufs. Steht der
 * Schalter wieder auf `false`, überspringt sie sich selbst; die Ankündigung
 * prüft dann `proj-14-anleitung-coming-soon.spec.ts`
 * (`npm run test:e2e:angekuendigt`).
 */

test.skip(!ANLEITUNG_AN, 'Anleitung ist nur angekündigt (Schalter aus)');

async function openMenu(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole('button', { name: 'Menü öffnen' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('Freigeschaltet — die Seite', () => {
  test('die vollständige Anleitung erscheint', async ({ page }) => {
    const res = await page.goto('/anleitung');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Quest bauen');
    await expect(page.getByText('So geht es')).toBeVisible();
  });

  // Gezogen 2026-10-23: Der Prompt entsteht jetzt aus dem Formular.
  test('das Prompt-Formular ist da, der Prompt kommt per Knopf', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByRole('button', { name: 'Prompt erzeugen' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kopieren/i })).toHaveCount(0);
    await page.getByRole('button', { name: 'Prompt erzeugen' }).click();
    await expect(page.getByRole('button', { name: /Kopieren/i })).toBeVisible();
  });

  // Gezogen 2026-10-23: neue Schritte für den Ablauf im Dialog mit der KI.
  test('die vier Schritte stehen vollständig', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByText('4 Schritte', { exact: true })).toBeVisible();
    await expect(page.getByText(/ca\. 15 Min/)).toHaveCount(0);
    for (const s of ['Angaben eintragen', 'In dein KI-Tool einfügen', 'Datei ausgeben lassen', 'In Geo Quest importieren']) {
      await expect(page.locator('main').getByText(s).first()).toBeVisible();
    }
  });

  test('das Troubleshooting ist erreichbar', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByText('Wenn etwas klemmt')).toBeVisible();
    await page.getByText('Die Datei wird nicht angenommen').click();
    await expect(page.locator('main')).toContainText('Kennnummern');
  });

  // Gezogen 2026-10-23: ein Pflichtschritt (Karte) und ein Tipp (Medien).
  test('nach dem Import: Karte ist Pflicht, Medien sind ein Tipp', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByRole('heading', { name: 'Nach dem Import' })).toBeVisible();
    await expect(page.getByText(/führt die Quest draußen ins Nichts/)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tipp: Bilder, Ton oder Video/ })).toBeVisible();
    await expect(page.getByText('Zwei Pflichtschritte')).toHaveCount(0);
  });

  test('der Infokasten nennt nur noch die Karte als eigenen Schritt', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByText('Eins machst du danach selbst: Ziele auf die Karte setzen.')).toBeVisible();
  });

  test('keine Ankündigungs-Reste', async ({ page }) => {
    await page.goto('/anleitung');
    const body = (await page.locator('body').textContent()) ?? '';
    expect(body).not.toContain('Bald verfügbar');
    expect(body).not.toContain('Nicht warten?');
  });
});

test.describe('Freigeschaltet — die Einstiegspunkte kommen zurück', () => {
  test('der Menu-Eintrag trägt keine Kennzeichnung mehr', async ({ page }) => {
    await openMenu(page, '/about');
    // Im freigeschalteten Zustand steht /anleitung auch in der Kopfzeile —
    // deshalb auf den Menu-Dialog eingrenzen, sonst zwei Treffer.
    const entry = page.getByRole('dialog').locator('a[href="/anleitung"]');
    await expect(entry).toBeVisible();
    await expect(entry).not.toContainText('Bald');
  });

  test('der sekundäre Hero-CTA auf /about ist zurück', async ({ page }) => {
    await page.goto('/about');
    const cta = page.getByRole('link', { name: /Mit KI erstellen/ });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/anleitung');
  });

  test('der KI-Link in der Leeransicht von /create ist zurück', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByRole('link', { name: /Quest mit KI bauen/ })).toBeVisible();
  });

  test('der Textlink in der Info-Kopfzeile ist zurück', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');
    await expect(page.locator('header a[href="/anleitung"]')).toBeVisible();
  });

  test('die Metadaten versprechen wieder die fertige Anleitung', async ({ page }) => {
    await page.goto('/anleitung');
    expect(await page.title()).not.toContain('bald');
  });
});
