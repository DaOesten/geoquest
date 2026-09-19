import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-12 — PWA-Installation (Add to Homescreen).
 *
 * Diese Datei laeuft **mit** Service Worker, waehrend die uebrigen Suiten ihn
 * per `serviceWorkers: 'block'` abschalten (siehe playwright.config.ts): Sobald
 * der Worker die Seite kontrolliert, greift `page.route` nicht mehr, und die
 * Mocks von PROJ-4/PROJ-7 laufen ins echte Netz. Hier ist er der Pruefgegen-
 * stand, also wird er gezielt zugelassen.
 */
test.use({ serviceWorkers: "allow" });

const HINT = /als App installieren/i;

/** Startzustand: Erststart-Dialog erledigt, kein frueheres Wegklicken. */
async function seed(page: Page, route = "/") {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("gq_first_visit_done", "true");
  });
  await page.goto(route);
}

/**
 * Stellt Chromes `beforeinstallprompt` nach. Playwright feuert es nicht von
 * selbst — es haengt an den Heuristiken des echten Browsers (Nutzer-Engagement),
 * die sich im Test nicht herstellen lassen.
 */
async function fireInstallPrompt(page: Page, outcome: "accepted" | "dismissed" = "accepted") {
  await page.evaluate((o) => {
    const event = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    event.prompt = () => Promise.resolve();
    event.userChoice = Promise.resolve({ outcome: o });
    window.dispatchEvent(event);
  }, outcome);
}

/**
 * Wartet, bis der Service Worker die Seite **kontrolliert** — nicht nur, bis er
 * aktiv ist.
 *
 * Der Unterschied ist der Grund, warum es diese Funktion gibt: Ein Worker
 * kontrolliert nur Seiten, die *nach* seiner Aktivierung geladen wurden. Beim
 * allerersten Besuch registriert er sich, wird aktiv — und die bereits offene
 * Seite bleibt unkontrolliert, bis sie neu geladen wird. `clients.claim()` im
 * Worker holt das normalerweise nach, aber das ist ein Rennen: Unter Last
 * (gemessen im vollen 462-Test-Lauf) kann es länger dauern als das
 * Test-Timeout, und `waitForFunction` wartet dann auf etwas, das in dieser
 * Runde nicht mehr kommt.
 *
 * Deshalb: kurz auf `claim()` warten, und wenn das nicht reicht, einmal neu
 * laden. Nach einem Reload ist die Kontrolle garantiert — das ist kein
 * Verstecken des Problems, sondern der vorgesehene Weg.
 */
async function warteAufKontrolle(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready);

  const kontrolliert = await page
    .waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (kontrolliert) return;

  await page.reload();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, {
    timeout: 10000,
  });
}

