import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConnectionTypeSelect } from './ConnectionTypeSelect'

describe('ConnectionTypeSelect', () => {
  it('renders all connection types', () => {
    render(<ConnectionTypeSelect value="ssh" onChange={vi.fn()} />)
    expect(screen.getByText('SSH')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByText('Proxmox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<ConnectionTypeSelect value="ssh" onChange={vi.fn()} label="Connection" id="conn" />)
    expect(screen.getByText('Connection')).toBeInTheDocument()
    expect(screen.getByLabelText('Connection')).toBeInTheDocument()
  })

  it('calls onChange when selection changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ConnectionTypeSelect value="ssh" onChange={onChange} />)
    await user.selectOptions(screen.getByRole('combobox'), 'docker')
    expect(onChange).toHaveBeenCalledWith('docker')
  })

  it('has correct value', () => {
    render(<ConnectionTypeSelect value="proxmox" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('proxmox')
  })
})
