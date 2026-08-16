import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /submit|sign in|log in/i })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('textbox', { name: /email/i }).fill('wrong@example.com')
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword')
    await page.getByRole('button', { name: /submit|sign in|log in/i }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  })

  test('redirects to dashboard on valid login', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'e2e-test-token',
            user: { id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin' },
          },
        }),
      }),
    )
    await page.goto('/login')
    await page.getByRole('textbox', { name: /email/i }).fill('admin@example.com')
    await page.getByRole('textbox', { name: /password/i }).fill('password')
    await page.getByRole('button', { name: /submit|sign in|log in/i }).click()
    await expect(page).toHaveURL('/', { timeout: 10_000 })
  })
})
