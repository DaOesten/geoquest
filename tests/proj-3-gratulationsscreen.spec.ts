import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * PROJ-3, Refinement 2026-09-19 — Gratulationsscreen nach Stationsankunft.
 *
 * Drei Befunde: die "Nächstes Ziel"-Karte nimmt vorweg, was der Spieler gerade
 * erst erreicht hat; das Pin-Logo zeichnet sich als Rechteck vom Hintergrund ab
 * (JPEG ohne Alpha-Kanal); das Konfetti rieselt endlos von oben statt einmalig
 * wie aus einer Kanone zu schießen.
 */

const TEST_QUEST = {
  version: 1,
  id: "c1111111-1111-4111-8111-111111111111",
  name: "Gratulations-Test",
  lastModified: "2026-09-19T00:00:00.000Z",
  intro: { text: "Los geht's." },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "d1111111-1111-4111-8111-111111111111",
      // Bewusst lang: Edge Case 16 — der Name darf umbrechen, nicht abschneiden.
      name: "Alter Wasserturm am Stadtpark hinter der großen Kastanie",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Station 1 Text" }],
    },
    {
      id: "d2222222-2222-4222-8222-222222222222",
      name: "Zweite Station",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 30,
      modules: [{ type: "text", content: "Station 2 Text" }],
    },
  ],
};

async function arriveAtFirstStation(page: Page, context: BrowserContext) {
  await page.goto("/play");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
  }, TEST_QUEST);

  await context.grantPermissions(["geolocation"]);
  // Exakt auf der Station: die Ankunft wird sofort erkannt.
  await context.setGeolocation({ latitude: 53.61, longitude: 10.04 });
  await page.goto(`/play/${TEST_QUEST.id}`);
  await page.getByRole("button", { name: /Los geht/ }).click();
  await page
    .getByRole("button", { name: new RegExp(`Navigation zu ${TEST_QUEST.stations[0].name}`) })
    .click();
  await expect(page.getByText("Ziel erreicht!")).toBeVisible({ timeout: 10_000 });
}

