import type { Meta, StoryObj } from '@storybook/react'
import { ToastProvider } from './Toast'
import { useToast } from './useToast'
import { Button } from './Button'

function ToastDemo() {
  const { toast } = useToast()
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast('success', 'Success!')}>Success</Button>
      <Button onClick={() => toast('error', 'Error!')} variant="danger">Error</Button>
      <Button onClick={() => toast('info', 'Info!')} variant="secondary">Info</Button>
      <Button onClick={() => toast('warning', 'Warning!')} variant="ghost">Warning</Button>
    </div>
  )
}

const meta = {
  title: 'UI/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <ToastDemo />,
  },
}
