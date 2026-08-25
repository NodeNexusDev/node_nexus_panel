import type { Page } from '@playwright/test'

export async function setupAuth(page: Page) {
  await page.goto('/login')
  await page.evaluate(() => sessionStorage.setItem('authenticated', 'true'))
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
