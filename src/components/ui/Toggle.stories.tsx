import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from './Toggle'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

function ToggleDemo() {
  const [checked, setChecked] = useState(false)
  return (
    <Toggle
      label={checked ? 'Enabled' : 'Disabled'}
      checked={checked}
      onChange={setChecked}
    />
  )
}

export const Default: Story = {
  args: {
    label: 'Enable notifications',
    checked: false,
    onChange: () => {},
  },
}

export const Checked: Story = {
  args: {
    label: 'Dark mode',
    checked: true,
    onChange: () => {},
  },
}

export const Interactive: Story = {
  args: {
    label: 'Toggle',
    checked: false,
    onChange: () => {},
  },
  render: () => <ToggleDemo />,
}
