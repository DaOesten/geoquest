import { test, expect, type Page } from '@playwright/test';

/**
 * PROJ-14 — KI-Anleitung: "Coming soon" zum Launch.
 *
 * Ein test() pro Acceptance Criterion. Die Anleitung ist fertig gebaut, wird
 * aber nicht ausgeliefert — stattdessen kündigt die App sie an. Fünf Stellen
 * hängen an einem Schalter (`ANLEITUNG_VERFUEGBAR` in `src/lib/app-nav.ts`).
 *
 * Die Tests prüfen den ausgelieferten Zustand (Schalter = false). Den
 * freigeschalteten Zustand deckt `proj-14-anleitung-freigeschaltet.spec.ts`
 * ab — sonst könnte die fertige Anleitung während der Ankündigungsphase
 * unbemerkt verrotten und erst beim Freischalten auffallen.
 */

async function openMenu(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole('button', { name: 'Menü öffnen' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('Die Ankündigungsseite', () => {
  test('/anleitung liefert 200 und eine Seite, keine 404', async ({ page }) => {
    const res = await page.goto('/anleitung');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Quest bauen');
  });

  test('eine sichtbare Kennzeichnung weist auf "Bald verfügbar" hin', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.locator('main').getByText('Bald verfügbar').first()).toBeVisible();
  });

  test('die Seite erklärt, was die KI-Anleitung können wird', async ({ page }) => {
    await page.goto('/anleitung');
    const lead = page.locator('main');
    await expect(lead).toContainText('ChatGPT');
    await expect(lead).toContainText('Claude');
    await expect(lead).toContainText(/Story/);
  });

  test('die vier Ausblick-Punkte stehen in der Zukunft', async ({ page }) => {
    await page.goto('/anleitung');
    const box = page.locator('main aside, main >> text=Was dabei herauskommen wird').first();
    await expect(page.getByText('Was dabei herauskommen wird')).toBeVisible();
    // Auf den Ausblick-Kasten eingegrenzt: "Rätsel und Aufgaben" steht auch
    // im Abschluss-CTA, eine seitenweite Suche wäre mehrdeutig.
    const liste = page.locator('ul').filter({ hasText: 'Story mit Einstieg' }).first();
    for (const punkt of ['Story mit Einstieg', 'Ziele mit Namen', 'Rätsel und Aufgaben', 'Fertige Datei']) {
      await expect(liste.getByText(new RegExp(punkt))).toBeVisible();
    }
    void box;
  });

  test('weder Prompt-Vorlage noch Kopieren-Button sind zu finden', async ({ page }) => {
    await page.goto('/anleitung');
    const body = (await page.locator('body').textContent()) ?? '';
    expect(body).not.toContain('BITTE-ERSETZEN');
    expect(body).not.toContain('Prompt');
    await expect(page.getByRole('button', { name: /Kopieren/i })).toHaveCount(0);
  });

  test('keine Schritt-für-Schritt-Anleitung, kein Troubleshooting', async ({ page }) => {
    await page.goto('/anleitung');
    const body = (await page.locator('body').textContent()) ?? '';
    for (const t of ['So geht es', 'Die Datei wird nicht angenommen', 'Zwei Pflichtschritte', 'Wenn etwas klemmt']) {
      expect(body).not.toContain(t);
    }
  });

  test('keine Datums- oder Zeitraumangabe zur Verfügbarkeit', async ({ page }) => {
    await page.goto('/anleitung');
    const body = (await page.locator('body').textContent()) ?? '';
    // Monate, Jahreszeiten, Quartale, Jahreszahlen — nichts davon darf ein
    // Verfügbarkeitsversprechen tragen.
    expect(body).not.toMatch(/\b(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b/);
    expect(body).not.toMatch(/\b(Frühjahr|Frühling|Sommer|Herbst|Winter)\b/);
    // Jahreszahlen nur im Hauptinhalt prüfen: Die Fußzeile trägt das
    // Copyright-Jahr, das ist kein Verfügbarkeitsversprechen.
    const main = (await page.locator('main').textContent()) ?? '';
    expect(main).not.toMatch(/\bQ[1-4]\b|\b20\d\d\b/);
    expect(body).not.toMatch(/in den nächsten (Tagen|Wochen|Monaten)/);
  });

  test('die Seite bietet einen Weg zum manuellen Erstellen', async ({ page }) => {
    await page.goto('/anleitung');
    const cta = page.getByRole('link', { name: /Zum Creator/ });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/create');
  });

  test('der Zurück-Pfeil führt weiterhin nach /about', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.locator('a[aria-label="Zurück"]')).toHaveAttribute('href', '/about');
  });
});

