// @ts-nocheck
// oxlint-disable
import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from './Button'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip content="This is a tooltip">
      <Button>Hover me</Button>
    </Tooltip>
  ),
}

export const Top: Story = {
  render: () => (
    <Tooltip content="Top tooltip" position="top">
      <Button>Top</Button>
    </Tooltip>
  ),
}

export const Bottom: Story = {
  render: () => (
    <Tooltip content="Bottom tooltip" position="bottom">
      <Button>Bottom</Button>
    </Tooltip>
  ),
}
