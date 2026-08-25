import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/nodes')
    await page.waitForSelector('main h1:has-text("Nodes")')
  })

  test('displays nodes page with add button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Node/i })).toBeVisible()
  })

  test('opens add node modal', async ({ page }) => {
    await page.getByRole('button', { name: /Add Node/i }).click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('closes modal on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /Add Node/i }).click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    const cancelBtn = page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i })
    await cancelBtn.scrollIntoViewIfNeeded()
    await cancelBtn.click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
})
