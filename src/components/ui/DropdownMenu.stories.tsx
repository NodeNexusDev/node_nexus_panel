// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react'
import { DropdownMenu } from './DropdownMenu'

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ariaLabel: 'Actions',
    items: [
      { key: 'edit', label: 'Edit', onClick: () => {} },
      { key: 'delete', label: 'Delete', danger: true, onClick: () => {} },
    ],
  },
}
