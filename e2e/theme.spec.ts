import { test, expect } from '@playwright/test'

test.describe('Theme', () => {
  test('toggles between dark and light themes', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('text=Dashboard')

    const html = page.locator('html')

    // Initially light theme (no .dark class)
    await expect(html).not.toHaveClass(/dark/)

    // Click theme toggle
    const themeToggle = page.locator('[class*="ThemeToggle"], button:has-text("🌙"), button:has-text("☀️")').first()
    await themeToggle.click()

    // Should have .dark class now
    await expect(html).toHaveClass(/dark/)

    // Toggle back
    await themeToggle.click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('persists theme in localStorage', async ({ page }) => {
    await page.goto('/')

    // Toggle theme
    const themeToggle = page.locator('[class*="ThemeToggle"], button:has-text("🌙"), button:has-text("☀️")').first()
    await themeToggle.click()

    // Reload page
    await page.reload()
    await page.waitForSelector('text=Dashboard')

    // Theme should persist
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })
})