test.describe('Die Einstiegspunkte', () => {
  test('das Menu zeigt "Anleitung" mit der Kennzeichnung "Bald"', async ({ page }) => {
    await openMenu(page, '/about');
    const entry = page.locator('nav a[href="/anleitung"]');
    await expect(entry).toBeVisible();
    await expect(entry).toContainText('Anleitung');
    await expect(entry).toContainText('Bald');
  });

  test('der Eintrag bleibt bedienbar und führt auf die Ankündigung', async ({ page }) => {
    await openMenu(page, '/about');
    const entry = page.locator('nav a[href="/anleitung"]');
    await expect(entry).not.toHaveAttribute('aria-disabled', 'true');
    await entry.click();
    await page.waitForURL('**/anleitung');
    await expect(page.locator('main').getByText('Bald verfügbar').first()).toBeVisible();
  });

  test('die Kennzeichnung ist echter Text, nicht nur Farbe oder Icon', async ({ page }) => {
    await openMenu(page, '/about');
    // Screenreader müssen sie vorlesen können (Edge Case 5).
    const badge = page.locator('nav a[href="/anleitung"] span', { hasText: 'Bald' });
    await expect(badge.first()).toBeVisible();
    expect((await badge.first().textContent())?.trim()).toBe('Bald');
  });

  test('die Kennzeichnung verkleinert das Tap-Ziel nicht', async ({ page }) => {
    await openMenu(page, '/about');
    const box = await page.locator('nav a[href="/anleitung"]').boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('/about zeigt nur noch einen Hero-CTA', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('link', { name: /Mit KI erstellen/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Quest erstellen' }).first()).toBeVisible();
  });

  test('die Leeransicht von /create führt keinen KI-Link', async ({ page }) => {
    await page.goto('/create');
    await expect(page.getByRole('link', { name: /Quest mit KI bauen/ })).toHaveCount(0);
  });

  test('die Info-Kopfzeile führt keinen Textlink "Anleitung"', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');
    await expect(page.locator('header a[href="/anleitung"]')).toHaveCount(0);
    // Was bleiben muss:
    await expect(page.locator('header a[href="/"]').first()).toBeVisible();
  });

  for (const w of [375, 768, 1440]) {
    test(`die Kopfzeile ist auf ${w}px frei von Überlauf`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('/about');
      const overflow = await page.evaluate(() => {
        const h = document.querySelector('header')!;
        return h.scrollWidth - h.clientWidth;
      });
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('Ehrlichkeit der übrigen Copy', () => {
  test('die FAQ beschreibt das manuelle Erstellen', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('Wie erstelle ich eine Quest?')).toBeVisible();
    await page.getByText('Wie erstelle ich eine Quest?').click();
    await expect(page.locator('main')).toContainText('Ziele auf der Karte');
  });

  test('die FAQ-Antwort enthält keine Zeitangabe', async ({ page }) => {
    await page.goto('/about');
    const body = (await page.locator('body').textContent()) ?? '';
    expect(body).not.toContain('halbe Stunde');
    expect(body).not.toMatch(/\bin wenigen Minuten\b/);
  });

  test('die FAQ-Frage fragt nicht mehr nach der Dauer', async ({ page }) => {
    await page.goto('/about');
    const body = (await page.locator('body').textContent()) ?? '';
    expect(body).not.toContain('Wie lange dauert das Erstellen');
  });

  test('das JSON-LD trägt denselben Text wie die sichtbare Seite', async ({ page }) => {
    await page.goto('/about');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(raw).toContain('Wie erstelle ich eine Quest?');
    expect(raw).not.toContain('halbe Stunde');
  });

  test('weder /about noch /create stellen die KI als verfügbar dar', async ({ page }) => {
    for (const route of ['/about', '/create']) {
      await page.goto(route);
      const body = (await page.locator('body').textContent()) ?? '';
      expect(body).not.toContain('Mit KI erstellen');
      expect(body).not.toContain('Quest mit KI bauen');
    }
  });
});

test.describe('Keine Regression', () => {
  test('die Nachbarseiten sind unbeschädigt', async ({ page }) => {
    for (const [route, marker] of [['/impressum', 'Impressum'], ['/datenschutz', 'Datenschutz']] as const) {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toContainText(marker);
    }
  });

  test('/anleitung bleibt im Seitenrahmen der Info-Seiten', async ({ page }) => {
    await page.goto('/anleitung');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menü öffnen' })).toBeVisible();
    await expect(page.locator('header a[href*="ko-fi.com"]')).toBeVisible();
  });

  test('das Menu hat weiterhin vier Gruppen und sieben Ziele', async ({ page }) => {
    await openMenu(page, '/about');
    // Auf den Menu-Dialog eingegrenzt: Ein seitenweites `nav a` zählt die
    // Fußzeilen-Navigation mit und käme auf 11 statt 7.
    const menu = page.getByRole('dialog');
    expect(await menu.locator('a').count()).toBe(7);
    for (const gruppe of ['App', 'Info', 'Rechtliches', 'Unterstützen']) {
      await expect(menu.getByText(gruppe, { exact: true })).toBeVisible();
    }
    await expect(menu.locator('a[href*="ko-fi.com"]')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