test.describe("PROJ-3: Gratulationsscreen (Refinement 2026-09-19)", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 53.61, longitude: 10.04 });
  });

  test.describe("Kein Hinweis auf die nächste Station", () => {
    test("zeigt weder Karte noch Name der nächsten Station", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      // Die Quest hat eine zweite Station — genau der Fall, der bis zum
      // Refinement die Karte zeigte.
      await expect(page.getByText("Nächstes Ziel")).toHaveCount(0);
      await expect(page.getByText("Zweite Station")).toHaveCount(0);
    });

    test("zeigt den Namen der erreichten Station", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      // Gegenprobe zum Test darüber: Der Screen ist nicht einfach leer —
      // der Name der erreichten Station steht sehr wohl da.
      await expect(page.getByText(TEST_QUEST.stations[0].name)).toBeVisible();
    });

    test("Reihenfolge: Pin, Headline, Stationsname, CTA — ohne Element dazwischen", async ({
      page,
      context,
    }) => {
      await arriveAtFirstStation(page, context);

      const order = await page.evaluate((stationName) => {
        const y = (el: Element | null) => (el ? el.getBoundingClientRect().top : -1);
        const pin = document.querySelector('img[src*="mark-pin"]');
        const headline = Array.from(document.querySelectorAll("h2")).find((h) =>
          h.textContent?.includes("Ziel erreicht")
        );
        const name = Array.from(document.querySelectorAll("p")).find(
          (p) => p.textContent?.trim() === stationName
        );
        const cta = Array.from(document.querySelectorAll("button")).find((b) =>
          b.textContent?.includes("Station entdecken")
        );
        return {
          pin: y(pin ?? null),
          headline: y(headline ?? null),
          name: y(name ?? null),
          cta: y(cta ?? null),
        };
      }, TEST_QUEST.stations[0].name);

      expect(order.pin).toBeGreaterThan(-1);
      expect(order.headline).toBeGreaterThan(order.pin);
      expect(order.name).toBeGreaterThan(order.headline);
      expect(order.cta).toBeGreaterThan(order.name);
    });

    test("der Screen sieht an der letzten Station genauso aus", async ({ page, context }) => {
      // Edge Case 15: Ohne die Karte verschwindet der Sonderfall "letzte
      // Station" — vorher war das der einzige Screen ohne Karte.
      await page.goto("/play");
      await page.evaluate((quest) => {
        localStorage.setItem("gq_quests", JSON.stringify([quest]));
        localStorage.setItem(
          `gq_progress_${quest.id}`,
          JSON.stringify({
            questId: quest.id,
            visitedStations: [quest.stations[0].id],
            completedStations: [quest.stations[0].id],
            solvedTasks: {},
            currentScreen: "stations",
          })
        );
      }, TEST_QUEST);

      await context.setGeolocation({ latitude: 53.62, longitude: 10.05 });
      await page.goto(`/play/${TEST_QUEST.id}`);
      await page
        .getByRole("button", { name: /Navigation zu Zweite Station/ })
        .click();

      await expect(page.getByText("Ziel erreicht!")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("Zweite Station")).toBeVisible();
      await expect(page.getByText("Nächstes Ziel")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Station entdecken" })).toBeVisible();
    });
  });

  test.describe("Pin ohne sichtbare Kante", () => {
    test("nutzt das freigestellte PNG, nicht das JPEG", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      const src = await page.locator('img[src*="mark-pin"]').first().getAttribute("src");
      expect(src).toContain(".png");
      expect(src).not.toContain(".jpg");
    });

    test("das PNG hat einen Alpha-Kanal und transparente Ränder", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      // Der eigentliche Beweis: Die Eckpixel des ausgelieferten Bildes sind
      // durchsichtig. Ein JPEG kann das gar nicht — genau daher kam das
      // sichtbare Rechteck.
      const corners = await page.evaluate(async () => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/assets/mark-pin.png";
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const at = (x: number, y: number) => ctx.getImageData(x, y, 1, 1).data[3];
        return {
          tl: at(1, 1),
          tr: at(img.naturalWidth - 2, 1),
          bl: at(1, img.naturalHeight - 2),
          br: at(img.naturalWidth - 2, img.naturalHeight - 2),
          w: img.naturalWidth,
          h: img.naturalHeight,
        };
      });

      expect(corners.w).toBeGreaterThan(0);
      expect(corners.tl).toBe(0);
      expect(corners.tr).toBe(0);
      expect(corners.bl).toBe(0);
      expect(corners.br).toBe(0);
    });

    test("das Pin-Motiv ist erhalten geblieben (keine leere Fläche)", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      // Gegenprobe zum Test darüber: Eine vollständig transparente Datei
      // hätte ebenfalls transparente Ecken. Die Mitte muss opak sein.
      const centre = await page.evaluate(async () => {
        const img = new Image();
        img.src = "/assets/mark-pin.png";
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let opaque = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 250) opaque++;
        return { opaqueShare: opaque / (c.width * c.height) };
      });

      // Gemessen liegt das Motiv bei rund 23% der Fläche.
      expect(centre.opaqueShare).toBeGreaterThan(0.1);
      expect(centre.opaqueShare).toBeLessThan(0.5);
    });

    test("kein abgerundetes Rechteck mehr um den Pin", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      // `rounded-2xl` kaschierte die Kante des JPEG. Mit dem freigestellten
      // PNG gibt es keine Kante zu kaschieren.
      const radius = await page.evaluate(() => {
        const img = document.querySelector('img[src*="mark-pin"]');
        return img ? getComputedStyle(img).borderRadius : null;
      });
      expect(radius).toBe("0px");
    });
  });

  test.describe("Konfetti-Kanone", () => {
    test("schießt von unten mittig, nicht von oben", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      const origin = await page.evaluate(() => {
        const p = document.querySelector(".gq-confetti-particle");
        if (!p) return null;
        const cs = getComputedStyle(p);
        return { left: cs.left, bottom: cs.bottom, top: cs.top };
      });

      expect(origin).not.toBeNull();
      // Mündung unten mittig: `bottom: 0`, nicht `top: -20px` wie beim Rieseln.
      expect(origin!.bottom).toBe("0px");
    });

    test("läuft einmalig — kein infinite", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      const anim = await page.evaluate(() => {
        const ps = Array.from(document.querySelectorAll(".gq-confetti-particle"));
        return ps.map((p) => {
          const cs = getComputedStyle(p);
          return { count: cs.animationIterationCount, name: cs.animationName };
        });
      });

      expect(anim.length).toBeGreaterThan(0);
      for (const a of anim) {
        expect(a.count).toBe("1");
        expect(a.name).toBe("gq-cannon");
      }
    });

    test("die Partikel steigen tatsächlich auf", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      // Gemessen statt behauptet: Position kurz nach der Zündung gegen die
      // Ausgangslage. Ein aufsteigendes Partikel hat eine kleinere y-Position.
      const rose = await page.evaluate(async () => {
        const p = document.querySelector(".gq-confetti-particle") as HTMLElement | null;
        if (!p) return null;
        const start = p.getBoundingClientRect().top;
        await new Promise((r) => setTimeout(r, 450));
        const later = p.getBoundingClientRect().top;
        return { start, later };
      });

      expect(rose).not.toBeNull();
      expect(rose!.later).toBeLessThan(rose!.start);
    });

    test("kommt zur Ruhe, statt endlos weiterzulaufen", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      // Nach dem längsten Schuss (delay max 0.22s + dur max 2.4s) darf sich
      // nichts mehr bewegen — sonst hätte der CTA dauerhaft Konkurrenz.
      const settled = await page.evaluate(async () => {
        await new Promise((r) => setTimeout(r, 3200));
        const ps = Array.from(document.querySelectorAll(".gq-confetti-particle"));
        const first = ps[0] as HTMLElement | undefined;
        if (!first) return null;
        const a = first.getBoundingClientRect().top;
        await new Promise((r) => setTimeout(r, 400));
        const b = first.getBoundingClientRect().top;
        return { moved: Math.abs(b - a), opacity: getComputedStyle(first).opacity };
      });

      expect(settled).not.toBeNull();
      expect(settled!.moved).toBeLessThan(1);
      // `both` hält den Endzustand: ausgeblendet.
      expect(Number(settled!.opacity)).toBeLessThan(0.05);
    });

    test("der Schuss ist sichtbar und faechert nach beiden Seiten", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await arriveAtFirstStation(page, context);
      await page.waitForTimeout(260);

      // Haelt die Faecherform fest: genug Partikel gleichzeitig sichtbar, und
      // zu beiden Seiten der Muendung verteilt statt in einer Saeule.
      // Waagerechter und senkrechter Versatz rechnen bewusst in derselben
      // Einheit (vh) — mit gemischten Einheiten haengt der tatsaechliche
      // Abschusswinkel am Seitenverhaeltnis des Geraets.
      const fan = await page.evaluate(() => {
        const ps = Array.from(document.querySelectorAll(".gq-confetti-particle"));
        const vis = ps.filter((p) => {
          const r = p.getBoundingClientRect();
          return (
            r.top > -20 &&
            r.top < window.innerHeight &&
            r.left > -20 &&
            r.left < window.innerWidth &&
            Number(getComputedStyle(p).opacity) > 0.15
          );
        });
        const centre = window.innerWidth / 2;
        const xs = vis.map((p) => p.getBoundingClientRect().left);
        return {
          visible: vis.length,
          left: xs.filter((x) => x < centre).length,
          right: xs.filter((x) => x >= centre).length,
        };
      });

      expect(fan.visible).toBeGreaterThan(12);
      // Beide Seiten bekommen etwas ab — keine einseitige Saeule.
      expect(fan.left).toBeGreaterThan(2);
      expect(fan.right).toBeGreaterThan(2);
    });

    test("die Partikel fangen keine Klicks ab", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      const pe = await page.evaluate(() => {
        const layer = document.querySelector(".gq-confetti-particle")?.parentElement;
        return layer ? getComputedStyle(layer).pointerEvents : null;
      });
      expect(pe).toBe("none");

      // Der eigentliche Beweis: Der CTA ist trotz Konfetti klickbar.
      await page.getByRole("button", { name: "Station entdecken" }).click();
      await expect(page.getByText("Station 1 Text")).toBeVisible();
    });

    test("die Partikel sind für Screenreader unsichtbar", async ({ page, context }) => {
      await arriveAtFirstStation(page, context);

      const hidden = await page.evaluate(() => {
        const layer = document.querySelector(".gq-confetti-particle")?.parentElement;
        return layer?.getAttribute("aria-hidden");
      });
      expect(hidden).toBe("true");
    });
  });

  test.describe("Layout auf kleinen Bildschirmen", () => {
    test("langer Stationsname bricht um, statt abgeschnitten zu werden", async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await arriveAtFirstStation(page, context);

      const name = page.getByText(TEST_QUEST.stations[0].name);
      await expect(name).toBeVisible();

      const box = await name.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          clientH: el.clientHeight,
          scrollH: el.scrollHeight,
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
          overflow: cs.textOverflow,
          lineHeight: parseFloat(cs.lineHeight),
        };
      });

      // Umbrochen statt abgeschnitten: mehrzeilig und ohne horizontalen Überlauf.
      expect(box.clientH).toBeGreaterThan(box.lineHeight * 1.5);
      expect(box.scrollW).toBeLessThanOrEqual(box.clientW + 1);
      expect(box.scrollH).toBeLessThanOrEqual(box.clientH + 1);
    });

    test("der CTA bleibt auf 320×568 sichtbar", async ({ page, context }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await arriveAtFirstStation(page, context);

      const cta = page.getByRole("button", { name: "Station entdecken" });
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(568);
      // Touch-Target nach PRD.
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });
});

