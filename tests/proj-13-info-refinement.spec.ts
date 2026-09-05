import { test, expect } from "@playwright/test";

/**
 * PROJ-13 — Refinement der Info-Seiten (2026-09-05).
 * Ein test() pro neuem Acceptance Criterion aus features/PROJ-13-landing-page.md,
 * Abschnitt „Navigation & Erscheinungsbild".
 */

const INFO_PAGES = ["/about", "/anleitung", "/impressum", "/datenschutz"];

test.describe("Erscheinungsbild", () => {
  test("kein Ambient-Backdrop — gleicher ruhiger Hintergrund wie der Start-Screen", async ({
    page,
  }) => {
    await page.goto("/about");

    // Der Backdrop rendert einen fixed Vollflächen-Layer mit ~46 Partikeln.
    await expect(page.locator("div.pointer-events-none.fixed.inset-0")).toHaveCount(0);

    // Body-Hintergrund muss dem des Start-Screens entsprechen.
    const aboutBg = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.goto("/");
    const homeBg = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(aboutBg).toBe(homeBg);
  });

  test("keine Trennlinie zwischen Header und Inhalt", async ({ page }) => {
    await page.goto("/about");
    const header = page.locator("header");
    const width = await header.evaluate(
      (el) => getComputedStyle(el).borderBottomWidth
    );
    expect(width).toBe("0px");
  });

  test("keine Pin-Bildmarke mehr im Header", async ({ page }) => {
    for (const path of INFO_PAGES) {
      await page.goto(path);
      await expect(page.locator('img[src*="mark-pin"]'), `${path}`).toHaveCount(0);
    }
  });

  test("kein Hinweis auf Zielgruppe oder Lesezeit unter dem Titel", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/Lesezeit/i)).toHaveCount(0);
    await expect(page.getByText(/Für Ersteller/i)).toHaveCount(0);
  });
});

test.describe("Burger-Menu (mobil)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("öffnet sich und zeigt alle vier Ziele", async ({ page }) => {
    await page.goto("/about");

    const trigger = page.getByRole("button", { name: "Menü öffnen" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    const menu = page.getByRole("dialog");
    for (const label of ["App", "Anleitung", "Impressum", "Datenschutz"]) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("schließt sich beim Antippen eines Eintrags und navigiert dorthin", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Impressum", exact: true })
      .click();

    await expect(page).toHaveURL(/\/impressum$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Escape schließt das Menu, ohne zu navigieren", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/about$/);
  });

  test("Fokus liegt im geöffneten Menu (Radix Focus-Trap)", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Menü öffnen" }).click();

    const focusInsideDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return !!dialog && dialog.contains(document.activeElement);
    });
    expect(focusInsideDialog).toBe(true);
  });
});

test.describe("Häufige Fragen (Accordion)", () => {
  test("ist eingeklappt, öffnet sich auf Klick", async ({ page }) => {
    await page.goto("/about");

    const answer = page.getByText(/Geo Quest ist vollständig kostenlos/);
    await expect(answer).toBeHidden();

    await page.getByRole("button", { name: /Was kostet Geo Quest/ }).click();
    await expect(answer).toBeVisible();
  });

  test("alle Antworten bleiben eingeklappt im HTML und im FAQPage-JSON-LD", async ({
    page,
  }) => {
    await page.goto("/about");

    // Crawler und KI-Systeme lesen das Markup, nicht die gerenderten Pixel.
    const html = await page.content();
    for (const needle of [
      "vollständig kostenlos",
      "keine E-Mail-Abfrage",
      "10 bis 15 Jahren",
      "etwa eine halbe Stunde",
    ]) {
      expect(html, `Antwort fehlt im HTML: ${needle}`).toContain(needle);
    }

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLd).toContain("FAQPage");
    expect(jsonLd).toContain("vollständig kostenlos");
  });
});

test.describe("Für wen — gekürzte Fassung", () => {
  test("ein Satz zur Zielgruppe plus vier Anlässe mit Kurzzeile", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { name: "Für wen" })).toBeVisible();
    await expect(page.getByText(/Kein technisches Vorwissen nötig/)).toBeVisible();

    for (const anlass of [
      "Kindergeburtstag",
      "Schulausflug",
      "Ferienprogramm",
      "Jugendgruppe & Verein",
    ]) {
      await expect(page.getByRole("term").filter({ hasText: anlass })).toBeVisible();
    }

    // Die früheren Fließtext-Absätze sind ersetzt.
    await expect(page.getByText(/Am häufigsten entstehen Quests/)).toHaveCount(0);
  });
});

