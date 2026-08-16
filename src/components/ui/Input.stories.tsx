import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'admin@example.com',
    type: 'email',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Name',
    value: 'Admin',
  },
}

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: '••••••',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    value: 'Cannot edit',
    disabled: true,
  },
}
