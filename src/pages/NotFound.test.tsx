import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { NotFound } from './NotFound'

describe('NotFound', () => {
  it('renders 404', async () => {
    renderWithProviders(<NotFound />)
    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })

  it('renders back to home link', async () => {
    renderWithProviders(<NotFound />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument()
    })
  })
})
