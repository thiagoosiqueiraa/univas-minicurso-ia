import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: { browserName: 'chromium', locale: 'pt-BR', viewport: { width: 1280, height: 900 } },
})
