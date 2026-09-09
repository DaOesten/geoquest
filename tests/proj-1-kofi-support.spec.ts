import { test, expect } from '@playwright/test';

/**
 * PROJ-1 / PROJ-13 — Refinement 2026-09-09: 'Support me' (Ko-fi).
 *
 * Ein test() pro Acceptance Criterion aus den Abschnitten 'Support me / Ko-fi'
 * (PROJ-1) und 'Ko-fi-Icon in der Kopfzeile' (PROJ-13).
 *
 * Der Eintrag existiert an zwei Orten in zwei Formen: ausgeschrieben im
 * Burger-Menu auf jedem Screen, als Icon ohne Text in der Kopfzeile von
 * /about und /anleitung. Beide zeigen auf dieselbe URL — die Tests prüfen
 * das getrennt, damit ein Auseinanderlaufen auffällt.
 */

const KOFI = 'https://ko-fi.com/technolomagie';

/** Öffnet das Burger-Menu auf dem übergebenen Screen. */
async function openMenu(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.getByRole('button', { name: 'Menü öffnen' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe("Burger-Menu — Gruppe Unterstützen (PROJ-1)", () => {
  test("das Menu zeigt vier Gruppen, Unterstützen als letzte", async ({
    page,
  }) => {
    await openMenu(page, '/play');
    const dialog = page.getByRole('dialog');

    for (const title of ['App', 'Info', 'Rechtliches', 'Unterstützen']) {
      await expect(dialog.getByText(title, { exact: true })).toBeVisible();
    }

    // Reihenfolge ist Gewichtung: freiwillig steht hinter Zweck und Pflicht.
    const headings = await dialog
      .locator('p.text-tech.uppercase')
      .allTextContents();
    expect(headings).toEqual(['App', 'Info', 'Rechtliches', 'Unterstützen']);
  });

  test("die Gruppe enthält Support me mit Kaffeetassen-Icon", async ({
    page,
  }) => {
    await openMenu(page, '/play');

    const link = page.getByRole('dialog').getByRole('link', { name: /Support me/ });
    await expect(link).toBeVisible();
    // lucide rendert als <svg>; das erste ist das Kaffeetassen-Icon links.
    await expect(link.locator('svg').first()).toBeVisible();
  });

  test('der Eintrag zeigt auf Ko-fi und öffnet einen neuen Tab', async ({
    page,
  }) => {
    await openMenu(page, '/play');

    const link = page.getByRole('dialog').getByRole('link', { name: /Support me/ });
    await expect(link).toHaveAttribute('href', KOFI);
    await expect(link).toHaveAttribute('target', '_blank');
    // noopener: sonst bekäme die Zielseite über window.opener Zugriff auf
    // den Tab der App (Reverse Tabnabbing).
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  });

  test('Screenreader hören, dass der Link einen neuen Tab öffnet', async ({
    page,
  }) => {
    await openMenu(page, '/play');

    const link = page.getByRole('dialog').getByRole('link', { name: /Support me/ });
    await expect(link).toHaveAccessibleName(/öffnet neuen Tab/);
  });

  test('der Eintrag ist auf jedem Screen der App erreichbar', async ({ page }) => {
    // Play (Dark), Create (Light) und eine Info-Seite — die drei Kontexte,
    // in denen das Menu unterschiedlich eingebunden ist.
    for (const path of ['/play', '/create', '/about']) {
      await openMenu(page, path);
      await expect(
        page.getByRole('dialog').getByRole('link', { name: /Support me/ })
      ).toHaveAttribute('href', KOFI);
    }
  });

  test('der Eintrag wird nie als aktive Seite markiert', async ({ page }) => {
    await openMenu(page, '/play');

    // Ein externes Ziel ist nie 'die aktuelle Seite' — sonst würde der
    // Eintrag je nach Pfad-Vergleich fälschlich hervorgehoben.
    const link = page.getByRole('dialog').getByRole('link', { name: /Support me/ });
    await expect(link).not.toHaveAttribute('aria-current', 'page');
  });

  test('der Eintrag trägt dieselbe Typografie wie die übrigen Menu-Links', async ({
    page,
  }) => {
    await openMenu(page, '/play');
    const dialog = page.getByRole('dialog');

    // Kein Werbe-Banner: gleiche Schriftgröße und Zeilenhöhe wie 'Play'.
    const support = dialog.getByRole('link', { name: /Support me/ });
    const play = dialog.getByRole('link', { name: 'Play' });

    const box = (l: typeof support) =>
      l.evaluate((el) => {
        const s = getComputedStyle(el);
        return { size: s.fontSize, height: el.getBoundingClientRect().height };
      });

    expect(await box(support)).toEqual(await box(play));
  });

  test('der Eintrag erfüllt AA-Kontrast auch im Creator (Light Theme)', async ({
    page,
  }) => {
    await openMenu(page, '/create');

    const link = page.getByRole('dialog').getByRole('link', { name: /Support me/ });
    // text-foreground statt fester Hex-Werte (BUG-1): trägt in beiden Themes.
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    const bg = await page
      .getByRole('dialog')
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    const parse = (c: string) => c.match(/\d+/g)!.slice(0, 3).map(Number);
    const lum = (rgb: number[]) => {
      const [r, g, b] = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [l1, l2] = [lum(parse(color)), lum(parse(bg))].sort((a, b) => b - a);
    const ratio = (l1 + 0.05) / (l2 + 0.05);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Kopfzeile — Ko-fi-Icon (PROJ-13)', () => {
  const supportIcon = (page: import('@playwright/test').Page) =>
    page.getByRole('banner').getByRole('link', { name: /Support me/ });

  for (const path of ['/about', '/anleitung']) {
    test(`${path} zeigt den Icon-Button ohne Textbeschriftung`, async ({
      page,
    }) => {
      await page.goto(path);

      const icon = supportIcon(page);
      await expect(icon).toBeVisible();
      await expect(icon).toHaveAttribute('href', KOFI);
      await expect(icon).toHaveAttribute('target', '_blank');
      await expect(icon).toHaveAttribute('rel', /noopener/);
      // Ohne Text: die Beschriftung trägt das Burger-Menu.
      await expect(icon).toHaveText('');
      await expect(icon).toHaveAccessibleName(/Support me/);
      await expect(icon).toHaveAccessibleName(/öffnet neuen Tab/);
    });
  }

  for (const path of ['/impressum', '/datenschutz']) {
    test(`${path} zeigt kein Ko-fi-Icon`, async ({ page }) => {
      await page.goto(path);

      // Rechtstexte liest niemand aus Sympathie.
      await expect(supportIcon(page)).toHaveCount(0);
    });
  }

  test("Zur App bleibt der optisch stärkere der beiden Buttons", async ({
    page,
  }) => {
    await page.goto('/about');

    const zurApp = page.getByRole('banner').getByRole('link', { name: 'Zur App' });
    await expect(zurApp).toBeVisible();

    // Ghost: kein Rahmen, keine Füllfläche — sonst raten Besucher, welcher
    // der beiden Buttons gemeint ist.
    const style = await supportIcon(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.borderTopWidth, bg: s.backgroundColor };
    });
    expect(style.border).toBe('0px');
    expect(['rgba(0, 0, 0, 0)', 'transparent']).toContain(style.bg);
  });

  test("das Icon steht in der Tab-Reihenfolge vor Zur App", async ({
    page,
  }) => {
    await page.goto('/about');

    const order = await page.getByRole('banner').evaluate((header) => {
      const links = Array.from(header.querySelectorAll('a'));
      return {
        support: links.findIndex((a) => a.getAttribute('href')?.includes('ko-fi')),
        zurApp: links.findIndex((a) => a.textContent?.trim() === 'Zur App'),
      };
    });

    expect(order.support).toBeGreaterThanOrEqual(0);
    expect(order.support).toBeLessThan(order.zurApp);
  });

  test('das Tap-Ziel bleibt auf 320px bei mindestens 44px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/about');

    const box = await supportIcon(page).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('die Kopfzeile bricht auf 320px nicht um', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/about');

    // Alle SICHTBAREN Kopfzeilen-Elemente teilen sich eine Zeile: gleiche
    // vertikale Mitte. Der Textlink 'Anleitung' ist unter `sm` per
    // `hidden sm:flex` ausgeblendet und hat dann Größe 0 — er gehört nicht
    // in den Vergleich, sonst misst der Test gegen einen Phantom-Wert.
    const header = page.getByRole('banner');
    const mids = await header.evaluate((el) => {
      const items = Array.from(el.querySelectorAll('a, button'));
      return items
        .map((i) => i.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => Math.round(r.top + r.height / 2));
    });

    expect(mids.length).toBeGreaterThanOrEqual(3);

    expect(Math.max(...mids) - Math.min(...mids)).toBeLessThanOrEqual(2);
    // Und die Zeile erzeugt keinen horizontalen Überlauf.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow).toBe(false);
  });

  test('das Icon erhält sichtbaren Tastatur-Fokus', async ({ page }) => {
    await page.goto('/about');

    await supportIcon(page).focus();
    await expect(supportIcon(page)).toBeFocused();
  });

  test('der primäre CTA liegt weiterhin über dem Falz (BUG-7 bleibt behoben)', async ({
    page,
  }) => {
    // Der Icon-Button steht in der bestehenden Kopfzeilen-Höhe und darf
    // keine zusätzliche Höhe erzeugen. 1366×768 war der knappste Fall.
    for (const [width, height] of [
      [320, 568],
      [1366, 768],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/about');

      const cta = page.getByRole('link', { name: /Quest erstellen/ }).first();
      const box = await cta.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    }
  });
});

test.describe('JSON-LD — Altersangabe (Nachzug 2026-09-09)', () => {
  test('die audience nennt 8 bis 16 wie der sichtbare FAQ-Text', async ({
    page,
  }) => {
    await page.goto('/about');

    const raw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const data = JSON.parse(raw!);
    // Die Seite liefert einen @graph mit WebApplication und FAQPage.
    const nodes = data['@graph'] ?? (Array.isArray(data) ? data : [data]);
    const app = nodes.find((n: { '@type': string }) => n['@type'] === 'WebApplication');

    // Strukturierte Daten dürfen nicht vom Seiteninhalt abweichen: sichtbar
    // steht 'etwa 8 bis 16 Jahren, aber niemand ist zu alt'.
    expect(app.audience.suggestedMinAge).toBe(8);
    expect(app.audience.suggestedMaxAge).toBe(16);
  });

  test('sichtbarer Text und JSON-LD nennen dieselbe Spanne', async ({ page }) => {
    await page.goto('/about');

    const raw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const data = JSON.parse(raw!);
    // Die Seite liefert einen @graph mit WebApplication und FAQPage.
    const nodes = data['@graph'] ?? (Array.isArray(data) ? data : [data]);
    const app = nodes.find((n: { '@type': string }) => n['@type'] === 'WebApplication');

    const html = await page.content();
    expect(html).toContain(`${app.audience.suggestedMinAge} bis`);
    expect(html).toContain(`${app.audience.suggestedMaxAge} Jahren`);
  });
});
