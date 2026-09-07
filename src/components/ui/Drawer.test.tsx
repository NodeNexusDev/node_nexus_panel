import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('renders when open and handles close', () => {
    const onClose = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onClose} title="Test Drawer">
        <div>Content</div>
      </Drawer>
    )
    expect(screen.getByText('Test Drawer')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render when closed', () => {
    const onClose = vi.fn()
    render(
      <Drawer isOpen={false} onClose={onClose} title="Hidden">
        <div>Hidden Content</div>
      </Drawer>
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('handles Escape key', () => {
    const onClose = vi.fn()
    render(
      <Drawer isOpen={true} onClose={onClose} title="Esc Test">
        <div>Content</div>
      </Drawer>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
