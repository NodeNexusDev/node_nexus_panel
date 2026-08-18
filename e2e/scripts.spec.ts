import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('Scripts', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/')
    await page.waitForSelector('h1')
    await page.click('text=Scripts')
    await page.waitForSelector('h1:has-text("Scripts")')
  })

  test('displays scripts page with create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Create Script/i })).toBeVisible()
  })

  test('opens create script modal', async ({ page }) => {
    await page.click('text=Create Script')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('closes modal on cancel', async ({ page }) => {
    await page.click('text=Create Script')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.click('[role="dialog"] >> text=Cancel')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
})
