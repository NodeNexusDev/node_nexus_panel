import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './Pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    page: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
}

export const MiddlePage: Story = {
  args: {
    page: 5,
    totalPages: 10,
    onPageChange: () => {},
  },
}

export const LastPage: Story = {
  args: {
    page: 10,
    totalPages: 10,
    onPageChange: () => {},
  },
}
