import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('renders with label', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Enable feature" />)
    expect(screen.getByText('Enable feature')).toBeInTheDocument()
  })

  it('shows checked state', () => {
    render(<Toggle checked={true} onChange={() => {}} label="Feature" />)
    const button = screen.getByRole('switch')
    expect(button).toHaveAttribute('aria-checked', 'true')
  })

  it('shows unchecked state', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Feature" />)
    const button = screen.getByRole('switch')
    expect(button).toHaveAttribute('aria-checked', 'false')
  })

  it('renders with description', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Feature" description="A description" />)
    expect(screen.getByText('A description')).toBeInTheDocument()
  })
})
