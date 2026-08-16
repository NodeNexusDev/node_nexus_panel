import { test, expect } from '@playwright/test'

const AUTH_STORAGE = {
  state: { token: 'e2e-test-token', user: { id: '1', email: 'admin@example.com', name: 'Admin' }, isAuthenticated: true },
  version: 0,
}

async function setupAuth(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.evaluate((auth) => {
    localStorage.setItem('auth-storage', JSON.stringify(auth))
  }, AUTH_STORAGE)
}

async function openSidebar(page: import('@playwright/test').Page) {
  const sidebar = page.locator('aside')
  // On desktop (lg+), sidebar is always visible via lg:translate-x-0
  // On mobile, we need to click the hamburger button
  const isHidden = await sidebar.evaluate((el) => el.classList.contains('-translate-x-full'))
  if (isHidden) {
    const menuButton = page.locator('header button').first()
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await expect(sidebar).toHaveClass(/translate-x-0/)
    }
  }
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/')
    await page.waitForSelector('main h1')
  })

  test('navigates to all pages via sidebar', async ({ page }) => {
    await expect(page.locator('main h1')).toContainText('Dashboard')

    // On mobile, sidebar closes after each click; on desktop it stays open
    await openSidebar(page)
    await page.locator('aside >> text=Nodes').click({ force: true })
    await expect(page).toHaveURL('/nodes')
    await expect(page.locator('main h1')).toContainText('Nodes')

    await openSidebar(page)
    await page.locator('aside >> text=Commands').click({ force: true })
    await expect(page).toHaveURL('/commands')
    await expect(page.locator('main h1')).toContainText('Commands')

    await openSidebar(page)
    await page.locator('aside >> text=Scripts').click({ force: true })
    await expect(page).toHaveURL('/scripts')
    await expect(page.locator('main h1')).toContainText('Scripts')

    await openSidebar(page)
    await page.locator('aside >> text=Settings').click({ force: true })
    await expect(page).toHaveURL('/settings')
    await expect(page.locator('main h1')).toContainText('Settings')

    await openSidebar(page)
    await page.locator('aside >> text=Dashboard').click({ force: true })
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
