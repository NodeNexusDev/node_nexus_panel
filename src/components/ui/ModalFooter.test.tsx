import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModalFooter } from './ModalFooter'
import { TestProviders } from '../../test/TestProviders'

function renderWithProviders(ui: React.ReactNode) {
  return render(<TestProviders>{ui}</TestProviders>)
}

describe('ModalFooter', () => {
  it('renders cancel button', () => {
    renderWithProviders(<ModalFooter onCancel={vi.fn()}>Submit</ModalFooter>)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders children', () => {
    renderWithProviders(<ModalFooter onCancel={vi.fn()}><button>Save</button></ModalFooter>)
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderWithProviders(<ModalFooter onCancel={onCancel}>Submit</ModalFooter>)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
