import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" />
    )
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ConfirmDialog isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Are you sure?" />
    )
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} title="Confirm" message="Msg" />
    )
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ConfirmDialog isOpen={true} onClose={onClose} onConfirm={vi.fn()} title="Confirm" message="Msg" />
    )
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Confirm" message="Msg" loading={true} />
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders custom labels', () => {
    render(
      <ConfirmDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Title" message="Msg" confirmLabel="Yes" cancelLabel="No" />
    )
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument()
  })
})