test.describe("PROJ-12: PWA-Installation", () => {
  test.describe("Manifest", () => {
    test("ist verlinkt und deklariert alle Pflichtfelder", async ({ page, request }) => {
      await page.goto("/");
      await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
        "href",
        "/manifest.webmanifest"
      );

      const res = await request.get("/manifest.webmanifest");
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("manifest+json");

      const m = await res.json();
      expect(m.name).toBe("Geo Quest");
      expect(m.short_name).toBe("Geo Quest");
      // Start auf `/`, damit auch der Creator in der installierten App
      // erreichbar bleibt (Decision Log).
      expect(m.start_url).toBe("/");
      expect(m.display).toBe("standalone");
      expect(m.orientation).toBe("portrait");
      expect(m.background_color).toBe("#0B0F12");
      expect(m.theme_color).toBe("#0B0F12");
    });

    test("fuehrt 192, 512 und eine eigene maskable-Variante", async ({ request }) => {
      const m = await (await request.get("/manifest.webmanifest")).json();
      const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
      expect(sizes).toContain("192x192");
      expect(sizes).toContain("512x512");

      const maskable = m.icons.filter((i: { purpose: string }) => i.purpose === "maskable");
      expect(maskable.length).toBeGreaterThanOrEqual(1);
      // Eine eigene Grafik, nicht dasselbe Bild mit zwei Zwecken: Das
      // maskable-Icon braucht den Sicherheitsrand, das `any`-Icon nicht.
      const anySrc = m.icons.filter((i: { purpose: string }) => i.purpose === "any").map((i: { src: string }) => i.src);
      expect(anySrc).not.toContain(maskable[0].src);
    });

    test("alle Icons sind erreichbar und sind PNG", async ({ request }) => {
      const m = await (await request.get("/manifest.webmanifest")).json();
      for (const icon of m.icons) {
        const res = await request.get(icon.src);
        expect(res.status(), icon.src).toBe(200);
        expect(res.headers()["content-type"], icon.src).toContain("image/png");
      }
    });

    test("theme-color deckt sich mit dem Manifest (sonst blitzt der Start farbig)", async ({
      page,
      request,
    }) => {
      await page.goto("/");
      const meta = await page.locator('meta[name="theme-color"]').getAttribute("content");
      const m = await (await request.get("/manifest.webmanifest")).json();
      expect(meta).toBe(m.theme_color);
    });

    test("ist auf allen sieben Routen verlinkt", async ({ page }) => {
      for (const route of [
        "/",
        "/play",
        "/create",
        "/about",
        "/anleitung",
        "/impressum",
        "/datenschutz",
      ]) {
        await page.goto(route);
        await expect(page.locator('link[rel="manifest"]'), route).toHaveCount(1);
      }
    });
  });

  test.describe("iOS-Icon", () => {
    test("setzt ein apple-touch-icon (iOS wertet die Manifest-Icons nicht aus)", async ({
      page,
      request,
    }) => {
      await page.goto("/");
      const link = page.locator('link[rel="apple-touch-icon"]');
      await expect(link).toHaveCount(1);

      const href = await link.getAttribute("href");
      const res = await request.get(href!);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    });
  });

  test.describe("Service Worker", () => {
    test("registriert sich im Wurzel-Scope", async ({ page }) => {
      await page.goto("/");
      const reg = await page.evaluate(async () => {
        const r = await navigator.serviceWorker.ready;
        return { scope: new URL(r.scope).pathname, active: !!r.active };
      });
      expect(reg.active).toBe(true);
      expect(reg.scope).toBe("/");
    });

    /**
     * Der Kern des Features: Das PRD-Non-Goal "Kein Offline-Modus" ist hier
     * nicht nur Absicht, sondern strukturell — es liegt nichts im Cache, woraus
     * sich die App zusammensetzen liesse.
     */
    test("cacht AUSSCHLIESSLICH offline.html — auch nach Navigation", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => navigator.serviceWorker.ready);

      await page.goto("/play");
      await page.goto("/create");
      await page.waitForLoadState("networkidle");

      const cached = await page.evaluate(async () => {
        const out: string[] = [];
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const req of await cache.keys()) out.push(new URL(req.url).pathname);
        }
        return out;
      });

      expect(cached).toEqual(["/offline.html"]);
    });

    test("liefert Seiten aus dem Netz, nicht aus dem Cache", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => navigator.serviceWorker.ready);

      const fromNetwork: string[] = [];
      page.on("response", (r) => {
        if (r.url().endsWith("/play")) fromNetwork.push(String(r.status()));
      });
      await page.goto("/play");

      // Die Navigation hat wirklich eine Antwort vom Server bekommen.
      expect(fromNetwork.length).toBeGreaterThan(0);
    });
  });

  test.describe("Offline-Verhalten", () => {
    /**
     * Nur auf Chrome: Auf WebKit wirft `setOffline(true)` + `page.goto()` einen
     * internen Playwright-Fehler ("WebKit encountered an internal error"), die
     * Navigation erreicht den Service Worker also gar nicht erst. Das ist eine
     * Grenze der Testumgebung, kein Produktfehler — der Cache-Inhalt wird
     * deshalb weiter unten auch auf WebKit geprueft.
     */
    test.skip(
      ({ browserName }) => browserName === "webkit",
      "WebKit kann Offline-Navigation in Playwright nicht nachstellen"
    );

    test("zeigt die eigene Seite statt der Browser-Fehlerseite", async ({ page, context }) => {
      await page.goto("/");
      await warteAufKontrolle(page);

      await context.setOffline(true);
      await page.goto("/");

      await expect(page.getByRole("heading", { name: /keine verbindung/i })).toBeVisible();
      await expect(page.getByText(/Internetverbindung/i)).toBeVisible();

      await context.setOffline(false);
    });

    test("verspricht NICHT, dass Quests offline spielbar seien", async ({ page, context }) => {
      await page.goto("/");
      await warteAufKontrolle(page);

      await context.setOffline(true);
      await page.goto("/");

      const text = (await page.locator("body").innerText()).toLowerCase();
      // Die Seite sagt, dass Internet zum STARTEN noetig ist — "du bist
      // offline" liesse sich als "sonst ginge es auch offline" lesen.
      expect(text).toContain("starten");
      expect(text).not.toContain("offline spielen");
      expect(text).not.toContain("offline verfügbar");

      await context.setOffline(false);
    });

    test("bietet einen 'Erneut versuchen'-Button mit 44px Tap-Ziel", async ({ page, context }) => {
      await page.goto("/");
      await warteAufKontrolle(page);

      await context.setOffline(true);
      await page.goto("/");

      const btn = page.getByRole("button", { name: /erneut versuchen/i });
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);

      await context.setOffline(false);
    });

    test("startet die App normal, sobald die Verbindung zurueck ist", async ({ page, context }) => {
      // Erststart-Dialog vorab erledigen, sonst liegt er nach dem Neuladen
      // ueber dem Startscreen und verdeckt genau das, was geprueft wird.
      await seed(page);
      await warteAufKontrolle(page);

      await context.setOffline(true);
      await page.goto("/");
      await expect(page.getByRole("heading", { name: /keine verbindung/i })).toBeVisible();

      await context.setOffline(false);
      await page.getByRole("button", { name: /erneut versuchen/i }).click();

      // Zurueck auf dem Startscreen. Ueber `href` statt ueber den Linktext:
      // Der barrierefreie Name der Mode-Card ist Titel UND Beschreibung
      // ("DEINE QUESTS\nSpiele Outdoor Quests…"), ein Name-Filter trifft ihn
      // deshalb nicht sauber.
      await expect(page.locator('a[href="/play"]')).toBeVisible();
      await expect(page.getByRole("heading", { name: /bist du bereit/i })).toBeVisible();
    });

    test("die Offline-Seite laedt nichts nach (kein React, keine Schriften)", async ({
      page,
      context,
    }) => {
      await page.goto("/");
      await warteAufKontrolle(page);

      await context.setOffline(true);
      await page.goto("/");
      await expect(page.getByRole("heading", { name: /keine verbindung/i })).toBeVisible();

      /**
       * Geprueft wird, was die Seite **selbst** referenziert — nicht, was
       * waehrend ihrer Anzeige zufaellig durchs Netz geht.
       *
       * Die erste Fassung horchte auf `page.on("request")` und war dadurch
       * flaky (gemessen: 1 von 3 parallelen Laeufen): Sie fing Next.js'
       * Prefetches (`/about?_rsc=...`) auf, die ein *anderer* parallel
       * laufender Test ausgeloest hatte. Das sagte nichts ueber die
       * Offline-Seite aus — die Aussage haengt an ihrem Markup, und genau das
       * wird jetzt gemessen.
       */
      const referenzen = await page.evaluate(() => {
        const raus: string[] = [];
        document.querySelectorAll("script[src], link[href], img[src]").forEach((el) => {
          const url =
            el.getAttribute("src") ?? el.getAttribute("href") ?? "";
          // Anker und reine Fragmente sind keine nachgeladenen Ressourcen.
          if (url && !url.startsWith("#")) raus.push(url);
        });
        return raus;
      });

      // Die Seite muss funktionieren, wenn die App gar nicht laden konnte —
      // also ohne ein einziges Unter-Asset: kein React, kein Next.js, keine
      // Schriften, kein externes CSS.
      expect(referenzen).toEqual([]);

      // Und kein Inline-Script, das nachladen koennte.
      const scripts = await page.locator("script").count();
      expect(scripts).toBe(0);

      await context.setOffline(false);
    });
  });

  /**
   * Was sich auf BEIDEN Engines pruefen laesst: dass die Fehlerseite wirklich
   * im Cache liegt und den richtigen Inhalt hat. Die Offline-*Navigation* kann
   * nur Chrome nachstellen (siehe Skip oben) — der Cache-Inhalt ist aber die
   * Voraussetzung dafuer, und die gilt engineuebergreifend.
   */
  test.describe("Offline-Seite im Cache (beide Engines)", () => {
    test("liegt im Cache und traegt die richtige Aussage", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => navigator.serviceWorker.ready);

      const content = await page.evaluate(async () => {
        for (const name of await caches.keys()) {
          const match = await (await caches.open(name)).match("/offline.html");
          if (match) return await match.text();
        }
        return null;
      });

      expect(content).not.toBeNull();
      expect(content).toContain("Keine Verbindung");
      expect(content).toContain("Internetverbindung");
      expect(content!.toLowerCase()).not.toContain("offline spielen");
      // Ohne React/Next/Schriften — sie wuerden in genau dem Moment fehlen.
      expect(content).not.toContain("/_next/");
      expect(content).not.toContain("fonts.googleapis.com");
    });
  });

  test.describe("Installations-Hinweis — Anzeige-Regeln", () => {
    test("erscheint nicht, wenn es keinen Installationsweg gibt", async ({ page }) => {
      test.skip(
        test.info().project.name === "Mobile Safari",
        "WebKit gilt als iOS-Safari und hat damit sehr wohl einen Weg"
      );
      await seed(page);
      await page.waitForTimeout(300);
      await expect(page.getByRole("complementary", { name: HINT })).toHaveCount(0);
    });

    test("erscheint auf /play mit der vollen Karte", async ({ page }) => {
      await seed(page, "/play");
      await fireInstallPrompt(page);
      await expect(page.getByRole("complementary", { name: HINT })).toBeVisible();
    });

    test("erscheint NICHT im Creator", async ({ page }) => {
      await seed(page, "/create");
      await fireInstallPrompt(page);
      await page.waitForTimeout(300);
      await expect(page.getByRole("complementary", { name: HINT })).toHaveCount(0);
    });

    test("erscheint NICHT im Standalone-Modus (App laeuft bereits installiert)", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        const orig = window.matchMedia.bind(window);
        window.matchMedia = ((q: string) =>
          q === "(display-mode: standalone)"
            ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} }
            : orig(q)) as typeof window.matchMedia;
      });
      await seed(page);
      await fireInstallPrompt(page);
      await page.waitForTimeout(300);
      await expect(page.getByRole("complementary", { name: HINT })).toHaveCount(0);
    });

    test("der Erststart-Dialog hat Vorrang und der Hinweis rueckt danach nach", async ({
      page,
    }) => {
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.goto("/");

      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("complementary", { name: HINT })).toHaveCount(0);

      await page.getByRole("button", { name: "Verstanden" }).click();
      await fireInstallPrompt(page);
      await expect(page.getByRole("complementary", { name: HINT })).toBeVisible();
    });
  });

  test.describe("Installations-Hinweis — Wegklicken und 30-Tage-Frist", () => {
    test("verschwindet sofort und schreibt einen Zeitstempel", async ({ page }) => {
      await seed(page, "/play");
      await fireInstallPrompt(page);
      await expect(page.getByRole("complementary", { name: HINT })).toBeVisible();

      await page.getByRole("button", { name: "Hinweis ausblenden" }).click();
      await expect(page.getByRole("complementary", { name: HINT })).toHaveCount(0);

      const stored = await page.evaluate(() =>
        localStorage.getItem("gq_install_hint_dismissed")
      );
      expect(Number(stored)).toBeGreaterThan(0);
    });

    test("bleibt innerhalb der 30 Tage weg", async ({ page }) => {
      await seed(page, "/play");
      await page.evaluate(() =>
        localStorage.setItem("gq_install_hint_dismissed", String(Date.now()))
      );
      await page.goto("/play");
      await fireInstallPrompt(page);
      await page.waitForTimeout(300);
      await expect(page.getByRole("complementary", { name: HINT })).toHaveCount(0);
    });

    test("wird nach 31 Tagen erneut angeboten", async ({ page }) => {
      await seed(page, "/play");
      await page.evaluate(() =>
        localStorage.setItem(
          "gq_install_hint_dismissed",
          String(Date.now() - 31 * 24 * 60 * 60 * 1000)
        )
      );
      await page.goto("/play");
      await fireInstallPrompt(page);
      await expect(page.getByRole("complementary", { name: HINT })).toBeVisible();
    });
  });

  test.describe("Installations-Hinweis — Darstellung", () => {
    test("Android-Weg: Button oeffnet den nativen Dialog", async ({ page }) => {
      await seed(page, "/play");

      let prompted = false;
      await page.exposeFunction("__promptCalled", () => {
        prompted = true;
      });
      await page.evaluate(() => {
        const event = new Event("beforeinstallprompt") as Event & {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: string }>;
        };
        event.prompt = () => {
          (window as unknown as { __promptCalled: () => void }).__promptCalled();
          return Promise.resolve();
        };
        event.userChoice = Promise.resolve({ outcome: "accepted" });
        window.dispatchEvent(event);
      });

      await page.getByRole("button", { name: "Installieren" }).click();
      await expect.poll(() => prompted).toBe(true);
    });

    test("Abbruch des Dialogs gilt als weggeklickt (Edge Case 3)", async ({ page }) => {
      await seed(page, "/play");
      await fireInstallPrompt(page, "dismissed");

      await page.getByRole("button", { name: "Installieren" }).click();
      await expect(page.getByRole("complementary", { name: HINT })).toHaveCount(0);
      const stored = await page.evaluate(() =>
        localStorage.getItem("gq_install_hint_dismissed")
      );
      expect(stored).not.toBeNull();
    });

    test("iOS-Weg: Anleitung statt Button, kein toter Knopf (Lehre aus BUG-6)", async ({
      page,
    }) => {
      test.skip(
        test.info().project.name !== "Mobile Safari",
        "Nur auf der WebKit-/iOS-Engine aussagekraeftig"
      );
      await seed(page, "/play");

      const hint = page.getByRole("complementary", { name: HINT });
      await expect(hint).toBeVisible();
      await expect(hint).toContainText("Teilen");
      await expect(hint).toContainText("Zum Home-Bildschirm");
      // Der eigentliche Punkt: kein Knopf, der auf iOS garantiert nichts tun
      // kann.
      await expect(page.getByRole("button", { name: "Installieren" })).toHaveCount(0);
    });

    test("alle Bedienelemente erfuellen 44px", async ({ page }) => {
      await seed(page, "/play");
      await fireInstallPrompt(page);

      const hint = page.getByRole("complementary", { name: HINT });
      await expect(hint).toBeVisible();

      const close = page.getByRole("button", { name: "Hinweis ausblenden" });
      const closeBox = await close.boundingBox();
      expect(closeBox!.width).toBeGreaterThanOrEqual(44);
      expect(closeBox!.height).toBeGreaterThanOrEqual(44);

      const install = page.getByRole("button", { name: "Installieren" });
      if (await install.count()) {
        const box = await install.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    });

    /**
     * Die kompakte Fassung auf `/` darf ihren Text nicht abschneiden. Gemessen
     * in der Frontend-Phase: Die erste Fassung ("Als App: Teilen → Zum
     * Home-Bildschirm") brauchte 224px und wurde auf 320px bei 184px gekappt —
     * der Nutzer haette eine halbe Anweisung gesehen, also genau das Gegenteil
     * dessen, wofuer der Hinweis da ist.
     */
    test("die kompakte Fassung auf `/` schneidet auf 320px keinen Text ab", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await seed(page);
      await fireInstallPrompt(page);
      await page.waitForTimeout(300);

      const cut = await page.evaluate(() => {
        const aside = document.querySelector('aside[aria-label*="installieren"]');
        if (!aside) return null;
        return Array.from(aside.querySelectorAll("span"))
          .filter((s) => (s as HTMLElement).innerText?.trim())
          .filter((s) => s.scrollWidth > s.clientWidth + 1)
          .map((s) => (s as HTMLElement).innerText);
      });

      expect(cut).not.toBeNull();
      expect(cut).toEqual([]);
    });

    test("Textkontrast erreicht mindestens 4.5:1", async ({ page }) => {
      await seed(page, "/play");
      await fireInstallPrompt(page);
      await expect(page.getByRole("complementary", { name: HINT })).toBeVisible();

      const measured = await page.evaluate(() => {
        function lum(c: string) {
          const p = c.match(/\d+(\.\d+)?/g)!.map(Number).slice(0, 3);
          const s = p.map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
        }

        /**
         * Der tatsaechliche Hintergrund des Elements — die naechste Ebene nach
         * oben, die nicht durchsichtig ist. Ohne diesen Schritt misst man den
         * "Installieren"-Button (weisse Schrift auf Teal) gegen den dunklen
         * Kartengrund und bekommt 1.19 statt des echten Werts.
         */
        function effectiveBg(el: Element): string {
          let node: Element | null = el;
          while (node) {
            const bg = getComputedStyle(node).backgroundColor;
            const alpha = bg.match(/rgba?\([^)]*,\s*([\d.]+)\)/);
            if (bg && bg !== "transparent" && (!alpha || Number(alpha[1]) > 0)) return bg;
            node = node.parentElement;
          }
          return "rgb(11, 15, 18)";
        }

        const aside = document.querySelector('aside[aria-label*="installieren"]')!;
        const out: Record<string, number> = {};
        aside.querySelectorAll("p, span, li, button").forEach((el) => {
          const t = (el as HTMLElement).innerText?.trim();
          if (!t) return;
          const l1 = lum(getComputedStyle(el).color);
          const l2 = lum(effectiveBg(el));
          const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
          out[t.slice(0, 30)] = Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
        });
        return out;
      });

      // Einzeln melden, damit im Fehlerfall sichtbar ist, welcher Text faellt.
      for (const [text, ratio] of Object.entries(measured)) {
        expect(ratio, text).toBeGreaterThanOrEqual(4.5);
      }
      expect(Object.keys(measured).length).toBeGreaterThan(0);
    });
  });

  /**
   * AC "Browser ohne Service-Worker-Unterstuetzung" und Edge Case 12.
   *
   * Diese drei Faelle hatten bis zur QA vom 2026-09-19 **gar keinen Test** —
   * genau die Luecke, durch die BUG-11 entstehen konnte. Alle drei enden
   * damit, dass die App vollstaendig bedienbar bleibt und die Konsole still
   * ist; nur Offline-Seite und Android-Installationsweg entfallen.
   */
  /**
   * AC: „Neue Version ohne Deinstallieren oder Fensterschliessen."
   *
   * Dieser Block existiert wegen einer Gegenprobe: Nachdem `warteAufKontrolle()`
   * einen Reload als Rueckfallebene bekam, bestand die Suite **auch dann noch
   * vollstaendig**, wenn man `skipWaiting()` und `clients.claim()` aus `sw.js`
   * entfernte — der Reload verdeckte den Verlust. Die sofortige Uebernahme ist
   * aber genau das, was das Acceptance Criterion verlangt, und muss deshalb
   * eigens geprueft werden.
   */
  test.describe("Sofortige Uebernahme (skipWaiting + claim)", () => {
    test("der Worker uebernimmt die bereits offene Seite OHNE Reload", async ({ page }) => {
      // Frischer Zustand: Ohne das kontrolliert ein Worker aus einem frueheren
      // Test die Seite schon beim ersten Aufruf, und der Test wuerde bestehen,
      // ohne die Uebernahme wirklich zu pruefen.
      await page.goto("/");
      await page.evaluate(async () => {
        for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
        for (const k of await caches.keys()) await caches.delete(k);
      });

      // Erster Aufruf nach dem Aufraeumen: Der Worker installiert sich neu und
      // muss diese Seite von sich aus uebernehmen.
      await page.goto("/");
      await page.evaluate(() => navigator.serviceWorker.ready);

      // Bewusst KEIN Reload. Faellt `clients.claim()` weg, bleibt `controller`
      // null und dieser Test schlaegt fehl — so soll es sein.
      await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, {
        timeout: 15000,
      });

      const kontrolliert = await page.evaluate(() => !!navigator.serviceWorker.controller);
      expect(kontrolliert).toBe(true);
    });

    test("kein Worker haengt im Wartezustand fest", async ({ page }) => {
      await page.goto("/");
      await warteAufKontrolle(page);

      const zustand = await page.evaluate(async () => {
        const r = await navigator.serviceWorker.ready;
        await r.update();
        return { waiting: !!r.waiting, active: !!r.active };
      });

      // `skipWaiting()` sorgt dafuer, dass eine neue Fassung nicht wartet, bis
      // alle Fenster geschlossen sind — die installierte App hat keine
      // Adressleiste, mit der ein Nutzer das erzwingen koennte.
      expect(zustand.waiting).toBe(false);
      expect(zustand.active).toBe(true);
    });
  });

  test.describe("Ohne Service Worker (Edge Case 12)", () => {
    /** Hilft beim Zaehlen: Wirft die Seite waehrend der Bedienung Fehler? */
    async function bedienbarOhneFehler(page: import("@playwright/test").Page) {
      const fehler: string[] = [];
      page.on("pageerror", (e) => fehler.push(String(e)));

      await page.goto("/");
      await page.evaluate(() => localStorage.setItem("gq_first_visit_done", "true"));
      await page.goto("/");
      await expect(page.locator('a[href="/play"]')).toBeVisible();
      await expect(page.locator('a[href="/create"]')).toBeVisible();

      await page.goto("/play");
      await expect(page.getByRole("heading", { name: /meine quests/i })).toBeVisible();

      await page.goto("/create");
      await expect(page.getByRole("heading").first()).toBeVisible();

      return fehler;
    }

    test("Eigenschaft fehlt ganz — echter Browser ohne Unterstuetzung", async ({ page }) => {
      await page.addInitScript(() => {
        delete (Navigator.prototype as unknown as Record<string, unknown>).serviceWorker;
      });

      const fehler = await bedienbarOhneFehler(page);
      expect(await page.evaluate(() => "serviceWorker" in navigator)).toBe(false);
      expect(fehler).toEqual([]);
    });

    /**
     * BUG-11 (QA 2026-09-19): Haertungs-Erweiterungen setzen solche APIs
     * gelegentlich auf `undefined`, statt sie zu loeschen. Die alte Pruefung
     * `"serviceWorker" in navigator` war dann `true`, und `.register()` warf
     * bei jedem Seitenaufruf einen `TypeError` in die Konsole.
     */
    test("BUG-11: Eigenschaft ist undefined — kein TypeError in der Konsole", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "serviceWorker", {
          get: () => undefined,
          configurable: true,
        });
      });

      const fehler = await bedienbarOhneFehler(page);
      // Die Eigenschaft ist da, aber leer — genau der Fall aus BUG-11.
      expect(await page.evaluate(() => "serviceWorker" in navigator)).toBe(true);
      expect(await page.evaluate(() => navigator.serviceWorker)).toBeFalsy();
      expect(fehler).toEqual([]);
    });

    test("unsicherer Kontext — still uebersprungen, keine Registrierung", async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(window, "isSecureContext", {
          get: () => false,
          configurable: true,
        });
      });

      const fehler = await bedienbarOhneFehler(page);
      const registrierungen = await page.evaluate(
        async () => (await navigator.serviceWorker.getRegistrations()).length
      );
      expect(registrierungen).toBe(0);
      expect(fehler).toEqual([]);
    });
  });

  test.describe("Keine Regression", () => {
    /**
     * Das Kriterium stammt aus PROJ-1 und ist aelter als dieses Feature. Es hat
     * die kompakte Fassung des Hinweises auf `/` erzwungen: Die volle Karte
     * (195px) liess die Seite auf 799px wachsen.
     */
    test("`/` scrollt auf 360x640 weiterhin nicht — auch MIT Hinweis", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      await seed(page);
      await fireInstallPrompt(page);
      await page.waitForTimeout(300);

      const m = await page.evaluate(() => ({
        createBottom: document.querySelector('a[href="/create"]')!.getBoundingClientRect().bottom,
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }));

      expect(m.createBottom).toBeLessThanOrEqual(640);
      expect(m.scrollHeight).toBeLessThanOrEqual(m.innerHeight + 1);
    });

    test("alle sieben Routen antworten weiterhin mit 200", async ({ request }) => {
      for (const route of [
        "/",
        "/play",
        "/create",
        "/about",
        "/anleitung",
        "/impressum",
        "/datenschutz",
      ]) {
        expect((await request.get(route)).status(), route).toBe(200);
      }
    });

    test("die Anleitung bleibt zurueckgehalten (PROJ-14 unberuehrt)", async ({ request }) => {
      const html = await (await request.get("/anleitung")).text();
      expect(html).not.toContain("Du bist ein Experte");
      expect(html).toContain("Bald");
    });
  });
});
