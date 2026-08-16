import { test, expect } from '@playwright/test'

const AUTH_STORAGE = {
  state: { token: 'e2e-test-token', user: { id: '1', email: 'admin@example.com', name: 'Admin' }, isAuthenticated: true },
  version: 0,
}

test.describe('Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate((auth) => {
      localStorage.setItem('auth-storage', JSON.stringify(auth))
    }, AUTH_STORAGE)
    await page.goto('/')
    await page.waitForSelector('main h1')
    await page.click('aside >> text=Nodes')
    await page.waitForSelector('main h1:has-text("Nodes")')
  })

  test('displays nodes page with add button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Node/i })).toBeVisible()
  })

  test('opens add node modal', async ({ page }) => {
    await page.click('text=Add Node')
    await expect(page.locator('.spring').first()).toBeVisible()
  })

  test('closes modal on cancel', async ({ page }) => {
    await page.click('text=Add Node')
    await expect(page.locator('.spring').first()).toBeVisible()
    await page.click('text=Cancel')
    await expect(page.locator('.spring').first()).not.toBeVisible()
  })
})
