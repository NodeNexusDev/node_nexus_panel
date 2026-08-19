import { test, expect } from '@playwright/test'
import { setupAuth, openSidebar } from './helpers'

test.describe('Scripts', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/')
    await page.waitForSelector('main h1')
    await openSidebar(page)
    await page.evaluate(() => document.querySelector('a[href="/scripts"]')?.click())
    await page.waitForSelector('main h1:has-text("Scripts")')
  })

  test('displays scripts page with create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Create Script/i })).toBeVisible()
  })

  test('opens create script modal', async ({ page }) => {
    await page.getByRole('button', { name: /Create Script/i }).click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('closes modal on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /Create Script/i }).click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i }).click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
})
