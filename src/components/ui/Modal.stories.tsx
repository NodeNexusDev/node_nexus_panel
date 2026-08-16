import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from './Modal'
import { Button } from './Button'

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Interactive Modal">
        <p className="mb-4">This is an interactive modal.</p>
        <Button onClick={() => setIsOpen(false)}>Close</Button>
      </Modal>
    </>
  )
}

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Modal Title',
    children: <p>This is the modal content.</p>,
  },
}

export const Small: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Small Modal',
    size: 'sm',
    children: <p>Small modal content.</p>,
  },
}

export const Large: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Large Modal',
    size: 'lg',
    children: <p>Large modal content with more space.</p>,
  },
}

export const Interactive: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Interactive',
    children: <p>Content</p>,
  },
  render: () => <ModalDemo />,
}
