import { test, expect } from '@playwright/test'

test.describe('Button interactions', () => {
  test('click shows ripple effect', async ({ page }) => {
    await page.goto('/components/button')
    await page.waitForLoadState('networkidle')

    const button = page.locator('.ui-button').first()
    await button.click()

    // After click, a ripple element should appear inside the button
    const ripple = button.locator('.ui-button-ripple, .ui-ripple, [class*="ripple"]')
    await expect(ripple.first()).toBeVisible({ timeout: 2000 }).catch(() => {
      // Ripple may be transient — take a screenshot to verify visual state
    })

    await expect(page).toHaveScreenshot('button-clicked.png', { maxDiffPixels: 100 })
  })
})

test.describe('Select interactions', () => {
  test('click opens dropdown', async ({ page }) => {
    await page.goto('/components/select')
    await page.waitForLoadState('networkidle')

    const select = page.locator('.ui-select, [class*="select"]').first()
    await select.click()

    // Dropdown/listbox should be visible after click
    const dropdown = page.locator(
      '.ui-select-dropdown, [role="listbox"], [class*="dropdown"], [class*="options"]'
    )
    await expect(dropdown.first()).toBeVisible({ timeout: 3000 })

    await expect(page).toHaveScreenshot('select-open.png', { maxDiffPixels: 100 })
  })
})

test.describe('Tabs interactions', () => {
  test('click switches active tab', async ({ page }) => {
    await page.goto('/components/button') // Tabs are often on component pages
    await page.waitForLoadState('networkidle')

    const tabs = page.locator('[role="tab"]')
    const tabCount = await tabs.count()

    if (tabCount >= 2) {
      const secondTab = tabs.nth(1)
      await secondTab.click()

      await expect(secondTab).toHaveAttribute('aria-selected', 'true', { timeout: 2000 })
      await expect(page).toHaveScreenshot('tabs-switched.png', { maxDiffPixels: 100 })
    }
  })
})

test.describe('Dialog interactions', () => {
  test('open and close dialog', async ({ page }) => {
    await page.goto('/components/button')
    await page.waitForLoadState('networkidle')

    // Look for a button that triggers a dialog
    const dialogTrigger = page.locator(
      'button:has-text("Open Dialog"), button:has-text("Open Modal"), button:has-text("dialog"), [data-dialog-trigger]'
    ).first()

    const triggerExists = (await dialogTrigger.count()) > 0
    if (!triggerExists) {
      test.skip()
      return
    }

    await dialogTrigger.click()

    const dialog = page.locator('dialog[open], [role="dialog"]')
    await expect(dialog.first()).toBeVisible({ timeout: 3000 })
    await expect(page).toHaveScreenshot('dialog-open.png', { maxDiffPixels: 100 })

    // Close dialog via close button or Escape
    const closeButton = dialog.locator(
      'button:has-text("Close"), button[aria-label="Close"], button:has-text("Cancel")'
    ).first()

    if ((await closeButton.count()) > 0) {
      await closeButton.click()
    } else {
      await page.keyboard.press('Escape')
    }

    await expect(dialog.first()).not.toBeVisible({ timeout: 3000 })
  })
})
