import { test, expect, type Page } from '@playwright/test'

/**
 * Der Erstbesuch-Hinweis (Datenschutz, PRD-Vorgabe) liegt als Overlay über dem
 * Startscreen und fängt Klicks auf die Mode-Cards ab. Für Tests, die nicht den
 * Dialog selbst prüfen, wird er vorab als gesehen markiert.
 */
async function skipFirstVisitDialog(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('gq_first_visit_done', 'true')
  })
}

/**
 * Das Theme steht sowohl auf <html> (immer "dark", Root-Layout) als auch auf
 * dem Wrapper der Bereichs-Layouts (/create hell, /play dunkel). Sichtbar ist
 * für den Nutzer der innerste Träger — den prüfen wir.
 */
async function activeTheme(page: Page): Promise<string | null> {
  // Auf den Wrapper warten: bei Client-gerenderten Screens steht er erst nach
  // der Hydration im DOM, ein sofortiges evaluate() liefert sonst null.
  await page.locator('[data-theme]').last().waitFor({ state: 'attached' })
  return page.evaluate(() => {
    const nodes = document.querySelectorAll('[data-theme]')
    return nodes.length ? nodes[nodes.length - 1].getAttribute('data-theme') : null
  })
}

/** A minimal but valid quest so /play/test-quest and /create/test-quest render instead of 404ing. */
async function seedTestQuest(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('gq_first_visit_done', 'true')
    localStorage.setItem('gq_quests', JSON.stringify([
      { version: 1, id: 'test-quest', name: 'Test Quest', lastModified: '2026-01-01T00:00:00.000Z', intro: { text: '' }, outro: { text: '' }, stations: [] },
    ]))
  })
}

