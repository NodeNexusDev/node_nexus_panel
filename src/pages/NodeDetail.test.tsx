import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { NodeDetail } from './NodeDetail'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: '1' }) }
})

describe('NodeDetail', () => {
  it('renders node details', async () => {
    renderWithProviders(<NodeDetail />)
    await waitFor(() => {
      expect(screen.getByText('prod-server-01')).toBeInTheDocument()
    })
  })

  it('shows node host', async () => {
    renderWithProviders(<NodeDetail />)
    await waitFor(() => {
      const matches = screen.getAllByText(/192\.168\.1\.100/)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})
