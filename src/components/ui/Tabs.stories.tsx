// @ts-nocheck
// oxlint-disable
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tabs } from './Tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('overview')
    return (
      <Tabs
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'metrics', label: 'Metrics' },
          { key: 'notes', label: 'Notes' },
        ]}
        active={active}
        onChange={setActive}
      />
    )
  },
}
