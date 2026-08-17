import { test, expect } from '@playwright/test'

test.describe('Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => sessionStorage.setItem('authenticated', 'true'))
    await page.goto('/')
    await page.waitForSelector('h1')
    await page.click('text=Commands')
    await page.waitForSelector('h1:has-text("Commands")')
  })

  test('displays command input', async ({ page }) => {
    await expect(page.locator('input[placeholder*="command"], input[placeholder*="Enter"]')).toBeVisible()
    await expect(page.locator('button').filter({ hasText: /Execute/i })).toBeVisible()
  })

  test('shows command history section', async ({ page }) => {
    await expect(page.locator('text=Command History')).toBeVisible()
  })
})
