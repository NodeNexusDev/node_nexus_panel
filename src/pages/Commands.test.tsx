import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Commands } from './Commands'

describe('Commands', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Commands />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })

  it('shows execute button', async () => {
    renderWithProviders(<Commands />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument()
    })
  })
})
