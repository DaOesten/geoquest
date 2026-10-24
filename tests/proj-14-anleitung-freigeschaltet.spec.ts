import { test, expect, type Page } from '@playwright/test';

/**
 * PROJ-14 — die freigeschaltete KI-Anleitung: Seite und Einstiegspunkte.
 *
 * Der Dateiname stammt aus der Zeit mit Ankündigung und Schalter
 * (2026-09-17 bis 2026-10-24). Beides ist entfernt; die Datei prüft den
 * einzigen Zustand, den es noch gibt.
 */


async function openMenu(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole('button', { name: 'Menü öffnen' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('Freigeschaltet — die Seite', () => {
  test('die vollständige Anleitung erscheint', async ({ page }) => {
    const res = await page.goto('/mit-ki-erstellen');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Quest bauen');
    await expect(page.getByText('So geht es')).toBeVisible();
  });

  // Gezogen 2026-10-23: Der Prompt entsteht jetzt aus dem Formular.
  test('das Prompt-Formular ist da, der Prompt kommt per Knopf', async ({ page }) => {
    await page.goto('/mit-ki-erstellen');
    await expect(page.getByRole('button', { name: 'Prompt erzeugen' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kopieren/i })).toHaveCount(0);
    await page.getByRole('button', { name: 'Prompt erzeugen' }).click();
    await expect(page.getByRole('button', { name: /Kopieren/i })).toBeVisible();
  });

  // Gezogen 2026-10-23: neue Schritte für den Ablauf im Dialog mit der KI.
  test('die vier Schritte stehen vollständig', async ({ page }) => {
    await page.goto('/mit-ki-erstellen');
    await expect(page.getByText('4 Schritte', { exact: true })).toBeVisible();
    await expect(page.getByText(/ca\. 15 Min/)).toHaveCount(0);
    for (const s of ['Angaben eintragen', 'In dein KI-Tool einfügen', 'Datei ausgeben lassen', 'In Geo Quest importieren']) {
      await expect(page.locator('main').getByText(s).first()).toBeVisible();
    }
  });

  test('das Troubleshooting ist erreichbar', async ({ page }) => {
    await page.goto('/mit-ki-erstellen');
    await expect(page.getByText('Wenn etwas klemmt')).toBeVisible();
    await page.getByText('Die Datei wird nicht angenommen').click();
    await expect(page.locator('main')).toContainText('Kennnummern');
  });

  // Gezogen 2026-10-23: ein Pflichtschritt (Karte) und ein Tipp (Medien).
  test('nach dem Import: Karte ist Pflicht, Medien sind ein Tipp', async ({ page }) => {
    await page.goto('/mit-ki-erstellen');
    await expect(page.getByRole('heading', { name: 'Nach dem Import' })).toBeVisible();
    await expect(page.getByText(/führt die Quest draußen ins Nichts/)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tipp: Bilder, Ton oder Video/ })).toBeVisible();
    await expect(page.getByText('Zwei Pflichtschritte')).toHaveCount(0);
  });

  // Wortlaut des Betreibers vom 2026-10-24.
  test('der Infokasten nennt, was die KI liefert und was im Creator bleibt', async ({ page }) => {
    await page.goto('/mit-ki-erstellen');
    await expect(page.getByText('Was du mit der KI erstellst')).toBeVisible();
    const liste = page.locator('ul').filter({ hasText: 'Die Story mit Einstieg' }).first();
    for (const punkt of [
      'Die Story mit Einstieg und Abschluss',
      'Ein Kapitel pro Station der Route',
      'Ein Rätsel oder eine Aufgabe pro Kapitel',
      'Eine Datei zum Importieren in die App',
    ]) {
      await expect(liste.getByText(punkt)).toBeVisible();
    }
    await expect(
      page.getByText('Im Creator bestimmst du die Route und setzt Station für Station einen Marker auf der Karte.')
    ).toBeVisible();
  });

  test('keine Ankündigungs-Reste', async ({ page }) => {
    await page.goto('/mit-ki-erstellen');
    const body = (await page.locator('body').textContent()) ?? '';
    expect(body).not.toContain('Bald verfügbar');
    expect(body).not.toContain('Nicht warten?');
  });
});

test.describe('Freigeschaltet — die Einstiegspunkte kommen zurück', () => {
  test('der Menu-Eintrag trägt keine Kennzeichnung mehr', async ({ page }) => {
    await openMenu(page, '/');
    // Im freigeschalteten Zustand steht /mit-ki-erstellen auch in der Kopfzeile —
    // deshalb auf den Menu-Dialog eingrenzen, sonst zwei Treffer.
    const entry = page.getByRole('dialog').locator('a[href="/mit-ki-erstellen"]');
    await expect(entry).toBeVisible();
    await expect(entry).not.toContainText('Bald');
  });

  test('der sekundäre Hero-CTA auf / ist zurück', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('main').getByRole('link', { name: /Mit KI erstellen/ });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/mit-ki-erstellen');
  });

  test('der KI-Link in der Leeransicht von /create ist zurück', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByRole('link', { name: /Mit KI erstellen/ })).toBeVisible();
  });

  test('der Textlink in der Info-Kopfzeile ist zurück', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('header a[href="/mit-ki-erstellen"]')).toBeVisible();
  });

  test('die Metadaten versprechen wieder die fertige Anleitung', async ({ page }) => {
    await page.goto('/mit-ki-erstellen');
    expect(await page.title()).not.toContain('bald');
  });
});
