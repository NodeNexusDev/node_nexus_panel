// @ts-nocheck
// oxlint-disable
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return <Checkbox checked={checked} onChange={setChecked} label="Accept terms" />
  },
}

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true)
    return <Checkbox checked={checked} onChange={setChecked} label="Checked" />
  },
}

export const Disabled: Story = {
  render: () => <Checkbox checked={false} onChange={() => {}} disabled label="Disabled" />,
}

export const Sizes: Story = {
  render: () => {
    const [a, setA] = useState(false)
    const [b, setB] = useState(false)
    return (
      <div className="flex gap-4">
        <Checkbox checked={a} onChange={setA} label="Small" size="sm" />
        <Checkbox checked={b} onChange={setB} label="Medium" size="md" />
      </div>
    )
  },
}
