import { test, expect } from '@playwright/test'

test.describe('Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('text=Dashboard')
    await page.click('text=Nodes')
    await page.waitForSelector('text=Nodes')
  })

  test('displays nodes table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
  })

  test('opens add node modal', async ({ page }) => {
    await page.click('text=Add Node')
    await expect(page.locator('[role="dialog"], .fixed.inset-0')).toBeVisible()
    await expect(page.locator('text=Node Name').or(page.locator('text=Name'))).toBeVisible()
  })

  test('closes modal on cancel', async ({ page }) => {
    await page.click('text=Add Node')
    await page.click('text=Cancel')
    await expect(page.locator('[role="dialog"], .fixed.inset-0')).not.toBeVisible()
  })
})
