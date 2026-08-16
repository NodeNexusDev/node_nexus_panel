import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/render-with-providers'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Dashboard />)
    expect(document.body).toBeInTheDocument()
  })
})
