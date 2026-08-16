import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton, StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton } from './Skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: {
    variant: 'text',
    className: 'w-48',
  },
}

export const Circular: Story = {
  args: {
    variant: 'circular',
    className: 'w-12 h-12',
  },
}

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    className: 'w-64 h-32',
  },
}

export const StatCard: Story = {
  render: () => <StatCardSkeleton />,
}

export const Table: Story = {
  render: () => <TableSkeleton rows={5} cols={4} />,
}

export const CardList: Story = {
  render: () => <CardListSkeleton count={4} />,
}

export const Form: Story = {
  render: () => <FormSkeleton fields={4} />,
}
