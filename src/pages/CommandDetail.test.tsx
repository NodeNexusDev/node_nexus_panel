import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { CommandDetail } from './CommandDetail'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: '1' }) }
})

describe('CommandDetail', () => {
  it('renders command details', async () => {
    renderWithProviders(<CommandDetail />)
    await waitFor(() => {
      expect(screen.getByText('Check Disk Space')).toBeInTheDocument()
    })
  })

  it('shows execute button', async () => {
    renderWithProviders(<CommandDetail />)
    await waitFor(() => {
      expect(screen.getByText('Execute')).toBeInTheDocument()
    })
  })
})
