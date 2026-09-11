import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  // Serial: contribute-language.spec.js writes/deletes a file under content/languages/,
  // which Vite's dev server watches — with parallel workers sharing one dev server, that
  // triggers HMR reloads that leak into other concurrently-running tests.
  fullyParallel: false,
  workers: 1,
  webServer: {
    command: 'npm run dev -- --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
})
