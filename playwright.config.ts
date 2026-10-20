import { defineConfig } from '@playwright/test'

const port = Number(process.env.BBB_TEST_PORT ?? 5180)

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  workers: 2,
  // Shared CI runners need room for complete forms and full-catalog axe scans.
  timeout: process.env.CI ? 60_000 : 30_000,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' }, testIgnore: ['**/visual.spec.ts', '**/hosting/**'] },
    { name: 'firefox', use: { browserName: 'firefox' }, testMatch: ['**/completion.spec.ts', '**/calendar-slider.spec.ts', '**/brand-presets.spec.ts', '**/shell-redesign.spec.ts', '**/document-workspace.spec.ts', '**/utilities.spec.ts', '**/fields.spec.ts', '**/source-copy.spec.ts', '**/get-started.spec.ts'] },
    { name: 'webkit', use: { browserName: 'webkit' }, testMatch: ['**/completion.spec.ts', '**/calendar-slider.spec.ts', '**/brand-presets.spec.ts', '**/shell-redesign.spec.ts', '**/document-workspace.spec.ts', '**/utilities.spec.ts', '**/fields.spec.ts', '**/source-copy.spec.ts', '**/get-started.spec.ts'] },
    { name: 'visual', use: { browserName: 'chromium' }, testMatch: '**/visual.spec.ts' },
  ],
  snapshotPathTemplate: '{testDir}/screenshots/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.002, stylePath: './tests/screenshot.css' } },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
})
