// @ts-nocheck
// oxlint-disable
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Select } from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const options = [
  { value: 'ssh', label: 'SSH' },
]

export const Default: Story = {
  render: () => {
    const [val, setVal] = useState('ssh')
    return <Select label="Connection Type" value={val} onChange={setVal} options={options} />
  },
}

export const WithError: Story = {
  render: () => {
    const [val, setVal] = useState('')
    return <Select label="Connection Type" value={val} onChange={setVal} options={options} error="Required" />
  },
}

export const Disabled: Story = {
  render: () => <Select label="Disabled" value="ssh" onChange={() => {}} options={options} />
}
