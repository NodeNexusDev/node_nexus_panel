import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagBadge } from './TagBadge'

describe('TagBadge', () => {
  it('renders tag text', () => {
    render(<TagBadge tag="production" onClick={vi.fn()} />)
    expect(screen.getByText('production')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<TagBadge tag="dev" onClick={onClick} />)
    await user.click(screen.getByText('dev'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('stops event propagation', async () => {
    const user = userEvent.setup()
    const parentClick = vi.fn()
    render(<div onClick={parentClick}><TagBadge tag="test" onClick={vi.fn()} /></div>)
    await user.click(screen.getByText('test'))
    expect(parentClick).not.toHaveBeenCalled()
  })

  it('has title attribute', () => {
    render(<TagBadge tag="important" onClick={vi.fn()} />)
    expect(screen.getByTitle('important')).toBeInTheDocument()
  })
})
