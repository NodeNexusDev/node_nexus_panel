import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/render-with-providers'
import { Login } from './Login'

describe('Login', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Login />)
    expect(document.body).toBeInTheDocument()
  })

  it('shows NodeNexus title', async () => {
    renderWithProviders(<Login />)
    expect(document.body.textContent).toContain('NodeNexus')
  })
})
