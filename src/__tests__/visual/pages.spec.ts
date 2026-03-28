import { test, expect } from '@playwright/test'

const pages = [
  { name: 'landing', path: '/' },
  { name: 'generator', path: '/generator' },
  { name: 'choreography', path: '/choreography' },
  { name: 'performance', path: '/performance' },
  { name: 'mcp', path: '/mcp' },
  { name: 'figma', path: '/figma' },
  { name: 'button', path: '/components/button' },
  { name: 'select', path: '/components/select' },
  { name: 'data-table', path: '/components/data-table' },
  { name: 'metric-card', path: '/components/metric-card' },
]

for (const { name, path } of pages) {
  test(`${name} renders correctly`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`${name}.png`, { maxDiffPixels: 100 })
  })
}
