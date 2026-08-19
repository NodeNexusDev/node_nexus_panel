import { test, expect } from '@playwright/test'

const UI_STORAGE_LIGHT = {
  state: { theme: 'light', sidebarOpen: false, activeModal: null },
  version: 0,
}

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate((ui) => {
      sessionStorage.setItem('authenticated', 'true')
      localStorage.setItem('ui-storage', JSON.stringify(ui))
    }, UI_STORAGE_LIGHT)
  })

  test('toggles between dark and light themes', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => document.documentElement.classList.contains('light'), null, { timeout: 10000 })

    const html = page.locator('html')
    const themeToggle = page.locator('button[aria-label*="Theme"]').first()
    await expect(themeToggle).toBeVisible()

    // light → system
    await themeToggle.click()
    // system → dark
    await themeToggle.click()
    await expect(html).toHaveClass(/dark/)

    // dark → light
    await themeToggle.click()
    await expect(html).toHaveClass(/light/)
  })

  test('persists theme in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => document.documentElement.classList.contains('light'), null, { timeout: 10000 })

    const themeToggle = page.locator('button[aria-label*="Theme"]').first()
    await expect(themeToggle).toBeVisible()

    // light → system → dark
    await themeToggle.click()
    await themeToggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'), null, { timeout: 10000 })
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
