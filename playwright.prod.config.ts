import { defineConfig, devices } from '@playwright/test'
// Temporäre Config für den PROJ-14-Lauf: echtes Chrome statt des kaputten
// Chromium-Binaries, und gegen den Production-Build statt den Dev-Server.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['line']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3100',
    trace: 'off',

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
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
})
