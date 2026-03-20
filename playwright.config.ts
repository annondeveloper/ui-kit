// Install @playwright/test when ready for visual regression testing
// npm install -D @playwright/test
// npx playwright install --with-deps chromium

// @ts-nocheck — @playwright/test not installed yet
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src/__tests__/visual',
  timeout: 30000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-dark',
      use: {
        colorScheme: 'dark',
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'chromium-light',
      use: {
        colorScheme: 'light',
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-dark',
      use: {
        colorScheme: 'dark',
        viewport: { width: 375, height: 812 },
      },
    },
  ],
})
