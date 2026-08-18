import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('Commands', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/')
    await page.waitForSelector('h1')
    await page.click('text=Commands')
    await page.waitForSelector('h1:has-text("Commands")')
  })

  test('displays command selectors and execute button', async ({ page }) => {
    const selects = page.locator('select')
    await expect(selects.first()).toBeVisible()
    await expect(selects.nth(1)).toBeVisible()
    await expect(page.locator('button').filter({ hasText: /Execute/i })).toBeVisible()
  })

  test('shows command history section', async ({ page }) => {
    await expect(page.locator('text=Command History')).toBeVisible()
  })
})
