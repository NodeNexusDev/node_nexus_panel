import { test, expect } from '@playwright/test'

test.describe('Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('text=Dashboard')
    await page.click('text=Commands')
    await page.waitForSelector('text=Commands')
  })

  test('displays command input', async ({ page }) => {
    await expect(page.locator('input[placeholder*="command"], input[placeholder*="Command"]')).toBeVisible()
    await expect(page.locator('text=Execute').or(page.locator('button:has-text("Execute")'))).toBeVisible()
  })

  test('shows command history section', async ({ page }) => {
    await expect(page.locator('text=Command History').or(page.locator('text=History'))).toBeVisible()
  })
})
