import { test, expect, type Page } from '@playwright/test';

/**
 * PROJ-14 — der FREIGESCHALTETE Zustand (`ANLEITUNG_VERFUEGBAR = true`).
 *
 * Warum es diese Datei gibt: Die fertige Anleitung bleibt im Code liegen,
 * wird aber nicht ausgeliefert — und damit von keinem normalen Test berührt.
 * Ohne ausdrückliche Prüfung könnte sie während der Ankündigungsphase still
 * verrotten; auffallen würde das erst beim Freischalten, im denkbar
 * schlechtesten Moment (Betreiber-Entscheidung 2026-09-17).
 *
 * Diese Tests laufen NICHT im normalen Lauf. Sie brauchen einen Build mit
 * umgelegtem Schalter:
 *
 *   npm run test:e2e:freigeschaltet
 *
 * Das Skript legt den Schalter um, baut, testet und stellt ihn zurück.
 * Ohne die Umgebungsvariable überspringt sich die Datei selbst — sonst
 * meldete der reguläre Lauf lauter Fehlschläge für einen Zustand, der gar
 * nicht ausgeliefert wird.
 */

test.skip(
  process.env.ANLEITUNG_FREIGESCHALTET !== '1',
  'Nur im Lauf mit umgelegtem Schalter (npm run test:e2e:freigeschaltet)'
);

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

  test('die Prompt-Vorlage ist da und kopierbar', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByRole('button', { name: /Kopieren/i }).first()).toBeVisible();
    const body = (await page.locator('body').textContent()) ?? '';
    expect(body).toContain('BITTE-ERSETZEN');
  });

  test('die vier Schritte stehen vollständig', async ({ page }) => {
    await page.goto('/anleitung');
    for (const s of ['Prompt kopieren', 'In dein KI-Tool einfügen', 'Antwort als Datei speichern', 'In Geo Quest importieren']) {
      await expect(page.locator('main').getByText(s).first()).toBeVisible();
    }
  });

  test('das Troubleshooting ist erreichbar', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByText('Wenn etwas klemmt')).toBeVisible();
    await page.getByText('Die Datei wird nicht angenommen').click();
    await expect(page.locator('main')).toContainText('Kennnummern');
  });

  test('die beiden Pflichtschritte nach dem Import stehen da', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.getByText('Zwei Pflichtschritte')).toBeVisible();
    await expect(page.locator('main')).toContainText('Ziele auf die Karte setzen');
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
