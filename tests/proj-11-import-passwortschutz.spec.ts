import { test, expect, type Page } from "@playwright/test";

const STATION_ID = "44444444-4444-4444-8444-444444444444";

function playableQuest(id: string, name: string, passwordHash?: string) {
  return {
    version: 1,
    id,
    name,
    lastModified: new Date().toISOString(),
    intro: { text: "Willkommen" },
    outro: { text: "Geschafft" },
    ...(passwordHash ? { passwordHash } : {}),
    stations: [
      {
        id: STATION_ID,
        name: "Station 1",
        lat: 53.6,
        lng: 10.0,
        radiusMeters: 10,
        modules: [{ type: "text", content: "Hallo" }],
      },
    ],
  };
}

async function seedQuests(page: Page, quests: unknown[], createdHereIds: string[] = []) {
  await page.goto("/create");
  await page.evaluate(
    ({ quests, createdHereIds }) => {
      localStorage.setItem("gq_first_visit_done", "true");
      localStorage.setItem("gq_quests", JSON.stringify(quests));
      if (createdHereIds.length > 0) {
        localStorage.setItem("gq_created_here", JSON.stringify(createdHereIds));
      }
    },
    { quests, createdHereIds }
  );
  await page.reload();
}

test.describe("PROJ-11: Import — Passwortschutz", () => {
  test.describe("Passwort setzen/ändern/entfernen", () => {
    test("shows an optional password field with explanatory hint text in the edit dialog", async ({ page }) => {
      const id = "11111111-0000-4000-8000-000000000001";
      await seedQuests(page, [playableQuest(id, "Test Quest")], [id]);

      await page.goto(`/create/${id}`);
      await page.getByLabel("Quest bearbeiten").click();
      await expect(page.locator("#quest-password")).toBeVisible();
      await expect(page.getByText(/Schützt diese Quest davor/)).toBeVisible();
    });

    test("saving a password of at least 4 characters stores a hash on the quest", async ({ page }) => {
      const id = "11111111-0000-4000-8000-000000000002";
      await seedQuests(page, [playableQuest(id, "Test Quest")], [id]);

      await page.goto(`/create/${id}`);
      await page.getByLabel("Quest bearbeiten").click();
      await page.fill("#quest-password", "geheim1");
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Quest gespeichert")).toBeVisible();

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].passwordHash).toMatch(/^[0-9a-f]{64}$/);
    });

    test("rejects a password shorter than 4 characters with a validation error, without saving", async ({ page }) => {
      const id = "11111111-0000-4000-8000-000000000003";
      await seedQuests(page, [playableQuest(id, "Test Quest")], [id]);

      await page.goto(`/create/${id}`);
      await page.getByLabel("Quest bearbeiten").click();
      await page.fill("#quest-password", "abc");
      await page.getByRole("button", { name: "Speichern" }).click();

      await expect(page.getByText(/mindestens 4 Zeichen/)).toBeVisible();
      await expect(page.getByText("Quest bearbeiten")).toBeVisible();

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].passwordHash).toBeUndefined();
    });

    test("shows 'Passwort ist gesetzt' instead of plaintext when a password already exists, with a change option", async ({ page }) => {
      const id = "11111111-0000-4000-8000-000000000004";
      await seedQuests(page, [playableQuest(id, "Test Quest", "a".repeat(64))], [id]);

      await page.goto(`/create/${id}`);
      await page.getByLabel("Quest bearbeiten").click();
      await expect(page.getByText("Passwort ist gesetzt")).toBeVisible();
      await expect(page.locator("#quest-password")).not.toBeVisible();
      await expect(page.getByText("Ändern")).toBeVisible();
    });

    test("clearing the password field (after 'Ändern') and saving removes protection entirely", async ({ page }) => {
      const id = "11111111-0000-4000-8000-000000000005";
      await seedQuests(page, [playableQuest(id, "Test Quest", "a".repeat(64))], [id]);

      await page.goto(`/create/${id}`);
      await page.getByLabel("Quest bearbeiten").click();
      await page.getByText("Ändern").click();
      await page.fill("#quest-password", "");
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Quest gespeichert")).toBeVisible();

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].passwordHash).toBeUndefined();
    });
  });

  test.describe("Export/Import", () => {
    test("the exported file contains the password hash, never a plaintext password", async ({ page }) => {
      const id = "22222222-0000-4000-8000-000000000001";
      await seedQuests(page, [playableQuest(id, "Export Test", "b".repeat(64))], [id]);

      await page.goto("/create");
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      const download = await downloadPromise;
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(chunk as Buffer);
      const content = JSON.parse(Buffer.concat(chunks).toString());

      expect(content.passwordHash).toBe("b".repeat(64));
    });

    test("importing a password-protected quest file into a browser that didn't create it locks Creator access", async ({ page }) => {
      const id = "22222222-0000-4000-8000-000000000002";
      const quest = playableQuest(id, "Import Lock Test", "c".repeat(64));

      // No "gq_created_here" seeded — this browser never authored the quest, matching a real import.
      await page.goto("/create");
      await page.setInputFiles("input[type=file]", {
        name: "quest.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(quest)),
      });
      await page.waitForTimeout(300);

      await page.goto(`/create/${id}`);
      await expect(page.getByText("Passwort erforderlich")).toBeVisible();
    });
  });

  test.describe("Zugriff durch den Ersteller selbst", () => {
    test("a quest created via 'Neue Quest' in this browser is never gated, even after a password is set", async ({ page }) => {
      await page.goto("/create");
      await page.getByRole("button", { name: "Neue Quest erstellen" }).click();
      await page.fill("#quest-name", "Eigene Quest");
      await page.fill("#intro-text", "Willkommen");
      await page.fill("#outro-text", "Geschafft");
      await page.getByRole("button", { name: "Erstellen" }).click();
      await page.waitForURL(/\/create\/.+/);

      const questId = page.url().split("/").pop()!;
      // A password can only be attached via editing (see the known creation-flow gap below) —
      // set it directly to isolate this specific "own device never gated" assertion.
      await page.evaluate((id) => {
        const quests = JSON.parse(localStorage.getItem("gq_quests") || "[]");
        const quest = quests.find((q: { id: string }) => q.id === id);
        quest.passwordHash = "d".repeat(64);
        localStorage.setItem("gq_quests", JSON.stringify(quests));
      }, questId);

      await page.reload();
      await expect(page.getByText("Passwort erforderlich")).not.toBeVisible();
      await expect(page.getByLabel("Quest bearbeiten")).toBeVisible();
    });

    test("changing or removing your own quest's password never requires re-entering it first", async ({ page }) => {
      const id = "33333333-0000-4000-8000-000000000001";
      await seedQuests(page, [playableQuest(id, "Own Quest", "e".repeat(64))], [id]);

      await page.goto(`/create/${id}`);
      await expect(page.getByText("Passwort erforderlich")).not.toBeVisible();

      await page.getByLabel("Quest bearbeiten").click();
      await page.getByText("Ändern").click();
      await page.fill("#quest-password", "neuespw1");
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Quest gespeichert")).toBeVisible();
    });
  });

  test.describe("Zugriff durch Dritte (gesperrter Creator-Zugriff)", () => {
    async function seedLockedQuest(page: Page, id: string) {
      // Password is the SHA-256 hex of "richtig1", computed once and hardcoded to avoid
      // depending on the app's own hashing implementation inside the test itself.
      const passwordHash = "30da86175279e4b43580dd7086a44e62eaf50edfc2b4620bb6600621ab020858";
      await seedQuests(page, [playableQuest(id, "Locked Quest", passwordHash)]);
      return passwordHash;
    }

    test("shows a password prompt instead of the station list for a locked quest", async ({ page }) => {
      const id = "44444444-0000-4000-8000-000000000001";
      await seedLockedQuest(page, id);

      await page.goto(`/create/${id}`);
      await expect(page.getByText("Passwort erforderlich")).toBeVisible();
      await expect(page.getByText("STATIONEN")).not.toBeVisible();
    });

    test("shows an error and stays usable after a wrong password, with unlimited attempts", async ({ page }) => {
      const id = "44444444-0000-4000-8000-000000000002";
      await seedLockedQuest(page, id);

      await page.goto(`/create/${id}`);
      for (let i = 0; i < 3; i++) {
        await page.fill('input[type="password"]', `falsch${i}`);
        await page.getByRole("button", { name: "Entsperren" }).click();
        await expect(page.getByText("Falsches Passwort.")).toBeVisible();
      }
      await expect(page.locator('input[type="password"]')).toBeEditable();
    });

    test("the correct password unlocks Creator access immediately and it persists across reload", async ({ page }) => {
      const id = "44444444-0000-4000-8000-000000000003";
      await seedLockedQuest(page, id);

      await page.goto(`/create/${id}`);
      await page.fill('input[type="password"]', "richtig1");
      await page.getByRole("button", { name: "Entsperren" }).click();
      await expect(page.getByText("Passwort erforderlich")).not.toBeVisible();
      await expect(page.getByLabel("Quest bearbeiten")).toBeVisible();

      await page.reload();
      await expect(page.getByText("Passwort erforderlich")).not.toBeVisible();
    });

    test("a direct deep link to the module editor of a locked quest is also gated", async ({ page }) => {
      const id = "44444444-0000-4000-8000-000000000004";
      await seedLockedQuest(page, id);

      await page.goto(`/create/${id}/station/${STATION_ID}`);
      await expect(page.getByText("Passwort erforderlich")).toBeVisible();
      await expect(page.getByText("Hallo")).not.toBeVisible();
    });
  });

  test.describe("Play-Modus bleibt unberührt", () => {
    test("a locked quest can still be played normally via /play without any password", async ({ page }) => {
      const id = "55555555-0000-4000-8000-000000000001";
      const passwordHash = "30da86175279e4b43580dd7086a44e62eaf50edfc2b4620bb6600621ab020858";
      await seedQuests(page, [playableQuest(id, "Play Test", passwordHash)]);

      await page.goto(`/play/${id}`);
      await expect(page.getByText("Passwort erforderlich")).not.toBeVisible();
    });
  });

  test.describe("Importierte Quest ohne Passwort", () => {
    test("a quest with no password stays fully accessible in the Creator, as before", async ({ page }) => {
      const id = "66666666-0000-4000-8000-000000000001";
      await seedQuests(page, [playableQuest(id, "No Password Quest")]);

      await page.goto(`/create/${id}`);
      await expect(page.getByText("Passwort erforderlich")).not.toBeVisible();
      await expect(page.getByLabel("Quest bearbeiten")).toBeVisible();
    });
  });

  test.describe("Bekannte Bugs (siehe QA Test Results)", () => {
    test("BUG-1: a password typed while creating a NEW quest is silently discarded, not saved", async ({ page }) => {
      await page.goto("/create");
      await page.getByRole("button", { name: "Neue Quest erstellen" }).click();
      await page.fill("#quest-name", "Bug Repro Quest");
      await page.fill("#intro-text", "Willkommen");
      await page.fill("#outro-text", "Geschafft");
      // The password field IS present during creation (misleadingly, since it does nothing here).
      await expect(page.locator("#quest-password")).toBeVisible();
      await page.fill("#quest-password", "wirdverworfen");
      await page.getByRole("button", { name: "Erstellen" }).click();
      await page.waitForURL(/\/create\/.+/);

      const questId = page.url().split("/").pop()!;
      const stored = await page.evaluate((id) => {
        const quests = JSON.parse(localStorage.getItem("gq_quests") || "[]");
        return quests.find((q: { id: string }) => q.id === id);
      }, questId);

      // Documents current (buggy) behavior: expected to fail once fixed — see BUG-1 in QA Test Results.
      expect(stored.passwordHash).toBeUndefined();
    });

    test("BUG-2: a locked module editor still shows the station's name in the header", async ({ page }) => {
      const id = "77777777-0000-4000-8000-000000000001";
      const passwordHash = "30da86175279e4b43580dd7086a44e62eaf50edfc2b4620bb6600621ab020858";
      await seedQuests(page, [
        {
          version: 1,
          id,
          name: "Bug 2 Quest",
          lastModified: new Date().toISOString(),
          intro: { text: "Willkommen" },
          outro: { text: "Geschafft" },
          passwordHash,
          stations: [
            {
              id: STATION_ID,
              name: "GEHEIMNISVOLLER STATIONSNAME",
              lat: 53.6,
              lng: 10.0,
              radiusMeters: 10,
              modules: [{ type: "text", content: "Hallo" }],
            },
          ],
        },
      ]);

      await page.goto(`/create/${id}/station/${STATION_ID}`);
      await expect(page.getByText("Passwort erforderlich")).toBeVisible();
      // Documents current (buggy) behavior: expected to fail once fixed — see BUG-2 in QA Test Results.
      await expect(page.getByText("GEHEIMNISVOLLER STATIONSNAME")).toBeVisible();
    });
  });
});
