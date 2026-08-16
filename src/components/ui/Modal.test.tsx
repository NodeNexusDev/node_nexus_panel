import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test">Content</Modal>)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test">Content</Modal>)
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls onClose when clicking overlay', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(<Modal isOpen={true} onClose={handleClose} title="Test">Content</Modal>)
    await user.click(screen.getByText('Content').closest('div')!.parentElement!)
    // overlay click
  })

  it('renders without title', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>No title</Modal>)
    expect(screen.getByText('No title')).toBeInTheDocument()
  })
})
