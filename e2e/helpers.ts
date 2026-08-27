import type { Page } from '@playwright/test'

const PANEL_LOGIN = process.env.VITE_PANEL_LOGIN || 'admin'
const PANEL_PASSWORD = process.env.VITE_PANEL_PASSWORD || 'password'

export async function setupAuth(page: Page, goto = '/') {
  // Mock auth endpoints to bypass MSW flakiness
  await page.route('**/*auth/login*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'mock-access-token', token_type: 'bearer' }),
    })
  })
  await page.route('**/*auth/me*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: '1', email: 'admin@nodenexus.dev', is_active: true, is_superuser: true, created_at: new Date().toISOString() }),
    })
  })
  await page.goto('/login')
  await page.getByRole('textbox', { name: /login/i }).fill(PANEL_LOGIN)
  await page.getByRole('textbox', { name: /password/i }).fill(PANEL_PASSWORD)
  await page.getByRole('button', { name: /submit|sign in|log in/i }).click()
  await page.waitForURL('/', { timeout: 10_000 })
  // Ensure dashboard loaded
  await page.waitForSelector('main h1', { timeout: 10_000 })
  if (goto !== '/') {
    await page.goto(goto)
    await page.waitForURL(goto, { timeout: 10_000 })
    await page.waitForSelector('main h1', { timeout: 10_000 })
  }
}

export async function openSidebar(page: Page) {
  const sidebar = page.locator('aside')
  await sidebar.waitFor({ state: 'attached', timeout: 5_000 })
  const isHidden = await sidebar.evaluate((el) => el.classList.contains('-translate-x-full'))
  if (isHidden) {
    const menuButton = page.locator('header button').first()
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await sidebar.waitFor({ state: 'visible', timeout: 5_000 })
    }
  }
}
