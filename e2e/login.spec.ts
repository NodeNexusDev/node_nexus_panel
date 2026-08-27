import { test, expect } from '@playwright/test'

const PANEL_LOGIN = process.env.VITE_PANEL_LOGIN || 'admin'
const PANEL_PASSWORD = process.env.VITE_PANEL_PASSWORD || 'password'

test.describe('Login', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: /login/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /submit|sign in|log in/i })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('textbox', { name: /login/i }).fill('wrong')
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword')
    await page.getByRole('button', { name: /submit|sign in|log in/i }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('textbox', { name: /login/i })).toBeVisible()
  })

  test('redirects to dashboard on valid login', async ({ page }) => {
    await page.route('**/*auth/login*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'mock-token', token_type: 'bearer' }) })
    })
    await page.route('**/*auth/me*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '1', email: 'admin@nodenexus.dev', is_active: true, is_superuser: true, created_at: new Date().toISOString() }) })
    })
    await page.goto('/login')
    await page.getByRole('textbox', { name: /login/i }).fill(PANEL_LOGIN)
    await page.getByRole('textbox', { name: /password/i }).fill(PANEL_PASSWORD)
    await page.getByRole('button', { name: /submit|sign in|log in/i }).click()
    await expect(page).toHaveURL('/', { timeout: 10_000 })
  })
})
