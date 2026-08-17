import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search items..." />)
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(<SearchInput value="hello" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('hello')
  })

  it('shows clear button when value is not empty', () => {
    render(<SearchInput value="test" onChange={vi.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('hides clear button when value is empty', () => {
    render(<SearchInput value="" onChange={vi.fn()} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onChange when clear button clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchInput value="test" onChange={onChange} />)
    await user.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
