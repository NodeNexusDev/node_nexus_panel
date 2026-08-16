import type { Meta, StoryObj } from '@storybook/react'
import { SearchInput } from './SearchInput'

const meta = {
  title: 'UI/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'search query',
    onChange: () => {},
  },
}