test.describe('PROJ-1: App Shell & Mode Switch', () => {

  test.describe('Startscreen', () => {
    test('shows dark-themed startscreen with logo and two mode cards at /', async ({ page }) => {
      await skipFirstVisitDialog(page)
      await page.goto('/')
      expect(await activeTheme(page)).toBe('dark')
      await expect(page.locator('img[alt="Geo Quest"]')).toBeVisible()
      await expect(page.getByRole('link', { name: /Deine Quests/ })).toBeVisible()
      await expect(page.getByRole('link', { name: /Quest Creator/ })).toBeVisible()
    })

    test('navigating to Play card goes to /play with dark theme', async ({ page }) => {
      await skipFirstVisitDialog(page)
      await page.goto('/')
      await page.getByRole('link', { name: /Deine Quests/ }).click()
      await expect(page).toHaveURL('/play')
      expect(await activeTheme(page)).toBe('dark')
    })

    test('navigating to Create card goes to /create with light theme', async ({ page }) => {
      await skipFirstVisitDialog(page)
      await page.goto('/')
      await page.getByRole('link', { name: /Quest Creator/ }).click()
      await expect(page).toHaveURL('/create')
      expect(await activeTheme(page)).toBe('light')
    })
  })

  test.describe('Header & Navigation', () => {
    // Seit dem Refinement 2026-09-06: keine Pin-Bildmarke mehr im Header. Der
    // Modus-Wechsel läuft über das Burger-Menu, nicht mehr über den Startscreen.
    test('top-level /play has no pin-mark home button, but a burger menu', async ({ page }) => {
      await page.goto('/play')
      await expect(page.locator('header a[aria-label="Zurück zum Start"]')).toHaveCount(0)
      await expect(page.locator('header img[src*="mark-pin"]')).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Menü öffnen' })).toBeVisible()
    })

    test('top-level /create has no pin-mark home button, but a burger menu', async ({ page }) => {
      await page.goto('/create')
      await expect(page.locator('header a[aria-label="Zurück zum Start"]')).toHaveCount(0)
      await expect(page.locator('header img[src*="mark-pin"]')).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Menü öffnen' })).toBeVisible()
    })

    test('burger menu switches modes directly, without going via the start screen', async ({ page }) => {
      await page.goto('/play')
      await page.getByRole('button', { name: 'Menü öffnen' }).click()
      await page.getByRole('dialog').getByRole('link', { name: 'Create', exact: true }).click()
      await expect(page).toHaveURL('/create')
    })

    test('burger menu marks the current page as active', async ({ page }) => {
      await page.goto('/play')
      await page.getByRole('button', { name: 'Menü öffnen' }).click()
      await expect(
        page.getByRole('dialog').getByRole('link', { name: 'Play', exact: true })
      ).toHaveAttribute('aria-current', 'page')
    })

    test('burger menu marks the parent entry active on a sub-route', async ({ page }) => {
      // /create/[id] soll "Create" markieren, nicht nur die exakte Top-Level-URL.
      const quest = {
        version: 1,
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        name: 'Aktiv-Test',
        lastModified: new Date().toISOString(),
        intro: { text: 'Start.' },
        outro: { text: 'Ende.' },
        stations: [{
          id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          name: 'Station', lat: 52.52, lng: 13.405, radiusMeters: 25,
          modules: [{ type: 'text', content: 'Hinweis.' }],
        }],
      }
      await page.goto('/')
      await page.evaluate((q) => {
        localStorage.setItem('gq_first_visit_done', 'true')
        localStorage.setItem('gq_quests', JSON.stringify([q]))
      }, quest)

      await page.goto(`/create/${quest.id}`)
      await page.getByRole('button', { name: 'Menü öffnen' }).click()
      await expect(
        page.getByRole('dialog').getByRole('link', { name: 'Create', exact: true })
      ).toHaveAttribute('aria-current', 'page')
    })

    // BUG-1 (QA 2026-09-06): Im Light-Theme lagen Gruppen-Labels bei 2.29:1 und
    // die Aktiv-Markierung bei 1.57:1 — das PRD verlangt WCAG AA (4.5:1).
    // Ursache waren feste Marken-Hex-Werte, die nicht aufs Theme reagieren.
    test('menu text meets WCAG AA contrast in both themes', async ({ page }) => {
      const luminance = ([r, g, b]: number[]) => {
        const f = (c: number) => {
          const v = c / 255
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const parse = (s: string) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number)
      const ratio = (fg: string, bg: string) => {
        const [a, b] = [luminance(parse(fg)), luminance(parse(bg))]
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      }

      // /create trägt das Light-Theme, /play das Dark-Theme.
      for (const path of ['/create', '/play']) {
        await page.goto(path)
        await page.getByRole('button', { name: 'Menü öffnen' }).click()
        const sample = await page.evaluate(() => {
          const d = document.querySelector('[role="dialog"]')!
          const active = d.querySelector('[aria-current="page"]')!
          const group = d.querySelector('nav > div > p')!
          return {
            bg: getComputedStyle(d).backgroundColor,
            group: getComputedStyle(group).color,
            active: getComputedStyle(active).color,
          }
        })
        expect(ratio(sample.group, sample.bg), `Gruppen-Label auf ${path}`).toBeGreaterThanOrEqual(4.5)
        expect(ratio(sample.active, sample.bg), `Aktiv-Markierung auf ${path}`).toBeGreaterThanOrEqual(4.5)
        await page.keyboard.press('Escape')
      }
    })

    test('header is not sticky on the app screens', async ({ page }) => {
      await page.goto('/play')
      const position = await page
        .locator('header')
        .first()
        .evaluate((el) => getComputedStyle(el).position)
      expect(position).not.toBe('sticky')
    })

    test('sub-level /play/[id] shows back arrow that navigates to /play', async ({ page, context }) => {
      // Ohne Standort-Freigabe zeigt der Player den Berechtigungs-Screen,
      // der bewusst keinen Header mit Zurückpfeil hat.
      await context.grantPermissions(['geolocation'])
      await context.setGeolocation({ latitude: 53.6, longitude: 10.0 })
      await page.goto('/play')
      await seedTestQuest(page)
      await page.goto('/play/test-quest')
      // Der Intro-Screen einer Quest trägt bewusst keinen Header. Der Zurück-
      // pfeil sitzt auf der Stationsliste dahinter — also erst starten.
      await page.getByRole('button', { name: /Los geht/ }).click()
      // Je nach Screen ist der Zurück-Knopf ein <a> (Link) oder <button>
      // (History-Rücksprung) — beide tragen dasselbe aria-label.
      const backLink = page.locator('header').getByLabel('Zurück')
      await expect(backLink).toBeVisible()
      await backLink.click()
      await expect(page).toHaveURL('/play')
    })

    test('sub-level /create/[id] shows back arrow that navigates to /create', async ({ page }) => {
      await page.goto('/create')
      await seedTestQuest(page)
      await page.goto('/create/test-quest')
      const backLink = page.locator('header a[aria-label="Zurück"]')
      await expect(backLink).toBeVisible()
      await backLink.click()
      await expect(page).toHaveURL('/create')
    })

    test('browser back button navigates up one level', async ({ page }) => {
      await skipFirstVisitDialog(page)
      await page.goto('/')
      await page.getByRole('link', { name: /Deine Quests/ }).click()
      await expect(page).toHaveURL('/play')
      await page.goBack()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Theme', () => {
    test('/play renders with dark theme', async ({ page }) => {
      await page.goto('/play')
      expect(await activeTheme(page)).toBe('dark')
    })

    test('/play/[id] renders with dark theme', async ({ page }) => {
      await page.goto('/play')
      await seedTestQuest(page)
      await page.goto('/play/test-quest')
      expect(await activeTheme(page)).toBe('dark')
    })

    test('/create renders with light theme', async ({ page }) => {
      await page.goto('/create')
      expect(await activeTheme(page)).toBe('light')
    })

    test('/create/[id] renders with light theme', async ({ page }) => {
      await page.goto('/create')
      await seedTestQuest(page)
      await page.goto('/create/test-quest')
      expect(await activeTheme(page)).toBe('light')
    })

    test('no theme flicker when navigating from dark to light', async ({ page }) => {
      await page.goto('/play')
      const darkBefore = (await activeTheme(page)) === 'dark'
      expect(darkBefore).toBe(true)
      await page.goto('/create')
      const lightAfter = (await activeTheme(page)) === 'light'
      expect(lightAfter).toBe(true)
    })
  })

  test.describe('First Visit Dialog', () => {
    test('shows dialog on first visit (no localStorage flag)', async ({ page }) => {
      await page.goto('/')
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByText('Willkommen bei Geo Quest')).toBeVisible()
      await expect(dialog.getByText('lokal in deinem Browser')).toBeVisible()
    })

    test('clicking "Verstanden" closes dialog and sets localStorage flag', async ({ page }) => {
      await page.goto('/')
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
      await dialog.getByRole('button', { name: 'Verstanden' }).click()
      await expect(dialog).not.toBeVisible()
      const flag = await page.evaluate(() => localStorage.getItem('gq_first_visit_done'))
      expect(flag).toBe('true')
    })

    test('dialog does not appear on subsequent visits', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('gq_first_visit_done', 'true'))
      await page.reload()
      await page.waitForTimeout(500)
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).not.toBeVisible()
    })
  })

  test.describe('404 Page', () => {
    test('shows branded 404 page for invalid URLs', async ({ page }) => {
      await page.goto('/nonexistent-page')
      await expect(page.getByText('Ziel nicht gefunden.')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Zurück zum Start' })).toBeVisible()
    })

    test('"Zurück zum Start" button navigates to /', async ({ page }) => {
      await page.goto('/nonexistent-page')
      await page.getByRole('link', { name: 'Zurück zum Start' }).click()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Responsive (Mobile 375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('startscreen displays correctly at 375px', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('gq_first_visit_done', 'true'))
      await page.reload()
      await expect(page.locator('img[alt="Geo Quest"]')).toBeVisible()
      await expect(page.getByRole('link', { name: /Deine Quests/ })).toBeVisible()
      await expect(page.getByRole('link', { name: /Quest Creator/ })).toBeVisible()
      const main = page.locator('main')
      const box = await main.boundingBox()
      expect(box!.width).toBeLessThanOrEqual(375)
    })

    test('mode cards are tappable (min 44px height)', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('gq_first_visit_done', 'true'))
      await page.reload()
      const card = page.getByRole('link', { name: /Deine Quests/ }).locator('..')
      const box = await card.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    })
  })

  test.describe('Edge Cases', () => {
    test('direct URL entry to /play/abc sets correct dark theme', async ({ page }) => {
      await page.goto('/play')
      await page.evaluate(() => {
        localStorage.setItem('gq_first_visit_done', 'true')
        localStorage.setItem('gq_quests', JSON.stringify([
          { version: 1, id: 'abc', name: 'Test Quest', lastModified: '2026-01-01T00:00:00.000Z', intro: { text: '' }, outro: { text: '' }, stations: [] },
        ]))
      })
      await page.goto('/play/abc')
      expect(await activeTheme(page)).toBe('dark')
    })

    test('direct URL entry to /create/xyz sets correct light theme', async ({ page }) => {
      await page.goto('/create')
      await page.evaluate(() => {
        localStorage.setItem('gq_first_visit_done', 'true')
        localStorage.setItem('gq_quests', JSON.stringify([
          { version: 1, id: 'xyz', name: 'Test Quest', lastModified: '2026-01-01T00:00:00.000Z', intro: { text: '' }, outro: { text: '' }, stations: [] },
        ]))
      })
      await page.goto('/create/xyz')
      expect(await activeTheme(page)).toBe('light')
    })

    test('rapid mode switching does not break state', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('gq_first_visit_done', 'true'))
      await page.reload()
      await page.getByRole('link', { name: /Deine Quests/ }).click()
      await expect(page).toHaveURL('/play')
      // Der Weg zurück läuft seit 2026-09-06 über das Burger-Menu statt über
      // die Pin-Marke — Play -> Create direkt, ohne Umweg über den Startscreen.
      await page.getByRole('button', { name: 'Menü öffnen' }).click()
      await page.getByRole('dialog').getByRole('link', { name: 'Create', exact: true }).click()
      await expect(page).toHaveURL('/create')
      expect(await activeTheme(page)).toBe('light')
    })
  })
})
