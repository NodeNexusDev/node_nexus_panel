import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { ToastProvider } from '../components/ui/Toast'
import { createTestQueryClient } from '../test/query-client'
import { renderWithProviders } from '../test/render-with-providers'
import { Login } from './Login'

function Probe() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname}{loc.search}</div>
}

describe('Login', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Login />)
    expect(document.body).toBeInTheDocument()
  })

  it('shows NodeNexus title', async () => {
    renderWithProviders(<Login />)
    expect(document.body.textContent).toContain('NodeNexus')
  })

  it('navigates back to the original path after login', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/nodes?status=active' } }]}>
        <QueryClientProvider client={createTestQueryClient()}>
          <I18nextProvider i18n={i18n}>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/nodes" element={<Probe />} />
              </Routes>
            </ToastProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    )
    await user.type(screen.getByLabelText('Login'), 'admin')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => expect(screen.getByTestId('loc').textContent).toBe('/nodes?status=active'))
  })
})
