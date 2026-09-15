import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const options = [
  { value: '1', label: 'Node One' },
  { value: '2', label: 'Node Two' },
]

describe('Select', () => {
  it('renders placeholder when nothing is selected', () => {
    render(<Select options={options} value="" onChange={vi.fn()} placeholder="Pick a node" />)
    expect(screen.getByText('Pick a node')).toBeInTheDocument()
  })

  it('selects an option on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select options={options} value="" onChange={onChange} placeholder="Pick a node" />)
    await user.click(screen.getByRole('button', { name: 'Pick a node' }))
    await user.click(screen.getByRole('option', { name: 'Node Two' }))
    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('shows search input and footer hint when searchable', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(
      <Select
        options={options}
        value=""
        onChange={vi.fn()}
        placeholder="Pick a node"
        searchable
        searchValue=""
        onSearchChange={onSearchChange}
        searchPlaceholder="Search nodes"
        footerHint="Showing first 100"
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Pick a node' }))
    const input = screen.getByLabelText('Search nodes')
    await user.type(input, 'two')
    expect(onSearchChange).toHaveBeenCalled()
    expect(screen.getByText('Showing first 100')).toBeInTheDocument()
  })
})
