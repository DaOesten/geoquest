import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-16 — QA vom 2026-10-25. Ergänzt `proj-16-auffindbarkeit.spec.ts` um das,
 * was die Frontend-Phase nicht geprüft hat: den iOS-Weg der installierten App,
 * Deep-Links in der installierten App, den Installations-Hinweis, die aktiven
 * Menü-Einträge, das Creator-Menü auf 320px, Content-Types und Umlenkversuche.
 */

const HINT = 'aside[aria-label*="installieren"]';

async function ohneErststartDialog(page: Page) {
  await page.addInitScript(() => localStorage.setItem("gq_first_visit_done", "true"));
}

async function fireInstallPrompt(page: Page) {
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    e.prompt = () => Promise.resolve();
    e.userChoice = Promise.resolve({ outcome: "dismissed" });
    window.dispatchEvent(e);
  });
}

/**
 * Gezogen am 2026-10-25: Die Startweiche ist entfernt (Refinement). Der
 * iOS-Weg (`navigator.standalone` ohne `matchMedia`) prüft jetzt, dass `/`
 * stehen bleibt; Deep-Link- und Umlenk-Wächter bleiben.
 */
test.describe("PROJ-16 QA: installierte App ohne Startweiche", () => {
  const LANDING = /^https?:\/\/[^/]+\/$/;

  test("iOS-Weg: mit `navigator.standalone` bleibt `/` die Landingpage", async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "standalone", { get: () => true })
    );
    await ohneErststartDialog(page);
    await page.goto("/");
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(LANDING);
    await expect(page.getByRole("heading", { level: 1, name: /Die reale Welt/i })).toBeVisible();
  });

  test("in der installierten App öffnen Deep-Links wie /impressum ohne Umweg", async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "standalone", { get: () => true })
    );
    await page.goto("/impressum");
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/impressum$/);
  });

  test("ein Umlenk-Parameter auf / hat keine Wirkung", async ({ page, baseURL }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "standalone", { get: () => true })
    );
    await ohneErststartDialog(page);
    await page.goto("/?redirect=https://evil.example&next=//evil.example");
    await page.waitForTimeout(800);
    // Gegen die Origin der baseURL statt fest localhost, damit der Wächter
    // auch gegen Production läuft. Eine Umlenkung auf eine fremde Domain
    // ließe ihn fallen.
    expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
    expect(new URL(page.url()).pathname).toBe("/");
  });
});

test.describe("PROJ-16 QA: Erstbesuch und Menü", () => {
  test("der Installations-Hinweis erscheint auf /app, nicht auf der Landingpage", async ({ page }) => {
    await ohneErststartDialog(page);
    await page.goto("/");
    await page.waitForTimeout(400);
    await fireInstallPrompt(page);
    await page.waitForTimeout(500);
    await expect(page.locator(HINT)).toHaveCount(0);

    await page.goto("/app");
    await page.waitForTimeout(400);
    await fireInstallPrompt(page);
    await expect(page.locator(HINT)).toBeVisible();
  });

  for (const [path, aktiv] of [
    ["/", ["ÜBER"]],
    ["/mit-ki-erstellen", ["MIT KI ERSTELLEN"]],
    ["/app", []],
    ["/impressum", ["IMPRESSUM"]],
  ] as const) {
    test(`auf ${path} ist im Menü genau ${aktiv.length ? aktiv[0] : "kein Eintrag"} aktiv`, async ({
      page,
    }) => {
      await ohneErststartDialog(page);
      await page.goto(path);
      await page.getByRole("button", { name: "Menü öffnen" }).first().click();
      const texte = await page
        .getByRole("dialog")
        .locator('a[aria-current="page"]')
        .allInnerTexts();
      expect(texte.map((t) => t.trim().toUpperCase())).toEqual([...aktiv]);
    });
  }
});

test.describe("PROJ-16 QA: Creator-Aktionsmenü", () => {
  test("auf 320×568 stehen alle drei Einträge im Bild, je 44px, ohne Überlappung", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/create");
    await page.evaluate(() => {
      localStorage.setItem("gq_first_visit_done", "true");
      localStorage.setItem(
        "gq_quests",
        JSON.stringify([
          {
            version: 1,
            id: "16161616-2222-4aaa-8aaa-aaaaaaaaaaaa",
            name: "Q",
            lastModified: "2026-10-24T10:00:00.000Z",
            intro: { text: "a" },
            outro: { text: "b" },
            stations: [],
            published: false,
          },
        ])
      );
    });
    await page.reload();
    await page.getByRole("button", { name: "Quest hinzufügen" }).click();
    await page.waitForTimeout(400);
    const boxes = [];
    for (const name of ["Mit KI erstellen", "Quest importieren", "Neue Quest"]) {
      const el = page.getByRole(name === "Mit KI erstellen" ? "link" : "button", { name, exact: true });
      const b = (await el.boundingBox())!;
      expect(b.height, name).toBeGreaterThanOrEqual(44);
      expect(b.y, name).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width, name).toBeLessThanOrEqual(320);
      boxes.push(b);
    }
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height);
    }
  });

  test("geschlossen ist der KI-Eintrag nicht per Tab erreichbar", async ({ page }) => {
    await page.goto("/create");
    await page.evaluate(() => {
      localStorage.setItem("gq_first_visit_done", "true");
      localStorage.setItem(
        "gq_quests",
        JSON.stringify([
          {
            version: 1,
            id: "16161616-3333-4aaa-8aaa-aaaaaaaaaaaa",
            name: "Q",
            lastModified: "2026-10-24T10:00:00.000Z",
            intro: { text: "a" },
            outro: { text: "b" },
            stations: [],
            published: false,
          },
        ])
      );
    });
    await page.reload();
    await expect(page.locator('div.fixed a[href="/mit-ki-erstellen"]')).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("PROJ-16 QA: Auslieferung", () => {
  test("llms.txt kommt als UTF-8-Text, Umlaute bleiben erhalten", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.headers()["content-type"]).toMatch(/text\/plain/i);
    expect(res.headers()["content-type"]).toMatch(/utf-8/i);
    expect(await res.text()).toContain("Datenschutzerklärung");
  });

  test("robots.txt als Text, sitemap.xml als XML, beide mit Sicherheits-Headern", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.headers()["content-type"]).toMatch(/text\/plain/);
    expect(robots.headers()["x-content-type-options"]).toBe("nosniff");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.headers()["content-type"]).toMatch(/xml/);
    expect(sitemap.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("/app und /mit-ki-erstellen bleiben bei DENY, nur /simulation ist SAMEORIGIN", async ({
    request,
  }) => {
    for (const path of ["/app", "/mit-ki-erstellen", "/impressum"]) {
      expect((await request.get(path)).headers()["x-frame-options"], path).toBe("DENY");
    }
    expect((await request.get("/simulation")).headers()["x-frame-options"]).toBe("SAMEORIGIN");
  });

  test("Markup in der Adresse der Landingpage wird nicht ausgegeben", async ({ request }) => {
    const html = await (await request.get("/?q=%3Cscript%3Ealert(16)%3C/script%3E")).text();
    expect(html).not.toContain("alert(16)");
  });

  test("die Landingpage nennt in ihrem Markup keine alten Adressen mehr", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).not.toMatch(/href="\/about"|href="\/anleitung"|\/about\/simulation/);
  });
});
