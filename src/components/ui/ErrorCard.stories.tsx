import type { Meta, StoryObj } from '@storybook/react'
import { ErrorCard } from './ErrorCard'

const meta = {
  title: 'UI/ErrorCard',
  component: ErrorCard,
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    message: 'Something went wrong while fetching data.',
  },
}

export const WithTitle: Story = {
  args: {
    title: 'API Error',
    message: 'Failed to fetch nodes from server.',
  },
}

export const WithRetry: Story = {
  args: {
    title: 'Connection Error',
    message: 'Unable to connect to the server.',
    onRetry: () => alert('Retrying...'),
  },
}
