import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Docker } from './Docker'

describe('Docker', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Docker />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })

  it('shows pull image button', async () => {
    renderWithProviders(<Docker />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pull image/i })).toBeInTheDocument()
    })
  })
})
