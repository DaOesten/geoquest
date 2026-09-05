import { test, expect, type Page } from '@playwright/test'

/**
 * PROJ-1 Startscreen-Verfeinerung (2026-09-05):
 * Logo verlinkt auf /about, groesserer Card-Abstand, ruhender atmender Glow.
 *
 * Hinweis zu den Selektoren: der Erststart-Dialog enthaelt den Text
 * "Deine Quests und dein Fortschritt werden lokal ..." — ein blosses
 * getByText('Deine Quests') trifft daher zwei Elemente. Hier wird
 * durchgaengig ueber Rollen/Links selektiert statt ueber Text.
 */

/** Startscreen ohne Erststart-Dialog oeffnen — der Dialog ueberdeckt sonst die Cards. */
async function openStartscreen(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('gq_first_visit_done', 'true'))
  await page.reload()
}

const playCard = (page: Page) => page.locator('main a[href="/play"]')
const createCard = (page: Page) => page.locator('main a[href="/create"]')
const logoLink = (page: Page) => page.locator('main a[href="/about"]')

test.describe('PROJ-1: Startscreen-Verfeinerung', () => {

  test.describe('Logo verlinkt auf die Landing Page', () => {
    test('Tap auf das Geo-Quest-Logo navigiert zu /about', async ({ page }) => {
      await openStartscreen(page)
      const logo = logoLink(page)
      await expect(logo).toBeVisible()
      // Das Lockup liegt im Link — der Tap trifft das Bild, nicht nur den Rahmen.
      await expect(logo.locator('img[alt="Geo Quest"]')).toBeVisible()
      await logo.click()
      await expect(page).toHaveURL('/about')
    })

    test('Logo-Link traegt einen Accessible Name, der das Ziel erklaert', async ({ page }) => {
      await openStartscreen(page)
      await expect(logoLink(page)).toHaveAttribute('aria-label', 'Geo Quest — Was ist das?')
    })

    test('Logo-Link ist fokussierbar und zeigt einen sichtbaren Fokus-Ring', async ({ page }) => {
      await openStartscreen(page)
      const logo = logoLink(page)
      await logo.focus()
      await expect(logo).toBeFocused()

      // focus-visible muss eine sichtbare Umrandung erzeugen (ring-* => box-shadow).
      // Geprueft wird der aufgeloeste Ring statt des gemalten box-shadow:
      // WebKit unterdrueckt die Focus-Darstellung, wenn das Browserfenster
      // im Testlauf nicht die OS-Fokussierung hat — der Wert waere dann
      // transparent, obwohl das Styling korrekt ist.
      const ring = await logo.evaluate((el) => {
        const s = getComputedStyle(el)
        return {
          color: s.getPropertyValue('--tw-ring-color').trim(),
          shadow: s.getPropertyValue('--tw-ring-shadow').trim(),
          offsetColor: s.getPropertyValue('--tw-ring-offset-color').trim(),
        }
      })

      // Teal #00E0D1 mit 45% Alpha => #00e0d173
      expect(ring.color.toLowerCase()).toContain('00e0d1')
      expect(ring.shadow).not.toBe('')
      // Der Ring sitzt auf einem Offset in der Seitenfarbe, damit er sich absetzt.
      expect(ring.offsetColor.toLowerCase()).toContain('0b0f12')
    })

    test('Logo-Tapflaeche ueberragt das Bild nicht wesentlich (Edge Case 6)', async ({ page }) => {
      await openStartscreen(page)
      const linkBox = await logoLink(page).boundingBox()
      const imgBox = await logoLink(page).locator('img').boundingBox()
      expect(linkBox).not.toBeNull()
      expect(imgBox).not.toBeNull()
      // Der Link darf das Bild um hoechstens ein paar Pixel ueberragen,
      // damit er der oberen Mode-Card kein Tap-Ziel wegnimmt.
      expect(linkBox!.height - imgBox!.height).toBeLessThanOrEqual(8)

      // Und er darf die obere Card nicht ueberlappen.
      const cardBox = await playCard(page).boundingBox()
      expect(linkBox!.y + linkBox!.height).toBeLessThanOrEqual(cardBox!.y)
    })

    test('/about ist erreichbar — der Link zeigt nicht ins Leere', async ({ page }) => {
      const response = await page.goto('/about')
      expect(response?.status()).toBe(200)
    })
  })

  test.describe('Abstand der Mode-Cards', () => {
    test('zwischen den beiden Cards liegen 20px (gap-5)', async ({ page }) => {
      await openStartscreen(page)
      const playBox = await playCard(page).boundingBox()
      const createBox = await createCard(page).boundingBox()
      const gap = createBox!.y - (playBox!.y + playBox!.height)
      expect(gap).toBeGreaterThanOrEqual(19)
      expect(gap).toBeLessThanOrEqual(21)
    })
  })

  test.describe('Ruhender Glow (ohne Hover sichtbar)', () => {
    test('Play-Card traegt dauerhaft einen Teal-Glow', async ({ page }) => {
      await openStartscreen(page)
      const shadow = await playCard(page).evaluate(
        (el) => getComputedStyle(el).boxShadow
      )
      // Teal #00E0D1 => rgb(0, 224, 209)
      expect(shadow.replace(/\s/g, '')).toContain('0,224,209')
    })

    test('Create-Card traegt dauerhaft einen Lime-Glow', async ({ page }) => {
      await openStartscreen(page)
      const shadow = await createCard(page).evaluate(
        (el) => getComputedStyle(el).boxShadow
      )
      // Lime #C6FF00 => rgb(198, 255, 0)
      expect(shadow.replace(/\s/g, '')).toContain('198,255,0')
    })

    test('beide Cards atmen, und zwar zeitversetzt zueinander', async ({ page }) => {
      await openStartscreen(page)

      const play = await playCard(page).evaluate((el) => {
        const s = getComputedStyle(el)
        return { name: s.animationName, delay: s.animationDelay, duration: s.animationDuration }
      })
      const create = await createCard(page).evaluate((el) => {
        const s = getComputedStyle(el)
        return { name: s.animationName, delay: s.animationDelay, duration: s.animationDuration }
      })

      expect(play.name).toBe('gq-breathe-teal')
      expect(create.name).toBe('gq-breathe-lime')
      expect(play.duration).toBe('4s')
      expect(create.duration).toBe('4s')
      // Versatz: die Lime-Card laeuft im Gegentakt, startet also nicht bei 0.
      expect(play.delay).not.toBe(create.delay)
      expect(create.delay).toBe('-2s')
    })

    test('der Glow veraendert sich ueber die Zeit (die Animation laeuft wirklich)', async ({ page }) => {
      await openStartscreen(page)
      const read = () => playCard(page).evaluate((el) => getComputedStyle(el).boxShadow)

      const first = await read()
      await page.waitForTimeout(1200)
      const second = await read()

      expect(first).not.toBe(second)
    })
  })

  test.describe('Hover/Focus verstaerkt den Glow', () => {
    // Hover gibt es nur auf Zeigegeraeten — auf Mobile Safari uebersprungen.
    test('Tastatur-Fokus hebt die Card auf den starken Glow', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'Mobile Safari', 'Kein Hover/Focus-Ring auf Touch')
      await openStartscreen(page)
      const card = playCard(page)

      const resting = await card.evaluate((el) => getComputedStyle(el).boxShadow)
      await card.focus()
      // Nach dem Fokus laeuft die Transition (180ms) — kurz warten.
      await page.waitForTimeout(300)
      const focused = await card.evaluate((el) => getComputedStyle(el).boxShadow)

      expect(focused).not.toBe(resting)
      // Im Fokus steht die Animation still, damit der starke Glow nicht flackert.
      const anim = await card.evaluate((el) => getComputedStyle(el).animationName)
      expect(anim).toBe('none')
    })
  })

  test.describe('Reduced Motion', () => {
    test('Animation ist aus, der Glow bleibt aber sichtbar', async ({ page }) => {
      // Bewusst page.emulateMedia() statt test.use({ reducedMotion }):
      // die Context-Option greift auf dieser WebKit-Version nicht,
      // matchMedia meldet dann faelschlich false.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await openStartscreen(page)

      // Vorbedingung: die Media Query ist im Browser wirklich aktiv.
      const active = await page.evaluate(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
      expect(active).toBe(true)

      const play = await playCard(page).evaluate((el) => {
        const s = getComputedStyle(el)
        return { anim: s.animationName, shadow: s.boxShadow }
      })
      const create = await createCard(page).evaluate((el) => {
        const s = getComputedStyle(el)
        return { anim: s.animationName, shadow: s.boxShadow }
      })

      expect(play.anim).toBe('none')
      expect(create.anim).toBe('none')
      // Der Glow traegt die Farbcodierung der Modi — er darf nicht mitverschwinden.
      expect(play.shadow.replace(/\s/g, '')).toContain('0,224,209')
      expect(create.shadow.replace(/\s/g, '')).toContain('198,255,0')
    })
  })

  test.describe('Kleines Geraet (360x640)', () => {
    test.use({ viewport: { width: 360, height: 640 } })

    test('Logo, Headline und beide Cards passen ohne Scrollen', async ({ page }) => {
      await openStartscreen(page)

      await expect(logoLink(page)).toBeVisible()
      await expect(playCard(page)).toBeVisible()
      await expect(createCard(page)).toBeVisible()

      // Untere Kante der letzten Card muss im Viewport liegen.
      const createBox = await createCard(page).boundingBox()
      expect(createBox!.y + createBox!.height).toBeLessThanOrEqual(640)

      // Und die Seite darf vertikal nicht scrollen.
      const overflows = await page.evaluate(
        () => document.documentElement.scrollHeight > window.innerHeight + 1
      )
      expect(overflows).toBe(false)
    })
  })
})
