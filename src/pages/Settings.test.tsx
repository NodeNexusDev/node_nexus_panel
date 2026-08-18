import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Settings } from './Settings'

describe('Settings', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Settings />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })

  it('shows API keys section', async () => {
    renderWithProviders(<Settings />)
    await waitFor(() => {
      expect(screen.getByText(/api keys/i)).toBeInTheDocument()
    })
  })
})
