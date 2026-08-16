import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardContent } from './Card'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <h2 className="text-lg font-semibold">Card Title</h2>
        </CardHeader>
        <CardContent>
          <p className="text-surface-600">This is the card content.</p>
        </CardContent>
      </>
    ),
  },
}

export const WithoutHeader: Story = {
  args: {
    children: (
      <CardContent>
        <p>Card without header</p>
      </CardContent>
    ),
  },
}
