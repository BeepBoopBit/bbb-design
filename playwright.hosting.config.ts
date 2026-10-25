import { defineConfig } from '@playwright/test'

const port = Number(process.env.BBB_HOSTING_TEST_PORT ?? 5190)

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/hosting/*.spec.ts', '**/get-started.spec.ts', '**/source-copy.spec.ts', '**/site-presentation.spec.ts'],
  workers: 2,
  projects: [{ name: 'hosting', use: { browserName: 'chromium' } }],
  outputDir: 'test-results/hosting',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node node_modules/wrangler/bin/wrangler.js dev --config wrangler.jsonc --local --ip 127.0.0.1 --port ${port} --inspector-port 0`,
    url: `http://127.0.0.1:${port}`,
    timeout: 60000,
    reuseExistingServer: false,
    env: { WRANGLER_SEND_METRICS: 'false' },
  },
})
