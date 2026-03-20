import type { Meta, StoryObj } from '@storybook/react'
import { ToastProvider, useToast } from './toast'
import { Button } from '../components/button'

const meta: Meta<typeof ToastProvider> = {
  title: 'Domain/Toast',
  component: ToastProvider,
  argTypes: {
    position: { control: 'select', options: ['top-right', 'top-center', 'bottom-right', 'bottom-center'] },
  },
}
export default meta
type Story = StoryObj<typeof ToastProvider>

function ToastDemo() {
  const { toast } = useToast()
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Button onClick={() => toast({ title: 'Default toast', description: 'Something happened' })}>Default</Button>
      <Button onClick={() => toast({ title: 'Deployed', variant: 'success' })} variant="secondary">Success</Button>
      <Button onClick={() => toast({ title: 'Warning', variant: 'warning', description: 'Disk almost full' })} variant="secondary">Warning</Button>
      <Button onClick={() => toast({ title: 'Error', variant: 'error', description: 'Deploy failed' })} variant="danger">Error</Button>
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <ToastDemo />
    </ToastProvider>
  ),
}
