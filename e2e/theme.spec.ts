import { test, expect } from '@playwright/test'

const UI_STORAGE_LIGHT = {
  state: { theme: 'light', sidebarOpen: false, activeModal: null },
  version: 0,
}

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth/me so AuthGuard passes without real backend
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: '1', email: 'admin@nodenexus.dev', role: 'admin' }),
      })
    })
    await page.goto('/login')
    await page.evaluate((ui) => {
      localStorage.setItem('ui-storage', JSON.stringify(ui))
    }, UI_STORAGE_LIGHT)
  })

  test('toggles between dark and light themes', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => document.documentElement.classList.contains('light'), null, { timeout: 10000 })

    const html = page.locator('html')
    await expect(page.locator('button[aria-label*="Theme"]').first()).toBeVisible()

    // light → system
    await page.locator('button[aria-label*="Theme"]').first().click()
    await page.waitForTimeout(300)
    // system → dark
    await page.locator('button[aria-label*="Theme"]').first().click()
    await expect(html).toHaveClass(/dark/)

    // dark → light
    await page.locator('button[aria-label*="Theme"]').first().click()
    await expect(html).toHaveClass(/light/)
  })

  test('persists theme in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => document.documentElement.classList.contains('light'), null, { timeout: 10000 })

    await expect(page.locator('button[aria-label*="Theme"]').first()).toBeVisible()

    // light → system → dark
    await page.locator('button[aria-label*="Theme"]').first().click()
    await page.waitForTimeout(300)
    await page.locator('button[aria-label*="Theme"]').first().click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'), null, { timeout: 10000 })
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
