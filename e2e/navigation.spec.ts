import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('text=Dashboard')
  })

  test('navigates to all pages via sidebar', async ({ page }) => {
    // Dashboard
    await expect(page.locator('h1')).toContainText('Dashboard')

    // Nodes
    await page.click('text=Nodes')
    await expect(page).toHaveURL('/nodes')
    await expect(page.locator('h1')).toContainText('Nodes')

    // Commands
    await page.click('text=Commands')
    await expect(page).toHaveURL('/commands')
    await expect(page.locator('h1')).toContainText('Commands')

    // Scripts
    await page.click('text=Scripts')
    await expect(page).toHaveURL('/scripts')
    await expect(page.locator('h1')).toContainText('Scripts')

    // Settings
    await page.click('text=Settings')
    await expect(page).toHaveURL('/settings')
    await expect(page.locator('h1')).toContainText('Settings')

    // Back to Dashboard
    await page.click('text=Dashboard')
    await expect(page).toHaveURL('/')
  })

  test('shows 404 for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page.locator('text=404')).toBeVisible()
  })

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()

    // Close with Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('input[placeholder*="Search"]')).not.toBeVisible()
  })
})
