import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Nodes } from './Nodes'

describe('Nodes', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Nodes />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })

  it('shows add node button', async () => {
    renderWithProviders(<Nodes />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add node/i })).toBeInTheDocument()
    })
  })
})
