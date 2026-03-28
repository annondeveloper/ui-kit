import { test, expect } from '@playwright/test'

test.describe('Generator page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generator')
    await page.waitForLoadState('networkidle')
  })

  test('loads generator page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/generator|ui kit/i)
    await expect(page).toHaveScreenshot('generator-loaded.png', { maxDiffPixels: 100 })
  })

  test('clicking Dashboard template shows MetricCards in preview', async ({ page }) => {
    // Click the Dashboard template card
    const dashboardCard = page.locator(
      'text=Dashboard, [data-template="dashboard"], button:has-text("Dashboard")'
    ).first()
    await dashboardCard.click()

    // Wait for preview to update
    await page.waitForTimeout(500)

    // Verify MetricCard components appear in the preview area
    const preview = page.locator(
      '.ui-metric-card, [class*="metric-card"], [class*="MetricCard"]'
    )
    await expect(preview.first()).toBeVisible({ timeout: 5000 })

    await expect(page).toHaveScreenshot('generator-dashboard-preview.png', {
      maxDiffPixels: 100,
    })
  })

  test('React tab shows MetricCard import in code output', async ({ page }) => {
    // Select Dashboard template first
    const dashboardCard = page.locator(
      'text=Dashboard, [data-template="dashboard"], button:has-text("Dashboard")'
    ).first()
    await dashboardCard.click()
    await page.waitForTimeout(500)

    // Click the React tab in code output
    const reactTab = page.locator(
      '[role="tab"]:has-text("React"), button:has-text("React")'
    ).first()
    await reactTab.click()
    await page.waitForTimeout(300)

    // Verify the code output contains the MetricCard import
    const codeOutput = page.locator('pre, code, [class*="code"]')
    await expect(codeOutput.first()).toContainText('import', { timeout: 5000 })

    // Check for MetricCard in the generated code
    const codeText = await codeOutput.first().textContent()
    expect(codeText).toContain('MetricCard')
  })
})
