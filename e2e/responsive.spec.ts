import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

const UI_STORAGE_MOBILE = {
  state: { theme: 'light', sidebarOpen: false, activeModal: null },
  version: 0,
}

test.describe('Responsive', () => {
  test('mobile menu toggle', async ({ page }) => {
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
    }, UI_STORAGE_MOBILE)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForFunction(() => {
      const aside = document.querySelector('aside')
      return aside && aside.classList.contains('-translate-x-full')
    }, null, { timeout: 10000 })

    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/-translate-x-full/)

    const menuButton = page.locator('header button').first()
    await menuButton.click()

    await expect(sidebar).toHaveClass(/translate-x-0/)

    // Click the backdrop to the right of the sidebar (which is z-30, behind sidebar z-40)
    await page.locator('.fixed.inset-0.z-30').click({ position: { x: 350, y: 400 } })
    await expect(sidebar).toHaveClass(/-translate-x-full/)
  })

  test('content adapts to mobile', async ({ page }) => {
    await setupAuth(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForSelector('main h1')

    await expect(page.locator('main')).toBeVisible()
  })
})
