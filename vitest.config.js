import {configDefaults, defineConfig} from 'vitest/config'
import {playwright} from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    name: 'Vitest',
    globals: true,
    pool: {threads: true},
    // dir: 'test',
    include: ['./**/*.test.js'],
    reporters: ['tree', 'html'],
    optimizeDeps: {include: ['deepmerge']},
    outputFile: {html: './docs/vitest/index.html'},
    coverage: {
      reportsDirectory: './docs/coverage',
      provider: 'custom',
      customProviderModule: 'vitest-monocart-coverage',
      include: ['src/js/**/*.js'],
      exclude: [...configDefaults.coverage.exclude, '**/*.test.js'],
    },
    browser: {
      enabled: false,
      provider: playwright(),
      viewport: {width: 1800, height: 1200},
      headless: true,
      instances: [{browser: 'chromium'}],
    },
  },
})
