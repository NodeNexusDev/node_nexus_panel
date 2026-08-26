import type { Page } from '@playwright/test'

const PANEL_LOGIN = process.env.VITE_PANEL_LOGIN || 'admin'
const PANEL_PASSWORD = process.env.VITE_PANEL_PASSWORD || 'password'

export async function setupAuth(page: Page, goto = '/') {
  await page.goto('/login')
  await page.getByRole('textbox', { name: /login/i }).fill(PANEL_LOGIN)
  await page.getByRole('textbox', { name: /password/i }).fill(PANEL_PASSWORD)
  await page.getByRole('button', { name: /submit|sign in|log in/i }).click()
  await page.waitForURL('/', { timeout: 10_000 })
  if (goto !== '/') {
    await page.evaluate((path) => {
      window.history.pushState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }, goto)
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
