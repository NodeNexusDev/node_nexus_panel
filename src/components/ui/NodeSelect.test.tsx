import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NodeSelect } from './NodeSelect'

const nodes = [
  { id: '1', name: 'Node A' },
  { id: '2', name: 'Node B' },
  { id: '3', name: 'Node C' },
]

describe('NodeSelect', () => {
  it('renders all nodes', () => {
    render(<NodeSelect nodes={nodes} value="" onChange={vi.fn()} />)
    expect(screen.getByText('Node A')).toBeInTheDocument()
    expect(screen.getByText('Node B')).toBeInTheDocument()
    expect(screen.getByText('Node C')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<NodeSelect nodes={nodes} value="" onChange={vi.fn()} label="Select node" id="node-select" />)
    expect(screen.getByText('Select node')).toBeInTheDocument()
    expect(screen.getByLabelText('Select node')).toBeInTheDocument()
  })

  it('renders placeholder when provided', () => {
    render(<NodeSelect nodes={nodes} value="" onChange={vi.fn()} placeholder="Choose..." />)
    expect(screen.getByText('Choose...')).toBeInTheDocument()
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NodeSelect nodes={nodes} value="1" onChange={onChange} />)
    await user.selectOptions(screen.getByRole('combobox'), '2')
    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('does not render placeholder option when not provided', () => {
    render(<NodeSelect nodes={nodes} value="" onChange={vi.fn()} />)
    expect(screen.queryByText('Choose...')).not.toBeInTheDocument()
  })
})
