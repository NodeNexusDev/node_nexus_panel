import { test, expect } from '@playwright/test'
import { setupAuth, openSidebar } from './helpers'
import type { Page } from '@playwright/test'

async function waitForPageTitle(page: Page, title: string) {
  await page.waitForFunction(
    (t) => document.querySelector('main h1')?.textContent?.includes(t),
    title,
    { timeout: 10_000 },
  )
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.waitForSelector('main h1')
  })

  test('navigates to all pages via sidebar', async ({ page }) => {
    test.slow()
    await expect(page.locator('main h1')).toBeVisible()

    await openSidebar(page)
    await page.locator('a[href="/nodes"]').click()
    await expect(page).toHaveURL('/nodes')
    await page.waitForSelector('main h1')

    await openSidebar(page)
    await page.locator('a[href="/commands"]').click()
    await expect(page).toHaveURL('/commands')
    await page.waitForSelector('main h1')

    await openSidebar(page)
    await page.locator('a[href="/scripts"]').click()
    await expect(page).toHaveURL('/scripts')
    await page.waitForSelector('main h1')

    await openSidebar(page)
    await page.locator('a[href="/settings"]').click()
    await expect(page).toHaveURL('/settings')
    await page.waitForSelector('main h1')

    await openSidebar(page)
    await page.locator('a[href="/"]').click()
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