test.describe("Rechtstexte", () => {
  test("/impressum nennt Anbieter, ladungsfähige Anschrift und Kontakt", async ({
    page,
  }) => {
    await page.goto("/impressum");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Impressum");
    await expect(page.getByText(/§ 5 Digitale-Dienste-Gesetz/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Anbieter" })).toBeVisible();

    // Kontakt muss unmittelbar erreichbar sein (§ 5 DDG), also ein echter
    // mailto-Link. Auf `main` eingegrenzt: seit Refinement 2 steht derselbe
    // Link zusätzlich im Footer.
    const mail = page.getByRole("main").locator('a[href^="mailto:"]');
    await expect(mail).toBeVisible();

    // Keine Platzhalter dürfen je live gehen.
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/\[(Vor- und Nachname|Straße|PLZ|E-Mail)/);
  });

  test("/datenschutz beschreibt lokale Daten, Standort und Reichweitenmessung", async ({
    page,
  }) => {
    await page.goto("/datenschutz");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Datenschutz");
    for (const heading of [
      "Quests und Spielfortschritt",
      "Standortdaten",
      "Hosting und Server-Protokolle",
      "Reichweitenmessung",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }

    await expect(page.getByText(/Vercel Web Analytics/)).toBeVisible();
    await expect(page.getByText(/keine\s+Cookies gesetzt/)).toBeVisible();
  });

  test("Rechtstexte sind auf noindex gesetzt", async ({ page }) => {
    for (const path of ["/impressum", "/datenschutz"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute(
        "content",
        /noindex/
      );
    }
  });

  test("Datenschutz behauptet nicht länger, gar nichts zu messen", async ({ page }) => {
    await page.goto("/datenschutz");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/kein Tracking/i);
  });
});

test.describe("Keine Cookies", () => {
  test("nach dem Laden aller Info-Seiten ist kein Cookie gesetzt", async ({
    page,
    context,
  }) => {
    for (const path of INFO_PAGES) {
      await page.goto(path);
    }
    // Die Datenschutzerklärung sagt zu: keine Cookies, keine Kennungen.
    expect(await context.cookies()).toEqual([]);
  });
});

test.describe("Responsive", () => {
  for (const width of [360, 390, 430, 768, 1440]) {
    test(`kein horizontales Scrollen bei ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of INFO_PAGES) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        );
        expect(overflow, `${path} bei ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("Desktop zeigt die Navigationslinks statt des Burger-Menus", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    await expect(page.getByRole("button", { name: "Menü öffnen" })).toBeHidden();
    for (const label of ["Anleitung", "Impressum", "Datenschutz"]) {
      await expect(
        page.getByRole("navigation").getByRole("link", { name: label, exact: true })
      ).toBeVisible();
    }
  });
});

test.describe("Zurückpfeil & Footer (Refinement 2)", () => {
  for (const path of ["/impressum", "/datenschutz"]) {
    test(`${path} hat einen Zurückpfeil nach /about`, async ({ page }) => {
      await page.goto(path);
      const arrow = page.getByRole("link", { name: "Zurück" });
      await expect(arrow).toBeVisible();
      await arrow.click();
      await expect(page).toHaveURL(/\/about$/);
    });
  }

  test("Footer zeigt Kontakt und Rechtslinks auf allen Info-Seiten", async ({
    page,
  }) => {
    for (const path of INFO_PAGES) {
      await page.goto(path);
      const footer = page.getByRole("contentinfo");
      await expect(footer, path).toBeVisible();
      await expect(footer.getByText("Daniela Oesten")).toBeVisible();
      await expect(footer.locator('a[href^="mailto:"]')).toBeVisible();
      await expect(
        footer.getByRole("link", { name: "Impressum", exact: true })
      ).toBeVisible();
      await expect(
        footer.getByRole("link", { name: "Datenschutz", exact: true })
      ).toBeVisible();
    }
  });

  test("Footer nennt keine Postanschrift — die bleibt dem Impressum vorbehalten", async ({
    page,
  }) => {
    await page.goto("/about");
    const footer = await page.getByRole("contentinfo").innerText();
    expect(footer).not.toContain("Kerbelweg");
    expect(footer).not.toContain("22337");
  });

  test("Desktop-Header führt Impressum und Datenschutz nicht mehr", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Impressum" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Datenschutz" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Anleitung" })).toBeVisible();
  });

  test("Burger-Menü behält alle vier Ziele", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    const menu = page.getByRole("dialog");
    for (const label of ["App", "Anleitung", "Impressum", "Datenschutz"]) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("Footer-Links erfüllen die 44px-Mindesthöhe", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    const footer = page.getByRole("contentinfo");
    for (const name of ["Impressum", "Datenschutz"]) {
      const box = await footer
        .getByRole("link", { name, exact: true })
        .boundingBox();
      expect(box!.height, name).toBeGreaterThanOrEqual(44);
    }
    const mail = await footer.locator('a[href^="mailto:"]').boundingBox();
    expect(mail!.height).toBeGreaterThanOrEqual(44);
  });
});
