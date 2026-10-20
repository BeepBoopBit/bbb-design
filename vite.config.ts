import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { syncTokens } from './src/foundations/sync-tokens.mjs'
import { sourceRegistryPlugin } from './scripts/vite-registry.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'bbb-foundation-data',
    async buildStart() { await syncTokens() },
    configureServer(server) {
      server.watcher.on('change', async path => {
        if (path.endsWith('/src/foundations/tokens.css')) await syncTokens()
      })
    },
  }, sourceRegistryPlugin()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'command-search', test: /node_modules\/(react-aria-components\/dist\/private\/Autocomplete|react-aria\/dist\/private\/autocomplete|react-stately\/dist\/private\/autocomplete)/, priority: 2 },
            { name: 'calendar-internationalization', test: /node_modules\/@internationalized\/date/, priority: 1 },
            {
              name: 'accessible-controls',
              test: /node_modules\/(react-aria|react-stately|@react-aria|@react-stately|@react-types|@internationalized)/,
            },
          ],
        },
      },
    },
  },
})
