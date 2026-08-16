import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Badge variant="success">OK</Badge>)
    expect(screen.getByText('OK')).toHaveClass('text-green-400')

    rerender(<Badge variant="danger">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('text-red-400')

    rerender(<Badge variant="info">Info</Badge>)
    expect(screen.getByText('Info')).toHaveClass('text-blue-400')
  })
})
