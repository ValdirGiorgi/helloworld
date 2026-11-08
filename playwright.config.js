import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  // Serial: contribute-language.spec.js writes/deletes a file under content/languages/,
  // which Vite's dev server watches — with parallel workers sharing one dev server, that
  // triggers HMR reloads that leak into other concurrently-running tests.
  fullyParallel: false,
  workers: 1,
  webServer: [
    {
      command: 'npm run dev -- --port 4173',
      port: 4173,
      reuseExistingServer: !process.env.CI,
    },
    {
      // The pre-rendered output (dist/), served file-for-file: `vite preview`
      // maps /pt-BR to dist/pt-BR.html (research.md §8).
      command: 'npm run build && npx vite preview --port 4174 --strictPort',
      port: 4174,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: 'dev',
      testIgnore: /prerendered\.spec\.js/,
      use: { baseURL: 'http://localhost:4173' },
    },
    {
      name: 'prerendered',
      testMatch: /prerendered\.spec\.js/,
      use: { baseURL: 'http://localhost:4174' },
    },
  ],
})