/**
 * `page.emulateMedia()` statt der Context-Option `reducedMotion`.
 *
 * Gemessen (Playwright 1.58.2, channel `chrome`): `test.use({ reducedMotion:
 * "reduce" })` kommt in der Seite nicht an — `matchMedia(...).matches` bleibt
 * false, selbst in einem Top-Level-Block auf about:blank. `emulateMedia` wirkt
 * dagegen zuverlaessig. Die Vorbedingung unten haelt das fest: Ohne sie wuerde
 * der Test auch dann bestehen, wenn "reduce" gar nicht greift — er haette dann
 * nichts geprueft.
 */
test.describe("PROJ-3: Gratulationsscreen — prefers-reduced-motion", () => {
  test("kein Partikel-Schuss, aber der Screen bleibt vollständig", async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await arriveAtFirstStation(page, context);

    const applies = await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    expect(applies).toBe(true);

    const visible = await page.evaluate(() => {
      const ps = Array.from(document.querySelectorAll(".gq-confetti-particle"));
      return ps.filter((p) => getComputedStyle(p).display !== "none").length;
    });
    expect(visible).toBe(0);

    // Inhalt und Bedienbarkeit bleiben unberührt.
    await expect(page.getByText("Ziel erreicht!")).toBeVisible();
    await expect(page.getByText(TEST_QUEST.stations[0].name)).toBeVisible();
    await page.getByRole("button", { name: "Station entdecken" }).click();
    await expect(page.getByText("Station 1 Text")).toBeVisible();
  });

  test("auch die Einblend-Animationen laufen nicht", async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await arriveAtFirstStation(page, context);

    const anims = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".gq-arrival-step")).map(
        (el) => getComputedStyle(el).animationName
      )
    );
    expect(anims.length).toBeGreaterThan(0);
    for (const a of anims) expect(a).toBe("none");
  });
});
