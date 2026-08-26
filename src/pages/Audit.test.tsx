import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Audit } from './Audit'

describe('Audit', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Audit />)
    await waitFor(() => {
      expect(document.body).toBeInTheDocument()
    })
  })

  it('displays audit log entries', async () => {
    renderWithProviders(<Audit />)
    await waitFor(() => {
      const entries = screen.getAllByText('node.create')
      expect(entries.length).toBeGreaterThan(0)
    })
  })

  it('shows export and clear buttons', async () => {
    renderWithProviders(<Audit />)
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument()
      expect(screen.getByText('Clear Logs')).toBeInTheDocument()
    })
  })
})
