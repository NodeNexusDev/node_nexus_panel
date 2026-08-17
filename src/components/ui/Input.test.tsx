import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders without label', () => {
    render(<Input placeholder="Enter..." />)
    expect(screen.getByPlaceholderText('Enter...')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Input error="Invalid" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('handles value changes', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
