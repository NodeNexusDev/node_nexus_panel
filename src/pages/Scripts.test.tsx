import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Scripts } from './Scripts'

describe('Scripts', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Scripts />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })

  it('shows create script button', async () => {
    renderWithProviders(<Scripts />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create script/i })).toBeInTheDocument()
    })
  })
})
