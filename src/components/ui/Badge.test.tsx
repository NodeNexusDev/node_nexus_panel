import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies success variant styles', () => {
    render(<Badge variant="success">OK</Badge>)
    const badge = screen.getByText('OK')
    expect(badge).toHaveClass('text-green-700')
    expect(badge).toHaveClass('dark:text-green-400')
  })

  it('applies danger variant styles', () => {
    render(<Badge variant="danger">Error</Badge>)
    const badge = screen.getByText('Error')
    expect(badge).toHaveClass('text-red-700')
    expect(badge).toHaveClass('dark:text-red-400')
  })

  it('applies info variant styles', () => {
    render(<Badge variant="info">Info</Badge>)
    const badge = screen.getByText('Info')
    expect(badge).toHaveClass('text-blue-700')
    expect(badge).toHaveClass('dark:text-blue-400')
  })
})
