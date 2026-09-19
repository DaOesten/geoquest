import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',

    /**
     * Service Worker in der Testumgebung abschalten (PROJ-12).
     *
     * Seit die App einen Service Worker registriert, kontrolliert er die Seite —
     * und dann greift `page.route` nicht mehr: Anfragen laufen am Mock vorbei ins
     * echte Netz. Gemessen auf WebKit: 0 Treffer im Mock, dafuer eine Antwort von
     * der echten Nominatim-API. Betroffen waren 6 Tests in PROJ-4 und PROJ-7, die
     * externe Dienste mocken.
     *
     * Playwright empfiehlt dafuer ausdruecklich `serviceWorkers: 'block'`. Das
     * betrifft nur die Testumgebung; der Service Worker selbst wird von den
     * eigenen PROJ-12-Tests geprueft, die ihn gezielt brauchen.
     */
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
