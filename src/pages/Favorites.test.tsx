import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Favorites } from './Favorites'

describe('Favorites', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Favorites />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })

  it('displays favorite items', async () => {
    renderWithProviders(<Favorites />)
    await waitFor(() => {
      expect(screen.getByText('prod-server-01')).toBeInTheDocument()
    })
  })
})
