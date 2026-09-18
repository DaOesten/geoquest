import { defineConfig, devices } from '@playwright/test'
// Temporäre Config für den PROJ-14-Lauf: echtes Chrome statt des kaputten
// Chromium-Binaries, und gegen den Production-Build statt den Dev-Server.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['line']],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3100', trace: 'off' },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
})
