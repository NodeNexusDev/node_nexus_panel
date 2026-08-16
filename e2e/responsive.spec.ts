import { test, expect } from '@playwright/test'

test.describe('Responsive', () => {
  test('mobile menu toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForSelector('text=Dashboard')

    // Sidebar should be hidden on mobile
    const sidebar = page.locator('aside')
    await expect(sidebar).not.toBeVisible()

    // Open menu
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await menuButton.click()

    // Sidebar should be visible
    await expect(sidebar).toBeVisible()

    // Close by clicking backdrop
    await page.locator('.fixed.inset-0.bg-black\\/50').click()
    await expect(sidebar).not.toBeVisible()
  })

  test('content adapts to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForSelector('text=Dashboard')

    // Main content should be visible
    await expect(page.locator('main')).toBeVisible()
  })
})
