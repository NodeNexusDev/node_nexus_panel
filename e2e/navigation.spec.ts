import { test, expect } from '@playwright/test'
import { setupAuth, openSidebar } from './helpers'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/')
    await page.waitForSelector('main h1')
  })

  test('navigates to all pages via sidebar', async ({ page }) => {
    await expect(page.locator('main h1')).toContainText('Dashboard')

    await openSidebar(page)
    await page.evaluate(() => document.querySelector('a[href="/nodes"]')?.click())
    await expect(page).toHaveURL('/nodes')
    await expect(page.locator('main h1')).toContainText('Nodes')

    await openSidebar(page)
    await page.evaluate(() => document.querySelector('a[href="/commands"]')?.click())
    await expect(page).toHaveURL('/commands')
    await expect(page.locator('main h1')).toContainText('Commands')

    await openSidebar(page)
    await page.evaluate(() => document.querySelector('a[href="/scripts"]')?.click())
    await expect(page).toHaveURL('/scripts')
    await expect(page.locator('main h1')).toContainText('Scripts')

    await openSidebar(page)
    await page.evaluate(() => document.querySelector('a[href="/settings"]')?.click())
    await expect(page).toHaveURL('/settings')
    await expect(page.locator('main h1')).toContainText('Settings')

    await openSidebar(page)
    await page.evaluate(() => document.querySelector('a[href="/"]')?.click())
    await expect(page).toHaveURL('/')
  })

  test('shows 404 for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page.locator('text=404')).toBeVisible()
  })

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toBeFocused()

    await searchInput.press('Escape')
    await expect(searchInput).not.toBeVisible()
  })
})
