import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConnectionTypeSelect } from './ConnectionTypeSelect'

describe('ConnectionTypeSelect', () => {
  it('renders SSH option', () => {
    render(<ConnectionTypeSelect value="ssh" onChange={vi.fn()} />)
    expect(screen.getByText('SSH')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<ConnectionTypeSelect value="ssh" onChange={vi.fn()} label="Connection" id="conn" />)
    expect(screen.getByText('Connection')).toBeInTheDocument()
    expect(screen.getByLabelText('Connection')).toBeInTheDocument()
  })

  it('has correct value', () => {
    render(<ConnectionTypeSelect value="ssh" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('ssh')
  })
})
