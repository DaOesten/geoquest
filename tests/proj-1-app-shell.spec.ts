import { test, expect, type Page } from '@playwright/test'

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
      await page.goto('/')
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
      await expect(page.locator('img[alt="Geo Quest"]')).toBeVisible()
      await expect(page.getByText('Deine Quests')).toBeVisible()
      await expect(page.getByText('Quest Creator')).toBeVisible()
    })

    test('navigating to Play card goes to /play with dark theme', async ({ page }) => {
      await page.goto('/')
      await page.getByText('Deine Quests').click()
      await expect(page).toHaveURL('/play')
      await expect(page.locator('[data-theme="dark"]')).toBeVisible()
    })

    test('navigating to Create card goes to /create with light theme', async ({ page }) => {
      await page.goto('/')
      await page.getByText('Quest Creator').click()
      await expect(page).toHaveURL('/create')
      await expect(page.locator('[data-theme="light"]')).toBeVisible()
    })
  })

  test.describe('Header & Navigation', () => {
    test('top-level /play shows pin-mark home button that navigates to /', async ({ page }) => {
      await page.goto('/play')
      const homeLink = page.locator('header a[aria-label="Zurück zum Start"]')
      await expect(homeLink).toBeVisible()
      await homeLink.click()
      await expect(page).toHaveURL('/')
    })

    test('top-level /create shows pin-mark home button that navigates to /', async ({ page }) => {
      await page.goto('/create')
      const homeLink = page.locator('header a[aria-label="Zurück zum Start"]')
      await expect(homeLink).toBeVisible()
      await homeLink.click()
      await expect(page).toHaveURL('/')
    })

    test('sub-level /play/[id] shows back arrow that navigates to /play', async ({ page }) => {
      await page.goto('/play')
      await seedTestQuest(page)
      await page.goto('/play/test-quest')
      const backLink = page.locator('header a[aria-label="Zurück"]')
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
      await page.goto('/')
      await page.getByText('Deine Quests').click()
      await expect(page).toHaveURL('/play')
      await page.goBack()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Theme', () => {
    test('/play renders with dark theme', async ({ page }) => {
      await page.goto('/play')
      await expect(page.locator('[data-theme="dark"]')).toBeVisible()
    })

    test('/play/[id] renders with dark theme', async ({ page }) => {
      await page.goto('/play')
      await seedTestQuest(page)
      await page.goto('/play/test-quest')
      await expect(page.locator('[data-theme="dark"]')).toBeVisible()
    })

    test('/create renders with light theme', async ({ page }) => {
      await page.goto('/create')
      await expect(page.locator('[data-theme="light"]')).toBeVisible()
    })

    test('/create/[id] renders with light theme', async ({ page }) => {
      await page.goto('/create')
      await seedTestQuest(page)
      await page.goto('/create/test-quest')
      await expect(page.locator('[data-theme="light"]')).toBeVisible()
    })

    test('no theme flicker when navigating from dark to light', async ({ page }) => {
      await page.goto('/play')
      const darkBefore = await page.locator('[data-theme="dark"]').isVisible()
      expect(darkBefore).toBe(true)
      await page.goto('/create')
      const lightAfter = await page.locator('[data-theme="light"]').isVisible()
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
      await expect(page.getByText('Deine Quests')).toBeVisible()
      await expect(page.getByText('Quest Creator')).toBeVisible()
      const main = page.locator('main')
      const box = await main.boundingBox()
      expect(box!.width).toBeLessThanOrEqual(375)
    })

    test('mode cards are tappable (min 44px height)', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('gq_first_visit_done', 'true'))
      await page.reload()
      const card = page.getByText('Deine Quests').locator('..')
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
      await expect(page.locator('[data-theme="dark"]')).toBeVisible()
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
      await expect(page.locator('[data-theme="light"]')).toBeVisible()
    })

    test('rapid mode switching does not break state', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => localStorage.setItem('gq_first_visit_done', 'true'))
      await page.reload()
      await page.getByText('Deine Quests').click()
      await expect(page).toHaveURL('/play')
      const homeLink = page.locator('header a[aria-label="Zurück zum Start"]')
      await homeLink.click()
      await expect(page).toHaveURL('/')
      await page.getByText('Quest Creator').click()
      await expect(page).toHaveURL('/create')
      await expect(page.locator('[data-theme="light"]')).toBeVisible()
    })
  })
})
