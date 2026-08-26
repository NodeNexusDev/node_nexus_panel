import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { ScriptDetail } from './ScriptDetail'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: '1' }) }
})

describe('ScriptDetail', () => {
  it('renders script details', async () => {
    renderWithProviders(<ScriptDetail />)
    await waitFor(() => {
      expect(screen.getByText('backup-db.sh')).toBeInTheDocument()
    })
  })

  it('shows run button', async () => {
    renderWithProviders(<ScriptDetail />)
    await waitFor(() => {
      expect(screen.getByText('Run')).toBeInTheDocument()
    })
  })
})
